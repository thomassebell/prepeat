import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Input } from "@/components/ui/input";
import { ds } from "@/constants/ds";
import { t } from "@/lib/i18n";

// The fail-safe: the user must type this to arm the delete (Figma
// "delete household 3", label "To confirm this, type “DELETE”").
const confirmWord = () => t("settings.confirmWord");

/**
 * Delete household confirmation (Figma "delete household 3", 2026-07-22).
 * Only reachable for a household you are the sole member of; deletes it and
 * everything in it (recipes, plans, lists). Irreversible – a type-"DELETE"
 * fail-safe guards the button. The delete + switch runs in onConfirm.
 */
export function DeleteHouseholdSheet({
  visible,
  householdName,
  onClose,
  onConfirm,
}: {
  visible: boolean;
  householdName: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  return (
    <BottomSheet visible={visible} title={t("settings.deleteKitchen.title", { name: householdName })} onClose={onClose}>
      {visible && <Content householdName={householdName} onConfirm={onConfirm} />}
    </BottomSheet>
  );
}

function Content({
  householdName,
  onConfirm,
}: {
  householdName: string;
  onConfirm: () => Promise<void>;
}) {
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const armed = confirm.trim().toUpperCase() === confirmWord();
  const canDelete = armed && !busy;

  const del = async () => {
    if (!canDelete) return;
    setBusy(true);
    setError(null);
    try {
      await onConfirm();
      // onConfirm closes the sheet on success, which unmounts this – so the
      // spinner stays up until then and there is no state to reset here.
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.generic"));
      setBusy(false);
    }
  };

  return (
    <View className="w-full gap-layout-small">
      <Text className="font-paragraph text-paragraph font-default leading-xsmall text-text-default">
        {t("settings.deleteKitchen.body", { name: householdName })}
      </Text>

      <View className="w-full gap-layout-xsmall">
        <Text className="font-paragraph text-components-label font-default leading-xxsmall text-text-subtle">
          {t("settings.confirmTypePrompt", { word: confirmWord() })}
        </Text>
        <Input
          value={confirm}
          onChangeText={setConfirm}
          autoCapitalize="characters"
          autoCorrect={false}
          accessibilityLabel={t("settings.confirmTypeLabel", { word: confirmWord() })}
        />
      </View>

      {error != null && (
        <View className="w-full flex-row items-start gap-comp-large rounded-medium bg-error-lightest px-comp-large py-comp-small">
          <Text className="flex-1 font-paragraph text-paragraph font-default leading-xsmall text-text-default">
            {error}
          </Text>
          <MaterialIcons name="error-outline" size={24} color={ds.colors.icon.default} />
        </View>
      )}

      <Pressable
        accessibilityRole="button"
        disabled={!canDelete}
        onPress={del}
        className={
          "w-full flex-row items-center justify-center gap-comp-xsmall rounded-medium py-comp-large " +
          (canDelete ? "bg-button-danger-fill-enabled" : "bg-surface-neutral-light")
        }
      >
        {busy ? (
          <ActivityIndicator color={ds.colors.error["contrast-text"]} />
        ) : (
          <>
            <MaterialIcons
              name="delete-outline"
              size={24}
              color={canDelete ? ds.colors.error["contrast-text"] : ds.colors.text.disabled}
            />
            <Text
              className={
                "font-paragraph text-components-button-label font-default " +
                (canDelete ? "text-button-danger-label-enabled" : "text-text-disabled")
              }
            >
              {t("settings.deleteKitchen.confirm")}
            </Text>
          </>
        )}
      </Pressable>
    </View>
  );
}
