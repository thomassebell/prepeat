// Proves the in-place ingredient drag geometry in src/lib/ingredient-drag-layout.ts,
// by RUNNING it.
//
// HOW TO RUN:  node scripts/check-ingredient-drag.mjs
//
// WHY IT EXISTS (2026-08-20). The reorder sheet could be checked with pure
// index arithmetic because every slot there is the same height. Dragging in
// place has real geometry - cards that grow and shrink, an emptied section that
// loses its card, headings that move because something above them resized - and
// the one number that cannot be eyeballed is the DISPLACEMENT, because React's
// own column layout already moves everything below a resized card. Count that
// twice and the list slides twice as far as the finger.
//
// THE LOAD-BEARING CHECK is the last one: for every row and every target, the
// position the plan promises the dragged row is the position the editor
// actually draws it at once the new order is committed. That is the promise the
// drop animation makes, and nothing else in here would catch it breaking.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const out = mkdtempSync(join(tmpdir(), 'prepeat-ingredient-drag-'));
execFileSync('npx', ['tsc', '--ignoreConfig', '--target', 'es2020', '--module',
  'es2020', '--outDir', out, 'src/lib/ingredient-drag-layout.ts'], { stdio: 'inherit' });
// tsc leaves `from "./reorder"` alone and node's ESM loader wants the
// extension, so put it back. The alternative - writing the extension in the
// TypeScript source - would be a bundler question answered for a test's sake.
const emitted = join(out, 'ingredient-drag-layout.js');
writeFileSync(emitted, readFileSync(emitted, 'utf8').replace('"./reorder"', '"./reorder.js"'));
const {
  ROW_SLOT,
  BLOCK_GAP,
  groupForDrag,
  cardHeight,
  cardMarginBottom,
  layoutTops,
  dragPlan,
  dragPlans,
  dropOffsets,
} = await import(pathToFileURL(join(out, 'ingredient-drag-layout.js')).href);
const { moveBlock } = await import(pathToFileURL(join(out, 'reorder.js')).href);

let pass = 0;
let fail = 0;
const check = (label, ok, detail) => {
  if (ok) { pass += 1; console.log(`PASS  ${label}`); }
  else { fail += 1; console.log(`*** FAIL ***  ${label}${detail ? `  -> ${detail}` : ''}`); }
};

const H = 24; // one line of header/display-6 beside a 24px handle
const S = (name) => ({ name, isSection: true });
const R = (name) => ({ name });
const heights = (items) => items.map((item) => (item.isSection ? H : 0));

// DOUGH[a, b]  FILLING[c]
const items = [S('DOUGH'), R('a'), R('b'), S('FILLING'), R('c')];
const tops = layoutTops(items, heights(items));

// ---- the idle layout, worked out by hand -----------------------------------
check('the first heading sits at the top', tops[0] === 0, String(tops[0]));
check('its card clears the heading by one gap', tops[1] === H + BLOCK_GAP, String(tops[1]));
check('the second row is one slot below the first', tops[2] === tops[1] + ROW_SLOT, String(tops[2]));
check('the second heading clears the card by one gap',
  tops[3] === tops[1] + cardHeight(2) + BLOCK_GAP, String(tops[3]));
check('a card holding two rows clips the last divider', cardHeight(2) === 2 * ROW_SLOT - 1);
check('an empty card is nothing at all', cardHeight(0) === 0 && cardMarginBottom(0) === -BLOCK_GAP);

// ---- the invisible group above the first heading ----------------------------
{
  const groups = groupForDrag(items);
  check('there is always a group above the first heading',
    groups.length === 3 && groups[0].headingIndex === null && groups[0].rowIndices.length === 0);
  check('...and it costs the list nothing while it is empty', tops[0] === 0, String(tops[0]));
  const loose = [R('salt'), S('DOUGH'), R('a')];
  check('...and it holds the rows that really are above the first heading',
    groupForDrag(loose)[0].rowIndices.join() === '0', JSON.stringify(groupForDrag(loose)[0]));
}

// ---- a drop that changes nothing ------------------------------------------
for (const target of [2, 3]) {
  const plan = dragPlan(items, 2, target, heights(items));
  check(`dropping row 2 at ${target} moves nothing`,
    plan.displacement.every((d) => d === 0) && plan.dropTop === tops[2],
    JSON.stringify(plan.displacement));
}

// ---- b joins FILLING, below c ---------------------------------------------
{
  const plan = dragPlan(items, 2, 5, heights(items));
  check('the row that stayed in DOUGH does not move', plan.displacement[1] === 0);
  check('headings are never displaced by hand',
    plan.displacement[0] === 0 && plan.displacement[3] === 0);
  check('the row already in FILLING does not move either - the card comes up to meet it',
    plan.displacement[4] === 0, String(plan.displacement[4]));
  check('DOUGH loses a row, FILLING gains one',
    plan.cardHeights[1] === cardHeight(1) && plan.cardHeights[2] === cardHeight(2),
    JSON.stringify(plan.cardHeights));
}

