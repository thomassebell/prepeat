import { useLayoutEffect, useRef, useState } from "react";
import { View, type AccessibilityActionEvent } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { MaterialIcons } from "@expo/vector-icons";
import Animated, {
  measure,
  runOnJS,
  scrollTo,
  useFrameCallback,
  useScrollViewOffset,
  useSharedValue,
  withTiming,
  type AnimatedRef,
  type SharedValue,
} from "react-native-reanimated";

import { ds } from "@/constants/ds";
import { t } from "@/lib/i18n";
import {
  DIVIDER,
  dragPlans,
  type DragItem,
  type DragPlan,
} from "@/lib/ingredient-drag-layout";
import { movesAnything, validTargets } from "@/lib/reorder";

/** How long the list takes to open a gap. The reorder sheet used 140; a little
 *  slower reads better when whole cards are resizing with it. */
export const MOVE_MS = 160;
/** How long a hold arms a drag that did not start on a grip. */
export const LIFT_MS = 200;
/** How long the lifted block takes to settle into the gap on release. */
export const DROP_MS = 140;
/** How close to the top or bottom edge the finger has to be before the page
 *  starts scrolling under it. */
const EDGE = 90;
/** Pixels per frame at the very edge of the screen, tapering to nothing at the
 *  inner boundary of the edge zone. */
const EDGE_SPEED = 14;

/**
 * Dragging something around a list that stays where it is drawn – shared by the
 * recipe editor's ingredients and its instructions (2026-08-20).
 *
 * IT IS SHARED RATHER THAN COPIED, and that is not tidiness. This project has
 * already paid for the alternative: `isSection` was dropped at six separate
 * sites because each one rebuilt the same shape by hand, and it passed
 * typecheck, lint and two device builds every time. Everything here is common
 * to both lists – the plans, the gesture, the page scrolling itself under the
 * finger, the cleanup that has to happen in the commit that reorders. What
 * differs between them is only what a row LOOKS like, and that stays in the two
 * list components.
 *
 * The geometry is in `src/lib/ingredient-drag-layout.ts`, with
 * `scripts/check-ingredient-drag.mjs` running the real functions.
 *
 * NOTE, carried here from the editor screen when its rows moved into these
 * components: SwipeHint is deliberately absent from both lists (2026-08-07).
 * Its job was to advertise the swipe; the whole row opens the editor on a tap,
 * and deleting lives inside that editor beside Done (Thomas: *"put the delete
 * function on the edit sheet instead"*), so there are no hidden actions left to
 * hint at. The swipe still works underneath for anyone used to it. SwipeHint
 * stays in use on the shopping list, the plan and the recipe DETAIL screen,
 * where a row tap already means something else.
 */
