/**
 * Where every heading, card and row sits while something is being dragged
 * around the recipe editor (2026-08-20, Thomas: *"is there a way where tapping
 * the ingredient opens the edit sheet, but dragging it reorders the list"*, and
 * then *"can you include section as well"*).
 *
 * The reorder SHEET flattens the list into equal slots, which is what makes its
 * arithmetic a single multiplication (`src/lib/reorder.ts`). Dragging in place
 * cannot flatten anything: the rows stay inside their section cards, so a row
 * leaving section A shrinks A's card, a row entering B grows B's, an emptied
 * section loses its card entirely, and every heading below both moves. This
 * file is that geometry, and it lives apart from the component for the same two
 * reasons as `reorder.ts`: nothing here imports React Native, so
 * `scripts/check-ingredient-drag.mjs` can run the REAL functions rather than a
 * mirror of them, and index arithmetic that looks obviously right is exactly
 * the kind that is off by one.
 *
 * TWO COORDINATE ANSWERS COME OUT OF HERE AND THEY ARE NOT THE SAME NUMBER:
 *
 *   - `displacement` is what an item must be SHIFTED BY, given that the cards
 *     are being resized too and React's own column layout therefore moves
 *     everything below a resized card on its own. Adding the full model delta
 *     here would count that resize twice, and the list would slide twice as far
 *     as it should. When a single ROW moves this makes every heading come out
 *     exactly 0 - a heading only moves because a card above it changed size.
 *     When a whole SECTION moves it is the other way round: no card changes
 *     size, flow does nothing, and every displacement is the full distance.
 *   - `dropTop` is the FULL model position the dragged block will occupy, used
 *     by the floating copy under the finger, which is positioned absolutely and
 *     so gets no help from flow at all.
 *
 * The vocabulary matches `reorder.ts`: a TARGET is an insertion index in the
 * ORIGINAL array - "put the block immediately before item N", with n meaning
 * "at the end".
 */
import { blockSizeAt, moveBlock, validTargets } from "./reorder";

/** An ingredient row's height, matching `h-[56px]` on the row itself, and the
 *  fallback for any row that has not been measured yet. */
export const ROW_HEIGHT = 56;
/** The hairline under a row. It belongs to the row rather than sitting between
 *  rows, so that it travels with it; a card is a pixel shorter than its rows
 *  add up to, which clips the last one against the card's rounded bottom. No
 *  row has to know whether it is currently last - and "last" changes while a
 *  row is in flight. */
export const DIVIDER = 1;
/** What a fixed-height ingredient row costs in a card. */
export const ROW_SLOT = ROW_HEIGHT + DIVIDER;
/** The `gap-layout-small` between every heading and card in the builder. */
export const BLOCK_GAP = 16;

export interface DragItem {
  isSection?: boolean;
}

export interface DragGroup {
  /** Index of this group's heading in the flat list, or null for the rows that
   *  sit above the first heading. */
  headingIndex: number | null;
  /** Indices of this group's ingredient rows, in order. */
  rowIndices: number[];
}

/**
 * Group the flat list the way the editor draws it - but ALWAYS opening with an
 * unsectioned group, even when it is empty and the list starts with a heading.
 *
 * That empty first group is not tidiness, it is a destination: dropping an
 * ingredient ABOVE the first heading is how you take it out of every section,
 * and a card that does not exist cannot open a gap for it. It draws as nothing
 * (height 0, and a negative bottom margin so it does not even leave a gap
 * behind), so an idle list looks exactly as it did before.
 */
export function groupForDrag(items: DragItem[]): DragGroup[] {
  return groupOrder(
    items.map((_, index) => index),
    items,
  );
}

function groupOrder(order: number[], items: DragItem[]): DragGroup[] {
  const groups: DragGroup[] = [{ headingIndex: null, rowIndices: [] }];
  for (const index of order) {
    if (items[index]?.isSection) {
      groups.push({ headingIndex: index, rowIndices: [] });
    } else {
      groups[groups.length - 1].rowIndices.push(index);
    }
  }
  return groups;
}

/**
 * A card holding rows of these heights, with the last divider clipped.
 *
 * TAKES THE HEIGHTS RATHER THAN A COUNT, and that is what let the instruction
 * list use this file too (2026-08-20). An ingredient row is always 56 tall; an
 * instruction wraps onto as many lines as it needs, so a card of three of them
 * is not three of anything.
 */
export function cardHeight(rowSizes: number[]): number {
  if (rowSizes.length === 0) return 0;
  return rowSizes.reduce((total, size) => total + size + DIVIDER, 0) - DIVIDER;
}

