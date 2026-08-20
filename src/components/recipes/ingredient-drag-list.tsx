import { MaterialIcons } from "@expo/vector-icons";
import { Fragment, useLayoutEffect, useRef, useState } from "react";
import { Pressable, Text, View, type LayoutChangeEvent } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";

import { SwipeActions } from "@/components/recipes/swipe-actions";
import { ds } from "@/constants/ds";
import { t } from "@/lib/i18n";
import {
  ROW_HEIGHT,
  ROW_SLOT,
  cardHeight,
  cardMarginBottom,
  dragPlans,
  dropOffsets,
  groupForDrag,
  type DragPlan,
} from "@/lib/ingredient-drag-layout";
import { movesAnything } from "@/lib/reorder";
import type { DraftIngredient } from "@/lib/recipes";

/** One line of `header/display-6` beside a 24px handle, until measured. */
const HEADING_FALLBACK = 24;
/** How long the list takes to open a gap. The sheet uses 140; a little slower
 *  reads better when whole cards are resizing with it. */
const MOVE_MS = 160;
/** How long a hold arms the drag, matching the Shopping screen. */
const LIFT_MS = 200;
/** How long the lifted row takes to settle into the gap on release. */
const DROP_MS = 140;

/**
 * The recipe editor's ingredient list: section headings, one card per section,
 * and rows that can be picked up and dropped into a different section without
 * leaving the screen (Thomas, 2026-08-20 – *"is there a way where tapping the
 * ingredient opens the edit sheet, but dragging it reorders the list"*).
 *
 * A TAP still opens the edit sheet, so the drag has to start from a HOLD.
 * There is no way around that and it is not a preference: these rows live
 * inside the page's scroll view, so a finger moving down a row is asking for
 * one of two things and only a short press-and-hold separates them. 200ms,
 * matching the Shopping screen's category drag, which is the same interaction
 * and the only one Thomas has already approved.
 *
 * THE GEOMETRY IS NOT IN HERE. It is in `src/lib/ingredient-drag-layout.ts`,
 * with `scripts/check-ingredient-drag.mjs` running the real functions – cards
 * that grow and shrink while headings hold still is exactly the arithmetic that
 * looks right and is off by one.
 *
 * ⚠️ IMPROVISED, AND MARKED AS SUCH (2026-08-20). No frame draws an ingredient
 * in flight, so three things here are Claude's and not Thomas's design:
 *   1. **The lifted row** is drawn `surface-neutral-lighter` with a shadow –
 *      the colour comes from the reorder sheet's own lifted row (Figma
 *      508:13822), which is the nearest thing that IS designed.
 *   2. **200ms to lift**, copied from Shopping.
 *   3. **160ms for everything else to move aside**, near the sheet's 140.
 * Two known gaps, deliberately left rather than invented: dragging past the top
 * or bottom of the screen does NOT scroll the page (the drag handle and its
 * sheet stay for long lists, which is also the only way to move a whole
 * section), and a lift has no haptic tick because the app has no haptics
 * dependency at all – adding one is a decision, not a detail.
 */
