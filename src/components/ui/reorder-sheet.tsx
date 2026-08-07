import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";

import { BottomSheet } from "@/components/ui/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  runOnJS,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { ds } from "@/constants/ds";
import {
  blockSizeAt,
  moveBlock,
  movesAnything,
  targetTopSlots,
  validTargets,
} from "@/lib/reorder";

// Every item occupies one slot of this height, headings included.
// THIS MATCHES THE DESIGN rather than flattening it (checked against Figma
// 508:13822 on 2026-08-07): a heading is drawn 24 tall with 16 of space either
// side, so in the body of the list a heading plus its gaps occupies exactly 56 -
// the same as an ingredient row. That is what keeps the drag maths integer even
// though a section is a variable NUMBER of rows.
// Known cosmetic gap: the design gives the FIRST heading no space above it, so
// the real list is 16px shorter at the top than uniform slots draw. Logged
// rather than fixed here.
const ROW_HEIGHT = 56;

export interface ReorderItem {
  key: string;
  label: string;
  /**
   * A section heading rather than a row. Draws as a heading on the sheet's own
   * background, with its own handle, per Figma 508:13822. Lists without
   * sections (instructions, shopping categories) simply never set it.
   */
  isSection?: boolean;
}

/**
 * Generic drag-to-reorder sheet – the same interaction as the shopping
 * list's category reordering, reused for recipe ingredients and
 * instructions (Thomas, 2026-07-12).
 */
export function ReorderSheet({
  visible,
  title,
  hint,
  items,
  onClose,
  onChange,
}: {
  visible: boolean;
  title: string;
  hint: string;
  items: ReorderItem[];
  onClose: () => void;
  onChange: (orderedKeys: string[]) => void;
}) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  // While a row is being dragged, freeze the scroll so the two vertical
  // gestures don't fight for the touch.
  const [dragging, setDragging] = useState(false);
  // Which items are lifted, so a whole section can show the dragged look rather
  // than just the heading under the finger. null = nothing is dragging.
  const [liftedBlock, setLiftedBlock] = useState<{
    from: number;
    size: number;
  } | null>(null);
  // Shared drag state so the OTHER rows can slide aside and open a gap where
  // the dragged row will land (Thomas, 2026-07-25). -1 = nothing is dragging.
  // The rows only READ these; writes go through setDrag, because the React
  // Compiler forbids a child mutating a shared value it received as a prop.
  const activeIndex = useSharedValue(-1);
  const activeSize = useSharedValue(0);
  const hoverIndex = useSharedValue(-1);
  // The live finger offset, hoisted out of the row so that every member of a
  // dragged section can follow the same value rather than only the heading.
  const dragY = useSharedValue(0);
  // Where the block's top will settle, in pixels. Written while dragging so the
  // release animation does not have to recompute the snap.
  const hoverTop = useSharedValue(0);
  const setDrag = (active: number, size: number, hover: number) => {
    "worklet";
    activeIndex.value = active;
    activeSize.value = size;
    hoverIndex.value = hover;
  };
  const setDragY = (y: number) => {
    "worklet";
    dragY.value = y;
  };
  const setHoverTop = (top: number) => {
    "worklet";
    hoverTop.value = top;
  };
  // The release animation lives here rather than in the row for the same reason
  // as every other setter above: dragY is now SHARED between the rows of a
  // dragged section, so it is the sheet's value and the React Compiler will not
  // let a child assign to it.
  const settleDragY = (to: number, done: () => void) => {
    "worklet";
    dragY.value = withTiming(to, { duration: 120 }, done);
  };
  // Cap the sheet below the status bar / notch so a long ingredient list can't
  // push the title and close button off the top of the screen; the rows scroll
  // inside instead (Thomas, 2026-07-25: close was unreachable on a long list).
  // The list is capped rather than the sheet, so a long recipe scrolls its rows
  // while the title and close stay put (Thomas, 2026-07-25: close was
  // unreachable on a long list).
  const listMaxHeight = windowHeight - insets.top - 220;
  return (
    <BottomSheet
      visible={visible}
      title={title}
      subtitle={hint}
      onClose={onClose}
    >
      {/* Gestures inside a Modal need their own root on iOS. */}
      <GestureHandlerRootView style={{ flexShrink: 1 }}>
          <ScrollView
            scrollEnabled={!dragging}
            showsVerticalScrollIndicator={false}
            style={{ flexShrink: 1, maxHeight: listMaxHeight }}
            contentContainerStyle={{ height: items.length * ROW_HEIGHT }}
          >
            {items.map((item, index) => {
              const size = blockSizeAt(items, index);
              const targets = validTargets(items, index, size);
              return (
                <DraggableRow
                  key={item.key}
                  item={item}
                  index={index}
                  size={size}
                  count={items.length}
                  targets={targets}
                  // Precomputed on the JS side so the drag worklet only ever
                  // reads plain numbers - it never has to call back into
                  // JavaScript mid-gesture.
                  targetTops={targetTopSlots(targets, index, size)}
                  lifted={
                    liftedBlock != null &&
                    index >= liftedBlock.from &&
                    index < liftedBlock.from + liftedBlock.size
                  }
                  firstInCard={
                    !item.isSection &&
                    (index === 0 || items[index - 1].isSection === true)
                  }
                  lastInCard={
                    !item.isSection &&
                    (index === items.length - 1 ||
                      items[index + 1].isSection === true)
                  }
                  activeIndex={activeIndex}
                  activeSize={activeSize}
                  hoverIndex={hoverIndex}
                  dragY={dragY}
                  hoverTop={hoverTop}
                  setDrag={setDrag}
                  setDragY={setDragY}
                  setHoverTop={setHoverTop}
                  settleDragY={settleDragY}
                  onDragChange={(active) => {
                    setDragging(active);
                    setLiftedBlock(active ? { from: index, size } : null);
                  }}
                  onMove={(from, blockSize, to) => {
                    onChange(
                      moveBlock(items, from, blockSize, to).map(
                        (entry) => entry.key,
                      ),
                    );
                  }}
                />
              );
            })}
          </ScrollView>
      </GestureHandlerRootView>
    </BottomSheet>
  );
}

