-- Prep+Eat – take the sharing functions away from `anon`.
--
-- ⚠️ POSTGRES GRANTS EXECUTE ON EVERY NEW FUNCTION TO `PUBLIC` BY DEFAULT. So
-- `grant execute ... to authenticated` in 0034 and 0035 added nothing that was
-- not already there, and anon could call all three. Found by checking the live
-- grants after pushing 0035 rather than trusting the grant statement:
--
--   create_recipe_share | anon=true
--   revoke_recipe_share | anon=true
--   save_shared_recipe  | anon=true
--
-- Nothing was exploitable: each one calls `is_household_member()`, which is
-- false when `auth.uid()` is null, so an anon caller got an exception instead of
-- a result. But a SECURITY DEFINER function runs as its owner, and leaving three
-- of them reachable by an unauthenticated key is a wider surface than this
-- feature needs. Defence in depth: the check stays AND the door closes.
--
-- `share_by_token` deliberately keeps its PUBLIC grant – it is the share page's
-- only way in, and it takes a token it cannot guess.
--
-- ⚠️ THE SAME IS TRUE OF EVERY OTHER SECURITY DEFINER FUNCTION IN THIS SCHEMA –
-- delete_profile, delete_household, join_household_with_code, leave_household,
-- rotate_invite_code and the rest are all anon-executable today. That is NOT
-- fixed here: `is_household_member` is called from inside RLS policies, so
-- revoking it needs the household-boundary test as a safety net and a change of
-- its own. It is in the backlog, with the one that actually matters called out
-- (an anon caller can reach join_household_with_code and burn the GLOBAL invite
-- guess budget from 0033, which is a denial-of-service on invites rather than a
-- way in).

revoke execute on function public.create_recipe_share(uuid) from public;
revoke execute on function public.revoke_recipe_share(text) from public;
revoke execute on function public.save_shared_recipe(text, uuid) from public;

grant execute on function public.create_recipe_share(uuid) to authenticated;
grant execute on function public.revoke_recipe_share(text) to authenticated;
grant execute on function public.save_shared_recipe(text, uuid) to authenticated;

-- Verifying SELECT (the lesson from 0008, and from this migration's own cause):
-- expect anon false / authenticated true on the three, and anon TRUE on
-- share_by_token, which is the public door.
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
