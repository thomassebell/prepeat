import { MaterialIcons } from "@expo/vector-icons";
import { useRef } from "react";
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

/**
 * The recipe editor's instructions, dragged in place exactly as the
 * ingredients are (Thomas, 2026-08-20: *"yes, do the instructions too"*) – the
 * last list on the recipe screens that still reordered through a sheet, and the
 * last thing keeping this morning's sheet bug reachable from here.
 *
 * TWO THINGS MAKE IT SIMPLER THAN THE INGREDIENTS, and one makes it harder.
 * Simpler: there are no sections, so nothing ever moves as a block and no card
 * is ever left empty. Harder: **an instruction wraps onto as many lines as it
 * needs**, so none of the rows are the same height. That is why the geometry
 * takes measured sizes rather than a row count – the ingredient list happens
 * not to need it, and this one cannot work without it.
 *
 * A step number is a POSITION, not a name: the numbers renumber themselves the
 * moment the order changes, which is also why the copy under the finger keeps
 * the number it started with until it lands.
 */
export function InstructionDragList({
  steps,
  scrollRef,
  onEditStep,
  onDeleteStep,
  onReorder,
  onDragChange,
}: {
  steps: string[];
  scrollRef: AnimatedRef<Animated.ScrollView>;
  onEditStep: (index: number) => void;
  onDeleteStep: (index: number) => void;
  onReorder: (from: number, size: number, target: number) => void;
  onDragChange: (dragging: boolean) => void;
}) {
  // The model only ever asks whether an entry is a section heading. None of
  // these are, so the whole list is one card and every landing is legal.
  const items = steps.map(() => ({}));
  const drag = useInPlaceDrag({ items, scrollRef, onReorder, onDragChange });
  const rowTops = useRef<number[]>([]);

  const { dragFrom, plans, slot } = drag;
  const cardStyle = useAnimatedStyle(() => {
    const plan = dragFrom.value < 0 ? undefined : plans.value[slot.value];
    // No height at all when nothing is moving: the rows decide it, which is the
    // only honest answer when every one of them is a different height. An
    // explicit height only appears once a plan says what it should become.
    if (plan === undefined) return {};
    return {
      height: withTiming(plan.cardHeights[0] ?? 0, { duration: MOVE_MS }),
    };
  });

  return (
    <View className="w-full">
      {/* Pulled out to the box's edges, as before – the rows are full-bleed
          inside a padded card. */}
      <Animated.View
        style={[{ marginHorizontal: -16, marginTop: -16 }, cardStyle]}
        // The rows are full-bleed, so THEY round the box's top corners and
        // clip themselves to them - the box no longer does it, because a box
        // that clips its children also clips the step in the air.
        className="w-full overflow-hidden rounded-t-large"
      >
        {steps.map((step, index) => (
          <InstructionRow
            key={index}
            index={index}
            step={step}
            drag={drag}
            onLayoutRow={(y, height) => {
              rowTops.current[index] = y;
              drag.measured(index, height);
            }}
            onEdit={() => onEditStep(index)}
            onDelete={() => onDeleteStep(index)}
            onBeginDrag={() =>
              drag.beginDrag(index, 1, (rowTops.current[index] ?? 0) - 16)
            }
          />
        ))}
      </Animated.View>

      {drag.lifted != null && (
        <FloatingStep
          step={steps[drag.lifted.from] ?? ""}
          number={drag.lifted.from + 1}
          top={drag.lifted.top}
          drag={drag}
        />
      )}
    </View>
  );
}

function InstructionRow({
  index,
  step,
  drag,
  onLayoutRow,
  onEdit,
  onDelete,
  onBeginDrag,
}: {
  index: number;
  step: string;
  drag: InPlaceDrag;
  onLayoutRow: (y: number, height: number) => void;
  onEdit: () => void;
  onDelete: () => void;
  onBeginDrag: () => void;
}) {
  const gripPan = useBlockDrag({
    index,
    size: 1,
    immediate: true,
    drag,
    onBeginDrag,
  });
  const bodyPan = useBlockDrag({
    index,
    size: 1,
    immediate: false,
    drag,
    onBeginDrag,
  });
  const { dragFrom, plans, slot } = drag;

  const style = useAnimatedStyle(() => {
    if (dragFrom.value === index) {
      // Its copy is in the air; this is the space it used to fill.
      return { opacity: 0, transform: [{ translateY: 0 }] };
    }
    const plan = dragFrom.value < 0 ? undefined : plans.value[slot.value];
    if (plan === undefined) {
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
        onLayoutRow(event.nativeEvent.layout.y, event.nativeEvent.layout.height)
      }
    >
      <SwipeActions
        label={`step ${index + 1}`}
        onEdit={onEdit}
        onDelete={onDelete}
      >
        {/* The divider belongs to the row, so it travels with it – and the card
            is a pixel shorter than its rows add up to, which clips the last
            one. The line before the Add button below is drawn separately. */}
        <View className="w-full flex-row items-start gap-comp-small border-b border-border-subtle bg-surface-neutral-white px-layout-small py-layout-small">
          <GestureDetector gesture={bodyPan}>
            <Pressable
              className="min-w-0 flex-1 flex-row items-start gap-layout-small"
              onPress={onEdit}
              accessibilityRole="button"
              accessibilityLabel={t("recipes.form.editStep", {
                number: index + 1,
              })}
              accessibilityHint={t("recipes.form.dragRow")}
              accessibilityActions={drag.moveActions}
              onAccessibilityAction={drag.moveAction(index, 1)}
            >
              <StepNumber number={index + 1} />
              <Text
                style={{ paddingTop: 4 }}
                className="min-w-0 flex-1 font-paragraph text-paragraph font-default leading-xsmall text-text-default"
              >
                {step}
              </Text>
            </Pressable>
          </GestureDetector>
          {/* Top-aligned: on a five-line instruction a centred grip floats in
              the middle of a paragraph with nothing to hold on to. */}
          <DragGrip gesture={gripPan} align="start" />
        </View>
      </SwipeActions>
    </Animated.View>
  );
}

function StepNumber({ number }: { number: number }) {
  return (
    <View className="min-w-[32px] items-center justify-center rounded-xlarge bg-surface-neutral-main px-comp-medium py-comp-small">
      <Text className="font-paragraph text-small font-emphasized leading-xxsmall text-text-default">
        {number}
      </Text>
    </View>
  );
}

function FloatingStep({
  step,
  number,
  top,
  drag,
}: {
  step: string;
  number: number;
  top: number;
  drag: InPlaceDrag;
}) {
  const { dragFrom, dragY } = drag;
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
          left: -16,
          right: -16,
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
      className="w-auto flex-row items-start gap-comp-small rounded-large bg-surface-neutral-lighter px-layout-small py-layout-small"
    >
      <View className="min-w-0 flex-1 flex-row items-start gap-layout-small">
        <StepNumber number={number} />
        <Text
          style={{ paddingTop: 4 }}
          className="min-w-0 flex-1 font-paragraph text-paragraph font-default leading-xsmall text-text-default"
        >
          {step}
        </Text>
      </View>
      <View className="items-center justify-start">
        <MaterialIcons
          name="drag-handle"
          size={24}
          color={ds.colors.icon.subtle}
        />
      </View>
    </Animated.View>
  );
}
