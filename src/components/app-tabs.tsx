import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { ds } from '@/constants/ds';

export default function AppTabs() {
  return (
    <NativeTabs
      backgroundColor={ds.colors.surface.neutral.white}
      tintColor={ds.colors.surface.primary.main}
      labelStyle={{ selected: { color: ds.colors.surface.primary.main } }}>
      {/* Plan first, and Plan is the "/" index route – which is what decides
          the tab the app opens on (checked against the Expo docs 2026-08-10:
          trigger order alone does NOT decide it). Most sessions are "what's for
          dinner" or "I'm at the shop", so Plan is the right default for a
          RETURNING user. The first-run case is handled separately – see the
          empty-cookbook item in the backlog – because a reader with no recipes
          needs Recipes, and that is a question about their data, not about the
          tab bar. */}
      <NativeTabs.Trigger name="(plan)">
        <NativeTabs.Trigger.Label>Plan</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'calendar', selected: 'calendar' }} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="recipes">
        <NativeTabs.Trigger.Label>Recipes</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'book', selected: 'book.fill' }} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="shopping">
        <NativeTabs.Trigger.Label>Shopping</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'bag', selected: 'bag.fill' }} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="household">
        <NativeTabs.Trigger.Label>Kitchen</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'person.2', selected: 'person.2.fill' }} />
      </NativeTabs.Trigger>

      {/* DS token verification screen – development builds only. The route
          itself also redirects away in production (see app/ds-check.tsx). */}
      {__DEV__ && <NativeTabs.Trigger name="ds-check" hidden />}
    </NativeTabs>
  );
}
