-- Behavioural test for recipe sharing (migration 0034), run as real RLS-bound
-- clients against real SQL. Every check prints PASS or FAIL.
--
-- HOW TO RUN (needs Docker):
--   npm run db:start && npm run db:reset
--   /opt/homebrew/opt/libpq/bin/psql \
--     "postgresql://postgres:postgres@127.0.0.1:54322/postgres" \
--     -q -f supabase/tests/recipe-shares.sql 2>&1 | grep -o "PASS.*\|\*\*\* FAIL \*\*\*.*"
--
-- WHY IT EXISTS. 0034 opens the first thing in this project that is readable
-- WITHOUT A LOGIN, and it makes three claims that are only worth as much as
-- their proof:
--
--   1. anon cannot LIST shares, only fetch one by token. The first draft of the
--      spec had a policy that would have let the anon key dump every shared
--      recipe in the database.
--   2. an imported recipe publishes neither its description nor its photo,
--      enforced in the database so that no app build, present or ancient, can
--      bypass it.
--   3. a non-member can neither create nor revoke a share.
--
-- Written alongside household-boundary.sql and in the same style. Extend it
-- whenever a migration touches sharing.

\set ON_ERROR_STOP off
\pset pager off

-- Mirror the table grants Supabase gives `authenticated` in a hosted project;
-- locally the migration role's defaults do not reach it, so without this the
-- test would fail on GRANTS and never exercise a single POLICY.
--
-- ⚠️ DELIBERATELY NOTHING FOR anon HERE. An earlier version of this file granted
-- anon and then re-applied 0034's revoke, which made the enumeration check
-- TAUTOLOGICAL: it passed even with a wide-open `to anon` policy added by hand,
-- because the test's own revoke was doing the blocking. A test that cannot fail
-- proves nothing. Section 4 below now grants anon explicitly, at the point of
-- use, so that the ONLY thing left standing between anon and the table is the
-- absence of a policy - which is the braces to the revoke's belt, and the half
-- that a future careless policy would undo.
grant usage on schema public to authenticated, anon;
grant all on all tables in schema public to authenticated;

-- first_name goes in raw_user_meta_data, not straight into `profiles`: the
-- profile row is created by the on_auth_user_created trigger (0010), and
-- `profiles` has no INSERT policy at all. Writing it by hand fails RLS, and it
-- would also be testing a path the app never takes.
insert into auth.users (id, instance_id, aud, role, email, encrypted_password,
                        email_confirmed_at, created_at, updated_at,
                        raw_user_meta_data)
values
  ('aaaaaaaa-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'pia@test.local', '', now(), now(), now(),
   '{"first_name": "Pia"}'::jsonb),
  ('bbbbbbbb-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'stranger@test.local', '', now(), now(), now(),
   '{"first_name": "Sam"}'::jsonb)
on conflict (id) do nothing;

create or replace function pg_temp.as_user(p_user uuid) returns void
language plpgsql as $$
begin
  perform set_config('role', 'authenticated', true);
  perform set_config('request.jwt.claims',
    json_build_object('sub', p_user::text, 'role', 'authenticated')::text, true);
end; $$;

create or replace function pg_temp.as_anon() returns void
language plpgsql as $$
begin
  perform set_config('request.jwt.claims',
    json_build_object('role', 'anon')::text, true);
  perform set_config('role', 'anon', true);
end; $$;

create or replace function pg_temp.check(p_label text, p_ok boolean) returns void
language plpgsql as $$
begin
  raise notice '%  %', case when p_ok then 'PASS' else '*** FAIL ***' end, p_label;
end; $$;

do $outer$
declare
  pia      constant uuid := 'aaaaaaaa-1111-1111-1111-111111111111';
  stranger constant uuid := 'bbbbbbbb-2222-2222-2222-222222222222';
  h_pia uuid;
  r_own uuid;
  r_imported uuid;
  t_own text;
  t_imported text;
  v_row record;
  v_count integer;
  v_msg text;
  v_snapshot jsonb;
  h_sam uuid;
  saved uuid;
  v_saved recipes%rowtype;
