import { Stack } from 'expo-router';

// The Plan tab is a stack (2026-07-18): plan → recipe detail (→ edit), so
// the back arrow returns to the plan the user came from instead of the
// Recipes tab's list. Plan sits at "/plan"; the (recipes) GROUP holds the
// "/" index route, which is what decides the tab the app opens on
// (Thomas, 2026-08-10). The detail/edit screens are the Recipes tab's own,
// re-exported.
export default function PlanLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