/**
 * An empty card swallows the gap that would follow it, so an empty section is
 * a heading with ordinary spacing under it rather than a heading with a 16px
 * hole - and so the invisible leading group above the first heading costs
 * nothing at all.
 */
export function cardMarginBottom(rowCount: number): number {
  return rowCount > 0 ? 0 : -BLOCK_GAP;
}

/**
 * How tall each item is drawn, indexed by the item's own index: a heading's own
 * height, a row's own height, both without the divider. MEASURED by the screen
 * rather than assumed - a long section name wraps, and an instruction wraps
 * further.
 */
export type ItemSizes = number[];

const sizeOf = (sizes: ItemSizes, index: number) => sizes[index] ?? ROW_HEIGHT;

/** The top edge of every item in the flat list, for a given ORDER of it. */
export function layoutTops(
  items: DragItem[],
  sizes: ItemSizes,
  order: number[] = items.map((_, index) => index),
): number[] {
  const tops = new Array<number>(items.length).fill(0);
  let y = 0;
  let first = true;
  for (const group of groupOrder(order, items)) {
    if (group.headingIndex !== null) {
      if (!first) y += BLOCK_GAP;
      tops[group.headingIndex] = y;
      y += sizeOf(sizes, group.headingIndex);
      first = false;
    }
    const count = group.rowIndices.length;
    if (!first) y += BLOCK_GAP;
    let rowY = y;
    for (const index of group.rowIndices) {
      tops[index] = rowY;
      rowY += sizeOf(sizes, index) + DIVIDER;
    }
    y += cardHeight(group.rowIndices.map((index) => sizeOf(sizes, index)));
    // The negative bottom margin above, in arithmetic form.
    if (count === 0) y -= BLOCK_GAP;
    first = false;
  }
  return tops;
}

export interface DragPlan {
  /** By group index: how far the whole unit - heading, card and everything in
   *  it - has to travel. Zero for every group when a single ROW is moving. */
  groupDisplacement: number[];
  /** By item index: how far to shift a row INSIDE its card, given that the
   *  cards resize too. Zero for every row when a SECTION is moving. */
  displacement: number[];
  /** By group index (same order as `groupForDrag`): the card's new height. */
  cardHeights: number[];
  /** By group index: the card's new bottom margin. */
  cardMarginBottoms: number[];
  /** Where the dragged block's top edge ends up, in full model coordinates. */
  dropTop: number;
}

/**
 * The whole layout, for the block of `size` items starting at `from`, dropped
 * at `target`.
 *
 * ONE ROW AND A WHOLE SECTION ARE THE SAME CALCULATION, and it is worth saying
 * why, because they look like different features (2026-08-20, when sections
 * learned to move in place too). A row leaving its card changes two cards'
 * HEIGHTS and moves nothing else by hand. A section moving takes its heading
 * and its card with it, so no card changes height at all and every element
 * between here and there moves by the block's own height. Both fall out of the
 * same two questions - where is everything now, where would everything be - and
 * a single subtraction between them. Only the answers differ.
 */