function DraggableRow({
  item,
  index,
  size,
  count,
  targets,
  targetTops,
  lifted,
  firstInCard,
  lastInCard,
  onMove,
  onDragChange,
  activeIndex,
  activeSize,
  hoverIndex,
  dragY,
  hoverTop,
  setDrag,
  setDragY,
  setHoverTop,
  settleDragY,
}: {
  item: ReorderItem;
  index: number;
  size: number;
  count: number;
  targets: number[];
  targetTops: number[];
  lifted: boolean;
  firstInCard: boolean;
  lastInCard: boolean;
  onMove: (from: number, size: number, to: number) => void;
  onDragChange: (dragging: boolean) => void;
  activeIndex: SharedValue<number>;
  activeSize: SharedValue<number>;
  hoverIndex: SharedValue<number>;
  dragY: SharedValue<number>;
  hoverTop: SharedValue<number>;
  setDrag: (active: number, size: number, hover: number) => void;
  setDragY: (y: number) => void;
  setHoverTop: (top: number) => void;
  settleDragY: (to: number, done: () => void) => void;
}) {
  // Runs back on the JS thread so that "did this actually move anything" lives
  // in src/lib/reorder.ts and nowhere else. The worklet deliberately does not
  // carry its own copy of the rule: one shape rebuilt by hand in two places is
  // how the isSection bug survived three device builds (2026-08-06).
  const finishDrag = (to: number) => {
    onDragChange(false);
    setDragY(0);
    if (movesAnything(to, index, size)) {
      onMove(index, size, to);
    }
  };

  const pan = Gesture.Pan()
    .onStart(() => {
      setDrag(index, size, index);
      setDragY(0);
      runOnJS(onDragChange)(true);
    })
    .onUpdate((event) => {
      // The block cannot leave the list: its top stops at slot 0 and its bottom
      // at the last slot.
      const min = -index * ROW_HEIGHT;
      const max = (count - size - index) * ROW_HEIGHT;
      const offset = Math.max(min, Math.min(max, event.translationY));
      setDragY(offset);
      // Snap to the nearest place this unit is ALLOWED to land, measured
      // against where the block's top edge currently sits. For a plain row every
      // slot is allowed, so this reduces to the old round-to-nearest-slot; for a
      // section only boundaries are in `targets`, which is what makes a group
      // refuse to land inside another section.
      const wanted = index * ROW_HEIGHT + offset;
      let best = 0;
      let bestDistance = -1;
      for (let i = 0; i < targets.length; i += 1) {
        const distance = Math.abs(targetTops[i] * ROW_HEIGHT - wanted);
        if (bestDistance < 0 || distance < bestDistance) {
          bestDistance = distance;
          best = i;
        }
      }
      setDrag(index, size, targets[best]);
      setHoverTop(targetTops[best] * ROW_HEIGHT);
    })
    .onEnd(() => {
      const to = hoverIndex.value;
      settleDragY(hoverTop.value - index * ROW_HEIGHT, () => {
        "worklet";
        setDrag(-1, 0, -1);
        runOnJS(finishDrag)(to);
      });
    });

  const animatedStyle = useAnimatedStyle(() => {
    const from = activeIndex.value;
    if (from === -1) {
      return { transform: [{ translateY: withTiming(0, { duration: 140 }) }] };
    }
    const blockSize = activeSize.value;
    // Every row of the dragged section follows the finger together.
    if (index >= from && index < from + blockSize) {
      return { transform: [{ translateY: dragY.value }] };
    }
    // Everyone the block passes over closes up behind it by the block's own
    // height, which opens the gap it will drop into.
    const to = hoverIndex.value;
    let shift = 0;
    if (to > from + blockSize && index >= from + blockSize && index < to) {
      shift = -blockSize * ROW_HEIGHT;
    } else if (to < from && index >= to && index < from) {
      shift = blockSize * ROW_HEIGHT;
    }
    return {
      transform: [{ translateY: withTiming(shift, { duration: 140 }) }],
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          top: index * ROW_HEIGHT,
          height: ROW_HEIGHT,
          width: "100%",
        },
        lifted ? { zIndex: 10, elevation: 4 } : undefined,
        animatedStyle,
      ]}
      className={
        item.isSection
          ? // A heading has no card behind it; the right padding lines its
            // handle up with the row handles below (Figma 508:13966).
            "flex-row items-center pr-layout-small"
          : "flex-row items-center px-layout-small " +
            (lifted
              ? "bg-surface-neutral-lighter"
              : "bg-surface-neutral-white") +
            (firstInCard ? " rounded-t-large" : "") +
            (lastInCard ? " rounded-b-large" : "") +
            (lastInCard ? "" : " border-b border-border-subtle")
      }
    >
      <Text
        numberOfLines={1}
        className={
          item.isSection
            ? "flex-1 font-header text-display-6 font-emphasized text-text-default"
            : "flex-1 font-paragraph text-paragraph font-default text-text-default"
        }
      >
        {item.label}
      </Text>
      <GestureDetector gesture={pan}>
        <View
          accessibilityLabel={`Reorder ${item.label}`}
          hitSlop={12}
          className="h-full items-center justify-center px-comp-small"
        >
          <MaterialIcons
            name="drag-handle"
            size={24}
            color={ds.colors.text.accent}
          />
        </View>
      </GestureDetector>
    </Animated.View>
  );
}
