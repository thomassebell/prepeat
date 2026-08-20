import { MaterialIcons } from "@expo/vector-icons";
import { Fragment, useLayoutEffect, useRef, useState } from "react";
import {
  Pressable,
  Text,
  View,
  type AccessibilityActionEvent,
  type LayoutChangeEvent,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  measure,
  runOnJS,
  scrollTo,
  useAnimatedStyle,
  useFrameCallback,
  useScrollViewOffset,
  useSharedValue,
  withTiming,
  type AnimatedRef,
  type SharedValue,
} from "react-native-reanimated";

import { SwipeActions } from "@/components/recipes/swipe-actions";
import { ds } from "@/constants/ds";
import { t } from "@/lib/i18n";
import {
  ROW_HEIGHT,
  ROW_SLOT,
  blockSizeFor,
  cardHeight,
  cardMarginBottom,
  dragPlans,
  groupForDrag,
  type DragPlan,
} from "@/lib/ingredient-drag-layout";
import { movesAnything, validTargets } from "@/lib/reorder";
import type { DraftIngredient } from "@/lib/recipes";

/** One line of `header/display-6` beside a 24px handle, until measured. */
const HEADING_FALLBACK = 24;
/** How long the list takes to open a gap. The sheet uses 140; a little slower
 *  reads better when whole cards are resizing with it. */
const MOVE_MS = 160;
/** How long a hold arms the drag, matching the Shopping screen. */
const LIFT_MS = 200;
/** How long the lifted block takes to settle into the gap on release. */
const DROP_MS = 140;
/** How close to the top or bottom edge the finger has to be before the page
 *  starts scrolling under it. */
const EDGE = 90;
/** Pixels per frame at the very edge of the screen, tapering to nothing at the
 *  inner boundary of the edge zone. */
const EDGE_SPEED = 14;

/**
 * The recipe editor's ingredient list: section headings, one card per section,
 * and everything on it draggable in place – a row into another section, or a
 * whole section past another one (Thomas, 2026-08-20 – *"is there a way where
 * tapping the ingredient opens the edit sheet, but dragging it reorders the
 * list"*, then *"can you include section as well? Section will not open a
 * sheet – the clean solution"*).
 *
 * **There is no reorder sheet on this screen any more.** That is the "clean
 * solution" in his words: a handle that opens a sheet that reorders a copy of
 * the list is a second place the list exists, and once the real list can be
 * dragged there is no reason to keep it. Two consequences follow, and they are
 * why this file is as long as it is: the drag has to reach a section that is
 * off-screen, so it scrolls the page under the finger; and it has to be usable
 * without dragging at all, so every row and heading carries Move up / Move down
 * accessibility actions. The sheet remains on the recipe DETAIL screen and for
 * instructions, which are untouched.
 *
 * **EVERY ITEM HAS A GRIP, ROWS INCLUDED** (Thomas, 2026-08-20: *"in one case
 * the drag handle is telling users this is draggable – but also communicating
 * that ingredient is not"*). A grip on the headings alone did not just fail to
 * advertise the rows, it argued against them.
 *
 * The grip is also what removes the hold. A tap and a drag begin identically on
 * a row, so something had to separate them, and that something was a 200ms
 * wait; a grip is unambiguous, so a drag from one starts on the first few
 * pixels of movement instead. The hold survives on the body of a row and on a
 * heading's name as an unadvertised shortcut – it costs nothing and it is what
 * someone who has not noticed the grip will try. Tapping a row still opens the
 * edit sheet, tapping a heading still renames it, swiping still deletes.
 *
 * The grips line up in one column because the heading carries a right padding
 * that the rows get from their card - which is the reorder sheet's own rule
 * (Figma 508:13966), and the sheet is also where the precedent for a grip on
 * every row comes from. It is Thomas's pattern moved onto the real list rather
 * than a new one invented for it.
 *
 * THE GEOMETRY IS NOT IN HERE. It is in `src/lib/ingredient-drag-layout.ts`,
 * with `scripts/check-ingredient-drag.mjs` running the real functions – 35
 * checks, because cards that grow and shrink while headings hold still, and
 * whole units travelling while nothing resizes, are exactly the arithmetic that
 * looks right and is off by one.
 *
 * ⚠️ IMPROVISED, AND MARKED AS SUCH (2026-08-20). No frame draws anything in
 * flight, so these are Claude's and not Thomas's design: the lifted thing is
 * drawn on `surface-neutral-lighter` with a shadow – that colour is the reorder
 * sheet's own lifted row (Figma 508:13822), the nearest thing that IS designed;
 * 200ms to lift, from Shopping; 160ms for the list to move aside, near the
 * sheet's 140. A lift has no haptic tick because the app has no haptics
 * dependency at all – adding one is a decision, not a detail.
 */
