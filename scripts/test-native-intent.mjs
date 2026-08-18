// Checks the deep-link path rewrite in src/app/+native-intent.tsx.
//
//   node ./scripts/test-native-intent.mjs
//
// It READS the real file and strips only the TypeScript annotation, so the test
// cannot drift from the code the app ships – a copied-out copy would.
//
// Why it exists: the rewrite looked obviously correct and was wrong for
// `prepeat://r/<token>`, which is precisely the shape the device reported on
// its Unmatched Route screen. Host-stripping ate the `r/` segment. A custom
// scheme has no host; an https URL does.
import { readFileSync } from 'node:fs';

const src = readFileSync(new URL('../src/app/+native-intent.tsx', import.meta.url), 'utf8');
const body = src
  .slice(src.indexOf('const SHARE_PATH'))
  .replace(
    'export function redirectSystemPath({ path }: { path: string; initial: boolean }): string {',
    'function redirectSystemPath({ path }) {',
  );
const { redirectSystemPath } = await import(
  'data:text/javascript,' + encodeURIComponent(body + '\nexport { redirectSystemPath };')
);

const T = 'b90b78f8d6134c07bee16bed708a0889';
const cases = [
  [`https://share.prepeat.app/r/${T}`, `/recipes/shared/${T}`],
  [`prepeat://r/${T}`, `/recipes/shared/${T}`],
  [`/r/${T}`, `/recipes/shared/${T}`],
  [`r/${T}`, `/recipes/shared/${T}`],
  [`https://share.prepeat.app/r/${T}?utm=x`, `/recipes/shared/${T}`],
  ['/recipes', '/recipes'],
  ['prepeat://recipes/abc', 'prepeat://recipes/abc'],
  ['/r/NOTHEX', '/r/NOTHEX'],
  ['', ''],
];

let failed = 0;
for (const [input, want] of cases) {
  const got = redirectSystemPath({ path: input, initial: true });
  const ok = got === want;
  if (!ok) failed++;
  console.log(`${ok ? 'PASS' : '*** FAIL ***'}  ${JSON.stringify(input)} -> ${got}`);
}
console.log(failed === 0 ? `\nall ${cases.length} pass` : `\n${failed} FAILED`);
process.exit(failed === 0 ? 0 : 1);
