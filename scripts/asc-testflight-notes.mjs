// Post the "What to Test" notes for a TestFlight build, from the command line.
//
// Usage (config comes from scripts/eas-env.sh):
//   source scripts/eas-env.sh
//   node scripts/asc-testflight-notes.mjs --build 26 --file notes.txt
//   node scripts/asc-testflight-notes.mjs --build 26        # prints what is there
//
// WHY IT EXISTS (2026-08-20). Thomas posts what changed on every update, and
// until now the TestFlight half of that was the one step that had to be done by
// hand in a browser - so it was the one that got skipped. The App Store Connect
// key already in credentials/ can do it, and a build with no notes is a build
// nobody knows what to look at.
//
// ⚠️ THE NOTES BELONG TO A BUILD, NOT TO A VERSION. Every new build starts with
// none, including a rebuild of the same version, so this runs once per build.
//
// It PATCHes when a localization already exists and POSTs when it does not:
// App Store Connect creates one per locale per build, and a second POST for the
// same pair is a 409 rather than an overwrite.
import { createSign } from 'node:crypto';
import { readFileSync } from 'node:fs';

const KEY_PATH = process.env.EXPO_ASC_API_KEY_PATH;
const KEY_ID = process.env.EXPO_ASC_KEY_ID;
const ISSUER = process.env.EXPO_ASC_ISSUER_ID;
// The app record: "Prep+Eat", bundle app.prepeat.
const APP_ID = '6793690543';
// The app ships English first; Danish TestFlight notes would need a second
// locale here, and Thomas proof-reads Danish, so it is deliberately not guessed.
const LOCALE = 'en-US';

if (!KEY_PATH || !KEY_ID || !ISSUER) {
  console.error(
    'ERROR: missing App Store Connect config. Source scripts/eas-env.sh first.',
  );
  process.exit(1);
}

const arg = (name) => {
  const at = process.argv.indexOf(`--${name}`);
  return at === -1 ? null : (process.argv[at + 1] ?? null);
};
const buildNumber = arg('build');
const notesFile = arg('file');
if (!buildNumber) {
  console.error('ERROR: pass --build <number>.');
  process.exit(1);
}

const b64url = (input) =>
  Buffer.from(typeof input === 'string' ? input : JSON.stringify(input))
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

/** ES256 JWT for the ASC API – raw r||s signature, as in asc-build-state.mjs. */
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
  return res.status === 204 ? null : res.json();
}

const builds = await api(
  `/v1/builds?filter[app]=${APP_ID}&filter[version]=${buildNumber}&limit=1`,
);
const build = builds.data[0];
if (!build) {
  console.error(
    `ERROR: App Store Connect has no build ${buildNumber} for this app yet.`,
  );
  process.exit(1);
}
console.log(
  `==> Build ${buildNumber} (${build.attributes.processingState}), uploaded ${build.attributes.uploadedDate}`,
);

const existing = await api(`/v1/builds/${build.id}/betaBuildLocalizations`);
const mine = existing.data.find((l) => l.attributes.locale === LOCALE);

if (!notesFile) {
  console.log(
    mine?.attributes.whatsNew
      ? `\n--- current ${LOCALE} notes ---\n${mine.attributes.whatsNew}`
      : `\n(no ${LOCALE} notes on this build)`,
  );
  process.exit(0);
}

const whatsNew = readFileSync(notesFile, 'utf8').trim();
if (whatsNew.length === 0) {
  console.error('ERROR: the notes file is empty.');
  process.exit(1);
}
// Apple's limit. Better to refuse than to have it truncated server-side.
if (whatsNew.length > 4000) {
  console.error(`ERROR: notes are ${whatsNew.length} characters; the limit is 4000.`);
  process.exit(1);
}

if (mine) {
  await api(`/v1/betaBuildLocalizations/${mine.id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      data: {
        type: 'betaBuildLocalizations',
        id: mine.id,
        attributes: { whatsNew },
      },
    }),
  });
  console.log(`==> Replaced the ${LOCALE} notes on build ${buildNumber}.`);
} else {
  await api('/v1/betaBuildLocalizations', {
    method: 'POST',
    body: JSON.stringify({
      data: {
        type: 'betaBuildLocalizations',
        attributes: { locale: LOCALE, whatsNew },
        relationships: { build: { data: { type: 'builds', id: build.id } } },
      },
    }),
  });
  console.log(`==> Posted the ${LOCALE} notes on build ${buildNumber}.`);
}

// Read back rather than trust the write: the whole point of this file's
// neighbours is that a tool's success message is not evidence.
const after = await api(`/v1/builds/${build.id}/betaBuildLocalizations`);
const now = after.data.find((l) => l.attributes.locale === LOCALE);
console.log(`\n--- what testers will read ---\n${now?.attributes.whatsNew ?? '(nothing)'}`);
