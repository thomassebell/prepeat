# Share a recipe – spec

Status: **NOT BUILT, BUT NO LONGER BLOCKED. All three decisions locked by Thomas
on 2026-08-17** – teaser, never publish an imported photo, "Save to my recipes"
on an explicit tap. Written the same day as the "do before code" step the
backlog item asks for.

**A design now exists** – [sketches/share-page-design.html](sketches/share-page-design.html),
Claude's, reviewed by Thomas on 2026-08-17 across two rounds. It is not a Figma
frame and does not pretend to be one; what it settles is recorded in the
decisions below, and what it invented is listed on the page itself.

**What still waits on someone:** nothing blocking. The copyright question is
deliberately off the critical path and the build order below can start.

The backlog item is the source of the case and the history; this doc is what
design and build follow so none of it is re-litigated. Two claims in that item
are **out of date** and are corrected here: prepeat.app is not a parked domain
and this is not the project's first web deployment (see *Hosting*), and the
import photo path has moved to [new.tsx:169](../src/app/recipes/new.tsx:169)
and [new.tsx:204](../src/app/recipes/new.tsx:204).

## Goal

Let someone send a recipe to a person who does not have Prep+Eat, in a way that
makes installing it the natural next step.

Thomas's case, and the reason this is first in v1.1: *"without 'mouth to mouth'
sharing, this app will not be a success. And having a recipe as a carrier will
be key."* This is a growth mechanic wearing a convenience feature's clothes. It
should be judged on installs, not on how nice the page looks.

## The shape (settled)

**A shared recipe is a link to a page we host**, `prepeat.app/r/<token>` or a
subdomain of it. This is not a choice between "deep link" and "web page": an iOS
universal link falls back to loading the URL in a browser when the app is not
installed, so the page has to exist either way. Someone who has the app gets it
opened there instead.

## THE THREE DECISIONS – ALL LOCKED 2026-08-17

### ✅ 1. How much a stranger sees – LOCKED: THE TEASER (Thomas, 2026-08-17)

A stranger sees the **photo** (subject to decision 2), the **title** and the
**times**, and then an invitation to install. **No ingredients and no method.**
Wanting the recipe and installing the app are the same act.

Why, kept so it is not reopened:

- **Conversion is the point.** This is a growth mechanic, not a convenience. A
  full page gives people what they came for, so almost none of them install.
- **It is a dial, not a door.** Opening the teaser up later, if installs
  disappoint, is easy. Clawing a public page back behind a wall is not – it
  reads as taking something away, and every link already sent changes meaning.
- **It publishes almost nothing copyrightable**, which takes the unanswered
  legal question off the critical path entirely (see *Copyright*).

The known cost, accepted: a teaser travels less far than a full page, because
people forward what was useful to them and stop forwarding what annoyed a
friend. It leans on the sender's relationship with the recipient rather than on
our generosity.

⚠️ **This makes the page's TONE load-bearing, and it is not designed yet.** A
wall that reads as a gift – *"Pia thinks you'd like this"* – converts very
differently from one that reads as a paywall, with identical information on it.
That is a design job, not a build detail.

### ✅ 2. Imported content – LOCKED: NEITHER PHOTO NOR TEXT IS PUBLISHED (Thomas, 2026-08-17)

**A share page carries nothing that came from another site.** Not the photo, not
the description.

Widened from "photos" during the design round. The description was briefly added
to the page, and it is scraped verbatim on an imported recipe – JSON-LD, or the
source's own `<meta name="description">`
([recipe-import.ts:362](../src/lib/recipe-import.ts:362)). Descriptive prose is
more clearly protected than a photograph, so it belonged in the same rule.
Thomas, closing it: *"don't publish the text or the photo."*

So the two variants of the page are:

| | your own recipe | imported recipe |
|---|---|---|
| photo | yours, shown | dropped – generated card instead |
| title | shown | shown (on the card) |
| description | yours, shown | **dropped** |
| times | shown | shown |
| sender's name | shown | shown |

A title is too short to attract copyright, minutes are facts, and the sender's
name is ours to give. That is the whole published surface.

**🎉 THIS NEEDS NO NEW COLUMN.** An earlier draft of this spec called for a
`photo_source` field set at import. Unnecessary: **`recipes.source_url` has
existed since migration 0006** and already answers the question – set means
imported, null means typed by hand. One item drops off the build order.

*Known edge, deliberately unsolved:* import a recipe and then replace the photo
with your own, and `source_url` is still set, so your own photo is suppressed.
That errs in the safe direction. Per-field provenance would fix it if it ever
matters.

⚠️ **The cost is real and worth watching.** An imported recipe's page is thin –
a generated card, three times and the ask. Most recipes are probably imported.
If conversion disappoints, this is the first place to look, and per-field
provenance is the first thing to try.