export function useInPlaceDrag({
  items,
  scrollRef,
  onReorder,
  onDragChange,
}: {
  /** Only whether each entry is a section heading; the rest is the list's own. */
  items: DragItem[];
  /** The page's scroll view, so a drag can reach what is off-screen. */
  scrollRef: AnimatedRef<Animated.ScrollView>;
  onReorder: (from: number, size: number, target: number) => void;
  /** Freezes the page's own scrolling while something is in the air. */
  onDragChange: (dragging: boolean) => void;
}) {
  // How tall every item is DRAWN, filled in by the list as each one lays out.
  // Measured rather than assumed: a section name wraps onto two lines, and an
  // instruction onto five.
  const sizes = useRef<number[]>([]);
  // The legal landings for the block currently in the air, on the JS side. The
  // gesture reads its own copy in a shared value; this one is for the drop.
  const targets = useRef<number[]>([]);
  // Two gestures can reach the same block – its grip and the hold on its body –
  // and a finger that rests on a grip arms both. They agree about everything,
  // so the first one wins and the second is a no-op; without this the drop
  // would be applied twice.
  const inFlight = useRef(false);

  const [lifted, setLifted] = useState<{
    from: number;
    size: number;
    top: number;
  } | null>(null);
  const [dropCount, setDropCount] = useState(0);

  const dragFrom = useSharedValue(-1);
  const dragSize = useSharedValue(0);
  const dragY = useSharedValue(0);
  /** Which entry of `plans` is currently the destination – NOT a target index. */
  const slot = useSharedValue(-1);
  const plans = useSharedValue<DragPlan[]>([]);
  const offsets = useSharedValue<number[]>([]);
  // Everything the auto-scroll needs, all of it on the UI thread.
  const fingerY = useSharedValue(0);
  const travelled = useSharedValue(0);
  const scrolledAtStart = useSharedValue(0);
  const scrollOffset = useScrollViewOffset(scrollRef);

  // ⚠️ EVERY WRITE TO A SHARED VALUE GOES THROUGH ONE OF THESE, and they carry
  // the "worklet" directive – the same shape as the reorder sheet, for the same
  // reason: the React Compiler forbids a child mutating a shared value it was
  // handed as a prop, so the rows are given setters rather than the values.
  const armDrag = (from: number, size: number) => {
    "worklet";
    dragFrom.value = from;
    dragSize.value = size;
    slot.value = -1;
    dragY.value = 0;
    travelled.value = 0;
    scrolledAtStart.value = scrollOffset.value;
  };
  const setFinger = (y: number) => {
    "worklet";
    fingerY.value = y;
  };
  /**
   * The whole of the drag's per-frame work: where the block is, and which
   * landing is nearest. Called from the gesture AND from the frame callback,
   * because the page can scroll under a finger that is not moving – and then
   * the block has moved through the list without the gesture saying anything.
   */
  const syncDrag = (translation: number) => {
    "worklet";
    travelled.value = translation;
    // Measured against the CONTENT, not the screen: the finger has moved this
    // far, and the page has moved this much underneath it.
    dragY.value = translation + (scrollOffset.value - scrolledAtStart.value);
    const reachable = offsets.value;
    if (reachable.length === 0) return;
    let best = 0;
    let bestDistance = -1;
    for (let candidate = 0; candidate < reachable.length; candidate += 1) {
      const distance = Math.abs(reachable[candidate] - dragY.value);
      if (bestDistance < 0 || distance < bestDistance) {
        bestDistance = distance;
        best = candidate;
      }
    }
    slot.value = best;
  };
  const settleDrag = (done: () => void) => {
    "worklet";
    const reachable = offsets.value;
    const to =
      slot.value >= 0 && slot.value < reachable.length
        ? reachable[slot.value]
        : dragY.value;
    dragY.value = withTiming(to, { duration: DROP_MS }, done);
  };
  const setPlanSet = (computed: DragPlan[], reachable: number[]) => {
    "worklet";
    plans.value = computed;
    offsets.value = reachable;
  };
  // Note what this does NOT do: it leaves `lifted` alone. The floating copy
  // stays mounted and simply goes transparent, so that clearing a drag is
  // nothing but shared-value writes and can therefore happen inside the layout
  // effect below. Its content is replaced the next time something is lifted.
  const clearDrag = () => {
    dragFrom.value = -1;
    dragSize.value = 0;
    slot.value = -1;
    dragY.value = 0;
  };

  // The page scrolls itself while the finger sits near an edge. Only ever
  // active during a drag: a frame callback that runs all the time is a frame
  // callback that shows up in every performance trace.
  const edgeScroll = useFrameCallback(() => {
    if (dragFrom.value < 0) return;
    const bounds = measure(scrollRef);
    if (bounds === null) return;
    const top = bounds.pageY + EDGE;
    const bottom = bounds.pageY + bounds.height - EDGE;
    let delta = 0;
    if (fingerY.value < top) {
      delta = -Math.min(1, (top - fingerY.value) / EDGE) * EDGE_SPEED;
    } else if (fingerY.value > bottom) {
      delta = Math.min(1, (fingerY.value - bottom) / EDGE) * EDGE_SPEED;
    }
    if (delta === 0) return;
    // Asked for against the LIVE offset every frame rather than accumulated, so
    // that reaching the end of the content simply stops: the scroll view clamps
    // the request, the next frame reads the clamped value, and nothing builds
    // up a debt to unwind when the finger comes back.
    scrollTo(scrollRef, 0, scrollOffset.value + delta, false);
    syncDrag(travelled.value);
  }, false);

  // ⚠️ THE SAME LAYOUT-EFFECT RULE AS THE REORDER SHEET, and for the same
  // reason: on a drop the block's slot and its offset both change, and nothing
  // makes them land in the same frame unless React is made to do it. Clearing
  // here – after the commit that reorders, before it is painted – is what stops
  // the block flashing at its old position. Keyed on a counter rather than on
  // the order, because these rows are drafts with no ids and an order key built
  // from their positions never changes (the bug fixed earlier the same day).
  useLayoutEffect(() => {
    clearDrag();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dropCount]);

  const beginDrag = (from: number, size: number, top: number) => {
    if (inFlight.current) return;
    inFlight.current = true;
    const set = dragPlans(items, from, size, sizes.current);
    targets.current = set.targets;
    setPlanSet(set.plans, set.offsets);
    setLifted({ from, size, top });
    edgeScroll.setActive(true);
    onDragChange(true);
  };

  const finishDrag = (from: number, size: number, chosen: number) => {
    if (!inFlight.current) return;
    inFlight.current = false;
    edgeScroll.setActive(false);
    onDragChange(false);
    const to = targets.current[chosen];
    if (to !== undefined && movesAnything(to, from, size)) {
      // Deliberately does NOT clear the drag here – the layout effect above
      // does it in the commit that applies the new order. Until then the block
      // stays exactly where it was dropped, which is where it belongs.
      setDropCount((count) => count + 1);
      onReorder(from, size, to);
      return;
    }
    clearDrag();
  };

  const cancelDrag = () => {
    if (!inFlight.current) return;
    inFlight.current = false;
    edgeScroll.setActive(false);
    onDragChange(false);
    clearDrag();
  };

  /** A row's measured height, less the divider that belongs to it. */
  const measured = (index: number, height: number) => {
    sizes.current[index] = Math.max(0, height - DIVIDER);
  };
  /** A heading has no divider of its own. */
  const measuredHeading = (index: number, height: number) => {
    sizes.current[index] = height;
  };

  /**
   * Reordering without a drag, for anyone using VoiceOver – and the reason
   * dropping the reorder sheet does not cost these lists their accessibility.
   * Moves the block to the nearest landing above or below the one it occupies,
   * using the same legality rule as the drag.
   */
  const nudge = (from: number, size: number, direction: -1 | 1) => {
    const legal = validTargets(
      items.map((item, index) => ({
        key: String(index),
        isSection: item.isSection,
      })),
      from,
      size,
    ).filter((target) => movesAnything(target, from, size));
    const above = legal.filter((target) => target < from);
    const below = legal.filter((target) => target > from);
    const to = direction === -1 ? above[above.length - 1] : below[0];
    if (to !== undefined) onReorder(from, size, to);
  };

  const moveActions = [
    { name: "moveUp", label: t("recipes.form.moveUp") },
    { name: "moveDown", label: t("recipes.form.moveDown") },
  ];
  const moveAction =
    (from: number, size: number) => (event: AccessibilityActionEvent) => {
      if (event.nativeEvent.actionName === "moveUp") nudge(from, size, -1);
      if (event.nativeEvent.actionName === "moveDown") nudge(from, size, 1);
    };

  return {
    lifted,
    plans,
    slot,
    dragFrom,
    dragSize,
    dragY,
    armDrag,
    syncDrag,
    setFinger,
    settleDrag,
    beginDrag,
    finishDrag,
    cancelDrag,
    measured,
    measuredHeading,
    moveActions,
    moveAction,
  };
}

