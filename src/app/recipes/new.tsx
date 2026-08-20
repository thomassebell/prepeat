import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Fragment, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
} from "react-native";
import Animated, { useAnimatedRef } from "react-native-reanimated";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { ServingsCounter } from "@/components/recipes/servings-counter";
import { ImportRecipeSheet } from "@/components/recipes/import-recipe-sheet";
import { IngredientSheet } from "@/components/recipes/ingredient-sheet";
import { IngredientDragList } from "@/components/recipes/ingredient-drag-list";
import { InstructionDragList } from "@/components/recipes/instruction-drag-list";
import { StepSheet } from "@/components/recipes/step-sheet";
import type { ImportedRecipe } from "@/lib/recipe-import";
import { moveBlock } from "@/lib/reorder";
import { Input } from "@/components/ui/input";
import { ds } from "@/constants/ds";
import { Spacing, tabBarClearance } from "@/constants/theme";
import { friendlyError } from "@/lib/error-messages";
import { t } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { useHousehold } from "@/lib/household-context";
import {
  createRecipe,
  fetchRecipe,
  replaceIngredientsAndSteps,
  updateRecipeFacts,
  uploadRecipePhoto,
  type DraftIngredient,
} from "@/lib/recipes";

/**
 * The editor's rows as the data layer wants them: an empty quantity box means
 * "no amount", not an empty string.
 *
 * Deliberately the ONLY place this conversion happens. isSection was dropped
 * five separate times in this file (import, edit load, sheet write-back, and
 * both save branches) because each site rebuilt the object by hand, and adding
 * a field to the shared type could not make any of them fail to compile.
 */
function toDraftIngredients(rows: DraftIngredient[]): DraftIngredient[] {
  return rows.map((row) => ({
    name: row.name,
    quantityText: row.quantityText || null,
    isSection: row.isSection,
  }));
}

/** Leading number in "10 min" style time fields; empty/absent → null. */
function parseMinutes(text: string): number | null {
  const match = text.match(/\d+/);
  return match ? Number(match[0]) : null;
}

/**
 * "Add new recipe" (Figma section 121:11255): recipe facts, servings,
 * photo, then ingredients and instructions built up inline. With ?id= the
 * same form reopens filled to edit an existing recipe's facts.
 */
