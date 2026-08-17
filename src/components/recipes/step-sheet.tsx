import { SymbolView } from "expo-symbols";
import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Input } from "@/components/ui/input";
import { SheetDeleteButton } from "@/components/ui/sheet-delete-button";
import { ds } from "@/constants/ds";
import { t } from "@/lib/i18n";

/**
 * Focused add/edit of one instruction. Presentational – emits the text (and,
 * when adding, the chosen position) via onSubmit; the caller persists. The
 * position picker only shows when adding, since editing keeps the step where
 * it is (reordering is a separate gesture).
 */
export function StepSheet({
  visible,
  editing,
  initialText,
  positionCount,
  initialPosition,
  onDelete,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  editing: boolean;
  initialText: string;
  /** Number of positions offered when adding (existing steps + 1). */
  positionCount: number;
  initialPosition: number;
  /**
   * Removes the instruction being edited. Wired 2026-08-07, when Thomas moved
   * deleting off the row and onto the sheet ("put the delete function on the
   * edit sheet instead") - the ingredient sheet gained the same thing in the
   * same change, so the two sheets stay alike. Absent when adding.
   */
  onDelete?: () => void;
  onClose: () => void;
  onSubmit: (text: string, position: number) => void;
}) {
  return (
    <BottomSheet
      visible={visible}
      title={
        editing ? t("recipes.stepSheet.titleEdit") : t("recipes.stepSheet.titleAdd")
      }
      onClose={onClose}
      scroll
    >
      <SheetContent
        editing={editing}
        initialText={initialText}
        positionCount={positionCount}
        initialPosition={initialPosition}
        onDelete={editing ? onDelete : undefined}
        onSubmit={onSubmit}
      />
    </BottomSheet>
  );
}

function SheetContent({
  editing,
  initialText,
  positionCount,
  initialPosition,
  onDelete,
  onSubmit,
}: {
  editing: boolean;
  initialText: string;
  positionCount: number;
  initialPosition: number;
  onDelete?: () => void;
  onSubmit: (text: string, position: number) => void;
}) {
  const [text, setText] = useState(initialText);
  const [position, setPosition] = useState(initialPosition);
  const [pickerOpen, setPickerOpen] = useState(false);
  const textRef = useRef<TextInput>(null);

  // ⚠️ ONLY WHEN ADDING (Thomas, 2026-08-07, about the ingredient sheet and
  // true here for exactly the same reason): "when editing, we don't know if the
  // user wants to edit the name, quantity or delete the item. so let's not open
  // with name input active." Adding has one sensible next action - type the
  // instruction - so the keyboard is a shortcut. Editing has several, and
  // opening on one of them guesses wrong most of the time AND throws the
  // keyboard over the rest.
  useEffect(() => {
    if (editing) return;
    const timer = setTimeout(() => textRef.current?.focus(), 450);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const positions = Array.from({ length: positionCount }, (_, i) => i + 1);

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSubmit(trimmed, position);
  };

  return (
    <>
      {!editing && (
        <View className="w-full gap-comp-xsmall">
          <Text className="font-paragraph text-small font-default text-text-subtle">
            {t("recipes.stepSheet.step")}
          </Text>
          <Pressable
            onPress={() => setPickerOpen((open) => !open)}
            accessibilityRole="button"
            accessibilityLabel={t("recipes.step", { number: position })}
            className="w-full flex-row items-center rounded-medium border border-forms-border-enabled bg-forms-background-default p-comp-large"
          >
            <Text className="flex-1 font-paragraph text-paragraph text-text-default">
              {position}
            </Text>
            <SymbolView
              name={pickerOpen ? "chevron.up" : "chevron.down"}
              size={14}
              tintColor={ds.colors.icon.default}
            />
          </Pressable>
          {pickerOpen && (
            <ScrollView
              className="w-full overflow-hidden rounded-medium border border-forms-border-enabled"
              style={{ maxHeight: 200 }}
              nestedScrollEnabled
            >
              {positions.map((option, index) => (
                <Pressable
                  key={option}
                  accessibilityRole="button"
                  accessibilityLabel={t("recipes.step", { number: option })}
                  onPress={() => {
                    setPosition(option);
                    setPickerOpen(false);
                  }}
                  className={
                    (option === position
                      ? "bg-success-lightest"
                      : "bg-surface-neutral-white") +
                    (index > 0
                      ? " border-t border-surface-neutral-lighter"
                      : "")
                  }
                >
                  <Text className="p-comp-medium font-paragraph text-paragraph text-text-default">
                    {option}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          )}
        </View>
      )}

      <View className="w-full gap-comp-xsmall">
        <Text className="font-paragraph text-small font-default text-text-subtle">
          {t("recipes.stepSheet.instruction")}
        </Text>
        <Input
          ref={textRef}
          value={text}
          onChangeText={setText}
          placeholder={t("recipes.stepSheet.instructionPlaceholder")}
          accessibilityLabel={t("recipes.stepSheet.instruction")}
          multiline
          numberOfLines={4}
          style={{ minHeight: 96, textAlignVertical: "top" }}
        />
      </View>

      <Pressable
        onPress={submit}
        accessibilityRole="button"
        className="w-full items-center rounded-medium bg-button-solid-fill-enabled py-comp-large"
      >
        <Text className="font-paragraph text-components-button-label font-default text-button-solid-label-enabled">
          {t("common.done")}
        </Text>
      </Pressable>
      {onDelete != null && (
        <SheetDeleteButton
          label={t("recipes.stepSheet.delete")}
          onPress={onDelete}
        />
      )}
    </>
  );
}
