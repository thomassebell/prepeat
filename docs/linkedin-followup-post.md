# LinkedIn follow-up post – what went wrong

*Written 2026-08-14, alongside [the launch post](linkedin-launch-post.md).*

The second of two. The launch post is about the method working; this one is
the honest counterweight, and Thomas's steer is what makes it more than a
mea culpa:

- **The spine is lenses, not errors.** The work between Thomas and Claude made
  him see the product through lenses he hadn't been using. Every mishap ended
  up expanding his UX practice rather than just costing a round.
- **The engine is the loop** – think, build, test, learn, go back in. Not a
  handoff. Early drafts stated a tidy lesson ("a design is a contract"); Thomas
  corrected that: the loop getting cheap enough to run many times is the point.
- **Vulnerability is the strength.** The admissions stay unhedged on purpose.
- **The instruction files are the LAST LENS, pointed at the collaboration**
  rather than at the product (Thomas, 2026-08-14: *"why is the instruction
  files not a lens?"* – an earlier draft had them as a mere habit sitting
  underneath the lenses, which undersold them). They are the only lens that
  makes the others permanent, and they carry the post's biggest claim: he ended
  up designing the collaboration, not only the app. **Do not demote this back
  to a habit.** In version one it comes AFTER the four-lens summary, so the
  summary covers the product lenses and this one turns the camera around.

Sources: [lessons-from-building-prepeat.md](lessons-from-building-prepeat.md)
for the two root causes, [release-notes.md](release-notes.md) for the panel
round, and the rules that were written into the CLAUDE.md files as each
incident happened.

**The panel was SYNTHETIC, not real users** (Thomas, 2026-08-14) – AI personas,
from the Synthetic User Panel he built at
`~/Documents/Claude/Projects/Synthetic User Panel`, and running it was an
experiment in its own right on top of building the app. The post names that
limitation itself rather than letting a reader find it.

---

## Version one – the full cut

Four beats. ~3,700 characters.

Last week I wrote about what worked while building Prep+Eat. This is the other half – and it turned out to be the half that made me better at my actual job.

Things went wrong. Not dramatically, but repeatedly. What I didn't see until afterwards is that they weren't separate mistakes. Each one handed me a lens I hadn't been using to look at my own product.

The first came from the loop itself.

Early on I'd describe a screen, get something close enough back, and spend the next round correcting it. What replaced that was a much tighter cycle: think, build, try it on the phone, learn what the design hadn't answered, go straight back in. Not a handoff. A loop, run over and over.

That loop is the whole thing. Working this way made it cheap enough to actually run, and a cycle you can go round ten times teaches you what one you go round twice never will. Every pass, the build asked a question my design hadn't answered. What does this look like while it's loading. When it fails. When there's nothing here yet. Those weren't oversights I'd have caught by staring at the file longer – they only surface when something real is in your hand and you're already thinking about the next turn.

Then the Plan tab spun forever on every phone we had. A change on the server had removed something the app already in our hands still needed. Both halves were finished. They just weren't the same version.

I could have filed that under someone else's problem. It isn't. What a person experiences is the live system plus whatever version is on their phone, and the two move at different speeds. I now ask what someone still on last month's build sees, and that question alone has changed what I ask for.

Then I found a privacy policy of mine live on the internet, out of date, next to a newer one. A product isn't only its screens. It's the email that arrives, the page someone reads before downloading, the words in the listing. All of it is the experience, and I'd been treating some of it as paperwork.

And the one I think about most came out of something I built on the side: a synthetic user panel. AI personas reading my screens with no context, in studies run against the first-run flow. That was an experiment in its own right, sitting on top of building the app – I wanted to know whether a panel like that could tell me anything real.

It could. Seven readers out of seven could not say what a "household" was in my app. They aren't real users and I wouldn't pretend otherwise, but you don't need a real user to notice that a word means nothing. Nothing was broken. Every state built, every colour correct. It just didn't mean anything to someone arriving cold. Language is the interface, and I'd been designing everything except the words.

None of those is really a mistake in the ordinary sense. Each added a lens. The build's, which asks what the design hasn't answered. The release's, which asks what someone on an older version sees. The whole product's, which counts the email and the listing as experience. And the cold reader's – a lens I had to build before I could look through it.

The last lens points the other way.

Every time something went wrong between us, we wrote the correction into the instruction files the work itself runs on. Fetch the real spec before building. Never quietly fill a gap. Check what's actually live before deciding something is missing.

