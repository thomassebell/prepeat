import { Stack } from 'expo-router';

// Shared-recipe links (`share.prepeat.app/r/<token>`) land here. A stack of its
// own so the screen can draw its own header, exactly like the Recipes tab.
export default function SharedRecipeLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
