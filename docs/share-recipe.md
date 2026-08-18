# Share a recipe – spec

Status: **STEPS 1–6 DONE. THE LOOP WORKS END TO END EXCEPT SAVING.** All three
decisions were locked by Thomas on 2026-08-17 – teaser, never publish imported
photo *or* text, "Save to my recipes" on an explicit tap.

Working today, confirmed on the device: migration 0034 is live on dev and
production, the app creates shares, `share.prepeat.app` serves the page, and a
shared link opens the APP on the recipe – cold start and warm, in Danish.

**THE LOOP IS COMPLETE AND CONFIRMED END TO END ON A PHONE** (Thomas,
2026-08-18: *"the whole chain works now"*) – share a recipe, a card appears in
the chat, tapping it opens the app on that recipe, saving copies it into your
kitchen, and back lands on Recipes. The web page serves anyone without the app.

⚠️ **Until 2026-08-18 that chain had never actually been tested end to end**,
because the dev app's links pointed at a host reading production. Every earlier
"it works" and "it doesn't" was partly an artefact of that.

**What remains, and both are decisions rather than work:**
- **Ungate the Share action** (`IS_DEV_APP` in `recipes/[id].tsx`). One check to
  delete; it is what puts sharing in front of TestFlight.
- **The PNG preview card**, parked by Thomas – and the biggest lever on whether
  any of this converts, since 93 of 97 recipes cannot show a photo and therefore
  preview in a chat as a bare text card.
⚠️ **Ungating first means testers judge the placeholder version**, which is also
the version the growth idea would be judged on.

**THOMAS'S FIGMA DESIGN LANDED 2026-08-18**, and it supersedes Claude's
interim sketch for everything it covers. Three sections:

| | node | covers |
|---|---|---|
| Messages | `725:7752` | the chat bubble, own-recipe and imported variants |
| Share site | `726:8992` | own recipe, imported recipe, revoked |
| In-app receive | `725:8341` | accepting, revoked, unknown token |

*(The older interim design, [sketches/share-page-design.html](sketches/share-page-design.html),
was Claude's – reviewed by Thomas across two rounds on 2026-08-17. It stands only
where the Figma set is silent.)*

**Copy corrected in the Figma file itself on 2026-08-18**, at Thomas's
instruction, after a review round before any building: `methode`→`method` (×2),
`Aks`→`Ask` plus a stray space before a manual line break (×2), "Go to Apple
Store…"→"Download Prep+Eat free from the App Store." (the App Store is the
software store; the Apple Store is the retail shop), and `Get Prep+Eat App`→`Get
Prep+Eat` (×3). All six were made through DS button `label` properties or plain
text nodes, so no instance was detached.

**"Cancel" became "No thanks"** (Thomas, 2026-08-18: the secondary action should
let you *opt out of the share*, and "Cancel" reads as abandoning a task rather
than declining a gift). **Declining writes nothing** – the recipe was never
saved, so there is nothing to undo, and it goes exactly where the back arrow
goes. A stronger meaning (mark the link declined so re-tapping does not reopen
it) would be a database change and a new state to design; not chosen.

**Two gaps recorded rather than filled** while implementing the in-app screens:

- **The ⋯ button** (`725:8349`) is drawn on the receive screen with no menu
  behind it, and there is nothing it could do on a recipe you do not own yet.
  **Left out of the build**, with a comment in the code saying so.
- **The frame binds `color/text/light` for the "shared a recipe with you" line,
  and the DS bridge does not export a `text/light`.** `text/subtle` is the same
  value today (`#5F503A`) and is what the code uses – but that is a
  substitution, not a match, and it drifts silently if the two ever diverge.
  Either the frame should bind `text/subtle`, or `text/light` needs adding to
  the DS export list.

