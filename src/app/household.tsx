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
        {/* `text/default`, like every other page title. The frames briefly
            bound this to `color/text/light` – a raw colour token aliasing a
            grey primitive rather than a semantic text one – and it was wrong
            in Figma too (Thomas, 2026-08-13). Both Settings frames rebound;
            the other screens' frames still need the same (backlog 2.27). */}
        <Text className="flex-1 font-header text-display-4 font-emphasized leading-medium text-text-default">
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
              memberCount={h.id === household.id ? members.length : null}
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
          <ActionRow
            icon="login"
            label="Join an existing kitchen"
            onPress={() => setJoinOpen(true)}
          />
          <ActionRow
            icon="add-home"
            label="Create a new kitchen"
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
          className="w-full flex-row items-center justify-center gap-comp-xsmall rounded-medium border-2 border-button-outline-border-enabled py-comp-large"
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
      <Text className="font-paragraph text-small font-emphasized leading-xxsmall text-text-default">
        {title}
      </Text>
      <View className="w-full overflow-hidden rounded-large bg-surface-neutral-white">
        {children}
      </View>
    </View>
  );
}

// Rows share one pressed treatment. The frame does not draw a pressed state
// (logged as still-to-draw in backlog 2.27) – IMPROVISED here rather than
// shipping tappable rows with no feedback at all, using the page background
// token so it is a DS value and not an invented one.
const rowBase = "w-full flex-row items-center gap-layout-small p-layout-small";
const rowFill = (pressed: boolean) =>
  pressed ? "bg-surface-neutral-lightest" : "bg-surface-neutral-white";
const rowBorder = (isLast: boolean) => (isLast ? "" : "border-b border-border-subtle");

/**
 * One kitchen. The indicator is the switcher's old checkmark, now living in
 * the list: filled green with a check when active, an empty ring otherwise.
 */
function KitchenRow({
  name,
  memberCount,
  selected,
  onPress,
  onMore,
}: {
  name: string;
  memberCount: number | null;
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
              (selected ? "bg-surface-primary-light" : "border border-border-default")
            }
          >
            {selected && (
              <MaterialIcons
                name="check"
                size={16}
                color={ds.colors.button.solid.label.enabled}
              />
            )}
          </View>
          <View className="min-w-0 flex-1">
            <Text
              numberOfLines={1}
              className="font-paragraph text-paragraph font-default leading-xsmall text-text-default"
            >
              {name}
            </Text>
            {memberCount !== null && (
              <View className="flex-row items-center gap-comp-small">
                <MaterialIcons name="people-alt" size={16} color={ds.colors.icon.default} />
                <Text className="font-paragraph text-small font-default leading-xxsmall text-text-default">
                  {memberCount === 1 ? "1 person" : `${memberCount} people`}
                </Text>
              </View>
            )}
          </View>
          {onMore && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Edit kitchen"
              hitSlop={8}
              onPress={onMore}
            >
              <MaterialIcons name="more-vert" size={24} color={ds.colors.icon.default} />
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
            color={accent ? ds.colors.icon.brand : ds.colors.icon.default}
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
            <MaterialIcons name={trailing} size={24} color={ds.colors.icon.default} />
          )}
        </View>
      )}
    </Pressable>
  );
}

/**
 * A member row. The phone owner's avatar is outlined, everyone else's is
 * solid (avatar rule, Thomas 2026-07-18) – and only your own row carries the
 * email and the overflow control, because you can only edit yourself and an
 * affordance on someone else's row would promise otherwise.
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
    <View className={`${rowBase} bg-surface-neutral-white ${rowBorder(false)}`}>
      <View
        className={
          "h-[24px] w-[24px] items-center justify-center rounded-large " +
          (isMe
            ? "border border-border-strong bg-surface-neutral-lighter"
            : "bg-surface-secondary-main")
        }
      >
        <Text
          className={
            "font-header text-display-6 font-emphasized leading-xsmall " +
            (isMe ? "text-text-subtle" : "text-text-inverse")
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
        {isMe && member.email && (
          <View className="flex-row items-center gap-comp-small">
            <MaterialIcons name="mail" size={16} color={ds.colors.icon.default} />
            <Text
              numberOfLines={1}
              className="min-w-0 flex-1 font-paragraph text-small font-default leading-xxsmall text-text-default"
            >
              {member.email}
            </Text>
          </View>
        )}
      </View>
      {isMe && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Edit profile"
          hitSlop={8}
          onPress={onEdit}
        >
          <MaterialIcons name="more-vert" size={24} color={ds.colors.icon.default} />
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
          Everyone sees the same plan and the same shopping list – and it updates as you both
          change it.
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
