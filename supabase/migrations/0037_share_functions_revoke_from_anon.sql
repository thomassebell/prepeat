-- Prep+Eat – finish what 0036 started: revoke from `anon` BY NAME.
--
-- ⚠️ 0036 revoked EXECUTE from `public` and looked right locally, where anon
-- held nothing else. On the hosted projects it changed nothing visible, because
-- Supabase ships
--   `alter default privileges in schema public grant all on functions to anon,
--    authenticated, service_role`
-- so a new function is born with a grant made DIRECTLY to anon. Revoking the
-- PUBLIC grant leaves that one standing. The live ACL said so plainly:
--
--   save_shared_recipe -> postgres=X/postgres , anon=X/postgres , ...
--
-- THE SAME TRAP AS TABLES IN 0034, one object type along, and the same lesson:
-- a local `db:reset` cannot prove a GRANT change, because local default
-- privileges are not the hosted ones. Check the live ACL after pushing.
--
-- (0033 hit this too, for sequences: "a sequence created here is born with
-- UPDATE granted to both roles". Third time in this project.)
--
-- `share_by_token` keeps its grant: it is the share page's only way in.

revoke execute on function public.create_recipe_share(uuid) from anon;
revoke execute on function public.revoke_recipe_share(text) from anon;
revoke execute on function public.save_shared_recipe(text, uuid) from anon;

-- Verifying SELECT: expect anon false on the three, true on share_by_token,
-- and authenticated true on all four.
select
  p.proname,
  has_function_privilege('anon', p.oid, 'execute') as anon,
  has_function_privilege('authenticated', p.oid, 'execute') as authenticated
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in ('create_recipe_share', 'revoke_recipe_share',
                    'save_shared_recipe', 'share_by_token')
order by p.proname;
