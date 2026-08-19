import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { ds } from "@/constants/ds";
import { Spacing, tabBarClearance } from "@/constants/theme";
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
 * Rendered by `app/recipes/shared/[token].tsx`, an ordinary screen inside the
 * Recipes tab's stack. It briefly lived at `app/r/[token].tsx` as a HIDDEN
 * NativeTabs trigger and was unreachable there – a native tab bar will not
 * switch to a tab it is not showing, so `router.replace` was accepted and
 * silently ignored. The public URL is still `/r/<token>`; `+native-intent`
 * rewrites it onto this route.
 *
 * ⚠️ **THIS SCREEN IS DELIBERATELY SPARSE** (Thomas, 2026-08-18). No photo and
 * no description, even when the sender's own recipe has both. It is reached by
 * someone who has ALREADY converted, so it only has to confirm who sent what
 * and offer to save – and Save hands over the full recipe a tap later anyway.
 * The teaser page on the web has the opposite job and shows more, not less.
 *
 * Built from the Figma section "recipe – recive shared recipe" and its four
 * frames: "recipe – accepting recipe", "recipe – revoked recipe", "recipe –
 * link broken" and "recipe – connection error".
 */

/** Total / Prep / Cook, the three the recipe screen and the web page also show.
 *  Total is only shown when it is the SUM of two numbers – otherwise it just
 *  repeats the single one, which is a flaw the live web page taught us. */
function Times({ prep, cook }: { prep: number | null; cook: number | null }) {
  const rows: [string, MetaIcon, number][] = [];
  if (prep != null && cook != null)
    rows.push([t("recipes.detail.total"), "schedule", prep + cook]);
  if (prep != null) rows.push([t("recipes.detail.prep"), "restaurant", prep]);
  if (cook != null) rows.push([t("recipes.detail.cook"), "local-fire-department", cook]);
  if (rows.length === 0) return null;
  return (
    <View className="w-full flex-row gap-comp-small">
      {rows.map(([label, icon, minutes]) => (
        // `shrink` + numberOfLines on the LABEL only, the same guard the recipe
        // screen uses: a translation a shade too wide for its third of the row
        // ellipsises inside its own column instead of sliding under the next
        // item's icon. The value keeps its width, because a clipped NUMBER
        // would be a lie.
        <View key={label} className="flex-1 flex-row items-center gap-layout-xxsmall">
          <MaterialIcons name={icon} size={16} color={ds.colors.icon.default} />
          <Text
            numberOfLines={1}
            className="shrink font-paragraph text-small font-emphasized leading-xxsmall text-text-default"
          >
            {label}
          </Text>
          <Text className="font-paragraph text-small font-default leading-xxsmall text-text-default">
            {t("recipes.detail.minutes", { count: minutes })}
          </Text>
        </View>
      ))}
    </View>
  );
}

type MetaIcon = keyof typeof MaterialIcons.glyphMap;

/** The white card every state sits in: 16px radius, 40px of air above the
 *  content and 16px around the rest (Figma 726:10526 / 726:10670 / 726:10774,
 *  identical on all three). */
function Card({ children }: { children: React.ReactNode }) {
  return (
    <View className="px-layout-small">
      <View className="w-full gap-layout-small rounded-large bg-surface-neutral-white px-layout-small pb-layout-small pt-layout-large">
        {children}
      </View>
    </View>
  );
}

/** The three dead ends – revoked, unknown token, no connection – are one
 *  layout: an icon, a heading, a line of explanation, and for the recoverable
 *  one a button. Revoked and unknown token get no button on purpose: whoever
 *  is reading them already has the app, and there is nothing to retry.
 *
 *  The three frames briefly disagreed on spacing – "recipe – connection error"
 *  inset its text a further 16px and put 16px under the icon. Raised
 *  2026-08-18 and FIXED BY THOMAS in the file the same day, so all three now
 *  read: the card's own padding, 24px under the icon, 16px above the body.
 *  One component is therefore the design, not a flattening of it. */
