import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { AddMealSheet } from "@/components/plan/add-meal-sheet";
import { DayRow } from "@/components/plan/day-row";
import { MoveDaySheet } from "@/components/plan/move-day-sheet";
import { ServingsSheet } from "@/components/plan/servings-sheet";
import { LoadError } from "@/components/ui/load-error";
import { UndoToast } from "@/components/ui/undo-toast";
import { WeekPicker } from "@/components/ui/week-picker";
import { ds } from "@/constants/ds";
import { Spacing, tabBarClearance } from "@/constants/theme";
import { useHousehold } from "@/lib/household-context";
import {
  MealPlanProvider,
  useMealPlan,
  type PlanEntry,
} from "@/lib/meal-plan";
import { hasAnyRecipe } from "@/lib/recipes";
import { useTodayKey } from "@/lib/use-today";
import { DAY_LABELS, DAY_NAMES, weekDates } from "@/lib/week";

// The Plan tab (the (plan) group's index keeps it at "/", so the app
// opens here): the weekly meal
// plan (Figma "Plan" page, reviewed 2026-07-16). Days hold a flat list of
// meals; the week switcher moves between existing weeks; "+" adds the next
// week; "Add all to shopping list" links the week to the list, after which
// plan edits reconcile automatically (A + rails).

// Which kitchens have already had their launch nudge. ONCE PER LAUNCH – the
// nudge moves you off an empty week; it must never PIN you to Recipes.
const launchNudged = new Set<string>();

/**
 * An empty cookbook opens on Recipes instead of on an empty week.
 *
 * Not "first launch" – the cookbook itself is the signal. Someone who sets the
 * app up and closes it to do the real job another time has not learned anything
 * yet, so a first-launch flag would drop them on the empty week next morning
 * (Thomas, 2026-08-10). Self-correcting: the moment a recipe exists, Plan opens
 * for good.
 *
 * ⚠️ NAVIGATES, rather than rendering <Redirect>, and that is the whole trick.
 * A tab screen stays MOUNTED while you are on another tab, so a redirect held
 * in render state fires again on every visit – which locked people out of the
 * plan entirely until they saved a recipe (found on device 2026-08-10). A
 * one-shot navigation in an effect cannot do that: it happens once and leaves
 * no state behind to repeat itself.
 *
 * ⚠️ ONLY WHILE PLAN IS FOCUSED (2026-08-16). It used to be a plain effect on
 * `household.id`, so switching to a kitchen with no recipes fired it while you
 * were standing on Settings and threw you onto Recipes – you had just chosen a
 * kitchen, and the app answered by moving you somewhere you did not ask to go
 * (Thomas, on device). A nudge whose whole job is "do not open on an empty
 * week" has no business running when the week is not what you are looking at.
 * Blur cancels the in-flight check too, so a slow query cannot land late.
 *
 * Deliberately NOT blocking. Everyone with recipes – nearly every launch – gets
 * the plan with no delay; only the empty case is moved.
 */
function useEmptyCookbookNudge(): void {
  const household = useHousehold();
  const router = useRouter();
  useFocusEffect(
    useCallback(() => {
      if (launchNudged.has(household.id)) return;
      let cancelled = false;
      hasAnyRecipe(household.id)
        .then((has) => {
          if (cancelled) return;
          launchNudged.add(household.id);
          if (!has) router.replace("/recipes");
        })
        .catch((error) => {
          // Never strand someone on an empty week because a query failed.
          console.warn("[plan] cookbook check failed", error);
          if (!cancelled) launchNudged.add(household.id);
        });
      return () => {
        cancelled = true;
      };
    }, [household.id, router]),
  );
}

export default function PlanScreen() {
  const household = useHousehold();
  useEmptyCookbookNudge();
  // Keyed on the household so a switch starts the plan clean. This used to be
  // done by remounting the whole tab tree, which also lost your place – see
  // the note on <AppTabs> in _layout.tsx.
  return (
    <MealPlanProvider key={household.id}>
      <PlanContent />
    </MealPlanProvider>
  );
}

type SheetState =
  | { kind: "none" }
  | { kind: "add-meal"; date: string }
  | { kind: "move"; entry: PlanEntry }
  | { kind: "swap"; entry: PlanEntry }
  | { kind: "servings"; entry: PlanEntry };

