import { supabase } from './supabase';

/**
 * Sharing a recipe by link. Spec: docs/share-recipe.md, migration 0034.
 *
 * ⚠️ THE PAGE THESE LINKS POINT AT DOES NOT EXIST YET. Step 5 of the spec's
 * build order (a server-rendered route with OG tags, on its own subdomain) is
 * still to come, so a link created today resolves to nothing. That is why the
 * share action is gated behind `__DEV__` in the recipe screen – see the note
 * there – and it must be ungated in the same change that deploys the page.
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
const SHARE_BASE = 'https://share.prepeat.app/r';

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

/** What a share page shows. Mirrors `share_by_token`'s columns (migration 0034). */
export interface SharedRecipe {
  status: 'live' | 'revoked';
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
    status: row.status === 'live' ? 'live' : 'revoked',
    sharedBy: row.shared_by ?? null,
    title: row.title ?? null,
    description: row.description ?? null,
    prepMinutes: row.prep_minutes ?? null,
    cookMinutes: row.cook_minutes ?? null,
    imageUrl: row.image_url ?? null,
  };
}