export function dragPlan(
  items: DragItem[],
  from: number,
  size: number,
  target: number,
  sizes: ItemSizes,
): DragPlan {
  const order = items.map((_, index) => index);
  const previewOrder = moveBlock(order, from, size, target);
  const current = layoutTops(items, sizes, order);
  const preview = layoutTops(items, sizes, previewOrder);
  const cardOf = (group: DragGroup) =>
    cardHeight(group.rowIndices.map((index) => sizeOf(sizes, index)));
  const currentGroups = groupOrder(order, items);
  const previewGroups = groupOrder(previewOrder, items);

  // ⚠️ PAIRED BY HEADING, NOT BY POSITION. A row move leaves the groups in the
  // same order, so zipping them index by index happened to work; moving a
  // SECTION reorders them, and zipping would then compare DOUGH with FILLING
  // and hand one card the other's height.
  const previewByHeading = new Map<number | null, DragGroup>(
    previewGroups.map((group) => [group.headingIndex, group]),
  );
  const paired = currentGroups.map(
    (group) => previewByHeading.get(group.headingIndex) ?? group,
  );

  // How much each card has grown or shrunk, running down the list IN THE ORDER
  // THEY ARE DRAWN IN - which is the current order, because the reordering has
  // not happened yet. React's own column layout applies this to everything
  // below each card by itself, so it comes back OUT of the displacements below.
  // For a section move every one of these is zero: no card changes size, so
  // flow contributes nothing and the block's neighbours have to be moved by
  // hand, every pixel of it.
  const above: number[] = [];
  let running = 0;
  currentGroups.forEach((group, index) => {
    above.push(running);
    const before = cardOf(group) + cardMarginBottom(group.rowIndices.length);
    const after =
      cardOf(paired[index]) + cardMarginBottom(paired[index].rowIndices.length);
    running += after - before;
  });

  // ── A SECTION IN FLIGHT MOVES AS A UNIT ────────────────────────────────
  // Not a special case for its own sake: a card is an opaque box that CLIPS its
  // contents, so a card that stays put while its rows slide out of it does not
  // draw a section moving, it draws rows disappearing. So when the thing in the
  // air is a section, nothing resizes and nothing shifts inside a card - whole
  // units travel, and each one travels as far as its first element does.
  //
  // ⚠️ ONE CASE THIS DELIBERATELY DOES NOT ANIMATE. Drop a section above rows
  // that were sitting above the first heading and those rows become part of it,
  // because grouping is positional. In flight they hold still and keep their
  // own card; they join on release. Showing it honestly would mean re-homing
  // rows mid-gesture, which is a bigger promise than a drag preview should make
  // - and the outcome is the same either way. Checked as a known deviation
  // rather than left to be discovered.
  if (items[from]?.isSection) {
    return {
      groupDisplacement: currentGroups.map((group) => {
        const first = group.headingIndex ?? group.rowIndices[0];
        return first === undefined ? 0 : preview[first] - current[first];
      }),
      displacement: new Array<number>(items.length).fill(0),
      cardHeights: currentGroups.map(cardOf),
      cardMarginBottoms: currentGroups.map((group) =>
        cardMarginBottom(group.rowIndices.length),
      ),
      dropTop: preview[from],
    };
  }

  const displacement = new Array<number>(items.length).fill(0);
  currentGroups.forEach((group, index) => {
    for (const item of group.rowIndices) {
      displacement[item] = preview[item] - current[item] - above[index];
    }
  });

  return {
    // A row moving never moves a whole unit: the cards resize instead, and
    // React's column layout carries everything below them.
    groupDisplacement: currentGroups.map(() => 0),
    displacement,
    cardHeights: paired.map(cardOf),
    cardMarginBottoms: paired.map((group) =>
      cardMarginBottom(group.rowIndices.length),
    ),
    dropTop: preview[from],
  };
}

/** How many items travel together when the item at `index` is picked up: a
 *  heading takes its rows, anything else moves alone. The rule itself lives in
 *  `reorder.ts`, where the sheet already uses it. */
export function blockSizeFor(items: DragItem[], index: number): number {
  return blockSizeAt(
    items.map((item, i) => ({ key: String(i), isSection: item.isSection })),
    index,
  );
}

export interface DragPlanSet {
  /** The insertion indices this block may legally land on, ascending. */
  targets: number[];
  /** One plan per entry in `targets`. */
  plans: DragPlan[];
  /** How far the finger must travel for each entry in `targets`. */
  offsets: number[];
}

/**
 * Every plan the drag could need, worked out ONCE when the block is lifted
 * rather than per frame. The gesture then only ever reads plain numbers - the
 * same rule the reorder sheet follows, for the same reason: a drag that calls
 * back into JavaScript mid-gesture stutters.
 *
 * Which landings are legal is NOT decided here: it is `validTargets` in
 * `reorder.ts`, unchanged and already checked, which lets a single row go
 * anywhere and a section only onto a section boundary. Dropping a section
 * INSIDE another one would silently re-home the rows below the drop point,
 * which is Thomas's 2026-08-07 decision and has nothing to do with geometry.
 */
export function dragPlans(
  items: DragItem[],
  from: number,
  size: number,
  sizes: ItemSizes,
): DragPlanSet {
  const targets = validTargets(
    items.map((item, index) => ({ key: String(index), isSection: item.isSection })),
    from,
    size,
  );
  const plans = targets.map((target) =>
    dragPlan(items, from, size, target, sizes),
  );
  const start = layoutTops(items, sizes)[from];
  return { targets, plans, offsets: plans.map((plan) => plan.dropTop - start) };
}

/**
 * How tall the thing in the air is: one row, or a heading and its card - and,
 * for an empty section, just the heading with nothing under it.
 */
export function blockHeight(
  items: DragItem[],
  from: number,
  size: number,
  sizes: ItemSizes,
): number {
  if (!items[from]?.isSection) return sizeOf(sizes, from);
  const carried: number[] = [];
  for (let index = from + 1; index < from + size; index += 1) {
    carried.push(sizeOf(sizes, index));
  }
  const heading = sizeOf(sizes, from);
  return carried.length > 0
    ? heading + BLOCK_GAP + cardHeight(carried)
    : heading;
}