**SECOND REVIEW PASS, 2026-08-18 – the design set is now complete on phone AND
desktop.** Thomas added the missing states after the first pass: a 404 ("link
broken") and a 503 screen to the phone site, the whole desktop set, and a
connection-error state to the in-app screens. All five web states and all four
in-app states now exist.

Ten more copy fixes were applied in Figma, all of them the SAME three errors
recurring in the newly added frames (they were drawn from the pre-correction
version): "Go to Apple Store…" ×4, "Get Prep+Eat App" ×3 plus one more, and the
stray space before a manual line break on both 503 screens.

Three rulings from Thomas on the new in-app connection-error frame:
- **"Can't load your recipes" → "Can't open this recipe."** The old title was
  pasted from the Recipes list; this screen never loads your recipes.
- **A "Try again" button was added**, and it is the right call: the other two
  dead ends are permanent, but this one is a transient network failure, and
  without a button the only way out was backing out and re-tapping the link.
- **The three identically named frames were renamed** – "recipe – revoked
  recipe", "recipe – link broken", "recipe – connection error". All three had
  been called "recipe – recipe revokes".

⚠️ **ONE INCONSISTENCY LEFT IN THE FILE, NORMALISED IN CODE AND FLAGGED.** The
connection-error frame insets its text a further 16px and puts 16px under the
icon; the revoked and link-broken frames use the card's own padding and 24px.
Adding the button made it visible, since the button sits at the card's padding
and the text does not line up with it. The code builds all three the way the two
agreeing frames are drawn. **If the odd one out is deliberate, the code is
wrong** – see the note on `Notice` in `shared-recipe.tsx`.

**Also found: `LoadError` hardcodes the English "Try again"** on three other
screens (household lookup, shopping, plan). A `common.tryAgain` key now exists
and the share screen uses it; the shared component was left alone because it is
outside this work.

⚠️ **TWO DEVICE-ONLY BUGS, BOTH FOUND BY THOMAS ON THE PHONE 2026-08-18.**
Neither could have been caught by a typecheck, a lint or a review:

1. **A mistyped or shortened link hit expo-router's "Unmatched Route" screen.**
   `+native-intent`'s `SHARE_PATH` required exactly `[0-9a-f]{32}` – the shape
   `create_recipe_share` mints. It read as sensible validation and it made the
   **"This link doesn't lead anywhere" state unreachable in the case its own
   copy describes**: a cut-short token is by definition not 32 hex characters,
   so it never matched and fell through untouched. Only a *well-formed but
   unknown* token could reach the screen – the rarest version of the problem.
   Fixed by loosening the pattern: deciding whether a token is REAL is
   `share_by_token()`'s job, and this only has to decide whether a URL is ours.
2. **The back arrow was brown.** Built as `icon/default` (#4F4230) because the
   colour was taken from a `get_variable_defs` dump. The frames bind
   `tab-bar/item/icon/active`, which is an **alias** – the dump reported the
   alias's own value while the arrow resolves through it to `icon/brand`
   (#47A518). **The rendered screenshot showed a green arrow the whole time.**
   Read the resolved fill, not the token dump. (A worse second error followed:
   the same bad number was used to "prove" the rest of the app was wrong, which
   it was not – every back arrow in Figma and the app is green.)

⚠️ **The Figma CSS fallbacks were stale again, exactly as CLAUDE.md warns** –
`get_design_context` returned Noto Serif/Noto Sans and `#476b4a` buttons. The
real values from `get_variable_defs` are Montserrat/IBM Plex Sans and `#83E651`
solid fill with a `#4F4230` label. **`ds-theme.cjs` agreed with Figma on every
token checked**, so the bridge is in sync; only that one output lies.

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

*Known edge, RE-EXAMINED AND DELIBERATELY LEFT AS IS (2026-08-18).* The edge is
wider than first written: it is not only "import then replace the photo", it is
**any hand-written recipe that credits a source**. The manual form's "Source
link" field and the importer write the same `source_url`, so citing where an
idea came from suppresses a photo you took yourself. Thomas hit exactly this on
a real TestFlight share.

Measured that day: 91 of 97 live recipes have a source URL and a photo, so all
91 fall back to the generic card; 4 publish a photo.

**Per-field provenance does NOT fix it, which is why the rule stands.** Every
proposed signal - a photo-provenance column, a `created_via` flag, or reading
the photo's URI at save time (`http…` = imported, `file://` = picked) - fails on
one case Thomas named: *"you copied the recipe and copied the photo."* Save a
site's image to the camera roll, pick it, and it is indistinguishable from a
photograph of your own dinner. **A client can know the mechanism but never the
ownership**, so a flag would encode a guess while reading as a fact. The blunt
rule is at least honest about being blunt.

The accepted cost is a conversion cost, and it is not small - see the backlog
entry. If it is ever worth solving, only non-guessing routes qualify: asking for
a photo at share time, or publishing attribution instead of content.

⚠️ **THE COST IS NOT "WORTH WATCHING", IT IS THE NORM. MEASURED 2026-08-17:**

| production, live recipes | count |
|---|---|
| total | 97 |
| imported (`source_url` set) | **91** |
| hand-written | 6 |
| hand-written **with a photo** – the only ones that get a rich card | **4** |

So four recipes in ninety-seven produce the good share. Ninety-three produce a
generated title card, no description, and – until the gap below is closed – a
text-only preview in the chat. For a feature whose entire purpose is
mouth-to-mouth growth, the weak version is not an edge case, it is the product.

**This does not overturn the decision** – the exposure of republishing other
sites' photos and prose is real, and Thomas closed it deliberately. But it moves
one item from "later" to "the main case":

1. ✅ **DONE 2026-08-18 – and it was the difference between working and not.**
   Without `og:image` iMessage builds NO CARD AT ALL: proved on the device by
   sending two links from the same server that differed only in having one. So
   every share page now carries an image – the recipe's own photo when it is
   ours to publish, otherwise one generated at `/og/<token>.png` (`@vercel/og`
   on the edge). Confirmed by Thomas in Messages: *"it works, the card shows
   up."*
   ⚠️ **The card's DESIGN is an interim** – the mocha card from the flow review,
   chosen "till my design lands". Replacing it is a layout change in one file;
   the plumbing stays.

2. **Ask for a photo at share time.** "Add a photo and this looks like yours" –
   turns the constraint into a prompt, and produces content that is
   unambiguously ours to publish. Untested idea, cheap to try.
3. **Per-field provenance**, so replacing an imported recipe's photo with your
   own lets that photo travel. Only helps people who bother.
4. **Attribution instead of content** – "recipe from foodsite.com" – which
   publishes a link rather than someone's work.

**Why this is the sharp edge.** An imported recipe **already carries a copy of
the source site's photograph in our public bucket** –
[new.tsx:169](../src/app/recipes/new.tsx:169) puts the scraped `imageUrl` into
`photoUri` and [new.tsx:204](../src/app/recipes/new.tsx:204) uploads it. Harmless
while private; on a page with our name on it, it is the most complaint-prone
thing we could publish, and it makes **Prep+Eat the publisher**.

*(An earlier draft of this section argued for a `photo_source` column here. It
was written before anyone checked, and it is wrong: `source_url` already answers
the question. Left out rather than left in, so nobody builds it.)*

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

## ⚠️ The share site must be built from DS components

**Thomas, 2026-08-18: "When building web stuff you should always use the DS
components – they are there for that reason."** This overrides the "no build
step" instinct recorded under *Hosting* above, and it changes the shape of
`prepeat-share`.

`prepeat-share` today is hand-written HTML template strings in
`lib/render.mjs`, with no dependencies beyond `@vercel/og`. Every button on it
is a hand-rolled `<a class="btn">`. That has to become `@ds/react`, which ships
exactly what these pages need: `Button`, `Icon`, `Stack`, `Text`.

**What that costs, so nobody is surprised:** React and `react-dom` as
dependencies, `renderToStaticMarkup` in the Vercel function, `@ds/react`'s
`styles.css` inlined into the page, and therefore a build step in a project
that deliberately had none. The server rendering itself is unaffected – it is
already server-rendered, which is the whole reason the project exists.

**One blocker, needing a decision:**

**`@ds/react` is not published.** The DS root `package.json` is `"private": true`
with npm workspaces, neither package has `publishConfig`, CI has no publish step,
and `@ds/react` depends on `"@ds/tokens": "*"`. So `prepeat-share` cannot install
it as things stand. It needs a registry (npm private, or GitHub Packages) or a
git dependency. **This is DS-repo work, not share-site work.**

⚠️ **AND A SECURITY POINT THAT DECIDES PART OF THE ROUTE** (found by the DS
session, 2026-08-18): the dependency is a plain `"*"` wildcard, not
`workspace:*`. Practically the same locally – an outside `npm install` cannot
resolve it either way – but `"*"` would silently reach for the PUBLIC registry,
and **the `@ds` scope on npm is currently unclaimed**. Publishing as-is is a
dependency-confusion swap waiting to happen. Whatever route is picked, that
dependency must be pinned to a real published version.

Figma defines six button states (`enabled, hover, pressed, focused, loading,
disabled`). Whether `@ds/react` implements all six is unverified and worth
checking before the page is built – hover in particular, since desktop needs it
and no hover state is drawn on the share frames.

⚠️ **THE DESIGN SYSTEM IS AT `~/Documents/Sebell Design System/design-system`.**
There is a STALE CLONE at `~/Documents/Claude/Projects/Sebell Design System/` –
a different GitHub account (`sebellDS` vs `thomassebell`), 22 commits, last
touched 2026-04-15, four months behind. Reading it on 2026-08-18 produced two
confident and completely wrong claims: that the DS button exports `ghost` rather
than `text` (it exports `text`; `variant="text"` works today and the "Already
have it? Open the recipe" link is fine), and that the DS repo has no `CLAUDE.md`
(it has one, 13,930 bytes, at its root – read it before any DS work).

## ✅ The share page is LIVE on the design system (2026-08-18)

`prepeat-share` is rebuilt on `@sebellds/react` and deployed. Verified live on
both domains: `share-dev.prepeat.app/r/<dev token>` renders 200 with the real
recipe, revoked → 410, unknown → 404; the production 404 page also carries the
new DS markup and the AASA still serves `application/json` (deep links intact).

What shipped:
- **Every control is a DS component** – Button, Text, Stack, Icon from
  `@sebellds/react`. The only CSS the repo owns is page layout (shell, card,
  image ratio), written in DS tokens.
- **Both CTAs navigate**, once Button 0.3.0 made the component polymorphic
  (`as="a"` takes href). The "Already have it? Open the recipe" link now
  re-attempts the app's own scheme instead of pointing at the App Store.
- **Icons are exported from the Figma frames**, not a Material set, and live in
  `lib/icons.mjs` because the DS does not own icons yet (Thomas's call).
  ⚠️ The DS Icon is built for STROKED icons (viewBox 24, fill:none, a stroke);
  these are filled, so each overrides fill/stroke/viewBox.
- **A build step, `scripts/build-css.mjs`**, bakes the DS stylesheets into an
  importable module so the Vercel function bundles them. Generated, gitignored.
- **Deploys are automatic now** – Vercel Git integration is connected; a push to
  `main` deploys to both domains. No more `vercel deploy --prod`.

The DS gained four things while building this, each because a real page needed
it: `display1…display6` + inline emphasis on Text (0.2.0), and `as` on Button /
IconButton (0.3.0). The app being the DS's testbed, working as intended.

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
5. ⚠️ **BUILT 2026-08-17, NOT DEPLOYED** – new project `prepeat-share`
   (`~/Documents/Claude/Projects/prepeat-share`, local git only, no remote yet).
   One route, no npm dependencies, holds no secrets: it calls `share_by_token()`
   with the anon key. All five states verified against the DEV database through
   the real code – 200 own, 200 imported, 410 revoked, 404 unknown, 503 down.
   ✅ **LIVE AT https://share.prepeat.app SINCE 2026-08-17.** DNS is a CNAME on
   `share` at Porkbun; the certificate issued about a minute after it propagated;
   Deployment Protection confirmed OFF by fetching anonymously, which is the one
   check Thomas cannot do himself from a signed-in browser. Deploys are manual
   (`npx vercel deploy --prod` from the linked folder) – **no Git integration
   yet**.
   *Earlier note, kept because it explains the odd project history:* first
   deployed anonymously and VERIFIED AGAINST PRODUCTION: a real
   share of a real recipe rendered with the sharer's name and no description
   (imported); unknown and malformed tokens 404; the root redirects to
   prepeat.app; and revoking took the page down 36 seconds later.
   **Still needs Thomas:** the Vercel token here can read the team but cannot
   create a project (`403 forbidden`), so he must create `prepeat-share` (or
   grant the right) and point `share.prepeat.app` at it. No env vars needed –
   the production URL and publishable key are defaults in the code, neither
   being a secret.
   ⚠️ **Revocation is not instant:** live pages are edge-cached for 60 seconds,
   so a revoked link keeps working for up to a minute. Deliberate; the
   alternative sends every unfurl bot straight through to Supabase.
   **⚠️ AND THE ONE THING THAT SHOULD CHANGE A DECISION – see below.**
6. ✅ **DONE 2026-08-18, confirmed on the device.** A shared link opens the app
   on the recipe instead of Safari.
   AASA at `share.prepeat.app/.well-known/apple-app-site-association` – 200,
   `application/json`, zero redirects, naming both `app.prepeat` and
   `app.prepeat.dev`. `associatedDomains` in `app.json`. The screen is
   `src/app/recipes/shared/[token].tsx`, and `src/app/+native-intent.tsx`
   rewrites the public `/r/<token>` path onto it.
   ✅ **That screen stays sparse, deliberately** (Thomas, 2026-08-18). It is
   reached by someone who has already converted, so it only has to confirm and
   save – see the decisions log. An imported recipe showing only title and times
   there is fine: it is the same snapshot the web page reads, and Save hands over
   the full description and photo a tap later anyway.

7. ✅ **DONE 2026-08-18.** `save_shared_recipe()` (migration 0035) copies the
   real recipe – ingredients, steps and section headers – into the recipient's
   kitchen; the button is on the shared-recipe screen. Saving a recipe already
   in your kitchen returns the original, and saving the same share twice returns
   the copy you have, so it cannot duplicate a cookbook.
   **A bug this exposed, worth keeping:** a deep link opens
   `recipes/shared/<token>` with nothing beneath it, so `router.back()` dropped
   out of the tab entirely and Recipes became unreachable. Fixed with
   `unstable_settings.initialRouteName` on the Recipes layout. It needed a deep
   link AND a navigation on top of it, so nothing before step 7 could have found
   it.
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
