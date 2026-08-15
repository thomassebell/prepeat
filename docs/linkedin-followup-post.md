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

Working with AI, the failure mode nobody warns you about isn't that the work comes back wrong. It's that it comes back plausible.

Wrong you spot in a second. Plausible sits in your product for a week, looking like something you decided.

Last week I wrote about what worked while building Prep+Eat, a meal planner for families. This is the other half.

I've always known the job goes well past Figma. What changed is that I could finally reach the rest of it myself – and every mistake I made was somewhere in that new reach.

Early on, a set of sheets came back with a switch, a header and a row style that were never mine. Not gaps I'd left: all three already existed in my design system. They'd been invented instead of looked up, and they were plausible enough that I didn't catch them for a while.

Then it happened again, further out. Claude deleted something from the database that the app hadn't used in weeks – housekeeping, and correct for the version I was building. Within the hour the plan screen was dead on every phone, in the version people already had. Those are two different products, and only one of them was talking to my server.

I ran the repair myself, the same day: no new build, nobody updating anything. Breaking everyone at once and repairing everyone at once turn out to be the same lever, and it was mine to pull either way. Then we rebuilt the setup so it can't reach anyone that way again – there's a full copy of everything to break first now, and nothing goes live until it's survived there.

The release and the words on the screen are the same story. None of it was going to be caught by anyone but me.

And none of it got fixed by being more careful. Every time something went wrong between Claude and me, we wrote the correction into the files the work itself runs from, so neither of us had to remember it. The same mistakes stopped coming round twice. We got better together, which isn't something I expected to be able to say about working with a tool.

I didn't come out of this a developer. I came out with range.

I can hold a whole product now: what it is, how it behaves, how it ships, how it reads, and how the work itself gets done. Not just the part I could draw.

That sounds like doing more jobs. It isn't. Every one of those was always part of designing the thing – they were just on the other side of a handover, where they became someone else's decision and came back to me as a constraint. Take the handover out and they're one thought again. A change to the wording, a change to what the app stores, and a decision about who gets it and when stop being three separate conversations.

What limits me now isn't what I can make. It's how much of the product I can hold in my head at once. That's a harder limit than the old one, and a better one.

"Designer" doesn't quite cover that anymore.

If you've been working this way too, I'd like to hear what it changed about your job.

---

~2,950 characters – close to LinkedIn's 3,000 limit, so anything added from
here has to trade against something already in. Post it after the launch post,
which the third paragraph refers to.

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
4. **"Designer" no longer covering it IS the big learning** (Thomas, 2026-08-14,
   restoring the line after a cut removed it). It must be in the post, it comes
   **after** the range sentence, and it stands **completely bare** – on its own
   line, with nothing before or after it in the paragraph.
   **Do not append a disclaimer to it.** Two were tried and both came off: *"I'm
   not looking for a new word for it"* (Thomas: already implied by the line
   itself) and *"that's the biggest thing I've taken from building this"*
   (telling the reader it matters is weaker than letting it sit). He does not
   want a name for the role – but the line says that on its own, and every hedge
   added to it takes weight off it.
