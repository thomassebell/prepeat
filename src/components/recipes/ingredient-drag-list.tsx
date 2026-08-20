import { MaterialIcons } from "@expo/vector-icons";
import { Fragment, useRef } from "react";
import { Pressable, Text, View, type LayoutChangeEvent } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  withTiming,
  type AnimatedRef,
} from "react-native-reanimated";

import { SwipeActions } from "@/components/recipes/swipe-actions";
import {
  DragGrip,
  MOVE_MS,
  useBlockDrag,
  useInPlaceDrag,
  type InPlaceDrag,
} from "@/components/recipes/use-in-place-drag";
import { ds } from "@/constants/ds";
import { t } from "@/lib/i18n";
import {
  ROW_HEIGHT,
  blockSizeFor,
  cardHeight,
  cardMarginBottom,
  groupForDrag,
} from "@/lib/ingredient-drag-layout";
import type { DraftIngredient } from "@/lib/recipes";

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
 * dragged there is no reason to keep it.
 *
 * **EVERY ITEM HAS A GRIP, ROWS INCLUDED** (Thomas, same day: *"in one case the
 * drag handle is telling users this is draggable – but also communicating that
 * ingredient is not"*). A grip on the headings alone did not merely fail to
 * advertise the rows, it argued against them. The grip is also what removes the
 * hold: a tap and a drag begin identically on a row, so something had to
 * separate them and that something was a 200ms wait; a grip means one thing, so
 * a drag from one starts on the first few pixels of movement. The hold survives
 * on a row's body and a heading's name as an unadvertised shortcut. Tapping a
 * row still opens the edit sheet, tapping a heading still renames it, swiping
 * still deletes.
 *
 * The grips line up in one column because the heading carries a right padding
 * that the rows get from their card – the reorder sheet's own rule (Figma
 * 508:13966), which is also where the precedent for a grip on every row comes
 * from. Thomas's pattern moved onto the real list, not a new one invented here.
 *
 * The drag machinery is shared with the instruction list
 * (`use-in-place-drag.tsx`) and the geometry is in
 * `src/lib/ingredient-drag-layout.ts`, checked by
 * `scripts/check-ingredient-drag.mjs`. What lives in THIS file is only what an
 * ingredient row and a section heading look like.
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
  scrollRef: AnimatedRef<Animated.ScrollView>;
  onEditRow: (index: number) => void;
  onDeleteRow: (index: number) => void;
  onEditSection: (index: number) => void;
  onReorder: (from: number, size: number, target: number) => void;
  onDragChange: (dragging: boolean) => void;
}) {
  const groups = groupForDrag(rows);
  const drag = useInPlaceDrag({ items: rows, scrollRef, onReorder, onDragChange });
  // Where things are actually drawn, so the floating copy starts exactly where
  // the thing it replaces was – a model that is a pixel out cannot then make it
  // jump the moment it is lifted.
  const headingTops = useRef<number[]>([]);
  const cardTops = useRef<number[]>([]);
  const rowTops = useRef<number[]>([]);

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
              drag={drag}
              onLayoutHeading={(y, height) => {
                headingTops.current[group.headingIndex!] = y;
                drag.measuredHeading(group.headingIndex!, height);
              }}
              onEditSection={onEditSection}
              onBeginDrag={(from, size) =>
                drag.beginDrag(from, size, headingTops.current[from] ?? 0)
              }
            />
          )}
          <IngredientCard
            groupIndex={groupIndex}
            rowIndices={group.rowIndices}
            rows={rows}
            drag={drag}
            onLayoutCard={(y) => {
              cardTops.current[groupIndex] = y;
            }}
            onLayoutRow={(index, y, height) => {
              rowTops.current[index] = y;
              drag.measured(index, height);
            }}
            onEditRow={onEditRow}
            onDeleteRow={onDeleteRow}
            onBeginDrag={(from) =>
              drag.beginDrag(
                from,
                1,
                (cardTops.current[groupIndex] ?? 0) + (rowTops.current[from] ?? 0),
              )
            }
          />
        </Fragment>
      ))}

      {/* The thing in the air. It is a copy rather than the row or section
          itself because a card clips its own contents – which is exactly what
          makes the hole and the gap read, and exactly what would hide anything
          travelling between two cards. */}
      {drag.lifted != null && (
        <FloatingBlock
          rows={rows}
          from={drag.lifted.from}
          size={drag.lifted.size}
          top={drag.lifted.top}
          drag={drag}
        />
      )}
    </View>
  );
}

