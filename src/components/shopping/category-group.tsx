import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';

import { ds } from '@/constants/ds';

import { ItemRow } from '@/components/shopping/item-row';
import type { ShoppingItem } from '@/lib/shopping-list';

interface CategoryGroupProps {
  /** Omitted for the uncategorized group at the top of the list. */
  title?: string;
  items: ShoppingItem[];
  onToggle: (id: string) => void;
  onEdit: (item: ShoppingItem) => void;
  onDelete: (id: string) => void;
  onReorder?: () => void;
  /** Hold-and-drag on the handle reorders categories inline. */
  dragGesture?: React.ComponentProps<typeof GestureDetector>['gesture'];
}

export function CategoryGroup({
  title,
  items,
  onToggle,
  onEdit,
  onDelete,
  onReorder,
  dragGesture,
}: CategoryGroupProps) {
  if (items.length === 0) return null;
  // No reorder callback and no gesture means there is nothing to reorder - draw
  // no handle rather than a dead one (Thomas, 2026-08-07).
  const canReorder = onReorder != null || dragGesture != null;
  const handle = (
    <Pressable
      onPress={onReorder}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel="Reorder categories">
      {/* 24, not 22, to sit beside the taller heading the way the recipe
          screen's handle does - the two screens now draw the same row. */}
      <MaterialIcons name="drag-handle" size={24} color={ds.colors.icon.subtle} />
    </Pressable>
  );
  return (
    // The animation wrapper stays style-free: rows fade out/in when an item
    // settles into the done section, and the layout transitions slide the
    // remaining rows and following groups smoothly into the freed space.
    <Animated.View layout={LinearTransition.duration(250)} exiting={FadeOut.duration(150)}>
      {/* The rhythm is: gap small - category header - gap small (Thomas,
          2026-08-07). 16 either side of the heading. The 16 ABOVE comes from the
          list's own gap in shopping.tsx; this is the 16 below, which was 8.
          The Figma frame still shows 8 here (35:7226 header y=0 h=24, content
          y=32) - it predates the heading growing from 16px text to 24px the same
          day, so the frame is behind, not in disagreement. The recipe sections
          this was asked to match already use 16, as does the done band, so this
          was the last one out of step. */}
      <View className="w-full gap-layout-small px-layout-small">
        {title != null && (
          <View className="w-full flex-row items-center gap-comp-small">
            {/* Same treatment as a recipe's ingredient SECTION heading (Thomas,
                2026-08-07: "the category style on shopping should match the
                style of recipe sections"). The two are the same idea - a
                heading over a card of rows - and were drawn differently only
                because sections arrived three weeks later.
                Token-for-token identical to the heading in recipes/[id].tsx, so
                a DS retune moves both. Was: font-paragraph text-small. */}
            <Text className="flex-1 font-header text-display-6 font-emphasized leading-xsmall text-text-default">
              {title}
            </Text>
            {dragGesture ? (
              <GestureDetector gesture={dragGesture}>{handle}</GestureDetector>
            ) : canReorder ? (
              handle
            ) : null}
          </View>
        )}
        <View className="w-full overflow-hidden rounded-large">
          {items.map((item, index) => (
            <Animated.View
              key={item.id}
              entering={FadeIn.duration(200)}
              exiting={FadeOut.duration(150)}
              layout={LinearTransition.duration(250)}>
              {index > 0 && <View className="h-px w-full bg-surface-neutral-lightest" />}
              <ItemRow
                item={item}
                onToggle={() => onToggle(item.id)}
                onEdit={() => onEdit(item)}
                onDelete={() => onDelete(item.id)}
              />
            </Animated.View>
          ))}
        </View>
      </View>
    </Animated.View>
  );
}
