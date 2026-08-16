import { MaterialIcons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import { Linking, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { DeleteHouseholdSheet } from "@/components/household/delete-household-sheet";
import { DeleteProfileSheet } from "@/components/household/delete-profile-sheet";
import { EditHouseholdSheet } from "@/components/household/edit-household-sheet";
import { EditProfileSheet } from "@/components/household/edit-profile-sheet";
import { InviteSomeoneSheet } from "@/components/household/invite-someone-sheet";
import { CreateHouseholdModal } from "@/components/household/create-household-modal";
import { JoinHouseholdModal } from "@/components/household/join-household-modal";
import { LeaveHouseholdSheet } from "@/components/household/leave-household-sheet";
import { ds } from "@/constants/ds";
import { Spacing, tabBarClearance } from "@/constants/theme";
import { useAuth } from "@/lib/auth";
import { useHouseholdSwitcher } from "@/lib/household-context";
import {
  deleteHousehold,
  deleteProfile,
  fetchHouseholdMembers,
  getOrCreateInvite,
  leaveHousehold,
  regenerateInvite,
  type HouseholdMember,
  type Invite,
} from "@/lib/household";

// Where Help and Privacy policy point. Both are live on Thomas's own domain
// (checked 2026-08-13, 200 each) rather than the github.io addresses the App
// Store listing still holds – see the "point the listing at prepeat.app" item.
const SUPPORT_URL = "https://prepeat.app/support.html";
const PRIVACY_URL = "https://prepeat.app/privacy.html";

/**
 * The Settings tab (Figma `Settings – default`, 261:68548, built 2026-08-13).
 *
 * Renamed from "Kitchen" because Plan, Recipes and Shopping all live INSIDE
 * the kitchen, so a fourth sibling tab called Kitchen sat next to its own
 * contents. Three groups of rows, no cards:
 *
 *   Kitchens – every kitchen you belong to, the active one check-marked;
 *              tapping a row switches. Then join / create.
 *   People   – members of the ACTIVE kitchen, then the invite affordance.
 *   App      – Help and Privacy policy, opening the live web pages.
 *
 * The old "Household ▾" chevron and its modal switcher are GONE: renaming the
 * title to Settings made a chevron beside it promise to expand settings, and a
 * list of kitchens in a modal on top of a list screen is the same content
 * twice. The kitchen rows had been drawn with a selection state all along.
 */
export default function SettingsScreen() {
  const { session, firstName, signOut } = useAuth();
  const insets = useSafeAreaInsets();
  const myUserId = session?.user?.id ?? null;
  const {
    household,
    households,
    setActiveHousehold,
    addHousehold,
    applyHouseholdUpdate,
    removeHousehold,
  } = useHouseholdSwitcher();

  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [invite, setInvite] = useState<Invite | null>(null);
  const [sheet, setSheet] = useState<
    | "none"
    | "household"
    | "profile"
    | "invite"
    | "leave"
    | "deleteProfile"
    | "deleteHousehold"
  >("none");
  const [joinOpen, setJoinOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const loadMembers = useCallback((householdId: string) => {
    fetchHouseholdMembers(householdId)
      .then(setMembers)
      .catch((error) => console.warn("[settings] members load failed", error));
  }, []);

  // Load the directory and invite code for the active household. Switching
  // household remounts the tab tree (RootGate keys AppTabs on the active id),
  // so this mounts fresh per household – no manual reset needed.
  useEffect(() => {
    let cancelled = false;
    loadMembers(household.id);
    getOrCreateInvite(household.id)
      .then((next) => {
        if (!cancelled) setInvite(next);
      })
      .catch((error) => console.warn("[settings] invite failed", error));
    return () => {
      cancelled = true;
    };
  }, [household.id, loadMembers]);

  // THE INVITE RULE (Thomas, 2026-08-13): one member gets the banner, which
  // has to argue why a second person is worth having; two or more get the
  // quiet green row, because they have already understood the concept and
  // re-pitching it every time Settings opens is noise.
  const isAlone = members.length <= 1;

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-surface-neutral-lightest">
      <View className="w-full flex-row items-center px-layout-small pb-layout-small">
        {/* `text/subtle` (#5F503A) – the value every page title uses in Figma.
            The frames express it as `color/text/light`, a raw colour token
            aliasing a grey primitive; `text/subtle` is the semantic token with
            the same value, so the Settings frames are bound to that instead.
            Structure matches the other screens exactly: `top` 402x40, padding
            0/16, Montserrat Bold 32/40, left-aligned (read off Figma
            2026-08-13). The other three frames still say `color/text/light` –
            same colour, looser binding – see backlog 2.27. */}
        <Text className="flex-1 font-header text-display-4 font-emphasized leading-medium text-text-subtle">
          Settings
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          gap: 16,
          paddingHorizontal: 16,
          paddingBottom: tabBarClearance(insets, Spacing.four),
        }}
      >
        <SettingsGroup title="Kitchens">
          {households.map((h) => (
            <KitchenRow
              key={h.id}
              name={h.name}
              selected={h.id === household.id}
              onPress={() => {
                if (h.id !== household.id) setActiveHousehold(h.id);
              }}
              // Only the active kitchen carries the overflow control. The
              // frame draws it on every row, but the MENU behind it is not
              // designed yet – it has to answer edit/leave/delete for a
              // kitchen you may not be standing in, and leaving one you are
              // not in is a different confirmation. Rendering a dead control
              // on the other rows would be worse than leaving it off.
              onMore={h.id === household.id ? () => setSheet("household") : null}
            />
          ))}
          {/* Both are `text/brand` + `icon/brand` in the frames, like Invite
              someone below: green marks a row that DOES something, against
              rows that state a fact. */}
          <ActionRow
            icon="login"
            label="Join an existing kitchen"
            accent
            onPress={() => setJoinOpen(true)}
          />
          <ActionRow
            icon="add-home"
            label="Create a new kitchen"
            accent
            isLast
            onPress={() => setCreateOpen(true)}
          />
        </SettingsGroup>

        <SettingsGroup title="People">
          {members.map((member) => (
            <MemberRow
              key={member.userId}
              member={member}
              isMe={member.userId === myUserId}
              onEdit={() => setSheet("profile")}
            />
          ))}
          {isAlone ? (
            <InviteBanner onPress={() => setSheet("invite")} />
          ) : (
            <ActionRow
              icon="person-add-alt-1"
              label="Invite someone"
              accent
              isLast
              onPress={() => setSheet("invite")}
            />
          )}
        </SettingsGroup>

        <SettingsGroup title="App">
          <ActionRow
            icon="help"
            label="Help"
            trailing="open-in-new"
            onPress={() => openExternal(SUPPORT_URL)}
          />
          <ActionRow
            icon="policy"
            label="Privacy policy"
            trailing="open-in-new"
            isLast
            onPress={() => openExternal(PRIVACY_URL)}
          />
        </SettingsGroup>

        <Pressable
          accessibilityRole="button"
          onPress={() =>
            signOut().catch((error) => console.warn("[settings] sign out failed", error))
          }
          className="w-full flex-row items-center justify-center gap-comp-xsmall rounded-medium border-2 border-button-outline-border-enabled px-comp-xlarge py-comp-large"
        >
          <MaterialIcons name="logout" size={24} color={ds.colors.button.outline.label.enabled} />
          <Text className="font-paragraph text-components-button-label font-default text-button-outline-label-enabled">
            Sign out
          </Text>
        </Pressable>
      </ScrollView>

      <EditHouseholdSheet
        visible={sheet === "household"}
        household={household}
        canDelete={members.length === 1 && households.length > 1}
        onClose={() => setSheet("none")}
        onSaved={applyHouseholdUpdate}
        onDelete={() => setSheet("deleteHousehold")}
      />
      <EditProfileSheet
        visible={sheet === "profile"}
        canLeave={members.length > 1}
        onClose={() => setSheet("none")}
        onSaved={() => {
          // The 0010 auth trigger has mirrored the new name into profiles –
          // refetch so the member row follows.
          loadMembers(household.id);
        }}
        onLeave={() => setSheet("leave")}
        onDelete={() => setSheet("deleteProfile")}
      />
      <InviteSomeoneSheet
        visible={sheet === "invite"}
        onClose={() => setSheet("none")}
        householdName={household.name}
        invite={invite}
        onRegenerate={async () => {
          const next = await regenerateInvite(household.id);
          setInvite(next);
          return next;
        }}
      />
      <LeaveHouseholdSheet
        visible={sheet === "leave"}
        householdName={household.name}
        onClose={() => setSheet("none")}
        onConfirm={async () => {
          const newHousehold = await leaveHousehold(household.id);
          // Drop the household we left and switch into the new kitchen
          // (addHousehold makes it active, remounting the tabs).
          removeHousehold(household.id);
          addHousehold(newHousehold);
        }}
      />
      <DeleteProfileSheet
        visible={sheet === "deleteProfile"}
        firstName={firstName}
        onClose={() => setSheet("none")}
        onConfirm={async () => {
          await deleteProfile();
          // The account is gone server-side; clear the local session, which
          // drops back to onboarding.
          await signOut();
        }}
      />
      <DeleteHouseholdSheet
        visible={sheet === "deleteHousehold"}
        householdName={household.name}
        onClose={() => setSheet("none")}
        onConfirm={async () => {
          await deleteHousehold(household.id);
          // Switch to another of your households (canDelete guarantees one
          // exists), then drop the deleted one. Switching remounts the tabs.
          const other = households.find((h) => h.id !== household.id);
          if (other) setActiveHousehold(other.id);
          removeHousehold(household.id);
        }}
      />

      <JoinHouseholdModal
        visible={joinOpen}
        onClose={() => setJoinOpen(false)}
        onJoined={(joined) => {
          setJoinOpen(false);
          addHousehold(joined);
        }}
      />

      <CreateHouseholdModal
        visible={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(created) => {
          setCreateOpen(false);
          addHousehold(created);
        }}
      />
    </SafeAreaView>
  );
}

