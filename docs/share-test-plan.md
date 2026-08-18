# Sharing – test plan

Manual test cases for the share feature, live on TestFlight in build 24
(2026-08-18). Spec: [share-recipe.md](share-recipe.md).

## Read this first: what NOT to test

**The database layer is already covered by 29 automated checks**
(`supabase/tests/recipe-shares.sql`). Do not spend a human on these – they are
proven every time the suite runs:

- anon cannot list the share table; `share_by_token` is the only public door
- an imported share carries no description and no photo
- a revoked share still names the sender but hides the title and photo
- an unknown token returns nothing
- saving copies ingredients, steps and section headers into the SAVER's kitchen
- saving the same share twice returns the same copy (no duplicates)
- saving into a kitchen the recipe already lives in is a no-op
- you cannot save into someone else's kitchen
- deleting a recipe takes its public page down

What a human has to test is everything those cannot reach: the chat preview,
universal links, the two hosts, and the screens.

## ⚠️ Four things that produce FALSE failures

Every one of these has already wasted a round. Check them before reporting a bug.

1. **The dev app and TestFlight use different worlds.** The dev app
   (`app.prepeat.dev`, its own icon) writes to the DEV database and makes
   `share-dev.prepeat.app` links. TestFlight/App Store writes to PRODUCTION and
   makes `share.prepeat.app` links. **A link from one will not resolve in the
   other** – it will correctly say "This link doesn't lead anywhere". Always
   note which app produced a link.
2. **A link must be TAPPED, not typed.** Typing a share URL into Safari does not
   hand off to the app – iOS only honours universal links from a tapped link.
   Send it to yourself in Messages and tap it.
3. **iMessage caches previews per URL.** Re-sending an old link shows the OLD
   card. To test a card change, share a recipe you have never shared before.
4. **A live page is edge-cached for 60 seconds.** A freshly revoked link can keep
   working for up to a minute. Wait before calling revocation broken. (Revoked
   and 404 responses are not cached.)

## Setup

Ideally two phones, or one phone plus a computer:

- **A** – your iPhone with the TestFlight build, signed in
- **B** – a device WITHOUT Prep+Eat installed (or a browser in private mode),
  to be the stranger
- A second account in a DIFFERENT kitchen, to test receiving properly

---

## 1. Sending

| # | Case | Steps | Expected |
|---|---|---|---|
| 1.1 | Share exists at all | Open a recipe → ⋯ | **Share recipe** is in the menu (it was dev-only before build 24) |
| 1.2 | Share sheet opens | Tap Share recipe | The OS share sheet appears with a `share.prepeat.app/r/…` link and nothing else in the message |
| 1.3 | Cancel is not an error | Open the share sheet, dismiss it | No error, no alert. A cancelled share is not a failure |
| 1.4 | Offline | Turn on airplane mode, tap Share recipe | A clear "Couldn't create the link" alert, not a crash or a silent nothing |
| 1.5 | Two shares of one recipe | Share the same recipe twice | Both links work. Re-sharing must not break the first link |

## 2. The chat preview card

The card is the product – it is what a recipient decides from.

| # | Case | Steps | Expected |
|---|---|---|---|
| 2.1 | Imported recipe | Share a recipe that has a source URL | The **wordmark card** – brown, `prep+eat`, right-aligned. **No recipe title inside the image** |
| 2.2 | Own recipe with a photo | Share a recipe with NO source URL and a photo | The **recipe's own photo** as the card |
| 2.3 | Title is not duplicated | Look at any bubble | The title appears ONCE, as the link title under the image – never also burnt into the picture |
| 2.4 | Other messengers | Send a link via WhatsApp | A card appears. Layout differs per app; that it renders at all is the test |

⚠️ **Known and accepted:** a hand-written recipe that credits a source link still
gets the wordmark card, not your photo. That is the imported-content rule and it
is deliberate – see the backlog entry before reporting it.

