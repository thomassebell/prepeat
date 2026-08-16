import { MaterialIcons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { ds } from "@/constants/ds";

/**
 * The DS "alert banner" (Figma 42:78, component set on the `alert` page,
 * last touched 2026-07-11). Built 2026-08-16, when Thomas answered "what
 * component did you use" with: there is one, use it.
 *
 * Every value below is a TOKEN NAME read off the Figma node's bindings, never
 * a number copied from the canvas. That distinction matters here more than
 * usual: the DS file's alert page resolves in the Sebell brand, where the
 * warning fill is a khaki #c6bb9f, the corner radius is 0 and the fonts are
 * Noto Serif / Noto Sans. Prep+Eat aliases the SAME token names to #F6CB4C,
 * 12px and Montserrat / IBM Plex. Reading the canvas values would have built
 * the wrong brand's component; reading the bindings builds ours.
 *
 * Layout, all token-bound on the Figma node:
 *   row, icon 24px + text column + (close), gap semantic/layout/xsmall
 *   padding: left semantic/components/large, other three components/medium
 *   radius radius/medium, text column gap semantic/layout/xsmall
 *   title header/display 6, message paragraph/paragraph
 *
 * ── TWO THINGS THIS DELIBERATELY DOES NOT DO ────────────────────────────
 *
 * 1. NO CLOSE BUTTON. The Figma component has one (`close`, a boolean
 *    property defaulting true), but its icon is bound to `color/icon/primary`
 *    / `icon/contrast` / `icon/light` / `icon/lighter` depending on the
 *    variant, and NONE of those four are in `ds-theme.cjs` – our bridge
 *    exports icon default/subtle/brand/accent/disabled only. Improvising a
 *    neighbouring icon token is exactly what CLAUDE.md forbids, so the button
 *    is left out until the DS exports them. `close` being a boolean property
 *    means hiding it is a supported configuration, not a liberty.
 *
 * 2. TWO VARIANTS ARE MISSING, for the same reason – one token each:
 *      solid + error     – its message binds `color/text/contrast-text`
 *      outlined + warning – its icon binds `color/icon/primary`
 *    Both are absent from the bridge. The other six are complete and built.
 *
 * The variants also disagree with each other in Figma in ways that look like
 * drift rather than intent – the close icon uses four different tokens across
 * eight variants, and solid/info fills with info/light where every other solid
 * fills with its main. Recorded in the backlog for Thomas rather than smoothed
 * over here: this file follows what each variant actually binds.
 */

export type AlertStatus = "error" | "warning" | "success" | "info";
export type AlertVariant = "solid" | "outlined";

/** MaterialIcons names matching the Figma instances per status. */
const STATUS_ICON: Record<AlertStatus, keyof typeof MaterialIcons.glyphMap> = {
  error: "error",
  warning: "warning",
  success: "check-circle",
  info: "info",
};

type Recipe = { container: string; text: string; icon: string };

/**
 * One entry per built variant, transcribed from the node bindings. Keyed
 * `${variant}-${status}`; the two blocked combinations are absent on purpose
 * and guarded at the bottom of the component.
 */
const RECIPES: Partial<Record<`${AlertVariant}-${AlertStatus}`, Recipe>> = {
  // Solid: fill is the status ramp, everything on it is that status's
  // contrast-text. info is the odd one – it fills with info/light.
  "solid-warning": {
    container: "bg-warning-main",
    text: "text-warning-contrast-text",
    icon: ds.colors.warning["contrast-text"],
  },
  "solid-success": {
    container: "bg-success-main",
    text: "text-success-contrast-text",
    icon: ds.colors.success["contrast-text"],
  },
  "solid-info": {
    container: "bg-info-light",
    text: "text-info-contrast-text",
    icon: ds.colors.info["contrast-text"],
  },
  // Outlined: white fill, 2px border, text and icon in the status ramp.
  // Error outlines in error/main where the others outline in their /dark.
  "outlined-error": {
    container: "border-2 border-error-main bg-surface-neutral-white",
    text: "text-error-dark",
    icon: ds.colors.error.main,
  },
  "outlined-success": {
    container: "border-2 border-success-dark bg-surface-neutral-white",
    text: "text-success-dark",
    icon: ds.colors.success.dark,
  },
  "outlined-info": {
    container: "border-2 border-info-dark bg-surface-neutral-white",
    text: "text-info-dark",
    icon: ds.colors.info.dark,
  },
};

export function AlertBanner({
  status,
  variant = "solid",
  title,
  message,
  showIcon = true,
}: {
  status: AlertStatus;
  /** Figma's variant axis. Defaults to the component's own default, solid. */
  variant?: AlertVariant;
  /** Optional – the Figma `title` boolean. Omit to hide the title row. */
  title?: string;
  message: string;
  /** The Figma `icon` boolean. */
  showIcon?: boolean;
}) {
  const recipe = RECIPES[`${variant}-${status}`];
  // The two unbuildable combinations fall back to their sibling rather than
  // rendering nothing – a missing warning is worse than a slightly wrong one,
  // and this is unreachable until someone passes a combination the DS has not
  // given us the tokens for.
  const resolved =
    recipe ??
    RECIPES[variant === "solid" ? "solid-warning" : "outlined-error"]!;

  return (
    <View
      className={
        "w-full flex-row items-start gap-layout-xsmall rounded-medium " +
        "pl-comp-large pr-comp-medium py-comp-medium " +
        resolved.container
      }
    >
      {showIcon && (
        <MaterialIcons
          name={STATUS_ICON[status]}
          size={24}
          color={resolved.icon}
        />
      )}
      <View className="min-w-0 flex-1 gap-layout-xsmall">
        {title != null && (
          <Text
            className={
              "font-header text-display-6 font-emphasized leading-xsmall " +
              resolved.text
            }
          >
            {title}
          </Text>
        )}
        <Text
          className={
            "font-paragraph text-paragraph font-default leading-xsmall " +
            resolved.text
          }
        >
          {message}
        </Text>
      </View>
    </View>
  );
}