export type InPlaceDrag = ReturnType<typeof useInPlaceDrag>;

/**
 * The drag itself, in the one place both ways of starting it can share.
 *
 * `immediate` is the difference between a grip and everything else: a grip
 * means only one thing, so a few pixels of vertical movement are enough to
 * start; a row or a heading name also means "tap me", so there a hold has to
 * arm it first.
 */
export function useBlockDrag({
  index,
  size,
  immediate,
  drag,
  onBeginDrag,
}: {
  index: number;
  size: number;
  immediate: boolean;
  drag: InPlaceDrag;
  /** Where the thing being lifted is drawn, so its copy starts there. */
  onBeginDrag: () => void;
}) {
  const { armDrag, syncDrag, setFinger, settleDrag } = drag;
  const slot = drag.slot as SharedValue<number>;
  const dragFrom = drag.dragFrom as SharedValue<number>;
  const finish = drag.finishDrag;
  const cancel = drag.cancelDrag;
  const pan = Gesture.Pan()
    .onStart((event) => {
      armDrag(index, size);
      setFinger(event.absoluteY);
      runOnJS(onBeginDrag)();
    })
    .onUpdate((event) => {
      setFinger(event.absoluteY);
      syncDrag(event.translationY);
    })
    .onEnd(() => {
      const chosen = slot.value;
      // Lands in the gap the list has opened, rather than snapping there once
      // the new order arrives.
      settleDrag(() => {
        "worklet";
        runOnJS(finish)(index, size, chosen);
      });
    })
    .onFinalize((_event, success) => {
      if (!success && dragFrom.value === index) runOnJS(cancel)();
    });
  return immediate
    ? // Vertical movement claims the gesture before the page can read it as a
      // scroll; the default threshold is generous enough that the page wins.
      pan.activeOffsetY([-4, 4])
    : pan.activateAfterLongPress(LIFT_MS);
}

/**
 * The grip. Deliberately invisible to VoiceOver: dragging is not a gesture it
 * can perform, and the accessible way to reorder is the Move up / Move down
 * action on the row or heading itself. One focusable thing per item.
 */
export function DragGrip({
  gesture,
  align = "center",
}: {
  gesture: ReturnType<typeof useBlockDrag>;
  /** Top-aligned on a row that can run to several lines, so the grip sits
   *  beside the first line rather than floating in the middle of a paragraph. */
  align?: "center" | "start";
}) {
  return (
    <GestureDetector gesture={gesture}>
      <View
        hitSlop={12}
        importantForAccessibility="no-hide-descendants"
        accessibilityElementsHidden
        className={
          align === "start"
            ? "items-center justify-start"
            : "items-center justify-center"
        }
      >
        <MaterialIcons
          name="drag-handle"
          size={24}
          color={ds.colors.icon.subtle}
        />
      </View>
    </GestureDetector>
  );
}