⚠️ **Not in our gift:** the Figma bubble shows a middle line ("Pia shared a
recipe with you"). We send it as `og:description`, but iMessage decides whether
to display it and often does not. Not a bug.

## 3. Receiving WITHOUT the app (the stranger)

On device B, or a private browser window.

| # | Case | Steps | Expected |
|---|---|---|---|
| 3.1 | Own recipe | Open a link to a recipe with no source URL | Photo, title, description, times, "The recipe is in the app", **Get Prep+Eat** |
| 3.2 | Imported recipe | Open a link to a recipe with a source URL | Wordmark hero, title, times. **No description** – it is the source site's |
| 3.3 | Never ingredients or steps | Any share page | **No ingredient list and no method, ever.** This is the teaser decision. A leak here is the most serious bug on this page |
| 3.4 | Get Prep+Eat works | Tap the green button | Goes to the App Store listing |
| 3.5 | Desktop | Open the same link on a computer | Content centred in a readable column, not stretched across the screen |
| 3.6 | Hover | On a computer, hover the green button | It changes colour |

## 4. Receiving WITH the app

On device A. **Tap the link, don't type it.**

| # | Case | Steps | Expected |
|---|---|---|---|
| 4.1 | Cold start | Force-quit the app, then tap a share link | The app opens **on the shared recipe**, not on Plan |
| 4.2 | Warm | With the app already open, tap a share link | Same screen |
| 4.3 | What it shows | Look at the screen | Sender's name, title, times, **Save to my recipes**, **No thanks**. Deliberately no photo and no description |
| 4.4 | No thanks | Tap it | Leaves the screen. Nothing is saved |
| 4.5 | Back | Tap the back arrow | Lands on **Recipes**, never a dead end or the Plan tab |
| 4.6 | Your own share | Tap a link you created yourself | Works – it does not have to be someone else's |

## 5. Saving

Use a second account in a **different kitchen** – this is where the value is.

| # | Case | Steps | Expected |
|---|---|---|---|
| 5.1 | Save works | Tap **Save to my recipes** | Opens the recipe, now in YOUR kitchen, with ingredients and steps |
| 5.2 | It is a real copy | Open it, edit something | It is yours to edit. The sender's copy is unaffected |
| 5.3 | No duplicates | Tap the same link again and save again | You get the copy you already have – not a second one |
| 5.4 | Already yours | Save a share of a recipe already in your kitchen | Opens the original. No duplicate |
| 5.5 | Offline save | Airplane mode, then Save | A clear "Couldn't save this recipe" alert. Nothing half-saved |

## 6. The dead ends

| # | Case | Steps | Expected |
|---|---|---|---|
| 6.1 | Broken link, in the app | Send yourself `https://share.prepeat.app/r/nosuchtokenatall` and tap it | **"This link doesn't lead anywhere"** – NOT a black "Unmatched Route" developer screen |
| 6.2 | Broken link, in a browser | Open the same URL on device B | The same message as a web page |
| 6.3 | Cut short | Delete the last few characters of a real token and tap it | Same friendly screen. This is the case the copy was written for |
| 6.4 | Revoked | Ask Claude to revoke a token, wait a minute, then open it | **"<Name> isn't sharing this one any more"** – it still names the sender |
| 6.5 | Deleted recipe | Share a recipe, then delete the recipe, then open the link | Reads as revoked. A deleted recipe must not stay public |
| 6.6 | No connection | Airplane mode, then tap a share link | "Can't open this recipe" with a **Try again** button that works when you reconnect |

## 7. Language

| # | Case | Steps | Expected |
|---|---|---|---|
| 7.1 | Danish app | Set the phone to Danish, tap a share link | The in-app screens are Danish |
| 7.2 | The page is English | Open a share page | English. The page is not translated – expected, not a bug |
| 7.3 | Danish characters | Share a recipe with æ, ø or å in the title | Correct in the bubble, the page and the app. No mojibake |

---

## What we cannot test here

- **Whether a photo is really yours.** The rule uses "has a source URL" as a
  proxy. No test can establish ownership – see the backlog entry.
- **Real conversion.** Whether a stranger installs the app is the actual point of
  the feature and only real use will show it.
- **Every messenger.** iMessage and WhatsApp are worth checking; the rest render
  what they render.
