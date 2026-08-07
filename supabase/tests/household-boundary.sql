-- Behavioural test for the household boundary, run as a real RLS-bound client
-- against real SQL. Every check prints PASS or FAIL.
--
-- HOW TO RUN (needs Docker):
--   npm run db:start && npm run db:reset
--   /opt/homebrew/opt/libpq/bin/psql \
--     "postgresql://postgres:postgres@127.0.0.1:54322/postgres" \
--     -q -f supabase/tests/household-boundary.sql 2>&1 | grep -o "PASS.*\|\*\*\* FAIL \*\*\*.*"
--
-- WHY IT EXISTS. Written 2026-08-07 with migration 0032, which drops two RLS
-- policies. A dropped policy reaches every installed build the instant it runs,
-- and the risk is never "did the hole close" - the verifying select shows that
-- - but "did a legitimate path close with it". So most of the checks below
-- assert that something STILL WORKS.
--
-- It is also the first use of the local-Postgres harness the backlog asked for
-- on 2026-08-04. The reconciler script mirrors the SQL; this RUNS it, which is
-- the gap that note named. Extend it rather than starting a new file whenever a
-- migration touches membership, invites or leaving.

\set ON_ERROR_STOP off
\pset pager off

-- Mirror the table grants Supabase gives `authenticated` in a hosted project.
-- Locally the migrations run under a role whose default privileges do not reach
-- it, so without this the test would fail on GRANTS and never exercise a single
-- POLICY - which is the whole point. RLS is untouched by this.
grant usage on schema public to authenticated;
grant all on all tables in schema public to authenticated;

-- Two accounts. Local database only; auth.users is writable as postgres here.
insert into auth.users (id, instance_id, aud, role, email, encrypted_password,
                        email_confirmed_at, created_at, updated_at)
values
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'a@test.local', '', now(), now(), now()),
  ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'b@test.local', '', now(), now(), now())
on conflict (id) do nothing;

create or replace function pg_temp.as_user(p_user uuid) returns void
language plpgsql as $$
begin
  perform set_config('request.jwt.claims',
    json_build_object('sub', p_user::text, 'role', 'authenticated')::text, true);
end; $$;

create or replace function pg_temp.check(p_label text, p_ok boolean) returns void
language plpgsql as $$
begin
  raise notice '%  %', case when p_ok then 'PASS' else '*** FAIL ***' end, p_label;
end; $$;

do $outer$
declare
  a constant uuid := '11111111-1111-1111-1111-111111111111';
  b constant uuid := '22222222-2222-2222-2222-222222222222';
  h_solo uuid;
  h_second uuid;
  v_code text;
  v_expires timestamptz;
  v_deleted integer;
  v_joined uuid;
  v_msg text;