export default function AddRecipeScreen() {
  // ?title= prefills the name – the plan's recipe picker sends its search
  // term here when the meal is not in the library yet (2026-07-16).
  const { id, title: titleParam } = useLocalSearchParams<{
    id?: string;
    title?: string;
  }>();
  const household = useHousehold();
  const { session } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const editing = id != null && id.length > 0;

  const [title, setTitle] = useState(editing ? "" : (titleParam ?? ""));
  const [description, setDescription] = useState("");
  const [prep, setPrep] = useState("");
  const [cook, setCook] = useState("");
  const [servings, setServings] = useState(4);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [existingPhotoUrl, setExistingPhotoUrl] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<DraftIngredient[]>([]);
  const [steps, setSteps] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(!editing);
  // True while an ingredient, a section or an instruction is in the air. The page must not
  // scroll under it BY ITSELF: two vertical gestures on one finger is the one
  // thing that makes an in-place drag unusable. The drag scrolls the page
  // deliberately instead, through this ref, when the finger reaches an edge.
  const [dragging, setDragging] = useState(false);
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const [importing, setImporting] = useState(false);
  // Add and edit both go through the focused sheet: "add" opens it empty,
  // { index } opens it on an existing draft row (Pia's feedback, 2026-07-15).
  const [ingredientSheet, setIngredientSheet] = useState<
    { index: number } | "add" | null
  >(null);
  const [stepSheet, setStepSheet] = useState<{ index: number } | "add" | null>(
    null,
  );
  // Held as a plain string so the field can be typed in and cleared; saved as
  // null when empty. Filled by an import, and editable ever since (2026-07-27).
  const [sourceUrl, setSourceUrl] = useState("");
  // An import that brought ingredients but NO method. smittenkitchen.com marks
  // up its ingredients and not its instructions, so the form opened with an
  // empty Instructions card and no explanation – indistinguishable from the
  // importer having dropped the steps, which is a bug Thomas had just reported
  // for real (2026-08-16). Nothing can be parsed; the fix is saying so.
  const [importHadNoSteps, setImportHadNoSteps] = useState(false);

  useEffect(() => {
    if (!editing) return;
    fetchRecipe(id)
      .then((recipe) => {
        setTitle(recipe.title);
        setDescription(recipe.description ?? "");
        setPrep(recipe.prepMinutes != null ? String(recipe.prepMinutes) : "");
        setCook(recipe.cookMinutes != null ? String(recipe.cookMinutes) : "");
        setServings(recipe.servings);
        setExistingPhotoUrl(recipe.imageUrl);
        setSourceUrl(recipe.sourceUrl ?? "");
        setIngredients(
          recipe.ingredients.map((ingredient) => ({
            name: ingredient.name,
            quantityText: ingredient.quantityText ?? "",
            isSection: ingredient.isSection,
          })),
        );
        setSteps(recipe.steps.map((step) => step.text));
        setLoaded(true);
      })
      .catch((error) => console.warn("[recipes] edit fetch failed", error));
  }, [editing, id]);

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [16, 10],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  // Everything found on the page lands in the form for review – the
  // external photo URL goes through the normal upload on save.
  const applyImport = (imported: ImportedRecipe) => {
    setImporting(false);
    setTitle(imported.title);
    setDescription(imported.description ?? "");
    setPrep(imported.prepMinutes != null ? String(imported.prepMinutes) : "");
    setCook(imported.cookMinutes != null ? String(imported.cookMinutes) : "");
    if (imported.servings != null) setServings(imported.servings);
    if (imported.imageUrl != null) setPhotoUri(imported.imageUrl);
    setIngredients(
      imported.ingredients.map((ingredient) => ({
        name: ingredient.name,
        quantityText: ingredient.quantityText ?? "",
        isSection: ingredient.isSection === true,
      })),
    );
    setSteps(imported.steps);
    // Set on EVERY import, not only when empty, so importing a second recipe
    // over the first clears a notice the new page does not deserve.
    setImportHadNoSteps(imported.steps.length === 0);
    setSourceUrl(imported.sourceUrl);
  };

  // Ingredients and instructions are added and edited entirely through the
  // focused sheets (Pia's feedback, 2026-07-15).

  const save = async () => {
    const trimmedTitle = title.replace(/\s+/g, " ").trim();
    if (!trimmedTitle || busy) return;
    // An emptied field means "no source", not an empty string.
    const trimmedSource = sourceUrl.trim() || null;
    setBusy(true);
    setSaveError(null);
    try {
      let imageUrl = existingPhotoUrl;
      if (photoUri != null) {
        // The photo must never cost you the recipe. On import photoUri is an
        // external URL taken straight off the page (applyImport), so this
        // upload is the most likely thing to fail here – a hotlink-blocked or
        // moved image, a relative path, a flaky connection. Losing the whole
        // reviewed recipe to that is the worst outcome; saving it without the
        // picture is recoverable (add one later from Edit). Audit 2026-08-02.
        try {
          imageUrl = await uploadRecipePhoto(household.id, photoUri);
        } catch (photoError) {
          console.warn("[recipes] photo upload failed, saving without it", photoError);
          imageUrl = existingPhotoUrl;
        }
      }
      if (editing) {
        await updateRecipeFacts(id, {
          title: trimmedTitle,
          description: description.trim() || null,
          servings,
          prepMinutes: parseMinutes(prep),
          cookMinutes: parseMinutes(cook),
          imageUrl,
          sourceUrl: trimmedSource,
        });
        await replaceIngredientsAndSteps(
          id,
          toDraftIngredients(ingredients),
          steps,
        );
        router.back();
      } else {
        const recipeId = await createRecipe(
          household.id,
          session?.user?.id ?? "",
          {
            title: trimmedTitle,
            sourceUrl: trimmedSource,
            description: description.trim() || null,
            servings,
            prepMinutes: parseMinutes(prep),
            cookMinutes: parseMinutes(cook),
            imageUrl,
            ingredients: toDraftIngredients(ingredients),
            steps,
          },
        );
        router.replace(`/recipes/${recipeId}`);
      }
    } catch (error) {
      // Never fail silently: the form keeps everything the user typed (or
      // imported and reviewed) so Save can simply be pressed again.
      console.warn("[recipes] save failed", error);
      setSaveError(friendlyError(error));
      setBusy(false);
    }
  };

  if (!loaded) {
    return (
      <SafeAreaView
        edges={["top"]}
        className="flex-1 items-center justify-center bg-surface-neutral-lightest"
      >
        <ActivityIndicator color={ds.colors.surface.primary.main} />
      </SafeAreaView>
    );
  }

  const photoPreview = photoUri ?? existingPhotoUrl;

  return (
    <SafeAreaView
      edges={["top"]}
      className="flex-1 bg-surface-neutral-lightest"
    >
      <View className="w-full flex-row items-center px-layout-small py-comp-small">
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={t("common.back")}
        >
          <MaterialIcons
            name="arrow-back"
            size={28}
            color={ds.colors.surface.primary.main}
          />
        </Pressable>
      </View>

      <Animated.ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        scrollEnabled={!dragging}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        contentContainerStyle={{
          // The save bar below is a real footer, so the scroll area only needs
          // a little breathing room at the end – not the tab-bar clearance.
          paddingBottom: Spacing.three,
          gap: 16,
        }}
      >
        {/* Recipe facts card */}
        <View className="w-full px-layout-small">
          <View className="w-full gap-layout-small overflow-hidden rounded-large bg-surface-neutral-white p-layout-small">
            <MaterialIcons
              name="receipt-long"
              size={40}
              color={ds.colors.surface.primary.main}
            />
            <View className="w-full gap-comp-small">
              <Text className="font-header text-display-5 font-emphasized leading-small text-text-default">
                {editing ? t("recipes.form.titleEdit") : t("recipes.form.titleAdd")}
              </Text>
              <Text className="font-paragraph text-paragraph font-default leading-xsmall text-text-default">
                {t("recipes.form.blurb")}
              </Text>
            </View>

            {!editing && (
              <OutlineButton
                icon="link"
                label={t("recipes.form.fromLink")}
                onPress={() => setImporting(true)}
              />
            )}

            {/* Image sits at the top of the inputs (feedback 2026-07-16). */}
            {photoPreview != null && (
              <View className="h-[160px] w-full overflow-hidden rounded-medium">
                <Image
                  source={{ uri: photoPreview }}
                  style={{ width: "100%", height: "100%" }}
                  contentFit="cover"
                />
              </View>
            )}
            <OutlineButton
              icon="add-photo-alternate"
              label={
                photoPreview != null
                  ? t("recipes.form.changeImage")
                  : t("recipes.form.addImage")
              }
              onPress={pickPhoto}
            />

            <Field label={t("recipes.form.name")}>
              <Input
                value={title}
                onChangeText={setTitle}
                placeholder={t("recipes.form.namePlaceholder")}
                accessibilityLabel={t("recipes.form.name")}
              />
            </Field>
            <Field label={t("recipes.form.description")}>
              <Input
                value={description}
                onChangeText={setDescription}
                placeholder={t("recipes.form.descriptionPlaceholder")}
                accessibilityLabel={t("recipes.form.description")}
                multiline
                // A recipe blurb runs to a few lines – grow the field into a
                // text area that starts top-aligned rather than a one-line input.
                textAlignVertical="top"
                style={{ minHeight: 96 }}
              />
            </Field>
            <Field label={t("recipes.form.prep")}>
              <Input
                value={prep}
                onChangeText={setPrep}
                placeholder={t("recipes.form.prepPlaceholder")}
                accessibilityLabel={t("recipes.form.prep")}
              />
            </Field>
            <Field label={t("recipes.form.cook")}>
              <Input
                value={cook}
                onChangeText={setCook}
                placeholder={t("recipes.form.cookPlaceholder")}
                accessibilityLabel={t("recipes.form.cook")}
              />
            </Field>
            <Field label={t("recipes.form.servings")}>
              <ServingsCounter value={servings} onChange={setServings} />
            </Field>
            {/* Filled automatically by a link import; editable so a recipe you
                have made your own can drop or correct the credit (Thomas,
                2026-07-27). Last of the facts, mirroring where it shows on the
                detail screen. IMPROVISED – no Figma frame for this field. */}
            <Field label={t("recipes.form.source")}>
              <Input
                value={sourceUrl}
                onChangeText={setSourceUrl}
                placeholder={t("recipes.form.sourcePlaceholder")}
                accessibilityLabel={t("recipes.form.sourceLink")}
                keyboardType="url"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </Field>
          </View>
        </View>

        <>
          {/* Ingredients builder */}
          <View className="w-full gap-layout-small px-layout-small">
            {/* Decision 1 (Thomas, 2026-08-04): the first section REPLACES this
                header rather than sitting beside it, so it disappears the
                moment a section exists - and comes back when the last one
                goes. */}
            {!ingredients.some((row) => row.isSection) && (
            <View className="w-full flex-row items-center">
              {/* Same style as a section heading (Thomas, 2026-08-06): the
                  first section REPLACES this line, so they are one slot and
                  must not change typeface when that happens.
                  NO HANDLE HERE ANY MORE (2026-08-20): a handle that opens a
                  reorder sheet is a second place the list exists, and the rows
                  themselves are draggable now. A section heading still has one,
                  because there it IS the grip. */}
              <Text className="flex-1 font-header text-display-6 font-emphasized text-text-default">
                {t("recipes.ingredients")}
              </Text>
            </View>
            )}
            {/* One card per section, its heading sitting outside the card
                (Figma 496:9255). 16px between every heading and card - and the
                rows are draggable in place, which is why the whole block is one
                component now (2026-08-20). */}
            <IngredientDragList
              rows={ingredients}
              scrollRef={scrollRef}
              onEditRow={(index) => setIngredientSheet({ index })}
              onDeleteRow={(index) =>
                setIngredients((current) => current.filter((_, i) => i !== index))
              }
              onEditSection={(index) => setIngredientSheet({ index })}
              onDragChange={setDragging}
              onReorder={(from, size, target) =>
                setIngredients((current) => moveBlock(current, from, size, target))
              }
            />
            <View className="w-full overflow-hidden rounded-large bg-surface-neutral-white p-layout-small">
              <OutlineButton
                icon="add"
                label={t("recipes.form.addIngredient")}
                onPress={() => setIngredientSheet("add")}
              />
            </View>
          </View>

          {/* Instructions builder */}
          {/* 16 between a heading and its list, the same as every section
              heading above (Thomas, 2026-08-20). It had been 4 here and 16
              there, which reads as two kinds of heading rather than one. */}
          <View className="w-full gap-layout-small px-layout-small">
            <View className="w-full flex-row items-center">
              {/* Same style as the Ingredients header and every section heading
                  (Thomas, 2026-08-20: *"yes, match the instructions heading
                  style too"*). It was the one heading on this screen drawn in
                  paragraph type, which made it read as a lesser thing than the
                  list above it rather than its equal. The recipe screen already
                  had them matching. */}
              <Text className="flex-1 font-header text-display-6 font-emphasized text-text-default">
                {t("recipes.instructions")}
              </Text>
            </View>
            {/* NOT overflow-hidden any more (2026-08-20): a step being dragged
                is drawn over this box, and a box that clips its children clips
                the thing in the air the moment it passes the top row. The rows
                do their own clipping instead - they are the only full-bleed
                thing in here, and they round their own top corners. */}
            <View className="w-full gap-layout-small rounded-large bg-surface-neutral-white p-layout-small">
              {/* This screen's own box – it makes no claim to be the DS alert
                  banner, which is the DS's to build. A copy of that component
                  lived here briefly on 2026-08-16 and was deleted; see the
                  backlog. */}
              {importHadNoSteps && steps.length === 0 && (
                <View className="w-full rounded-medium bg-info-lightest px-comp-large py-comp-small">
                  <Text className="font-paragraph text-paragraph font-default leading-xsmall text-text-default">
                    {t("recipes.form.noSteps")}
                  </Text>
                </View>
              )}
              {steps.length > 0 && (
                <InstructionDragList
                  steps={steps}
                  scrollRef={scrollRef}
                  onEditStep={(index) => setStepSheet({ index })}
                  onDeleteStep={(index) =>
                    setSteps((current) => current.filter((_, i) => i !== index))
                  }
                  onDragChange={setDragging}
                  onReorder={(from, size, target) =>
                    setSteps((current) => moveBlock(current, from, size, target))
                  }
                />
              )}
              <OutlineButton
                icon="add"
                label={t("recipes.form.addInstruction")}
                onPress={() => setStepSheet("add")}
              />
            </View>
          </View>
        </>
      </Animated.ScrollView>

      {/* Save is pinned to the bottom of the screen rather than scrolling
          away at the end of the form: on a long recipe it sat far below the
          fold and edits were being lost by leaving without it (Thomas,
          2026-07-28). IMPROVISED – the Figma add/edit frame puts the button
          at the end of the page and has no sticky-footer frame yet. */}
      <View
        style={{ paddingBottom: tabBarClearance(insets, Spacing.three) }}
        className="w-full gap-comp-small border-t border-border-subtle bg-surface-neutral-lightest px-layout-small pt-comp-medium"
      >
        {/* Sits in the pinned footer, beside the button that failed, so it
            cannot scroll out of view on a long recipe. Same banner as the
            onboarding/household modals. */}
        {saveError != null && (
          <View className="w-full flex-row items-start gap-comp-large rounded-medium bg-error-lightest px-comp-large py-comp-small">
            <Text className="flex-1 font-paragraph text-paragraph font-default leading-xsmall text-text-default">
              {saveError}
            </Text>
            <MaterialIcons name="error-outline" size={24} color={ds.colors.icon.default} />
          </View>
        )}
        <Pressable
          onPress={save}
          disabled={busy || title.trim().length === 0}
          accessibilityRole="button"
          className={
            "w-full items-center rounded-medium py-comp-large " +
            (busy || title.trim().length === 0
              ? "bg-surface-neutral-main"
              : "bg-button-solid-fill-enabled")
          }
        >
          {busy ? (
            <ActivityIndicator color={ds.colors.text.inverse} />
          ) : (
            <Text className="font-paragraph text-components-button-label font-default text-button-solid-label-enabled">
              {editing ? t("recipes.form.saveChanges") : t("recipes.form.save")}
            </Text>
          )}
        </Pressable>
      </View>

      <ImportRecipeSheet
        visible={importing}
        onClose={() => setImporting(false)}
        onImported={applyImport}
      />

      <IngredientSheet
        visible={ingredientSheet != null}
        editing={ingredientSheet !== null && ingredientSheet !== "add"}
        initialName={
          ingredientSheet !== null && ingredientSheet !== "add"
            ? (ingredients[ingredientSheet.index]?.name ?? "")
            : ""
        }
        initialQuantity={
          ingredientSheet !== null && ingredientSheet !== "add"
            ? (ingredients[ingredientSheet.index]?.quantityText ?? "")
            : ""
        }
        initialKind={
          ingredientSheet != null &&
          ingredientSheet !== "add" &&
          ingredients[ingredientSheet.index]?.isSection
            ? "section"
            : "ingredient"
        }
        onDelete={() => {
          const target = ingredientSheet;
          setIngredientSheet(null);
          if (target != null && target !== "add") {
            // Only the heading goes; its ingredients stay and join whatever
            // section precedes them - decision 2 (Thomas, 2026-08-04), which
            // positional grouping gives for free.
            setIngredients((current) =>
              current.filter((_, i) => i !== target.index),
            );
          }
        }}
        onClose={() => setIngredientSheet(null)}
        onSubmit={(name, quantityText, kind) => {
          const target = ingredientSheet;
          const isSection = kind === "section";
          setIngredientSheet(null);
          const row = { name, quantityText: quantityText ?? "", isSection };
          if (target === "add") {
            setIngredients((current) => {
              // Decision 1 (Thomas, 2026-08-04): the FIRST section absorbs the
              // ingredients already listed, rather than appearing empty below
              // them - so it goes in at the top. Later sections append, since
              // the rows under them have not been written yet.
              const firstSection =
                isSection && !current.some((existing) => existing.isSection);
              return firstSection ? [row, ...current] : [...current, row];
            });
          } else if (target != null) {
            setIngredients((current) =>
              current.map((existing, i) => (i === target.index ? row : existing)),
            );
          }
        }}
      />

      <StepSheet
        visible={stepSheet != null}
        editing={stepSheet !== null && stepSheet !== "add"}
        initialText={
          stepSheet !== null && stepSheet !== "add"
            ? (steps[stepSheet.index] ?? "")
            : ""
        }
        positionCount={
          stepSheet === "add" ? steps.length + 1 : steps.length
        }
        initialPosition={
          stepSheet !== null && stepSheet !== "add"
            ? stepSheet.index + 1
            : steps.length + 1
        }
        onDelete={() => {
          const target = stepSheet;
          setStepSheet(null);
          if (target != null && target !== "add") {
            setSteps((current) => current.filter((_, i) => i !== target.index));
          }
        }}
        onClose={() => setStepSheet(null)}
        onSubmit={(text, position) => {
          const target = stepSheet;
          setStepSheet(null);
          if (target === "add") {
            // Insert at the chosen position (1-based).
            setSteps((current) => [
              ...current.slice(0, position - 1),
              text,
              ...current.slice(position - 1),
            ]);
          } else if (target != null) {
            setSteps((current) =>
              current.map((existing, i) => (i === target.index ? text : existing)),
            );
          }
        }}
      />

    </SafeAreaView>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View className="w-full gap-comp-xsmall">
      <Text className="font-paragraph text-small font-default text-text-subtle">
        {label}
      </Text>
      {children}
    </View>
  );
}

function OutlineButton({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="w-full flex-row items-center justify-center gap-comp-xsmall rounded-medium border-2 border-button-outline-border-enabled py-comp-large"
    >
      <MaterialIcons name={icon} size={20} color={ds.colors.icon.default} />
      <Text className="font-paragraph text-components-button-label font-default text-text-subtle">
        {label}
      </Text>
    </Pressable>
  );
}