// ---- b joins FILLING, above c ---------------------------------------------
{
  const plan = dragPlan(items, 2, 4, heights(items));
  check('landing above c pushes c down inside its own card',
    plan.displacement[4] === ROW_SLOT, String(plan.displacement[4]));
}

// ---- a section left empty --------------------------------------------------
{
  const single = [S('DOUGH'), R('a'), S('FILLING'), R('c')];
  const plan = dragPlan(single, 1, 4, heights(single));
  check('emptying a section collapses its card', plan.cardHeights[1] === 0, String(plan.cardHeights[1]));
  check('...and the empty card swallows the gap it would have left',
    plan.cardMarginBottoms[1] === -BLOCK_GAP, String(plan.cardMarginBottoms[1]));
}

// ---- out of every section, above the first heading -------------------------
{
  const plan = dragPlan(items, 2, 0, heights(items));
  check('a row can be dropped above the first heading', plan.cardHeights[0] === cardHeight(1),
    JSON.stringify(plan.cardHeights));
  const after = moveBlock(items, 2, 1, 0);
  check('...which pushes the first heading down by that row and its gap',
    plan.dropTop === 0
      && layoutTops(after, heights(after))[1] === cardHeight(1) + BLOCK_GAP,
    `${plan.dropTop} / ${layoutTops(after, heights(after))[1]}`);
}

// ---- the promise the drop animation makes ----------------------------------
// For every row, and every target, the place the plan says the row will land is
// the place the editor draws it once the new order is committed.
{
  const lists = [
    items,
    [R('salt'), S('DOUGH'), R('a'), R('b'), S('EMPTY'), S('FILLING'), R('c')],
    [R('one'), R('two'), R('three')],
    [S('ONLY'), R('a')],
  ];
  let worst = null;
  for (const list of lists) {
    const hs = heights(list);
    for (let from = 0; from < list.length; from += 1) {
      if (list[from].isSection) continue;
      const plans = dragPlans(list, from, hs);
      const offsets = dropOffsets(list, from, hs, plans);
      const start = layoutTops(list, hs)[from];
      for (let target = 0; target <= list.length; target += 1) {
        const after = moveBlock(list, from, 1, target);
        const landed = after.indexOf(list[from]);
        const actual = layoutTops(after, heights(after))[landed];
        if (plans[target].dropTop !== actual) {
          worst = `list ${list.map((i) => i.name).join(',')} from ${from} target ${target}: promised ${plans[target].dropTop}, drawn ${actual}`;
        }
        if (offsets[target] !== actual - start) {
          worst = `offset mismatch from ${from} target ${target}`;
        }
      }
    }
  }
  check('every promised landing is where the editor actually draws the row', worst === null, worst);
}

// ---- displacement never double-counts a resized card -----------------------
// Reconstructed the way the screen does it: flow moves an item by every card
// delta above it, and the plan moves it by the rest.
{
  const lists = [
    items,
    [R('salt'), S('DOUGH'), R('a'), R('b'), S('EMPTY'), S('FILLING'), R('c')],
  ];
  let worst = null;
  for (const list of lists) {
    const hs = heights(list);
    const before = layoutTops(list, hs);
    const groups = groupForDrag(list);
    for (let from = 0; from < list.length; from += 1) {
      if (list[from].isSection) continue;
      for (let target = 0; target <= list.length; target += 1) {
        const plan = dragPlan(list, from, target, hs);
        const after = layoutTops(list, hs, moveBlock(list.map((_, i) => i), from, 1, target));
        let flow = 0;
        groups.forEach((group, groupIndex) => {
          const drawn = (index) => before[index] + flow + plan.displacement[index];
          if (group.headingIndex !== null && drawn(group.headingIndex) !== after[group.headingIndex]) {
            worst = `heading ${group.headingIndex} from ${from} target ${target}: ${drawn(group.headingIndex)} vs ${after[group.headingIndex]}`;
          }
          for (const index of group.rowIndices) {
            if (index !== from && drawn(index) !== after[index]) {
              worst = `row ${index} from ${from} target ${target}: ${drawn(index)} vs ${after[index]}`;
            }
          }
          flow += plan.cardHeights[groupIndex] + plan.cardMarginBottoms[groupIndex]
            - cardHeight(group.rowIndices.length) - cardMarginBottom(group.rowIndices.length);
        });
      }
    }
  }
  check('flow and the plan together land every row exactly once', worst === null, worst);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