export function IngredientDragList({
  rows,
  scrollRef,
  onEditRow,
  onDeleteRow,
  onEditSection,
  onReorder,
  onDragChange,
}: {
  rows: DraftIngredient[];
  /** The page's scroll view, so a drag can reach what is off-screen. */
  scrollRef: AnimatedRef<Animated.ScrollView>;
  onEditRow: (index: number) => void;
  onDeleteRow: (index: number) => void;
  onEditSection: (index: number) => void;
  onReorder: (from: number, size: number, target: number) => void;
  /** Freezes the page's own scrolling while something is in the air. */
  onDragChange: (dragging: boolean) => void;
}) {
  const groups = groupForDrag(rows);
  // Measured rather than assumed: a long section name wraps, and then the
  // headings are not all the same height.
  const headingHeights = useRef<number[]>([]);
  // Measured too, and only ever used to place the floating copy where the thing
  // it replaces was actually drawn – so a model that is a pixel out cannot make
  // it jump the moment it is lifted.
  const headingTops = useRef<number[]>([]);
  const cardTops = useRef<number[]>([]);
  // The legal landings for the block currently in the air, on the JS side. The
  // gesture reads its own copy in a shared value; this one is for the drop.
  const targets = useRef<number[]>([]);

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
  const setPlanSet = (computed: DragPlan[], reachable: number[]) => {
    "worklet";
    plans.value = computed;
    offsets.value = reachable;
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
    const to = slot.value < reachable.length ? reachable[slot.value] : dragY.value;
    dragY.value = withTiming(to, { duration: DROP_MS }, done);
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
  // the order, because the editor's rows are drafts with no ids and an order
  // key built from their positions never changes (the bug fixed earlier today).
  useLayoutEffect(() => {
    clearDrag();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dropCount]);

  // Two gestures can reach the same block - its grip and the hold on its body -
  // and a finger that rests on a grip arms both. They agree about everything,
  // so the first one wins and the second is a no-op; without this the drop
  // would be applied twice.
  const inFlight = useRef(false);

  const beginDrag = (from: number, size: number, top: number) => {
    if (inFlight.current) return;
    inFlight.current = true;
    const heights = rows.map((row, index) =>
      row.isSection ? (headingHeights.current[index] ?? HEADING_FALLBACK) : 0,
    );
    const set = dragPlans(rows, from, size, heights);
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

  /**
   * Reordering without a drag, for anyone using VoiceOver – and the reason
   * dropping the sheet does not cost the screen its accessibility. Moves the
   * block to the nearest landing above or below the one it occupies, using the
   * same legality rule as the drag.
   */
  const nudge = (from: number, size: number, direction: -1 | 1) => {
    const legal = validTargets(
      rows.map((row, index) => ({
        key: String(index),
        isSection: row.isSection,
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

  return (
    <View className="w-full gap-layout-small">
      {groups.map((group, groupIndex) => (
        <Fragment key={group.headingIndex ?? "loose"}>
          {group.headingIndex !== null && (
            <SectionHeading
              index={group.headingIndex}
              groupIndex={groupIndex}
              name={rows[group.headingIndex].name}
              size={blockSizeFor(rows, group.headingIndex)}
              draggable={rows.length > 1}
              plans={plans}
              slot={slot}
              dragFrom={dragFrom}
              dragSize={dragSize}
              armDrag={armDrag}
              syncDrag={syncDrag}
              setFinger={setFinger}
              settleDrag={settleDrag}
              onLayoutHeading={(y, height) => {
                headingTops.current[group.headingIndex!] = y;
                headingHeights.current[group.headingIndex!] = height;
              }}
              onEditSection={onEditSection}
              onBeginDrag={(from, size) =>
                beginDrag(from, size, headingTops.current[from] ?? 0)
              }
              onFinishDrag={finishDrag}
              onCancelDrag={cancelDrag}
              moveActions={moveActions}
              onMoveAction={moveAction(
                group.headingIndex,
                blockSizeFor(rows, group.headingIndex),
              )}
            />
          )}
          <IngredientCard
            groupIndex={groupIndex}
            rowIndices={group.rowIndices}
            rows={rows}
            plans={plans}
            slot={slot}
            dragFrom={dragFrom}
            dragSize={dragSize}
            armDrag={armDrag}
            syncDrag={syncDrag}
            setFinger={setFinger}
            settleDrag={settleDrag}
            onLayoutCard={(y) => {
              cardTops.current[groupIndex] = y;
            }}
            onEditRow={onEditRow}
            onDeleteRow={onDeleteRow}
            onBeginDrag={(from, position) =>
              beginDrag(
                from,
                1,
                (cardTops.current[groupIndex] ?? 0) + position * ROW_SLOT,
              )
            }
            onFinishDrag={finishDrag}
            onCancelDrag={cancelDrag}
            moveActions={moveActions}
            onMoveAction={moveAction}
          />
        </Fragment>
      ))}

      {/* The thing in the air. It is a copy rather than the row or section
          itself because a card clips its own contents – which is exactly what
          makes the hole and the gap read, and exactly what would hide anything
          travelling between two cards. */}
      {lifted != null && (
        <FloatingBlock
          rows={rows}
          from={lifted.from}
          size={lifted.size}
          top={lifted.top}
          dragFrom={dragFrom}
          dragY={dragY}
        />
      )}
    </View>
  );
}

/**
 * The drag itself, in the one place both ways of starting it can share.
 *
 * `immediate` is the difference between a grip and everything else: a grip
 * means only one thing, so a few pixels of vertical movement are enough to
 * start; a row or a heading name also means "tap me", so there a hold has to
 * arm it first.
 */
function useBlockDrag({
  index,
  size,
  immediate,
  dragFrom,
  slot,
  armDrag,
  syncDrag,
  setFinger,
  settleDrag,
  onBeginDrag,
  onFinishDrag,
  onCancelDrag,
}: {
  index: number;
  size: number;
  immediate: boolean;
  dragFrom: SharedValue<number>;
  slot: SharedValue<number>;
  armDrag: (from: number, size: number) => void;
  syncDrag: (translation: number) => void;
  setFinger: (y: number) => void;
  settleDrag: (done: () => void) => void;
  onBeginDrag: () => void;
  onFinishDrag: (from: number, size: number, chosen: number) => void;
  onCancelDrag: () => void;
}) {
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
        runOnJS(onFinishDrag)(index, size, chosen);
      });
    })
    .onFinalize((_event, success) => {
      if (!success && dragFrom.value === index) runOnJS(onCancelDrag)();
    });
  return immediate
    // Vertical movement claims the gesture before the page can read it as a
    // scroll; the default threshold is generous enough that the page wins.
    ? pan.activeOffsetY([-4, 4])
    : pan.activateAfterLongPress(LIFT_MS);
}

/** The grip. Deliberately invisible to VoiceOver: dragging is not a gesture it
 *  can perform, and the accessible way to reorder is the Move up / Move down
 *  action on the row or heading itself. One focusable thing per item. */
function DragGrip({ gesture }: { gesture: ReturnType<typeof useBlockDrag> }) {
  return (
    <GestureDetector gesture={gesture}>
      <View
        hitSlop={12}
        importantForAccessibility="no-hide-descendants"
        accessibilityElementsHidden
        className="items-center justify-center"
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

function SectionHeading({
  index,
  groupIndex,
  name,
  size,
  draggable,
  plans,
  slot,
  dragFrom,
  dragSize,
  armDrag,
  syncDrag,
  setFinger,
  settleDrag,
  onLayoutHeading,
  onEditSection,
  onBeginDrag,
  onFinishDrag,
  onCancelDrag,
  moveActions,
  onMoveAction,
}: {
  index: number;
  groupIndex: number;
  name: string;
  size: number;
  draggable: boolean;
  plans: SharedValue<DragPlan[]>;
  slot: SharedValue<number>;
  dragFrom: SharedValue<number>;
  dragSize: SharedValue<number>;
  armDrag: (from: number, size: number) => void;
  syncDrag: (translation: number) => void;
  setFinger: (y: number) => void;
  settleDrag: (done: () => void) => void;
  onLayoutHeading: (y: number, height: number) => void;
  onEditSection: (index: number) => void;
  onBeginDrag: (from: number, size: number) => void;
  onFinishDrag: (from: number, size: number, chosen: number) => void;
  onCancelDrag: () => void;
  moveActions: { name: string; label: string }[];
  onMoveAction: (event: AccessibilityActionEvent) => void;
}) {
  const drag = {
    index,
    size,
    dragFrom,
    slot,
    armDrag,
    syncDrag,
    setFinger,
    settleDrag,
    onBeginDrag: () => onBeginDrag(index, size),
    onFinishDrag,
    onCancelDrag,
  };
  const gripPan = useBlockDrag({ ...drag, immediate: true });
  const namePan = useBlockDrag({ ...drag, immediate: false });

  const style = useAnimatedStyle(() => {
    const inFlight =
      dragFrom.value >= 0 &&
      index >= dragFrom.value &&
      index < dragFrom.value + dragSize.value;
    if (inFlight) return { opacity: 0, transform: [{ translateY: 0 }] };
    const plan = dragFrom.value < 0 ? undefined : plans.value[slot.value];
    if (plan === undefined) {
      return { opacity: 1, transform: [{ translateY: 0 }] };
    }
    return {
      opacity: 1,
      transform: [
        {
          translateY: withTiming(plan.groupDisplacement[groupIndex] ?? 0, {
            duration: MOVE_MS,
          }),
        },
      ],
    };
  });

  return (
    <Animated.View
      style={style}
      // The right padding is what puts this grip in the same column as the row
      // grips below, which get theirs from the card's own padding - the reorder
      // sheet's rule (Figma 508:13966), and the reason the grips read as one
      // column rather than two stray icons.
      className="w-full flex-row items-center gap-comp-small pr-layout-small"
      onLayout={(event: LayoutChangeEvent) =>
        onLayoutHeading(
          event.nativeEvent.layout.y,
          event.nativeEvent.layout.height,
        )
      }
    >
      {/* Tapping the NAME renames the section – the one sheet a heading still
          opens. Holding it, or using the grip, moves it. */}
      <GestureDetector gesture={namePan}>
        <Pressable
          className="flex-1"
          onPress={() => onEditSection(index)}
          accessibilityRole="button"
          accessibilityLabel={t("recipes.form.editSection", { name })}
          accessibilityHint={t("recipes.form.dragRow")}
          accessibilityActions={draggable ? moveActions : undefined}
          onAccessibilityAction={onMoveAction}
        >
          <Text className="font-header text-display-6 font-emphasized text-text-default">
            {name}
          </Text>
        </Pressable>
      </GestureDetector>
      {draggable && <DragGrip gesture={gripPan} />}
    </Animated.View>
  );
}

function IngredientCard({
  groupIndex,
  rowIndices,
  rows,
  plans,
  slot,
  dragFrom,
  dragSize,
  armDrag,
  syncDrag,
  setFinger,
  settleDrag,
  onLayoutCard,
  onEditRow,
  onDeleteRow,
  onBeginDrag,
  onFinishDrag,
  onCancelDrag,
  moveActions,
  onMoveAction,
}: {
  groupIndex: number;
  rowIndices: number[];
  rows: DraftIngredient[];
  plans: SharedValue<DragPlan[]>;
  slot: SharedValue<number>;
  dragFrom: SharedValue<number>;
  dragSize: SharedValue<number>;
  armDrag: (from: number, size: number) => void;
  syncDrag: (translation: number) => void;
  setFinger: (y: number) => void;
  settleDrag: (done: () => void) => void;
  onLayoutCard: (y: number) => void;
  onEditRow: (index: number) => void;
  onDeleteRow: (index: number) => void;
  onBeginDrag: (from: number, position: number) => void;
  onFinishDrag: (from: number, size: number, chosen: number) => void;
  onCancelDrag: () => void;
  moveActions: { name: string; label: string }[];
  onMoveAction: (
    from: number,
    size: number,
  ) => (event: AccessibilityActionEvent) => void;
}) {
  const idleHeight = cardHeight(rowIndices.length);
  const idleMargin = cardMarginBottom(rowIndices.length);
  // The card belongs to the block in the air when its own heading does. The
  // heading sits one index below the card's first row, or - for a section with
  // no rows at all - there is no card to hide in the first place.
  const headingIndex = rowIndices.length > 0 ? rowIndices[0] - 1 : -1;
  const style = useAnimatedStyle(() => {
    const plan = dragFrom.value < 0 ? undefined : plans.value[slot.value];
    if (plan === undefined) {
      return {
        height: idleHeight,
        marginBottom: idleMargin,
        opacity: 1,
        transform: [{ translateY: 0 }],
      };
    }
    const inFlight =
      dragSize.value > 1 &&
      headingIndex >= dragFrom.value &&
      headingIndex < dragFrom.value + dragSize.value;
    return {
      height: withTiming(plan.cardHeights[groupIndex] ?? idleHeight, {
        duration: MOVE_MS,
      }),
      marginBottom: withTiming(
        plan.cardMarginBottoms[groupIndex] ?? idleMargin,
        { duration: MOVE_MS },
      ),
      // Its copy is in the air, drawing this card; two of them must not show.
      opacity: inFlight ? 0 : 1,
      transform: [
        {
          translateY: withTiming(plan.groupDisplacement[groupIndex] ?? 0, {
            duration: MOVE_MS,
          }),
        },
      ],
    };
  });

  return (
    <Animated.View
      onLayout={(event: LayoutChangeEvent) =>
        onLayoutCard(event.nativeEvent.layout.y)
      }
      style={style}
      className="w-full overflow-hidden rounded-large bg-surface-neutral-white"
    >
      {rowIndices.map((index, position) => (
        <IngredientRow
          key={index}
          index={index}
          position={position}
          row={rows[index]}
          plans={plans}
          slot={slot}
          dragFrom={dragFrom}
          dragSize={dragSize}
          armDrag={armDrag}
          syncDrag={syncDrag}
          setFinger={setFinger}
          settleDrag={settleDrag}
          onEdit={() => onEditRow(index)}
          onDelete={() => onDeleteRow(index)}
          onBeginDrag={onBeginDrag}
          onFinishDrag={onFinishDrag}
          onCancelDrag={onCancelDrag}
          moveActions={moveActions}
          onMoveAction={onMoveAction(index, 1)}
        />
      ))}
    </Animated.View>
  );
}

function IngredientRow({
  index,
  position,
  row,
  plans,
  slot,
  dragFrom,
  dragSize,
  armDrag,
  syncDrag,
  setFinger,
  settleDrag,
  onEdit,
  onDelete,
  onBeginDrag,
  onFinishDrag,
  onCancelDrag,
  moveActions,
  onMoveAction,
}: {
  index: number;
  position: number;
  row: DraftIngredient;
  plans: SharedValue<DragPlan[]>;
  slot: SharedValue<number>;
  dragFrom: SharedValue<number>;
  dragSize: SharedValue<number>;
  armDrag: (from: number, size: number) => void;
  syncDrag: (translation: number) => void;
  setFinger: (y: number) => void;
  settleDrag: (done: () => void) => void;
  onEdit: () => void;
  onDelete: () => void;
  onBeginDrag: (from: number, position: number) => void;
  onFinishDrag: (from: number, size: number, chosen: number) => void;
  onCancelDrag: () => void;
  moveActions: { name: string; label: string }[];
  onMoveAction: (event: AccessibilityActionEvent) => void;
}) {
  const drag = {
    index,
    size: 1,
    dragFrom,
    slot,
    armDrag,
    syncDrag,
    setFinger,
    settleDrag,
    onBeginDrag: () => onBeginDrag(index, position),
    onFinishDrag,
    onCancelDrag,
  };
  const gripPan = useBlockDrag({ ...drag, immediate: true });
  const bodyPan = useBlockDrag({ ...drag, immediate: false });

  const style = useAnimatedStyle(() => {
    if (dragFrom.value === index && dragSize.value === 1) {
      // Its copy is in the air; this is the space it used to fill.
      return { opacity: 0, transform: [{ translateY: 0 }] };
    }
    const plan = dragFrom.value < 0 ? undefined : plans.value[slot.value];
    if (plan === undefined) {
      // No animation on the way back – by the time this runs the new order is
      // already what draws the row, so there is nothing to travel to.
      return { opacity: 1, transform: [{ translateY: 0 }] };
    }
    return {
      opacity: 1,
      transform: [
        {
          translateY: withTiming(plan.displacement[index] ?? 0, {
            duration: MOVE_MS,
          }),
        },
      ],
    };
  });

  return (
    <Animated.View style={style} className="w-full">
      <SwipeActions label={row.name} onEdit={onEdit} onDelete={onDelete}>
        {/* 57 tall, not 56: the divider is inside the row so that it travels
            with it, and the card is a pixel shorter than its rows so the last
            one is clipped. Nothing has to know which row is currently last,
            which changes while a row is in flight. */}
        <View className="h-[57px] w-full flex-row items-center gap-comp-small border-b border-border-subtle bg-surface-neutral-white px-layout-small">
          <GestureDetector gesture={bodyPan}>
            <Pressable
              className="min-w-0 flex-1 flex-row items-center gap-layout-small"
              onPress={onEdit}
              accessibilityRole="button"
              accessibilityLabel={t("recipes.form.editRow", { name: row.name })}
              accessibilityHint={t("recipes.form.dragRow")}
              accessibilityActions={moveActions}
              onAccessibilityAction={onMoveAction}
            >
              <Text className="min-w-0 flex-1 font-paragraph text-paragraph font-default text-text-default">
                {row.name}
              </Text>
              {(row.quantityText?.length ?? 0) > 0 && (
                <Text className="font-paragraph text-paragraph font-default text-text-subtle">
                  {row.quantityText}
                </Text>
              )}
            </Pressable>
          </GestureDetector>
          <DragGrip gesture={gripPan} />
        </View>
      </SwipeActions>
    </Animated.View>
  );
}

function FloatingBlock({
  rows,
  from,
  size,
  top,
  dragFrom,
  dragY,
}: {
  rows: DraftIngredient[];
  from: number;
  size: number;
  top: number;
  dragFrom: SharedValue<number>;
  dragY: SharedValue<number>;
}) {
  const style = useAnimatedStyle(() => ({
    opacity: dragFrom.value < 0 ? 0 : 1,
    transform: [{ translateY: dragY.value }],
  }));
  const block = rows.slice(from, from + size);
  const heading = block[0]?.isSection === true ? block[0] : null;
  const carried = heading === null ? block : block.slice(1);
  return (
    <Animated.View
      style={[
        {
          pointerEvents: "none",
          position: "absolute",
          left: 0,
          right: 0,
          top,
          zIndex: 10,
          elevation: 4,
          shadowColor: "#000",
          shadowOpacity: 0.16,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
        },
        style,
      ]}
      className="w-full gap-layout-small"
    >
      {heading !== null && (
        <View className="w-full flex-row items-center gap-comp-small pr-layout-small">
          <Text className="flex-1 font-header text-display-6 font-emphasized text-text-default">
            {heading.name}
          </Text>
          <MaterialIcons
            name="drag-handle"
            size={24}
            color={ds.colors.icon.subtle}
          />
        </View>
      )}
      {carried.length > 0 && (
        <View
          style={{ height: cardHeight(carried.length) }}
          className="w-full overflow-hidden rounded-large bg-surface-neutral-lighter"
        >
          {carried.map((row, position) => (
            <View
              key={position}
              className="h-[57px] w-full flex-row items-center gap-comp-small border-b border-border-subtle px-layout-small"
            >
              <View className="min-w-0 flex-1 flex-row items-center gap-layout-small">
                <Text className="min-w-0 flex-1 font-paragraph text-paragraph font-default text-text-default">
                  {row.name}
                </Text>
                {(row.quantityText?.length ?? 0) > 0 && (
                  <Text className="font-paragraph text-paragraph font-default text-text-subtle">
                    {row.quantityText}
                  </Text>
                )}
              </View>
              {/* The copy carries its grip too, or the row would appear to lose
                  it the moment it left the list. */}
              <MaterialIcons
                name="drag-handle"
                size={24}
                color={ds.colors.icon.subtle}
              />
            </View>
          ))}
        </View>
      )}
      {heading === null && carried.length === 0 && (
        <View style={{ height: ROW_HEIGHT }} />
      )}
    </Animated.View>
  );
}
