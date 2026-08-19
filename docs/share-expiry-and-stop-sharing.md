# Share links: expiry + Stop sharing

Build spec. Decided with Thomas 2026-08-18, not yet built. Parent spec:
[share-recipe.md](share-recipe.md).

## Why this exists

Writing the privacy policy for sharing exposed a gap: **a user has no way to
turn a share link off.** The policy had to say "write to us and we will do it",
which is honest but weak as a GDPR withdrawal route, and it was the thing
Thomas was most worried about.

Two changes close it. They are complementary, not alternatives:

| | what it fixes | what it does not |
|---|---|---|
| **30-day expiry** | exposure stops being permanent, for everyone, without anyone having to think about it | nothing for "I shared that by mistake, take it down NOW" |
| **Stop sharing** | the mistake case, immediately, in the user's hands | only reaches updated builds |

⚠️ **The gap was narrower than first stated, and the record should say so.**
There has always been an immediate self-service way to take a page down:
**delete the recipe** – verified in test 6.5. The real gap is that you could not
stop sharing *without losing the recipe*.

## The decisions

### 1. Expiry: 30 days, absolute, from creation

Thomas's first instinct was 48 hours; Claude proposed 90 days. **30 days is the
agreed answer** – and the reasoning matters more than the number:

- **48 hours is too short.** A link sent Friday evening and opened Monday would
  already be dead. The person who suffers is the recipient, who did nothing
  wrong and has no idea why it failed. Most opens happen in the first days, but
  the tail past 48 hours is real and normal.
- **90 days was Claude's, and it was judgement rather than data** – it leaned
  toward reach because expiry was going to be the only protection. **Once Stop
  sharing exists, the automatic expiry no longer carries the whole privacy
  burden, so it can be shorter.** Thomas's argument, and it is the better one.
- **30 days** covers essentially all genuine "I'll look at that later"
  behaviour while staying a bounded, defensible retention period.

⚠️ **ABSOLUTE, NOT LAST-OPENED.** Claude first proposed expiring 90 days after a
link was last opened. **Dropped deliberately:** it needs a database write on
every page view, which fights the 60-second edge cache, and it makes the
sentence in the privacy policy harder to write. With a manual off switch, plain
"30 days from when you created it" is simpler to build and simpler to explain.

### 2. Stop sharing revokes EVERY link for that recipe

Not per person, and that is not a compromise – it is the only honest option.

**Each tap of Share mints a new token.** One recipe can have many live links,
deliberately, so that re-sharing does not break the first person's link.

**We never learn who a link was sent to.** The OS share sheet does the sending;
the app only produces a URL. So "stop sharing with Mum" is unimplementable – we
do not know which link went to Mum, or that Mum exists. That leaves revoking per
*link* (meaningless to a user – they are indistinguishable 32-character strings)
or per *recipe*. Per recipe also matches how anyone would think about it.

**Consequence to state in the UI:** everyone loses access, including people you
were happy to keep sharing with. Sharing again mints a fresh link; old
recipients stay cut off.

### 3. Stop sharing does NOT recall what was already saved

**This is the assumption a user could act on wrongly**, so the dialog must say
it. Someone who tapped *Save to my recipes* has their own copy in their own
kitchen. Revoking does not touch it – the copy is a separate row and is theirs
permanently. Verified: the Burger copy in the test kitchen is an independent
recipe, and the privacy policy already states it.

### 4. Expired gets its own wording, not the revoked wording

*"Thomas isn't sharing this one any more"* is wrong for a link that lapsed – he
did not stop, it timed out. With 30 days this will happen to real links.

## What to build

### Migration 0038

⚠️ **0036 and 0037 are already applied to production** (ledger checked
2026-08-18), so the next number is **0038**.

- `alter table recipe_shares add column expires_at timestamptz` – set by
  `create_recipe_share` to `now() + interval '30 days'`.
- **Backfill existing rows** to `created_at + interval '30 days'`. Harmless:
  every existing share was created within the last two days.
- `share_by_token` gains a branch, ordered so a deliberate act outranks a lapse:

  ```
  when s.revoked_at is not null then 'revoked'
  when r.deleted_at is not null then 'revoked'
  when s.expires_at <= now()    then 'expired'
  else 'live'
  ```

- A `stop_sharing_recipe(p_recipe_id uuid)` function: revokes every live share
  for that recipe, after the same `is_household_member()` check
  `create_recipe_share` uses. `revoke_recipe_share(text)` already exists and is
  granted to `authenticated` (still true after 0036/0037) but it takes a single
  token, and the app does not hold the tokens.
- Extend `supabase/tests/recipe-shares.sql`: an expired share reports `expired`,
  hides the title, still names the sender; stop-sharing kills all of a recipe's
  links and none of another recipe's; a saved copy survives it.

**Follow the standing rules:** `npm run backup` first, `npm run db:reset` to
replay, dev before production, `--dry-run` against production and read it.

### The app (one build, both changes together)

- **"Stop sharing"** in the recipe ⋯ menu, **directly under "Share recipe"**
  ([recipes/[id].tsx](../src/app/recipes/[id].tsx), the item at ~line 324).
  Show it only when that recipe has live shares.
- **Confirmation dialog**, wording agreed with Thomas:

  > **Stop sharing this recipe?**
  > Anyone you've sent it to won't be able to open the link any more. People who
  > already saved it keep their copy.

