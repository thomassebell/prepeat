# Prep+Eat release notes

What shipped in each build, in the App Store's "What's New" voice, so there
is always something ready to post. Started 2026-08-03 – earlier builds are
reconstructed from the backlog and git history.

> **🎉 LIVE ON THE APP STORE: 1.0.0** (build 12), released 2026-08-13 ·
> **1.1.0 IS WITH APPLE: WAITING_FOR_REVIEW since 2026-08-19 20:32 UTC,
> carrying build 25.** Release is **MANUAL**, so approval does not put it in
> front of anyone – Thomas presses release. The last review took 13 days.
>
> Until he does, **real users are still on build 12**, frozen 2026-07-30.
> Everything in builds 13–25 is written and tested and none of it has reached
> them. That gap is the whole reason this file exists.
>
> Thomas does not track the number; keeping these lines true is Claude's job
> (agreed 2026-08-03). The rule below decides the next number, so this is
> bookkeeping, not a judgement: re-read it whenever a change is added under
> "Accumulating", and raise it if what landed outranks it – a feature turns a
> pending 1.0.1 into 1.1.0, and it never goes back down within one release.

## Versioning – Semantic Versioning (Thomas, 2026-08-03)

`MAJOR.MINOR.PATCH`, in `app.json`'s `expo.version`. Semver was written for
libraries, where MAJOR means "I broke your code" – an app has no callers to
break, so the digits are defined here in the app's own terms, otherwise the
rule decides nothing:

- **PATCH** (1.0.0 → 1.0.1) – fixes and polish. Nothing new to do, nothing
  moved. A user who never reads notes should not notice anything except that
  something stopped being broken.
- **MINOR** (1.0.1 → 1.1.0) – a new capability. Anything that would be worth a
  sentence in the App Store notes because the user can now do something they
  could not before.
- **MAJOR** (1.x → 2.0.0) – a release existing users have to re-learn: a
  redesign, a change to what the app is for, a paid tier. Rare, and a
  deliberate decision rather than a consequence of a big diff.

The version is NOT the build number. EAS auto-increments builds (12, 13, …)
and many builds can sit under one version – build 12 and build 13 are both
"1.0.0". Only bump `expo.version` when preparing a release to submit; Apple
requires it to increase between releases, not between builds.

**A migration has no version.** It is live for every version at once the
moment it runs, so it can never appear in a version's notes. That is why
server changes have their own section at the bottom of this file.

Two more rules this file exists to keep straight:

1. **A build is not a release.** A build reaching TestFlight is not a build
   users have. v1.0 in App Store review is bound to build 12 and nothing
   shipped since then is in it.
2. **Database changes are not in any build.** Migrations reach every phone
   the moment they run, whatever version it is on. They are listed
   separately below for that reason.

---

## Accumulating toward the next version

Nothing yet – 1.1.0 went to review on 2026-08-19 and this section starts again
from the next change. Anything added here is on the dev build only: not on
TestFlight, not in review, and it needs a build to reach anyone.

## 1.1.0 – SUBMITTED FOR REVIEW 2026-08-19 (build 25)

WAITING_FOR_REVIEW since 20:32 UTC, carrying **build 25**. MANUAL release.
Everything the release depends on outside the binary is already live: migration
0038 on production, the share site deployed, and the privacy policy published
and dated 19 August.

✅ **The What's New now covers expiry and Stop sharing.** It was written for
build 24 and was silent on both – users would have been told they could share
and not told that a link lapses after 30 days, while the privacy policy
published the same day said so. Fixed 2026-08-19 while the version was still
WAITING_FOR_REVIEW, by adding one section after the sharing one. **The
submission survived the edit** – same submission id, still WAITING_FOR_REVIEW,
checked immediately afterwards. Now 1411 characters.

The added section, as it will appear:

> **You can stop sharing at any time**
>
> Choose Stop sharing from a recipe's menu and every link you've made for it
> stops working straight away. Links also stop on their own 30 days after you
> make them, so nothing stays open by accident. Anyone who already saved the
> recipe keeps their copy.

