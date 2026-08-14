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

It kept happening in places I'd never had my hands on: the server, the release, the words on the screen. None of it was going to be caught by anyone but me.

And none of it got fixed by being more careful. Every time something went wrong between Claude and me, we wrote the correction into the files the work itself runs from, so neither of us had to remember it. The same mistakes stopped coming round twice. We got better together, which isn't something I expected to be able to say about working with a tool.

I didn't come out of this a developer, and I'm not after a new title. What I came out with is range: I can hold a whole product now – what it is, how it behaves, how it ships, how it reads, and how the work itself gets done – instead of only the part I could draw.

If you've been working this way too, I'd like to hear what it changed about your job.

---

~1,700 characters. Post it after the launch post, which its first line refers to.

## Corrections that shaped it – do not undo these

Each came from Thomas after a draft got it wrong. They are why the post reads
the way it does.

1. **He has ALWAYS known the job goes past Figma.** Earlier drafts had him
   *learning* that the product is bigger than the screen, which is condescending
   and false. What changed is **reach**, not understanding: work he always knew
   was his became work he could actually do. Every beat is an instance of
   reaching, never of discovering.
2. **The invented sheet components were NOT gaps he left.** All three existed in
   the design system; they were invented instead of looked up. This produced the
   post's most quotable line – the failure mode is *plausible*, not wrong – and
   it is the only anecdote left in the post. Never write this as
   under-specification.
3. **No durations anywhere.** He asked twice to downplay time (DS build, then
   app build – "a month tops"). A speed claim also invites the "shipped fast
   with AI" reading, which works against the quality argument.
4. **He does NOT want a name for the new role.** He wants to hear from people
   with the same experience. The close states what he can now do and asks what
   changed for others – it must not turn into a hunt for a job title.
5. **Cut for pace, at his call (final round).** The post was boring in the
   middle and over-informative at the end. Three deletions:
   - **The two middle anecdotes** (the plan screen dying on every phone, and the
     app using two words for the same thing) became one line naming the
     territory: *the server, the release, the words on the screen*. Two
     incidents in a row ran the same shape, so the second taught the reader
     nothing structurally.
   - **The list of written rules** went. That section must be about **getting
     better together**, not about what the rules say.
   - **The closing** must focus on **what he has become** – range, holding a
     whole product – not on what the work did to him.
6. **The synthetic panel is no longer in the post at all**, which was the
   cleanest way to lose the detail he didn't want. Its round-one caveat now
   lives where it actually matters: `CLAUDE.md` in the panel project.

Two things dropped in that final pass, recoverable if ever wanted: the panel
(one clause), and the line *"Designer" doesn't quite cover that anymore* (it
would sit at the end of the range sentence). Both were his own material, not
padding.

## What earlier drafts got wrong, so it isn't repeated

- **"Lenses" as an organising idea.** Worked as scaffolding, but appeared in
  later drafts as a term the reader had never been given. Cut entirely.
- **"Between us" with no antecedent.** Claude is named once, early, so the later
  "we" has something to refer to.
- **A flat "Things went wrong" opener.** It announced a confession and didn't
  connect to the sentence after it.
- **Leading with the panel finding.** Rejected: you don't open with the result
  of your least rigorous round.
- **Patching prose instead of re-reading whole drafts.** How the two defects
  above got in – setup sentences were casualties of compression nobody re-read.

## Open

- **Whether round one's brief was written before or after the responses.** The
  first-run study (`studies/2026-08-08-prepeat-first-run/`) DOES have a brief,
  a thorough one, and `protocol/running-a-session.md` §2 already requires one –
  so the rule Thomas asked to add already existed and was not added. Git cannot
  settle the ordering: the whole panel arrived in one commit on 2026-08-10, two
  days after that study ran. Nothing in the post now depends on the answer.

## The third post, if wanted

The synthetic user panel: a research instrument built with AI and pointed at his
own work, five studies, twenty-four sessions, findings that renamed the
product's core vocabulary. Now absent from this post entirely, so there is a
clean run at it, with the round-one caveat handled honestly.
