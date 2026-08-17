// One app, two languages, the phone picks (Thomas, 2026-08-07 – "I don't want
// to make a danish app, I just want the app to be able to use danish as well").
// English is the base language and stays it; Danish is added alongside.
//
// THERE IS NO LANGUAGE SETTING, deliberately. iOS decides, so there is no
// picker, no stored preference and no screen to design. An in-app override is
// the one open question and costs little to add later, once the strings are
// out of the components.
//
// FALLBACK IS WHAT MAKES THIS SHIPPABLE HALF-DONE: a key with no Danish
// translation renders the English one, so the app is never broken while the
// translation catches up – it is only mixed. Translate a screen at a time.
import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';

import { da } from '@/locales/da';
import { en } from '@/locales/en';

const i18n = new I18n({ en, da });

i18n.defaultLocale = 'en';
i18n.enableFallback = true;

// The device's first preferred language, reduced to the bare language code:
// da-DK and da both mean Danish here, and there are no regional variants to
// tell apart. Anything that is not Danish gets English, which is the default.
//
// ⚠️ iOS only reports Danish if the BUNDLE claims to support it – that is the
// `supportedLocales: ["en", "da"]` on the expo-localization plugin in app.json,
// which writes CFBundleLocalizations. Without it this line returns "en" on a
// Danish phone and the whole feature silently does nothing. It needs a native
// rebuild to take effect, not just a JS reload.
export const locale = getLocales()[0]?.languageCode ?? 'en';
i18n.locale = locale;

/** A key written for a count: `t(key, { count })` picks one of the two. */
type PluralForm = { one: string; other: string };

/**
 * Dotted paths into the English translations – "shopping.title" and so on.
 * A plural pair is a LEAF: the key is `undo.itemCount`, never
 * `undo.itemCount.one`, because `count` is what chooses between them.
 */
type Leaves<T> = {
  [K in keyof T & string]: T[K] extends string
    ? K
    : T[K] extends PluralForm
      ? K
      : `${K}.${Leaves<T[K]>}`;
}[keyof T & string];

export type TranslationKey = Leaves<typeof en>;

interface TranslateOptions {
  /** Drives one/other on a key written as `{ one, other }`. */
  count?: number;
  [placeholder: string]: string | number | undefined;
}

/**
 * Look up a string for the current language.
 *
 * KEYS ARE TYPE-CHECKED against `en`, so a typo is a build error rather than a
 * `[missing "da.foo" translation]` on someone's phone. That is the whole
 * reason English is a plain typed object rather than JSON.
 *
 * Safe to call anywhere, including outside React: `locale` is fixed for the
 * life of the process (iOS restarts the app when the language changes), so
 * there is nothing to subscribe to and nothing for the React Compiler to
 * memoize wrongly.
 */
export function t(key: TranslationKey, options?: TranslateOptions): string {
  return i18n.t(key, options);
}
