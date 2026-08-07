import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';

import { ds } from '@/constants/ds';

import { ItemRow } from '@/components/shopping/item-row';
import type { ShoppingItem } from '@/lib/shopping-list';

// The done band paints its darker background this far past its layout box so it
// runs to the bottom of the viewport and through bottom overscroll; an equal
// negative margin cancels the layout effect so it pushes nothing. Any value
// taller than a phone screen works – 1000 clears every device.
const BOTTOM_BLEED = 1000;

interface DoneSectionProps {
  items: ShoppingItem[];
  /** The signed-in member, to tell "your" checkmarks from the family's. */
  currentUserId: string;
  onToggle: (id: string) => void;
  onEdit: (item: ShoppingItem) => void;
  onDelete: (id: string) => void;
  /** Soft-deletes everything in this section (strategy: manual clear). */
  onClear: () => void;
}

export function DoneSection({
  items,
  currentUserId,
  onToggle,
  onEdit,
  onDelete,
  onClear,
}: DoneSectionProps) {
  const [collapsed, setCollapsed] = useState(false);
  if (items.length === 0) return null;
  const label = `${items.length} ${items.length === 1 ? 'item' : 'items'} done`;
  return (
    <Animated.View layout={LinearTransition.duration(250)} exiting={FadeOut.duration(150)}>
      <View
        // Spec: Figma 35:8045 "doneList" - 16 padding all round, 16 between the
        // block and the Clear button (Thomas reworked these spacings
        // 2026-08-07). paddingBottom below deliberately overrides the 16 so the
        // band can bleed; that is the bleed, not a spacing choice.
        // SHADE: `lighter`, not the `light` the frame carried when this was
        // implemented - Thomas compared the two on the device and changed Figma
        // to match ("lighter is better", 2026-08-07). The app is right and the
        // frame followed it, rather than the usual direction.
        className="w-full gap-layout-small bg-surface-neutral-lighter p-layout-small"
        style={{ paddingBottom: BOTTOM_BLEED, marginBottom: -BOTTOM_BLEED }}>
        {/* 16 between the header and the checked items (Figma 73:3496), not 8. */}
        <View className="w-full gap-layout-small">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={collapsed ? `Show ${label}` : `Hide ${label}`}
            onPress={() => setCollapsed((value) => !value)}
            hitSlop={8}
            className="w-full flex-row items-center gap-comp-small">
            {/* Matches a category heading, which in turn matches a recipe's
                ingredient section (Thomas, 2026-08-07 - he asked for the
                categories first, then "the done section should match too").
                So all three headings on the two list screens are now one
                treatment, and a DS retune moves them together.
                Was: font-paragraph text-small. */}
            <Text className="flex-1 font-header text-display-6 font-emphasized leading-xsmall text-text-default">
              {label}
            </Text>
            {/* MATERIAL, not an SF Symbol, and the design says so: the frame
                names this icon `expand_less` (Figma 35:8048), which is a
                Material name. The SF chevron was the deviation, and it showed -
                Thomas spotted it optically before either of us checked the
                frame, because it sat beside a Material drag handle in a matching
                24 box and the two families draw to different weights.
                24 because the heading beside it has leading-xsmall = 24px in the
                DS, so the icon's box matches the text's line box (Thomas: "if
                line-height of done header is 24px the icons bounding box should
                also be 24px"). Was an SF chevron at 16. */}
            <MaterialIcons
              name={collapsed ? 'expand-more' : 'expand-less'}
              size={24}
              color={ds.colors.icon.default}
            />
          </Pressable>
          {!collapsed && (
            <View className="w-full overflow-hidden rounded-large">
              {items.map((item, index) => (
                <Animated.View
                  key={item.id}
                  entering={FadeIn.duration(200)}
                  exiting={FadeOut.duration(150)}
                  layout={LinearTransition.duration(250)}>
                  {index > 0 && <View className="h-px w-full bg-surface-neutral-lightest" />}
                  <ItemRow
                    item={item}
                    showInitial
                    checkedByMe={item.checkedByUserId === currentUserId}
                    onToggle={() => onToggle(item.id)}
                    onEdit={() => onEdit(item)}
                    onDelete={() => onDelete(item.id)}
                  />
                </Animated.View>
              ))}
            </View>
          )}
        </View>
        {/* Danger button from the Figma doneList design (74:5764/74:5804).
            NOW ON THE REAL TOKENS: the old note here said button/danger was
            absent from the DS bridge and mapped the fill to the error scale.
            That is no longer true - ds-theme.cjs carries button/danger/fill and
            /label, and the sheet delete button already uses them. Same colour
            today either way (#DE2D12); the right token name is what survives
            the next DS retune. Spacing already matched the spec: 4 gap, 24
            horizontal, 16 vertical. */}
        {!collapsed && (
          <Animated.View layout={LinearTransition.duration(250)}>
            <Pressable
              onPress={onClear}
              accessibilityRole="button"
              accessibilityLabel="Clear done items"
              className="w-full flex-row items-center justify-center gap-comp-xsmall rounded-small bg-button-danger-fill-enabled px-comp-xlarge py-comp-large">
              <MaterialIcons
                name="delete"
                size={24}
                color={ds.colors.button.danger.label.enabled}
              />
              <Text className="font-paragraph text-components-button-label font-default text-button-danger-label-enabled">
                Clear done items
              </Text>
            </Pressable>
          </Animated.View>
        )}
      </View>
    </Animated.View>
  );
}
