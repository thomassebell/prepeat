# LinkedIn launch post

*Written 2026-08-14, the day after Prep+Eat 1.0 went live on the App Store.*

The public version of [lessons-from-building-prepeat.md](lessons-from-building-prepeat.md).
That doc is the private keepsake – the honest post-mortem, including the two
root causes of rework. This is the story told outward: what the app is, and
what the working method between Thomas and Claude actually was.

Two things it is promoting at once, deliberately: **the app**, and **product
design done as a human+AI collaboration**. Angle settled after three drafts –
not a chronology of what got built, but how design and code improved each
other. Plain text, no markdown, because LinkedIn strips formatting.

**The build order is the spine of the post and was corrected by Thomas
mid-draft:** the Sebell DS came first and the app second – see
[the DS repo's first commit](../../Sebell%20Design%20System/design-system),
2026-04-13, against this repo's 2026-06-11. Do not reverse it, and do not put
a duration on the DS work; Thomas asked for that downplayed.

---

## The post

I'm a designer. I don't write code. I just put an app on the App Store.

Prep+Eat is a meal planner for families: your recipes, a weekly plan, and a shopping list that builds itself and stays in sync with everyone else in the kitchen. It was built as a collaboration with AI – and so was the design system underneath it. The app was the second of the two, and getting that order right is most of what I have to say.

The system came first, made the same way: me designing, AI building. And it isn't a Figma library. It's a bridge between design work and running code – colour, type, spacing and components defined once, generated out of the design file and pulled straight into the codebase, so the two can't quietly drift apart. For a while there was no product to point it at. It looked like procrastination. It was the opposite.

Because when the app started, the system wasn't a reference anyone had to consult. It was the language both sides already spoke. Nobody typed a hex. And when the design file and the code disagreed about a colour, that disagreement meant something specific: something had gone out of sync. Diagnostic, not a matter of taste.

Then the app did something I hadn't expected. It became the instrument that tests the system. You can't tell whether a design system is any good by looking at it. You find out when a real product leans on it and something doesn't hold.

The same reversal kept happening one level down, at the screen.

Early on the loop was: I describe a screen, get back something close enough, spend the next round correcting it. Close enough is the enemy. An approximation of your design hides the flaws in the real one, so you end up reviewing the implementation instead of the idea.

What fixed it was treating a design as a contract rather than a picture. A screen isn't just a layout. It's the layout and every state it can be in: default, pressed, error, disabled, empty. Nothing counted as built until all of those existed – and some of them were states I had never actually drawn. The build kept asking questions my design hadn't answered, and the product got more honest each time it did.

One rule held it together: never quietly fill a gap. If something wasn't specified, say so and flag the improvisation rather than inventing it and letting it read as my work. Otherwise I'd be reviewing decisions I didn't know had been made, in an app I thought I had designed.

Design gets better when it's built precisely, because only then can you see what's genuinely wrong with it. Code gets better when it's allowed to push back instead of guess. That's the collaboration – not a designer handing off, and not an AI filling in the blanks.

The system came first. The product is what tests it. Neither is much good alone.

Prep+Eat is free on the App Store. [link]

---

## Before posting

- **Replace `[link]`** with the App Store URL.
- **Consider flagging EU-only.** v1.0 ships to EU-27 only, so most non-EU
  readers cannot open the link – "(EU for now)" saves them the dead end.
- ~2,800 characters, so most of it sits behind LinkedIn's "see more" fold.
  **The opening was rebuilt for that fold on 2026-08-14** (Thomas's call, after
  a cold reader filed the old first line as promo). *"I'm a designer. I don't
  write code"* is the most clickable sentence in the post and was sitting in
  line 3, behind an App Store announcement. It now opens, in 71 characters, so
  the whole hook survives the mobile truncation at ~140.
  **The announcement did not get cut, it moved** – Prep+Eat and what it does
  are the next sentence, and the link still closes. Both things the post
  promotes are intact; only the order changed.

## Sourced claims, if anyone asks

Every specific in the post is in the project record, not invented:

- **Tokens generated from the design file into the codebase** –
  [the token bridge](../CLAUDE.md), `npm run sync-ds-tokens` → `ds-theme.cjs`.
- **A design-file/code disagreement means the sync was missed** – project
  CLAUDE.md states this as a rule, and it is why the post calls it diagnostic.
- **The app is the DS's testbed** – project CLAUDE.md, verbatim.
- **Every state is part of the design; flag improvisations, never fill gaps
  quietly** – global CLAUDE.md, promoted there 2026-08-02 from this project.
- **States that were never drawn** – real improvisations were flagged on the
  backlog rather than counted, so the post says "some", never a number.

## Deliberately left out

The [lessons doc](lessons-from-building-prepeat.md)'s two root causes –
building an approximation, and not knowing what was live – plus the Plan tab
outage, the two live privacy policies, and the synthetic-user-panel round that
renamed household to kitchen. All good material, all cut to keep the post on
one idea. They are the obvious source for a follow-up post.

The [follow-up](linkedin-followup-post.md) has since taken two of them: the
approximation root cause (the invented sheet components) and the Plan tab
outage. Still unused: the two live privacy policies, the missing data
processor, and the synthetic-user-panel round – the last of which is the
candidate for a third post.
