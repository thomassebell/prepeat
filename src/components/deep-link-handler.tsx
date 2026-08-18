import * as Linking from 'expo-linking';
import { useCallback, useState } from 'react';

/** `r/<32 hex>` and nothing else, so a malformed path can never be acted on. */
const SHARE_PATH = /^\/*r\/([0-9a-f]{32})\/*$/;

function tokenFromUrl(url: string | null): string | null {
  if (url == null) return null;
  let path: string | null;
  try {
    path = Linking.parse(url).path ?? null;
  } catch {
    return null;
  }
  if (path == null) return null;
  return SHARE_PATH.exec(path)?.[1] ?? null;
}

/**
 * The share token of the link the app was opened with, if any.
 *
 * ⚠️ THIS DELIBERATELY DOES NOT NAVIGATE, and that is the whole lesson of
 * 2026-08-18. `/r/[token]` was a real route, registered as a hidden NativeTabs
 * trigger. A diagnostic banner on the device proved the URL arrived, parsed and
 * matched – "matched: b90b78f8…" – and `router.replace` STILL left the app on
 * the Plan tab, because a native tab bar will not switch to a tab it is not
 * showing. Three fixes failed before that was visible.
 *
 * So the app renders the shared recipe INSTEAD of the tabs while a link is open.
 * No navigator, nothing that can silently swallow the call.
 *
 * `clear()` returns to the app and remembers the URL, so returning from the
 * background does not reopen the same share.
 */
export function useShareLink(): { token: string | null; clear: () => void } {
  const url = Linking.useURL();
  const [dismissed, setDismissed] = useState<string | null>(null);
  const clear = useCallback(() => setDismissed(url), [url]);
  const token = url != null && url === dismissed ? null : tokenFromUrl(url);
  return { token, clear };
}
