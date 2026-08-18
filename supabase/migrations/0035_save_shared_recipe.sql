-- Prep+Eat – "Save to my recipes" (spec: docs/share-recipe.md, decision 3).
--
-- Turns a share link into a recipe the recipient actually owns: the real
-- recipe, ingredients and steps, copied into THEIR kitchen, theirs to edit.
--
-- ---------------------------------------------------------------------------
-- WHY THIS CANNOT BE DONE FROM THE SNAPSHOT
-- ---------------------------------------------------------------------------
--
-- `recipe_shares.snapshot` holds a title, times and a photo URL and nothing
-- else – no ingredients, no steps. That is the entire point of the teaser, and
-- it is what makes the public page safe. So saving needs a path that reads the
-- REAL recipe, which anon must never have. Hence `security definer`, granted to
-- `authenticated` only: you must be signed in and a member of the kitchen you
-- are saving into.
--
-- ---------------------------------------------------------------------------
-- PRIVATE COPYING IS NOT PUBLISHING
-- ---------------------------------------------------------------------------
--
-- The copy carries the description and the photo even when the recipe was
-- imported, and that is deliberate: it lands in one household's private
-- cookbook, exactly like importing it yourself would. Thomas's rule – "don't
-- publish the text or the photo" – is about the PUBLIC page, and that rule is
-- untouched here.
--
-- `source_url` is copied too, which matters more than it looks: it is what
-- `create_recipe_share` tests to decide whether a photo may be published. So if
-- the recipient later shares their copy, the imported-content rule applies to
-- it just as it did to the original. Provenance survives the copy.

create or replace function public.save_shared_recipe(p_token text, p_household_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_share recipe_shares%rowtype;
  v_source recipes%rowtype;
  v_existing uuid;
  v_new_id uuid;
begin
  if not public.is_household_member(p_household_id) then
    raise exception 'Not your kitchen to save into';
  end if;

  select * into v_share
  from recipe_shares
  where token = p_token and revoked_at is null;

  if not found then
    raise exception 'This recipe is not shared any more';
  end if;

  select * into v_source
  from recipes
  where id = v_share.recipe_id and deleted_at is null;

  -- A deleted recipe reads exactly like a revoked share, on purpose: the same
  -- message, so a save cannot be used to work out which of the two happened.
  if not found then
    raise exception 'This recipe is not shared any more';
  end if;

  -- Saving a recipe that already lives in this kitchen is a no-op that returns
  -- the original. Thomas hit this immediately by sharing his own recipe to
  -- himself; without it, testing the feature quietly duplicates the cookbook.
  if v_source.household_id = p_household_id then
    return v_source.id;
  end if;

  -- Saving the same share twice returns the copy you already have rather than
  -- making another. `forked_from_recipe_id` is the key, so no new column: it
  -- already means "this is a copy of that", set by copy-on-leave since 0015.
  select id into v_existing
  from recipes
  where household_id = p_household_id
    and forked_from_recipe_id = v_source.id
    and deleted_at is null
  limit 1;

  if found then
    return v_existing;
  end if;

  insert into recipes (
    household_id, created_by_user_id, title, description, servings,
    prep_minutes, cook_minutes, image_url, source_url,
    forked_from_recipe_id, is_favorite
  ) values (
    p_household_id,
    auth.uid(),          -- the recipient owns their copy
    v_source.title, v_source.description, v_source.servings,
    v_source.prep_minutes, v_source.cook_minutes,
    -- The photo URL is copied as-is rather than the file being duplicated. The
    -- recipe-photos bucket is public-read (0006), so it displays. ⚠️ The copy
    -- therefore points at the SHARER's folder: if they later delete the photo,
    -- the recipient's copy loses its picture. copy-on-leave (0015) avoids this
    -- by nulling image_url and having the client duplicate the file; doing the
    -- same here is the obvious improvement if it ever bites.
    v_source.image_url,
    v_source.source_url, -- provenance follows the copy - see the header
    v_source.id,
    false                -- someone else's favourite is not yours
  )
  returning id into v_new_id;

  -- ⚠️ `is_section` MUST be copied. It arrived in 0031 and 0015's copy-on-leave
  -- was never updated, so leaving a household turns "DOUGH" from a heading into
  -- a tickable ingredient. Same bug, not repeated here; the old one is in the
  -- backlog.
  insert into recipe_ingredients (recipe_id, name, quantity, unit, note, sort_order, is_section)
  select v_new_id, name, quantity, unit, note, sort_order, is_section
  from recipe_ingredients
  where recipe_id = v_source.id;

  insert into recipe_steps (recipe_id, step_number, text)
  select v_new_id, step_number, text
  from recipe_steps
  where recipe_id = v_source.id;

  return v_new_id;
end;
$$;

grant execute on function public.save_shared_recipe(text, uuid) to authenticated;