function SectionHeading({
  index,
  groupIndex,
  name,
  size,
  draggable,
  drag,
  onLayoutHeading,
  onEditSection,
  onBeginDrag,
}: {
  index: number;
  groupIndex: number;
  name: string;
  size: number;
  draggable: boolean;
  drag: InPlaceDrag;
  onLayoutHeading: (y: number, height: number) => void;
  onEditSection: (index: number) => void;
  onBeginDrag: (from: number, size: number) => void;
}) {
  const begin = () => onBeginDrag(index, size);
  const gripPan = useBlockDrag({
    index,
    size,
    immediate: true,
    drag,
    onBeginDrag: begin,
  });
  const namePan = useBlockDrag({
    index,
    size,
    immediate: false,
    drag,
    onBeginDrag: begin,
  });
  const { dragFrom, dragSize, plans, slot } = drag;

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
      // grips below, which get theirs from the card's own padding – the reorder
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
          accessibilityActions={draggable ? drag.moveActions : undefined}
          onAccessibilityAction={drag.moveAction(index, size)}
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
  drag,
  onLayoutCard,
  onLayoutRow,
  onEditRow,
  onDeleteRow,
  onBeginDrag,
}: {
  groupIndex: number;
  rowIndices: number[];
  rows: DraftIngredient[];
  drag: InPlaceDrag;
  onLayoutCard: (y: number) => void;
  onLayoutRow: (index: number, y: number, height: number) => void;
  onEditRow: (index: number) => void;
  onDeleteRow: (index: number) => void;
  onBeginDrag: (from: number) => void;
}) {
  // Every ingredient row is the same height, so this card's idle size is known
  // without measuring anything – unlike the instruction list, where it is not.
  const idleHeight = cardHeight(rowIndices.map(() => ROW_HEIGHT));
  const idleMargin = cardMarginBottom(rowIndices.length);
  // The card belongs to the block in the air when its own heading does. The
  // heading sits one index below the card's first row.
  const headingIndex = rowIndices.length > 0 ? rowIndices[0] - 1 : -1;
  const { dragFrom, dragSize, plans, slot } = drag;

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
      {rowIndices.map((index) => (
        <IngredientRow
          key={index}
          index={index}
          row={rows[index]}
          drag={drag}
          onLayoutRow={onLayoutRow}
          onEdit={() => onEditRow(index)}
          onDelete={() => onDeleteRow(index)}
          onBeginDrag={onBeginDrag}
        />
      ))}
    </Animated.View>
  );
}

function IngredientRow({
  index,
  row,
  drag,
  onLayoutRow,
  onEdit,
  onDelete,
  onBeginDrag,
}: {
  index: number;
  row: DraftIngredient;
  drag: InPlaceDrag;
  onLayoutRow: (index: number, y: number, height: number) => void;
  onEdit: () => void;
  onDelete: () => void;
  onBeginDrag: (from: number) => void;
}) {
  const begin = () => onBeginDrag(index);
  const gripPan = useBlockDrag({
    index,
    size: 1,
    immediate: true,
    drag,
    onBeginDrag: begin,
  });
  const bodyPan = useBlockDrag({
    index,
    size: 1,
    immediate: false,
    drag,
    onBeginDrag: begin,
  });
  const { dragFrom, dragSize, plans, slot } = drag;

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
    <Animated.View
      style={style}
      className="w-full"
      onLayout={(event: LayoutChangeEvent) =>
        onLayoutRow(
          index,
          event.nativeEvent.layout.y,
          event.nativeEvent.layout.height,
        )
      }
    >
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
              accessibilityActions={drag.moveActions}
              onAccessibilityAction={drag.moveAction(index, 1)}
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
  drag,
}: {
  rows: DraftIngredient[];
  from: number;
  size: number;
  top: number;
  drag: InPlaceDrag;
}) {
  const { dragFrom, dragY } = drag;
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
          <GripGhost />
        </View>
      )}
      {carried.length > 0 && (
        <View
          style={{ height: cardHeight(carried.map(() => ROW_HEIGHT)) }}
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
              <GripGhost />
            </View>
          ))}
        </View>
      )}
    </Animated.View>
  );
}

/** The grip as drawn on the copy under the finger: the same icon with none of
 *  the gesture, since the copy is not something you can grab. */
function GripGhost() {
  return (
    <View className="items-center justify-center">
      <MaterialIcons
        name="drag-handle"
        size={24}
        color={ds.colors.icon.subtle}
      />
    </View>
  );
}