It leads with the CONTROL, not the expiry: the control is the reassuring half,
and the expiry is the part that would otherwise surprise someone whose link had
quietly stopped working. Written as a heading plus a paragraph because that is
what the other five sections are – not as bullets.

User-facing lines, App Store voice:

- **Share links now stop working after 30 days.** Nothing to do and nothing to
  remember – a link you sent simply lapses, and the page says so plainly.
- **Stop sharing a recipe whenever you want.** Choose Stop sharing from a
  recipe's ⋯ menu and every link you have made for it stops working straight
  away. Anyone who already saved the recipe keeps their copy.
- **Share a recipe with anyone.** Send a link from a recipe's ⋯ menu. Whoever
  opens it sees the dish, and if they have Prep+Eat it opens right there with a
  tap to save it to their own kitchen.
- Opening a shared link shows who sent it, the title and the times, then Save
  to my recipes.
- A link that has been turned off, one that has expired, one that leads
  nowhere, or a connection that drops each says what happened, instead of one
  generic error.
- **The app speaks Danish** when the phone is set to Danish; your own recipes
  are never translated.
- **The screen stays on while you cook**, with a switch in Settings.
- **Better recipe imports** – ingredients that used to go missing now arrive,
  and amounts read properly on the shopping list.
- **Tidier settings**, and polish on leftovers and ingredient sections.

Under the hood, not for notes:
- A lapsed link says *"This link has expired"* and does **not** name the sender.
  Turning a link off is a decision; running out is not, and naming someone
  would imply they did something.
- The database withholds the whole snapshot on an expired link, not just the
  status. `share_by_token` is readable without a login by design, so an expired
  token has to stop returning the recipe rather than merely being labelled dead.
- **Stop sharing revokes every link for that recipe**, because the OS share
  sheet means we never learn who a link went to. It does not recall copies
  people already saved.
- **Each build now claims only its own share host.** Both used to claim both, so
  a share link could open in the dev app, which reads a different database and
  showed "this link doesn't lead anywhere". Only ever visible to someone with
  both apps installed.
- **Fixed: a mistyped or shortened link showed a developer error screen.** The
  app only recognised a perfectly formed link, so the very case the "link
  doesn't lead anywhere" screen was written for could never reach it.

⚠️ **Shipped unverified, deliberately, and worth knowing:** the Danish for the
four new sharing strings is Claude's draft and was never proof-read, and the
in-app **expired** screen has never run on a phone because no link is old
enough. Its web counterpart was checked against the deployed host.

⚠️ **UPLOADING TO TESTFLIGHT DOES NOT ATTACH A BUILD TO THE VERSION RECORD.**
Build 25 was VALID on TestFlight while 1.1.0 still pointed at build 24, and
nothing warns you – submitting then would have shipped the OLD binary under the
new release notes. Check the record, every release:
`zsh -c 'source scripts/eas-env.sh && node scripts/asc-attach-build.mjs'`

> ⚠️ **BUILD WHEN YOU ARE READY TO SUBMIT, NOT BEFORE.** Three builds in this
> file died parked: 18 (2026-08-16, superseded by 19 before it shipped), 19
> (1.1.0, built 2026-08-16, one fix behind within the hour), and 11 before
> them. Nothing is preserved by building early – EAS takes about twenty
> minutes whenever the moment comes, and a build is only ever a snapshot.
> **Build 20 is the rule working:** 1.1.0 was held from 2026-08-16 for the
> Settings redesign (`2.27`), nothing was pre-built, and the build was made the
> day the redesign closed. It shipped.
>
> **The version digit follows what is being SUBMITTED, not what is in the
> repo.** `app.json` is 1.1.0 because that is what build 20 carries. If a 1.0.1
> hotfix is ever needed before 1.1.0 goes to review, drop it back to 1.0.1 for
> that build – App Store Connect binds a release to the string inside the
> binary.

## Build 20 – TestFlight 2026-08-17 (VALID, not in review)