export function IngredientDragList({
  rows,
  onEditRow,
  onDeleteRow,
  onEditSection,
  onOpenReorderSheet,
  onReorder,
  onDragChange,
}: {
  rows: DraftIngredient[];
  onEditRow: (index: number) => void;
  onDeleteRow: (index: number) => void;
  onEditSection: (index: number) => void;
  /** The heading handle still opens the reorder sheet – long lists and whole
   *  sections are its job. */
  onOpenReorderSheet: () => void;
  onReorder: (from: number, target: number) => void;
  /** Freezes the page's scroll while a row is in the air. */
  onDragChange: (dragging: boolean) => void;
}) {
  const groups = groupForDrag(rows);
  // Measured rather than assumed: a long section name wraps, and then the
  // headings are not all the same height.
  const headingHeights = useRef<number[]>([]);
  // Measured too, and only ever used to place the floating copy where the row
  // it replaces was actually drawn – so a model that is a pixel out cannot make
  // the row jump the moment it is lifted.
  const cardTops = useRef<number[]>([]);

  const [lifted, setLifted] = useState<{ index: number; top: number } | null>(
    null,
  );
  const [dropCount, setDropCount] = useState(0);

  const dragFrom = useSharedValue(-1);
  const dragY = useSharedValue(0);
  const target = useSharedValue(-1);
  const plans = useSharedValue<DragPlan[]>([]);
  const offsets = useSharedValue<number[]>([]);

  // ⚠️ EVERY WRITE TO A SHARED VALUE GOES THROUGH ONE OF THESE, and they carry
  // the "worklet" directive - the same shape as the reorder sheet, for the same
  // reason: the React Compiler forbids a child mutating a shared value it was
  // handed as a prop, so the rows are given setters rather than the values.
  const setPlans = (computed: DragPlan[], reachable: number[]) => {
    "worklet";
    plans.value = computed;
    offsets.value = reachable;
  };
  const setDragState = (from: number, to: number) => {
    "worklet";
    dragFrom.value = from;
    target.value = to;
  };
  const setDragY = (y: number) => {
    "worklet";
    dragY.value = y;
  };
  const setTarget = (to: number) => {
    "worklet";
    target.value = to;
  };
  const settleDragY = (to: number, done: () => void) => {
    "worklet";
    dragY.value = withTiming(to, { duration: DROP_MS }, done);
  };
  // Note what this does NOT do: it leaves `lifted` alone. The floating copy
  // stays mounted and simply goes transparent, so that clearing a drag is
  // nothing but shared-value writes and can therefore happen inside the layout
  // effect below. Its content is replaced the next time a row is lifted.
  const clearDrag = () => {
    setDragState(-1, -1);
    setDragY(0);
  };

  // ⚠️ THE SAME LAYOUT-EFFECT RULE AS THE REORDER SHEET, and for the same
  // reason: on a drop the row's slot and its offset both change, and nothing
  // makes them land in the same frame unless React is made to do it. Clearing
  // here – after the commit that reorders, before it is painted – is what stops
  // the row flashing at its old position. Keyed on a counter rather than on the
  // order, because the editor's rows are drafts with no ids and an order key
  // built from their positions never changes (the bug fixed earlier today).
  useLayoutEffect(() => {
    clearDrag();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dropCount]);

  const beginDrag = (index: number, groupIndex: number, position: number) => {
    const heights = rows.map((row, i) =>
      row.isSection ? (headingHeights.current[i] ?? HEADING_FALLBACK) : 0,
    );
    const computed = dragPlans(rows, index, heights);
    setPlans(computed, dropOffsets(rows, index, heights, computed));
    setDragState(index, index);
    setLifted({
      index,
      top: (cardTops.current[groupIndex] ?? 0) + position * ROW_SLOT,
    });
    onDragChange(true);
  };

  const finishDrag = (from: number, to: number) => {
    onDragChange(false);
    if (movesAnything(to, from, 1)) {
      // Deliberately does NOT clear the drag here – the layout effect above
      // does it in the commit that applies the new order. Until then the row
      // stays exactly where it was dropped, which is where it belongs.
      setDropCount((count) => count + 1);
      onReorder(from, to);
      return;
    }
    clearDrag();
  };

  const cancelDrag = () => {
    onDragChange(false);
    clearDrag();
  };

  const liftedRow = lifted === null ? null : rows[lifted.index];

  return (
    <View className="w-full gap-layout-small">
      {groups.map((group, groupIndex) => (
        <Fragment key={group.headingIndex ?? "loose"}>
          {group.headingIndex !== null && (
            <View
              className="w-full flex-row items-center gap-comp-small"
              onLayout={(event: LayoutChangeEvent) => {
                headingHeights.current[group.headingIndex!] =
                  event.nativeEvent.layout.height;
              }}
            >
              {/* Tap the NAME to rename; the handle opens the reorder sheet,
                  which is what the Figma header draws it for. */}
              <Pressable
                className="flex-1"
                onPress={() => onEditSection(group.headingIndex!)}
                accessibilityRole="button"
                accessibilityLabel={t("recipes.form.editSection", {
                  name: rows[group.headingIndex].name,
                })}
              >
                <Text className="font-header text-display-6 font-emphasized text-text-default">
                  {rows[group.headingIndex].name}
                </Text>
              </Pressable>
              {rows.length > 1 && (
                <Pressable
                  onPress={onOpenReorderSheet}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={t("recipes.detail.reorderIngredients")}
                >
                  <MaterialIcons
                    name="drag-handle"
                    size={24}
                    color={ds.colors.icon.subtle}
                  />
                </Pressable>
              )}
            </View>
          )}
          <IngredientCard
            groupIndex={groupIndex}
            rowIndices={group.rowIndices}
            rows={rows}
            plans={plans}
            target={target}
            dragFrom={dragFrom}
            dragY={dragY}
            offsets={offsets}
            onLayoutCard={(y) => {
              cardTops.current[groupIndex] = y;
            }}
            onEditRow={onEditRow}
            onDeleteRow={onDeleteRow}
            setDragY={setDragY}
            setTarget={setTarget}
            settleDragY={settleDragY}
            onBeginDrag={(index, position) =>
              beginDrag(index, groupIndex, position)
            }
            onFinishDrag={finishDrag}
            onCancelDrag={cancelDrag}
          />
        </Fragment>
      ))}

      {/* The row in the air. It is a copy rather than the row itself because a
          card clips its own contents – which is exactly what makes the hole and
          the gap read, and exactly what would hide a row travelling between two
          cards. */}
      {liftedRow != null && lifted != null && (
        <FloatingRow
          row={liftedRow}
          top={lifted.top}
          dragFrom={dragFrom}
          dragY={dragY}
        />
      )}
    </View>
  );
}

