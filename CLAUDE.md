@AGENTS.md

# Prep+Eat

Meal-planning app for families: recipes, weekly meal plan, auto-generated
shopping list with real-time sync across household members. Target: iOS App
Store first, Android later.

**Read [docs/projektgrundlag.md](docs/projektgrundlag.md) before making product
or data-model decisions.** It records the agreed scope (v1 vs later vs
deliberately excluded), the data model, and the core principles. The app's UI
language is English and it targets an international audience.

**The work list lives in [docs/backlog.md](docs/backlog.md).** Keep it
current: check items off as they land, add new tasks and ideas there (with
attribution and date for ideas), and consult it when the owner asks what's
next.

The app is named **Prep+Eat** (decided 2026-06-12): "Prep+Eat" is the visual
wordmark (the + is the brand mark), "Prepeat" (pronounced PREP-eat) is the
plain-text form used for slug, scheme, domains and handles. Tagline: "Prep.
Eat. Repeat." The old working name "Madapp" may linger in docs/projektgrundlag.

## Stack

- Expo SDK 56 (React Native, expo-router, React Compiler enabled), TypeScript
- NativeWind v4 (Tailwind 3.4) – global CSS at `src/global.css`, config in
  `tailwind.config.js`. Put new design tokens in the Tailwind theme, never
  hardcoded in components.
- Supabase: Postgres + Realtime + Auth + RLS. Client at `src/lib/supabase.ts`,
  schema migrations in `supabase/migrations/`.
  **Three environments (since 2026-08-04) – know which one you are touching:**
  | | database | reached by |
  |---|---|---|
  | **dev** `rulasawjdtymovobrovv` | Prepeat Dev, own Free org | `.env` on the Mac – so `npm start` and `./scripts/build-iphone.sh` (`app.prepeat.dev`, installs beside the real app) |
  | **production** `wfrusfivvnutrtddyhiz` | real users | EAS variables on Expo's servers – TestFlight and App Store only |
  | **local** | Docker | `npm run db:start` – migration replay, no network |
  A migration goes **dev first, then production**, never the other way. Both
  take `npx supabase db push --db-url "$URL"` – dev from `~/.prepeat-dev.env`,
  production from `~/.prepeat-backup.env`, both gitignored and outside the repo.
  **Always `--dry-run` against production first and read what it lists.**
  Production had no migration ledger until 2026-08-06, and a push would have
  re-run all 31 migrations including the one that drops columns; the ledger
  exists now, but the dry run is what proves it.
- Figma MCP for design-to-code: screens are designed in Figma and implemented
  from frames via the Figma integration.

## Commands

- `npm start` – Expo dev server (then i for iOS simulator)
- `npm run lint` – ESLint via expo lint
- `npx tsc --noEmit` – typecheck
- `npm run db:reset` – replay EVERY migration onto an empty local database.
  Needs Docker running.
- `npm run backup` / `npm run backup:verify` – back up the live database now /
  restore the newest backup locally and check every row. Backups also run on
  their own (at login, then every 6h) and need neither Docker nor node.
  Full runbook: [docs/backups-and-local-db.md](docs/backups-and-local-db.md).
  **Editing `scripts/backup-supabase.sh` does nothing until
  `npm run backup:install` is re-run** – the scheduled job runs an installed
  copy, because macOS forbids background jobs from reading `~/Documents`.

**These commands are yours to run, not Thomas's** (agreed 2026-08-04 – he is
not a developer and should not have to remember them). Standing rules:
1. **`npm run backup` before applying anything destructive** to the live
   database – a migration, a bulk update, a delete. Takes seconds.
2. **`npm run db:reset` before a migration reaches production.** A migration is
   live for every installed build the moment it runs, so "it applied cleanly on
   an empty database" is the cheapest check there is.
3. **`npm run backup:verify` after any schema change**, since the restore
   procedure depends on the schema.
- `./scripts/build-iphone.sh` – build + install the Release app on
  Thomas's iPhone (unlocked; cable or same Wi-Fi – the pairing installs
  wirelessly too, cable is the fallback). Prints timestamped phases and
  exits when installed – never use raw `expo run:ios` for device builds
  (it tails logs forever and reads as a hung build). Run it in the
  background WITHOUT piping (a pipe buffers the log until exit) and
  watch the task output file with a Monitor for phase/error lines.

## Conventions

- Screens live in `src/app/` (expo-router file-based routing); shared UI in
  `src/components/`; data access and clients in `src/lib/`.
- Env vars go in `.env` (gitignored), documented in `.env.example`. Only
  `EXPO_PUBLIC_`-prefixed vars reach the client – never put secrets there
  beyond the Supabase anon key.
- Database changes are always a new numbered file in `supabase/migrations/` –
  never edit an applied migration.
- Every table needs RLS policies in the same migration that creates it.
  Household-scoped access goes through `is_household_member()`.