This is the sharp edge of the whole feature. An imported recipe **already
carries a copy of the source site's photograph in our public bucket** –
[new.tsx:169](../src/app/recipes/new.tsx:169) puts the scraped `imageUrl` into
`photoUri` and [new.tsx:204](../src/app/recipes/new.tsx:204) uploads it. That is
invisible while private. On a page with our name on it, it is the single most
complaint-prone thing we could publish, and it makes **Prep+Eat the publisher**.

Today a scraped photo and one you shot with your phone are indistinguishable
uploads in the same bucket. So this needs **photo provenance recorded**: a
`photo_source` column on `recipes`, set at import time. Existing recipes have no
provenance and must be treated as unknown, therefore not published.

The cost is real: most recipes are probably imported, so most share cards would
lose their photo, and the photo is what makes the card worth tapping. The
mitigation is a **generated card** – the recipe title set in Montserrat on a DS
lime background – which is safe, on-brand, and still far better than a grey
generic unfurl.

### ✅ 3. Recipient with the app – LOCKED: "SAVE TO MY RECIPES" (Thomas, 2026-08-17)

The link opens the recipe in the app with a **Save** action that copies it into
the recipient's kitchen, theirs to edit. It matches copy-on-leave, and it is the
conversion moment: a stranger becomes someone with a recipe in their cookbook.

**Saving is an explicit tap, not automatic.** Copying on open would add things
to someone's cookbook without asking, and a curious or mis-tapped open would
leave clutter they never chose.

Sub-question, not blocking: does the copy record where it came from (a
`shared_from_recipe_id`, mirroring the existing `forked_from_recipe_id`)?

## Data model: publish a snapshot, not a query

**This is the most important decision in the document and it is not open.**

`recipes` is locked to household members through `is_household_member()`
([0006_recipes.sql:80](../supabase/migrations/0006_recipes.sql)). There is no
anonymous read path, and **none should be added.**

The tempting design is an RLS policy letting anyone read a recipe if they
present a valid token. Do not do this. It puts every household's recipes one
predicate bug away from the open internet, on the same table that serves the
whole app.

Instead, sharing **writes a new row** into `recipe_shares` containing only the
fields intended to be public. The public page reads that table and nothing else.

Four things follow for free:

- **Blast radius.** A mistake in a policy on `recipe_shares` exposes data that
  was deliberately published. A mistake on `recipes` exposes everything.
- **Snapshot, not live.** Editing a recipe can never retroactively change, or
  leak into, a link sent last month. This is the same principle the meal plan
  already uses for ingredients (foundation.md).
- **Revocation** is a column, not a policy change.
- **The page cannot over-fetch**, because the extra data is not in the table.

Sketch, to be firmed up at build time:

```
recipe_shares
  token         text primary key      -- URL-safe, unguessable, not the recipe id
  recipe_id     uuid references recipes (id) on delete cascade
  household_id  uuid not null         -- who may revoke
  created_by    uuid not null
  created_at    timestamptz
  revoked_at    timestamptz           -- null = live
  snapshot      jsonb not null        -- title, times, servings, photo url or null
```

⚠️ **RLS, corrected while building it.** This section originally read "anon may
`select` where `revoked_at is null`". **That is a leak, and it is the most
dangerous sentence this doc ever contained.** The anon key ships inside the app
and inside the web page, so a select policy of any kind lets anyone list every
share in the database. What 0034 actually does:

- Household members may `select` their own household's rows (so a "shared
  recipes" screen can exist later). No insert or update policy at all – writes go
  through functions, so nothing can hand-assemble a snapshot.
- **anon gets no policy and no table privileges.** `revoke all on table
  public.recipe_shares from anon` as well, because a hosted project grants anon
  by default at table creation.
- `public.share_by_token(token)` is `security definer` and the only thing anon
  may execute. It takes the token as an argument, so there is nothing to
  enumerate, and it returns at most one row.

`snapshot` never contains ingredients or steps.

## Link previews: why this needs server rendering

**The preview card is the product.** A link pasted into iMessage or WhatsApp is
judged in the second before anyone taps it. "Pia sent you a link" with a dish
photo and a title gets tapped; a grey generic card does not.

Unfurl bots **do not run JavaScript**. They read server-rendered Open Graph
tags. So a page that fetches the recipe client-side unfurls as a generic
"Prep+Eat" card with no recipe name and no photo – functional, and useless for
the one job this feature exists to do.

This, not the page itself, is the genuinely new engineering surface.

## Hosting

`prepeat-web` is live on GitHub Pages and serves `index.html`, `privacy.html`
and `support.html`. It is deliberately static: *"no build step, no framework, no
JavaScript."* So the domain, DNS, HTTPS and DS-matched styling already exist –
but it cannot server-render, and adding a build step to it is a change to a repo
whose whole point is that it has none.

⚠️ **`privacy.html` and `support.html` are Apple's required URLs for the live
App Store listing.** Re-pointing prepeat.app's hosting to get server rendering
puts a URL Apple mandates inside the blast radius of a deploy.