function Notice({
  icon,
  iconSize,
  title,
  body,
  action,
}: {
  icon: MetaIcon;
  iconSize: number;
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <View className="w-full gap-layout-small">
      <View className="w-full gap-layout-medium">
        <MaterialIcons name={icon} size={iconSize} color={ds.colors.icon.brand} />
        <Text className="w-full font-header text-display-5 font-emphasized leading-small text-text-subtle">
          {title}
        </Text>
      </View>
      <Text className="w-full font-paragraph text-paragraph font-default leading-xsmall text-text-subtle">
        {body}
      </Text>
      {action}
    </View>
  );
}

/** The DS solid button, inlined – this app has no Button component and every
 *  screen builds its own (a DS gap: `@ds/react` is web and cannot be consumed
 *  from React Native at all). Pressed state is coded explicitly, because React
 *  Native inherits none of it. */
function SolidButton({
  label,
  onPress,
  disabled,
  busy,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  busy?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled === true, busy: busy === true }}
      disabled={disabled}
      onPress={onPress}
    >
      {({ pressed }) => (
        <View
          className={`w-full flex-row items-center justify-center gap-comp-xsmall rounded-medium px-comp-xlarge py-comp-large ${
            busy === true || pressed
              ? "bg-button-solid-fill-pressed"
              : "bg-button-solid-fill-enabled"
          }`}
        >
          <Text className="font-paragraph text-paragraph font-default leading-xsmall text-button-solid-label-enabled">
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

/** Back, and nothing else – see the note at the call site about the ⋯ button.
 *
 *  ⚠️ THE ARROW IS GREEN (`icon/brand`, #47A518), and it was brown here for a
 *  day because the colour was taken from a `get_variable_defs` dump instead of
 *  from the node. The frames bind `tab-bar/item/icon/active`, which is an ALIAS
 *  – the dump reported the alias's own value, #4F4230, while the arrow actually
 *  resolves through it to #47A518. The rendered screenshot showed a green arrow
 *  the whole time. **Read the resolved fill, not the token dump.** */
function TopBar({ onBack }: { onBack: () => void }) {
  return (
    <View className="w-full flex-row items-center p-layout-small">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("common.back")}
        hitSlop={12}
        onPress={onBack}
      >
        <MaterialIcons name="arrow-back" size={32} color={ds.colors.icon.brand} />
      </Pressable>
    </View>
  );
}

export function SharedRecipeScreen({ token, onClose }: { token: string; onClose: () => void }) {
  const household = useHousehold();
  const router = useRouter();
  const insets = useSafeAreaInsets();
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

  const retry = () => {
    setShare(null);
    setFailed(false);
    setAttempt((n) => n + 1);
  };

  // The network can fail between opening the link and reading the share. This
  // used the shared LoadError block while the state was undesigned; it now has
  // its own frame ("recipe – connection error"), which keeps it inside the card
  // with the other two dead ends instead of taking over the screen.
  if (failed) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-surface-neutral-lightest">
        <TopBar onBack={onClose} />
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: tabBarClearance(insets, Spacing.five) }}
        >
          <Card>
            <Notice
              icon="wifi-off"
              iconSize={40}
              title={t("share.errorTitle")}
              body={t("share.errorBody")}
              action={<SolidButton label={t("common.tryAgain")} onPress={retry} />}
            />
          </Card>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (share == null) {
    return (
      <SafeAreaView
        edges={["top"]}
        className="flex-1 items-center justify-center bg-surface-neutral-lightest"
      >
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  // The three dead ends say different things, because we know different things.
  // ⚠️ THE TEST IS THE STATUS, NOT WHETHER WE HAVE A NAME. It used to be
  // `sharedBy != null`, which was right while `revoked` was the only way a
  // link could die - an expired share would have picked up "Pia isn't sharing
  // this one any more", turning a lapse into an accusation. The database also
  // withholds the name on `expired` (0038), so this is belt and braces.
  const gone = share === "missing" || share.status !== "live";
  const expired = share !== "missing" && share.status === "expired";
  const sharedBy = share !== "missing" ? share.sharedBy : null;

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-surface-neutral-lightest">
      {/* ⚠️ THE DESIGN ALSO DRAWS A ⋯ BUTTON HERE, top right of "recipe –
          accepting recipe", and it is left out on purpose, not forgotten:
          there is no menu behind it and nothing it could do on a recipe you do
          not own yet. Flagged with Thomas 2026-08-18; add it back together with
          the menu it is meant to open. */}
      <TopBar onBack={onClose} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: tabBarClearance(insets, Spacing.five) }}
      >
        {gone ? (
          // ⚠️ NO FIGMA FRAME FOR THE EXPIRED STATE - it reuses this layout on
          // the ruling in docs/share-expiry-and-stop-sharing.md ("the same
          // white card with the broken heart, no button"), and the design link
          // Thomas gave on 2026-08-19 covers share/stop sharing only. Flagged
          // in the backlog as the one improvisation in this change: if the
          // fourth dead end should look different, it is undrawn, not decided.
          <Card>
            <Notice
              icon="heart-broken"
              iconSize={32}
              title={
                expired
                  ? t("share.expiredTitle")
                  : sharedBy != null
                    ? t("share.revokedTitle", { name: sharedBy })
                    : t("share.notFoundTitle")
              }
              body={
                expired
                  ? t("share.expiredBody")
                  : sharedBy != null
                    ? t("share.revokedBody")
                    : t("share.notFoundBody")
              }
            />
          </Card>
        ) : (
          <Card>
            {share.sharedBy != null && (
              // Name bold, the rest regular, on one line – see the note on
              // `share.sharedWithYou` in en.ts about why this is two strings.
              // ⚠️ TOKEN GAP: the frame binds `color/text/light`, which the DS
              // bridge does not export. `text/subtle` is the same value today
              // (#5F503A); raised with Thomas 2026-08-18.
              <View className="w-full flex-row flex-wrap gap-layout-xxsmall">
                <Text className="font-paragraph text-paragraph font-emphasized leading-xsmall text-text-subtle">
                  {share.sharedBy}
                </Text>
                <Text className="font-paragraph text-paragraph font-default leading-xsmall text-text-subtle">
                  {t("share.sharedWithYou")}
                </Text>
              </View>
            )}

            <View className="w-full gap-layout-small">
              <Text className="font-header text-display-5 font-emphasized leading-small text-text-subtle">
                {share.title}
              </Text>
              <Times prep={share.prepMinutes} cook={share.cookMinutes} />
            </View>

            {/* The conversion moment: a stranger's link becomes a recipe you
                own. An explicit tap, never automatic – opening a link must not
                put things in someone's cookbook (Thomas, 2026-08-17). */}
            <SolidButton
              label={saving ? t("share.saving") : t("share.save")}
              onPress={save}
              disabled={saving}
              busy={saving}
            />

            {/* Declining is just leaving. Nothing was saved, so there is
                nothing to undo and no state to write – it goes exactly where
                the back arrow goes. */}
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: saving }}
              disabled={saving}
              onPress={onClose}
            >
              {({ pressed }) => (
                <View
                  className={`w-full flex-row items-center justify-center gap-comp-xsmall rounded-medium border-2 px-comp-xlarge py-comp-large ${
                    pressed
                      ? "border-button-outline-border-pressed bg-button-outline-fill-pressed"
                      : "border-button-outline-border-enabled"
                  }`}
                >
                  <Text
                    className={`font-paragraph text-paragraph font-default leading-xsmall ${
                      pressed
                        ? "text-button-outline-label-pressed"
                        : "text-button-outline-label-enabled"
                    }`}
                  >
                    {t("share.decline")}
                  </Text>
                </View>
              )}
            </Pressable>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