**1.1.0**, from commit `7c8d829`. Uploaded 20:07 CEST, VALID three minutes
later – the fastest of any build so far, against build 17's forty.

**The first build to reach testers since build 12**, which was frozen
2026-07-30. Eighteen days of work arrives at once: the kitchen/Settings
rewording, leftovers, ingredient sections, the recipe-import fixes, the
Settings redesign, THE WHOLE APP IN DANISH, and keep-screen-on.

**The App Store review is untouched.** v1.0 stays on build 12, so real users
have none of this. It reaches them only when 20 is submitted for review, which
is a separate decision.

**The hold is over, and it was honoured.** 1.1.0 had been held since 2026-08-16
for the Settings redesign, with a standing warning not to pre-build. `2.27`
closed, and only then was this built – so unlike builds 18 and 19, which both
died parked, this one was built at the moment it could ship. **The rule earned
its keep: build when you are ready to submit, not before.**

**`app.json` says 1.1.0 and that is correct here**, unlike builds 13 through 17
which stayed 1.0.0. Those were TestFlight snapshots of a version already in
review; this is the version the next submission will carry.

⚠️ **THE SUCCESS MESSAGE LIED, AND THE TWO-SOURCE CHECK CAUGHT IT.**
`eas-submit-ios.sh` finished by printing *"Build 17 is VALID on TestFlight"* –
which reads as confirmation and is not: it reports the newest build APPLE HAS
LISTED, and at that moment that was still the one from ten days earlier. Expo
said the submission was `finished` (delivery proven) while Apple had not listed
20 yet (processing not done). Reading only the script's headline would have
recorded a ten-day-old build as today's result. The script should name the
build it just submitted; that is in the backlog.

### 2026-08-17

- **The screen no longer dims while you cook.** Open a recipe and the phone
  stays lit until you leave it, so you can prop it up on the worktop and stop
  poking it with wet hands. A line under the servings counter tells you whether
  it is on, and there is a **Keep screen on** switch in Settings → App if you
  would rather it behaved as usual. It is on to begin with.
  Only recipes hold the screen: switch to your plan or the shopping list and
  the phone dims normally again.

- **The app speaks Danish.** If your phone is set to Danish, Prep+Eat is now in
  Danish – the plan, your recipes, the shopping list, settings and the whole
  set-up flow. Set to anything else, it is in English exactly as before. There
  is no setting to find: the phone decides. You can also switch just this app
  in iOS Settings → Prep+Eat → Language.
  Recipes themselves are never translated – a recipe you typed or imported
  stays in the language you saved it in, whichever way your phone is set.

### 2026-08-16

- **Importing a recipe from a link brings more of it across.** Some sites
  hid their ingredients behind a link or wrote their method in a way the
  import didn't recognise, so recipes arrived with amounts but no
  ingredients, or with no method at all. Steps the site had already numbered
  no longer come in numbered twice.

- **An import that finds no method now says so.** Some recipe pages publish
  their ingredients but not their steps. The form used to open with an empty
  Instructions card and no explanation, which looked like the import had lost
  them; it now tells you the page didn't share any, so you know to write them
  yourself.

- **Imported ingredients read like a shopping list again.** "onion finely"
  is an onion, "2 x 400g cans chopped tomatoes" is 800 g of chopped
  tomatoes, and a recipe that simmers for two hours no longer claims to take
  forty minutes.

- **You are the first person listed in your kitchen.** Under **People** in
  Settings, your own row now sits at the top, with everyone else underneath in
  the order they joined. It used to be join order alone, so if somebody else
  set the kitchen up, you found yourself somewhere down the list.

- **Settings is simpler to read.** The screen was carrying more weight than it
  needed: kitchen and member names were set like headings, kitchens showed a
  member count, and your own row showed your email address. Names are now plain
  text, the extra lines are gone, and the rows are all one shape – so the eye
  goes down the list instead of stopping on every row.

