import { useEffect, useRef, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Input } from "@/components/ui/input";
import { Tabs, TabItem } from "@/components/ui/tabs";
import { SheetDeleteButton } from "@/components/ui/sheet-delete-button";
import { t } from "@/lib/i18n";

/** Which kind of row the sheet is editing. */
export type IngredientKind = "ingredient" | "section";

/**
 * Focused add/edit of one ingredient OR one section heading (Figma
 * "recipe – add recipe" 495:5523 and 496:5761): a tab strip, a name field, and
 * a quantity field that belongs to ingredients only.
 *
 * Presentational – it emits the edited values via onSubmit; the caller
 * persists them (to the database on the recipe detail, or to the draft in the
 * add/edit form). One focused editing experience everywhere (Pia's feedback,
 * 2026-07-15).
 */
export function IngredientSheet({
  visible,
  editing,
  initialName,
  initialQuantity,
  initialKind = "ingredient",
  onDelete,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  editing: boolean;
  initialName: string;
  initialQuantity: string;
  /** Opening on an existing row starts on that row's tab. */
  initialKind?: IngredientKind;
  /**
   * Removes the row being edited - ingredient or section alike.
   *
   * It began (2026-08-06) as a section-only escape hatch: an ingredient was
   * deleted by swiping its row, but a heading sits outside the cards and has no
   * swipe, so without this it could not be deleted at all. On 2026-08-07 Thomas
   * made it the way EVERY row is deleted ("put the delete function on the edit
   * sheet instead"), which is why the gate on `kind` is gone. Swiping still
   * works; it is no longer the only way, and the two row types no longer differ.
   */
  onDelete?: () => void;
  onClose: () => void;
  onSubmit: (
    name: string,
    quantityText: string | null,
    kind: IngredientKind,
  ) => void;
}) {
  // Lives here rather than in the body because the sheet TITLE follows the tab
  // ("Add ingredient" / "Add section", Thomas 2026-08-04).
  //
  // ⚠️ AND BECAUSE IT LIVES HERE, IT HAS TO BE RE-SYNCED BY HAND.
  // BottomSheet renders its children only while visible (deliberately - see the
  // note on that component), so everything INSIDE it gets a fresh mount per
  // open, which is why the name and quantity fields populate correctly without
  // any of this. This state sits OUTSIDE that boundary, so it never unmounts,
  // and useState's initial value is the one from the very first mount - when
  // nothing was being edited, i.e. "ingredient", for the rest of the screen's
  // life.
  // THE BUG THAT CAUSED (Thomas, 2026-08-07): "when you edit the section it
  // becomes an ingredient". Opening a section for editing left the tab reading
  // Ingredient, and saving wrote isSection = false - silently demoting a
  // heading to an ingredient, which then lands on the shopping list, which is
  // the whole thing sections exist to prevent.
  // Adjusting state during render is React's documented pattern for this and
  // re-renders before paint, so the tab never flashes the wrong value. An
  // effect would show one frame of the wrong tab.
  // KEEP EVERYTHING ELSE IN THE BODY. The fields were briefly hoisted up here
  // too (to feed a pinned footer, reverted the same day) and that put them in
  // exactly the position that caused the bug above. Below the boundary they
  // reset for free; above it, every one of them is a thing somebody has to
  // remember.
  const [kind, setKind] = useState<IngredientKind>(initialKind);
  const [wasVisible, setWasVisible] = useState(visible);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) setKind(initialKind);
  }
  // Four explicit keys rather than "Edit" + " " + noun: gluing a verb to a
  // noun is the composition that breaks the moment a language declines either
  // of them, and it costs nothing to avoid here.
  const sheetTitle =
    kind === "section"
      ? editing
        ? t("recipes.ingredientSheet.editSection")
        : t("recipes.ingredientSheet.addSection")
      : editing
        ? t("recipes.ingredientSheet.editIngredient")
        : t("recipes.ingredientSheet.addIngredient");
  return (
    <BottomSheet
      visible={visible}
      title={sheetTitle}
      onClose={onClose}
      // ⚠️ WITHOUT `scroll` THIS SHEET HAD NO HEIGHT CAP AT ALL - it simply grew
      // with its body, and with the keyboard up it grew past the top of the
      // screen and took the close button with it (Thomas, 2026-08-07: "the sheet
      // comes up too high, user can not close the sheet"). Adding the Delete
      // button was the last straw, but the sheet was one row away from this the
      // whole time.
      // `scroll` caps it and moves the body into a ScrollView while the title
      // and close stay pinned outside it - the same fix, and the same reason, as
      // the reorder sheet's list cap (Thomas, 2026-07-25: "close was unreachable
      // on a long list").
      // minHeightPercent 0 = hug the content and only scroll once it would
      // overflow, so a two-field sheet does not reserve half the screen.
      //
      // ⚠️ DO NOT MOVE DONE AND DELETE INTO `footer`. It was tried on
      // 2026-08-07 and Thomas rejected it on the device: "this is worse. there
      // is no room to move for your finger to scroll the screen." Pinning two
      // full-width buttons costs ~120px of the strip left over once the keyboard
      // is up, and what remains is a single field - a scroll area too small to
      // get a thumb into, so the quantity field becomes unreachable in practice
      // even though it is technically only a scroll away.
      // Everything scrolls together instead. The buttons being reachable "only
      // by scrolling" is fine when there is something to scroll WITH.
      scroll
      minHeightPercent={0}
      // 96 rather than the default 90, so the sheet reaches nearly to the status
      // bar instead of leaving a tenth of the screen unused above it (Thomas,
      // 2026-08-07, marking that strip on a screenshot: "is there more room for
      // the sheet"). On a 932pt phone that is ~56pt back, which is the
      // difference between Done being cut in half and Done being on screen.
      // NOT AN INVENTED NUMBER: the shopping list's edit-item sheet already
      // ships this exact pair (minHeight 0, maxHeight 96), so this matches a
      // decision rather than making a second one. The remaining 4% is what keeps
      // the title clear of the notch - the reorder sheet reserves the same
      // margin for the same reason.
      maxHeightPercent={96}
    >
      <Tabs>
        <TabItem
          label={t("recipes.ingredientSheet.tabIngredient")}
          active={kind === "ingredient"}
          divider
          onPress={() => setKind("ingredient")}
        />
        <TabItem
          label={t("recipes.ingredientSheet.tabSection")}
          active={kind === "section"}
          onPress={() => setKind("section")}
        />
      </Tabs>
      <SheetContent
        kind={kind}
        initialName={initialName}
        initialQuantity={initialQuantity}
        onDelete={editing ? onDelete : undefined}
        onSubmit={onSubmit}
        // ⚠️ ONLY WHEN ADDING (Thomas, 2026-08-07): "when editing, we don't know
        // if the user wants to edit the name, quantity or delete the item. so
        // let's not open with name input active."
        // Adding has exactly one sensible next action - type a name - so the
        // keyboard is a shortcut there. Editing has at least three, and opening
        // on one of them both guesses wrong two times in three AND throws the
        // keyboard over the other two. It is also what makes the whole sheet
        // visible on open, which is the state Thomas confirmed he wanted.
        autoFocus={!editing}
      />
    </BottomSheet>
  );
}

