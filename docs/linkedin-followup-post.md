# LinkedIn follow-up post – the second half of the story

*Final, 2026-08-14. Follows [the launch post](linkedin-launch-post.md).*

## The brief

Written after four drafts drifted, which is what happens without one.

- **Why:** the launch post did the announcing. This one positions Thomas as
  someone with a working method for building products with AI, and it holds up
  because it is specific and self-critical where most posts on this subject are
  neither.
- **Primary reader:** product people, broadly (Thomas, 2026-08-14).
- **Topic:** how working this way changed what his practice covers. **NOT
  "what went wrong"** – that framing pulled three drafts into a confessional.
  Mistakes are the evidence, not the subject, and each earns its place only by
  showing the reach changing.
- **Message:** he could always see the whole product; what changed is that he
  can now reach all of it himself, and it is better and more robust for it.
- **Filter for any paragraph:** does this show the reach changing? The privacy
  policy beat and an abstract paragraph about the loop both died to this.

## The post

Last week I wrote about what worked while building Prep+Eat, a meal planner for families. This is the other half.

I've always known the job goes well past Figma. What changed is that I could finally reach the rest of it myself – and every mistake I made was somewhere in that new reach.

Early on, a set of sheets came back with a switch, a header and a row style that were never mine. Not gaps I'd left: all three already existed in my design system. They'd been invented instead of looked up, and they were plausible enough that I didn't catch them for a while.

That's the failure mode worth knowing about, and it isn't the one people warn you about. It doesn't come back wrong, it comes back plausible. Wrong you spot in a second. Plausible sits in your product for a week, looking like something you decided.

Then the plan screen hung on every phone in the family: a change on the server had removed something the already-installed app still needed. Both halves were finished, they just weren't the same version. That a live system and whatever build sits on someone's phone move at different speeds was never news to me. The difference now is that it's mine to decide rather than mine to be told about afterwards.

Later I ran my first screens past a panel of AI personas I'd built. I treat that first round as directional at best – it ran before I'd settled the rules I now hold these studies to, and nothing from it should be quoted as a finding. What it did do was send me back to read my own screens, and that was enough. The app used two different words for the same thing: one error said it couldn't reach your kitchen, directly above another saying it couldn't load your household. Nothing was broken. Every state was built. It just didn't mean anything to someone arriving cold.

The part I'd hand to anyone working this way is duller than it sounds. Every time something went wrong between Claude and me, we wrote the correction into the instruction files the work itself runs from. Fetch the real spec before building, and never improvise a component that already exists. Say when something is missing instead of quietly filling it. Check what's actually live before deciding something is broken.

Those files are read at the start of every session, by both of us, so nobody has to remember anything. A mistake got made once and then became a rule. And designing how the two of us work turned out to be the genuinely new part. It didn't exist in the old arrangement at all.

None of this made me a developer. It took execution out of the way, and once execution isn't the limit, the limit becomes how much of the product you can hold in your head at once. "Designer" doesn't quite cover that anymore.

I'm not looking for a new title. I'm curious whether this is happening to other people too – if you've been working this way, I'd like to hear what it changed about your job.

---

~2,450 characters. Post it after the launch post, which its first line refers to.

## Corrections that shaped it – do not undo these

Each of these came from Thomas after a draft got it wrong. They are the reason
the post reads the way it does.

1. **He has ALWAYS known the job goes past Figma.** Earlier drafts had him
   *learning* that the product is bigger than the screen, which is condescending
   and false. What changed is **reach**, not understanding: work he always knew
   was his became work he could actually do. Every beat is an instance of
   reaching, never of discovering.
2. **The invented sheet components were NOT gaps he left.** All three existed in
   the design system; they were invented instead of looked up. This produced the
   post's most quotable line – the failure mode is *plausible*, not wrong – and
   it ties beat one to the rules at the end. Never write this as
   under-specification.
3. **No durations anywhere.** He asked twice to downplay time (DS build, then
   app build – "a month tops"). A speed claim also invites the "shipped fast
   with AI" reading, which works against the quality argument.
4. **He does NOT want a name for the new role.** He wants to hear from people
   with the same experience. The close states the observation once and asks what
   changed for others – it must not turn into a hunt for a job title.
5. **Round one of the panel is directional, not data.** Never quote its result
   as a finding. The wording rests on his own account of that round, not on
   anything provable from the repo – see the open question below.

## What earlier drafts got wrong, so it isn't repeated

- **"Lenses" as an organising idea.** Worked as scaffolding, but appeared in
  later drafts as a term the reader had never been given. Cut entirely.
- **"Between us" with no antecedent.** Claude is now named once, early, so the
  later "we" and "the two of us" have something to refer to.
- **A flat "Things went wrong" opener.** It announced a confession and didn't
  connect to the sentence after it.
- **Leading with the panel finding.** Rejected: you don't open with the result
  of your least rigorous round.
- **Patching prose instead of re-reading whole drafts.** How defects 1 and 2
  above got in – setup sentences were casualties of compression nobody re-read.

## Open

- **Whether round one's brief was written before or after the responses.** The
  first-run study (`studies/2026-08-08-prepeat-first-run/`) DOES have a brief,
  a thorough one, and `protocol/running-a-session.md` §2 already requires one –
  so the rule Thomas asked to add already exists and was not added. Git cannot
  settle the ordering: the whole panel arrived in one commit on 2026-08-10, two
  days after that study ran.
- **The panel project has no `CLAUDE.md`**, so none of its protocol is loaded at
  the start of a session – it is only read if something points at it. Every
  other repo in this family has one. That is the exact mechanism this post
  celebrates, missing from the project the post uses as its example.

## The third post, if wanted

The synthetic user panel: a research instrument built with AI and pointed at his
own work, five studies, twenty-four sessions, findings that renamed the
product's core vocabulary. Compressed to one paragraph here; enough for a post
of its own, with the round-one caveat handled honestly.
