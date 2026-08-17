-- Prep+Eat – share a recipe by link (v1.1). Spec: docs/share-recipe.md.
--
-- This is the first thing in the project that is READABLE WITHOUT A LOGIN, so
-- the shape matters more than the size. Three decisions are built into it, and
-- each one is here rather than in the app for a reason.
--
-- ---------------------------------------------------------------------------
-- 1. WE PUBLISH A SNAPSHOT, NOT A QUERY
-- ---------------------------------------------------------------------------
--
-- Nothing public ever reads `recipes`. Sharing copies the handful of publishable
-- fields into `recipe_shares.snapshot`, and the public door reads only that.
--
-- The tempting alternative – an RLS policy on `recipes` allowing a read when a
-- valid token is presented – puts every household's cookbook one predicate bug
-- away from the open internet, on the table that serves the whole app. This way
-- a mistake here exposes only what was deliberately published.
--
-- It also buys snapshot-not-live for free: editing a recipe cannot retroactively
-- change, or leak into, a link sent last month. Same principle the meal plan
-- already uses for ingredients (foundation.md).
--
-- ---------------------------------------------------------------------------
-- 2. ⚠️ ANON CANNOT SELECT FROM THIS TABLE. THE ONLY PUBLIC DOOR IS A FUNCTION.
-- ---------------------------------------------------------------------------
--
-- The obvious policy – `for select to anon using (revoked_at is null)` – is a
-- LEAK, and it was in the first draft of the spec. The anon key is public: it
-- ships inside the app and inside the web page. Anyone holding it could then
-- `select * from recipe_shares` and walk away with every shared recipe's title,
-- photo and sharer's first name. The token stops being a secret the moment the
-- rows can be listed.
--
-- So anon gets NO policy at all, and `share_by_token()` is the only way in. It
-- takes the token as an argument, so there is nothing to enumerate.
--
-- ---------------------------------------------------------------------------
-- 3. ⚠️ THE DATABASE BUILDS THE SNAPSHOT, NOT THE CLIENT
-- ---------------------------------------------------------------------------
--
-- `create_recipe_share()` reads the recipe itself and decides what goes in.
-- The client passes a recipe id and nothing else.
--
-- This is what enforces Thomas's rule of 2026-08-17 – *"don't publish the text
-- or the photo"* for imported recipes. If the app assembled the snapshot, the
-- rule would live in a build, and app builds linger on phones for months: real
-- users are still on build 12, frozen 2026-07-30. A rule enforced client-side is
-- a rule that keeps leaking from every old version ever shipped. Here, an old or
-- hostile client physically cannot publish a description.
--
-- The test for "is this ours to publish" is `recipes.source_url`: set means
-- imported, null means typed by hand. No new column – it has been there since
-- 0006. Known edge, deliberately unsolved: replace an imported recipe's photo
-- with your own and source_url is still set, so your own photo is suppressed.
-- That errs in the safe direction.

create table public.recipe_shares (
  -- 32 hex chars from gen_random_uuid(), which needs no extension (0006 already
  -- relies on it) and avoids the pgcrypto search_path trap that would bite a
  -- `set search_path = public` function calling gen_random_bytes().
  -- ~122 bits: unguessable. Longer in a URL than a hand-rolled short code, and
  -- chosen anyway – shortening it later would break every link already sent.
  token text primary key,
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  -- Denormalised so revocation and listing never have to touch `recipes`.
  household_id uuid not null references public.households (id) on delete cascade,
  created_by_user_id uuid not null references auth.users (id),
  -- Only ever the publishable fields. Never ingredients, never steps, and never
  -- an imported recipe's description or photo. Written by the function below.
  snapshot jsonb not null,
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);

create index recipe_shares_household_id_idx on public.recipe_shares (household_id);
create index recipe_shares_recipe_id_idx on public.recipe_shares (recipe_id);

alter table public.recipe_shares enable row level security;

-- Members may READ their own household's shares, so a "shared recipes" list can
-- exist later. Writes go through the functions below, so there is deliberately
-- no insert or update policy: nothing may hand-assemble a snapshot.
create policy recipe_shares_member_read on public.recipe_shares
  for select using (public.is_household_member(household_id));

-- Belt and braces. Supabase grants table privileges to anon/authenticated by
-- default and relies on RLS to gate them; with no anon policy above, anon is
-- already blocked. Making it explicit means a future policy added carelessly
-- still cannot open the door.
revoke all on table public.recipe_shares from anon;

-- ---------------------------------------------------------------------------
-- Creating a share
-- ---------------------------------------------------------------------------

