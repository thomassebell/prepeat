import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { ds } from '@/constants/ds';
import { t } from '@/lib/i18n';
import { usePreferences } from '@/lib/preferences';

/**
 * The line under the servings counter that says what the screen is about to do
 * (Figma 709:6812 on, 709:6855 off – "recipe – servings" frames 1 and 3).
 *
 * It shows in BOTH states, which is the point: an always-on screen nobody asked
 * for reads as a bug, and the off state is where anyone who wants the feature
 * finds out it exists. Thomas's call, 2026-08-17.
 *
 * Spec, off the frames' bound variables:
 *   row     `layout/xxsmall` gap, items-start, 16px tall. The frame's 16px side
 *           padding is the screen's own – the parent already applies it.
 *   icon    16px `light_mode` on / `mode_night` off, `icon/default`
 *   status   `paragraph/small emphasized` (12/16 bold), `text/default`
 *   hint     `paragraph/small` (12/16 regular), `text/default`
 *
 * IMPROVISED, and flagged: the frames draw "Change in settings" as plain text
 * in the same colour as the status, with no link treatment – so it is NOT a tap
 * target here either, faithfully. Making the line tap through to Settings would
 * be an improvement and would not change a pixel, but it is behaviour the
 * design does not draw. Worth a decision rather than a quiet addition.
 */
export function KeepAwakeNote() {
  const { keepScreenAwake } = usePreferences();

  return (
    <View className="w-full flex-row items-start gap-layout-xxsmall">
      <MaterialIcons
        // The frames' own glyphs: Figma `light_mode` / `mode_night`, which the
        // MaterialIcons font carries under the same names in kebab-case.
        name={keepScreenAwake ? 'light-mode' : 'mode-night'}
        size={16}
        color={ds.colors.icon.default}
      />
      <Text className="font-paragraph text-small font-emphasized leading-xxsmall text-text-default">
        {keepScreenAwake
          ? t('recipes.detail.keepAwakeOn')
          : t('recipes.detail.keepAwakeOff')}
      </Text>
      {/* Shrinkable, unlike the frame's fixed line: the Danish of both texts
          plus the icon measures ~291 of the 370pt available, so it fits today,
          but a longer future translation should truncate the hint rather than
          push itself off the edge of the screen. */}
      <Text
        numberOfLines={1}
        className="min-w-0 shrink font-paragraph text-small font-default leading-xxsmall text-text-default"
      >
        {t('recipes.detail.keepAwakeHint')}
      </Text>
    </View>
  );
}
