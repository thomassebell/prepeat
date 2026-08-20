#!/bin/zsh
# Fill the App Review demo account's plan for THE CURRENT WEEK.
#
# Usage:
#   ./scripts/seed-demo-week.sh                      # production, this week only
#   ./scripts/seed-demo-week.sh --weeks 6            # this week + 5 ahead
#   ./scripts/seed-demo-week.sh --dev                # the dev database instead
#   ./scripts/seed-demo-week.sh --email someone@x    # a different account
#
# ⚠️ RUN THIS BEFORE EVERY SUBMISSION, AND SEED PAST THE REVIEW QUEUE. The plan
# is keyed by week, so a demo account nobody re-seeds shows the reviewer an EMPTY
# PLAN - the app looking broken at exactly the moment it is being judged.
#
# ⚠️ SEEDING ONLY THE CURRENT WEEK IS NOT ENOUGH, and this is the part that is
# easy to get wrong. **The reviewer opens the app WHENEVER THE QUEUE REACHES
# THEM, not when you submit.** The v1.0 review took THIRTEEN DAYS, so a version
# submitted on a Wednesday is most likely opened two weeks later, in a week that
# did not exist when it was seeded. Seed enough weeks to cover the queue plus
# slack - `--weeks 6` is roughly six weeks of cover and costs nothing.
#
# WHY IT EXISTS AS A COMMITTED SCRIPT (2026-08-20). The procedure used to say
# "re-run scratchpad/gen-demo.ts". That file lived in a scratchpad, was never in
# git, and by the time it was needed it was gone - so the written step could not
# be taken by anyone. Found the day after 1.1.0 was submitted, with the demo
# plan empty since the week of 2026-08-03. A procedure whose tool is untracked
# is a procedure that expires quietly, which is the same lesson as the git hooks
# and the backup job: the thing that runs must be the thing that is committed.
#
# ⚠️ IDEMPOTENT, AND IT REFUSES RATHER THAN DUPLICATES. If the current week
# already has meals it changes nothing and says so. To reseed a week
# deliberately, clear it in the app first.
#
# It writes as the DEMO USER, not as postgres: `contribute_entry` stamps
# `auth.uid()` onto the shopping-list lines it creates, so seeding without the
# claim would attribute the whole list to nobody.

set -e
cd "$(dirname "$0")/.."

PSQL=/opt/homebrew/opt/libpq/bin/psql
EMAIL="appreview@sebell.dk"
WEEKS=1
ENV_FILE="$HOME/.prepeat-backup.env"
ENV_VAR="SUPABASE_DB_URL"
WHICH="PRODUCTION"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dev)   ENV_FILE="$HOME/.prepeat-dev.env"; ENV_VAR="SUPABASE_DEV_DB_URL"; WHICH="dev"; shift ;;
    --email) EMAIL="$2"; shift 2 ;;
    --weeks) WEEKS="$2"; shift 2 ;;
    *) echo "unknown argument: $1"; exit 1 ;;
  esac
done

if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: $ENV_FILE not found."
  exit 1
fi
set -a; source "$ENV_FILE"; set +a
DB_URL="${(P)ENV_VAR}"
if [[ -z "$DB_URL" ]]; then
  echo "ERROR: $ENV_VAR is not set in $ENV_FILE."
  exit 1
fi

echo "==> Seeding $EMAIL on $WHICH for $WEEKS week(s) from this one"

"$PSQL" "$DB_URL" -q -v ON_ERROR_STOP=1 -v email="$EMAIL" -v weeks="$WEEKS" <<'SQL'
-- ⚠️ psql's :'email' does NOT interpolate inside a dollar-quoted block, so the
-- value is handed to Postgres as a setting the DO block can read instead.
-- Output silenced: this is plumbing, not a result.
\o /dev/null
select set_config('myvars.email', :'email', false);
select set_config('myvars.weeks', :'weeks', false);
\o

do $seed$
declare
  v_email    text := current_setting('myvars.email', true);
  v_weeks    integer := greatest(1, coalesce(current_setting('myvars.weeks', true)::integer, 1));
  v_offset   integer;
  v_user     uuid;
  v_household uuid;
  -- Monday of the week being seeded; starts at the current one.
  v_week     date;
  v_monday   constant date := date_trunc('week', now())::date;
  v_plan     uuid;
  v_entry    uuid;
  v_recipe   record;
  v_day      integer := 0;
  v_existing integer;
  v_recipes  integer;