function IngredientCard({
  groupIndex,
  rowIndices,
  rows,
  plans,
  target,
  dragFrom,
  dragY,
  offsets,
  setDragY,
  setTarget,
  settleDragY,
  onLayoutCard,
  onEditRow,
  onDeleteRow,
  onBeginDrag,
  onFinishDrag,
  onCancelDrag,
}: {
  groupIndex: number;
  rowIndices: number[];
  rows: DraftIngredient[];
  plans: SharedValue<DragPlan[]>;
  target: SharedValue<number>;
  dragFrom: SharedValue<number>;
  dragY: SharedValue<number>;
  offsets: SharedValue<number[]>;
  setDragY: (y: number) => void;
  setTarget: (to: number) => void;
  settleDragY: (to: number, done: () => void) => void;
  onLayoutCard: (y: number) => void;
  onEditRow: (index: number) => void;
  onDeleteRow: (index: number) => void;
  onBeginDrag: (index: number, position: number) => void;
  onFinishDrag: (from: number, to: number) => void;
  onCancelDrag: () => void;
}) {
  const idleHeight = cardHeight(rowIndices.length);
  const idleMargin = cardMarginBottom(rowIndices.length);
  const style = useAnimatedStyle(() => {
    const plan = dragFrom.value < 0 ? undefined : plans.value[target.value];
    if (plan === undefined) {
      return { height: idleHeight, marginBottom: idleMargin };
    }
    return {
      height: withTiming(plan.cardHeights[groupIndex] ?? idleHeight, {
        duration: MOVE_MS,
      }),
      marginBottom: withTiming(plan.cardMarginBottoms[groupIndex] ?? idleMargin, {
        duration: MOVE_MS,
      }),
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
          target={target}
          dragFrom={dragFrom}
          dragY={dragY}
          offsets={offsets}
          setDragY={setDragY}
          setTarget={setTarget}
          settleDragY={settleDragY}
          onEdit={() => onEditRow(index)}
          onDelete={() => onDeleteRow(index)}
          onBeginDrag={onBeginDrag}
          onFinishDrag={onFinishDrag}
          onCancelDrag={onCancelDrag}
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
  target,
  dragFrom,
  dragY,
  offsets,
  setDragY,
  setTarget,
  settleDragY,
  onEdit,
  onDelete,
  onBeginDrag,
  onFinishDrag,
  onCancelDrag,
}: {
  index: number;
  position: number;
  row: DraftIngredient;
  plans: SharedValue<DragPlan[]>;
  target: SharedValue<number>;
  dragFrom: SharedValue<number>;
  dragY: SharedValue<number>;
  offsets: SharedValue<number[]>;
  setDragY: (y: number) => void;
  setTarget: (to: number) => void;
  settleDragY: (to: number, done: () => void) => void;
  onEdit: () => void;
  onDelete: () => void;
  onBeginDrag: (index: number, position: number) => void;
  onFinishDrag: (from: number, to: number) => void;
  onCancelDrag: () => void;
}) {
  const pan = Gesture.Pan()
    .activateAfterLongPress(LIFT_MS)
    .onStart(() => {
      setDragY(0);
      runOnJS(onBeginDrag)(index, position);
    })
    .onUpdate((event) => {
      setDragY(event.translationY);
      // Plain numbers only: the plans were worked out when the row was lifted,
      // so the gesture never calls back into JavaScript while it runs.
      const reachable = offsets.value;
      if (reachable.length === 0) return;
      let best = 0;
      let bestDistance = -1;
      for (let candidate = 0; candidate < reachable.length; candidate += 1) {
        const distance = Math.abs(reachable[candidate] - event.translationY);
        if (bestDistance < 0 || distance < bestDistance) {
          bestDistance = distance;
          best = candidate;
        }
      }
      setTarget(best);
    })
    .onEnd(() => {
      const to = target.value;
      const reachable = offsets.value;
      const settle = to < reachable.length ? reachable[to] : dragY.value;
      // Lands in the gap the list has opened, rather than snapping there once
      // the new order arrives.
      settleDragY(settle, () => {
        "worklet";
        runOnJS(onFinishDrag)(index, to);
      });
    })
    .onFinalize((_event, success) => {
      if (!success && dragFrom.value === index) runOnJS(onCancelDrag)();
    });

  const style = useAnimatedStyle(() => {
    if (dragFrom.value === index) {
      // Its copy is in the air; this is the space it used to fill.
      return { opacity: 0, transform: [{ translateY: 0 }] };
    }
    const plan = dragFrom.value < 0 ? undefined : plans.value[target.value];
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
        <GestureDetector gesture={pan}>
          {/* 57 tall, not 56: the divider is inside the row so that it travels
              with it, and the card is a pixel shorter than its rows so the last
              one is clipped. Nothing has to know which row is currently last,
              which changes while a row is in flight. */}
          <View className="h-[57px] w-full flex-row items-center gap-layout-small border-b border-border-subtle bg-surface-neutral-white px-layout-small">
            <Pressable
              className="min-w-0 flex-1 flex-row items-center gap-layout-small"
              onPress={onEdit}
              accessibilityRole="button"
              accessibilityLabel={t("recipes.form.editRow", { name: row.name })}
              accessibilityHint={t("recipes.form.dragRow")}
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
          </View>
        </GestureDetector>
      </SwipeActions>
    </Animated.View>
  );
}

function FloatingRow({
  row,
  top,
  dragFrom,
  dragY,
}: {
  row: DraftIngredient;
  top: number;
  dragFrom: SharedValue<number>;
  dragY: SharedValue<number>;
}) {
  const style = useAnimatedStyle(() => ({
    opacity: dragFrom.value < 0 ? 0 : 1,
    transform: [{ translateY: dragY.value }],
  }));
  return (
    <Animated.View
      style={[
        {
          pointerEvents: "none",
          position: "absolute",
          left: 0,
          right: 0,
          top,
          height: ROW_HEIGHT,
          zIndex: 10,
          elevation: 4,
          shadowColor: "#000",
          shadowOpacity: 0.16,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
        },
        style,
      ]}
      className="flex-row items-center gap-layout-small rounded-large bg-surface-neutral-lighter px-layout-small"
    >
      <Text className="min-w-0 flex-1 font-paragraph text-paragraph font-default text-text-default">
        {row.name}
      </Text>
      {(row.quantityText?.length ?? 0) > 0 && (
        <Text className="font-paragraph text-paragraph font-default text-text-subtle">
          {row.quantityText}
        </Text>
      )}
    </Animated.View>
  );
}
