import { IS_DEV_APP } from '@/constants/build-variant';
import { supabase } from './supabase';

/**
 * Sharing a recipe by link. Specs: docs/share-recipe.md (the feature),
 * docs/share-expiry-and-stop-sharing.md (expiry + Stop sharing). Migrations
 * 0034, 0035, 0038.
 *
 * The page these links point at shipped 2026-08-18 on share.prepeat.app, and
 * the `__DEV__` gate on the share action came off with it. The note that used to
 * sit here – "the page does not exist yet" – outlived the thing it warned about.
 */

/**
 * Where a shared recipe lives.
 *
 * A SUBDOMAIN, not prepeat.app itself, and deliberately: prepeat.app is served
 * by `prepeat-web` on GitHub Pages and carries `privacy.html` and
 * `support.html`, which are the URLs App Store Connect requires for the LIVE
 * listing. Share pages need server rendering (unfurl bots do not run
 * JavaScript, and the preview card is the whole point of the feature), so they
 * need a different host – and putting them on their own name keeps a deploy of
 * the new thing away from the two URLs Apple mandates.
 *
 * The `/r/` path is short because it is read aloud and typed by hand more often
 * than a URL usually is.
 */
/**
 * ⚠️ THE DEV APP GETS A DIFFERENT HOST, and it is not cosmetic. The dev build
 * writes shares to the DEV database, so a `share.prepeat.app` link it created
 * would 404 on the web - that host reads production. `share-dev.prepeat.app` is
 * the same deployment reading dev, so a link made on the phone actually works
 * end to end (found 2026-08-18, after two rounds of confusing test results
 * where both the app and the web were answering correctly).
 */
const SHARE_BASE = IS_DEV_APP
  ? 'https://share-dev.prepeat.app/r'
  : 'https://share.prepeat.app/r';

export function shareUrlForToken(token: string): string {
  return `${SHARE_BASE}/${token}`;
}

/**
 * Create a share link for a recipe and return its URL.
 *
 * The client passes an id and NOTHING ELSE. `create_recipe_share` reads the
 * recipe itself and decides what may be published – notably dropping the
 * description and photo of an imported recipe (Thomas, 2026-08-17: *"don't
 * publish the text or the photo"*). That rule lives in the database precisely so
 * that it does not live in a build: app versions linger on phones for months, so
 * a rule enforced here would keep leaking from every old release.
 *
 * Calling this twice makes two live links. Both work until revoked. That is
 * deliberate – re-sharing to a second person should not quietly break the first
 * person's link.
 */
export async function createRecipeShare(recipeId: string): Promise<string> {
  const { data, error } = await supabase.rpc('create_recipe_share', {
    p_recipe_id: recipeId,
  });
  if (error) throw error;
  if (typeof data !== 'string' || data.length === 0) {
    throw new Error('No share token returned');
  }
  return shareUrlForToken(data);
}

/**
 * What a share page shows. Mirrors `share_by_token`'s columns (0034, 0038).
 *
 * ⚠️ `expired` AND `revoked` ARE NOT INTERCHANGEABLE, even though both mean the
 * link is dead. Revoked is a decision someone made, so the page names them -
 * *"Pia isn't sharing this one any more"*. Expiry is nobody's decision, so the
 * sentence has no subject and the database withholds `shared_by` entirely
 * (0038). Naming her for a link that merely lapsed would imply she did
 * something.
 */
export interface SharedRecipe {
  status: 'live' | 'revoked' | 'expired';
  sharedBy: string | null;
  title: string | null;
  description: string | null;
  prepMinutes: number | null;
  cookMinutes: number | null;
  imageUrl: string | null;
}

/**
 * Look up what is behind a share token.
 *
 * `null` means the token is unknown – a mistyped or truncated link. That is
 * deliberately different from a `revoked` status: a revoked share still has a
 * row, so we still know who shared it and can say so by name.
 *
 * ⚠️ THIS RETURNS A TEASER, NOT A RECIPE. The snapshot holds no ingredients and
 * no steps by design, so it is not enough to save a copy from – "Save to my
 * recipes" will need its own function that copies the real recipe server-side.
 */
