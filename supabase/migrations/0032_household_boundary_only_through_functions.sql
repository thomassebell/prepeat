-- Prep+Eat – close the two raw-API holes in the household boundary
-- (pre-build audit 2026-08-02, findings #9 and #10).
--
-- Both findings have the same shape, and it is worth naming because it will
-- recur: a RULE was written into a SECURITY DEFINER function, the app was
-- taught to call that function, and the underlying TABLE PERMISSION that the
-- function was meant to replace was left switched on. The app obeys the rule
-- because the app goes through the front door. Anyone holding the anon key –
-- which ships inside every copy of the app and is not a secret – can walk
-- round the back.
--
-- FINDING #9 – an account could be left belonging to ZERO households.
--   leave_household() (0015) refuses to let you leave your only household and
--   snapshots your recipes on the way out for GDPR. But
--   household_members_delete_self (0001:157) let any client delete its own
--   membership row directly, guard-free and snapshot-free. Blast radius is the
--   caller's own account, but it breaks the "every user always belongs to at
--   least one household" invariant the onboarding gate depends on, and it skips
--   the copy-on-leave a departing member is entitled to.
--
-- FINDING #10 – a member could mint a NEVER-EXPIRING invite code.
--   The 14-day lifetime (0019) lives only in rotate_invite_code(). The column
--   was nullable with no default, household_invites_insert (0001:165) never
--   checked it, and redeem still accepted a null expiry – so a current member
--   using raw tooling could plant a code that works forever, e.g. to let
--   themselves back in after leaving.
--
-- THE FIX IS TO REMOVE THE BACK DOOR, NOT TO PUT A LOCK ON IT. The audit
-- offered "tighten the policy" as an alternative for each, and both were
-- rejected for the same reason: a tightened delete policy would still skip the
-- GDPR snapshot, and a tightened insert policy would still be a second way to
-- mint a code that has to be kept in step with rotate_invite_code() forever.
-- One path is testable; two paths that must agree are a future divergence.
--
-- SAFE FOR THE PHONES (the 0022 lesson), and this one was checked rather than
-- assumed, because dropping a policy is exactly the kind of change that reaches
-- every installed build the instant it runs:
--   * EVERY revision of src/lib/household.ts in the repo's history was scanned
--     (11 of them). Not one issues a direct delete against household_members or
--     a direct insert into household_invites. Leaving goes through the
--     leave_household RPC, account deletion through delete_profile, household
--     deletion through delete_household, and code minting through
--     rotate_invite_code – all four SECURITY DEFINER, so all four bypass RLS
--     and are untouched by the policies dropped here.
--   * The one direct write that DOES exist – createHousehold() inserting the
--     creator's own membership row – uses household_members_insert_creator,
--     which is deliberately left alone.
--   * Production held 7 invite rows, 0 with a null expiry, when this was
--     written – so the NOT NULL below cannot fail on live data.
-- Builds 12 through 16 keep working unchanged.

-- ---------------------------------------------------------------------------
-- #9: leaving a household happens in exactly one place
-- ---------------------------------------------------------------------------

drop policy if exists household_members_delete_self on public.household_members;

-- No DELETE policy remains, so no client can remove a membership row directly.
-- leave_household() and delete_profile() are SECURITY DEFINER and unaffected;
-- an account's rows still cascade away when auth.users deletes it, because a
-- foreign-key cascade is not subject to RLS either.

-- ---------------------------------------------------------------------------
-- #10: invite codes are minted in exactly one place, and always expire
-- ---------------------------------------------------------------------------

drop policy if exists household_invites_insert on public.household_invites;

-- Belt and braces: even if an insert path is ever added back, the column can no
-- longer hold "forever". 0019 backfilled every legacy null, and production was
-- re-checked above, so this is provably a no-op on existing rows.
update public.household_invites
set expires_at = now() + interval '14 days'
where expires_at is null;

alter table public.household_invites
  alter column expires_at set not null,
  alter column expires_at set default (now() + interval '14 days');

comment on column public.household_invites.expires_at is
  'When this code stops being redeemable. NOT NULL since 0032 – a code with no '
  'expiry was the "never-expiring invite" hole (audit finding #10). Set to '
  'now() by rotate_invite_code() to retire a code the moment a new one is '
  'minted, so past values are normal and expected.';

-- DELIBERATELY NOT A CHECK CONSTRAINT. "expires_at > now()" reads like the
-- obvious guard and would be a trap twice over: rotate_invite_code() retires
-- old codes by setting expires_at = now(), which the check would reject, and a
-- CHECK against now() re-validates on RESTORE – so every backup holding an
-- expired code would refuse to load. The restore path is verified machinery
-- here (npm run backup:verify) and must not be made conditional on the clock.

-- ---------------------------------------------------------------------------
-- Redeem no longer accepts a code with no expiry
-- ---------------------------------------------------------------------------
--
-- Unchanged from 0012 apart from that one branch. The per-account throttle is
-- deliberately left exactly as it is: it does not stop the attack it was
-- written for (a sweep spread over throwaway accounts tries each code once, so
-- a per-account or per-code cap is never reached), and the replacement is a
-- product decision that is still open. See the backlog, audit finding #7.

create or replace function public.join_household_with_code(p_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite household_invites%rowtype;
  v_recent_attempts integer;
begin
  -- Rolling one-hour window: drop this user's stale attempts, then count.
  delete from invite_redemption_attempts
  where user_id = auth.uid()
    and attempted_at < now() - interval '1 hour';

  select count(*) into v_recent_attempts
  from invite_redemption_attempts
  where user_id = auth.uid();

  if v_recent_attempts >= 10 then
    raise exception 'Too many attempts – please wait a little and try again';
  end if;

  insert into invite_redemption_attempts (user_id) values (auth.uid());

  -- 0032: the null-expiry branch that stood here is gone. A missing expiry is
  -- impossible now, and accepting one was the last half of the
  -- never-expiring-code hole. (Worded to avoid the literal phrase the
  -- verifying select below greps for – a comment mentioning it would make the
  -- check fail against a body that is perfectly correct. It did, first run.)
  select * into v_invite
  from household_invites
  where code = p_code
    and expires_at > now()
  for update;

  if not found then
    raise exception 'Invalid or expired invite code';
  end if;

  insert into household_members (user_id, household_id)
  values (auth.uid(), v_invite.household_id)
  on conflict do nothing;

  update household_invites
  set used_at = now(),
      used_by_user_id = auth.uid()
  where id = v_invite.id;

  return v_invite.household_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- Verifying SELECT. Click once to clear any selection before Run so the whole
-- file executes. Expect every column true.
--
-- The last one reads prosrc rather than merely checking the function EXISTS –
-- the 0030 lesson: a replaced function body is invisible to an
-- "exists in pg_proc" check, so an all-true select on existence alone can pass
-- against a file whose create-or-replace never ran.
-- ---------------------------------------------------------------------------

select
  not exists (
    select 1 from pg_policies
    where tablename = 'household_members' and cmd = 'DELETE'
  ) as no_direct_membership_delete,
  not exists (
    select 1 from pg_policies
    where tablename = 'household_invites' and cmd = 'INSERT'
  ) as no_direct_invite_insert,
  (
    select attnotnull from pg_attribute
    where attrelid = 'public.household_invites'::regclass and attname = 'expires_at'
  ) as expiry_is_mandatory,
  not exists (
    select 1 from household_invites where expires_at is null
  ) as no_null_expiry_rows,
  exists (
    select 1 from pg_policies
    where tablename = 'household_members' and policyname = 'household_members_insert_creator'
  ) as creator_bootstrap_still_works,
  (
    select prosrc not like '%expires_at is null%' and prosrc like '%0032%'
    from pg_proc where proname = 'join_household_with_code'
  ) as redeem_rejects_null_expiry;

-- Two conditions on that last column on purpose. The negative alone ("the old
-- branch is absent") is satisfied by a function that was never replaced at all
-- if the old text happens not to match; the positive ("this body knows it is
-- 0032") is what proves the new body actually landed. 0030 established the
-- positive half; the negative half is what this migration is for.
