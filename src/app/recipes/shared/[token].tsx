import { useLocalSearchParams, useRouter } from "expo-router";

import { SharedRecipeScreen } from "@/components/shared-recipe";

/**
 * A shared recipe, INSIDE the Recipes tab's stack.
 *
 * ⚠️ THE LOCATION IS THE FIX. This lived at `app/r/[token].tsx` first, as a
 * hidden NativeTabs trigger, and it was unreachable: a native tab bar will not
 * switch to a tab it is not showing, so `router.replace` was accepted and
 * ignored. Removing the route was worse – expo-router owns the incoming URL and
 * showed "Unmatched Route".
 *
 * Here it is an ordinary screen in a VISIBLE tab's stack, which navigates like
 * any other. The public URL stays `share.prepeat.app/r/<token>`; `+native-intent`
 * rewrites that path to this route.
 */
export default function SharedRecipeRoute() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const router = useRouter();
  // Back, not replace: with `initialRouteName` on the Recipes layout there is
  // always a list underneath, even when the app was opened straight onto this
  // screen by a link. The fallback covers the case where there genuinely is not.
  return (
    <SharedRecipeScreen
      token={token}
      onClose={() => (router.canGoBack() ? router.back() : router.replace("/recipes"))}
    />
  );
}
