-- Prep+Eat – share links expire after 30 days, and a sharer can turn them all
-- off by hand. Spec: docs/share-expiry-and-stop-sharing.md.
--
-- WHY BOTH, AND WHY THEY ARE NOT ALTERNATIVES. Writing the privacy policy for
-- sharing exposed a gap: a user had no way to turn a link off without deleting
-- the recipe, so the policy had to say "write to us and we will do it". That is
-- honest but weak as a GDPR withdrawal route.
--
--   30-day expiry   exposure stops being permanent, for everyone, without
--                   anyone having to think about it. Does nothing for "I shared
--                   that by mistake, take it down NOW".
--   Stop sharing    the mistake case, immediately, in the user's hands. Only
--                   reaches updated builds.
--
-- 30 days, ABSOLUTE, FROM CREATION. Not 48 hours (a link sent Friday evening
-- and opened Monday would already be dead, and the person who suffers is the
-- recipient, who did nothing wrong). Not "30 days after last opened", which was
-- proposed and dropped: it needs a database write on every page view, which
-- fights the share host's 60-second edge cache, and "30 days from when you
-- created it" is a sentence the privacy policy can actually say.

-- ---------------------------------------------------------------------------
-- 1. The column
-- ---------------------------------------------------------------------------

alter table public.recipe_shares
  add column expires_at timestamptz;

-- Backfill. Harmless: every share that exists was created within the last two
-- days, so this gives all of them a full-length life rather than an ambush.
update public.recipe_shares
set expires_at = created_at + interval '30 days'
where expires_at is null;

-- NOT NULL only after the backfill, so an old row cannot sit there immortal.
-- The lesson from the invite codes (0033, backlog): a nullable expiry with no
-- default is an expiry that some rows quietly do not have.
alter table public.recipe_shares
  alter column expires_at set not null;

-- ---------------------------------------------------------------------------
-- 2. Creating a share – unchanged except for the clock
-- ---------------------------------------------------------------------------
--
-- Replaced whole rather than patched: `create or replace` needs the entire body,
-- and the snapshot rules below are the ones from 0034, unchanged. The only new
-- line is `expires_at`.

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
    token, recipe_id, household_id, created_by_user_id, snapshot, expires_at
  ) values (
    v_token,
    v_recipe.id,
    v_recipe.household_id,
    auth.uid(),
    jsonb_build_object(
      'title', v_recipe.title,
      'prep_minutes', v_recipe.prep_minutes,
      'cook_minutes', v_recipe.cook_minutes,
      -- ⚠️ THE RULE from 0034: both of these are the source site's work on an
      -- imported recipe, so both are dropped and the page falls back to a
      -- generated title card.
      'description', case when v_recipe.source_url is null then v_recipe.description end,
      'image_url',   case when v_recipe.source_url is null then v_recipe.image_url end,
      'shared_by', v_first_name
    ),
    now() + interval '30 days'
  );

  return v_token;
end;
$$;

-- ---------------------------------------------------------------------------
-- 3. Stop sharing – every link for one recipe
-- ---------------------------------------------------------------------------
--
-- PER RECIPE, NOT PER PERSON, and that is not a compromise. Each tap of Share
-- mints a new token, deliberately, so re-sharing does not break the first
-- person's link – so one recipe can have many live links. And WE NEVER LEARN
-- WHO A LINK WAS SENT TO: the OS share sheet does the sending, the app only
-- produces a URL. "Stop sharing with Mum" is therefore unimplementable – we do
-- not know which link went to Mum, or that Mum exists. That leaves revoking per
-- LINK (meaningless to a user: they are indistinguishable 32-character strings)
-- or per RECIPE, which is also how anyone would think about it.
--
-- `revoke_recipe_share(text)` already exists and stays: it takes a single token,
-- which is the right shape for a future "manage my links" screen. The app does
-- not hold the tokens, so it cannot use it, which is why this exists.
--
-- ⚠️ ONLY LIVE SHARES. A share that has already lapsed keeps `expires_at` in the
-- past and no `revoked_at`, so it keeps reading as `expired` rather than being
-- rewritten into a decision the user did not make. Nobody stopped it; it timed
-- out, and the page says so.

