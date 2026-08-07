// Proves the drag-to-reorder arithmetic in src/lib/reorder.ts, by RUNNING it.
//
// HOW TO RUN:  node scripts/check-reorder.mjs
//
// WHY IT EXISTS (2026-08-07, with true section dragging). Three screens share
// the reorder sheet - recipe ingredients, recipe instructions and shopping
// categories - so a change made for sections can silently regress the two lists
// that have none. The load-bearing check below is therefore not a section test
// at all: it is "single-row moves match the old splice exactly, every from/to".
//
// It transpiles and imports the REAL module rather than mirroring it. The
// reconciler lesson (2026-08-04) is that a mirror written from the same wrong
// model agrees with the bug; src/lib/reorder.ts has zero runtime imports
// precisely so this can import the actual code.
import { execFileSync } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const out = mkdtempSync(join(tmpdir(), 'prepeat-reorder-'));
execFileSync('npx', ['tsc', '--ignoreConfig', '--target', 'es2020', '--module',
  'es2020', '--outDir', out, 'src/lib/reorder.ts'], { stdio: 'inherit' });
const {
  blockSizeAt,
  validTargets,
  topSlotFor,
  targetTopSlots,
  movesAnything,
  moveBlock,
} = await import(pathToFileURL(join(out, 'reorder.js')).href);


let pass = 0;
let fail = 0;
const check = (label, ok, detail) => {
  if (ok) { pass += 1; console.log(`PASS  ${label}`); }
  else { fail += 1; console.log(`*** FAIL ***  ${label}${detail ? `  -> ${detail}` : ''}`); }
};

const S = (key) => ({ key, isSection: true });
const R = (key) => ({ key });
const show = (list) => list.map((i) => i.key).join(',');

// DOUGH[flour,water] FILLING[sugar,cinnamon]
const recipe = [S('DOUGH'), R('flour'), R('water'), S('FILLING'), R('sugar'), R('cinnamon')];
// A list with no sections at all - instructions / shopping categories.
const flat = [R('a'), R('b'), R('c'), R('d')];
// Loose rows before the first heading.
const leading = [R('salt'), S('DOUGH'), R('flour'), S('FILLING'), R('sugar')];

// ---- block sizes -----------------------------------------------------------
check('a heading carries its rows', blockSizeAt(recipe, 0) === 3, blockSizeAt(recipe, 0));
check('the last heading carries to the end', blockSizeAt(recipe, 3) === 3, blockSizeAt(recipe, 3));
check('a plain row moves alone', blockSizeAt(recipe, 1) === 1);
check('an EMPTY section is size 1', blockSizeAt([S('A'), S('B'), R('x')], 0) === 1);
check('every item in a flat list moves alone',
  flat.every((_, i) => blockSizeAt(flat, i) === 1));

// ---- THE SAFETY PROPERTY: a sectionless list behaves exactly as before ------
// Three screens share this sheet. If sections changed how a flat list drags,
// instructions and shopping categories would regress.
check('a flat list allows every target',
  JSON.stringify(validTargets(flat, 1, 1)) === JSON.stringify([0, 1, 2, 3, 4]),
  JSON.stringify(validTargets(flat, 1, 1)));
{
  // The classic single-row move, checked against the pre-2026-08-07 behaviour
  // (splice one out, splice it in).
  let ok = true;
  for (let from = 0; from < flat.length; from += 1) {
    for (let to = 0; to <= flat.length; to += 1) {
      const old = [...flat];
      old.splice(to > from ? to - 1 : to, 0, ...old.splice(from, 1));
      const next = moveBlock(flat, from, 1, to);
      if (show(old) !== show(next)) { ok = false; console.log(`   from=${from} to=${to}: was ${show(old)} now ${show(next)}`); }
    }
  }
  check('single-row moves match the old splice exactly, every from/to', ok);
}

// ---- section targets are boundaries only ------------------------------------
check('a section may only land on a boundary',
  JSON.stringify(validTargets(recipe, 0, 3)) === JSON.stringify([0, 3, 6]),
  JSON.stringify(validTargets(recipe, 0, 3)));
check('...and never inside another section',
  !validTargets(recipe, 0, 3).includes(4) && !validTargets(recipe, 0, 3).includes(5));
