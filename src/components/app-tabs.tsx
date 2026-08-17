import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { ds } from '@/constants/ds';
import { t } from '@/lib/i18n';

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
        <NativeTabs.Trigger.Label>{t('tabs.plan')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'calendar', selected: 'calendar' }} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="recipes">
        <NativeTabs.Trigger.Label>{t('tabs.recipes')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'book', selected: 'book.fill' }} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="shopping">
        <NativeTabs.Trigger.Label>{t('tabs.shopping')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'bag', selected: 'bag.fill' }} />
      </NativeTabs.Trigger>

      {/* Renamed from "Kitchen" 2026-08-13: Plan, Recipes and Shopping all
          live INSIDE the kitchen, so a fourth sibling tab called Kitchen sat
          next to its own contents. The ROUTE stays `household` – only the
          label and icon change, so nothing that links here breaks. */}
      <NativeTabs.Trigger name="household">
        <NativeTabs.Trigger.Label>{t('tabs.settings')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'gearshape', selected: 'gearshape.fill' }} />
      </NativeTabs.Trigger>

      {/* DS token verification screen – development builds only. The route
          itself also redirects away in production (see app/ds-check.tsx). */}
      {__DEV__ && <NativeTabs.Trigger name="ds-check" hidden />}
    </NativeTabs>
  );
}
