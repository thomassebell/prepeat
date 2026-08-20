/**
 * Where every heading, card and row sits while ONE ingredient is being dragged
 * around the recipe editor (2026-08-20, Thomas: *"is there a way where tapping
 * the ingredient opens the edit sheet, but dragging it reorders the list"*).
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
 *   - `displacement` is what a row must be SHIFTED BY, given that its card is
 *     also being resized and React's own column layout therefore moves
 *     everything below that card on its own. Adding the full model delta here
 *     would count the card's resize twice, and the list would slide twice as
 *     far as it should. Headings always come out 0: a heading only ever moves
 *     because a card above it changed size, which flow already does.
 *   - `dropTop` is the FULL model position the dragged row will occupy, used by
 *     the floating copy under the finger, which is positioned absolutely and so
 *     gets no help from flow at all.
 *
 * The vocabulary matches `reorder.ts`: a TARGET is an insertion index in the
 * ORIGINAL array - "put the row immediately before item N", with n meaning "at
 * the end".
 */
import { moveBlock } from "./reorder";

/** A row's own height, matching `h-[56px]` on the row itself. */
export const ROW_HEIGHT = 56;
/**
 * What a row COSTS in a card: its height plus the hairline divider under it.
 * A card is then `57n - 1` tall, which clips the last row's divider against the
 * card's rounded bottom - so every row can carry a divider unconditionally and
 * none of them has to know whether it is currently last. That matters here far
 * more than it looks: "last" changes while a row is in flight.
 */
export const ROW_SLOT = ROW_HEIGHT + 1;
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

/** A card holding `rowCount` rows, with the last divider clipped. */
export function cardHeight(rowCount: number): number {
  return rowCount > 0 ? rowCount * ROW_SLOT - 1 : 0;
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
 * The top edge of every item in the flat list, for a given ORDER of it.
 * `headingHeights` is indexed by the item's own index, not by group, because a
 * long section name wraps and the headings are then not all the same height.
 */
export function layoutTops(
  items: DragItem[],
  headingHeights: number[],
  order: number[] = items.map((_, index) => index),
): number[] {
  const tops = new Array<number>(items.length).fill(0);
  let y = 0;
  let first = true;
  for (const group of groupOrder(order, items)) {
    if (group.headingIndex !== null) {
      if (!first) y += BLOCK_GAP;
      tops[group.headingIndex] = y;
      y += headingHeights[group.headingIndex] ?? 0;
      first = false;
    }
    const count = group.rowIndices.length;
    if (!first) y += BLOCK_GAP;
    group.rowIndices.forEach((index, position) => {
      tops[index] = y + position * ROW_SLOT;
    });
    y += cardHeight(count);
    // The negative bottom margin above, in arithmetic form.
    if (count === 0) y -= BLOCK_GAP;
    first = false;
  }
  return tops;
}

export interface DragPlan {
  /** By item index: how far to shift it, GIVEN that the cards resize too. */
  displacement: number[];
  /** By group index (same order as `groupForDrag`): the card's new height. */
  cardHeights: number[];
  /** By group index: the card's new bottom margin. */
  cardMarginBottoms: number[];
  /** Where the dragged row itself ends up, in full model coordinates. */
  dropTop: number;
}

/**
 * The whole layout, for one ingredient dragged from `from` and dropped at
 * `target`. `target === from` and `target === from + 1` both mean "nowhere",
 * and produce a plan of zeroes - the same rule as `movesAnything`.
 */
export function dragPlan(
  items: DragItem[],
  from: number,
  target: number,
  headingHeights: number[],
): DragPlan {
  const order = items.map((_, index) => index);
  const previewOrder = moveBlock(order, from, 1, target);
  const current = layoutTops(items, headingHeights, order);
  const preview = layoutTops(items, headingHeights, previewOrder);
  const currentGroups = groupOrder(order, items);
  const previewGroups = groupOrder(previewOrder, items);

  // How much each card has grown or shrunk, running down the list. Flow applies
  // this to everything below the card by itself, so it comes back OUT of the
  // per-item displacement below.
  const above: number[] = [];
  let running = 0;
  previewGroups.forEach((group, index) => {
    above.push(running);
    const before =
      cardHeight(currentGroups[index].rowIndices.length) +
      cardMarginBottom(currentGroups[index].rowIndices.length);
    const after =
      cardHeight(group.rowIndices.length) +
      cardMarginBottom(group.rowIndices.length);
    running += after - before;
  });

  const displacement = new Array<number>(items.length).fill(0);
  currentGroups.forEach((group, index) => {
    if (group.headingIndex !== null) {
      displacement[group.headingIndex] = 0;
    }
    for (const item of group.rowIndices) {
      displacement[item] = preview[item] - current[item] - above[index];
    }
  });

  return {
    displacement,
    cardHeights: previewGroups.map((group) => cardHeight(group.rowIndices.length)),
    cardMarginBottoms: previewGroups.map((group) =>
      cardMarginBottom(group.rowIndices.length),
    ),
    dropTop: preview[from],
  };
}

/**
 * Every plan the drag could need, worked out ONCE when the finger lifts the row
 * rather than per frame. The gesture then only ever reads plain numbers - the
 * same rule the reorder sheet follows, for the same reason: a drag that calls
 * back into JavaScript mid-gesture stutters.
 */
export function dragPlans(
  items: DragItem[],
  from: number,
  headingHeights: number[],
): DragPlan[] {
  const plans: DragPlan[] = [];
  for (let target = 0; target <= items.length; target += 1) {
    plans.push(dragPlan(items, from, target, headingHeights));
  }
  return plans;
}

/**
 * How far the finger has to have travelled for each target to be the one - the
 * dragged row's own movement, measured from where it started. Positions the
 * floating copy on release too, so it lands in the gap the list has opened
 * rather than snapping there after the fact.
 */
export function dropOffsets(
  items: DragItem[],
  from: number,
  headingHeights: number[],
  plans: DragPlan[],
): number[] {
  const start = layoutTops(items, headingHeights)[from];
  return plans.map((plan) => plan.dropTop - start);
}
