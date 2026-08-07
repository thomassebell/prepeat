import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, Text } from "react-native";

import { ds } from "@/constants/ds";

/**
 * The destructive action at the foot of an edit sheet.
 *
 * IMPROVISED, and marked as such: Thomas asked for "red delete button with
 * trash can icon, under the done button" (2026-08-06); no frame draws it. Shape
 * follows the Done button above it; colours are the DS button/danger family,
 * including the pressed state the DS defines.
 *
 * Extracted from ingredient-sheet.tsx on 2026-08-07, when Thomas moved deleting
 * OFF the row and onto the sheet ("can you delete the delete icon and then put
 * the delete function on the edit sheet instead"). That made a second sheet need
 * the identical button, and one shape built by hand in two places is how the
 * isSection bug survived three device builds - so it became a component the
 * moment there was a second caller, not later.
 */
export function SheetDeleteButton({
  label,
  onPress,
}: {
  /** The whole button label, e.g. "Delete ingredient". Also the a11y label. */
  label: string;
  onPress: () => void;
}) {
  const [pressed, setPressed] = useState(false);
  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      accessibilityRole="button"
      accessibilityLabel={label}
      // The pressed colour goes through className, NOT a style function:
      // NativeWind turns className into style, and a style passed as a function
      // is dropped in that merge - which rendered this button with its white
      // label on no background at all (found on device, 2026-08-06).
      className={
        "w-full flex-row items-center justify-center gap-comp-xsmall rounded-medium py-comp-large " +
        (pressed
          ? "bg-button-danger-fill-pressed"
          : "bg-button-danger-fill-enabled")
      }
    >
      <MaterialIcons
        name="delete"
        size={24}
        color={ds.colors.button.danger.label.enabled}
      />
      <Text className="font-paragraph text-components-button-label font-default text-button-danger-label-enabled">
        {label}
      </Text>
    </Pressable>
  );
}