5. **RANGE IS THE POINT OF THE POST** (Thomas, 2026-08-14: *"this is great and
   the reason for the post"*, asking for it to be elaborated). Four paragraphs
   at the end carry it, and they are the last thing to cut, not the first:
   - **What range means** – holding what a product is, how it behaves, how it
     ships, how it reads, and how the work gets done.
   - **What it is NOT** – doing more jobs. Those parts were always part of
     designing the thing; they sat on the far side of a handover, where they
     became someone else's decision and returned as a constraint. Product
     people will otherwise read "range" as "he's full-stack now", which is
     exactly the misreading correction 1 exists to prevent.
   - **What it costs** – the limit stops being what he can make and becomes how
     much of the product he can hold in his head. Harder, and better.
6. **Cut for pace, at his call.** The post was boring in the middle and
   over-informative at the end. Three deletions:
   - **The two middle anecdotes** (the plan screen dying on every phone, and the
     app using two words for the same thing) became one line naming the
     territory: *the server, the release, the words on the screen*. Two
     incidents in a row ran the same shape, so the second taught the reader
     nothing structurally.
     **The plan-screen half of this was reversed the same day – see correction
     8.** Cutting it was right for pace and wrong for evidence: it took out the
     post's only example from the new reach. The word-for-the-same-thing
     anecdote stays cut.
   - **The list of written rules** went. That section must be about **getting
     better together**, not about what the rules say.
   - **The closing** must focus on **what he has become** – range, holding a
     whole product – not on what the work did to him.
7. **The synthetic panel is no longer in the post at all**, which was the
   cleanest way to lose the detail he didn't want. Its round-one caveat now
   lives where it actually matters: `CLAUDE.md` in the panel project.
8. **The plan-tab outage is back, as the post's second anecdote** (2026-08-14,
   after two independent reads – one with the project background, one cold –
   both landed on the same defect). The post's claim is that *every mistake was
   somewhere in that new reach*, and the only evidence left was the invented
   sheets: a design-system miss, on the turf Thomas could always reach. The
   outage is the server, which he could not. Four things about how it is
   written, all load-bearing:
   - **THOMAS DID NOT MAKE THE DELETION** (his correction, on the first draft of
     this paragraph, which had him say *"I deleted something from the
     database"*). Migration 0022 dropped `meal_plans.pushed_to_list_at` on
     recorded reasoning that was Claude's, not his. Never rewrite this as his
     act; it would be the only first-person piece of engineering in either post.
     **The fix is to NAME Claude, not to go passive** – see correction 10. The
     first attempt matched the sheets anecdote's grammar (*a change went out*)
     and that failed: the paragraph above it says *every mistake I made*, so an
     agentless sentence still lands on Thomas, and loses the real story on the
     way.
   - **The repair IS his**, and that is what makes it a reach beat rather than a
     confession: he ran migration 0023 himself the same day (see the decisions
     log, 2026-07-27) and it fixed every phone with no build and no Apple.
   - **The database rebuild is his addition** (Thomas, 2026-08-14: *"we set up a
     new DB structure where we can get the bugs before it reaches production"*)
     – the three environments of 2026-08-04. It is one clause, not a paragraph,
     and it is deliberately non-technical: naming dev/local/production would
     turn a post for product people into a post for engineers. It also gives
     the paragraph after it ("none of it got fixed by being more careful") the
     concrete antecedent it never had.
   - **It is the SAME failure mode as the sheets, escalated** – which is what
     correction 6 missed when it cut this for running "the same shape". Deleting
     data the app has not touched in weeks is housekeeping, and it was correct
     for the version being built: a plausible act, not a wrong one. So the two
     anecdotes are one idea at two blast radii – something nobody catches for a
     week, then production down in an hour. It also carries a distinction that
     does not exist in design work at all: the thing you are building and the
     thing people are holding are two products, and only one is talking to the
     server.
   **"Within the hour" is a deliberate exception to correction 3.** That rule
   bans durations because a speed claim invites the "shipped fast with AI"
   reading; this one measures blast radius, not productivity, and it is the
   sentence's whole force. The territory line lost *the server* to avoid saying
   twice what the anecdote now shows.
9. **The post opens on the plausible line now** (2026-08-14, Thomas's call,
   from the same cold read as correction 8 – both posts warmed up, and their
   two scroll-stopping sentences sat in the middle). LinkedIn truncates at
   roughly 140 characters on mobile; the old opening spent all of it on
   housekeeping (*"Last week I wrote… this is the other half"*), so nothing a
   scroller saw gave them a reason to open it.
   - **The old fourth paragraph was PROMOTED, not written fresh.** *"That's the
     failure mode worth knowing about…"* is now the first two paragraphs, so
     **do not restore it in the middle** – the sheets anecdote is deliberately
     left to pay it off from below, ending on *plausible enough that I didn't
     catch them for a while*.
   - **The callback moved to third**, unchanged. It still has to precede the
     Figma line, which assumes the reader knows this is a sequel.
   - **"Working with AI" opens the post for two reasons**: it tells a scroller
     what the subject is, which a bare aphorism does not, and it puts the
     collaborator on stage before the passive *comes back* – the antecedent
     defect that earlier drafts kept reintroducing (see below).
   The hook is 130 characters, so it clears the fold whole. Post 1 got the same
   treatment the same day and its note records it.
10. **Claude is named as the one who deleted it, and the ownership lands in the
    next breath** (2026-08-14, from a cold read, after Thomas corrected the
    reader's own first note: *"the fact was that Claude deleted something and
    the system broke"*). Three parts, and the paragraph fails if any one goes:
    - **Name the act.** *Claude deleted something from the database.* Passive
      was tried first and quietly reassigned it to Thomas – see correction 8.
    - **Say why it was reasonable.** *Housekeeping, and correct for the version
      I was building.* This is what makes it the plausible failure mode rather
      than carelessness, and it is what links the anecdote to the opening.
    - **THE LEVER LINE IS THE OWNERSHIP, AND IT IS NOT OPTIONAL.** *Breaking
      everyone at once and repairing everyone at once turn out to be the same
      lever, and it was mine to pull either way.* It was cut once for length and
      that was wrong: naming Claude reads as blame-shifting unless ownership
      arrives immediately, and this is the only sentence in either post that
      says what the new reach actually feels like – not his hand on it, still
      his lever, still his repair, still nobody else to notice.
    Sequence to preserve: **Claude did it, he owned it, he fixed it within the
    hour, then they rebuilt it so it cannot happen.** The first beat was missing
    for one draft and the other three did not hold without it.
    The territory line stopped claiming a pattern it only shows twice – *it kept
    happening in places I'd never had my hands on* became *the release and the
    words on the screen are the same story*. Those two still have no example;
    that is the post's remaining soft spot and it is accepted, not overlooked.
    **The sheets anecdote deliberately does NOT name Claude**, because *"a switch,
    a header and a row style that were never mine"* already disowns the
    authorship. Only the outage needs the name, because only there does the
    reader otherwise default to Thomas.

One thing is still dropped and recoverable if ever wanted: the panel, which
costs a clause. The other casualty of that pass, *"Designer" doesn't quite
cover that anymore*, was restored the same day – see correction 4. Cutting it
took the post's biggest learning out with the padding, which is the risk every
time this file gets shortened.

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
