import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';

/**
 * Re-applies an incoming share link once the app is actually ready to navigate.
 *
 * ⚠️ WHY THIS EXISTS, because it looks redundant. expo-router enables deep
 * linking for every route automatically, and `/r/[token]` IS in the route
 * manifest – verified in the shipped bundle. Yet a universal link opened the app
 * on the Plan tab and did nothing else (Thomas, on the device, 2026-08-18).
 *
 * The reason is `RootGate` in app/_layout.tsx: it renders `null` while the
 * session and household load, so at the instant the initial URL is delivered
 * there is no navigator to receive it. By the time `<AppTabs />` mounts, the URL
 * has been and gone, and the navigator starts on its default tab.
 *
 * Rather than restructure the gate – which decides onboarding for every user and
 * is the riskiest file in the app to touch for this – this component holds onto
 * the URL and navigates once the tabs exist. It also fixes the case nobody had
 * thought about: a link tapped while SIGNED OUT is now honoured after signing
 * in, instead of being silently lost.
 *
 * Deliberately narrow: it only ever acts on `/r/...`, so it cannot interfere
 * with any other navigation.
 */
export function DeepLinkHandler() {
  const url = Linking.useURL();
  const router = useRouter();
  // Guards against re-navigating on every re-render, and against a warm link
  // being re-applied when the app returns to the foreground.
  const handled = useRef<string | null>(null);

  useEffect(() => {
    if (url == null || handled.current === url) return;
    let path: string | null = null;
    try {
      path = Linking.parse(url).path ?? null;
    } catch {
      return;
    }
    if (path == null) return;
    // `r/<token>` and nothing else. Matched on shape rather than passed
    // through as a string so expo-router's typed routes stay honest - and so a
    // malformed path can never be navigated to.
    const match = /^\/*r\/([0-9a-f]{32})\/*$/.exec(path);
    if (match == null) return;
    handled.current = url;
    router.replace({ pathname: '/r/[token]', params: { token: match[1] } });
  }, [url, router]);

  return null;
}
