import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

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
 * "Change in settings" IS a tap target, decided by Thomas 2026-08-17 after it
 * shipped inert – the frames draw it as plain text with no link treatment, so it
 * was left plain and raised rather than quietly wired up. It goes to the
 * Settings tab and still looks exactly as drawn at rest; see the note on the
 * Pressable for why only the pressed state was added.
 */
export function KeepAwakeNote() {
  const { keepScreenAwake } = usePreferences();
  const router = useRouter();

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
      {/* Tappable, and it goes to the Settings TAB rather than pushing Settings
          onto the recipe's stack – `navigate` so you land on the tab you would
          have reached by hand, with no second copy of it on top of this recipe.
          (Thomas, 2026-08-17: "it would be nice to have a link".)
          Shrinkable, unlike the frame's fixed line: the Danish of both texts
          plus the icon measures ~291 of the 370pt available, so it fits today,
          but a longer future translation should truncate the hint rather than
          push itself off the edge of the screen. */}
      <Pressable
        onPress={() => router.navigate('/household')}
        hitSlop={{ top: 12, bottom: 12, left: 8, right: 12 }}
        accessibilityRole="link"
        accessibilityLabel={t('recipes.detail.keepAwakeHint')}
        className="min-w-0 shrink"
      >
        {({ pressed }) => (
          // ⚠️ NO LINK TREATMENT AT REST, deliberately: Thomas's frame paints
          // this `text/default`, the same colour as the status beside it, and it
          // still does after he rewrote the row. So it reads exactly as drawn
          // and only the PRESSED state is added – which React Native gives
          // nothing for free (CLAUDE.md), so it is `text/link`, the DS's own
          // semantic link colour. If it should look tappable at rest too, that
          // same token is the answer and it is a one-line change.
          <Text
            numberOfLines={1}
            className={
              'font-paragraph text-small font-default leading-xxsmall ' +
              (pressed ? 'text-text-link' : 'text-text-default')
            }
          >
            {t('recipes.detail.keepAwakeHint')}
          </Text>
        )}
      </Pressable>
    </View>
  );
}