check('a plain row MAY still enter another section',
  validTargets(recipe, 1, 1).includes(5));

// ---- the water case: the reason boundaries are enforced ---------------------
{
  // Dragging FILLING (index 3, size 3) as far as the maths allows: the nearest
  // targets are 0 and 6, never 2 (between flour and water).
  const targets = validTargets(recipe, 3, 3);
  check('FILLING cannot land between flour and water',
    !targets.includes(2) && !targets.includes(1), JSON.stringify(targets));
  const moved = moveBlock(recipe, 3, 3, 0);
  check('FILLING to the top keeps both sections whole',
    show(moved) === 'FILLING,sugar,cinnamon,DOUGH,flour,water', show(moved));
  // The thing that must never happen, shown explicitly for the record.
  const bad = moveBlock(recipe, 3, 3, 2);
  check('(if boundaries were NOT enforced, water would join FILLING)',
    show(bad) === 'DOUGH,flour,FILLING,sugar,cinnamon,water', show(bad));
}

// ---- geometry ---------------------------------------------------------------
check('landing above itself keeps its slot', topSlotFor(0, 3, 3) === 0);
check('landing below itself loses the block length', topSlotFor(6, 0, 3) === 3);
check('landing on its own edges does not move it',
  topSlotFor(0, 0, 3) === 0 && topSlotFor(3, 0, 3) === 0);
check('target tops line up with targets',
  JSON.stringify(targetTopSlots([0, 3, 6], 0, 3)) === JSON.stringify([0, 0, 3]),
  JSON.stringify(targetTopSlots([0, 3, 6], 0, 3)));
check('no-op targets are recognised',
  !movesAnything(0, 0, 3) && !movesAnything(3, 0, 3) && movesAnything(6, 0, 3));

// ---- round trips and invariants --------------------------------------------
{
  const there = moveBlock(recipe, 0, 3, 6);
  const back = moveBlock(there, 3, 3, 0);
  check('moving a section down and back is the identity', show(back) === show(recipe), show(back));
}
{
  // Every legal section move must preserve every item exactly once, and must
  // never leave a row orphaned above the first heading that was not there
  // before.
  let ok = true;
  const sectionStarts = recipe.map((it, i) => (it.isSection ? i : -1)).filter((i) => i >= 0);
  for (const from of sectionStarts) {
    const size = blockSizeAt(recipe, from);
    for (const to of validTargets(recipe, from, size)) {
      const next = moveBlock(recipe, from, size, to);
      if (next.length !== recipe.length) { ok = false; console.log(`   length changed from=${from} to=${to}`); }
      if (new Set(next.map((i) => i.key)).size !== recipe.length) { ok = false; console.log(`   duplicate/lost from=${from} to=${to}`); }
      const firstHeading = next.findIndex((i) => i.isSection);
      if (firstHeading !== 0) { ok = false; console.log(`   orphaned rows above the first heading: ${show(next)}`); }
      // Each section must still own exactly the rows it started with.
      const groups = {};
      let current = null;
      for (const it of next) {
        if (it.isSection) { current = it.key; groups[current] = []; }
        else if (current) groups[current].push(it.key);
      }
      if (groups.DOUGH?.join() !== 'flour,water' || groups.FILLING?.join() !== 'sugar,cinnamon') {
        ok = false; console.log(`   section membership changed: ${JSON.stringify(groups)}`);
      }
    }
  }
  check('EVERY legal section move keeps each section owning its own rows', ok);
}

// ---- rows that sit before the first heading ---------------------------------
{
  const targets = validTargets(leading, 1, 2); // DOUGH + flour
  check('a section can be dropped above loose leading rows', targets.includes(0), JSON.stringify(targets));
  const moved = moveBlock(leading, 1, 2, 0);
  check('...and the loose rows stay loose, below it',
    show(moved) === 'DOUGH,flour,salt,FILLING,sugar', show(moved));
}

// ---- empty sections (backlog decision 3: allowed) ---------------------------
{
  const withEmpty = [S('EMPTY'), S('DOUGH'), R('flour')];
  check('an empty section moves alone', blockSizeAt(withEmpty, 0) === 1);
  const moved = moveBlock(withEmpty, 0, 1, 3);
  check('an empty section can move to the end',
    show(moved) === 'DOUGH,flour,EMPTY', show(moved));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
