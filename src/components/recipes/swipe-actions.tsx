import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";

import { useExclusiveSwipe } from "@/components/ui/exclusive-swipe";
import { SwipeRowProvider } from "@/components/ui/swipe-hint";
import { ds } from "@/constants/ds";
import { t } from "@/lib/i18n";

/**
 * Swipe-left edit/delete actions – the same interaction as the shopping
 * list rows, shared by recipe ingredient and instruction rows everywhere.
 */
export function SwipeActions({
  onEdit,
  onDelete,
  children,
  label,
}: {
  onEdit: () => void;
  onDelete: () => void;
  children: React.ReactNode;
  label: string;
}) {
  const { swipeable, swipeOpening, swipeClosed } = useExclusiveSwipe();
  return (
    <ReanimatedSwipeable
      ref={swipeable}
      friction={2}
      rightThreshold={40}
      overshootRight={false}
      // One open row in the whole app - see exclusive-swipe.ts.
      onSwipeableOpenStartDrag={swipeOpening}
      onSwipeableWillOpen={swipeOpening}
      onSwipeableClose={swipeClosed}
      renderRightActions={() => (
        <View className="flex-row">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("recipes.row.edit", { label })}
            onPress={() => {
              swipeable.current?.close();
              onEdit();
            }}
            className="w-[56px] items-center justify-center bg-surface-neutral-light"
          >
            <MaterialIcons
              name="edit-note"
              size={24}
              color={ds.colors.icon.default}
            />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("recipes.row.delete", { label })}
            onPress={() => {
              swipeable.current?.close();
              onDelete();
            }}
            className="w-[56px] items-center justify-center bg-error"
          >
            <MaterialIcons
              name="delete"
              size={20}
              color={ds.colors.text.inverse}
            />
          </Pressable>
        </View>
      )}
    >
      <SwipeRowProvider open={() => swipeable.current?.openRight()}>
        {children}
      </SwipeRowProvider>
    </ReanimatedSwipeable>
  );
}
