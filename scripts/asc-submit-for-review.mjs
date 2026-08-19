// Submit an App Store version for review. THE step that reaches real users.
//
// Usage (config comes from scripts/eas-env.sh):
//   node scripts/asc-submit-for-review.mjs                       # pre-flight only, changes NOTHING
//   node scripts/asc-submit-for-review.mjs --submit --version 1.1.0
//
// ⚠️ DEFAULT IS A DRY RUN, AND DELIBERATELY SO. Submitting is not reversible in
// the ordinary sense: it enters a review queue that has run to 13 days on this
// app, and pulling it out means cancelling and requeueing. The default prints
// what WOULD be submitted and exits.
//
// ⚠️ SUBMITTING IS THOMAS'S DECISION, EVERY TIME. This script exists so the
// mechanics are not his problem, not so the choice stops being his.
//
// HOW APPLE'S CURRENT FLOW WORKS, because it is three calls and not one:
//   1. create a reviewSubmission for the app (a basket)
//   2. add the appStoreVersion to it as a reviewSubmissionItem
//   3. PATCH submitted: true  <- only this one actually sends it
// A basket created and never sent is a real state that blocks later attempts
// with "already has a submission in progress", so this script reuses an
// existing unsent basket rather than creating a second one.
import { createSign } from 'node:crypto';
import { readFileSync } from 'node:fs';

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