function PlanContent() {
  const plan = useMealPlan();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [sheet, setSheet] = useState<SheetState>({ kind: "none" });

  // Live: reading the clock in a render body is cached forever by the React
  // Compiler, so "today" used to stay on whatever day the app was opened –
  // see use-today.ts.
  const todayKey = useTodayKey();
  const dates = useMemo(
    () => weekDates(plan.viewedWeekStart),
    [plan.viewedWeekStart],
  );
  const entriesByDate = useMemo(() => {
    const map = new Map<string, PlanEntry[]>();
    for (const entry of plan.entries) {
      const list = map.get(entry.date) ?? [];
      list.push(entry);
      map.set(entry.date, list);
    }
    return map;
  }, [plan.entries]);

  const close = () => setSheet({ kind: "none" });

  return (
    <SafeAreaView
      edges={["top"]}
      className="flex-1 bg-surface-neutral-lightest"
    >
      {/* The "Weekly plan" title returned above the switcher (Figma
          212:59962, 2026-07-18) – same display-4 header as the sibling
          tabs. */}
      <View className="w-full px-layout-small pb-layout-medium">
        <Text className="font-header text-display-4 font-emphasized leading-medium text-text-subtle">
          Weekly plan
        </Text>
      </View>
      {/* The shared week switcher (Figma weekNav 163:38970). "›" past the
          last week creates the next one, so it never disables here. */}
      <View className="w-full px-layout-small pb-layout-small">
        <WeekPicker
          weekStart={plan.viewedWeekStart}
          canGoBack={plan.canGoBack}
          canGoForward
          onBack={plan.goBack}
          onForward={plan.goForward}
        />
      </View>

      {!plan.ready ? (
        plan.liveStatus === "offline" ? (
          // The initial load failed (launch-time outage, or the server
          // refusing the query as on 2026-07-27). Offer a retry instead of a
          // spinner that never stops – the tab also retries itself on
          // foreground once the connection is back.
          <LoadError
            title="Can’t load your plan"
            message="We couldn’t load your weekly plan. Check your connection and try again – nothing in your plan is lost."
            onRetry={plan.retry}
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={ds.colors.surface.primary.main} />
          </View>
        )
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            gap: 8,
            paddingHorizontal: 16,
            paddingBottom: tabBarClearance(insets, Spacing.four),
          }}
        >
          {dates.map((date, index) => (
            <DayRow
              key={date}
              label={DAY_LABELS[index]}
              isToday={date === todayKey}
              isPast={date < todayKey}
              entries={entriesByDate.get(date) ?? []}
              onAddMeal={() => setSheet({ kind: "add-meal", date })}
              onPressMeal={(entry) => {
                // Manual meals ("Leftovers") have no recipe to open. The
                // detail opens in THIS tab's stack (/recipe/…), so back
                // returns to the plan (2026-07-18).
                if (entry.recipeId != null)
                  router.push(`/recipe/${entry.recipeId}`);
              }}
              onMove={(entry) => setSheet({ kind: "move", entry })}
              onSwap={(entry) => setSheet({ kind: "swap", entry })}
              onServings={(entry) => setSheet({ kind: "servings", entry })}
              // Remove is instant now, with an undo toast instead of the old
              // confirm dialog (replaces RemoveMealSheet, 2026-07-24).
              onRemove={(entry) => plan.removeEntry(entry.id)}
            />
          ))}
          {/* Sits where the "Add all to shopping list" button used to, and
              says what that button only implied: the link exists and needs no
              press (decision #8, 2026-07-25). Shown on an empty week too –
              that is when it sets the expectation. IMPROVISED placement and
              copy, both Thomas's call, no Figma frame. */}
          <Text className="mt-comp-small font-paragraph text-paragraph font-default text-text-subtle">
            Your shopping list updates as you plan.
          </Text>
        </ScrollView>
      )}

      <AddMealSheet
        // Key per open so selection state re-initialises per day/entry.
        key={
          sheet.kind === "add-meal"
            ? `add-${sheet.date}`
            : sheet.kind === "swap"
              ? `swap-${sheet.entry.id}`
              : "closed"
        }
        visible={sheet.kind === "add-meal" || sheet.kind === "swap"}
        mode={sheet.kind === "swap" ? "swap" : "add"}
        dayName={
          sheet.kind === "add-meal"
            ? DAY_NAMES[dates.indexOf(sheet.date)]
            : undefined
        }
        weekStart={plan.viewedWeekStart}
        originDate={sheet.kind === "add-meal" ? sheet.date : undefined}
        // Add mode overrides this with the picked recipe's own default on
        // the first selection – the placeholder only matters pre-selection,
        // when the counter is hidden. Swap keeps the meal's current count.
        initialServings={sheet.kind === "swap" ? sheet.entry.servings : 4}
        onClose={close}
        onSubmitManual={(title) => {
          if (sheet.kind !== "add-meal") return;
          plan
            .addManualMeal(sheet.date, title)
            .catch((error) =>
              console.warn("[plan] add manual meal failed", error),
            );
        }}
        onSubmit={(recipes, servings, days) => {
          if (sheet.kind === "add-meal") {
            plan
              .addMealsToDays(days, recipes, servings)
              .catch((error) =>
                console.warn("[plan] add meals failed", error),
              );
          } else if (sheet.kind === "swap" && recipes[0]) {
            plan
              .swapMeal(sheet.entry.id, recipes[0], servings)
              .catch((error) => console.warn("[plan] swap failed", error));
          }
        }}
      />
      {sheet.kind === "move" && (
        <MoveDaySheet
          visible
          weekStart={plan.viewedWeekStart}
          currentDate={sheet.entry.date}
          onClose={close}
          onMove={(date) => plan.moveEntry(sheet.entry.id, date)}
        />
      )}
      {sheet.kind === "servings" && (
        <ServingsSheet
          visible
          initialServings={sheet.entry.servings}
          onClose={close}
          onSubmit={(servings) =>
            plan.changeServings(sheet.entry.id, servings)
          }
        />
      )}
      {/* Keyed on the removed meal so each removal remounts the toast –
          fresh entrance and a fresh 5s countdown. Sits above the tab bar. */}
      {plan.undoEntry != null && (
        <UndoToast
          key={plan.undoEntry.id}
          name={plan.undoEntry.recipeTitle}
          verb="removed"
          onUndo={plan.undoRemoveEntry}
          onDismiss={plan.dismissUndoEntry}
          bottomInset={tabBarClearance(insets, Spacing.three)}
        />
      )}
    </SafeAreaView>
  );
}