begin
  -- ==== 1. Creator bootstrap still works (the one direct write we kept) ====
  perform set_config('role', 'authenticated', true);
  perform pg_temp.as_user(a);

  insert into households (name, created_by_user_id) values ('Solo Kitchen', a)
  returning id into h_solo;
  insert into household_members (user_id, household_id) values (a, h_solo);
  perform pg_temp.check('creator can create a household and join it',
    exists (select 1 from household_members where user_id = a and household_id = h_solo));

  -- ==== 2. Minting a code through the function still works, with an expiry ====
  declare v_result json;
  begin
    v_result := rotate_invite_code(h_solo);
    v_code := v_result ->> 'code';
    v_expires := (v_result ->> 'expires_at')::timestamptz;
  end;
  perform pg_temp.check('rotate_invite_code mints a live code',  v_code is not null);
  perform pg_temp.check('the code expires in ~14 days',
    v_expires between now() + interval '13 days' and now() + interval '15 days');

  -- ==== 3. HOLE #10: planting an invite directly must be refused ====
  begin
    insert into household_invites (household_id, code, created_by, expires_at)
    values (h_solo, 'PREP-HACK', a, null);
    perform pg_temp.check('raw insert of a never-expiring invite is REFUSED', false);
  exception when insufficient_privilege or check_violation or not_null_violation then
    perform pg_temp.check('raw insert of a never-expiring invite is REFUSED', true);
  end;

  -- ==== 4. HOLE #9: deleting your own membership directly must do nothing ====
  delete from household_members where user_id = a and household_id = h_solo;
  get diagnostics v_deleted = row_count;
  perform pg_temp.check('raw delete of own membership removes NOTHING', v_deleted = 0);
  perform pg_temp.check('...and the membership is still there',
    exists (select 1 from household_members where user_id = a and household_id = h_solo));

  -- ==== 5. leave_household still refuses to strand you ====
  begin
    perform leave_household(h_solo);
    perform pg_temp.check('leave_household refuses your ONLY household', false);
  exception when others then
    get stacked diagnostics v_msg = message_text;
    perform pg_temp.check('leave_household refuses your ONLY household ("' || v_msg || '")', true);
  end;

  -- ==== 6. Redeeming a live code still works (user B joins) ====
  perform pg_temp.as_user(b);
  select join_household_with_code(v_code) into v_joined;
  perform pg_temp.check('a live code still lets someone join', v_joined = h_solo);

  -- ==== 7. An expired code is refused ====
  perform set_config('role', 'postgres', true);
  update household_invites set expires_at = now() - interval '1 minute'
  where household_id = h_solo;
  perform set_config('role', 'authenticated', true);
  perform pg_temp.as_user(b);
  begin
    perform join_household_with_code(v_code);
    perform pg_temp.check('an EXPIRED code is refused', false);
  exception when others then
    perform pg_temp.check('an EXPIRED code is refused', true);
  end;

  -- ==== 8. leave_household works when you have somewhere to stay ====
  -- B now belongs to Solo Kitchen; give B a second household, then leave one.
  insert into households (name, created_by_user_id) values ('B Kitchen', b)
  returning id into h_second;
  insert into household_members (user_id, household_id) values (b, h_second);
  perform leave_household(h_solo);
  perform pg_temp.check('leave_household WORKS when another household remains',
    not exists (select 1 from household_members where user_id = b and household_id = h_solo)
    and exists (select 1 from household_members where user_id = b and household_id = h_second));

  -- Read this one AS A. Reading it as B returns nothing - not because A lost
  -- the row but because B, having just left, can no longer see that household's
  -- members at all. That is household_members_select working exactly as
  -- designed, and it cost one confusing FAIL to notice.
  perform pg_temp.as_user(a);
  perform pg_temp.check('...and A is still a member of their own household',
    exists (select 1 from household_members where user_id = a and household_id = h_solo));

  -- Prove the flip side deliberately, now that we know it is load-bearing.
  perform pg_temp.as_user(b);
  perform pg_temp.check('a departed member can no longer see that household',
    not exists (select 1 from household_members where household_id = h_solo));
end;
$outer$;

-- ===========================================================================
-- The global guess limit (0033).
--
-- READ THIS BEFORE CHANGING ANY OF IT. The reason 0012's throttle recorded
-- nothing for six weeks is that it wrote a row and then RAISED, and a raise
-- undoes the write. So the only check here that really matters is the one
-- asserting the counter SURVIVED a run of failures - a limiter that cannot
-- count a failed guess is not a limiter, however good its arithmetic looks.
--
-- Each guess below runs in its own sub-block whose exception handler rolls it
-- back to a savepoint, which is exactly what PostgREST does to a failed RPC.
-- Sequence movements are non-transactional and survive it; table writes do not.
-- ===========================================================================

do $guess$
declare
  b constant uuid := '22222222-2222-2222-2222-222222222222';
  v_msg text;
  v_invalid integer := 0;
  v_counter_before bigint;
  v_counter_after bigint;
  i integer;
  h uuid;
  v_code text;
  v_joined uuid;