export async function fetchSharedRecipe(token: string): Promise<SharedRecipe | null> {
  const { data, error } = await supabase.rpc('share_by_token', { p_token: token });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : null;
  if (row == null) return null;
  return {
    // ⚠️ ANY UNKNOWN STATUS FALLS BACK TO `revoked`, and that is the safety net
    // that let 0038 ship before this build did: a status this version has never
    // heard of reads as gone rather than as live. Keep the fallback that way
    // round when the next one is added.
    status:
      row.status === 'live' ? 'live' : row.status === 'expired' ? 'expired' : 'revoked',
    sharedBy: row.shared_by ?? null,
    title: row.title ?? null,
    description: row.description ?? null,
    prepMinutes: row.prep_minutes ?? null,
    cookMinutes: row.cook_minutes ?? null,
    imageUrl: row.image_url ?? null,
  };
}

/**
 * Copy a shared recipe into a household you belong to, and return the id of the
 * recipe you now own.
 *
 * The database does the copying (`save_shared_recipe`, migration 0035), because
 * the share snapshot holds no ingredients and no steps – the teaser is the whole
 * point – so a copy can only be made server-side from the real recipe.
 *
 * Two results are indistinguishable to the caller ON PURPOSE, and both are
 * correct: saving a recipe that already lives in this kitchen returns the
 * original, and saving the same share twice returns the copy you already have.
 * Either way you get an id worth opening, and no duplicate is created.
 */
export async function saveSharedRecipe(
  token: string,
  householdId: string,
): Promise<string> {
  const { data, error } = await supabase.rpc('save_shared_recipe', {
    p_token: token,
    p_household_id: householdId,
  });
  if (error) throw error;
  if (typeof data !== 'string' || data.length === 0) {
    throw new Error('No recipe returned');
  }
  return data;
}

/**
 * Does this recipe have any link that still works?
 *
 * Drives whether "Stop sharing" appears in the ⋯ menu at all – offering it on a
 * recipe that was never shared is an offer to undo something that never
 * happened.
 *
 * Reads the table directly rather than through a function, which is safe here
 * and only here: `recipe_shares` has a member-only SELECT policy (0034), and
 * the tokens never leave this query. `anon` has no policy at all, so the same
 * read from the share page is impossible – that is what makes the token a
 * secret.
 *
 * "Live" is the same three-part test `share_by_token` makes, minus the deleted
 * recipe: you cannot be looking at the menu of a recipe that is deleted.
 */
export async function recipeHasLiveShares(recipeId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('recipe_shares')
    .select('token')
    .eq('recipe_id', recipeId)
    .is('revoked_at', null)
    .gt('expires_at', new Date().toISOString())
    .limit(1);
  if (error) throw error;
  return Array.isArray(data) && data.length > 0;
}

/**
 * Turn off EVERY live link for this recipe.
 *
 * Per recipe, not per person, and that is the only honest option rather than a
 * compromise: the OS share sheet does the sending, so we never learn who a link
 * went to. "Stop sharing with Mum" is unimplementable – we do not know which
 * link went to Mum, or that Mum exists. The alternative, revoking one link, is
 * meaningless to someone looking at a list of indistinguishable 32-character
 * strings.
 *
 * ⚠️ IT DOES NOT RECALL WHAT WAS ALREADY SAVED. Anyone who tapped *Save to my
 * recipes* owns an independent copy in their own kitchen, and it stays theirs.
 * The confirmation dialog says so, because it is the assumption a user could
 * otherwise act on wrongly.
 *
 * A share that had already lapsed is left alone, so its page keeps reading
 * "expired" rather than being rewritten into a decision nobody made.
 */
export async function stopSharingRecipe(recipeId: string): Promise<void> {
  const { error } = await supabase.rpc('stop_sharing_recipe', {
    p_recipe_id: recipeId,
  });
  if (error) throw error;
}
