import { MaterialIcons } from "@expo/vector-icons";
import { SymbolView } from "expo-symbols";
import {
  createContext,
  useContext,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { ds } from "@/constants/ds";

// A sheet exposes its ScrollView to its own body, so a section can scroll
// itself into view – e.g. the edit-item sheet brings the category list up when
// its picker opens. Every sheet has one since 2026-08-20.
const BottomSheetScrollContext = createContext<RefObject<ScrollView | null> | null>(
  null,
);

export function useBottomSheetScroll(): RefObject<ScrollView | null> | null {
  return useContext(BottomSheetScrollContext);
}

/**
 * The shared bottom-sheet shell (backlog debt, extracted 2026-07-16 for the
 * Plan milestone): Modal + keyboard avoidance + backdrop + white card with
 * a title row and close button. Carries the keyboard-bleed fix
 * (marginBottom -80 / paddingBottom 120) so new sheets inherit it and it
 * cannot drift between copies.
 *
 * Children re-mount every time the sheet opens (they render only while
 * visible), so field state resets per open without key juggling.
 */
export function BottomSheet({
  visible,
  title,
  subtitle,
  onClose,
  onBack,
  scroll = false,
  bodyScrollsItself = false,
  minHeightPercent = 55,
  maxHeightPercent = 90,
  footer,
  children,
}: {
  visible: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  /**
   * Multi-step flows (Figma 181:45301): a top row with a back arrow left
   * and the close right, the title block below – instead of the default
   * inline title + close row.
   */
  onBack?: () => void;
  /**
   * ⚠️ NO LONGER "gets a cap" – EVERY sheet is capped now (2026-08-20). This
   * marks a sheet whose body is a LIST TO BROWSE rather than a short form:
   * it opens at `minHeightPercent` instead of hugging its content, and its
   * children sit at the tighter `layout-small` rhythm.
   *
   * Leave it off for a form or a confirmation. Those still hug, and are still
   * capped, and now scroll if a long translation pushes them past the cap.
   */
  scroll?: boolean;
  /**
   * The body manages its own height AND its own scrolling (a FlatList or
   * ScrollView). The shell then adds neither a scroller nor a cap: it steps
   * out of the way entirely.
   *
   * ⚠️ WHY THIS EXISTS, found on the device 2026-08-20 within minutes of making
   * the cap unconditional. The add-meal sheet's body is a `FlatList` with
   * `flex-1`. Wrapping it in a ScrollView gives it an UNBOUNDED height, so the
   * list stops flexing: a short list left a dead gap and pushed "Add to plan"
   * off the bottom of the screen. Thomas: *"plenty of room for the sheet to
   * move higher on the screen."* It is also a nested VirtualizedList, which
   * React Native warns against for the same reason.
   *
   * ⚠️ AND THE CAP HAD TO GO TOO, found on the SECOND pass. Keeping the cap
   * while dropping the wrapper broke it differently and worse: with an
   * unbounded card the `flex-1` list sized to its content, but a capped card
   * gives the list slack to absorb, so it grew and pushed the servings, the day
   * picker and the CTA past the bottom of the screen. In Swap mode - no tabs,
   * so more slack - the CTA was not reachable at all.
   *
   * ⚠️ SO THIS SHEET IS STILL UNCAPPED, deliberately, and that is a KNOWN GAP
   * rather than a fix. Capping it properly means changing its own layout so the
   * LIST shrinks and the footer holds - real work on a screen that works today,
   * and its own item. Half-capping it broke a working screen twice in ten
   * minutes.
   *
   * This whole sequence is the failure the backlog item predicted - *"adding
   * the cap also wraps the contents, so it can shift layout subtly, and nine
   * screens changed without walking any is how a fix becomes a bug round"*.
   * Both breakages were caught in minutes because the sheets were walked.
   */
  bodyScrollsItself?: boolean;
  /**
   * How tall a `scroll` sheet OPENS (percent of screen). Defaults to 55; pass 0
   * to hug the content (e.g. the edit-item sheet, short until its picker
   * opens). Ignored without `scroll` – a form has no reason to reserve empty
   * space below itself.
   */
  minHeightPercent?: number;
  /**
   * The ceiling EVERY sheet grows to (percent of screen), scrolling past it.
   * Defaults to 90; raise it for a sheet that should use almost the whole
   * screen when full – e.g. the edit-item category list.
   */
  maxHeightPercent?: number;
  /**
   * Pinned below the scroll area – for a CTA that must stay reachable however
   * long the body is, or however much of the screen the keyboard takes
   * (Thomas, 2026-07-25: the edit-item "Done" fell below the fold).
   */
  footer?: ReactNode;
  children: ReactNode;
}) {
  const scrollRef = useRef<ScrollView>(null);
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      {visible && (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1 justify-end"
        >
          <Pressable
            style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
            className="bg-black/30"
            onPress={onClose}
            accessibilityLabel="Close"
          />
          <View
            style={{
              marginBottom: -80,
              paddingBottom: 120,
              // Figma 508:13824 / 495:4756. marginBottom -80 with paddingBottom
              // 120 already leaves the 40px the design asks for, so the
              // keyboard-bleed fix and the spec happen to agree - do not
              // "correct" one into breaking the other.
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.25,
              shadowRadius: 24,
              elevation: 12,
              // ⚠️ THE CAP IS UNCONDITIONAL, and that is the point (2026-08-20).
              // It used to apply only in `scroll` mode, so every other sheet
              // could grow past the top of the screen until the ✕ was
              // unreachable and the sheet could not be dismissed at all. That
              // happened to the ingredient sheet the moment it gained one more
              // button. Eleven sheets were still uncapped, INCLUDING one added
              // the day before this fix - a new sheet inherited the bug by
              // default, which is why the default is what changed rather than
              // the eleven call sites.
              // ⚠️ NOT capped when the body manages its own height - see
              // `bodyScrollsItself`. Capping such a sheet is worse than leaving
              // it: its `flex-1` list absorbs the slack and pushes the CTA off
              // the bottom.
              ...(bodyScrollsItself
                ? null
                : { maxHeight: `${maxHeightPercent}%` as const }),
              // A minimum is opt-in and only meaningful with `scroll`: it is
              // for a sheet that should open tall (a list to browse), not for
              // a short form, which should still hug its content.
              ...(scroll && minHeightPercent
                ? { minHeight: `${minHeightPercent}%` as const }
                : null),
            }}
            className="w-full gap-layout-medium rounded-t-large bg-surface-neutral-lightest p-layout-small"
          >
            {onBack ? (
              <View className="w-full flex-row items-center justify-between">
                <Pressable
                  onPress={onBack}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="Back"
                >
                  <MaterialIcons
                    name="arrow-back"
                    size={28}
                    color={ds.colors.surface.primary.main}
                  />
                </Pressable>
                <Pressable
                  onPress={onClose}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="Close"
                >
                  <MaterialIcons
                    name="close"
                    size={28}
                    color={ds.colors.icon.default}
                  />
                </Pressable>
              </View>
            ) : null}
            <View className="w-full gap-layout-xsmall">
              <View className="w-full flex-row items-center">
                <Text className="flex-1 font-header text-display-5 font-emphasized text-text-default">
                  {title}
                </Text>
                {!onBack && (
                  <Pressable
                    onPress={onClose}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel="Close"
                  >
                    <SymbolView
                      name="xmark"
                      size={24}
                      tintColor={ds.colors.icon.default}
                    />
                  </Pressable>
                )}
              </View>
              {subtitle ? (
                <Text className="font-paragraph text-paragraph font-default text-text-subtle">
                  {subtitle}
                </Text>
              ) : null}
            </View>
            {/* ⚠️ ALWAYS A ScrollView NOW, so the cap above has somewhere to
                give. Without one the body would simply CLIP at the cap, which
                is worse than growing off-screen: the content is gone with no
                way to reach it.

                ⚠️ AND THE GAP FOLLOWS THE MODE, which is the whole reason this
                was risky to change. Children used to sit DIRECTLY in the card,
                inheriting its `gap-layout-medium` (24). The scroll path wraps
                them at `gap-layout-small` (16). So wrapping everything at 16
                would have silently retightened ten sheets that nobody asked to
                change - the "adding a cap shifts layout subtly" this fix was
                warned about. Each mode keeps the spacing it already had. */}
            {bodyScrollsItself ? (
              // Straight through: the body scrolls itself and the cap above is
              // what keeps it on screen.
              children
            ) : (
              <ScrollView
                ref={scrollRef}
                style={{ flexShrink: 1 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                // A sheet that fits should not rubber-band like a scrollable one.
                bounces={scroll}
              >
                <BottomSheetScrollContext.Provider value={scrollRef}>
                  <View
                    className={
                      "w-full " + (scroll ? "gap-layout-small" : "gap-layout-medium")
                    }
                  >
                    {children}
                  </View>
                </BottomSheetScrollContext.Provider>
              </ScrollView>
            )}
            {footer}
          </View>
        </KeyboardAvoidingView>
      )}
    </Modal>
  );
}
