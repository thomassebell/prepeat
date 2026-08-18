import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { LoadError } from "@/components/ui/load-error";
import { friendlyError } from "@/lib/error-messages";
import { useHousehold } from "@/lib/household-context";
import { t } from "@/lib/i18n";
import {
  fetchSharedRecipe,
  saveSharedRecipe,
  type SharedRecipe,
} from "@/lib/recipe-shares";

/**
 * Where a shared recipe link lands when the recipient HAS Prep+Eat.
 *
 * The universal link `share.prepeat.app/r/<token>` is claimed by the app
 * (app.json `associatedDomains` + the AASA file on the share host), so iOS opens
 * this instead of Safari. Without the app, the same URL is the web page.
 *
 * ⚠️ NOT A ROUTE, and that is the point. It was `app/r/[token].tsx` first, and
 * the link never arrived: the URL parsed and matched (proved on the device with
 * a diagnostic banner - "matched: b90b78f8…") and `router.replace` still left
 * the app on the Plan tab. `/r` was a HIDDEN NativeTabs trigger, and a native
 * tab bar will not switch to a tab it is not showing. So the app renders this
 * INSTEAD of the tabs while a share link is open - no navigator involved, and
 * nothing that can silently swallow it.
 *
 * ⚠️ PROVISIONAL, AND DELIBERATELY SO. This shows the same teaser the web page
 * shows and stops there, because **the snapshot contains no ingredients and no
 * steps** – that is the whole point of the teaser – so there is nothing here to
 * save a copy from. "Save to my recipes" needs its own database function that
 * copies the real recipe server-side into the recipient's household, and that is
 * the next piece of work. Until then this screen is honest about it rather than
 * offering a button that cannot work.
 *
 * Nothing reaches users meanwhile: the Share action is still gated to the dev
 * app, so the only way to arrive here is a link one of us made.
 */
/** Total / Prep / Cook, the same three the recipe screen and the web page use.
 *  Total is only shown when it is the SUM of two numbers - otherwise it just
 *  repeats the single one, which is a flaw the live web page taught us. */
function Times({ prep, cook }: { prep: number | null; cook: number | null }) {
  const rows: [string, number][] = [];
  if (prep != null && cook != null) rows.push([t("recipes.detail.total"), prep + cook]);
  if (prep != null) rows.push([t("recipes.detail.prep"), prep]);
  if (cook != null) rows.push([t("recipes.detail.cook"), cook]);
  if (rows.length === 0) return null;
  return (
    <View className="w-full flex-row flex-wrap gap-layout-small">
      {rows.map(([label, minutes]) => (
        <View key={label} className="flex-row gap-comp-xsmall">
          <Text className="font-paragraph text-small font-default leading-xxsmall text-text-subtle">
            {label}
          </Text>
          <Text className="font-paragraph text-small font-emphasized leading-xxsmall text-text-default">
            {t("recipes.detail.minutes", { count: minutes })}
          </Text>
        </View>
      ))}
    </View>
  );
}

export function SharedRecipeScreen({ token, onClose }: { token: string; onClose: () => void }) {
  const household = useHousehold();
  const router = useRouter();
  const [share, setShare] = useState<SharedRecipe | null | "missing">(null);
  const [failed, setFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  // Bumped by "Try again" so the effect re-runs; resetting `share` alone would
  // not, since the effect keys on the token.
  const [attempt, setAttempt] = useState(0);

  // Async IIFE rather than a .then() chain: the same shape RootGate uses in
  // _layout.tsx, and the one the react-hooks/set-state-in-effect rule accepts.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await fetchSharedRecipe(token);
        if (!cancelled) setShare(result ?? "missing");
      } catch (error) {
        console.warn("[share] could not open shared recipe", error);
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, attempt]);

  // Saves into the kitchen you are currently in. The database decides what that
  // means: a recipe already here returns the original, and saving the same share
  // twice returns the copy you already have - so this cannot duplicate a
  // cookbook however many times it is tapped.
  const save = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const recipeId = await saveSharedRecipe(token, household.id);
      // replace, not push: the shared-recipe screen has done its job and should
      // not sit in the back stack behind the recipe you now own.
      router.replace(`/recipes/${recipeId}`);
    } catch (error) {
      console.warn("[share] could not save shared recipe", error);
      Alert.alert(t("share.saveFailedTitle"), friendlyError(error));
      setSaving(false);
    }
  };

  if (failed) {
    return (
      <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-surface-neutral-lightest">
        <LoadError
          title={t("share.errorTitle")}
          message={t("share.errorBody")}
          onRetry={() => {
            setShare(null);
            setFailed(false);
            setAttempt((n) => n + 1);
          }}
        />
      </SafeAreaView>
    );
  }

  if (share == null) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 items-center justify-center bg-surface-neutral-lightest">
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  // Unknown token and revoked share say different things, because we know
  // different things: a revoked share still tells us who sent it.
  const gone = share === "missing" || share.status !== "live";
  const sharedBy = share !== "missing" ? share.sharedBy : null;

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-surface-neutral-lightest">
      <ScrollView contentContainerClassName="pb-layout-large">
        <View className="w-full flex-row items-center px-layout-small py-comp-small">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("common.back")}
            hitSlop={8}
            onPress={onClose}
          >
            <Text className="font-paragraph text-paragraph font-emphasized text-text-brand">
              {t("common.back")}
            </Text>
          </Pressable>
        </View>

        {gone ? (
          <View className="items-center gap-layout-xsmall px-layout-medium py-layout-large">
            <Text className="text-center font-header text-display-6 font-emphasized text-text-default">
              {sharedBy != null
                ? t("share.revokedTitle", { name: sharedBy })
                : t("share.notFoundTitle")}
            </Text>
            <Text className="text-center font-paragraph text-paragraph font-default text-text-subtle">
              {sharedBy != null ? t("share.revokedBody") : t("share.notFoundBody")}
            </Text>
          </View>
        ) : (
          <View className="w-full gap-layout-small px-layout-small">
            {share.sharedBy != null && (
              <Text className="font-paragraph text-paragraph font-default text-text-subtle">
                {t("share.sharedWithYou", { name: share.sharedBy })}
              </Text>
            )}
            {share.imageUrl != null && (
              <Image
                source={{ uri: share.imageUrl }}
                contentFit="cover"
                className="h-[200px] w-full rounded-medium"
              />
            )}
            <Text className="font-header text-display-5 font-emphasized leading-small text-text-default">
              {share.title}
            </Text>
            {share.description != null && (
              <Text className="font-paragraph text-paragraph font-default text-text-subtle">
                {share.description}
              </Text>
            )}
            <Times prep={share.prepMinutes} cook={share.cookMinutes} />
            {/* The conversion moment: a stranger's link becomes a recipe you
                own. An explicit tap, never automatic - opening a link must not
                put things in someone's cookbook (Thomas, 2026-08-17). */}
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: saving, busy: saving }}
              disabled={saving}
              onPress={save}
            >
              {({ pressed }) => (
                <View
                  className={`w-full items-center rounded-medium p-layout-small ${
                    saving
                      ? "bg-button-solid-fill-pressed"
                      : pressed
                        ? "bg-button-solid-fill-pressed"
                        : "bg-button-solid-fill-enabled"
                  }`}
                >
                  <Text className="font-paragraph text-paragraph font-emphasized text-button-solid-label-enabled">
                    {saving ? t("share.saving") : t("share.save")}
                  </Text>
                </View>
              )}
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