- **Changing kitchen leaves you where you were.** Switching from Settings sent
  you off to another tab – to Plan usually, and all the way to Recipes if the
  kitchen you picked had none yet. You now stay on the screen you were on, and
  the kitchen underneath it is the new one.

- **Deleting or leaving a kitchen finishes properly.** Both confirmations sat
  there turning after you tapped the button, with no way to tell whether
  anything had happened. The work itself had already gone through – it was the
  panel on top that never closed. It now closes and puts you in your other
  kitchen.

### 2026-08-13

- **The Kitchen tab is now Settings, and it holds more.** Plan, Recipes and
  Shopping all live inside your kitchen, so a fourth tab called Kitchen sat
  next to its own contents. It is now **Settings**, with three groups:
  **Kitchens**, **People** and **App**.
- **Switching kitchen no longer hides in a menu.** Every kitchen you belong to
  is a row on the screen, with a tick on the one you are in – tap to switch.
  Joining and creating another sit right underneath, instead of behind the
  little arrow next to the title.
- **Help and the privacy policy are in the app.** Two new rows under **App**
  open the pages on prepeat.app.
- **Inviting someone gets out of the way once your kitchen is full.** On your
  own you get a proper prompt explaining what a second person gets you; once
  somebody else has joined, it settles down into a single quiet line.

### 2026-08-11

- **Not every meal has to be a recipe, and the app finally says so.** When you
  add a meal, the second tab is now called **"Anything else"** instead of
  "Manual" – so leftovers, takeaway or a night at your mother's go on the plan
  by typing a name. Nothing changed about how it works; it was there all along
  and called something nobody read as permission.

### 2026-08-10 – the wording round

Came out of a synthetic user panel run against the first-run screens: seven
readers out of seven could not say what a "household" was in the product.

- **It is called a kitchen now, not a household.** The tab, the switcher, every
  sheet, and the whole set-up flow. The app used to use both words for the same
  thing – one error even said "Can't reach your kitchen" directly above "We
  couldn't load your household" – so there was no way to work out what the thing
  actually was. One word throughout, and the set-up screen now says what a
  kitchen holds: your recipes, the weekly plan and the shopping list.
- **One way in, instead of two.** The welcome screen offered "Get started" and
  "Already cooking? Sign in", which both led to the same screen – there is no
  password, so signing up and signing in are the same step. It is one button
  now, and the email screen says so: *new here or coming back, it's the same.*
- **Buttons tell you what is missing instead of doing nothing.** Pressing
  Continue with an empty field used to be silently ignored, leaving you to guess
  why nothing happened. Now the form says what it still wants.
- **The app no longer assumes who you live with.** Several screens told you what
  your family does or would recognise. Prep+Eat works the same whether you cook
  for six, for two, or for yourself – and a kitchen of one is still a kitchen.
- **Setting up asks for less.** Naming your kitchen no longer explains itself at
  length, the name step just asks your name, and the sign-in screens no longer
  describe things you have not seen yet.
- **When something will not load, the message says what.** "Can't reach your
  kitchen" became "Can't load your recipes" – the old one made two readers think
  something was wrong at home rather than with the connection.

## Build 17 – TestFlight 2026-08-07 (VALID, not in review)

Uploaded 17:45 CEST, VALID about 40 minutes later. Marketing version stays
**1.0.0**: this is a TestFlight build, not a submission, so `app.json` is
untouched – same as builds 13 through 16.

**The App Store review is untouched.** v1.0 stays on build 12, so none of this
is in it.

**Slower to appear than any build so far, and the two-source check is what kept
it honest.** The local watcher was killed by its watchdog at 600s and Apple had
still not listed the build after 30 minutes of polling – the exact shape that
produced a wrong "Apple never received it" call on 2026-08-03. Asking EXPO
instead (`eas submit:list`) returned `Status finished` for build 17, proving
delivery, which left "Apple is still processing" as the only reading. It
appeared a few minutes later.
**THE RULE THIS ADDS:** when Apple has not listed a build, ask Expo whether the
submission finished. Two independent sources separate "not delivered" from "not
processed yet"; polling Apple alone can never tell them apart.

