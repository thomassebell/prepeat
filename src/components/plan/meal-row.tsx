import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRef } from "react";
import { Pressable, Text, View } from "react-native";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";

import { useExclusiveSwipe } from "@/components/ui/exclusive-swipe";
import { SwipeHint, SwipeRowProvider } from "@/components/ui/swipe-hint";
import { ds } from "@/constants/ds";
import { t } from "@/lib/i18n";
import { type PlanEntry } from "@/lib/meal-plan";

/**
 * One planned meal in a day row (Figma recipe row 147:24404). Swiping left
 * reveals the four edit actions (Figma 147:24725): move to another day,
 * swap meal, change servings, remove.
 *
 * Manual meals ("Leftovers", 2026-07-18) have no recipe: no design exists
 * for their row yet, so they borrow the recipe row with the placeholder
 * icon, no servings line, and no change-servings action (servings are
 * meaningless without ingredients) – flagged in the backlog.
 */
export function MealRow({
  entry,
  onPress,
  onMove,
  onSwap,
  onServings,
  onRemove,
}: {
  entry: PlanEntry;
  /** Tap opens the recipe (feedback 2026-07-16). */
  onPress: () => void;
  onMove: () => void;
  onSwap: () => void;
  onServings: () => void;
  onRemove: () => void;
}) {
  const isManual = entry.recipeId == null;
  const { swipeable, swipeOpening, swipeClosed } = useExclusiveSwipe();
  // Same guard as the shopping rows: while a swipe is engaged, a tap only
  // closes the actions – it never navigates.
  const swipeEngaged = useRef(false);
  const act = (action: () => void) => () => {
    swipeable.current?.close();
    action();
  };
  const handlePress = () => {
    if (swipeEngaged.current) {
      swipeable.current?.close();
      return;
    }
    onPress();
  };

  return (
    <ReanimatedSwipeable
      ref={swipeable}
      friction={2}
      rightThreshold={40}
      overshootRight={false}
      // One open row in the whole app - see exclusive-swipe.ts.
      onSwipeableOpenStartDrag={() => {
        swipeEngaged.current = true;
        swipeOpening();
      }}
      onSwipeableWillOpen={() => {
        swipeEngaged.current = true;
        swipeOpening();
      }}
      onSwipeableClose={() => {
        swipeEngaged.current = false;
        swipeClosed();
      }}
      renderRightActions={() => (
        <View className="flex-row">
          <SwipeAction
            icon="edit-calendar"
            label={t("plan.meal.move")}
            onPress={act(onMove)}
          />
          <SwipeAction
            icon="repeat"
            label={t("plan.meal.swap")}
            onPress={act(onSwap)}
          />
          {!isManual && (
            <SwipeAction
              icon="people-alt"
              label={t("plan.meal.servings")}
              onPress={act(onServings)}
            />
          )}
          <SwipeAction
            icon="delete"
            label={t("plan.meal.remove")}
            destructive
            onPress={act(onRemove)}
          />
        </View>
      )}
    >
      <SwipeRowProvider open={() => swipeable.current?.openRight()}>
        <Pressable
          onPress={handlePress}
          accessibilityRole="button"
          accessibilityLabel={
            isManual
              ? entry.recipeTitle
              : t("plan.meal.open", { title: entry.recipeTitle })
          }
          className="w-full flex-row items-center gap-comp-small border-b border-border-subtle bg-surface-neutral-white py-comp-small pl-comp-small pr-comp-large"
        >
          {entry.recipeImageUrl ? (
            <Image
              source={{ uri: entry.recipeImageUrl }}
              style={{ width: 40, height: 40, borderRadius: 8 }}
              contentFit="cover"
            />
          ) : (
            <View className="h-[40px] w-[40px] items-center justify-center rounded-small bg-surface-neutral-lighter">
              <MaterialIcons
                name="restaurant"
                size={20}
                color={ds.colors.icon.subtle}
              />
            </View>
          )}
          <View className="min-w-0 flex-1">
            <Text
              numberOfLines={1}
              className="font-header text-display-6 font-emphasized leading-xsmall text-text-subtle"
            >
              {entry.recipeTitle}
            </Text>
            {!isManual && (
              <View className="flex-row items-center gap-comp-small">
                <MaterialIcons
                  name="people-alt"
                  size={16}
                  color={ds.colors.icon.default}
                />
                <Text className="font-paragraph text-small font-default leading-xxsmall text-text-default">
                  {t("plan.servings.count", { count: entry.servings })}
                </Text>
              </View>
            )}
          </View>
          <SwipeHint />
        </Pressable>
      </SwipeRowProvider>
    </ReanimatedSwipeable>
  );
}

function SwipeAction({
  icon,
  label,
  destructive = false,
  onPress,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  destructive?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className={
        "h-full w-[56px] items-center justify-center " +
        (destructive ? "bg-error-main" : "bg-surface-neutral-lighter")
      }
    >
      <MaterialIcons
        name={icon}
        size={24}
        color={
          destructive
            ? ds.colors.error["contrast-text"]
            : ds.colors.icon.default
        }
      />
    </Pressable>
  );
}
