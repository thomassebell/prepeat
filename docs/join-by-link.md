# Joining a kitchen by tapping a link

Build spec. **Sketched 2026-08-20, not built, and not fully decided** – the
questions marked *Needs Thomas* are real ones, not formalities. Parent research:
the backlog item "Let someone join a kitchen by tapping a link, not typing a
code" (Thomas, 2026-08-10). Sibling specs: [share-recipe.md](share-recipe.md),
[share-expiry-and-stop-sharing.md](share-expiry-and-stop-sharing.md).

## Why this exists

Thomas, 2026-08-10: *"I find it a bit troublesome joining with a code because
you first have to create a user and then remember or find a code."*

The ask is **link → install → account → already in the household**, with the
code never entering the joiner's awareness.

**What it actually removes is two things, and the second is worth more than it
sounds:**

1. **The code** – never seen, typed, or remembered. A link waits in the message
   thread; a code has to be held in your head between two apps.
2. **The "set up your kitchen" fork** – a link-joiner never reaches it. The
   Synthetic User Panel found step 5 the heaviest step in the whole first run:
   every reader needed to know whether a household of one is supported, and five
   independently feared creating a duplicate household. A link-joiner is never
   offered the choice, so both findings are **sidestepped rather than reworded**.

## The blocker cleared itself, from an unexpected direction

This sat blocked from 2026-08-10 on: *the site is on GitHub Pages, which serves
extensionless files as `application/octet-stream`, and Apple requires the
association file as `application/json`.* The plan was to move `prepeat.app`.

**The site never moved. The share feature brought its own host.**
`share.prepeat.app` runs on Vercel, already serves a valid AASA – verified
2026-08-20, HTTP 200, correct content type, host-conditional so each app id gets
its own file – and is already in the production app's `associatedDomains`.

So the remaining work is much smaller than "move the site": one more path in the
AASA, one route on a host that already exists, and the app side.

## ⚠️ The thing this spec adds to the research: a code in a URL is not the same object as a code on a fridge

The existing invite code is **`PREP-XXXX`, four characters from a 28-symbol
alphabet – about 615,000 combinations** (migration 0012). That is small, and
deliberately so: it is meant to be read aloud, written on a fridge, and shared by
a whole family. It is safe today because of *how it is used*:

- Redemption is throttled per user AND by a **global guess cap** (0033).
- **A code discloses nothing until it is redeemed.** There is no way to ask "what
  household is `PREP-6A3V`?" – you can only attempt to join, as a signed-in user,
  against a counter.

**A web page at `/j/PREP-6A3V` breaks the second property**, and that is the
whole design problem. To be worth tapping, the page has to say *whose* kitchen
you are joining – otherwise it is a blank invitation. But that turns the code
from a redemption secret into a **lookup key**, answered by an unauthenticated
page. 615k is nothing at web scale: an afternoon of requests would harvest a
map of codes to household names, which are family names.

⚠️ **This is the same shape as the bug caught in the share spec** – there, the
first draft let `anon` read the `recipe_shares` table, which would have turned a
token into a listing. The lesson transfers: *the guard is not the secret's
length, it is that nothing can be enumerated.*

### The proposal: the link carries its own token, not the human code

Mint a **separate, unguessable link token** for an invite – the same shape
sharing already uses, 32 hex characters from `gen_random_uuid()` – and put THAT
in the URL:

```
https://share.prepeat.app/j/8f14e45fceea167a5a36dedd4bea2543
```

- The friendly `PREP-XXXX` code **stays exactly as it is**, for reading aloud to
  a parent on the phone and for joining from a second device. *Do not remove a
  working path.*
- The link token is unguessable, so the page may safely name the household.
- Both point at the same invite row, so **expiry, rotation and revocation apply
  to both at once** – rotating a code kills its link, which is the behaviour
  anyone would expect and gets it for free.
- The redemption function keeps its throttle regardless, because the throttle
  also protects against a stolen link being replayed.

**The cost:** one column (or one small table) and a second lookup path. That is
genuinely small next to what it prevents.

## ⚠️ The part iOS gives us nothing for

**When the app is already installed, this is solved and easy.** A universal link
opens the app directly, the app holds the token through sign-in and redeems it
the moment the account exists.

**When it is not installed, iOS deliberately severs the link from the fresh
install**, for privacy. The newly installed app cannot know which link brought
the user. This is an Apple constraint, not an Expo one, and there is no clean way
round it. Four routes were researched on 2026-08-10; the ranking still stands:

