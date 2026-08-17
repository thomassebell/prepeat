import { View } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from 'react-native-reanimated';

import { ds } from '@/constants/ds';

/**
 * ⚠️ A PORT OF THE DS `switch`, NOT THE DS COMPONENT ITSELF.
 *
 * Components belong in the design system and nowhere else. The app cannot
 * consume the real one: `@ds/react` is web (it peers on `react-dom`) and has
 * no delivery path into React Native. So this is a transcription, and every
 * value in it comes from the DS's own authored CSS, read off
 * storybook.sebell.dk (Components / Switch, brand `prep-eat`, 2026-08-17) –
 * not from a screen frame and not from get_design_context's stale CSS
 * fallbacks, which had the colours wrong by a mile here (#476b4a for the
 * handle against the real #56C91D).
 *
 * The DS authors it as:
 *
 *   track     `components/xxxlarge` wide, `components/large + 2×layout/xxsmall`
 *             high, `radius/large`, with a 1px INSET ring (a box-shadow, so it
 *             never moves the handle)
 *   off       track `forms/background/off`,     handle `forms/surface/enabled`
 *   on        track `forms/background/default`, handle `forms/surface/active`
 *   pressed   track `forms/background/pressed`, 2px ring `forms/border/pressed`
 *   handle    `components/large` square, `radius/medium`, `layout/xxsmall` in
 *             from the near edge; slides in 150ms, colours cross in 100ms
 *   disabled  opacity 0.56
 *
 * Ported deliberately, per the state-mapping rule in CLAUDE.md: `:active`
 * becomes `pressed`. NOT ported, and not improvised either: `:hover` and
 * `:focus-visible` have no touch equivalent, and the `aria-invalid` error
 * state has no caller – nothing can put a preference switch into error.
 *
 * The inset ring is drawn as an overlay rather than a border on the track,
 * because React Native lays absolute children out inside the border box: a
 * plain border would shift the handle by 1px, and by 2px while pressed, giving
 * a wobble the DS does not have.
 *
 * ⚠️ WHAT A PORT CANNOT CHECK: the DS's stylelint semantic-token rule, its
 * cross-brand parity check and its two density modes are enforced in DS CI and
 * nowhere else. A wrong density binding in particular is invisible at the
 * default one. Treat this file as unverified against all three.
 *
 * Presentational by design – it renders state and does not capture touches.
 * The row that owns it is the tap target (see `SwitchRow` in household.tsx),
 * which keeps one target per setting and carries the accessibility role.
 */

// Geometry follows the DS's own formulae rather than the numbers they evaluate
// to, so a retune of either token moves this with it.
const px = (token: string) => parseFloat(ds.spacing[token]);
const HANDLE = px('comp-large'); // components/large
const INSET = px('layout-xxsmall'); // layout/xxsmall
const TRACK_W = px('comp-xxxlarge'); // components/xxxlarge
const TRACK_H = HANDLE + INSET * 2;
// `left: calc(100% - components/large - layout/xxsmall)` expressed as travel.
const TRAVEL = TRACK_W - HANDLE - INSET * 2;

const SLIDE_MS = 150;
const TINT_MS = 100;

export function Switch({
  value,
  pressed = false,
  disabled = false,
}: {
  value: boolean;
  /** The owning row's press state, so the switch shows the DS pressed track. */
  pressed?: boolean;
  disabled?: boolean;
}) {
  // Two clocks, because the DS gives the slide and the colour cross different
  // durations (0.15s and 0.1s).
  const slide = useDerivedValue(() =>
    withTiming(value ? 1 : 0, { duration: SLIDE_MS }),
  );
  const tint = useDerivedValue(() =>
    withTiming(value ? 1 : 0, { duration: TINT_MS }),
  );
  const press = useDerivedValue(() =>
    withTiming(pressed ? 1 : 0, { duration: TINT_MS }),
  );

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      press.value,
      [0, 1],
      [
        interpolateColor(
          tint.value,
          [0, 1],
          [ds.colors.forms.background.off, ds.colors.forms.background.default],
        ),
        ds.colors.forms.background.pressed,
      ],
    ),
  }));

  const ringStyle = useAnimatedStyle(() => ({
    borderWidth: 1 + press.value,
    borderColor: interpolateColor(
      press.value,
      [0, 1],
      [ds.colors.forms.border.enabled, ds.colors.forms.border.pressed],
    ),
  }));

  const handleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slide.value * TRAVEL }],
    backgroundColor: interpolateColor(
      tint.value,
      [0, 1],
      [ds.colors.forms.surface.enabled, ds.colors.forms.surface.active],
    ),
  }));

  return (
    <View
      // 0.56 is the DS's own disabled opacity, not a rounded guess.
      style={{ width: TRACK_W, height: TRACK_H, opacity: disabled ? 0.56 : 1 }}
    >
      <Animated.View
        className="absolute inset-0 rounded-large"
        style={trackStyle}
      />
      <Animated.View
        className="absolute inset-0 rounded-large"
        style={ringStyle}
      />
      <Animated.View
        className="absolute rounded-medium"
        style={[
          { width: HANDLE, height: HANDLE, top: INSET, left: INSET },
          handleStyle,
        ]}
      />
    </View>
  );
}