begin
  -- ==== setup: one kitchen, two recipes ====
  perform pg_temp.as_user(pia);

  insert into households (name, created_by_user_id) values ('Pia''s Kitchen', pia)
    returning id into h_pia;
  insert into household_members (household_id, user_id) values (h_pia, pia)
    on conflict do nothing;

  -- Typed by hand: source_url null. Everything on it is hers.
  insert into recipes (household_id, created_by_user_id, title, description,
                       prep_minutes, cook_minutes, image_url, source_url)
  values (h_pia, pia, 'Pia''s Pomodoro', 'My own words about this dish.',
          10, 20, 'https://cdn.example/mine.jpg', null)
    returning id into r_own;

  -- Imported: source_url set. The description and photo are the source site's.
  insert into recipes (household_id, created_by_user_id, title, description,
                       prep_minutes, cook_minutes, image_url, source_url)
  values (h_pia, pia, 'Borrowed Bolognese', 'Scraped prose from someone else.',
          15, 90, 'https://cdn.example/theirs.jpg', 'https://food.example/bolognese')
    returning id into r_imported;

  insert into recipe_ingredients (recipe_id, name, quantity, unit, sort_order, is_section)
  values (r_imported, 'SAUCE', null, null, 0, true),
         (r_imported, 'Tinned tomatoes', 2, 'tins', 1, false);
  insert into recipe_steps (recipe_id, step_number, text)
  values (r_imported, 1, 'Simmer for an hour.');

  -- ==== 1. Creating a share works for a member ====
  t_own := public.create_recipe_share(r_own);
  perform pg_temp.check('member can share their own recipe', t_own is not null);
  perform pg_temp.check('token is 32 chars, no dashes',
    length(t_own) = 32 and position('-' in t_own) = 0);

  t_imported := public.create_recipe_share(r_imported);

  perform pg_temp.check('two shares have different tokens', t_own <> t_imported);

  -- ==== 2. THE RULE: an imported recipe publishes no text and no photo ====
  select snapshot into v_snapshot from recipe_shares where token = t_own;
  perform pg_temp.check('own recipe: description IS published',
    v_snapshot ->> 'description' = 'My own words about this dish.');
  perform pg_temp.check('own recipe: photo IS published',
    v_snapshot ->> 'image_url' = 'https://cdn.example/mine.jpg');

  select snapshot into v_snapshot from recipe_shares where token = t_imported;
  perform pg_temp.check('imported: description is NOT published',
    v_snapshot ->> 'description' is null);
  perform pg_temp.check('imported: photo is NOT published',
    v_snapshot ->> 'image_url' is null);
  perform pg_temp.check('imported: title still published',
    v_snapshot ->> 'title' = 'Borrowed Bolognese');
  perform pg_temp.check('imported: times still published (facts)',
    (v_snapshot ->> 'prep_minutes')::int = 15
    and (v_snapshot ->> 'cook_minutes')::int = 90);
  perform pg_temp.check('sharer first name is snapshotted',
    v_snapshot ->> 'shared_by' = 'Pia');

  -- Nothing may ever reach a snapshot beyond this fixed set of keys.
  perform pg_temp.check('snapshot holds only publishable keys',
    (select count(*) from jsonb_object_keys(v_snapshot) k
      where k not in ('title','description','image_url','prep_minutes',
                      'cook_minutes','shared_by')) = 0);

  -- ==== 3. A non-member can neither share nor revoke ====
  perform pg_temp.as_user(stranger);
  begin
    perform public.create_recipe_share(r_own);
    perform pg_temp.check('non-member CANNOT share someone else''s recipe', false);
  exception when others then
    perform pg_temp.check('non-member CANNOT share someone else''s recipe', true);
  end;

  begin
    perform public.revoke_recipe_share(t_own);
    perform pg_temp.check('non-member CANNOT revoke someone else''s share', false);
  exception when others then
    perform pg_temp.check('non-member CANNOT revoke someone else''s share', true);
  end;

  -- A stranger must not see the row through RLS either.
  select count(*) into v_count from recipe_shares;
  perform pg_temp.check('non-member sees no shares through RLS', v_count = 0);

  -- ==== 4. ⚠️ ANON CANNOT ENUMERATE. The leak the first draft would have had ====
  --
  -- Two independent protections, checked separately, because in production both
  -- are real and either one alone would be enough:
  --
  --   BELT    0034 revokes all table privileges from anon.
  --   BRACES  no RLS policy on the table admits anon.
  --
  -- A hosted project grants anon by default at table creation (Supabase ships
  -- `alter default privileges ... grant all on tables to anon, authenticated`),
  -- so the revoke is what actually removes it there. Locally anon was never
  -- granted, which means the belt cannot be observed to do any work - so the
  -- check below asserts its END STATE, then deliberately puts the grant BACK to
  -- see whether the braces hold on their own.

  perform set_config('role', 'postgres', true);
  select count(*) into v_count
  from information_schema.role_table_grants
  where table_name = 'recipe_shares' and grantee = 'anon';
  perform pg_temp.check('belt: anon holds no table privileges after 0034', v_count = 0);

  select count(*) into v_count
  from pg_policies
  where tablename = 'recipe_shares'
    and ('anon' = any (roles) or 'public' = any (roles) and cmd <> 'SELECT');
  perform pg_temp.check('braces: no policy on recipe_shares names anon',
    (select count(*) from pg_policies
      where tablename = 'recipe_shares' and 'anon' = any (roles)) = 0);

  -- Now simulate a world where the belt was forgotten: grant anon exactly what
  -- a hosted project would have given it, and check the braces alone still hold.
  -- If someone ever adds a `to anon` policy "so the page can read it", THIS is
  -- the check that goes red.
  execute 'grant select on table public.recipe_shares to anon';

  perform pg_temp.as_anon();
  begin
    select count(*) into v_count from recipe_shares;
    perform pg_temp.check('braces hold: anon with SELECT still lists nothing',
      v_count = 0);
  exception when insufficient_privilege then
    perform pg_temp.check('braces hold: anon with SELECT still lists nothing', true);
  end;

  -- ...but anon CAN fetch one by token. That is the whole public surface.
  select * into v_row from public.share_by_token(t_own);
  perform pg_temp.check('anon CAN read a share by token', v_row.status = 'live');
  perform pg_temp.check('anon read returns the sender''s name', v_row.shared_by = 'Pia');
  perform pg_temp.check('anon read returns the title', v_row.title = 'Pia''s Pomodoro');

  select * into v_row from public.share_by_token(t_imported);
  perform pg_temp.check('anon read of imported: no description',
    v_row.description is null);
  perform pg_temp.check('anon read of imported: no photo', v_row.image_url is null);

  -- ==== 5. A wrong token yields NOTHING, not an error and not a hint ====
  select count(*) into v_count
    from public.share_by_token('ffffffffffffffffffffffffffffffff');
  perform pg_temp.check('unknown token returns no rows', v_count = 0);

  -- ==== 6. Revoked is distinguishable from not-found, and keeps the name ====
  perform pg_temp.as_user(pia);
  perform public.revoke_recipe_share(t_own);

  perform pg_temp.as_anon();
  select * into v_row from public.share_by_token(t_own);
  perform pg_temp.check('revoked share reports status revoked', v_row.status = 'revoked');
  perform pg_temp.check('revoked share still names the sender', v_row.shared_by = 'Pia');
  perform pg_temp.check('revoked share hides the title', v_row.title is null);
  perform pg_temp.check('revoked share hides the photo', v_row.image_url is null);

  -- ==== 6b. SAVE TO MY RECIPES (0035) ====
  --
  -- Sam is in a different kitchen and saves Pia's shared recipe into it.
  perform pg_temp.as_user(stranger);
  insert into households (name, created_by_user_id) values ('Sam''s Kitchen', stranger)
    returning id into h_sam;
  insert into household_members (household_id, user_id) values (h_sam, stranger)
    on conflict do nothing;

  saved := public.save_shared_recipe(t_imported, h_sam);
  perform pg_temp.check('a member can save a shared recipe into their kitchen',
    saved is not null);

  select * into v_saved from recipes where id = saved;
  perform pg_temp.check('the copy lands in the SAVER''s kitchen',
    v_saved.household_id = h_sam);
  perform pg_temp.check('the copy is owned by the saver',
    v_saved.created_by_user_id = stranger);
  perform pg_temp.check('the copy links back to the original',
    v_saved.forked_from_recipe_id = r_imported);
  perform pg_temp.check('the copy is NOT inherited as a favourite',
    v_saved.is_favorite = false);

  -- Private copying is not publishing: the copy DOES carry the imported text
  -- and photo, unlike the public page.
  perform pg_temp.check('the copy keeps the description (private copy)',
    v_saved.description = 'Scraped prose from someone else.');
  perform pg_temp.check('the copy keeps the photo (private copy)',
    v_saved.image_url = 'https://cdn.example/theirs.jpg');
  -- ...and provenance follows, so the recipient's OWN share of it stays safe.
  perform pg_temp.check('source_url follows the copy, so re-sharing stays safe',
    v_saved.source_url = 'https://food.example/bolognese');

  select count(*) into v_count from recipe_ingredients where recipe_id = saved;
  perform pg_temp.check('ingredients came across', v_count = 2);
  select count(*) into v_count from recipe_ingredients
    where recipe_id = saved and is_section;
  perform pg_temp.check('the SECTION HEADER stayed a heading (0015 loses this)',
    v_count = 1);
  select count(*) into v_count from recipe_steps where recipe_id = saved;
  perform pg_temp.check('steps came across', v_count = 1);

  -- Saving twice must not duplicate the cookbook.
  perform pg_temp.check('saving the same share twice returns the same copy',
    public.save_shared_recipe(t_imported, h_sam) = saved);

  -- Saving your OWN recipe back into your OWN kitchen returns the original.
  perform pg_temp.as_user(pia);
  perform pg_temp.check('saving into the kitchen it already lives in is a no-op',
    public.save_shared_recipe(t_imported, h_pia) = r_imported);

  -- You cannot save into a kitchen you are not in.
  perform pg_temp.as_user(stranger);
  begin
    perform public.save_shared_recipe(t_imported, h_pia);
    perform pg_temp.check('cannot save into someone else''s kitchen', false);
  exception when others then
    perform pg_temp.check('cannot save into someone else''s kitchen', true);
  end;

  -- ==== 7. Soft-deleting the recipe takes its page down too ====
  perform pg_temp.as_user(pia);
  update recipes set deleted_at = now() where id = r_imported;

  perform pg_temp.as_anon();
  select * into v_row from public.share_by_token(t_imported);
  perform pg_temp.check('deleting the recipe revokes its public page',
    v_row.status = 'revoked');
  perform pg_temp.check('deleted recipe hides the title', v_row.title is null);

  -- ==== 8 & 9. Expiry and Stop sharing (0038) ====
  --
  -- ⚠️ A FRESH SHARE, NOT `t_own` - section 5 revoked that one, and `revoked`
  -- outranks `expired` in share_by_token by design. Reusing it made three of
  -- these checks report on a revoked link while the "expired hides the ..."
  -- checks passed anyway, because a revoked share hides exactly the same
  -- fields. Two of the four looked right for the wrong reason.
  declare
    t_live   text;   -- the one that will be aged into expiry
    t_second text;   -- a second live link on the SAME recipe
    r_other  uuid;   -- a different recipe, to bound the blast radius
    t_other  text;
  begin
    perform pg_temp.as_user(pia);
    t_live := public.create_recipe_share(r_own);

    perform pg_temp.check('a new share expires in about 30 days',
      (select expires_at from recipe_shares where token = t_live)
        between now() + interval '29 days' and now() + interval '31 days');

    -- Reach back in time rather than waiting 30 days. ⚠️ AS `postgres`, NOT as
    -- Pia: `recipe_shares` deliberately has no UPDATE policy (0034 - nothing may
    -- hand-assemble or edit a snapshot), so the same statement run as an
    -- authenticated user updates ZERO rows and raises nothing. The test would
    -- then check a still-live share and pass for the wrong reason.
    perform set_config('role', 'postgres', true);
    update recipe_shares set expires_at = now() - interval '1 minute'
    where token = t_live;

    perform pg_temp.as_anon();
    select * into v_row from public.share_by_token(t_live);
    perform pg_temp.check('a lapsed share reports expired', v_row.status = 'expired');

    -- ⚠️ THE CHECKS THAT ALMOST DID NOT EXIST. The spec only changed the STATUS
    -- branch, which would have left every snapshot field gated on
    -- `revoked_at is null and deleted_at is null` - both true for an expired row.
    -- The page would have looked right and the RPC would still have handed the
    -- recipe to anyone who asked. share_by_token is anon-executable BY DESIGN, so
    -- these are what prove expiry actually stops exposure.
    perform pg_temp.check('expired hides the title', v_row.title is null);
    perform pg_temp.check('expired hides the description', v_row.description is null);
    perform pg_temp.check('expired hides the photo', v_row.image_url is null);
    perform pg_temp.check('expired hides the times',
      v_row.prep_minutes is null and v_row.cook_minutes is null);

    -- Revoked names the sender because that was Pia's decision. Expiry is nobody's
    -- decision, so naming her would imply she did something.
    perform pg_temp.check('expired does NOT name the sender', v_row.shared_by is null);
    -- The contrast, on the same recipe, so the two cannot silently converge.
    select * into v_row from public.share_by_token(t_own);
    perform pg_temp.check('revoked, unlike expired, DOES still name the sender',
      v_row.status = 'revoked' and v_row.shared_by is not null);

    -- ==== Stop sharing: every link for ONE recipe, and only that recipe ====
    perform set_config('role', 'postgres', true);
    update recipe_shares set expires_at = now() + interval '30 days'
    where token = t_live;

    -- Two live links on the same recipe, which is the normal case: each tap of
    -- Share mints a new token so re-sharing cannot break the first link.
    perform pg_temp.as_user(pia);
    t_second := public.create_recipe_share(r_own);

    insert into recipes (household_id, created_by_user_id, title, source_url)
    values (h_pia, pia, 'Untouched Tagine', null)
      returning id into r_other;
    t_other := public.create_recipe_share(r_other);

    -- A stranger cannot turn Pia's links off.
    perform pg_temp.as_user(stranger);
    begin
      perform public.stop_sharing_recipe(r_own);
      perform pg_temp.check('non-member cannot stop sharing', false);
    exception when others then
      perform pg_temp.check('non-member cannot stop sharing', true);
    end;

    -- anon cannot reach the function at all - 0036/0037's lesson applied to the
    -- new function. The is_household_member check inside is the belt; this is
    -- the braces, and it is the half that a careless default privilege undoes.
    perform pg_temp.as_anon();
    perform pg_temp.check('anon cannot execute stop_sharing_recipe',
      not has_function_privilege('anon', 'public.stop_sharing_recipe(uuid)', 'execute'));

    perform pg_temp.as_user(pia);
    perform public.stop_sharing_recipe(r_own);

    perform pg_temp.as_anon();
    select * into v_row from public.share_by_token(t_live);
    perform pg_temp.check('stop sharing kills the first link', v_row.status = 'revoked');
    select * into v_row from public.share_by_token(t_second);
    perform pg_temp.check('stop sharing kills the second link too', v_row.status = 'revoked');

    -- The blast radius is one recipe. This is the check that would catch a
    -- household-wide or account-wide mistake in the update's where clause.
    select * into v_row from public.share_by_token(t_other);
    perform pg_temp.check('another recipe''s link is untouched', v_row.status = 'live');

    -- ⚠️ STOP SHARING DOES NOT RECALL WHAT WAS ALREADY SAVED, and this is the
    -- assumption a user could act on wrongly - hence the second sentence in the
    -- dialog. Sam's copy is an independent row in Sam's own kitchen.
    perform pg_temp.as_user(stranger);
    select * into v_saved from recipes where id = saved;
    perform pg_temp.check('a saved copy survives stop sharing',
      v_saved.id is not null and v_saved.deleted_at is null);

    -- A lapsed link is left alone: nobody stopped it, it timed out, and the
    -- page should keep saying so rather than being rewritten into a decision.
    perform set_config('role', 'postgres', true);
    update recipe_shares set revoked_at = null, expires_at = now() - interval '1 day'
    where token = t_live;
    perform pg_temp.as_user(pia);
    perform public.stop_sharing_recipe(r_own);
    perform pg_temp.as_anon();
    select * into v_row from public.share_by_token(t_live);
    perform pg_temp.check('stop sharing leaves an already-lapsed link reading expired',
      v_row.status = 'expired');
  end;

  -- Put back what section 4 borrowed. Without this, a second run in the same
  -- database reports a FALSE failure on the belt check - the leftover grant
  -- looks exactly like a missing revoke in the migration.
  perform set_config('role', 'postgres', true);
  execute 'revoke select on table public.recipe_shares from anon';

exception when others then
  get stacked diagnostics v_msg = message_text;
  raise notice '*** FAIL ***  test aborted: %', v_msg;
end;
$outer$;