- **Drag a section and its ingredients come with it.** Moving "DOUGH" now moves
  everything under it, instead of leaving the ingredients behind. A section
  drops between other sections rather than into the middle of one, so nothing
  changes section without you asking. Dragging a single ingredient works exactly
  as before – that is still how you move one into another section.
- **No drag handle where there is nothing to drag.** A shopping list with only
  one category no longer offers to reorder it, and the same is true for a recipe
  with a single ingredient section.
- **The shopping list reads like the rest of the app.** Category headings and
  the "items done" heading now use the same style as a recipe's ingredient
  sections, with more room around them, so the list is easier to scan.
- **Editing a section no longer turns it into an ingredient.** Opening a
  heading to edit it and pressing Done used to save it as an ordinary
  ingredient – which then appeared on your shopping list. Headings stay
  headings.
- **Tap a row to edit it.** While editing a recipe, tapping anywhere on an
  ingredient or instruction opens it, instead of having to find the three dots
  first. Deleting has moved into that same sheet, so every row is edited and
  removed in one place.
- **The edit sheet behaves itself.** It no longer opens so tall that the close
  button is off screen, it uses more of the screen when it needs to, and it no
  longer throws the keyboard at you when you are only editing – so you can see
  the whole thing and choose what you came to change.
- **Reordering no longer jumps when you let go.** Anything you drop now settles
  where you put it. This affected every reorder list – ingredients, instructions
  and shopping categories – and had done since reordering was built.

## Build 16 – TestFlight 2026-08-06 (VALID, not in review)

Uploaded 22:03 CEST, VALID three minutes later. Everything that had
accumulated since build 15 on 2026-08-04. **Needs migration 0031**, which was
applied to production the same evening – the sections would be invisible
without it.

- **Recipes can have sections now.** A recipe that groups its ingredients –
  Dough, Filling, Frosting – keeps those headings instead of listing them as
  things to buy, and they no longer turn up on your shopping list. Imported
  recipes get their sections automatically; you can also add, rename and delete
  your own.
- Reordering ingredients has a new look, and shows your sections while you
  drag, so you can see what you are moving.
- Every sheet in the app – add ingredient, add meal, edit item, invite someone –
  now has the same corners and spacing. They had drifted apart.



## Build 15 – TestFlight 2026-08-04 (VALID, not in review)

Uploaded 09:08 and confirmed VALID by asking App Store Connect directly. **v1.0
is still bound to build 12 and untouched**, so these reach testers without
disturbing the review queue – the same call as builds 13 and 14.

- Amounts read properly whatever the serving count: "1 liter" and "2 liters",
  not "1 liters" or "2 liter". Danish units too.
- An app left open or asleep over Sunday midnight now knows it is a new week,
  and marks the right day as today. Before, it could still be showing last
  week, so a meal added to what looked like this week landed on the finished
  one.
- Imported recipes read properly: no more "chef&rsquo;s" or "cr&egrave;me" in
  the middle of a title, and a recipe written with "½" keeps its amount instead
  of losing it off the shopping list.
- Switching week on the shopping list can no longer leave the wrong week's
  items under the right week's heading.

## Build 14 – TestFlight 2026-08-03 (VALID, not in review)

Uploaded 17:06. Cut from the code as it stood at 15:39, so anything committed
after that is still in "Accumulating" above.

- **Move last week's leftovers to this week.** A past week's shopping list
  that still has unchecked items gets a "Move all items to this week"
  button. Items that were not bought move onto the current week instead of
  being re-added by hand, merging into anything already there rather than
  making a second line. Undo puts both weeks back.
- The shopping list checkbox sits level with the item name again, instead of
  drifting into the gap under it on rows with an amount.

## Build 13 – TestFlight 2026-08-03 (VALID, not in review)

**These are NOT in v1.0.** v1.0 was deliberately left bound to build 12
rather than disturb the review queue, so they need a 1.0.1 once v1.0 is
approved and released.

- An imported recipe is no longer lost when its photo cannot be fetched, and
  a save that fails now says so instead of failing quietly.