create or replace function public.create_recipe_share(p_recipe_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_recipe recipes%rowtype;
  v_first_name text;
  v_token text;
begin
  select * into v_recipe
  from recipes
  where id = p_recipe_id
    and deleted_at is null;

  if not found then
    raise exception 'Recipe not found';
  end if;

  if not public.is_household_member(v_recipe.household_id) then
    raise exception 'Not your recipe to share';
  end if;

  select first_name into v_first_name
  from profiles
  where user_id = auth.uid();

  v_token := replace(gen_random_uuid()::text, '-', '');

  insert into recipe_shares (
    token, recipe_id, household_id, created_by_user_id, snapshot
  ) values (
    v_token,
    v_recipe.id,
    v_recipe.household_id,
    auth.uid(),
    jsonb_build_object(
      -- A title is too short to attract copyright, so it travels either way.
      'title', v_recipe.title,
      -- Minutes are facts. Facts are nobody's property.
      'prep_minutes', v_recipe.prep_minutes,
      'cook_minutes', v_recipe.cook_minutes,
      -- ⚠️ THE RULE, and the reason this function exists at all. Both of these
      -- are the source site's work on an imported recipe, so both are dropped
      -- and the page falls back to a generated title card.
      'description', case when v_recipe.source_url is null then v_recipe.description end,
      'image_url',   case when v_recipe.source_url is null then v_recipe.image_url end,
      -- Snapshotted like everything else: if Pia later changes her name, a link
      -- she already sent keeps saying Pia. Consistent, and it avoids a public
      -- page that silently rewrites itself.
      'shared_by', v_first_name
    )
  );

  return v_token;
end;
$$;

grant execute on function public.create_recipe_share(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Revoking a share
-- ---------------------------------------------------------------------------

create or replace function public.revoke_recipe_share(p_token text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_household_id uuid;
begin
  select household_id into v_household_id
  from recipe_shares
  where token = p_token;

  if not found then
    -- Silent on a token that does not exist, so this cannot be used to test
    -- whether one does.
    return;
  end if;

  if not public.is_household_member(v_household_id) then
    raise exception 'Not your share to revoke';
  end if;

  update recipe_shares
  set revoked_at = now()
  where token = p_token
    and revoked_at is null;
end;
$$;

grant execute on function public.revoke_recipe_share(text) to authenticated;

-- ---------------------------------------------------------------------------
-- Reading a share – the only public door
-- ---------------------------------------------------------------------------
--
-- Returns AT MOST ONE ROW, and the three outcomes are deliberately distinct
-- because the page says something different for each:
--
--   no rows            the token is wrong. The page must stay generic – we know
--                      nothing, not even who sent it.
--   status 'revoked'   the row exists, so we still know the sender and the page
--                      can say "Pia isn't sharing this one any more". No recipe
--                      fields come back.
--   status 'live'      the snapshot.
--
-- A SOFT-DELETED RECIPE COUNTS AS REVOKED. Without this, deleting a recipe would
-- leave its public page standing, which is not what anyone deleting a recipe
-- expects. The snapshot is independent of `recipes`, so nothing else would have
-- noticed.

create or replace function public.share_by_token(p_token text)
returns table (
  status text,
  shared_by text,
  title text,
  description text,
  prep_minutes integer,
  cook_minutes integer,
  image_url text
)
language sql
security definer
set search_path = public
stable
as $$
  select
    case
      when s.revoked_at is not null then 'revoked'
      when r.deleted_at is not null then 'revoked'
      else 'live'
    end as status,
    s.snapshot ->> 'shared_by' as shared_by,
    case when s.revoked_at is null and r.deleted_at is null
      then s.snapshot ->> 'title' end as title,
    case when s.revoked_at is null and r.deleted_at is null
      then s.snapshot ->> 'description' end as description,
    case when s.revoked_at is null and r.deleted_at is null
      then (s.snapshot ->> 'prep_minutes')::integer end as prep_minutes,
    case when s.revoked_at is null and r.deleted_at is null
      then (s.snapshot ->> 'cook_minutes')::integer end as cook_minutes,
    case when s.revoked_at is null and r.deleted_at is null
      then s.snapshot ->> 'image_url' end as image_url
  from recipe_shares s
  join recipes r on r.id = s.recipe_id
  where s.token = p_token;
$$;

-- The one thing anon may do. Takes the token as an argument, so there is
-- nothing to list and nothing to enumerate.
grant execute on function public.share_by_token(text) to anon, authenticated;
