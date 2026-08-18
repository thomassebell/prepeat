import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Text, View } from 'react-native';

import { IS_DEV_APP } from '@/constants/build-variant';

/** `r/<32 hex>` and nothing else, so a malformed path can never be navigated to. */
const SHARE_PATH = /^\/*r\/([0-9a-f]{32})\/*$/;

/** What we make of an incoming URL. Pure, so it can be computed while rendering
 *  and shown on screen without setting state inside an effect. */
function readUrl(url: string | null): { token: string | null; note: string } {
  if (url == null) return { token: null, note: 'no URL delivered to the app' };
  let path: string | null;
  try {
    path = Linking.parse(url).path ?? null;
  } catch {
    return { token: null, note: `could not parse: ${url}` };
  }
  if (path == null) return { token: null, note: `no path in: ${url}` };
  const match = SHARE_PATH.exec(path);
  if (match == null) return { token: null, note: `path did not match /r/<token>: "${path}"` };
  return { token: match[1], note: `matched: ${match[1].slice(0, 8)}…` };
}

/**
 * Re-applies an incoming share link once the app is actually ready to navigate.
 *
 * ⚠️ WHY THIS EXISTS, because it looks redundant. expo-router enables deep
 * linking for every route automatically, and `/r/[token]` IS in the route
 * manifest – verified in the shipped bundle. Yet a universal link opened the app
 * on the Plan tab and did nothing else (Thomas, on the device, 2026-08-18).
 *
 * The suspected cause is `RootGate` in app/_layout.tsx: it renders `null` while
 * the session and household load, so at the instant the initial URL arrives
 * there is no navigator to receive it, and by the time `<AppTabs />` mounts the
 * URL has been and gone. This component holds the URL and navigates once the
 * tabs exist – which is also why it is mounted BESIDE them.
 *
 * It fixes a case nobody had considered too: a link tapped while SIGNED OUT is
 * honoured after signing in, instead of being silently lost.
 *
 * ⚠️ TEMPORARY DIAGNOSTIC ATTACHED (2026-08-18). Three fixes in a row failed and
 * each cycle costs a build and a tap, so the DEV APP ONLY shows a banner with
 * what it received. Delete the banner and `readUrl`'s `note` once the cause is
 * known; the navigation itself stays.
 */
export function DeepLinkHandler() {
  const url = Linking.useURL();
  const router = useRouter();
  const { token, note } = readUrl(url);
  // Guards against re-navigating on every render, and against a warm link being
  // re-applied when the app returns to the foreground.
  const handled = useRef<string | null>(null);

  useEffect(() => {
    if (url == null || token == null || handled.current === url) return;
    handled.current = url;
    console.log('[deep-link] navigating to token', token);
    router.replace({ pathname: '/r/[token]', params: { token } });
  }, [url, token, router]);

  if (!IS_DEV_APP) return null;
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 60,
        left: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.82)',
        padding: 8,
        borderRadius: 8,
      }}
    >
      <Text style={{ color: '#fff', fontSize: 11 }} numberOfLines={4}>
        deep-link: {note}
      </Text>
    </View>
  );
}