begin
  -- Open a clean window. Done as the OWNER, because a signed-in client must not
  -- be able to touch the limiter - asserted a few lines down rather than just
  -- assumed, since a counter the attacker can reset is no counter at all.
  perform set_config('role', 'postgres', true);
  perform setval('invite_guess_window', extract(epoch from now())::bigint);
  perform setval('invite_guess_counter', 0);
  select last_value into v_counter_before from invite_guess_counter;

  perform set_config('role', 'authenticated', true);
  perform pg_temp.as_user(b);

  begin
    perform setval('invite_guess_counter', 0);
    perform pg_temp.check('a signed-in client CANNOT reset the guess counter', false);
  exception when insufficient_privilege then
    perform pg_temp.check('a signed-in client CANNOT reset the guess counter', true);
  end;

  -- 30 wrong guesses, each rolled back exactly as a failed request would be.
  for i in 1..30 loop
    begin
      perform join_household_with_code('PREP-Z' || lpad(i::text, 3, '0'));
    exception when others then
      get stacked diagnostics v_msg = message_text;
      if v_msg like 'Invalid%' then v_invalid := v_invalid + 1; end if;
    end;
  end loop;
  perform pg_temp.check('30 wrong guesses are answered "invalid", not blocked',
    v_invalid = 30);

  -- THE CHECK THAT MATTERS. 0012's counter would read 0 here.
  perform set_config('role', 'postgres', true);
  select last_value into v_counter_after from invite_guess_counter;
  perform set_config('role', 'authenticated', true);
  perform pg_temp.as_user(b);
  perform pg_temp.check(
    'the counter SURVIVED 30 rolled-back guesses (' || v_counter_after || ' of 30)',
    v_counter_after - v_counter_before >= 30);

  -- The 31st crosses the cap and must be refused before any lookup happens.
  begin
    perform join_household_with_code('PREP-ZZZZ');
    perform pg_temp.check('the 31st guess is REFUSED', false);
  exception when others then
    get stacked diagnostics v_msg = message_text;
    perform pg_temp.check('the 31st guess is refused as "too many", not "invalid"',
      v_msg like 'Too many%');
  end;

  -- Wording matters: every installed build matches on this text to show its
  -- friendly message (src/lib/household.ts:216). A reworded raise would leave
  -- shipped phones showing a raw database error.
  perform pg_temp.check('...and the wording is the one shipped builds match on',
    v_msg like 'Too many attempts%');

  -- A CORRECT code is refused too while the cap is exceeded. This is the
  -- accepted cost, asserted rather than left as a surprise: checking validity
  -- first would spare legitimate joiners and would also defeat the whole
  -- mechanism, since a sweep allowed to look codes up will eventually hit one.
  perform set_config('role', 'postgres', true);
  insert into households (name, created_by_user_id) values ('Cap Kitchen', b)
  returning id into h;
  insert into household_members (user_id, household_id) values (b, h);
  select code into v_code from household_invites where household_id = h;
  perform set_config('role', 'authenticated', true);
  perform pg_temp.as_user(b);

  -- No code exists for that household yet (rotate is the only mint path), so
  -- mint one as the member, then confirm even IT is refused over the cap.
  if v_code is null then
    v_code := rotate_invite_code(h) ->> 'code';
  end if;
  begin
    perform join_household_with_code(v_code);
    perform pg_temp.check('over the cap, even a VALID code is refused', false);
  exception when others then
    get stacked diagnostics v_msg = message_text;
    perform pg_temp.check('over the cap, even a VALID code is refused (accepted cost)',
      v_msg like 'Too many%');
  end;

  -- And the window really does reopen. Age it out rather than waiting an hour.
  perform set_config('role', 'postgres', true);
  perform setval('invite_guess_window',
    extract(epoch from now())::bigint - 3601);
  perform set_config('role', 'authenticated', true);
  perform pg_temp.as_user(b);
  select join_household_with_code(v_code) into v_joined;
  perform pg_temp.check('once the hour passes, a valid code works again',
    v_joined = h);
end;
$guess$;