- **The expired state** on the shared-recipe screen: *"This link has expired"* /
  *"Ask for a new one – it only takes a second."*
- New strings in `en.ts` **and `da.ts`**.

⚠️ **A NEW STATUS DEGRADES SAFELY, so the order is free.** Both readers treat
anything that is not `live` as gone – app
[shared-recipe.tsx:287](../src/components/shared-recipe.tsx), web
`render.mjs:493`. So shipping `expired` in the database *before* the app knows
about it shows the revoked wording on old builds rather than breaking. **The
migration can go live immediately; the app catches up.**

### The share site (no build, deploys on push)

- Render `expired` with its own copy instead of falling through to revoked.
- The web can be accurate the same day the migration lands.

## The copy, ready to use

Danish is a **draft for Thomas to check** – he is the native speaker and is
proof-reading the translation sheet anyway.

### The expired page (web) and screen (in-app)

| | English | Dansk (draft) |
|---|---|---|
| Heading | This link has expired | Linket er udløbet |
| Body | Links stop working after 30 days. Ask for a new one – it only takes a second. | Links holder op med at virke efter 30 dage. Bed om et nyt – det tager kun et øjeblik. |

⚠️ **It does NOT name the sender, and that is deliberate.** Revoked says
*"Pia isn't sharing this one any more"* because that was Pia's decision. Expiry
is not anyone's decision – naming her would imply she did something. Nobody is
at fault here, so the sentence has no subject.

The body says **why**, unlike the other dead ends, because "expired" invites the
question and a reader who does not get an answer assumes something is broken.
It closes on the same "ask for a new one" as the revoked copy, because the way
out is identical.

**Web:** same words, plus the standard "See what Prep+Eat is" card and the
**Get Prep+Eat** button, exactly as revoked / link broken / 503 already do.

**In-app:** same words, the same white card with the broken heart, no button –
matching the other two permanent dead ends.

### Stop sharing (in-app only)

| key | English | Dansk (draft) |
|---|---|---|
| menu item | Stop sharing | Stop deling |
| dialog title | Stop sharing this recipe? | Stop med at dele opskriften? |
| dialog body | Anyone you've sent it to won't be able to open the link any more. People who already saved it keep their copy. | Alle du har sendt den til, kan ikke længere åbne linket. De, der allerede har gemt den, beholder deres kopi. |
| confirm | Stop sharing | Stop deling |
| cancel | (existing `common.cancel`) | (findes) |

The second sentence of the body is the one that earns its place: **"stop
sharing" sounds like taking the recipe back, and it is not.** Without it a user
would believe they had retrieved something they had not.

### Suggested keys

```
share.expiredTitle   'This link has expired'
share.expiredBody    'Links stop working after 30 days. Ask for a new one – it only takes a second.'
recipes.detail.stopSharing        'Stop sharing'
recipes.detail.stopSharingTitle   'Stop sharing this recipe?'
recipes.detail.stopSharingBody    'Anyone you’ve sent it to won’t be able to open the link any more. People who already saved it keep their copy.'
```

## The privacy policy replacement, ready to paste

⚠️ **NOT APPLIED, AND ON PURPOSE.** The policy being published 2026-08-19 says a
link can be turned off by writing to us, which is true today. Publishing the
wording below before the feature exists would promise a control the app does not
have – worse than admitting the limitation. **Apply it in the same change that
ships the feature**, to BOTH `docs/privacy-policy.md` and
`prepeat-web/privacy.html`.

**Replace this paragraph:**

> **Turning a link off.** Deleting the recipe takes its page down straight away.
> If you want a link turned off without deleting the recipe, write to us at the
> address at the end of this policy and we will do it.

**With these two:**

> **How long a link lasts.** A share link stops working 30 days after you
> created it. You do not have to do anything – it simply stops.
>
> **Turning a link off sooner.** Open the recipe and choose Stop sharing. Every
> link you have made for that recipe stops working straight away, and so does
> deleting the recipe. One thing it does not do: anyone who already saved the
> recipe into their own kitchen keeps their copy. Stopping sharing ends the
> link, it does not take the recipe back.

**And in "How long we keep it", replace the share bullet:**

> - A **share link** and its snapshot are kept until you delete the recipe or
>   ask us to turn the link off. Copies other people saved into their own
>   kitchens are theirs and stay with them.

**with:**

> - A **share link** and its snapshot stop working 30 days after you create the
>   link, or sooner if you stop sharing or delete the recipe. Copies other
>   people saved into their own kitchens are theirs and stay with them.

## Needs Thomas

- **A Figma frame for the expired state**, web and in-app – or a ruling to reuse
  the revoked layout with new words. It is a fourth dead-end state alongside
  revoked, link broken and connection error.
- **Confirm the dialog wording** above.

## Afterwards: update the privacy policy

The policy published 2026-08-19 says a link can be turned off by writing to us.
That is accurate today. **When this ships, replace it** with something much
better:

> A share link stops working 30 days after you create it, and you can stop
> sharing at any time from the recipe.

Both `docs/privacy-policy.md` and `prepeat-web/privacy.html`.

⚠️ **Do not publish that wording before the feature is live** – a policy that
promises a control the app does not have is worse than one that admits the
limitation.