function openExternal(url: string) {
  Linking.openURL(url).catch((error) => console.warn("[settings] link failed", url, error));
}

/**
 * A titled group: a small bold label, then a white rounded container the rows
 * sit inside. Rows draw their own bottom border, so the container clips.
 */
function SettingsGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="w-full gap-layout-xsmall">
      {/* Section headers are Montserrat Bold 16/24 (`header/display 6`), the
          same as the shopping list's categories and a recipe's Ingredients /
          Instructions – see category-group.tsx:70. Built first as IBM Plex
          Bold 12/16, which is what "match the other pages" was about
          (Thomas, 2026-08-13). */}
      <Text className="font-header text-display-6 font-emphasized leading-xsmall text-text-default">
        {title}
      </Text>
      <View className="w-full overflow-hidden rounded-large bg-surface-neutral-white">
        {children}
      </View>
    </View>
  );
}

// Rows share one pressed treatment. SPECIFIED BY THOMAS 2026-08-16 as
// `surface/neutral/lighter` – it was Claude's improvisation on `lightest`
// until then. See the backlog: at this value a pressed row matches the
// INACTIVE kitchen circle exactly (both #E7E6E4), so that circle disappears
// for as long as the row is held.
const rowBase = "w-full flex-row items-center gap-layout-small p-layout-small";
const rowFill = (pressed: boolean) =>
  pressed ? "bg-surface-neutral-lighter" : "bg-surface-neutral-white";