- Key data-model principles (from projektgrundlag): ingredients are
  snapshotted onto the meal plan (never read live from recipes), soft delete
  via `deleted_at`, last-write-wins concurrency via `updated_at`. Recipes,
  meal plans and shopping lists are all owned by the household; recipes carry
  `created_by_user_id` for attribution and use copy-on-leave so a departing
  member keeps a snapshot. Every user always belongs to at least one
  household.
- Realtime only where it matters: shopping list and meal plan. Not recipe
  editing.

## Design system workflow (agreed 2026-07-12)

The app is a testbed for the Sebell DS, which is still under development.

**Figma is the source of truth for the DS** (Thomas, 2026-08-07, correcting the
older wording here). Two things follow, and they are not the same thing:

- **DS components and VARIABLES in Figma are right.** Read them with
  `get_variable_defs`, which returns the real values.
- **⚠️ STILL COMPARE FIGMA AGAINST `ds-theme.cjs`** (Thomas, 2026-08-07). The two
  are not interchangeable: the bridge is a GENERATED COPY, produced by
  `npm run sync-ds-tokens`, so it goes stale the moment the DS is republished and
  nobody re-syncs. **A disagreement is the signal that the sync was missed** –
  it is not a licence to pick whichever value you prefer. Done on 2026-08-07 for
  the shopping list: all seven colours matched exactly, and the header font came
  back Montserrat both sides.
- **SCREEN FRAMES are Thomas's design work and can contain mistakes** – "I can
  still make mistakes in the design phase, but DS components should be right."
  So when a screen frame disagrees with a DS component, the component wins and
  the frame is worth querying rather than copying.

**POINTING AT SOMETHING IN FIGMA – the working recipe** (worked out with Thomas
2026-08-07, after two failed attempts):

```bash
open -a "Figma" "https://www.figma.com/design/nA8SLN8rhdBov97B1IYxnP/App?node-id=29-3417"
```

…then tell him to press **`Shift 2`** (zoom to selection).

Three things this gets right, each of which failed on its own:
1. **Never a bare node id.** It cannot be searched in the Figma UI at all.
2. **Never `figma.currentPage.selection`** set through the MCP – it does not
   reach the canvas Thomas has open. *"I can't see your selection."*
3. **`open -a "Figma"`, not a bare link.** Thomas works in the **macOS desktop
   app**; an `https://` URL on its own opens the browser. Handing it to the app
   avoids both the browser and any `figma://` scheme guessing.

Node ids take a **HYPHEN** in the URL (`29-3417`), not the colon the API returns
(`29:3417`).

⚠️ **The link carries the SELECTION but not the CAMERA** – verified: the node
was correctly selected in the properties panel while the viewport sat thousands
of pixels away on a blank part of the canvas. Hence `Shift 2`. Always say so;
without it the file looks empty and the link looks broken.
Add the layer path from the page down when the node is deeply nested, so it can
also be found by hand.

⚠️ **`get_design_context`'s CSS fallbacks are still stale** and always have been
– that payload is where `Noto Serif` and old hexes come from (the 2026-08-06
round where they were read aloud three times before Thomas caught it). Take
token NAMES from that output and never its numbers. The older note here said the
whole published library lagged the DS repo; that was too broad – it is only this
one output.

1. **Never improvise a token.** If a screen needs a token family that is
   not in `src/constants/ds-theme.cjs` yet (like forms/* before
   2026-07-12), stop and add the group to the export list in the DS repo
   (`packages/tokens/transforms/generate-nativewind.mjs`), run
   `npm run tokens:build` there, then `npm run sync-ds-tokens` here.
   Approximating with a neighbouring token silently drifts when the DS is
   retuned.
2. **After every DS publish or retune**, re-run the token build + sync,
   diff `ds-theme.cjs` and walk the affected screens. The owner saying
   "DS published" is the trigger (also under Recurring in the backlog).
3. **Interactive states are built, not inherited.** React Native has no
   hover/focus CSS – every state a component shows must be coded
   explicitly. When implementing a component, check its Figma frames for
   all states (default/active/error/disabled) and map web-ish token names
   (`hover`) to their touch meaning (focused/pressed). Text inputs share
   `src/components/ui/input.tsx` so the active state cannot drift apart.
4. **Build the design, never an approximation of it** (Thomas, 2026-07-17,
   after the multi-day sheets shipped with an invented switch, header and
   row style). The on-device app is the instrument Thomas judges his
   design with – an improvised implementation makes design flaws
   invisible and reviews meaningless, on top of the wasted correction
   rounds. Concretely: before writing UI code, fetch `get_design_context`
   for EVERY sheet/screen/state being implemented (screenshots and
   metadata are for review conversations, not specs). Where a design
   genuinely has a gap (a state not drawn, a flow not designed), say so
   and mark the improvisation in the backlog – never quietly fill the gap
   and let it read as Thomas's design.