begin
  select id into v_user from auth.users where email = v_email;
  if not found then
    raise exception 'No account for %', v_email;
  end if;

  select household_id into v_household
  from public.household_members where user_id = v_user
  order by joined_at limit 1;
  if v_household is null then
    raise exception 'Account % is in no household', v_email;
  end if;

  -- ⚠️ Become the demo user for the rest of this block. `contribute_entry`
  -- stamps auth.uid() onto the shopping-list lines it creates; without this the
  -- reviewer's list would be owned by nobody.
  perform set_config(
    'request.jwt.claims',
    json_build_object('sub', v_user::text, 'role', 'authenticated')::text,
    true);

  select count(*) into v_recipes
  from public.recipes where household_id = v_household and deleted_at is null;
  if v_recipes = 0 then
    raise exception 'Account % has no recipes to plan', v_email;
  end if;

  -- One pass per week. Each is independent: an already-populated week is
  -- skipped, so this can be re-run to top up without disturbing what is there.
  for v_offset in 0 .. v_weeks - 1 loop
    v_week := v_monday + (v_offset * 7);
    v_day := 0;

    select id into v_plan from public.meal_plans
    where household_id = v_household and week_start_date = v_week and deleted_at is null;
    if not found then
      insert into public.meal_plans (household_id, week_start_date, created_by_user_id)
      values (v_household, v_week, v_user)
      returning id into v_plan;
    end if;

    select count(*) into v_existing
    from public.meal_plan_entries where meal_plan_id = v_plan and deleted_at is null;
    if v_existing > 0 then
      raise notice 'week %: already has % meal(s), left alone', v_week, v_existing;
      continue;
    end if;

    -- One meal per day, CYCLING the household's own recipes so a week looks
    -- like a real one rather than the same dish seven times, and rotating by
    -- the week offset so consecutive weeks do not read as copies to a reviewer
    -- who swipes forward.
    --
    -- ⚠️ NOT `offset n limit 7`, WHICH TRUNCATES INSTEAD OF CYCLING. That was
    -- the first attempt and it silently shortened every later week - on a
    -- 4-recipe account it produced 4, 3, 2 then 1 meal. It degrades slowly
    -- enough on a big cookbook to look like it works. The modulo join below
    -- always yields exactly seven days whatever the cookbook's size.
    for v_recipe in
      with r as (
        select id, servings, title,
               row_number() over (order by created_at) - 1 as rn,
               count(*) over () as total
        from public.recipes
        where household_id = v_household and deleted_at is null
      )
      select r.id, r.servings, r.title, d.day_offset
      from generate_series(0, 6) as d(day_offset)
      join r on r.rn = ((d.day_offset + v_offset) % r.total)
      order by d.day_offset
    loop
      insert into public.meal_plan_entries
        (meal_plan_id, date, recipe_id, servings, recipe_servings)
      values
        (v_plan, v_week + v_recipe.day_offset, v_recipe.id,
         v_recipe.servings, v_recipe.servings)
      returning id into v_entry;

      -- The same snapshot the app takes (meal-plan.tsx snapshotEntryIngredients):
      -- ingredients are copied onto the entry, never read live from the recipe,
      -- and SECTION HEADINGS ARE DROPPED - they are recipe furniture, not
      -- shopping-list items.
      insert into public.meal_plan_entry_ingredients
        (entry_id, name, quantity, unit, sort_order)
      select v_entry, ri.name, ri.quantity, ri.unit, ri.sort_order
      from public.recipe_ingredients ri
      where ri.recipe_id = v_recipe.id and not ri.is_section;

      -- Planning a week IS asking for its list (decision #8), so every meal
      -- flows onto the shopping list exactly as it would from the app.
      perform public.contribute_entry(v_entry);

      v_day := v_day + 1;
    end loop;

    raise notice 'week %: seeded % meal(s)', v_week, v_day;
  end loop;

end
$seed$;
SQL

echo "==> Done. What the reviewer will see:"
"$PSQL" "$DB_URL" -q -v email="$EMAIL" <<'SQL'
select mp.week_start_date,
       count(e.id) filter (where e.deleted_at is null) as meals
from public.meal_plans mp
left join public.meal_plan_entries e on e.meal_plan_id = mp.id
where mp.household_id in (
  select hm.household_id from public.household_members hm
  join auth.users u on u.id = hm.user_id
  where u.email = :'email')
group by mp.week_start_date
order by mp.week_start_date desc
limit 10;
SQL