const rowBorder = (isLast: boolean) => (isLast ? "" : "border-b border-border-subtle");

/**
 * One kitchen. The active one carries a filled `surface/secondary/main`
 * indicator with a white check; the others carry a `surface/neutral/lighter`
 * circle, so the left gutter is never empty (Thomas, 2026-08-16, after the
 * first build shipped the blank version – then moved a step darker from
 * `lightest`, which matched the page background and barely read on a white
 * card).
 *
 * The 24px box takes `radius/large` (16), which clamps to a full circle at
 * this size – the same value the frame uses.
 */
function KitchenRow({
  name,
  selected,
  onPress,
  onMore,
}: {
  name: string;
  selected: boolean;
  onPress: () => void;
  onMore: (() => void) | null;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={selected ? `${name}, current kitchen` : `Switch to ${name}`}
      onPress={onPress}
    >
      {({ pressed }) => (
        <View className={`${rowBase} ${rowFill(pressed)} ${rowBorder(false)}`}>
          <View
            className={
              "h-[24px] w-[24px] items-center justify-center rounded-large " +
              (selected ? "bg-surface-secondary-main" : "bg-surface-neutral-lighter")
            }
          >
            {selected && (
              <MaterialIcons name="check" size={16} color={ds.colors.text.inverse} />
            )}
          </View>
          <View className="min-w-0 flex-1">
            {/* Row label: IBM Plex Regular 16/24 on `text/default`, as the
                frames draw it. Confirmed by Thomas 2026-08-16, who also
                deleted the app-side "header rule" this was once measured
                against – type comes from the DS and from the frame, and
                nothing in this repo overrules either. */}
            <Text
              numberOfLines={1}
              className="font-paragraph text-paragraph font-default leading-xsmall text-text-default"
            >
              {name}
            </Text>
          </View>
          {onMore && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Edit kitchen"
              hitSlop={8}
              onPress={onMore}
            >
              <MaterialIcons name="more-vert" size={24} color={ds.colors.icon.subtle} />
            </Pressable>
          )}
        </View>
      )}
    </Pressable>
  );
}