| | route | verdict |
|---|---|---|
| 1 | **Tap the link again** | **Recommended.** The page names the household and offers the App Store. After installing, the user returns to the thread and taps the SAME link, which now opens the app. Free, no dependencies, no tracking. |
| 2 | **App Clips** | The genuinely seamless option, and a project of its own. A miniature app launches from the link with nothing installed, joins, then hands off. Expo needs a separate native target plus config-plugin work. Its own item, later. |
| 3 | ⛔ **Branch.io / AppsFlyer** | **Ruled out, and not on technical grounds.** Deferred deep linking works by device fingerprinting. `prepeat.app` says the app has *"no ads, no analytics and no third-party tracking"*, and the App Store privacy label is published on that basis. This would cost a promise already made in public. |
| 4 | ⛔ **Clipboard bridge** | iOS prompts before any app reads the clipboard. Unreliable, and reads as creepy. |

**Be honest about what route 1 delivers.** It is not "install and you are in". It
is *"the invitation waits for you in the thread, and one tap does the rest"* –
which is still strictly better than a code that has to survive in someone's
memory across an App Store visit. The seamless version is App Clips, and that is
a separate build.

## ⚠️ The honest limit on the whole ask

**The account step cannot be skipped.** Household membership attaches to a user,
so email + one-time code still happens. Anyone promising otherwise has not
looked at the data model. What the link removes is the code and the fork, not
the sign-up.

## What to build

### 1. Database

- A **link token** on `household_invites` – unguessable, minted alongside the
  code, rotated and expired with it.
- `invite_by_token(p_token text)` – the public door, mirroring `share_by_token`:
  takes the token as an argument so there is nothing to enumerate, returns **only
  what the page needs** (household name, inviter's first name, and whether the
  invite is live / expired / already rotated). Executable by `anon`; the table
  itself stays unreadable to `anon`.
- Redemption keeps going through `join_household_with_code`'s throttles. A
  token-based redeem must not become a way around the guess cap.
- ⚠️ **Grants by name, both `public` and `anon`** – the trap from 0036/0037,
  which has now bitten four times in this project.

### 2. The share host

- A `/j/<token>` route rendering the invitation, reusing the existing dead-end
  shapes for expired / unknown / error. The page needs its own design.
- **Add `/j/*` to the AASA `components`.** It currently declares only `/r/*`.
- Deploys on push; no app build needed for the web half.

### 3. The app

- `+native-intent` maps `/j/<token>` onto a screen, exactly as it already does
  for `/r/<token>`.
- **Hold the token through sign-in.** There is no pending-invite mechanism today
  – checked, nothing matches. It has to survive: open link → sign-up → OTP →
  redeem, without the user seeing the household fork in between.
- Redeem on first authenticated launch, then land the user **inside the
  household**, not on the choice screen.

## The copy

⚠️ **The joining side is already code-agnostic and must stay that way.** Thomas
made it so on 2026-08-10, giving the reason afterwards: *"I plan to also
introducing a link as a joining methode."* The choice screen reads **"Join an
existing kitchen / You'll share the same recipes, plan and shopping list –
anything you add shows up for them too."** It names the DESTINATION, not the
mechanism. **Do not "helpfully" put the "Got an invite code?" hint back** – its
absence is deliberate and this feature is why.

**What DOES name the mechanism, and so changes when links land – the GIVING
side:** *"Share this code and they'll see the same recipes, plan and list"* on
the kitchen-is-ready screen, and *"Invite someone, or give them the code below"*
in the invite sheet.

Nothing here is written yet. The web page's wording is undrafted.

## Needs Thomas

1. **Does the link token proposal stand?** It is the one place this spec departs
   from "a link would only carry the code that already exists". The reason is
   above; the cost is a column and a lookup.
2. **Design for the `/j/` page.** It is a fifth state on the share host and the
   first page whose job is conversion into a *household* rather than a recipe.
3. **What the page shows before install.** Household name and inviter's first
   name is the useful version; anything less is a blank invitation. Confirm that
   naming a household to anyone holding the link is acceptable – with the link
   token it is no longer guessable, but it is still readable by whoever the link
   reaches, including a forwarded thread.
4. **Whether route 1 is enough to ship**, or whether this waits for App Clips.
   Route 1 is a fraction of the work and can ship first without blocking App
   Clips later.