function SheetContent({
  kind,
  initialName,
  initialQuantity,
  onDelete,
  onSubmit,
  autoFocus,
}: {
  kind: IngredientKind;
  initialName: string;
  initialQuantity: string;
  onDelete?: () => void;
  onSubmit: (
    name: string,
    quantityText: string | null,
    kind: IngredientKind,
  ) => void;
  autoFocus: boolean;
}) {
  const [name, setName] = useState(initialName);
  const [quantity, setQuantity] = useState(initialQuantity);
  const nameRef = useRef<TextInput>(null);

  // Mounted fresh on every open (BottomSheet only renders children while
  // visible), so this fires once per opening rather than once per screen. The
  // delay lets the sheet finish sliding up before the keyboard arrives.
  useEffect(() => {
    if (!autoFocus) return;
    const timer = setTimeout(() => nameRef.current?.focus(), 450);
    return () => clearTimeout(timer);
  }, [autoFocus]);

  const submit = () => {
    const trimmed = name.replace(/\s+/g, " ").trim();
    if (!trimmed) return;
    // A heading never carries an amount, even if one was typed before the tab
    // was switched.
    onSubmit(
      trimmed,
      kind === "section" ? null : quantity.trim() || null,
      kind,
    );
  };

  return (
    <>
      <View className="w-full gap-comp-xsmall">
        <Text className="font-paragraph text-small font-default text-text-subtle">
          {t("recipes.ingredientSheet.name")}
        </Text>
        <Input
          ref={nameRef}
          value={name}
          onChangeText={setName}
          placeholder={
            kind === "section"
              ? t("recipes.ingredientSheet.namePlaceholderSection")
              : t("recipes.ingredientSheet.namePlaceholderIngredient")
          }
          accessibilityLabel={t("recipes.ingredientSheet.name")}
          onSubmitEditing={kind === "section" ? submit : undefined}
          returnKeyType={kind === "section" ? "done" : undefined}
        />
      </View>
      {/* A section has a name and nothing else (Figma 496:5761). */}
      {kind === "ingredient" && (
        <View className="w-full gap-comp-xsmall">
          <Text className="font-paragraph text-small font-default text-text-subtle">
            {t("recipes.ingredientSheet.quantity")}
          </Text>
          <Input
            value={quantity}
            onChangeText={setQuantity}
            placeholder={t("recipes.ingredientSheet.quantityPlaceholder")}
            accessibilityLabel={t("recipes.ingredientSheet.quantity")}
            onSubmitEditing={submit}
            returnKeyType="done"
          />
        </View>
      )}
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
          label={
            kind === "section"
              ? t("recipes.ingredientSheet.deleteSection")
              : t("recipes.ingredientSheet.deleteIngredient")
          }
          onPress={onDelete}
        />
      )}
    </>
  );
}
