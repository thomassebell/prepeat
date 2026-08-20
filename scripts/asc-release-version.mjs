// Release an APPROVED App Store version to the store. The last click.
//
// Usage (config comes from scripts/eas-env.sh):
//   node scripts/asc-release-version.mjs                          # dry run, changes NOTHING
//   node scripts/asc-release-version.mjs --release --version 1.1.0
//
// ⚠️ DEFAULT IS A DRY RUN. This is the step that puts a build in front of real
// people, and it cannot be taken back – a released version can only be
// superseded by another release or pulled from sale, never un-released.
//
// ⚠️ RELEASING IS THOMAS'S DECISION, EVERY TIME. This script exists so the
// mechanics are not his problem, not so the choice stops being his.
//
// It only ever acts on a version in PENDING_DEVELOPER_RELEASE – Apple's word
// for "approved, waiting on you". Any other state is refused rather than
// interpreted, because the states that look similar mean very different things
// (READY_FOR_SALE is already out; WAITING_FOR_REVIEW has not been looked at).
//
// The call itself is one POST of an appStoreVersionReleaseRequest. Apple's
// answer is 201 with no useful body, so the script re-reads the version
// afterwards and reports the state it actually finds – the same reason
// asc-build-state.mjs exists.
import { createSign } from 'node:crypto';
import { readFileSync } from 'node:fs';

const KEY_PATH = process.env.EXPO_ASC_API_KEY_PATH;
const KEY_ID = process.env.EXPO_ASC_KEY_ID;
const ISSUER = process.env.EXPO_ASC_ISSUER_ID;
const APP_ID = '6793690543';

const RELEASABLE = 'PENDING_DEVELOPER_RELEASE';

if (!KEY_PATH || !KEY_ID || !ISSUER) {
  console.error('ERROR: missing App Store Connect config. Source scripts/eas-env.sh first.');
  process.exit(1);
}

const arg = (name) => {
  const i = process.argv.indexOf(name);
  return i === -1 ? null : String(process.argv[i + 1] ?? '').trim();
};
const doRelease = process.argv.includes('--release');
const wantVersion = arg('--version');

const b64url = (input) =>
  Buffer.from(typeof input === 'string' ? input : JSON.stringify(input))
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

/** ES256 JWT for the ASC API – raw r||s, not node's default DER. */
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

/** The versions Apple currently has, newest first, with their attached build. */
async function versions() {
  const { data, included = [] } = await api(
    `/v1/apps/${APP_ID}/appStoreVersions?limit=5&include=build`,
  );
  return data.map((v) => {
    const buildId = v.relationships?.build?.data?.id;
    const build = included.find((i) => i.id === buildId);
    return {
      id: v.id,
      string: v.attributes.versionString,
      state: v.attributes.appStoreState ?? v.attributes.appVersionState,
      releaseType: v.attributes.releaseType,
      build: build?.attributes?.version ?? 'none',
    };
  });
}

const all = await versions();
for (const v of all) {
  console.log(`  ${v.string.padEnd(8)} ${String(v.state).padEnd(26)} build ${v.build}  ${v.releaseType}`);
}

// Without --version, the one releasable version is the target - and if there
// is more than one, that is a state worth stopping on rather than guessing at.
const candidates = all.filter(
  (v) => v.state === RELEASABLE && (!wantVersion || v.string === wantVersion),
);
if (candidates.length !== 1) {
  console.error(
    `\nERROR: expected exactly one version in ${RELEASABLE}` +
      `${wantVersion ? ` matching ${wantVersion}` : ''}, found ${candidates.length}.`,
  );
  process.exit(1);
}
const target = candidates[0];

if (!doRelease) {
  console.log(
    `\nDRY RUN. Would release ${target.string} (build ${target.build}) to the App Store.` +
      `\nAdd --release to do it. Nothing has changed.`,
  );
  process.exit(0);
}

console.log(`\n==> Releasing ${target.string} (build ${target.build})…`);
await api('/v1/appStoreVersionReleaseRequests', {
  method: 'POST',
  body: JSON.stringify({
    data: {
      type: 'appStoreVersionReleaseRequests',
      relationships: { appStoreVersion: { data: { type: 'appStoreVersions', id: target.id } } },
    },
  }),
});

// Apple's 201 is not the proof - the version's own state is.
const after = (await versions()).find((v) => v.id === target.id);
console.log(`==> ${after.string} is now ${after.state} (build ${after.build}).`);
console.log(
  after.state === RELEASABLE
    ? '  Still pending – Apple accepted the request but has not moved it yet. Re-run to re-read.'
    : '  Going live. It takes a while to appear on every storefront.',
);
