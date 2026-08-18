/**
 * Rewrites incoming deep links to routes that exist.
 *
 * Host-agnostic on purpose: the same path arrives from share.prepeat.app and
 * from share-dev.prepeat.app (the dev app's host), and only the PATH matters
 * here.
 *
 * `share.prepeat.app/r/<token>` is the PUBLIC URL – short, and already live on
 * links that have been sent. But `/r/...` cannot be a route at the top level:
 * the root layout renders the tab navigator directly, so a root route can only
 * be a tab, and a hidden tab cannot be displayed. Proved on the device: the URL
 * matched and `router.replace` was silently ignored.
 *
 * So the URL keeps its shape and this maps it onto a real screen inside the
 * Recipes stack. This is what `+native-intent` is for – "re-writing URLs to
 * correctly target a route when unique/referred URLs are incoming".
 *
 * ⚠️ Throwing in here can crash the app, so everything is inside a try/catch and
 * anything unrecognised is passed through untouched.
 */
/**
 * ⚠️ DELIBERATELY LOOSE, AND IT IS A BUG FIX. This was `([0-9a-f]{32})` – the
 * exact shape `create_recipe_share` mints (a uuid with the dashes taken out,
 * migration 0034). That looked like sensible validation and it silently broke
 * the case the design exists for: **a mistyped or truncated token is, by
 * definition, not 32 hex characters**, so it never matched, fell through
 * untouched, and landed on expo-router's black "Unmatched Route" developer
 * screen instead of "This link doesn't lead anywhere". Found on the device
 * 2026-08-18.
 *
 * Deciding whether a token is real is the DATABASE's job – `share_by_token()`
 * returns no row and the screen says so, warmly. This only has to decide
 * whether a URL is ours. The bound is a sanity limit, not validation.
 */
const SHARE_PATH = /^\/?r\/([A-Za-z0-9_-]{1,128})\/?$/;

export function redirectSystemPath({ path }: { path: string; initial: boolean }): string {
  try {
    // `path` arrives as a full URL sometimes and a bare path other times.
    let candidate = path;
    const schemeSplit = candidate.indexOf('://');
    if (schemeSplit !== -1) {
      const afterScheme = candidate.slice(schemeSplit + 3);
      const firstSlash = afterScheme.indexOf('/');
      const maybeHost = firstSlash === -1 ? afterScheme : afterScheme.slice(0, firstSlash);
      // ⚠️ A CUSTOM-SCHEME URL HAS NO HOST. `https://share.prepeat.app/r/<t>`
      // has one to strip; `prepeat://r/<t>` does not - and that second shape is
      // what the device actually reported on the Unmatched screen. Stripping a
      // "host" there would eat the `r/` segment and silently stop matching. So
      // only treat the first segment as a host when it looks like a domain.
      candidate = maybeHost.includes('.')
        ? firstSlash === -1
          ? ''
          : afterScheme.slice(firstSlash)
        : afterScheme;
    }
    const withoutQuery = candidate.split('?')[0].split('#')[0];
    const match = SHARE_PATH.exec(withoutQuery);
    if (match == null) return path;
    return `/recipes/shared/${match[1]}`;
  } catch {
    return path;
  }
}
