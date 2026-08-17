// Typed access to the generated DS theme fragment for the rare cases where a
// component needs a raw value (native props like tintColor) instead of a
// Tailwind class. Classes remain the default way to consume tokens.
/* eslint-disable @typescript-eslint/no-require-imports */
interface ColorScale {
  lightest: string;
  lighter: string;
  light: string;
  main: string;
  dark: string;
  darker: string;
  darkest: string;
  DEFAULT: string;
}

// Button state recipe. Hover exists for the web; native uses enabled/pressed.
interface ButtonStates {
  enabled: string;
  hover: string;
  pressed: string;
}

// Chip state recipe. The hover keys exist for the web; native chips use
// enabled/pressed/active/active-pressed.
interface ChipStates {
  enabled: string;
  hover: string;
  pressed: string;
  active: string;
  'active-hover': string;
  'active-pressed': string;
}

// Forms state recipe. `hover` and `focused` exist for the web; native maps
// `:active` to pressed and has no hover or focus ring (CLAUDE.md). Added when
// the DS switch was ported for "Keep screen on" (2026-08-17) – input.tsx had
// been reaching these tokens through Tailwind classes only.
interface FormsTokens {
  background: {
    default: string;
    active: string;
    pressed: string;
    off: string;
    DEFAULT: string;
  };
  border: {
    enabled: string;
    hover: string;
    pressed: string;
    focused: string;
    error: string;
    subdued: string;
  };
  surface: {
    enabled: string;
    active: string;
    hover: string;
    pressed: string;
    error: string;
  };
}

interface DsTheme {
  /** Spacing tokens, keyed as `layout-small` / `comp-large` – the same names
   *  the Tailwind classes use. Values carry their `px` unit, so a component
   *  needing arithmetic (the switch handle's travel) must parseFloat them. */
  spacing: Record<string, string>;
  colors: {
    surface: {
      primary: ColorScale;
      secondary: ColorScale;
      neutral: ColorScale & { white: string };
    };
    error: ColorScale & { 'contrast-text': string };
    warning: ColorScale & { 'contrast-text': string };
    success: ColorScale & { 'contrast-text': string };
    info: ColorScale & { 'contrast-text': string };
    text: {
      default: string;
      subtle: string;
      disabled: string;
      link: string;
      brand: string;
      accent: string;
      inverse: string;
      danger: string;
      success: string;
      warning: string;
      info: string;
      DEFAULT: string;
    };
    border: { default: string; DEFAULT: string };
    icon: {
      default: string;
      subtle: string;
      brand: string;
      accent: string;
      disabled: string;
      DEFAULT: string;
    };
    button: {
      solid: { fill: ButtonStates; label: ButtonStates };
      outline: {
        border: ButtonStates;
        fill: Omit<ButtonStates, 'enabled'>; // enabled is transparent
        label: ButtonStates;
      };
      text: { label: ButtonStates; underline: ButtonStates };
      /** Destructive actions. Present in ds-theme.cjs; this type had not
       *  caught up until the section delete button needed it (2026-08-06). */
      danger: { fill: ButtonStates; label: ButtonStates };
    };
    chip: {
      solid: { fill: ChipStates; label: ChipStates };
      outline: {
        border: ChipStates;
        fill: Omit<ChipStates, 'enabled'>; // enabled is transparent
        label: ChipStates;
      };
    };
    forms: FormsTokens;
  };
}

export const ds: DsTheme = require('./ds-theme.cjs');