create or replace function public.stop_sharing_recipe(p_recipe_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_household_id uuid;
begin
  -- Read the household from the RECIPE, not from the shares: a recipe with no
  -- shares at all must still be authorised the same way, so that this cannot be
  -- used to probe whether a recipe has ever been shared.
  select household_id into v_household_id
  from recipes
  where id = p_recipe_id;

  if not found then
    -- Silent, like revoke_recipe_share on an unknown token: a raised exception
    -- here would answer "does this recipe id exist" for anyone who asked.
    return;
  end if;

  if not public.is_household_member(v_household_id) then
    raise exception 'Not your recipe to stop sharing';
  end if;

  update recipe_shares
  set revoked_at = now()
  where recipe_id = p_recipe_id
    and revoked_at is null
    and expires_at > now();
end;
$$;

-- ---------------------------------------------------------------------------
-- 4. Reading a share – now four outcomes, and the snapshot is gated ONCE
-- ---------------------------------------------------------------------------
--
--   no rows            the token is wrong. The page stays generic – we know
--                      nothing, not even who sent it.
--   status 'revoked'   someone turned it off, or deleted the recipe. The row
--                      survives, so the page can still say "Pia isn't sharing
--                      this one any more".
--   status 'expired'   it lapsed. The page must NOT name the sender: revoked is
--                      Pia's decision, expiry is nobody's, and naming her would
--                      imply she did something.
--   status 'live'      the snapshot.
--
-- ⚠️ THE SNAPSHOT IS GATED ON `v_live`, NOT ON `revoked_at is null`. 0034 wrote
-- that test out six times, once per field, and the spec for this migration only
-- changed the STATUS branch. That combination would have reported `expired`
-- while still returning the title, description, photo and times – because an
-- expired row has no `revoked_at` and no `deleted_at`. The web page and the app
-- both hide anything that is not `live`, so nothing would have LOOKED wrong,
-- but `share_by_token` is executable by `anon` by design, so an expired token
-- would still have handed over the snapshot to anyone who called the RPC
-- directly. Expiry's only job is to stop exposure. Written as one lateral join
-- so the test exists once and cannot drift between fields again.

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
    v.status,
    -- Named on revoked and live, withheld on expired: see above.
    case when v.status <> 'expired' then s.snapshot ->> 'shared_by' end as shared_by,
    case when v.status = 'live' then s.snapshot ->> 'title' end as title,
    case when v.status = 'live' then s.snapshot ->> 'description' end as description,
    case when v.status = 'live' then (s.snapshot ->> 'prep_minutes')::integer end as prep_minutes,
    case when v.status = 'live' then (s.snapshot ->> 'cook_minutes')::integer end as cook_minutes,
    case when v.status = 'live' then s.snapshot ->> 'image_url' end as image_url
  from recipe_shares s
  join recipes r on r.id = s.recipe_id
  cross join lateral (
    select case
      -- Ordered so a deliberate act outranks a lapse: someone who revoked a
      -- link that had also expired gets the sentence they chose.
      when s.revoked_at is not null then 'revoked'
      when r.deleted_at is not null then 'revoked'
      when s.expires_at <= now()    then 'expired'
      else 'live'
    end
  ) v (status)
  where s.token = p_token;
$$;

-- ---------------------------------------------------------------------------
-- 5. Grants
-- ---------------------------------------------------------------------------
--
-- ⚠️ A NEW FUNCTION IS BORN ANON-EXECUTABLE ON THE HOSTED PROJECTS, TWICE OVER.
-- Postgres grants EXECUTE to `public` on every new function (0036), and Supabase
-- ships `alter default privileges ... grant all on functions to anon,
-- authenticated, service_role`, which is a grant made DIRECTLY to anon that
-- revoking `public` leaves standing (0037). Both have to go, by name. This is
-- the fourth time in this project – tables in 0034, sequences in 0033,
-- functions in 0036/0037 – so it is written out rather than assumed.
--
-- `create or replace` on the three existing functions does NOT reset their ACL,
-- so 0036/0037 still hold for them. This only has to cover the new one.

revoke execute on function public.stop_sharing_recipe(uuid) from public;
revoke execute on function public.stop_sharing_recipe(uuid) from anon;
grant execute on function public.stop_sharing_recipe(uuid) to authenticated;

-- Verifying SELECT (the lesson from 0008, and from 0036's own cause): expect
-- anon false on everything except share_by_token, which is the public door, and
-- authenticated true on all five.
select
  p.proname,
  has_function_privilege('anon', p.oid, 'execute') as anon,
  has_function_privilege('authenticated', p.oid, 'execute') as authenticated
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in ('create_recipe_share', 'revoke_recipe_share',
                    'stop_sharing_recipe', 'save_shared_recipe', 'share_by_token')
order by p.proname;
