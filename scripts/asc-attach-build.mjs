// Show, and optionally change, which BUILD an App Store version record points at.
//
// Usage (config comes from scripts/eas-env.sh):
//   node scripts/asc-attach-build.mjs                    # show every editable version + its build
//   node scripts/asc-attach-build.mjs --set 25           # attach build 25 to the editable version
//   node scripts/asc-attach-build.mjs --set 25 --version 1.1.0   # ...being explicit about which
//
// WHY THIS EXISTS (2026-08-19). A version record in App Store Connect keeps
// whatever build was attached when it was created. Build 24 sat on the 1.1.0
// record from 2026-08-18; every app change made after that - share expiry, Stop
// sharing, the associated-domains fix - was in build 25 and in NO WAY connected
// to the thing that would actually be submitted. Uploading a build to TestFlight
// does NOT attach it. Submitting without swapping ships the old binary under the
// new release notes, and nothing warns you.
//
// ⚠️ THIS DOES NOT SUBMIT ANYTHING. It only changes which binary the version
// record points at. The record stays in PREPARE_FOR_SUBMISSION and submitting is
// still a separate, deliberate act.
//
// ⚠️ IT REFUSES TO TOUCH A VERSION THAT IS NOT EDITABLE. Once a version is
// WAITING_FOR_REVIEW / IN_REVIEW / READY_FOR_SALE, Apple either rejects the
// change or it means something different from what you intended, so the script
// stops rather than finding out.
import { createSign } from 'node:crypto';
import { readFileSync } from 'node:fs';

const KEY_PATH = process.env.EXPO_ASC_API_KEY_PATH;
const KEY_ID = process.env.EXPO_ASC_KEY_ID;
const ISSUER = process.env.EXPO_ASC_ISSUER_ID;
// The app record: "Prep+Eat", bundle app.prepeat.
const APP_ID = '6793690543';

// The only states in which a version's build may be swapped. Anything else is
// either already with Apple or already shipped.
const EDITABLE = new Set([
  'PREPARE_FOR_SUBMISSION',
  'DEVELOPER_REJECTED',
  'REJECTED',
  'METADATA_REJECTED',
  'INVALID_BINARY',
]);

if (!KEY_PATH || !KEY_ID || !ISSUER) {
  console.error(
    'ERROR: missing App Store Connect config. Source scripts/eas-env.sh first.',
  );
  process.exit(1);
}

const arg = (name) => {
  const i = process.argv.indexOf(name);
  return i === -1 ? null : String(process.argv[i + 1] ?? '').trim();
};
const setBuild = arg('--set');
const wantVersion = arg('--version');

const b64url = (input) =>
  Buffer.from(typeof input === 'string' ? input : JSON.stringify(input))
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

/**
 * ES256 JWT for the ASC API. The signature must be raw r||s (JOSE), which is
 * what dsaEncoding 'ieee-p1363' produces – node's default DER is rejected.
 * Same as scripts/asc-build-state.mjs; kept local so each script stands alone.
 */
function token() {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url({ alg: 'ES256', kid: KEY_ID, typ: 'JWT' });
  const payload = b64url({
    iss: ISSUER,
    iat: now,
    exp: now + 600,
    aud: 'appstoreconnect-v1',
  });
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
  if (!res.ok) {
    throw new Error(`App Store Connect ${res.status}: ${await res.text()}`);
  }
  // A successful PATCH of a relationship returns 204 with no body.
  return res.status === 204 ? null : res.json();
}

const versionsResponse = await api(
  `/v1/apps/${APP_ID}/appStoreVersions?limit=10&include=build` +
    // ⚠️ `build` MUST be in the fieldset. With a sparse fieldset, any
    // relationship not named is omitted from the response - so leaving it out
    // makes every version report "no build attached", including one that is
    // live on the App Store. A wrong answer that looks like a real one.
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
  buildId: v.relationships?.build?.data?.id ?? null,
  buildNumber: v.relationships?.build?.data?.id
    ? (buildsById.get(v.relationships.build.data.id) ?? '?')
    : null,
}));

const show = () => {
  for (const v of versions) {
    console.log(
      `  ${v.version.padEnd(8)} ${v.state.padEnd(24)} ` +
        `build ${v.buildNumber ?? '(none attached)'}  release=${v.releaseType}`,
    );
  }
};

console.log('==> App Store version records:');
show();

if (setBuild == null) process.exit(0);

// ---------------------------------------------------------------------------
// Attaching a build
// ---------------------------------------------------------------------------

const candidates = versions.filter(
  (v) => EDITABLE.has(v.state) && (wantVersion == null || v.version === wantVersion),
);

if (candidates.length === 0) {
  console.error(
    `\nERROR: no editable version record${wantVersion ? ` for ${wantVersion}` : ''}.` +
      ' Nothing was changed.',
  );
  console.error('  Editable means: ' + [...EDITABLE].join(', '));
  process.exit(1);
}
if (candidates.length > 1) {
  // Guessing which release to modify is exactly the kind of thing that should
  // never be guessed.
  console.error(
    `\nERROR: ${candidates.length} editable versions - pass --version to say which.`,
  );
  process.exit(1);
}

const target = candidates[0];

const wanted = await api(
  `/v1/builds?filter[app]=${APP_ID}&filter[version]=${encodeURIComponent(setBuild)}` +
    `&limit=1&fields[builds]=version,processingState,uploadedDate`,
);
const build = wanted.data[0];
if (!build) {
  console.error(`\nERROR: build ${setBuild} is not in App Store Connect. Nothing changed.`);
  process.exit(1);
}
// A build Apple has not finished ingesting cannot be attached, and the failure
// is unhelpful - check here so the message is about the real cause.
if (build.attributes.processingState !== 'VALID') {
  console.error(
    `\nERROR: build ${setBuild} is ${build.attributes.processingState}, not VALID.` +
      ' Wait for Apple to finish processing it. Nothing changed.',
  );
  process.exit(1);
}

if (target.buildNumber === setBuild) {
  console.log(`\n==> ${target.version} already points at build ${setBuild}. Nothing to do.`);
  process.exit(0);
}

console.log(
  `\n==> ${target.version} (${target.state}): build ${target.buildNumber ?? 'none'} -> ${setBuild}`,
);

await api(`/v1/appStoreVersions/${target.id}/relationships/build`, {
  method: 'PATCH',
  body: JSON.stringify({ data: { type: 'builds', id: build.id } }),
});

// Read it back. A PATCH returning 204 is not proof the record now says what we
// think - the same lesson as asc-build-state.mjs, one endpoint along.
const after = await api(
  `/v1/appStoreVersions/${target.id}?include=build` +
    `&fields[appStoreVersions]=versionString,appStoreState,build`,
);
const attached = (after.included ?? []).find((x) => x.type === 'builds');
const now = attached?.attributes?.version ?? '(none)';

console.log(`==> Read back from Apple: ${after.data.attributes.versionString} -> build ${now}`);
if (now !== setBuild) {
  console.error('ERROR: the record does not show the build we just set.');
  process.exit(1);
}
console.log('    Nothing was submitted - the record is still yours to send.');
