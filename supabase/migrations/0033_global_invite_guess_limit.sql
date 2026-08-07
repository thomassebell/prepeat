-- Prep+Eat – put a real limit on invite-code guessing (audit finding #7).
--
-- ⚠️ FIRST, THE THING NOBODY KNEW: THE EXISTING THROTTLE NEVER WORKED.
--
-- 0012 added "10 tries per hour per account" and it has been believed ever
-- since, including by the 2026-08-02 audit, which treated it as real protection
-- that merely had the wrong KEY. It is not weak protection. It is none.
--
-- The mechanism, and it is one line of structure rather than a typo:
-- join_household_with_code() inserts the attempt row, then RAISES on a bad
-- code. An unhandled raise aborts the transaction, and PostgREST rolls the
-- request back - so the insert made three lines earlier is undone. Every failed
-- guess erases its own evidence. The table therefore only ever accumulates
-- SUCCESSFUL joins, which is exactly what production holds: 2 rows, both real.
--
-- Proved rather than reasoned about (supabase/tests/household-boundary.sql):
-- 15 wrong guesses in 15 separate transactions recorded 0 attempts, and the
-- 16th was still answered "Invalid or expired invite code" rather than "Too
-- many attempts".
--
-- WHY THAT MATTERS MORE THAN THE AUDIT SAID. A guesser does not need a CHOSEN
-- household, only ANY live code, so the difficulty is the code space divided by
-- the number of live codes: 28^4 = 614,656 over 5 live codes is ~123,000
-- guesses - under an hour at ordinary request rates, from ONE account, with
-- nothing slowing it down. And it gets easier as the app grows, not harder.
--
-- ---------------------------------------------------------------------------
-- THE FIX, AND WHY IT LOOKS ODD
-- ---------------------------------------------------------------------------
--
-- Thomas chose a GLOBAL cap on attempts (2026-08-07) over a longer code, to
-- keep the short fridge-worthy code that was a deliberate product decision in
-- 0003.
--
-- But a global counter kept in a TABLE would vanish exactly the way the
-- per-account one does - same transaction, same rollback. The counter has to
-- survive a rolled-back transaction, and in Postgres precisely one thing does:
-- SEQUENCES. nextval() and setval() are explicitly non-transactional and are
-- never rolled back. That is usually a footnote about gaps in id columns; here
-- it is the whole mechanism.
--
-- So the limiter is two sequences and no table at all:
--   invite_guess_counter – guesses so far in the current window
--   invite_guess_window  – when that window started, as epoch seconds
-- Both are moved with setval/nextval, so an attacker cannot undo their own
-- count by making the request fail. There is no row to write, which is what
-- makes it rollback-proof.
--
-- THE CAP IS CHECKED BEFORE THE CODE IS LOOKED UP, and that ordering is the
-- entire point rather than an implementation detail. Checking validity first
-- and only counting failures would remove the denial-of-service risk below -
-- and would also be useless, because a sweep that is still allowed to LOOK UP
-- every code will eventually hit a live one however carefully we count
-- afterwards. The lookup is the thing that has to stop.
--
-- ACCEPTED COST, and Thomas accepted it explicitly: an attacker can spend the
-- hourly budget deliberately and make legitimate joining fail for up to an
-- hour. That is a mild denial of service against a rare action, traded for
-- closing a hole that puts a stranger inside a family's household. The refusal
-- reuses 0012's exact wording, so every installed build already shows the right
-- friendly message for it ("Too many tries - wait a few minutes...", handled at
-- src/lib/household.ts:216).
--
-- SAFE FOR THE PHONES (the 0022 lesson): no signature change, nothing dropped,
-- one function body replaced. Builds 12-16 keep working and are PROTECTED by
-- this the moment it runs, with no app change - the guessing happens on the
-- server, so the fix lands on everybody's phone at once.

-- ---------------------------------------------------------------------------
-- The limit. One place, deliberately, because it will need raising.
-- ---------------------------------------------------------------------------
--
-- 30 attempts/hour globally. At 5 live codes a full sweep needs ~123,000
-- guesses, so this turns "under an hour" into roughly 170 days, while being far
-- more headroom than real use needs: today the whole app sees a handful of
-- joins a MONTH.
--
-- ⚠️ WHEN TO RAISE IT, and what raising it costs. The cap has to grow with real
-- joining, and every increase weakens the protection proportionally. Worse, the
-- protection also weakens on its own as households multiply, because more live
-- codes means fewer guesses to hit one (~615 guesses at 1,000 households). So
-- this buys years at today's size and months at a hundred times it.
-- A LONGER CODE IS THE FIX THAT ACTUALLY SCALES - 6 characters is 481 million
-- instead of 614,656, or ~780x. Revisit that (backlog: finding #7, option B)
-- when the app has real growth, rather than repeatedly raising this number.

create sequence if not exists public.invite_guess_counter minvalue 0 start 0;
create sequence if not exists public.invite_guess_window minvalue 0 start 0;

-- Start the window now, with an empty count.
select setval('public.invite_guess_window', extract(epoch from now())::bigint);
select setval('public.invite_guess_counter', 0);

comment on sequence public.invite_guess_counter is
  'Invite-code guesses made in the current hour, app-wide. A SEQUENCE and not a '
  'table on purpose: sequence changes are non-transactional, so a guess cannot '
  'un-count itself by making the request fail - which is precisely how the '
  'per-account throttle in 0012 came to record nothing at all.';

comment on sequence public.invite_guess_window is
  'Start of the current guess-counting window, epoch seconds. Moved with '
  'setval so it survives a rolled-back transaction, same reason as the counter.';

-- ⚠️ A SUPABASE DEFAULT THAT WOULD HAVE HANDED THE LIMITER TO THE ATTACKER.
-- Supabase ships `alter default privileges in schema public grant all on
-- sequences to anon, authenticated, ...` so that serial columns work. That
-- means a sequence created here is born with UPDATE granted to both roles - and
-- UPDATE is precisely the privilege setval() requires. A counter the guesser
-- can reset to zero is not a counter.
-- Caught by supabase/tests/household-boundary.sql, which asserts the property
-- rather than assuming it; the first run said a signed-in client COULD reset it.
-- Not reachable through PostgREST today (setval lives in pg_catalog, which is
-- not an exposed schema, so there is no /rpc/setval), but "the app cannot reach
-- it" is exactly the reasoning that left findings #9 and #10 standing for six
-- weeks. One REVOKE closes it.
-- NOTE FOR FUTURE MIGRATIONS: any NEW sequence in public is born the same way.
revoke all on sequence public.invite_guess_counter from anon, authenticated, public;
revoke all on sequence public.invite_guess_window from anon, authenticated, public;

-- The function below is SECURITY DEFINER and runs as the owner, so it keeps
-- full access to both sequences. Nothing else needs any.

create or replace function public.join_household_with_code(p_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  -- 0033: the global hourly cap. See the note above before changing it.
  c_global_cap constant integer := 30;
  c_window_seconds constant integer := 3600;
  v_invite household_invites%rowtype;
  v_recent_attempts integer;
  v_now_epoch bigint := extract(epoch from now())::bigint;
  v_window_start bigint;
  v_guesses bigint;
begin
  -- Serialise the window bookkeeping. Joining is a rare action, so a global
  -- lock costs nothing real, and without it two simultaneous callers can both
  -- decide the window has expired and both reset the counter to 1.
  perform pg_advisory_xact_lock(hashtext('prepeat.invite_guess'));

  select last_value into v_window_start from invite_guess_window;

  if v_now_epoch - v_window_start >= c_window_seconds then
    -- A fresh window opens, and this guess is its first.
    perform setval('invite_guess_window', v_now_epoch);
    perform setval('invite_guess_counter', 1);
    v_guesses := 1;
  else
    v_guesses := nextval('invite_guess_counter');
  end if;

  if v_guesses > c_global_cap then
    -- Same wording as 0012 so every installed build's friendly message matches.
    raise exception 'Too many attempts – please wait a little and try again';
  end if;

  -- The per-account window from 0012, kept but now honestly described. Because
  -- of the rollback above it only ever counts SUCCESSFUL joins, so it caps how
  -- fast one account can join many households and does nothing about guessing.
  -- Harmless and cheap; the sequence pair above is the real limiter. Left in
  -- place rather than removed so a successful-join flood still has a ceiling.
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
  -- never-expiring-code hole.
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
-- prosrc is read for the BODY (the 0030 lesson) – a replaced function body is
-- invisible to an "exists in pg_proc" check, so existence alone could pass
-- against a file whose create-or-replace never ran.
-- ---------------------------------------------------------------------------

select
  exists (
    select 1 from pg_class where relname = 'invite_guess_counter' and relkind = 'S'
  ) as counter_sequence_exists,
  exists (
    select 1 from pg_class where relname = 'invite_guess_window' and relkind = 'S'
  ) as window_sequence_exists,
  (
    select last_value > 0 from invite_guess_window
  ) as window_is_started,
  (
    select prosrc like '%c_global_cap%' and prosrc like '%0033%'
    from pg_proc where proname = 'join_household_with_code'
  ) as redeem_has_global_cap,
  (
    select prosrc not like '%expires_at is null%'
    from pg_proc where proname = 'join_household_with_code'
  ) as redeem_still_rejects_null_expiry,
  -- UPDATE is the privilege setval() needs, so this is the column that proves
  -- a client cannot zero the limiter. Checked for anon as well as authenticated:
  -- the anon key ships inside the app and is not a secret.
  not (
    has_sequence_privilege('authenticated', 'public.invite_guess_counter', 'UPDATE')
    or has_sequence_privilege('anon', 'public.invite_guess_counter', 'UPDATE')
    or has_sequence_privilege('authenticated', 'public.invite_guess_window', 'UPDATE')
    or has_sequence_privilege('anon', 'public.invite_guess_window', 'UPDATE')
  ) as clients_cannot_reset_the_limiter;
