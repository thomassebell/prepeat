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
  ROW_HEIGHT,
  ROW_SLOT,
  BLOCK_GAP,
  groupForDrag,
  cardHeight,
  cardMarginBottom,
  layoutTops,
  dragPlan,
  dragPlans,
  blockSizeFor,
  blockHeight,
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
// How tall each item is drawn. An ingredient row is 56; a heading is one line
// of header/display-6 beside a 24px handle. Instructions pass real measured
// heights instead, which is the whole reason this takes an array.
const heights = (items) => items.map((item) => (item.isSection ? H : ROW_HEIGHT));

// DOUGH[a, b]  FILLING[c]
const items = [S('DOUGH'), R('a'), R('b'), S('FILLING'), R('c')];
const tops = layoutTops(items, heights(items));

// ---- the idle layout, worked out by hand -----------------------------------
check('the first heading sits at the top', tops[0] === 0, String(tops[0]));
check('its card clears the heading by one gap', tops[1] === H + BLOCK_GAP, String(tops[1]));
check('the second row is one slot below the first', tops[2] === tops[1] + ROW_SLOT, String(tops[2]));
check('the second heading clears the card by one gap',
  tops[3] === tops[1] + cardHeight([ROW_HEIGHT,ROW_HEIGHT]) + BLOCK_GAP, String(tops[3]));
check('a card holding two rows clips the last divider', cardHeight([ROW_HEIGHT,ROW_HEIGHT]) === 2 * ROW_SLOT - 1);
check('an empty card is nothing at all', cardHeight([]) === 0 && cardMarginBottom(0) === -BLOCK_GAP);

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
  const plan = dragPlan(items, 2, 1, target, heights(items));
  check(`dropping row 2 at ${target} moves nothing`,
    plan.displacement.every((d) => d === 0) && plan.dropTop === tops[2],
    JSON.stringify(plan.displacement));
}

// ---- b joins FILLING, below c ---------------------------------------------
{
  const plan = dragPlan(items, 2, 1, 5, heights(items));
  check('the row that stayed in DOUGH does not move', plan.displacement[1] === 0);
  check('headings are never displaced by hand',
    plan.displacement[0] === 0 && plan.displacement[3] === 0);
  check('the row already in FILLING does not move either - the card comes up to meet it',
    plan.displacement[4] === 0, String(plan.displacement[4]));
  check('DOUGH loses a row, FILLING gains one',
    plan.cardHeights[1] === cardHeight([ROW_HEIGHT]) && plan.cardHeights[2] === cardHeight([ROW_HEIGHT,ROW_HEIGHT]),
    JSON.stringify(plan.cardHeights));
}

// ---- b joins FILLING, above c ---------------------------------------------
{
  const plan = dragPlan(items, 2, 1, 4, heights(items));
  check('landing above c pushes c down inside its own card',
    plan.displacement[4] === ROW_SLOT, String(plan.displacement[4]));
}

// ---- a section left empty --------------------------------------------------
{
  const single = [S('DOUGH'), R('a'), S('FILLING'), R('c')];
  const plan = dragPlan(single, 1, 1, 4, heights(single));
  check('emptying a section collapses its card', plan.cardHeights[1] === 0, String(plan.cardHeights[1]));
  check('...and the empty card swallows the gap it would have left',
    plan.cardMarginBottoms[1] === -BLOCK_GAP, String(plan.cardMarginBottoms[1]));
}

// ---- out of every section, above the first heading -------------------------
{
  const plan = dragPlan(items, 2, 1, 0, heights(items));
  check('a row can be dropped above the first heading', plan.cardHeights[0] === cardHeight([ROW_HEIGHT]),
    JSON.stringify(plan.cardHeights));
  const after = moveBlock(items, 2, 1, 0);
  check('...which pushes the first heading down by that row and its gap',
    plan.dropTop === 0
      && layoutTops(after, heights(after))[1] === cardHeight([ROW_HEIGHT]) + BLOCK_GAP,
    `${plan.dropTop} / ${layoutTops(after, heights(after))[1]}`);
}

// ---- a whole section in the air --------------------------------------------
{
  check('a heading takes its own rows with it', blockSizeFor(items, 0) === 3, String(blockSizeFor(items, 0)));
  check('...and an ingredient still travels alone', blockSizeFor(items, 1) === 1);
  check('an empty section is just its heading',
    blockSizeFor([S('EMPTY'), S('DOUGH'), R('a')], 0) === 1);

  const { targets } = dragPlans(items, 0, 3, heights(items));
  // 0 is where it already is - `movesAnything` rejects it on release, and
  // keeping it means the block always has somewhere to snap back to.
  check('a section may only land on a section boundary',
    targets.join() === '0,3,5', targets.join());

  const plan = dragPlan(items, 0, 3, 5, heights(items));
  check('moving a section resizes no card at all',
    plan.cardHeights[1] === cardHeight([ROW_HEIGHT,ROW_HEIGHT]) && plan.cardHeights[2] === cardHeight([ROW_HEIGHT]),
    JSON.stringify(plan.cardHeights));
  check('...and shifts nothing inside a card either',
    plan.displacement.every((d) => d === 0), JSON.stringify(plan.displacement));
  check('...so the section it passes travels as one unit, every pixel by hand',
    plan.groupDisplacement[2] === -(H + BLOCK_GAP + cardHeight([ROW_HEIGHT,ROW_HEIGHT]) + BLOCK_GAP)
      && plan.groupDisplacement[1] === H + BLOCK_GAP + cardHeight([ROW_HEIGHT]) + BLOCK_GAP,
    JSON.stringify(plan.groupDisplacement));
  check('...by exactly the height of the block in the air, both ways',
    plan.groupDisplacement[2] === -(blockHeight(items, 0, 3, heights(items)) + BLOCK_GAP),
    JSON.stringify(plan.groupDisplacement));
  check('the block is as tall as its heading, its gap and its card',
    blockHeight(items, 0, 3, heights(items)) === H + BLOCK_GAP + cardHeight([ROW_HEIGHT,ROW_HEIGHT]),
    String(blockHeight(items, 0, 3, heights(items))));
  check('an empty section in the air is just a heading',
    blockHeight([S('EMPTY'), S('D'), R('a')], 0, 1, heights([S('EMPTY'), S('D'), R('a')])) === H);
}