The other lenses show me the product. This one shows me how we work – and it's the one that makes the rest hold, because nobody has to remember any of it. The files are read at the start of every session, by both of us. A mistake got made once and then became a rule. Somewhere in there I stopped only designing the app and started designing the collaboration too.

That's what working this way did. It didn't make me a developer. It took execution out of the way, and once execution isn't the limit, the limit becomes how much of the system you genuinely see. Design, frontend, backend, architecture: I'm not doing all of those. But the distance between them got much shorter, and the product is better on every count for it.

I'd rather write this post than the one where everything went smoothly. That one wouldn't have taught me anything.

---

## Version two – the two shipping beats cut

Thomas judged both the Plan tab beat and the privacy-policy beat weak (they
make the same move, and the second makes it less viscerally). Both are gone
here, leaving the loop, the panel, and the habit that turned mistakes into
rules. ~2,600 characters, matching the launch post.

Not a straight deletion: with two lenses instead of four, the closing summary
paragraph became redundant, so each lens is now introduced where it happens.

Last week I wrote about what worked while building Prep+Eat. This is the other half – and it turned out to be the half that made me better at my actual job.

Things went wrong. Not dramatically, but repeatedly. What I didn't see until afterwards is that they weren't separate mistakes. Each one handed me a lens I hadn't been using to look at my own product.

The first came from the loop itself.

Early on I'd describe a screen, get something close enough back, and spend the next round correcting it. What replaced that was a much tighter cycle: think, build, try it on the phone, learn what the design hadn't answered, go straight back in. Not a handoff. A loop, run over and over.

That loop is the whole thing. Working this way made it cheap enough to actually run, and a cycle you can go round ten times teaches you what one you go round twice never will. Every pass, the build asked a question my design hadn't answered. What does this look like while it's loading. When it fails. When there's nothing here yet. Those weren't oversights I'd have caught by staring at the file longer – they only surface when something real is in your hand and you're already thinking about the next turn.

The second lens I had to build before I could look through it.

Late on I made a synthetic user panel: AI personas reading my screens with no context, in studies run against the first-run flow. That was an experiment in its own right, sitting on top of building the app – I wanted to know whether a panel like that could tell me anything real.

It could. Seven readers out of seven could not say what a "household" was in my app. They aren't real users and I wouldn't pretend otherwise, but you don't need a real user to notice that a word means nothing. Nothing was broken. Every state built, every colour correct. It just didn't mean anything to someone arriving cold. Language is the interface, and I'd been designing everything except the words.

The last lens points the other way.

Every time something went wrong between us, we wrote the correction into the instruction files the work itself runs on. Fetch the real spec before building. Never quietly fill a gap. Check what's actually live before deciding something is missing.

The other lenses show me the product. This one shows me how we work – and it's the one that makes the rest hold, because nobody has to remember any of it. The files are read at the start of every session, by both of us. A mistake got made once and then became a rule. Somewhere in there I stopped only designing the app and started designing the collaboration too.

That's what working this way did. It didn't make me a developer. It took execution out of the way, and once execution isn't the limit, the limit becomes how much of the system you genuinely see. Design, frontend, backend, architecture: I'm not doing all of those. But the distance between them got much shorter, and the product is better on every count for it.

I'd rather write this post than the one where everything went smoothly. That one wouldn't have taught me anything.

---

## Before posting

- **~3,700 characters**, noticeably longer than the launch post's 2,600. It
  reads, but it asks more of the scroll.
- **Post it after the launch post**, which it opens by referring to.
- No link needed – this one isn't an announcement.

## Considered and rejected

- **Which version to post.** Both are kept above rather than one being deleted.
  Version two is tighter and every beat in it earns its place; version one
  covers more ground and is the only one that shows the release lens – the
  beat that reaches furthest outside design, and so the one that evidences the
  closing claim about the distance between disciplines closing. In version two
  that line is asserted rather than shown. That is the trade, and it is the
  only real argument for version one.
- **Naming Claude explicitly.** The post says "AI" and "we" throughout. Thomas
  says "Claude and I" in conversation, so naming it is available if a later
  draft wants the concreteness.
- **Cutting the panel's "they aren't real users" line.** Keep it. Synthetic
  research attracts sceptics and naming the limit first is what makes the beat
  unattackable.

## The third post, if wanted

The synthetic user panel is its own story and got compressed into two
paragraphs here: a research instrument built with AI and pointed at his own
work, five studies, and findings that renamed the product's core vocabulary
(household → kitchen). Enough material for a standalone post rather than a
beat inside this one.
