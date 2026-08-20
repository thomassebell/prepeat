import { useEffect, useRef } from "react";
import type { SwipeableMethods } from "react-native-gesture-handler/ReanimatedSwipeable";

/**
 * One open swipe row at a time, everywhere in the app (Thomas, 2026-08-20:
 * *"it is possible to trigger the edit menu on multiple items at once, all over
 * the app. I think if you trigger an edit menu, the other open edit menu should
 * close."*).
 *
 * WHY A MODULE-LEVEL VARIABLE RATHER THAN CONTEXT. The rule is "one in the
 * whole app", not "one per list": a shopping row and a plan row are drawn by
 * different components on different screens and would each keep their own
 * context. There is exactly one finger, so there is exactly one open row, and a
 * single module-scoped reference says precisely that. Nothing here re-renders
 * anything, so it costs nothing to read.
 *
 * ⚠️ THE IDENTITY IS THE REF OBJECT, not a callback. Callbacks are rebuilt on
 * every render, so a registry keyed on them would think each render was a
 * different row and would close the row the user is holding.
 */
type SwipeRef = { current: SwipeableMethods | null };

let openRow: SwipeRef | null = null;

/** Called as another row starts to open: close whatever was open before it. */
function openExclusively(row: SwipeRef) {
  if (openRow !== null && openRow !== row) openRow.current?.close();
  openRow = row;
}

/** Called when a row closes - by hand, by its own buttons, or by unmounting. */
function forget(row: SwipeRef) {
  if (openRow === row) openRow = null;
}

/**
 * The ref to hand to `ReanimatedSwipeable`, plus the two handlers that keep the
 * app to one open row.
 *
 * Wire BOTH open handlers: `onSwipeableOpenStartDrag` is what makes the old row
 * close the moment a new swipe begins rather than when it finishes, and
 * `onSwipeableWillOpen` catches a row opened in code - the swipe hint opens one
 * that way, and it must count too.
 */
export function useExclusiveSwipe() {
  const swipeable = useRef<SwipeableMethods>(null);
  // A row can leave the screen while open: deleted, or the screen navigated
  // away from. Without this the registry keeps pointing at it, and the next row
  // to open would "close" something that no longer exists instead of noticing
  // that nothing is open.
  useEffect(() => () => forget(swipeable), []);
  return {
    swipeable,
    swipeOpening: () => openExclusively(swipeable),
    swipeClosed: () => forget(swipeable),
  };
}