// ---- a row move never moves a whole unit -----------------------------------
{
  const plan = dragPlan(items, 2, 1, 5, heights(items));
  check('a row moving leaves every unit where it is - the cards resize instead',
    plan.groupDisplacement.every((d) => d === 0), JSON.stringify(plan.groupDisplacement));
}

// ---- the one thing the flight deliberately does not show -------------------
{
  // Grouping is positional, so a section dropped above loose leading rows
  // swallows them. In flight they hold still; they join on release.
  const loose = [R('salt'), S('DOUGH'), R('a')];
  const plan = dragPlan(loose, 1, 2, 0, heights(loose));
  const after = moveBlock(loose, 1, 2, 0);
  check('KNOWN: loose leading rows keep their own card in flight',
    plan.cardHeights[0] === cardHeight([ROW_HEIGHT]), JSON.stringify(plan.cardHeights));
  check('...and are absorbed by the section only once it is dropped',
    after.map((i) => i.name).join() === 'DOUGH,a,salt', after.map((i) => i.name).join());
}

// ---- rows that are not all the same height (the instruction list) ----------
{
  const steps = [R('one'), R('two'), R('three')];
  const sizes = [40, 96, 62]; // one line, three lines, two
  const tops = layoutTops(steps, sizes);
  check('a taller row pushes the next one further down, not by a constant',
    tops[0] === 0 && tops[1] === 41 && tops[2] === 138, tops.join());
  check('the card is its rows plus their dividers, less the clipped last one',
    cardHeight(sizes) === 40 + 96 + 62 + 2, String(cardHeight(sizes)));

  let worst = null;
  for (let from = 0; from < steps.length; from += 1) {
    const { targets, plans, offsets } = dragPlans(steps, from, 1, sizes);
    const start = layoutTops(steps, sizes)[from];
    targets.forEach((target, position) => {
      const order = moveBlock([0, 1, 2], from, 1, target);
      const actual = layoutTops(steps, sizes, order)[from];
      if (plans[position].dropTop !== actual) {
        worst = `from ${from} target ${target}: promised ${plans[position].dropTop}, drawn ${actual}`;
      }
      if (offsets[position] !== actual - start) worst = `offset from ${from} target ${target}`;
    });
  }
  check('...and a drag still lands where it was promised, every from and to',
    worst === null, worst);
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
    [S('A'), R('a1'), R('a2'), S('B'), S('C'), R('c1')],
  ];
  let worst = null;
  for (const list of lists) {
    const hs = heights(list);
    for (let from = 0; from < list.length; from += 1) {
      const size = blockSizeFor(list, from);
      const { targets, plans, offsets } = dragPlans(list, from, size, hs);
      const start = layoutTops(list, hs)[from];
      targets.forEach((target, slot) => {
        const after = moveBlock(list, from, size, target);
        const landed = after.indexOf(list[from]);
        const actual = layoutTops(after, heights(after))[landed];
        if (plans[slot].dropTop !== actual) {
          worst = `list ${list.map((i) => i.name).join(',')} from ${from} size ${size} target ${target}: promised ${plans[slot].dropTop}, drawn ${actual}`;
        }
        if (offsets[slot] !== actual - start) {
          worst = `offset mismatch from ${from} target ${target}`;
        }
      });
    }
  }
  check('every promised landing is where the editor actually draws it - rows AND sections',
    worst === null, worst);
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
      const size = blockSizeFor(list, from);
      for (const target of dragPlans(list, from, size, hs).targets) {
        const plan = dragPlan(list, from, size, target, hs);
        const after = layoutTops(list, hs, moveBlock(list.map((_, i) => i), from, size, target));
        let flow = 0;
        groups.forEach((group, groupIndex) => {
          const drawn = (index) =>
            before[index] + flow + plan.groupDisplacement[groupIndex] + plan.displacement[index];
          const moving = (index) => index >= from && index < from + size;
          if (group.headingIndex !== null && !moving(group.headingIndex)
              && drawn(group.headingIndex) !== after[group.headingIndex]) {
            worst = `heading ${group.headingIndex} from ${from} target ${target}: ${drawn(group.headingIndex)} vs ${after[group.headingIndex]}`;
          }
          for (const index of group.rowIndices) {
            if (!moving(index) && drawn(index) !== after[index]) {
              worst = `row ${index} from ${from} target ${target}: ${drawn(index)} vs ${after[index]}`;
            }
          }
          flow += plan.cardHeights[groupIndex] + plan.cardMarginBottoms[groupIndex]
            - cardHeight(group.rowIndices.map((i) => hs[i]))
            - cardMarginBottom(group.rowIndices.length);
        });
      }
    }
  }
  check('flow and the plan together land every row exactly once', worst === null, worst);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