- "Try again" where loading could fail: the Recipes tab, recipe detail and
  the shopping week switch. Shopping also gained a loading spinner it never
  had, so switching week no longer looks like nothing happened.
- The household invite code is legible (it failed contrast before).

## Build 12 – TestFlight 2026-07-30, **submitted for App Store review 2026-07-31**

This is v1.0 – the version in review, and the only one the public will get
at launch.

- The Plan tab recovers from a failed load instead of sitting empty.
- The household switcher is obvious, and you can create a new household from
  it.
- Recipe import handles fraction ranges, dangling clauses and "1 cups".
- A recipe with no ingredients is no longer imported as an empty shell.
- Five small UI fixes across household, recipes and shopping.

---

## Server changes (live for everyone, no build needed)

- **2026-08-17 – the sign-in code email is bilingual.** The email carrying
  your sign-in code now says the same thing twice, English above Danish, in the
  app's own look rather than the stock template. **Live for everyone the moment
  it was saved, including v1.0's build 12** – it is a Supabase template, not
  app code, so no update is needed to receive it.
  Both templates were changed (a brand-new address and a returning one use
  different ones), on the dev project first and then production, each tested by
  sending a real code and reading it.
  **Why bilingual rather than following the app's language:** the code is
  requested BEFORE anyone is signed in, and there is one template per project,
  so the server cannot know which language the reader wants. Both is the only
  answer that serves a Danish reader without taking English from everyone else.

- **2026-08-07 – migration 0033.** Guessing an invite code is now genuinely
  limited: the app allows 30 join attempts an hour in total and refuses the
  rest. **Nothing changes for anyone using a code they were given.** The limit
  that was supposed to do this before turned out never to have worked at all –
  every failed guess undid its own record – so until today there was nothing
  stopping someone trying codes until one landed them in a stranger's
  household. **Live for everyone including v1.0's build 12.**
  If a join is ever refused with "Too many tries", waiting an hour clears it.

- **2026-08-07 – migration 0032.** Security hardening around joining and
  leaving a household. **Nothing changes on screen** – this closes two ways the
  app's own rules could be side-stepped by talking to the server directly
  instead of through the app: an account could be left in no household at all
  (skipping the recipe copy you are entitled to when you leave), and an invite
  code could be created that never expired. Leaving, deleting an account and
  creating an invite code now have exactly one route each.
  **Live for everyone including v1.0's build 12.** No user-facing line needed
  when this ships – there is nothing for a reader to notice, which is the point.

- **2026-08-04 – migration 0030.** Clearing the done
  items no longer stops the above from working: change a meal afterwards and
  what you still need shows up as usual. Before this it went quiet again.
  **Live for everyone including v1.0's build 12.**
- **2026-08-04 – migration 0029.** Change a meal
  after you have been through the list and anything you still need shows up as
  its own line, with just the extra amount on it – the things you already ticked
  off stay ticked off. Before this, nothing happened at all (and briefly, with
  0028 below, it asked for the whole amount again instead of the difference).
- **2026-08-04 – migration 0028.** Superseded by 0029 the same day. Raise a
  recipe's servings and the ticked-off ingredients came back with the new
  TOTAL, which overstates what is left to buy. **Live for everyone including
  v1.0's build 12** until 0029 runs.

- **2026-08-03 – migration 0027.** "1 liter milk" and "2 liters milk" become
  one line on the shopping list again, along with jars, containers and
  pinches. **Live for everyone including v1.0's build 12.** Applies to weeks
  planned from now on; a list that already shows an item twice keeps showing
  it twice until that week is rebuilt.
- **2026-08-03 – migration 0026.** Adds the move/undo functions the leftover
  move calls. Live, but unreachable until the app half ships, so no phone
  behaves differently yet.
- **2026-08-03 – migration 0025.** A shopping line can no longer be debited
  more than it was credited: checking an item off around a plan change used
  to leave its amount wrong. **Live for everyone including v1.0's build 12.**
