/**
 * The arithmetic behind drag-to-reorder, kept apart from the sheet that draws
 * it (2026-08-07, when sections learned to move as a group).
 *
 * WHY IT LIVES HERE. Two reasons, both learned the hard way on this project:
 * the sheet imports React Native so nothing in it can be run in a test, and
 * this is exactly the kind of index arithmetic that looks obviously right and
 * is off by one. With zero runtime imports, `npx tsc --ignoreConfig` on this
 * file produces a module node can import, so the REAL functions can be
 * exercised rather than a mirror of them - the trick that proved the import
 * parser on 2026-08-04, and the answer to the reconciler lesson that a mirror
 * written from the same wrong model agrees with the bug.
 *
 * The vocabulary, because two different indices are in play and confusing them
 * is the whole risk:
 *   - a SLOT is a position on screen, 0..n-1, every item the same height.
 *   - a TARGET is an insertion index in the ORIGINAL array: "put the moving
 *     unit immediately before item N", with n meaning "at the end".
 */

export interface ReorderableItem {
  key: string;
  isSection?: boolean;
}

/**
 * How many items move together when the item at `index` is dragged. A heading
 * carries every row that follows it up to the next heading; anything else moves
 * alone (Thomas, 2026-08-07).
 */
export function blockSizeAt(items: ReorderableItem[], index: number): number {
  if (!items[index]?.isSection) return 1;
  let size = 1;
  while (index + size < items.length && !items[index + size].isSection) {
    size += 1;
  }
  return size;
}

/**
 * Where the dragged unit may land, as TARGETS (see above), ascending.
 *
 * A single row may go anywhere: dropping an ingredient into another section is
 * how you assign it to one, so that freedom is the feature.
 *
 * A SECTION may only land on a section boundary, and that restriction IS
 * Thomas's 2026-08-07 decision rather than an implementation convenience.
 * Sections are positional, so a group dropped inside another section would
 * silently re-home the rows below the drop point - drop FILLING between flour
 * and water and water becomes part of FILLING, untouched by anyone. Snapping to
 * boundaries makes that unreachable rather than merely unlikely.
 */
export function validTargets(
  items: ReorderableItem[],
  from: number,
  size: number,
): number[] {
  if (size === 1 && !items[from]?.isSection) {
    const all: number[] = [];
    for (let i = 0; i <= items.length; i += 1) all.push(i);
    return all;
  }
  const targets = [0];
  for (let i = 0; i < items.length; i += 1) {
    // Inside the moving block is not a destination, it is where we came from.
    if (i >= from && i < from + size) continue;
    if (items[i].isSection) targets.push(i);
  }
  targets.push(items.length);
  const seen = new Set<number>();
  return targets
    .filter((t) => (seen.has(t) ? false : (seen.add(t), true)))
    .sort((a, b) => a - b);
}

/**
 * The SLOT the moving block's top edge would occupy if it landed at `target`.
 * Anything the block passes closes up behind it, so a destination below the
 * block loses the block's own length.
 */
export function topSlotFor(
  target: number,
  from: number,
  size: number,
): number {
  if (target <= from) return target;
  if (target >= from + size) return target - size;
  return from;
}

/** `topSlotFor` over a whole target list, so the drag worklet only ever reads
 * plain numbers and never has to call back into JavaScript. */
export function targetTopSlots(
  targets: number[],
  from: number,
  size: number,
): number[] {
  return targets.map((target) => topSlotFor(target, from, size));
}

/** True when landing on `target` would actually change the order. */
export function movesAnything(
  target: number,
  from: number,
  size: number,
): boolean {
  return target !== from && target !== from + size;
}

/**
 * Apply the move: lift `size` items from `from` and re-insert them before the
 * original item at `target`.
 */
export function moveBlock<T>(items: T[], from: number, size: number, target: number): T[] {
  const block = items.slice(from, from + size);
  const rest = [...items.slice(0, from), ...items.slice(from + size)];
  // `target` indexes the ORIGINAL array, so a destination past the block has to
  // lose the block's own length once the block is out.
  rest.splice(target > from ? target - size : target, 0, ...block);
  return rest;
}
