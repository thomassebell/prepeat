// Submit an App Store version for review. THE step that reaches real users.
//
// Usage (config comes from scripts/eas-env.sh):
//   node scripts/asc-submit-for-review.mjs                       # pre-flight only, changes NOTHING
//   node scripts/asc-submit-for-review.mjs --submit --version 1.1.0
//   ...add --no-demo-check only if the demo plan was verified another way
//
// ⚠️ DEFAULT IS A DRY RUN, AND DELIBERATELY SO. Submitting is not reversible in
// the ordinary sense: it enters a review queue that has run to 13 days on this
// app, and pulling it out means cancelling and requeueing. The default prints
// what WOULD be submitted and exits.
//
// ⚠️ SUBMITTING IS THOMAS'S DECISION, EVERY TIME. This script exists so the
// mechanics are not his problem, not so the choice stops being his.
//
// ⚠️ THE PRE-FLIGHT BLOCKS ON THE REVIEWER'S DEMO PLAN, not just on the version
// record. That check is here rather than in a checklist because the checklist
// already existed and was still missed before 1.1.0 - the demo plan had been
// empty for a fortnight and was found by chance the day after submitting.
//
// HOW APPLE'S CURRENT FLOW WORKS, because it is three calls and not one:
//   1. create a reviewSubmission for the app (a basket)
//   2. add the appStoreVersion to it as a reviewSubmissionItem
//   3. PATCH submitted: true  <- only this one actually sends it
// A basket created and never sent is a real state that blocks later attempts
// with "already has a submission in progress", so this script reuses an
// existing unsent basket rather than creating a second one.
import { execFileSync } from 'node:child_process';
import { createSign } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';

const KEY_PATH = process.env.EXPO_ASC_API_KEY_PATH;
const KEY_ID = process.env.EXPO_ASC_KEY_ID;
const ISSUER = process.env.EXPO_ASC_ISSUER_ID;
const APP_ID = '6793690543';

// A basket in one of these states is still open: reuse it, never make another.
const OPEN_SUBMISSION_STATES = ['READY_FOR_REVIEW', 'WAITING_FOR_REVIEW', 'IN_REVIEW', 'UNRESOLVED_ISSUES'];

// ⚠️ `submitted` IS WRITE-ONLY. It is the attribute you PATCH to send a
// submission, and asking for it in fields[reviewSubmissions] is a 400:
// "'submitted' is not a valid field name". Whether a basket has been sent is
// read from its STATE instead - READY_FOR_REVIEW means created but NOT sent.
const READABLE_SUBMISSION_FIELDS = 'state,platform,submittedDate';
const isSent = (submission) => submission.attributes.state !== 'READY_FOR_REVIEW';

if (!KEY_PATH || !KEY_ID || !ISSUER) {
  console.error('ERROR: missing App Store Connect config. Source scripts/eas-env.sh first.');
  process.exit(1);
}

const arg = (name) => {
  const i = process.argv.indexOf(name);
  return i === -1 ? null : String(process.argv[i + 1] ?? '').trim();
};
const doSubmit = process.argv.includes('--submit');
const wantVersion = arg('--version');
// Deliberate escape hatch. Named so that using it is a choice someone has to
// type, not a default that quietly disables the check.
const skipDemoCheck = process.argv.includes('--no-demo-check');

// The reviewer's demo account, and how far ahead its plan must be seeded.
const DEMO_EMAIL = 'appreview@sebell.dk';
const DEMO_WEEKS_REQUIRED = 4;
const PSQL_CANDIDATES = ['/opt/homebrew/opt/libpq/bin/psql', 'psql'];

