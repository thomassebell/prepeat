import { Stack } from 'expo-router';

// The Recipes tab is a stack: list → detail → add/edit form. Screens draw
// their own headers (back arrow + actions per the Figma frames).
//
// ⚠️ `initialRouteName` is what makes BACK work after a deep link. A shared
// recipe link opens `recipes/shared/<token>` directly, and without this the tab
// starts with that screen ALONE at the bottom of the stack – so `router.back()`
// has nowhere to go and drops the user out to the Plan tab, unable to reach
// their recipes at all (Thomas, 2026-08-18, after saving a shared recipe).
//
// With it, expo-router puts the list underneath any deep-linked screen, so back
// lands on Recipes exactly as it does when you arrive by tapping.
export const unstable_settings = { initialRouteName: 'index' };

export default function RecipesLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
