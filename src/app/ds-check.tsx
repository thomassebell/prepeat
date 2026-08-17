// Verification screen for the DS token wiring, reachable at /ds-check. A
// development-only tool: the route redirects away in production so it is not
// reachable in a shipped build, even by deep link (the file still registers a
// route with expo-router regardless of the hidden tab trigger). Every class
// below comes from the Sebell DS Prep+Eat theme fragment.
import { Redirect } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Chip } from '@/components/ui/chip';
import { Switch } from '@/components/ui/switch';

export default function DsCheck() {
  const [picked, setPicked] = useState<string[]>(['Veggie']);
  const [switched, setSwitched] = useState(true);
  const toggle = (tag: string) =>
    setPicked((p) => (p.includes(tag) ? p.filter((t) => t !== tag) : [...p, tag]));
  // __DEV__ is true in the dev client and false in Release builds, so a
  // production deep link to /ds-check lands on the home tab instead. Placed
  // after the hooks so they are always called (Rules of Hooks).
  if (!__DEV__) return <Redirect href="/" />;
  return (
    <ScrollView
      className="flex-1 bg-surface-primary"
      contentContainerClassName="gap-layout-medium p-comp-small">
      {/* Green surface + mocha text + Montserrat weights */}
      <View className="gap-comp-small rounded-medium bg-surface-neutral-white p-comp-small">
        <Text className="font-header text-display-5 font-emphasized text-text-default">
          Prep+Eat tokens
        </Text>
        <Text className="font-header text-paragraph font-emphasized text-text-default">
          font-emphasized · 700
        </Text>
        <Text className="font-header text-paragraph font-default text-text-default">
          font-default · 400
        </Text>
        <Text className="font-header text-paragraph font-understate text-text-default">
          font-understate · 200
        </Text>
      </View>

      {/* Display scale on the green surface */}
      <Text className="font-header text-display-1 font-emphasized text-text-inverse">Aa</Text>

      {/* Chip rows – solid and outline, tap to toggle active */}
      <View className="gap-comp-small rounded-medium bg-surface-neutral-white p-comp-small">
        <View className="flex-row flex-wrap gap-comp-small">
          {['Veggie', 'Quick', 'Kids'].map((tag) => (
            <Chip key={tag} label={tag} active={picked.includes(tag)} onPress={() => toggle(tag)} />
          ))}
          <Chip label="Disabled" disabled />
        </View>
        <View className="flex-row flex-wrap gap-comp-small">
          {['Veggie', 'Quick', 'Kids'].map((tag) => (
            <Chip
              key={tag}
              label={tag}
              variant="outline"
              startIcon={picked.includes(tag) ? 'check' : undefined}
              active={picked.includes(tag)}
              onPress={() => toggle(tag)}
            />
          ))}
        </View>
      </View>

      {/* Switch – every state the RN port carries, so it can be held next to
          the DS's own Storybook (Components / Switch, brand prep-eat) and
          checked. The port cannot run the DS's CI checks; this is the only
          place in the app where its states are visible side by side. */}
      <View className="gap-comp-small rounded-medium bg-surface-neutral-white p-comp-small">
        <Text className="font-header text-paragraph font-emphasized text-text-default">
          switch · off / on / pressed / disabled
        </Text>
        <View className="flex-row items-center gap-comp-small">
          <Switch value={false} />
          <Switch value={true} />
          <Switch value={false} pressed />
          <Switch value={true} pressed />
          <Switch value={false} disabled />
          <Switch value={true} disabled />
        </View>
        <Text className="font-paragraph text-small font-default text-text-subtle">
          Tap to drive the real thing:
        </Text>
        <View className="flex-row items-center gap-comp-small">
          <Pressable onPress={() => setSwitched((on) => !on)}>
            {({ pressed }) => <Switch value={switched} pressed={pressed} />}
          </Pressable>
        </View>
      </View>

      {/* Error color + radius + component padding */}
      <View className="rounded-medium bg-error p-comp-small">
        <Text className="font-header text-paragraph font-default text-text-inverse">
          bg-error · rounded-medium · p-comp-small
        </Text>
      </View>
    </ScrollView>
  );
}