/** The production connection string, without printing it anywhere. */
function productionDbUrl() {
  if (process.env.SUPABASE_DB_URL) return process.env.SUPABASE_DB_URL;
  const file = `${homedir()}/.prepeat-backup.env`;
  if (!existsSync(file)) return null;
  const match = readFileSync(file, 'utf8').match(/^SUPABASE_DB_URL=(.*)$/m);
  return match ? match[1].trim().replace(/^["']|["']$/g, '') : null;
}

/**
 * How many of the next DEMO_WEEKS_REQUIRED weeks have meals on the reviewer's
 * plan.
 *
 * ⚠️ WHY THIS BLOCKS A SUBMISSION. The demo plan is keyed by week and decays on
 * a timer, showing nothing wrong until a reviewer opens an empty app - "the app
 * looking broken at exactly the moment it is being judged". It was a written
 * standing task and it was still missed before 1.1.0, found only by chance the
 * next day. A check that runs is worth more than an instruction that is read.
 *
 * ⚠️ AND IT CHECKS WEEKS AHEAD, NOT JUST THIS ONE. The reviewer opens the app
 * when the QUEUE reaches them, not when you submit - v1.0 waited thirteen days.
 * Seeding only the current week leaves them on an empty plan a fortnight later.
 */
function demoWeeksSeeded() {
  const url = productionDbUrl();
  if (!url) return { ok: false, reason: 'no production database URL (is ~/.prepeat-backup.env there?)' };
  const sql = `
    with weeks as (
      select (date_trunc('week', now())::date + (n * 7)) as week_start
      from generate_series(0, ${DEMO_WEEKS_REQUIRED - 1}) as n
    ), h as (
      select hm.household_id from public.household_members hm
      join auth.users u on u.id = hm.user_id where u.email = '${DEMO_EMAIL}'
    )
    select count(*) from weeks w where exists (
      select 1 from public.meal_plans mp
      join public.meal_plan_entries e on e.meal_plan_id = mp.id and e.deleted_at is null
      where mp.household_id in (select * from h)
        and mp.deleted_at is null and mp.week_start_date = w.week_start);`;
  for (const psql of PSQL_CANDIDATES) {
    try {
      const out = execFileSync(psql, [url, '-qtA', '-c', sql], {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      return { ok: true, seeded: Number(out.trim()) };
    } catch (error) {
      // ⚠️ Only fall through when the BINARY is missing. Falling through on any
      // error meant a real connection failure was reported as "psql ENOENT"
      // from the next candidate - the true reason masked by the fallback.
      const missingBinary = error.code === 'ENOENT';
      if (!missingBinary || psql === PSQL_CANDIDATES.at(-1)) {
        const detail = (error.stderr || error.message || '').toString().trim().split('\n')[0];
        return { ok: false, reason: detail || String(error.code ?? 'unknown error') };
      }
    }
  }
  return { ok: false, reason: 'psql not found' };
}

const b64url = (input) =>
  Buffer.from(typeof input === 'string' ? input : JSON.stringify(input))
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

function token() {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url({ alg: 'ES256', kid: KEY_ID, typ: 'JWT' });
  const payload = b64url({ iss: ISSUER, iat: now, exp: now + 600, aud: 'appstoreconnect-v1' });
  const signer = createSign('SHA256');
  signer.update(`${header}.${payload}`);
  const signature = signer
    .sign({ key: readFileSync(KEY_PATH, 'utf8'), dsaEncoding: 'ieee-p1363' })
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  return `${header}.${payload}.${signature}`;
}

async function api(path, options = {}) {
  const res = await fetch(`https://api.appstoreconnect.apple.com${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token()}`,
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });
  if (!res.ok) throw new Error(`App Store Connect ${res.status}: ${await res.text()}`);
  return res.status === 204 ? null : res.json();
}

// ---------------------------------------------------------------------------
// Pre-flight. Every one of these is something that has gone wrong before, or
// would be silently wrong if unchecked.
// ---------------------------------------------------------------------------

const versionsResponse = await api(
  `/v1/apps/${APP_ID}/appStoreVersions?limit=10&include=build` +
    // `build` must be named or the relationship is omitted entirely and every
    // version reports "no build attached" - see scripts/asc-attach-build.mjs.
    `&fields[appStoreVersions]=versionString,appStoreState,releaseType,build`,
);
const buildsById = new Map(
  (versionsResponse.included ?? [])
    .filter((x) => x.type === 'builds')
    .map((b) => [b.id, b.attributes.version]),
);
const versions = versionsResponse.data.map((v) => ({
  id: v.id,
  version: v.attributes.versionString,
  state: v.attributes.appStoreState,
  releaseType: v.attributes.releaseType,
  buildNumber: v.relationships?.build?.data?.id
    ? (buildsById.get(v.relationships.build.data.id) ?? '?')
    : null,
}));

const target = versions.find((v) =>
  wantVersion ? v.version === wantVersion : v.state === 'PREPARE_FOR_SUBMISSION',
);

if (!target) {
  console.error(`ERROR: no version record${wantVersion ? ` for ${wantVersion}` : ' to submit'}.`);
  process.exit(1);
}

console.log(`==> ${target.version}`);
console.log(`    state        ${target.state}`);
console.log(`    build        ${target.buildNumber ?? '(NONE ATTACHED)'}`);
console.log(`    release      ${target.releaseType}`);

const problems = [];
if (target.state !== 'PREPARE_FOR_SUBMISSION') {
  problems.push(`state is ${target.state}, not PREPARE_FOR_SUBMISSION - it may already be with Apple`);
}
// Submitting a version with no build is possible via the API and produces a
// rejection days later. Uploading to TestFlight does NOT attach a build.
if (!target.buildNumber) problems.push('no build attached');

// "What's New" is what users read on the update. An empty one is not blocked by
// Apple for a first version but is a wasted release note here.
const locs = await api(
  `/v1/appStoreVersions/${target.id}/appStoreVersionLocalizations` +
    `?fields[appStoreVersionLocalizations]=locale,whatsNew&limit=20`,
);
for (const l of locs.data) {
  const text = (l.attributes.whatsNew ?? '').trim();
  console.log(`    whatsNew[${l.attributes.locale}]  ${text ? `${text.length} chars` : 'EMPTY'}`);
  if (!text) problems.push(`whatsNew is empty for ${l.attributes.locale}`);
}

// ⚠️ THE REVIEWER'S DEMO PLAN. Checked here, and it BLOCKS, because being
// written down was not enough: it was a standing pre-submission task and it was
// still missed before 1.1.0.
if (skipDemoCheck) {
  console.log('    demo plan   SKIPPED (--no-demo-check)');
} else {
  const demo = demoWeeksSeeded();
  if (!demo.ok) {
    console.log(`    demo plan   COULD NOT CHECK – ${demo.reason}`);
    problems.push(
      `could not check the reviewer's demo plan (${demo.reason}). ` +
        'Fix it, or pass --no-demo-check if you have verified it another way',
    );
  } else {
    console.log(
      `    demo plan   ${demo.seeded}/${DEMO_WEEKS_REQUIRED} upcoming weeks seeded`,
    );
    if (demo.seeded < DEMO_WEEKS_REQUIRED) {
      problems.push(
        `the reviewer's demo plan covers only ${demo.seeded} of the next ` +
          `${DEMO_WEEKS_REQUIRED} weeks - a reviewer reaching it later opens an ` +
          'empty app. Run: ./scripts/seed-demo-week.sh --weeks 6',
      );
    }
  }
}

// An unsent basket from an earlier attempt blocks a new one with an unhelpful
// error, so find it and reuse it rather than creating a duplicate.
const existing = await api(
  `/v1/apps/${APP_ID}/reviewSubmissions?filter[state]=${OPEN_SUBMISSION_STATES.join(',')}` +
    `&fields[reviewSubmissions]=${READABLE_SUBMISSION_FIELDS}&limit=10`,
);
const openBasket = existing.data.find((s) => s.attributes.platform === 'IOS');
if (openBasket) {
  console.log(
    `    ⚠️ existing review submission ${openBasket.id}: state=${openBasket.attributes.state}` +
      ` (${isSent(openBasket) ? 'already sent' : 'created but NOT sent'})`,
  );
}

if (problems.length > 0) {
  console.error('\n==> NOT READY:');
  for (const p of problems) console.error(`    - ${p}`);
  process.exit(1);
}

if (!doSubmit) {
  console.log('\n==> Pre-flight only. Nothing was submitted.');
  console.log(`    To submit:  node scripts/asc-submit-for-review.mjs --submit --version ${target.version}`);
  process.exit(0);
}

// ---------------------------------------------------------------------------
// Submitting
// ---------------------------------------------------------------------------

if (openBasket && isSent(openBasket)) {
  console.log(`\n==> Already submitted (${openBasket.attributes.state}). Nothing to do.`);
  process.exit(0);
}

let basketId = openBasket?.id;
if (!basketId) {
  const created = await api('/v1/reviewSubmissions', {
    method: 'POST',
    body: JSON.stringify({
      data: {
        type: 'reviewSubmissions',
        attributes: { platform: 'IOS' },
        relationships: { app: { data: { type: 'apps', id: APP_ID } } },
      },
    }),
  });
  basketId = created.data.id;
  console.log(`\n==> Created review submission ${basketId}`);
} else {
  console.log(`\n==> Reusing review submission ${basketId}`);
}

// Add the version, unless it is already in the basket.
const items = await api(
  `/v1/reviewSubmissions/${basketId}/items?include=appStoreVersion&limit=20`,
);
const alreadyIn = (items.included ?? []).some((x) => x.id === target.id);
if (alreadyIn) {
  console.log(`    ${target.version} is already in the submission`);
} else {
  await api('/v1/reviewSubmissionItems', {
    method: 'POST',
    body: JSON.stringify({
      data: {
        type: 'reviewSubmissionItems',
        relationships: {
          reviewSubmission: { data: { type: 'reviewSubmissions', id: basketId } },
          appStoreVersion: { data: { type: 'appStoreVersions', id: target.id } },
        },
      },
    }),
  });
  console.log(`    added ${target.version} to the submission`);
}

// THE line that actually sends it.
await api(`/v1/reviewSubmissions/${basketId}`, {
  method: 'PATCH',
  body: JSON.stringify({
    data: { type: 'reviewSubmissions', id: basketId, attributes: { submitted: true } },
  }),
});

// Read back from Apple. A 200 on the PATCH is not the same as Apple agreeing
// the thing is submitted - the same lesson as asc-build-state.mjs.
const after = await api(
  `/v1/reviewSubmissions/${basketId}?fields[reviewSubmissions]=${READABLE_SUBMISSION_FIELDS}`,
);
console.log(
  `==> Read back: state=${after.data.attributes.state}` +
    ` submitted ${after.data.attributes.submittedDate ?? '(no date)'}`,
);

const versionAfter = await api(
  `/v1/appStoreVersions/${target.id}?fields[appStoreVersions]=versionString,appStoreState`,
);
console.log(`==> ${target.version} is now ${versionAfter.data.attributes.appStoreState}`);

if (!isSent(after.data)) {
  console.error('ERROR: Apple still reports this as READY_FOR_REVIEW, i.e. NOT sent.');
  process.exit(1);
}