**So: put share pages on their own subdomain**, server-rendered (Vercel or
equivalent), and leave `prepeat-web` untouched on GitHub Pages. Universal links
work from a subdomain as long as the AASA file is served from the host the link
actually uses. This isolates the risk completely and keeps two very different
kinds of site from sharing a deploy.

## Universal links

`app.json` has no `associatedDomains` today (scheme `prepeat`, bundle
`app.prepeat`). Needed:

- `associatedDomains` in `app.json`, which requires the entitlement on the App
  ID – EAS handles this through credentials
- `apple-app-site-association` served from the share host, no extension, correct
  content type
- **A real build to verify.** Universal links cannot be trusted from a
  simulator, and iOS caches the AASA aggressively, so budget a build and a
  device round for this alone.

## Copyright: what the teaser sidesteps, and what it does not

The question in the backlog – *is publishing an imported recipe lawful* – is
**still unanswered by anyone qualified**, and this doc does not answer it.

What it does is make the answer non-blocking. Ingredient lists are facts and not
copyrightable; bare procedural steps largely the same. What is protected is
headnotes, descriptive method prose, and above all photographs. A teaser
publishes a **title, times, and a photo we know the user took** – so it carries
essentially none of the protected material, and decision 2 removes the photo
risk explicitly.

Still worth putting to the attorney alongside the trademark clearance, because
it becomes blocking the moment anyone wants the full-recipe version.

## Privacy policy

A share page makes household content readable outside the household for the
first time. The v1.0 privacy policy was written when that was impossible, so it
needs updating **before this ships**, not after.

## Build order

1. This doc, agreed. ✅
2. ✅ **DONE 2026-08-17 – migration 0034, live on dev AND production.** Additive
   only, so build 12 cannot be affected: nothing references it yet.
   Backup taken first, `--dry-run` read against production (listed exactly one
   migration, so the ledger is intact), all 34 replayed locally, `backup:verify`
   after – 8642 rows restored exactly. Behavioural test:
   `supabase/tests/recipe-shares.sql`, 29 checks.
   **Two things the migration decides that this spec had left to the client, and
   should not have:**
   - **The snapshot is built by the DATABASE.** `create_recipe_share(recipe_id)`
     reads the recipe and applies the imported-content rule itself. Had the app
     assembled it, the rule would live in a build – and builds linger on phones
     for months, so it would keep leaking from every old version ever shipped.
   - **⚠️ ANON CANNOT SELECT THE TABLE AT ALL.** The policy sketched below in an
     earlier draft (`for select to anon using (revoked_at is null)`) is a LEAK:
     the anon key is public, so anyone holding it could list every share in the
     database, title, photo and sender's name included. The token stops being a
     secret the moment rows can be listed. `share_by_token()` takes the token as
     an argument, so there is nothing to enumerate, and it is the only public
     door.
3. ~~`photo_source` on `recipes`~~ – **dropped, not needed.**
   `recipes.source_url` already distinguishes imported from hand-written.
4. ✅ **DONE 2026-08-17 – "Share recipe" in the recipe's ⋯ menu.**
   `createRecipeShare()` in [src/lib/recipe-shares.ts](../src/lib/recipe-shares.ts),
   then the OS share sheet, following the invite sheet's pattern: a failed
   CREATE gets an alert, a "failed" share sheet is almost always the user
   cancelling and gets nothing.
   Verified through PostgREST with a minted JWT, not just in SQL – the app's
   exact call shape returns a token, an imported recipe comes back with
   `description: null` and `image_url: null`, and anon listing the table gets
   `42501 permission denied`.
   ⚠️ **GATED BEHIND `__DEV__`, AND MUST STAY THAT WAY UNTIL STEP 5 SHIPS.** The
   link resolves to nothing until the page exists, and a share that hands
   someone a dead link is worse than no share – testers would send them to
   family. Ungate it in the same change that deploys the page; there is a
   backlog item so it is not forgotten.
5. The share host: one server-rendered route plus OG tags, on the subdomain.
6. Universal links: AASA, `associatedDomains`, and a build to verify on device.
7. "Save to my recipes" for people who have the app.
8. Privacy policy update; `npm run backup:verify` after the schema change.

Roughly a week of working time for the teaser, now slightly under it with step 3
gone. Calendar time will be longer, because step 6 waits on a build and the page
still waits on a design.

## Open sub-questions (not blocking)

- Does a share expire on its own, or only on explicit revocation?
- Where does a household see and revoke its live shares? A recipe knows whether
  it is shared, but there is no screen listing them.
- Does the copy record `shared_from_recipe_id`?
- Overlap: "let recipes move between two kitchens you belong to" is this same
  mechanic pointed inward. The backlog suspects they are one feature. They
  share the snapshot-and-copy machinery but not the public page, so build this
  one first and reuse the copy step.