/**
 * A plain action row: leading icon, label, optional trailing icon. `accent`
 * turns it green – used only for Invite someone, so it reads as an action
 * rather than a fact without breaking the list rhythm.
 */
function ActionRow({
  icon,
  label,
  trailing,
  accent = false,
  isLast = false,
  onPress,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  trailing?: keyof typeof MaterialIcons.glyphMap;
  accent?: boolean;
  isLast?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress}>
      {({ pressed }) => (
        <View className={`${rowBase} ${rowFill(pressed)} ${rowBorder(isLast)}`}>
          <MaterialIcons
            name={icon}
            size={24}
            color={accent ? ds.colors.icon.brand : ds.colors.icon.subtle}
          />
          <Text
            className={
              "min-w-0 flex-1 font-paragraph text-paragraph font-default leading-xsmall " +
              (accent ? "text-text-brand" : "text-text-default")
            }
          >
            {label}
          </Text>
          {trailing && (
            <MaterialIcons name={trailing} size={24} color={ds.colors.icon.subtle} />
          )}
        </View>
      )}
    </Pressable>
  );
}

/**
 * A member row: a 64px row (the only fixed height on the screen – every other
 * row is padding-driven at 56), an avatar, a name, and the overflow control on
 * your own row only, because you can only edit yourself.
 *
 * The avatar follows the frames: YOUR avatar is solid `surface/secondary/main`,
 * everyone else's is `surface/neutral/light`. That is inverted from the
 * 2026-07-18 rule ("the phone owner's avatar is outlined, everyone else's is
 * solid"), and THOMAS RETIRED THAT RULE 2026-08-16 in favour of what Figma
 * draws. Do not restore it.
 *
 * The email line is gone: the frames give every member row a single label, and
 * no email node is visible on any of them. Confirmed by design, same day.
 */
function MemberRow({
  member,
  isMe,
  onEdit,
}: {
  member: HouseholdMember;
  isMe: boolean;
  onEdit: () => void;
}) {
  const initial = (member.firstName ?? member.email ?? "?").charAt(0).toUpperCase();
  return (
    <View className={`${rowBase} h-[64px] bg-surface-neutral-white ${rowBorder(false)}`}>
      <View
        className={
          "h-[24px] w-[24px] items-center justify-center rounded-xlarge " +
          (isMe ? "bg-surface-secondary-main" : "bg-surface-neutral-light")
        }
      >
        <Text
          className={
            "font-header text-display-6 font-emphasized leading-xsmall " +
            (isMe ? "text-text-inverse" : "text-text-default")
          }
        >
          {initial}
        </Text>
      </View>
      <View className="min-w-0 flex-1">
        <Text
          numberOfLines={1}
          className="font-paragraph text-paragraph font-default leading-xsmall text-text-default"
        >
          {member.firstName ?? "…"}
        </Text>
      </View>
      {isMe && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Edit profile"
          hitSlop={8}
          onPress={onEdit}
        >
          <MaterialIcons name="more-vert" size={24} color={ds.colors.icon.subtle} />
        </Pressable>
      )}
    </View>
  );
}

/**
 * Shown instead of the invite row when you are alone in a kitchen. It argues
 * rather than labels: someone by themselves is not hesitating because the
 * button is hard to find, they do not know what a second person gets them.
 * The copy points at the shopping list, because a shared cookbook is
 * something you already have on your own.
 */
function InviteBanner({ onPress }: { onPress: () => void }) {
  return (
    <View className="w-full gap-layout-small bg-surface-neutral-white px-layout-small pb-layout-medium pt-layout-small">
      <MaterialIcons name="person-add-alt-1" size={40} color={ds.colors.icon.brand} />
      <View className="w-full">
        <Text className="font-header text-display-5 font-emphasized leading-small text-text-accent">
          Invite someone
        </Text>
        <Text className="font-paragraph text-paragraph font-default leading-xsmall text-text-default">
          Everyone sees the same plan and the same shopping list – and it updates as everyone
          changes it.
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        className="w-full flex-row items-center justify-center gap-comp-xsmall rounded-medium bg-button-solid-fill-enabled px-comp-xlarge py-comp-large"
      >
        <MaterialIcons
          name="person-add-alt-1"
          size={24}
          color={ds.colors.button.solid.label.enabled}
        />
        <Text className="font-paragraph text-components-button-label font-default text-button-solid-label-enabled">
          Invite someone
        </Text>
      </Pressable>
    </View>
  );
}
