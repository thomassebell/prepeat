# Prep+Eat backlog

The working to-do list for the project. Scope and decisions live in
[projektgrundlag.md](projektgrundlag.md) – this file is about what happens
next and in which order. Items graduate upward as we commit to them – Someday
→ Next → Now – and end in Record rather than being deleted.

## ⚠️ HOW THIS FILE IS STRUCTURED (agreed 2026-08-11)

**THERE ARE EXACTLY FIVE TOP-LEVEL SECTIONS AND THE LIST IS CLOSED.** They are
milestones – *when*, and nothing else:

| Section | What belongs in it |
|---|---|
| **Now** | Only what the App Store release is waiting on. |
| **Next** | Committed for v1.1. Panel findings default here. |
| **Someday** | Wanted, unscheduled, or waiting for a trigger. |
| **Standing** | Chores with a trigger instead of a finish line. |
| **Record** | Not work – closed items and the decisions log. |

**Adding a sixth needs a decisions-log entry, not a judgement call.** Anything
that feels like it needs a new section is almost certainly a `Kind:` or a
`Source:`, and those are fields.

**WHY ONE AXIS** (Thomas, 2026-08-11: *"make a structure… so we don't just make
up new categories"*). The old structure had eleven sections built on FOUR
different questions at once – when (*Later v1.1*), what kind (*Known bugs*,
*Code debts*), how committed (*Ideas*, *Conditional*) and where it came from
(*Panel round 1*, *round 2*). That is why new headings kept appearing: a second
panel study arrived, no section fitted, so it got its own. Any structure built
on more than one axis does that forever.

This follows standard backlog practice rather than taste: one ordered list,
milestones as the only structural division (they are mutually exclusive –
something is before launch or after it, never both), and every other attribute
carried as a field you filter on. `npm run backlog:view` is the filter.

Groups from the old structure survive as `###` subsections – they carry
caveats that apply to a whole set, especially the panel rounds, and separating
a finding from its ceiling and mode loses the confidence bound.

### How to write an item

**The first line is the job, in plain words, and Thomas can stop reading
there.** Everything under it is indented and labelled, so the eye knows it is
optional. One rule, because this file serves two readers with one format:
Claude needs the reasoning, Thomas needs to recognise a task.

```
- [ ] **Let people put a plain meal on the plan without a recipe**
      Why: the store page promises this and the app never shows it.
      Left: …          ← what remains, when some of it has landed
      Blocked by: …    ← a design gap, a hosting move, a decision
      Size: …          ← only when it is genuinely known
```

**The labels are a SHORT LIST, and `Note:` is the escape hatch** – reach for it
rather than inventing a twelfth label, which is how the section sprawl started.

| Label | Use |
|---|---|
| `Why:` | Almost always. What breaks or improves for a real person. |
| `Left:` | What remains, when part of it has landed. |
| `Blocked by:` | What must happen first. |
| `Needs:` | Parked on Thomas – feeds the "Waiting on you" index above. |
| `Wait for:` | An external event: an approval, a build, a threshold. |
| `Decide first:` | A choice that must be settled before building. |
| `Source:` | Where it came from – a panel finding, an audit, a date. |
| `Size:` | Only when genuinely known. Never a guess dressed up. |
| `Note:` | Anything else. Deliberately open, so the list can stay closed. |

No label should carry an argument the first line already made. Reformatted on
2026-08-11 after Thomas: *"I need to recognize a task."* The reasoning was
never the problem; leading with it was.

**⚠️ CLOSING IS A SEPARATE JOB FROM DOING, and it does not happen by itself**
(agreed 2026-08-11, Thomas: *"we need to be better at getting items closed.
Otherwise we will drown in unfinished work"*). Two items had been finished for
days that morning – one for a week. Three mechanisms, because willpower is not
one:

- **`Needs: Thomas – <what>` marks anything parked on him**, and the scan view
  pulls those to the top under "Waiting on you". Work waiting on a decision
  reads as in-progress otherwise, which is exactly how the ingredient-sections
  item sat open on a design verdict nobody could see.
- **Sweep after every TestFlight build.** Release notes are written per build,
  so that is the one moment what-shipped exists in writing – walk the open
  items against them and close what landed. Under Recurring.
- **A detector was TRIED AND DOES NOT WORK, so do not build it again.** Both
  stale items said what was left; one pointed at a bug since fixed, the other
  at scraps awaiting a verdict. No text-matching finds that. The signal is
  human.

**⚠️ A FIX THAT NAMES WHAT IT CLOSES HAS TO GO AND CLOSE IT.** Both directions
of this have now cost real time: a bug entry proposing a fix went on asking for
a decision made three days earlier (the duplicate-ingredients item), and a fix
that stated in its own words which item it unblocked left that item open for a
week (the leftover move, closed 2026-08-11). Cross-references decay unless the
edit that makes one true is the same edit that follows it.

`npm run backlog:view` renders the open items as a scannable page, and rewrites
the index below.

<!-- WAITING-ON-THOMAS:START – generated by scripts/backlog-view.mjs, do not edit by hand -->

## ⏸ Waiting on you (10)

Nothing moves on these until Thomas decides or draws something.
Everything else in this file is Claude's to get on with.

- **Add Sign in with Apple on iOS** – a frame placing the Apple button on the welcome screen.
  <sub>Next – v1.1</sub>
- **Let the household teach the app that two ingredient names mean the same thing** – design the "same as…" action, and settle whether an alias is one-directional.
  <sub>Next – v1.1</sub>
- **Drag a meal to another day on the Plan screen** – the drag states (lifted card, drop highlight), and a yes/no on promoting it.
  <sub>Next – v1.1</sub>
- **Drag a shopping item into another category** – the item-drag states, and which regions are valid drop targets.
  <sub>Next – v1.1</sub>
- **⭐ Share a recipe with someone – FIRST ITEM IN v1.1** – how much of a recipe a stranger sees before installing.
  <sub>Next – v1.1</sub>
- `2.27` **Decide whether Kitchen should be a tab at all** – a navigation call, not a wording one.
  <sub>Next – v1.1</sub>
- `2.21` **⚠️ BRAND-LEVEL: decide whether "Prep" is costing us readers** – a brand call, on one reader's evidence.
  <sub>Next – v1.1</sub>
- **Stop the screen dimming while you cook from a recipe** – whole recipe or a cook mode, steps or everything, visible or silent.
  <sub>Someday – not committed</sub>
- **Let people leave a kitchen from the switcher** – a frame for the leave affordance, and whether it belongs there at all.
  <sub>Someday – not committed</sub>
- **Show the invite code as a filled brand chip** – a call on whether it is worth designing at all.
  <sub>Someday – not committed</sub>

<!-- WAITING-ON-THOMAS:END -->

**Why that is an INDEX and not a section** (asked by Thomas, 2026-08-11 – *"is
waiting on thomas not a category?"*). Being stuck on Thomas is a STATE, not a
kind of work: an item is a v1.1 feature *and* waiting on a frame. A real
section would mean moving items in and then back out again when he answers,
and every move is a chance to lose one – the whole failure this file has been
correcting today. So items stay where they belong and the index is derived
from their `Needs:` lines, which cannot drift because nothing is duplicated.

Ordering principle (agreed 2026-07-08): things that stand on their own and
deliver value by themselves come before things that depend on them – and
when a milestone finishes, the order gets a fresh look before starting the
next one.

Pruned 2026-07-25 (second pass): the 2026-07-18 tech-debt track, the
dev-build bug round and decision #8 all landed and were removed. Everything
below is open.

Pruned 2026-08-03: the whole "Blocked on other people" section (the TestFlight
tester chase) is gone at Thomas's call – v1.0 is with Apple and no more test
feedback is expected before launch, so chasing the third tester is not work
the launch is waiting on. The diagnostic worth remembering, if a family member
ever "never got the invite": TestFlight tester membership and App Store
Connect TEAM membership are two separate lists, and being on the team sends no
invite. Check betaTesters vs Users-and-Access before blaming email or spam.

## Now – before v1 goes live

Everything the App Store release is actually waiting on. If it is not blocking launch, it is not here.

### Pre-launch checklist (v1 ship)

- [ ] **⏳ Get everything off the work Mac before it goes back**
      Why: the machine belongs to the employer and Thomas is job-hunting. Not
           *if* it goes but *when*.
      Must be copied off: `~/Prepeat-backups/` (58 MB, nothing else holds it),
           `app-store-assets/` (10 MB), Claude's memory folder, the two env
           files.
      Travels by itself: all four accounts are personal, and the signing key is
           already in Apple Passwords on a personal Apple ID.
      ⚖️ Worth a professional, not Claude: a commercial product built on
           employer hardware. IP clauses sometimes reach further than people
           expect, and it is cheaper to check early.

      (2026-08-04.) **Full checklist:
      [backups-and-local-db.md](backups-and-local-db.md) → "Leaving the company
      Mac"**, audited the same day. Headlines:
      - **Travels by itself:** all four accounts are personal (GitHub, Apple
        Developer, Supabase, Expo), so do the three repos, and the signing key
        is already in Apple Passwords on a personal Apple ID.
      - **Must be copied off:** `~/Prepeat-backups/` (58 MB – nothing else
        holds it), `app-store-assets/` (10 MB, gitignored because it shows real
        household data), Claude's memory folder, the two env files.
      - **Regenerates:** the LaunchAgent, the runtime copy, the log, the Apple
        *Development* certificate and provisioning profiles. Distribution
        credentials live at EAS, not locally.
      - **Re-weigh Supabase Pro when the job actually changes.** The backup
        system built today runs on a machine that gets handed back – a
        different argument from the one declined earlier, since $25/mo buys
        backups sitting nowhere near a computer somebody else owns.
      - **⚖️ Worth checking with a professional, not with Claude:** a
        commercial product built on employer-owned hardware, and IP clauses in
        employment contracts sometimes reach further than people expect.
        Cheaper to check early. Noted so it is not forgotten.

- [x] **DONE 2026-08-04 – `credentials/AuthKey_UN3YR958DC.p8` is copied into
      Apple Passwords**, and **Thomas confirmed it visible on his iPhone**, so
      it is genuinely off this machine rather than merely saved on it. (Checked
      on purpose: an unsynced entry looks like protection and is not – the same
      trap as the scheduled job that "looked installed" twice today.)
      Found when Thomas asked whether the setup could be rebuilt on a new Mac.
      App Store Connect issues that key **once** and it can never be downloaded
      again; it is gitignored because it signs releases, so until today it
      existed in exactly one place on earth. Losing the Mac would have meant
      revoking and regenerating it – discovered at the moment a fix needed
      shipping.
      Stored as a password entry rather than an attachment (Apple Passwords
      takes no files, and the key is 257 bytes of ASCII), with the Key ID and
      Issuer ID in the notes. **The BEGIN/END PRIVATE KEY lines are part of the
      key** – it is unusable without them.
      Recoverable anyway, and deliberately not duplicated: `ascApiKeyId` and
      `ascApiKeyIssuerId` live in `eas.json`, which is in the PUBLIC repo.
      Neither is usable without the `.p8`, so this is not an exposure – but if
      the key file is ever compromised, **revoke it in App Store Connect**
      rather than merely replacing it, because the other two pieces are public.
      Full "if the Mac were lost" audit in
      [backups-and-local-db.md](backups-and-local-db.md) – everything else is
      recoverable, including the design system (pushed to GitHub) and both env
      files (re-derivable from the Supabase dashboard). The other single-copy
      item is `~/Prepeat-backups/` itself.

- [x] **🚀 SUBMITTED FOR REVIEW 2026-07-31.** All App Store Connect metadata
      entered and the version sent to Apple ("Add for Review" → Submit). Build
      12, EU-27 only, Free, 4+, privacy label published, manual release – so
      after Apple approves, Thomas presses the release button to go live. See
      the itemised entries below and
      [app-store-connect-answers.md](app-store-connect-answers.md). NEXT: watch
      for Apple's review result; if the demo mailbox OTP is the sticking point,
      the Supabase test-OTP trigger is the documented fallback (see the demo
      account item).
      - [ ] **⏳ STILL WAITING ON DAY 7 (checked 2026-08-07 08:45 CEST).** App
            Store Connect reports the version `WAITING_FOR_REVIEW` and the
            review submission `submitted 2026-07-31T11:30Z`, item state
            `READY_FOR_REVIEW`, not cancelled. So it is correctly queued and has
            NOT been rejected – Apple simply has not picked it up. Apple's own
            published expectation is ~24h with most through in 48, so a week is
            well outside normal though not unheard of for a first submission
            from a new developer account.
            Queried through the ASC API (the same key `asc-build-state.mjs`
            uses) rather than by reading the dashboard, so this is Apple's own
            answer. **Remember the 2026-08-03 lesson in the other direction
            too:** one query is a point in time – but here the state has been
            stable and the submitted date is a fact, so this is not the
            "not processed YET" window.
            - [x] **STATUS ENQUIRY SENT TO APPLE 2026-08-07**, after the demo
                  mailbox was proven working – deliberately in that order, so
                  that hurrying the review along could not hurry it into a
                  failure at sign-in. Apple replies by email with a Case ID.
                  **THE PATH, because it is four clicks deep and nothing along
                  the way says "my app is stuck":**
                  [developer.apple.com/contact](https://developer.apple.com/contact/)
                  → *Get help with a new issue* → **View topics** → **App
                  Review** → **App Review Status** → **Email**.
                  Field trap worth remembering: **"Apple Account of the App" is
                  NOT an email address**, despite sitting directly under a field
                  where you just typed one. It wants the app's numeric id,
                  `6793690543`. Name and Apple Account pre-fill from the signed-in
                  developer account; Related Apps stays empty; Platform iOS.
- [x] **First-look trademark search done 2026-07-27** – full write-up in
      [trademark-search.md](trademark-search.md). Headline: the NAME is clear
      (nobody holds "Prepeat" anywhere; no EU/DK registration; Prepear Inc.
      holds classes 42+45 in US/UK/CA/AU but NOT in the EU). The TAGLINE is
      not: "Prep Eat Repeat" is registered in the UK in class 9 (software),
      and Sistema Plastics holds "PREP. EAT. REPEAT." in class 21 via WIPO.
      Domains: we already own **prepeat.app** and **prepeat.love** (both
      parked at Porkbun; .love registered 2026-06-12, the day the name was
      decided). prepeat.dk and prepeat.eu are available if wanted defensively;
      .com has been taken since 2004.
      - [x] **Tagline decided 2026-07-27: "prep. cook. eat. repeat."** – the
            launch-screen wordmark, promoted to the public strapline (24 chars,
            fits Apple's 30-char subtitle). Chosen knowing it is modestly
            risky rather than clean: it CONTAINS the registered UK class 9 mark
            "Prep Eat Repeat", separated only by a generic verb. See
            [trademark-search.md](trademark-search.md) for the reasoning.
            - [ ] ⚠️ **UK caveat – revisit before adding the UK storefront.**
                  Exposure is territorial: none in DK/EU, real in the UK, and
                  the App Store ships worldwide BY DEFAULT unless territories
                  are restricted at submission. Replacement already checked and
                  clean: "One kitchen, every phone." (25 chars).
      - [ ] Attorney clearance before filing an EUTM (classes 9 + 42) or
            launching in the US/UK. While you have them: **also ask the
            imported-recipe copyright question** from the share item under Later
            (v1.1+). It does not block v1.0 – nothing is published publicly
            until sharing ships – but the answer shapes that feature, and it
            costs nothing to ask both in one conversation.
- [x] **Privacy policy WRITTEN and PUBLISHED** –
      [privacy-policy.md](privacy-policy.md), dated 2026-07-27, live at
      https://thomassebell.github.io/prepeat-web/privacy.html since 2026-07-28.
      Covers what is collected and why, what is not, retention incl.
      soft-delete, GDPR rights, Datatilsynet as the complaints route, children,
      and hello@prepeat.app as the contact.
      - [x] **FACTUAL ERROR CORRECTED 2026-07-28, in both copies.** The policy
            listed only TWO processors and said "we do not use any other
            processors" – but **Resend** handles every user's email address and
            one-time code, and was missing. The old text also credited **Apple**
            with delivering the sign-in emails, which Apple does not do. Now
            three processors with accurate roles. This mattered: an incomplete
            processor list in a published privacy policy is a GDPR problem, not
            a typo. It was found only because the SMTP screenshot showed who
            actually sends the mail – nothing in the repo said so.
      - [ ] ⚠️ **VERIFY the data-residency wording with the attorney.** The
            policy says data stays in the EU (Supabase, Stockholm), which is
            true of the database – but sign-in now means an email address is
            processed by **Resend, a US company**, and on the free tier there is
            no EU region. The page currently states that transfer is covered by
            the Standard Contractual Clauses. That is the normal position for
            such a vendor and it is what Resend's DPA is expected to say, but it
            has NOT been read and confirmed. Do that, and fold it into the
            attorney conversation queued below.
      - [x] **Contact address DECIDED and CHANGED 2026-07-28: hello@prepeat.app**
            everywhere – all 8 references across privacy-policy.md,
            app-store-listing.md and the three web pages. Live on the site.
- [x] **App Store listing text DRAFTED** – [app-store-listing.md](app-store-listing.md),
      name / subtitle / promotional text / keywords / description / What's New,
      all within Apple's character limits. NOT yet committed to git.

Audit of what submission actually requires, done 2026-07-27. The items above
were already further along than this list claimed; the ones below were
missing from it entirely.

- [x] **The website is BUILT AND LIVE, 2026-07-28** –
      **https://thomassebell.github.io/prepeat-web/** (privacy.html, support.html and
      a minimal index). Separate repo `thomassebell/prepeat-web`, three static pages,
      no build step, no framework, no JavaScript, GitHub Pages on the free tier.
      Verified live on desktop and at 375px: no console errors, no horizontal
      overflow, Montserrat headings + IBM Plex Sans body loading, and **zero
      third-party network requests** – the fonts are self-hosted precisely so
      the page that promises "no third-party tracking" does not hand every
      visitor's IP to Google to render itself.
      ## ✅ THE URLs FOR APP STORE CONNECT (live 2026-07-29, verified over HTTPS)

      ```
      Privacy Policy URL   https://prepeat.app/privacy.html
      Support URL          https://prepeat.app/support.html
      ```

      The github.io address now 301-redirects to prepeat.app, so do not use it
      anywhere. `www.prepeat.app` and plain `http://` both redirect to the
      canonical https apex.
      - [x] **prepeat.app – DONE 2026-07-29.** Certificate `CN=prepeat.app`
            covering apex + www, valid to 27 Oct 2026, Enforce HTTPS on.
            - **Order matters, and the first instinct was wrong.** GitHub is
              explicit: claim the domain on the REPO first, then point DNS. Do
              it the other way and there is a window where anyone on GitHub can
              attach the name to their own Pages site. The cost of the correct
              order is that the site is briefly dark, which was free here
              because nothing pointed at it yet.
            - **Porkbun DNS, as changed** (there were never any A records to
              delete – Porkbun parks via ALIAS):
              - `ALIAS prepeat.app` → `thomassebell.github.io` (was
                pixie.porkbun.com). Porkbun supports ALIAS at the apex and
                GitHub accepts it – one edit beside the mail records instead of
                adding four A records, which is the safer operation.
              - `CNAME www.prepeat.app` → `thomassebell.github.io` (new)
              - deleted the parking wildcard `CNAME *.prepeat.app`
              - all 7 mail records untouched and re-verified afterwards
              Apex now flattens to GitHub's four IPs (185.199.108-111.153),
              identical across Google, Cloudflare and Quad9.
            - ⚠️ **`.app` is HSTS-preloaded**, so browsers refuse to fall back
              to HTTP. Until the certificate exists the domain is dark in a
              browser even though GitHub IS serving it – `curl http://` returns
              200. Confirmed not a misconfiguration: no CAA record blocks Let's
              Encrypt, DNS is stable, and the TLS error is simply GitHub
              answering with its default `*.github.io` certificate.
            - ⚠️ **The certificate genuinely got stuck, and the fix is worth
              remembering.** It never arrived on its own – not in 30 minutes,
              not in 2 hours, not overnight. The tell was that
              `https_certificate` was ABSENT from the Pages API response rather
              than showing a pending state: provisioning had never STARTED, as
              opposed to being slow. Everything else checked out (no CAA record
              blocking Let's Encrypt, DNS stable across three resolvers, GitHub
              serving the site fine over plain HTTP), which is what made it
              clear the problem was on GitHub's side, not in the DNS.
              **Fix: remove the custom domain and re-add it** (`PUT
              .../pages -f cname=""` then `-f cname=prepeat.app`). The field
              appeared immediately as `authorization_created`, then `approved`
              within a minute of triggering a fresh build. The rapid toggle left
              `status: errored` – a `POST .../pages/builds` cleared it.
              Do NOT reach for this while provisioning might still be in flight;
              it resets the queue position. Only once the field is missing
              entirely and hours have passed.
              Rollout across GitHub's edge nodes is not instant: for a minute
              some paths returned 200 and others failed. Not a fault, just wait.
            - [x] **Enforce HTTPS ON**, verified: `http://` → 301 → https, and
              `www` → 301 → apex.
            - [x] Mail re-verified AFTER all DNS changes: both root MX, root
              SPF, Resend DKIM, send.prepeat.app SPF + MX, and DMARC all intact.
      - [ ] **Two copies of the privacy policy exist** –
            `docs/privacy-policy.md` here (where it was authored) and
            `privacy.html` in the web repo (the one that legally matters).
            Change one, change the other. Worth collapsing to one source if it
            ever drifts in practice.
      - [x] **A THIRD copy existed and was deleted, 2026-07-28.** The app repo
            had a `gh-pages` branch quietly serving its own landing page and
            `privacy/index.html` – built in an earlier session for App Store
            submission, and never mentioned in this backlog. So two privacy
            policies with different contents were live on the internet at once,
            the older one naming two processors instead of three and giving the
            superseded contact address. That is the worst category of thing to
            have a stale public copy of.
            Claude's pre-launch audit MISSED it: the audit read the docs and the
            app config but never asked GitHub what the account was already
            publishing, and concluded "you need a website" while one existed.
            `gh repo list` + the Pages API found it in seconds. **Check what is
            already deployed before concluding something is missing.**
            Branch deleted (tip was `d41c6f9`), Pages deactivated on that repo,
            URL confirmed 404. Note it did NOT self-retire on the username
            rename as first predicted – GitHub rebuilt it under the new name,
            and it took the branch deletion plus a CDN expiry to actually go.
      - **IMPROVISED, flagged per the 2026-07-17 rule**: no Figma frames exist
            for any web page. They are typographic document pages assembled from
            DS tokens, deliberately restrained – a real marketing landing page
            is a design job and was NOT invented here. The index is minimal on
            purpose: enough that the domain does not 404.
      Note this survived the sharing deferral: dropping share from v1.0 did not
      remove the need for a web presence, it only shrank it – v1.0 needs two
      static pages, no database and no share tokens, where the v1.1 share page
      needs the rest. Build the small one now and the share page grows into it.
      **PLAN, settled 2026-07-28: neither piece costs anything new. Do not buy
      a one.com plan for this.** Thomas asked whether his paid one.com account
      could serve – it could, but only makes sense if it ALREADY includes web
      hosting + mail; buying an upgrade would be paying for two things he has
      for free:
      - [ ] **Pages → GitHub Pages.** Free for public repos (this repo is
            public), custom domain, free HTTPS. Serves the privacy policy and a
            support page as static HTML. Suggest a SEPARATE small repo
            (`prepeat-web`) rather than this one, so the site does not rebuild
            on every app commit and the app's history stays clean.
      - [ ] **Inbound mail → Porkbun email forwarding.** Free, up to 20
            addresses per domain, already included with prepeat.app. Forward
            hello@prepeat.app → thomas@sebell.dk and support requests stop
            vanishing.
            **Caveat worth knowing:** forwarding delivers TO your inbox, but a
            reply goes out as thomas@sebell.dk, not as hello@prepeat.app. A user
            writes to the app and gets an answer from a stranger's personal
            address. Fixing that needs a real hosted mailbox – Porkbun's own
            hosted email is a few dollars a month, or one.com IF the plan
            already covers it. Cheap either way, and it can wait until somebody
            actually writes in.
      - **Keep DNS at Porkbun** (it runs on Cloudflare) and add records there.
        Do NOT move nameservers – that means re-creating the Resend records
        elsewhere, and a mistake there stops sign-in for everyone. Inbound mail
        (MX) and outbound (Resend) do not conflict; they are different record
        types. The one collision risk is SPF – see the email decision in the log
        below, one record only, both senders inside it.
      Fit for the v1.1 share page too, with one caveat: static hosting plus
      client-side Supabase calls would render a recipe fine, but **link
      previews** (the card that appears in WhatsApp/iMessage) need per-recipe
      Open Graph tags in the served HTML, which a purely client-rendered page
      cannot produce. For a feature whose whole point is being passed between
      phones, that preview matters – so the share page needs either
      pre-generated HTML per share or a small server. Decide when share is
      designed, not now.
- [x] **Custom SMTP is configured – checked 2026-07-28, NOT a blocker.**
      Supabase's built-in sender would have been (2 messages/hour, no SLA,
      team addresses only – *"We urge all customers to set up custom SMTP
      server"*), and since every sign-in is an emailed code, the default sender
      would have meant the app simply did not work for the public. It is on:
      **Resend** (smtp.resend.com:465), sending as **hello@prepeat.app**, sender
      name "Prep+Eat", minimum 60s between codes to one user. So prepeat.app is
      already carrying live DNS records, which shortens the website item below.
      - [ ] **The Resend free tier caps at 100 emails/DAY** (3,000/month, one
            domain). One sign-in = one email, so 100/day is fine for the family
            and thin for a launch spike – and when it is hit, new users cannot
            get in at all, which is the same failure mode as the default sender
            just at a higher threshold. Decide before launch whether to move to
            Pro ($20/mo, 50,000) or launch on Free and watch it.
- [x] **One contact address, settled 2026-07-28: `hello@prepeat.app`.** All 8
      references changed and live (privacy-policy.md ×3, privacy.html ×3,
      support.html, index.html, app-store-listing.md). The app already MAILED
      from this address; now it is also the one every page tells you to write
      to, so the GDPR contact, the App Store support channel and the reply-to
      are a single address on the product's own domain.
      Why it mattered: the moment that decides whether a stranger trusts you is
      BEFORE any contact – they get a code from hello@prepeat.app, hit trouble,
      and the support page used to send them to prepeat@sebell.dk, a domain
      they had never seen. (Claude first argued the opposite, weighting the
      reply-from over the inbound direction, and withdrew it.)
      "Thomas Sebell, Denmark" stays as the named data controller in the policy –
      that is correct and legally required; only the contact address moved.
      - [x] **DONE 2026-07-28: Porkbun free email forwarding is live.**
            `hello@prepeat.app` → `prepeat@sebell.dk`, a mailbox Thomas created
            for the purpose – so replies go out as prepeat@sebell.dk rather than
            his personal thomas@, which is a better outcome than the plan
            assumed. Free, up to 20 forwards, included with the domain.
            **Deliberately NOT the $24/year hosted mailbox.** Buy that when the
            reply-from address actually confuses somebody, not before; it is a
            toggle in the same account.
            (one.com was ruled out entirely – it does not support .app domains.
            No loss: GitHub Pages does not care about the TLD.)
      - [x] **DNS verified after the change, 2026-07-28 – NOTHING BROKE, and
            the reason is worth keeping.** Enabling forwarding DID create a root
            SPF record, `v=spf1 include:_spf.porkbun.com ~all` – exactly the
            thing feared, and contrary to Claude's prediction that a
            receive-only forward would not add one. It is harmless anyway,
            because **Resend does not use the root domain for sending**:
            - `prepeat.app` TXT → `v=spf1 include:_spf.porkbun.com ~all` (new,
              Porkbun's forwarding)
            - `send.prepeat.app` TXT → `v=spf1 include:amazonses.com ~all`
              (Resend's, untouched)
            - `send.prepeat.app` MX → `feedback-smtp.eu-west-1.amazonses.com`
            - `prepeat.app` MX → `fwd1/fwd2.porkbun.com` (new)
            - `resend._domainkey.prepeat.app` → DKIM key, still present
            - `_dmarc.prepeat.app` → `v=DMARC1; p=none;`
            **The one-SPF-record rule is per NAME, not per domain.** Resend's
            envelope return-path is `send.prepeat.app`, so its SPF is checked
            against that subdomain and never against the root. Two records, two
            names, no collision. DMARC aligns twice over – by DKIM on the root,
            and by relaxed SPF alignment from the subdomain.
            **Keep the rule anyway**: anything that ever adds a second SENDER on
            the ROOT (a newsletter tool, a hosted mailbox that sends) must go
            into the root's single record beside Porkbun's include – it cannot
            have its own. Re-run `dig +short TXT prepeat.app` after any mail
            change.
      - **Bonus finding, feeds the residency question above**: that bounce MX is
            `eu-west-1` – Ireland. Resend is handling this domain's mail in an
            **EU region**, which is evidence (not proof) that sign-in emails are
            processed inside the EU rather than the US. Good for the privacy
            policy's data-location paragraph; still confirm it in Resend's own
            terms before treating it as settled.
- [ ] ⚠️ **Keep the Apple reviewer's demo mailbox working**
      Why: the app signs you in with an emailed code, so a reviewer needs a
           real mailbox they can open. This is the reviewer's very first
           action, and the one thing that turns a week in the queue into a
           rejection plus another week.
      Status: built, seeded and CONFIRMED WORKING 2026-08-07. Open only
           because it needs re-checking before each submission – the demo
           week is dated, so re-run the seed close to submitting.
      Do not: use the Postgres test-OTP trigger. It writes into Supabase's
           internal auth schema, is a permanent known-code backdoor, and rots
           silently. Fallback only if Apple pushes back.

      `src/lib/auth.tsx:58` uses
      `signInWithOtp` – a one-time code emailed to you, no password anywhere.
      A reviewer handed an email address cannot receive that code, and offering
      to relay it by hand does not pass review.
      **Researched 2026-07-27: Supabase has NO fixed test-OTP for email.** The
      feature exists for SMS only (`auth.sms.test_otp` maps a phone number to a
      fixed code); there is no `auth.email.test_otp`, in the CLI config or the
      dashboard. The community workaround is a Postgres trigger that overwrites
      `auth.users.recovery_token` with a SHA224 hash of a known code and
      backdates `recovery_sent_at` past the 60s rate limit. **Rejected as the
      plan**: it writes into Supabase's internal `auth` schema, which is
      undocumented and changes without notice (the discussion thread already
      has it breaking after an update), it is a permanent known-code backdoor,
      and it is load-bearing for review while never exercised day to day – so
      it rots silently and fails at submission, which is the worst place to
      find out.
      **Plan instead: a real mailbox the reviewer can open.** A dedicated demo
      address on sebell.dk with webmail; App Review notes give the address plus
      the webmail login and one line of instruction. No auth-schema tampering,
      nothing shipped in the app, nothing to rot. If Apple pushes back, the
      trigger is the fallback, not the opening move.
      - [x] **Demo account built and seeded, 2026-07-30.** Mailbox
            `appreview@sebell.dk` created (webmail, its own password – shared
            with Apple only, never committed to this public repo). Bootstrapped
            in the app: signed in, name set, household **"Demo Kitchen"**
            created. Then seeded server-side with 9 recipes + a planned CURRENT
            and NEXT week + shopping lists (generator
            `scratchpad/gen-demo.ts` → the SQL, re-runnable; the weeks are
            `date_trunc('week', now())` so re-run it close to submission to keep
            "this week" populated). Verified recipes 9, entries 14. SEPARATE
            from "The Hanson Kitchen" (Thomas's own account, used only for the
            App Store screenshots) – the reviewer never sees the real household.
            **App Review Information ENTERED in App Store Connect 2026-07-31:**
            sign-in required = yes, username `appreview@sebell.dk`, mailbox
            password, contact (Thomas Sebell + phone + thomas@sebell.dk) and the
            §3 Notes (with the real webmail URL + password) all filled and saved.
            - [x] **THE WHOLE REVIEWER SIGN-IN PATH IS CONFIRMED WORKING,
                  2026-08-07** (Thomas: *"All mailboxes and access is tested and
                  passed"*). The `appreview@sebell.dk` mailbox is live, the
                  webmail credentials Apple holds do sign in, and a one-time code
                  arrives. This was the last prerequisite on Thomas and the one
                  thing that could have turned a week in the queue into a
                  rejection plus another week – the reviewer's very first action
                  is a sign-in the app cannot complete for them.
                  Checked ahead of any nudge to Apple deliberately, so that
                  hurrying the review along could not hurry it into a failure.
- [x] **Screenshots** – 4 iPhone 6.5"/6.9" screenshots (Weekly plan, Recipes,
      Shopping list, Household) uploaded to App Store Connect (verified
      2026-07-31). iPhone-only build confirmed – App Store Connect shows NO iPad
      screenshot requirement, so the iPad tab is correctly empty. The
      `app-store-assets/screenshots/` folder stays gitignored (real household
      data, public repo).
- [x] **App Privacy card in App Store Connect – ENTERED and PUBLISHED
      2026-07-31.** Declared as "Data Linked to You": Email Address, Name,
      Photos or Videos, Other User Content, User ID – every one for App
      Functionality, none for tracking, so the label has NO "Data Used to Track
      You" section, matching the listing's "NO ADS. NO TRACKING." promise.
      Resolved the CONFIRM: **User ID declared** (conservative, adds no tracking
      disclosure). Added **"Photos or Videos"** beyond the original draft –
      the app stores user recipe photos, a distinct Apple data type, and
      under-declaring is what gets labels rejected. Privacy Policy URL
      (prepeat.app/privacy.html) also set. Original draft:
      [app-store-connect-answers.md](app-store-connect-answers.md).
- [x] **The remaining App Store Connect paperwork – ENTERED 2026-07-31.**
      - **Age rating: 4+** (every content question None/No, "Made for Kids" NOT
        enrolled). Resolved the alcohol CONFIRM = None. Apple's new 2025
        social-media/UGC questions (which the draft predated) all answered No.
        **⚠️ The "User-Generated Content = No" answer MUST be revisited when the
        public recipe-sharing feature ships (v1.1+)** – that turns on real UGC
        visible to strangers and needs report/block controls (Guideline 1.2).
      - **Category: Food & Drink.** Subtitle "prep. cook. eat. repeat."
        Copyright "2026 Thomas Sebell".
      - **Territory: EU-27 only** – the UK-tagline call, decided EU-only so both
        the "Prep Eat Repeat" UK registration and Prepear (US/UK/CA/AU) are
        sidestepped entirely. Price Free, base country Denmark (DKK), manual
        release. Revisit territory before any US/UK launch.
      - **Content Rights: No** (does not contain third-party content) – business
        call, not legal advice: recipe link-import is user-initiated into a
        private household with attribution + source link. Thomas has no attorney
        and may not get one; the EU-only territory is the main trademark
        de-risk, so the attorney is now an expansion-time concern, not a
        launch gate.
- [x] **Build 13 shipped to TestFlight, VALID (2026-08-03).** Carries the
      pre-build audit fixes: #1 (an imported recipe is no longer lost when its
      photo can't be fetched, and a failed save shows a real error), #5 (the
      Recipes tab, recipe detail and the shopping week switch all offer "Try
      again"; Shopping also gained the loading spinner it never had), and #6
      (the invite code is legible). #2 is NOT in this build – it is migration
      0025 and has been live for everyone since it was applied the same day.
      **The App Store review is untouched**: v1.0 is still bound to build 12
      and was deliberately left alone (Thomas, 2026-08-03, choosing to ship to
      testers without disturbing the queue). **So v1.0 will launch WITHOUT
      these four fixes** – plan a 1.0.1 with build 13 or later once v1.0 is
      approved and released.
      SUBMIT WENT CLEANLY THIS TIME – no hang, unlike build 12. But note the
      submit script's closing line printed "Build 12 is VALID" because Apple
      had not finished processing 13 yet: **that line names the latest build it
      can SEE, not the one you just shipped.** If the number is not yours, it
      has not landed. Polling for build 13 specifically found it VALID after
      3 minutes – much faster than build 12's ~25.
- [x] **Build 12 shipped to TestFlight, VALID (2026-07-30).** Supersedes the
      "ship build 11" item – build 12 carries the Plan-tab retry screen, all
      the import/parser fixes, migration 0024's behaviour, the ds-check
      lockdown, and the household-switcher redesign. `autoIncrement` set the
      number (11 → 12 during the build). Marketing version 1.0.0.
      NOTE FOR NEXT TIME – the submit CLI hung TWICE (the watchdog killed both
      local watchers at 600s), yet build 12 landed on App Store Connect anyway
      ~25 min later: the upload runs on Expo's SERVERS and killing the watcher
      never stops it. So when a submit stalls, do not rush to retry or to the
      altool fallback – wait and poll `asc-build-state.mjs` for the specific
      build number first (a 24-min poll timed out here just before it landed;
      give it 30-40 min). Apple's VALID is the only truth, exactly as the
      recurring note says.
- [x] Export compliance handled – `ITSAppUsesNonExemptEncryption: false` is
      already in app.json, so submission stops asking every time.
- [x] In-app account deletion built (guideline 5.1.1(v), required for any app
      with account creation) – Delete profile, shipped 2026-07-22.
- [x] **Support address CONFIRMED RECEIVING 2026-08-07** (Thomas: *"All
      mailboxes and access is tested and passed"*). It is promised in the
      privacy policy AND the App Store description and is the app's only support
      channel, so this was a genuine launch gate.
      **Known and accepted: `hello@prepeat.app` is SLOW to arrive** – Thomas's
      call that it is not a concern, and the mechanism explains it: the address
      is a Porkbun FORWARD (MX `fwd1/fwd2.porkbun.com`) rather than a mailbox,
      so every message takes an extra hop. Worth having written down for two
      futures: if a user ever reports "I emailed support and heard nothing",
      slowness is the first thing to rule out rather than a lost message; and if
      it ever becomes a real problem the fix is a proper mailbox on the domain,
      not a DNS change.
- [x] **`prepeat://ds-check` no longer reachable in production (2026-07-30).**
      The token-debug screen is now development-only: the route redirects to
      home when `!__DEV__` (a deep link in a Release build goes nowhere) and
      the hidden tab trigger is only registered under `__DEV__`. Kept for dev
      use rather than deleted – it is the DS-token verification tool.
## Next – v1.1

Committed work for the first update after launch. Panel findings default here unless Thomas moves them.

### Known bugs (open)

- [x] **EDITING A SECTION SILENTLY TURNED IT INTO AN INGREDIENT. Found by
      Thomas on device 2026-08-07, fixed the same hour.** *"there is a bug in
      edit section. when you edit the section it becomes a ingredient."*
      **WORSE THAN IT LOOKS:** a demoted heading is a real ingredient, so
      "DOUGH" then lands on the shopping list the next time that recipe is
      planned – precisely the failure sections were built to prevent, arriving
      through the back door. And it was silent: no error, and the row only looks
      wrong once you notice the heading has become a list item.
      **THE CAUSE IS A BOUNDARY, not a typo.** `BottomSheet` renders its children
      only while visible (deliberately, so field state resets per open without
      key juggling). The ingredient sheet's TAB state has to live OUTSIDE that
      boundary, because the sheet's title follows the tab and the title is a prop
      on BottomSheet. So `useState(initialKind)` captured its value at the very
      first mount – when nothing was being edited, i.e. "ingredient" – and never
      read it again. Open a section, the tab says Ingredient, save, and
      `isSection` is written false.
      Fixed by re-syncing on open, using React's documented adjust-state-during-
      render pattern rather than an effect, which would show one frame of the
      wrong tab.
      **BOTH SCREENS WERE ALREADY CORRECT** – the create/edit screen and the
      recipe detail both passed `initialKind` properly. The single shared sheet
      was the whole bug, so one fix covered both.
      LESSON, and it is why neither device walk caught it: the walk lists said
      "create a section" and "delete a section" but never **"edit one and save it
      unchanged"** – the most ordinary thing anyone does to a heading, and an
      action with no visible error when it goes wrong. **Add edit-and-save-
      unchanged to the walk list for anything carrying a type or a mode.**
      - [x] **A related trap, found by sweeping for the same shape rather than
            waiting for it.** `add-meal-sheet.tsx` also holds tab state outside
            the boundary. NOT the same bug – its initial value is a constant, so
            nothing is silently converted – but the tab is sticky between opens.
            Left alone as possibly intended; noted so it is not re-diagnosed.

- [x] **A plan change that needed MORE than you ticked off was completely
      invisible. FIXED AND APPLIED 2026-08-04 as migration 0028.** Found
      2026-08-04 from Thomas's report: *"it does not update shopping list when
      adding a meal to plan"*, then *"it works in next week but not in
      current"*, then *"it works after I deleted all meals and checked all the
      items in shopping. Then added a new meal."* Those three together are the
      diagnosis: next week's list is empty so new lines appear, while the
      current week's list has been shopped and its lines are CHECKED.
      THE RAILS ARE WORKING AS DESIGNED – the missing half is the UI.
      `plan-shopping.ts` and migrations 0013/0014/0025 all state the rule:
      a checked line is never silently overwritten, and instead *"the shopper
      sees a 'changed in the plan' marker"*, computed as
      `is_checked && sum(contributions) ≠ quantity`. That marker DOES NOT
      EXIST in the app. Verified two ways: `fetchItems`
      ([shopping-list.tsx:405](../src/lib/shopping-list.tsx)) selects explicit
      columns and never touches `shopping_list_item_contributions`, and
      `git log -S contributions -- src/lib/shopping-list.tsx` returns nothing,
      so it was never once read. There is no view or generated column doing it
      server-side either.
      SO THE USER-VISIBLE BEHAVIOUR IS: add a meal, and any ingredient that
      merges into an already-checked line produces no new row, no quantity
      change and no marker – nothing whatsoever. It reads exactly as "the
      shopping list is broken", against listing copy that promises the list
      "builds itself from the plan".
      NOT A REGRESSION from the 2026-08-04 clock work – it has been true since
      the rails landed (0013, 2026-07-16, and decision #8 on 2026-07-25). It
      went unnoticed because a fresh week's list is clean, and demo/testing
      lists rarely have checked items.
      **THE CASE THAT SETTLED IT – Thomas's own week, 2026-08-04.** Plan on
      Sunday; shop on Monday and tick off what is already in the kitchen;
      Tuesday guests arrive, so bump Wednesday's recipe from 4 to 8 servings.
      *"The raised servings does not affect the shopping list."* Every recorded
      contribution doubled and not one line changed, because Monday's shopping
      had checked them all. The app knew he would be short of everything for a
      dinner with guests and showed nothing.
      An earlier argument here – that a shortfall is usually a false alarm
      because you bought a whole pack anyway – DOES NOT SURVIVE THIS, and was
      withdrawn. That holds for a rounding difference; a serving bump is a
      FACTOR, so every ingredient doubles at once and the shortfall is
      proportional and real.
      **FIXED WITHOUT A MARKER, and without any design – but it took two goes.**
      The marker was the wrong frame either way: the question is what a tick
      MEANS (see the sub-item below), so when the requirement rises the line is
      no longer settled and the shopper has to be told.
      - [x] **0028, APPLIED then SUPERSEDED THE SAME DAY. It answered the wrong
            question.** It un-checked the ticked line and put the new TOTAL on
            it. Thomas tested it within the hour: he added "Test 1" (1 litre of
            milk) three times, ticked the merged 3 l off, doubled ONE of the
            three meals – and the list asked for **4 litres**.
            Four is the correct total (1 + 1 + 2). It is the wrong answer: he
            had already accounted for 3, so what he needed was "buy 1 more".
            WHY IT WENT WRONG, and it is the same failure as the display-half
            bug earlier the same day: the choice between showing the TOTAL and
            showing what is OUTSTANDING was noticed while writing 0028 and
            decided silently, in favour of the total, *because it kept 0025's
            bookkeeping simple*. Convenience of the invariant is not a reason to
            hand someone a number they have to do arithmetic against – and the
            trade was never put to Thomas, which is the actual error.
            LESSON: when a choice between two behaviours is noticed during
            implementation, that is a decision, not a detail. Surface it.
      - [x] **0029 is the real fix, chosen by Thomas from three options** (one
            line showing the total; two lines; a new column recording what was
            satisfied). A line holds ONE number and this situation has TWO facts
            – what the plan needs and what the shopper already secured – so they
            get a line each. The ticked line is never touched again, and what is
            still missing appears as its own active line: "3 l [ticked]" plus
            "1 l".
            THE NUMBER WAS ALREADY IN THE DATA, which is what made it cheap:
            0025 gave every contribution both `quantity` (what the meal needs)
            and `applied_quantity` (how much is folded into the visible line),
            so *still needed* is just
            `SUM(quantity - coalesce(applied_quantity, 0))`. Nothing new is
            recorded; it is a query.
            RECOMPUTED, NEVER INCREMENTED – this is the part that makes the
            reverse operations work, and where an incremental version would rot.
            Un-double the meal and the sum returns to zero, so the extra line
            removes itself. Every path was walked in simulation before the SQL
            was written: un-double, double two, remove the meal, and – the one
            that catches naive versions – tick the extra litre off and then
            double a SECOND meal, which correctly asks for 1 more rather than 2.
            It also fixes Thomas's original report ("adding a meal to plan does
            not update the shopping list") through the same mechanism.
            0029 REVERTS 0028's un-freezing in both reconcilers, back to 0025's
            rails exactly. The rails were never the problem; the missing half was
            that nothing told the shopper.
      Hand-edited lines are still never overwritten, and a DECREASE still never
      disturbs anything – the sum simply drops.
      - [x] **WHAT A TICK MEANS, and it is not "I bought this"** (Thomas,
            correcting a first draft of 0028): *"the recipes add something to
            shopping. then the human checks whats in the kitchen, then goes
            shopping."* So a tick is a JUDGEMENT – "I have enough for what this
            line says" – made against a specific amount. When the plan raises
            that amount the judgement is stale, and whether the cupboard still
            covers the new number is something only the person who looked in it
            can say. Un-checking hands it back to them. That is the entire basis
            of the rule, and it is why the fix needs no marker.
      - [x] **NO EXCEPTIONS BY KIND OF ITEM – a first draft had one and it was
            wrong.** That draft carved out seasoning-scale units (tsp, tbsp,
            pinch…) so salt and pepper would not keep returning. Thomas rejected
            it: *"I don't think we can make exceptions like that. what if people
            don't have salt and peber."* He is right – it hardcodes an
            assumption about what a household stocks, and the app cannot know
            that for a spice any more than for mince. It would be the app
            guessing on the household's behalf, quietly. The uniform rule
            assumes nothing, and the churn is small and comprehensible: it
            happens only when someone CHANGES a meal, a deliberate act they just
            performed, and re-ticking a line is one tap.
            It also turns out the common case is handled for a principled
            reason rather than a guess: "salt and pepper to taste" parses to NO
            amount, and every path here requires one, so those lines never come
            back at all.
            LESSON: an exception that encodes a guess about the user's world is
            worse than the churn it saves. When the app cannot know, ask the
            person who can.
      - [ ] **Learned pantry, the proper way to make it quieter about staples.**
            A per-household "I always have this", the same teach-it-once shape
            as `item_category_memory` (decision #7) and a close sibling of
            Teach-a-synonym under Later. The household TELLS the app; the app
            never guesses. Only worth building if the re-ticking actually proves
            annoying in real weeks.
      - [x] **0028 APPLIED 2026-08-04** (all four columns true), then corrected
            by 0029 the same day – see above. **Live for everybody already** – a
            database change reaches every phone the moment it runs, so builds 12,
            13 and 14 all behave this way now, with no app change needed.
      - [x] **0029 APPLIED 2026-08-04**, verifying select returned all six
            columns true (outstanding_column, sync_fn, contribute_is_0029,
            rescale_is_0029, withdraw_is_0029, unfreezing_gone). That last one
            reads `prosrc` to prove 0028's un-freezing is gone from the live
            body, not merely that the function exists. **Live for everybody
            already**, builds 12/13/14 included, with no app change needed.
      - [x] **0030: "Clear done items" switched the whole thing off** (Thomas,
            same day, testing 0029 within the hour): *"if I clear all marked item
            in shopping, the logic collapses and nothing is shown if I change
            servings."* Right, and it was one line – 0029's sync opened with
            `if not found or v_line.deleted_at is not null then return`, and
            clearing the done band soft-deletes those rows. So every later plan
            change found a deleted line and bailed before computing anything.
            THE GUARD READ "deleted" AS "no longer relevant", when CLEARING IS
            THE STRONGEST FORM OF SATISFIED – the shopper ticked it off and then
            swept it away because it was handled. The requirement it covered did
            not go anywhere, so the difference is still owed.
            0030 fixes both halves of that confusion: bail only when the row does
            not exist or is NOT TICKED, and count a ticked outstanding line as
            satisfied whether or not it was later cleared (without the second
            half, clearing the done band twice would ask for an already-bought
            litre all over again).
            LESSON, and it is the third time today in a different costume: this
            is unreachable without three or four steps of setup, so nothing but
            a real walk-through finds it. Two migrations passed their verifying
            selects and neither said anything about this.
      - [x] **0030 APPLIED and CONFIRMED ON DEVICE 2026-08-04** – Thomas walked
            the 3x "Test 1" case with a clear in the middle (tick the merged 3 l
            off, Clear done items, double one of the three meals, un-double it)
            and reported *"it works now"*. **Live for everybody**, builds 12, 13
            and 14 included, with no app change needed.
            Three of 0030's fixes came from the state grid rather than from
            testing, and none of them would have been reachable by hand without
            several steps of setup: a hand-edited outstanding line being
            overwritten, a shopper-deleted one coming back, and sync's own
            tombstones counting as "already bought" so that un-doubling then
            re-doubling showed nothing.
            Worth copying from this one's verifying select: the last two columns
            read `prosrc like '%0028%'` to prove the new BODIES landed. A
            replaced function body is invisible to an `exists in pg_proc` check,
            which every earlier migration's select relied on – so those could
            have passed on a file that never ran its `create or replace` at all.
      **The marker itself is now moot for this gap, but the finding stands**: no
      client has ever read `shopping_list_item_contributions`, so if a marker is
      ever wanted for the cases 0028 deliberately leaves alone – a decrease, a
      hand-edited line, a pantry unit – it still has to be designed and built.

- [ ] **Stop the same ingredient appearing twice on the shopping list**
      Why: the store page promises the list "builds itself from the plan", and
           a shopper seeing garlic twice reads that as broken.
      Left: only the synonym half – `onion` vs `yellow onion`, `coriander` vs
           `cilantro`. No mechanical rule settles those, so it is now a product
           decision, written up as "Teach-a-synonym" under Later.
      Size: the mechanical causes are all fixed and shipped.

      (Thomas, 2026-07-29, looking at the week-32 demo list: *"a lot of item
      are the same, but named differently"*). `item_merge_key` (migration
      0013) originally was `norm_item_name(name) || ' ' || lower(trim(unit))`,
      so two rows merged only on an exact name AND an exact unit string. The
      mechanical halves are fixed (trailing unit words lifted out of the name,
      spelled-out units folded onto abbreviations). One cause remains:
      - [x] **Singular vs plural count units – DONE, and the "needs a decision"
        note here was stale.** Migration 0024 (2026-07-30) already singularises
        the unit INSIDE `item_merge_key`, exactly as this entry proposed, so
        clove/cloves, cup/cups, slice/slices and head/heads merge while the row
        still prints whichever natural form was stored first. The decision was
        therefore made and shipped three days before this entry was last read
        aloud on 2026-08-03; 0024's rule then needed one correction of its own,
        which is item 8 of the pre-build audit below.
        LESSON: a bug entry that proposes a fix has to be re-read when the fix
        lands, or it goes on asking for a decision that has already been made.
      - **Synonyms.** `onion` / `small onion` / `yellow onion`,
        `salt` / `kosher salt` / `cooking salt` / `flaky sea salt`,
        `olive oil` / `extra virgin olive oil`, `fresh cilantro` /
        `coriander leaves`. These are genuinely different strings and no
        mechanical rule settles them – "small onion" may well be a deliberate
        distinction, and merging UK/US names (coriander/cilantro) is a
        judgement about who the household is. Any fix here is a product
        decision, not a parser change, and probably belongs with the
        category-memory idea: let the household teach synonyms once, the same
        way it teaches aisles. **Now written up as its own v1.1+ item,
        "Teach-a-synonym", under Later** – see there for the data model and
        the design gap.
      Worth weighing against the listing copy, which promises the list "builds
      itself from the plan" – a shopper seeing garlic twice reads that as
      broken even when the quantities are right.

#### Pre-build audit, 2026-08-02

Found by a multi-agent review of the whole shipping surface (5 angles –
RLS/security, auth lifecycle, data correctness, recipe import, UI states –
each finding then adversarially verified by a second agent that tried to
refute it; 13 survived, merged to the 10 below). Ranked by launch risk.

**Verdict: ship with caveats.** No cross-household data leak, no launch
crash, no hard-blocked flow – the security angle came back clean, and
`is_household_member()` / RLS hold up. **Build 12, in review with Apple, is
unaffected by all of this** – these are for build 13 and after. Suggested
cut: fix 1 and 6 before the next build, the rest as a fast follow.

- [x] **1. FIXED 2026-08-02. HIGH – an imported recipe was silently thrown
      away when its photo couldn't be fetched.**
      [src/app/recipes/new.tsx](../src/app/recipes/new.tsx)
      Fixed in two halves, matching the audit's advice: (a) the photo upload is
      now wrapped in its own try/catch, so a failed image saves the recipe
      WITHOUT the picture instead of losing everything – recoverable later from
      Edit; (b) any remaining save failure sets an error banner and leaves the
      form fully populated, so Save can just be pressed again. The banner is
      the SAME designed component already used by the onboarding and household
      modals (`bg-error-lightest` + `error-outline`), and it lives in the
      pinned footer beside the button that failed so it cannot scroll out of
      view on a long recipe. Message text goes through the existing
      `friendlyError()`, so "offline" reads as plain language.
      NOT yet verified on a device – see the verification note at the end of
      this block.
      On import, `photoUri` is set to the external image URL taken straight
      off the page (new.tsx:139), unvalidated. Save re-downloads that URL and
      uploads it (new.tsx:161-163). If the download fails – a relative path, a
      hotlink-blocked image, a 403, flaky signal – the upload throws and the
      catch at 204-207 only writes to the developer console and stops the
      spinner. No message, no retry: the whole reviewed recipe (title,
      ingredients, steps) is discarded and the user is given no clue their
      work is gone. The same silent catch swallows any failure of the database
      save too, so it is really "save has no user-facing error handling at
      all" – import merely makes the failure far more likely.
      This is the feature the listing calls the centrepiece, failing in the
      way most likely to get the app deleted.
      FIX: show a real error and keep the form populated so the user can
      retry; and make a failed photo upload NON-FATAL – save the recipe text
      without a photo rather than losing everything.
- [x] **2. FIXED AND APPLIED 2026-08-03 (migration 0025). Shopping quantities
      drifted wrong when a line was checked/unchecked around a plan change.**
      `supabase/migrations/0013_atomic_plan_push.sql`
      :185-191 and `0014_atomic_withdraw_rescale.sql`:83-96.
      `contribute` ALWAYS records that a meal contributed a quantity, but only
      adds it to the visible line when the line is unchecked and not
      hand-edited. `withdraw` later subtracts that recorded contribution based
      on the line's state AT WITHDRAW TIME. A shopper naturally checks and
      unchecks lines while shopping, so the two sides diverge: a contribution
      recorded while the line was checked (never added) gets subtracted once
      it is unchecked, driving a quantity to zero even though another meal
      still needs the item. `rescale` has the same asymmetry.
      Hits the "the list builds itself from the plan" promise directly.
      DONE, as `0025_contributions_track_what_was_applied.sql`: a new
      `applied_quantity` column records the amount ACTUALLY folded into the
      visible line (null = none), and withdraw/rescale reverse that instead of
      the raw quantity – so a debit can never exceed the credit that was made.
      Invariant restored: a line's quantity is the sum of its live
      contributions' `applied_quantity`, plus whatever the user owns.
      Chosen over "recompute the line from its contributions on every change"
      because checked, hand-edited and manually-added lines are deliberately
      frozen (0013's rails, decision #8) and a full recompute would overwrite
      amounts the user owns. Existing rows backfill `applied_quantity =
      quantity`, which is exactly today's behaviour, so applying the migration
      cannot itself move a single number.
      **SAFE FOR THE PHONES** (the 0022 lesson): it only ADDS a column and
      replaces function bodies – no signature changes, nothing dropped – so
      TestFlight build 12 keeps working unchanged.
      - [x] **APPLIED 2026-08-03**, verifying select returned all four columns
            true (applied_column, backfilled, withdraw_fn, rescale_fn).
            **This one IS on everybody's phone already** – a database change
            reaches every client the moment it runs, unlike app code which
            waits for the next build. So #2 is fully fixed for the family and
            for TestFlight build 12, while #1, #5 and #6 are still only on the
            dev build. That asymmetry is the code-vs-live distinction the
            2026-07-27 outage taught, running in the good direction for once.
- [x] **3. FIXED 2026-08-04 (NOT YET WALKED ON A DEVICE – see below).
      "This week" was frozen at app launch, so a meal could land on last
      week.** [src/lib/shopping-list.tsx](../src/lib/shopping-list.tsx)
      and [src/lib/meal-plan.tsx](../src/lib/meal-plan.tsx).
      Both providers computed the current week ONCE at mount (empty-dependency
      useMemo) and never recomputed. Returning to the foreground called
      `refresh()`/`retry()`, neither of which recomputed the week. Leave the
      app open across a week boundary (Sunday night → Monday) and it still
      treated the finished week as "this week" – so a meal added to what looks
      like the current week actually landed on the PREVIOUS week's plan and
      list.
      DONE as ONE shared clock, [src/lib/use-today.ts](../src/lib/use-today.ts)
      (`useTodayKey` + `useCurrentWeekStart` derived from it), rather than the
      same wiring in two providers and `new Date()` in three components.
      - **The audit's suggested fix was not enough, and this is the
        interesting part.** It said "recompute on the AppState active handler
        and inside refresh()". But `active` only fires when the app COMES BACK,
        and the bug as written is about an app *left open* – which never
        backgrounds, so `active` never fires and nothing would have recomputed.
        The suggestion fixes the overnight-and-reopened case and misses the
        literal one. The clock therefore does both: a foreground handler AND a
        tick.
      - **⚠️ THE REACT COMPILER FREEZES `new Date()` IN A RENDER BODY. Read
        this before writing any date-dependent UI.** Found 2026-08-04 when
        Thomas tested the fix: the week rolled over correctly at 00:00 and
        Monday was NOT marked as today. `reactCompiler: true` (app.json)
        memoizes render-body expressions by their reactive inputs, and
        `toDateKey(new Date())` has NONE – so it is cached for the lifetime of
        the component and never recomputed, however many times that component
        re-renders. It LOOKS like live code and behaves like a value frozen at
        mount. This is the documented React Compiler caveat about impure render
        code (`Date.now()`, `Math.random()`), and it means an earlier note in
        this very entry was WRONG: three components were dismissed as safe
        "because they recompute on every render", and none of them did.
        Fixed at [(plan)/index.tsx](../src/app/(plan)/index.tsx) (the day
        highlight), [week-bar.tsx](../src/components/plan/week-bar.tsx) (which
        day cells are greyed out as past) and
        [add-to-plan-sheet.tsx](../src/components/recipes/add-to-plan-sheet.tsx)
        (which DAY a meal lands on, and the floor for navigating back) – all
        three now take the clock from the hook.
        THE RULE: never read the clock during render. It is not live, whatever
        it looks like. Take it from `useTodayKey`/`useCurrentWeekStart`.
      - **One clock, two values, so they cannot disagree.** The week is derived
        from the day key rather than read separately – the inconsistency Thomas
        saw (week says Monday, highlight says Sunday) is structurally
        impossible now. It is one module-level ticker with
        `useSyncExternalStore`, so every consumer changes on the same tick and
        the app has ONE timer rather than one per component.
      - **The tick is dumb and short (10s), after the first version failed on
        the phone.** That version scheduled a single timer to land exactly on
        midnight, capped at 15 minutes so React Native never saw a multi-day
        `setTimeout`. The flaw: a timer fires after that much REAL time has
        passed and knows nothing about the wall clock moving underneath it.
        Thomas set the phone's clock forward to Sunday 23:58 with the app open,
        and the pending timer still had its original delay to run – simulated
        against the real `week.ts`, it would have rolled over at **00:11**,
        eleven minutes late. Not merely a test artifact: a phone coming back
        from being switched off, or correcting itself against the network, jumps
        its clock the same way. Re-reading the clock every ten seconds has none
        of that cleverness and none of its failure modes; the cost is a date
        read and a string compare six times a minute, foreground only, and
        nothing is notified unless the day actually changed.
        The `msUntilNextWeekStart` helper the clever version needed was deleted
        rather than left behind as dead code.
      - **Who follows a roll-over.** Someone looking at what used to be "this
        week" is moved onto the new one: that is the week they think they have
        open, and where a meal they add should land. Someone who had
        deliberately navigated BACK to an older week stays there – it simply
        stops being current, and on Shopping "Move all items to this week"
        appears for it like any other past week.
      - **The two providers do it differently, on purpose.** Shopping reuses
        `viewWeek`, which resolves the week's list against the SERVER
        (`getOrCreateListId`). Plan cannot: its `viewWeek` looks the week up in
        the weeks list already in state, and a plan another phone created for
        the new week is not in it yet – so Plan re-runs its boot instead, which
        already is "load the weeks, THEN load the viewed week's entries". It
        bumps `bootAttempt` only, never `retry()`, so the Live badge is left
        alone; nothing about a new week says the connection changed.
      - **The boot effects no longer depend on the week.** They read it from a
        ref instead, so a boundary crossed mid-session cannot re-run them (a
        re-run would have swapped the visible list out from under a shopper).
        The same ref is what makes a "Try again" pressed AFTER a roll-over
        resolve the NEW week rather than the one the provider mounted on.
      - **This also fixes the leftover-move's inherited copy of this bug** –
        the "Move all items to this week" note under In flight. The move target
        is now the live week, so it can no longer aim at a week that has since
        become last week.
      - [x] **The week roll-over itself is CONFIRMED ON DEVICE 2026-08-04**
            (Thomas, clock set to Sunday 23:58): *"it switched on 00:00 to a new
            week"*. The day highlight was the same test's second finding, fixed
            above.
      - [x] **Verified off-device, the parts that can be.** The shared clock was
            run headless against the real `use-today.ts` and `week.ts` under
            TZ=Europe/Copenhagen, with a stubbed AppState and a controllable
            clock – 18 checks: the day turns at midnight and the week turns with
            it, day and week always agree, nothing is notified on a day that did
            not change, a second consumer reuses the one ticker, the ticker
            stops only when the last consumer unmounts, a foreground catches up
            a week-old clock, and a remount re-syncs a stale module value.
            Typecheck and lint clean.
      - [x] **WALKED AND PASSED ON DEVICE 2026-08-07** (dev build 09:38),
            three days after the code was written. Both tabs opened, weeks
            switched, a meal added and removed with the shopping list following
            it, then force-quit and reopened and the same again. Thomas: *"7
            passed"*, *"8 same findings"*.
            **SO THE EFFECT-DEPENDENCY SURGERY IN BOTH PROVIDERS DID NOT BREAK
            ORDINARY USE**, which is the single question this item existed to
            answer – the 2026-08-03 retry-button lesson being that error paths
            and rewired effects are exactly what review passes and use breaks.
            The walk did surface one thing, but it turned out to predate this
            work by three weeks – see the shopping week-switcher item under
            Known bugs.
      - [x] **A RACE THIS INTRODUCED, found and fixed 2026-08-04 while chasing
            something else.** The first version had the roll-over call
            `viewWeek` on the shopping side. That starts a SECOND chain
            alongside a boot that may still be in flight, and the boot is four
            round trips deep against viewWeek's two – so the boot lands LAST
            and puts the old week's `listId` and items under the new week's
            label. The list then looks fine while quietly belonging to the
            wrong week, and a meal added to the current week contributes to a
            list that is not on screen.
            Fixed by having the roll-over RE-RUN THE BOOT (bump `bootAttempt`)
            instead: React runs the previous run's cleanup first, which sets its
            `cancelled` flag, so the older chain drops itself. One code path,
            no race, and it now matches what the plan provider does.
            A guard was added to the boot as well, for the case
            `bootAttempt` cannot cover: a `viewWeek` does NOT cancel an
            in-flight boot, so a week switched during a slow boot would
            otherwise be overwritten by it.
            NOTE this was NOT what Thomas was reporting – that turned out to be
            the missing "changed in the plan" marker, first item under Known
            bugs. The race is real but was found by reading the code, not from
            the symptom. LESSON: a plausible mechanism that explains the
            symptom is not the same as the cause. The thing that separated them
            was evidence – `git log -S` proving the marker was never built –
            not more reasoning about the mechanism.
- [x] **4. FIXED 2026-08-04. Imported text showed raw codes, and some amounts
      vanished.** [src/lib/recipe-import.ts](../src/lib/recipe-import.ts).
      `cleanText` decoded NUMERIC HTML entities but only six named ones, so
      `&rsquo;` `&eacute;` `&ndash;` survived as gibberish in titles, steps and
      ingredient names. Worse, `&frac12;` was not folded to ½ and the amount
      parser is ASCII-only, so `&frac12; cup sugar` failed to match a leading
      amount and was stored as the NAME with no quantity – the amount silently
      lost on the shopping list. Mostly sites using the microdata/meta fallback
      rather than the dominant JSON-LD path.
      DONE: a curated `NAMED_ENTITIES` table (~110 – Latin-1 in both cases,
      punctuation, all 15 fractions, symbols) read by ONE pass, replacing the
      six hand-written replaces. An entity NOT in the table is left VISIBLE
      rather than swallowed, so the next unknown one is obvious instead of
      mysterious. The fraction half needed nothing else: `&frac12;` → ½ meets
      the vulgar-fraction folding already built on 2026-07-29, so
      `&frac12; cup sugar` now parses as quantity "1/2 cup", name "sugar".
      TWO ORDERING RAILS, both commented in place because both are traps:
      `&amp;` is decoded LAST and deliberately kept OUT of the table, or a
      literal `&amp;#39;` would become an apostrophe it never was; and numeric
      entities are decoded BEFORE the named pass for the mirror-image reason.
      Invisible characters (`&shy;`, `&zwnj;`, `&zwj;`) are dropped rather than
      decoded – one inside an ingredient name would travel into
      `item_merge_key` and split a shopping row for no visible reason.
      - [x] **Verified by running the REAL module, not a mirror** – the lesson
            from the reconciler rounds. `recipe-import.ts` has zero runtime
            imports, so `npx tsc --ignoreConfig` on that one file produces a
            module node can import, and the actual `splitIngredient` was
            exercised over 20 cases: every fraction entity, accented text in
            three languages, the established rails (`400 g cherry tomatoes`,
            `2 fed hvidløg`, ranges, numeric entities), and the awkward ones –
            an unknown entity stays visible, a double-escaped ampersand is not
            decoded twice, a soft hyphen never reaches a name. Typecheck and
            lint clean. **Worth reusing: that transpile trick makes any
            import-free lib module directly testable.**
      - [x] **Dashes joined the trailing-punctuation strip**, beyond the
            reported symptom and flagged rather than slipped in. The case grid
            showed `beef – diced` leaving `beef –` on the list: the comma-less
            prep cut takes the prep word and left the separator. Pre-existing –
            it happens with a literal dash too – but decoding `&ndash;` made it
            visible. `beef – Wagyu` is untouched, since only a DANGLING
            separator is removed.
      - [x] **SHIPPED in TestFlight build 15** (2026-08-04, VALID). Note that
            recipes imported BEFORE it keep their old text – the fix only runs at
            import time, and there is still no re-import action (see the
            re-import gap under Code debts).
- [x] **5. FIXED 2026-08-03. Three screens could strand the user on an endless
      spinner.**
      [src/app/recipes/index.tsx:114](../src/app/recipes/index.tsx) (and
      42-46), `src/app/recipes/[id].tsx`:115-140, and the shopping week-switch
      at [src/app/shopping.tsx:150](../src/app/shopping.tsx).
      All only log load failures to the console, then render a bare spinner
      forever – the recipe-detail spinner has no header, so there is not even
      a visible Back button. A failed first load (offline, or a recipe another
      member just deleted) leaves the user stuck. The shopping week-switch is
      not covered by the boot-only error banner, so the list can go blank with
      no spinner and no message.
      **This is exactly the Plan-tab silent-spinner class fixed on 2026-07-27** –
      the shared `LoadError`/"Try again" component already exists and was
      simply never applied here.
      DONE, all three reusing the designed `LoadError` (Figma 392:11911), no
      new UI invented:
      - **Recipes tab** – a failed FIRST load now offers a retry. A later
        refocus that fails deliberately KEEPS the recipes already on screen
        instead: stale rows beat an error block over content that is still
        good.
      - **Recipe detail** – both the loading and the error state now carry the
        header, so there is always a Back button. Without it a failed load
        (offline, or a recipe another member just deleted) left the screen
        with no way out at all.
      - **Shopping week switch** – the real fix was in the provider, not the
        screen. The error condition was `loading && live === 'offline'`, which
        INFERRED failure from being offline and so missed every server-side
        failure (the 2026-07-27 outage shape) – the list just went blank, no
        spinner, no message. `shopping-list.tsx` now has a real `failed` flag
        set by the catch blocks of both the boot load and `viewWeek`, and
        retry reloads the VIEWED week rather than silently dropping the
        shopper back onto the current one.
      **CONFIRMED ON DEVICE 2026-08-03** (dev build, `app.prepeat.dev`) –
      screenshots of all three retry screens, Thomas: *"both works now"*. Not
      on any tester's phone until build 15, which shipped 2026-08-04.
      Two follow-ups came straight out of that testing, both now fixed:
      - **Shopping had no loading state at all.** The list area just stayed
        blank while loading – a deliberate choice (a code comment explained it
        avoided flashing the empty state at a household that has items) with
        the wrong solution, since blank is indistinguishable from broken.
        Plan and Recipes both spin; Shopping now matches, guarded on an empty
        list so a background refresh never replaces rows with a spinner.
      - **"Try again" looked dead on the launch-failure path.** It kicked off
        a reload but never cleared `failed`, so the badge flipped to
        "Connecting" while the error block sat there unchanged. Introduced by
        the `failed` flag above – a new state with no loading state to fall
        back to. `retryLoad` now dispatches `begin-load` first.
      **The lesson, and it is the recurring one:** both were found by Thomas
      in two minutes on the device and by nobody in review – the audit, the
      typecheck, the lint and the adversarial verifiers all passed code whose
      RETRY BUTTON DID NOTHING VISIBLE. Error paths are exactly the code that
      is never exercised by ordinary use, so "it compiles" says almost nothing
      about them. Walk them on a device.
- [x] **6. FIXED 2026-08-02 (stopgap, improvisation flagged). The invite code
      was printed in low-contrast lime, 2.01:1.**
      [src/components/onboarding/onboarding-flow.tsx:267](../src/components/onboarding/onboarding-flow.tsx)
      On the "household is ready" step the code is rendered in link-lime
      #56C91D on the near-white #F8F7F7 panel – below the 4.5:1 AA minimum and
      below even the 3:1 large-text floor. This is the ANSWER to the "not yet
      checked inside the app" question on the DS `text/link` nit under Code
      debts: yes, it is in the app, and it landed on the worst possible text –
      the code a new user must read accurately to give a family member full
      access to the household.
      DONE: swapped to `text/default` (#4F4230), measured **9.12:1** on the
      #F8F7F7 panel – clears both the 3:1 large-text floor and the 4.5:1 body
      bar with room to spare. One token, no layout change.
      **CLOSED 2026-08-02 – the improvisation flag was withdrawn, correctly.**
      It was raised because no Figma frame exists for the fixed state, and
      Thomas challenged it: *"didn't we just fix that with making the text
      color text/default"*. He is right, on both counts the flag rested on:
      - **It was never an invention.** The 2026-07-17 rule exists to stop
        Claude's improvisation passing as Thomas's design. `text/default` is
        what [invite-someone-sheet.tsx:145](../src/components/household/invite-someone-sheet.tsx)
        ALREADY used for the very same code – so this change made two screens
        agree with a decision Thomas had already made, rather than inventing a
        third treatment. Matching an existing design is not improvising.
      - **"It now reads like body text" was wrong**, and the on-device
        screenshot settles it: 32px, emphasized, centred in its own chip with
        a copy icon. It reads as a code.
      A filled brand chip (white on #378112, 4.87:1) was measured and would
      also work, but that is an ENHANCEMENT IDEA, not an outstanding defect –
      logged under Ideas, not carried here as unfinished work.
      The DS-side retune of `text/link` is the separate, slower fix – see the
      DS nit under Code debts.
- [x] **7. FIXED AND APPLIED 2026-08-07 (migration 0033) – and the finding was
      badly understated. THE THROTTLE HAD NEVER WORKED AT ALL.**
      **⚠️ THE HEADLINE, because everything else follows from it.** This entry,
      and the audit that produced it, both assumed 0012's "10 tries per hour"
      was real protection with the wrong KEY. It was not weak protection. It was
      **none** – for six weeks, including through the whole App Store
      submission.
      **THE MECHANISM IS ONE LINE OF STRUCTURE, NOT A TYPO.**
      `join_household_with_code()` inserts the attempt row, then RAISES on a bad
      code. An unhandled raise aborts the transaction and PostgREST rolls the
      request back – **so the insert made three lines earlier is undone. Every
      failed guess erases its own evidence.** The table only ever accumulated
      SUCCESSFUL joins, which is exactly what production held: 2 rows, both real.
      **PROVED, NOT REASONED ABOUT.** 15 wrong guesses in 15 separate
      transactions recorded **0** attempts, and the 16th was still answered
      "Invalid or expired invite code" rather than "Too many attempts". So the
      real exposure was ~123,000 guesses to land in one of 5 households – under
      an hour at ordinary request rates, from ONE account, with nothing slowing
      it down.
      LESSON, and it is a new one for this project: **a security control that is
      never exercised is indistinguishable from one that does not exist.** Nobody
      had ever made a wrong guess on purpose. Code review passed it twice (0012
      itself, then the 2026-08-02 audit) because reading it top to bottom, the
      logic is correct – the defect is in what the database does AFTER the raise,
      which is invisible unless you run it. Same family as the 2026-08-03 retry
      button that did nothing: error paths are exactly the code ordinary use
      never touches.
      **THE FIX, chosen by Thomas 2026-08-07** from three options (global cap /
      longer code / both): a **global cap of 30 attempts per hour**, keeping the
      short fridge-worthy code that was a deliberate product decision in 0003.
      **WHY IT IS TWO SEQUENCES AND NO TABLE.** A global counter kept in a table
      would vanish exactly the way the per-account one does – same transaction,
      same rollback. The counter has to survive a rolled-back transaction, and in
      Postgres precisely one thing does: **sequences**. `nextval`/`setval` are
      explicitly non-transactional. Usually that is a footnote about gaps in id
      columns; here it is the entire mechanism. `invite_guess_counter` holds the
      count, `invite_guess_window` holds the window start as epoch seconds.
      **THE CAP IS CHECKED BEFORE THE CODE IS LOOKED UP, deliberately.** Checking
      validity first would spare legitimate joiners – and would also be useless,
      because a sweep still allowed to LOOK UP every code will eventually hit a
      live one however carefully we count afterwards. The lookup is the thing
      that has to stop.
      **ACCEPTED COST, Thomas's call:** an attacker can burn the hourly budget on
      purpose and make legitimate joining fail for up to an hour. A mild denial
      of service against a rare action, traded against a stranger landing inside
      a family's household. The refusal reuses 0012's exact wording, so every
      installed build already shows the right friendly message
      ([household.ts:216](../src/lib/household.ts)).
      - [x] **⚠️ A SUPABASE DEFAULT NEARLY HANDED THE LIMITER TO THE ATTACKER,
            and the test caught it.** Supabase ships `alter default privileges
            in schema public grant all on sequences to anon, authenticated, …`
            so serial columns work. So both new sequences were born with UPDATE
            granted to `anon` and `authenticated` – and **UPDATE is exactly the
            privilege `setval()` needs.** A counter the guesser can reset to zero
            is not a counter.
            Found because the harness ASSERTS the property instead of assuming
            it: the check "a signed-in client CANNOT reset the guess counter"
            failed on its first run. Closed with a REVOKE, and the verifying
            select now proves it for `anon` too – the anon key ships inside every
            copy of the app and is not a secret.
            Not reachable through PostgREST today (`setval` lives in
            `pg_catalog`, which is not an exposed schema), but **"the app cannot
            reach it" is the precise reasoning that left findings #9 and #10
            standing for six weeks**, so it was closed rather than argued away.
            **CARRY THIS FORWARD: any NEW sequence in `public` is born the same
            way.** Revoke, or it is public by default.
      - [x] **VERIFIED BY RUNNING IT, 19 checks in
            `supabase/tests/household-boundary.sql`.** The one that matters is
            *"the counter SURVIVED 30 rolled-back guesses"* – 0012's counter reads
            0 there, and that single assertion is the whole difference between
            this migration and the one it replaces. Also proved: 30 wrong guesses
            are answered "invalid" rather than blocked, the 31st is refused as
            "too many" **in the exact wording shipped builds match on**, a valid
            code is refused too while over the cap (the accepted cost, asserted
            so it cannot be a surprise later), and the window genuinely reopens
            after the hour.
      - [x] **APPLIED 2026-08-07** – backup, full replay onto an empty database,
            harness, dev, production dry-run read, production. Verifying select
            all six columns true on local, dev AND production. `backup:verify`
            run twice on purpose: once on the pre-migration archive and again on
            a post-migration one, because 0033 introduces a new KIND of object
            and the restore had never carried a sequence before. It does – and it
            carries the REVOKE with it, so a rebuilt database is not born wide
            open. 7,254 rows exact both times; production data untouched
            (5 households, 7 memberships, 5 live codes).
      - [ ] **WHEN TO RAISE THE CAP – and why raising it is the wrong instinct.**
            30/hour is enormous headroom today (the whole app sees a handful of
            joins a MONTH) and turns a sweep from under an hour into ~170 days.
            But the protection weakens on its own as households multiply, because
            more live codes means fewer guesses to hit one: ~615 guesses at 1,000
            households. So this buys years at today's size and months at a
            hundred times it. **The fix that actually scales is the longer code**
            (option B below: 6 characters is 481 million instead of 614,656, or
            ~780×). Revisit that at real growth rather than repeatedly raising a
            number that weakens the guard every time it moves.
      The original finding, kept for the record:
      **The invite-code guess limit is per-account, so extra sign-ups
      bypass it.** `supabase/migrations/0012_throttle_invite_redemption.sql`
      :37-49. Joining is the one action that crosses the household boundary
      for a non-member, and the only guard on the 4-character code is 10
      tries/hour keyed to the individual ACCOUNT – so N throwaway accounts get
      10×N parallel guesses. A hit lands the guesser in a stranger's
      household with full access to its recipes, plan, list and every member's
      name and email. Mitigated by the tiny launch user base, the 14-day
      expiry, and that it only ever lands them in a RANDOM household, never a
      chosen one. Not a launch blocker – the verifier said so explicitly.
      **⚠️ THE AUDIT'S SUGGESTED FIX DOES NOT WORK, worked out 2026-08-07 while
      building 0032.** It said "throttle by the CODE being guessed". But a sweep
      tries each code ONCE – that is what a sweep is – so a per-code cap of 10
      is never reached by the attack it was written for. Wrong axis entirely.
      **AND THE REAL NUMBERS ARE WORSE THAN THE ENTRY SUGGESTS**, because the
      guesser does not need a CHOSEN household, only ANY live code. So the
      difficulty is the code space divided by the number of live codes, and it
      falls as the app succeeds:
      | live codes | guesses to land in someone's household | at 100 throwaway accounts |
      |---|---|---|
      | 5 (production today) | ~123,000 | ~5 days |
      | 20 | ~30,700 | ~31 hours |
      | 200 | ~3,100 | ~3 hours |
      | 1,000 | ~615 | under an hour |
      (28^4 = 614,656 codes; 10 guesses/hour/account.) **So what protects the
      app today is that it has 5 households – not the throttle.** That is the
      opposite of a mitigation that survives launch, and it is why this stopped
      being a comfortable post-launch item.
      **AWAITING A DECISION FROM THOMAS – three options, deliberately not
      chosen** (the 2026-08-04 rule: a choice surfaced during implementation is
      a decision, not a detail):
      - **A. A GLOBAL cap on failed redemptions** (say 30/hour across the whole
        app). Cheap, one migration, no UX change, and it is the only option that
        actually scales with the table above. Cost: an attacker can also spend
        that budget to block legitimate joins for an hour at a time – a denial
        of service, but a mild one against a rare action.
      - **B. A LONGER CODE.** 6 characters is 481 million instead of 614,656, so
        every row of that table grows by ~780×. Costs the fridge-worthy short
        code, which was a deliberate product choice (0003), and touches the
        designed Invite sheet – so it is a design conversation, not just SQL.
      - **C. Both**, which is what a bank would do and probably more than a
        family meal planner needs today.
      Whatever is chosen, the per-account cap stays: it is not useless, it just
      does not address this.
- [x] **8. FIXED AND APPLIED 2026-08-03 (migration 0027). `liter` and `liters`
      split into two shopping rows, a regression from migration 0024.** `supabase/migrations/0024_merge_key_ignores_unit_
      plural.sql`:61. The unit normalizer stripped a trailing `s` OR `r` to
      merge duplicates. That fixes clove/cloves but breaks any unit whose
      singular ends in r: `liter` → `lite` while `liters` → `liter`, so
      "1 liter milk" and "2 liters milk" never merge. Same shape for
      jar/jars and container/containers. Narrow but it shipped on 2026-07-30,
      three days before this audit.
      THE `r` WAS NOT A TYPO, which is why the fix needed a decision rather
      than a revert: Danish plurals end in -r (dåse → dåser, pakke → pakker),
      so that half was doing real work. English singulars can end in r and
      Danish plurals do, so no single letter rule serves both languages – the
      two cases have to be told apart by name.
      DECIDED 2026-08-03 (Thomas, option A of three offered): keep a blanket
      strip for the English plural `s`, and handle the Danish -r/-er plurals
      with a short explicit list. Rejected: a full unit map in SQL (a longer
      list to keep in step with the client's for no extra coverage today), and
      leaving it alone (cheap, but the fix is one small migration).
      Blanket s-stripping is safe even on the Danish units that END in s, and
      this is why the s half of 0024 never caused trouble: `glas` and `ris` are
      the same word in the plural, so both forms fold to the same key whatever
      the rule does to them. Only a rule that folds singular and plural
      DIFFERENTLY splits a row.
      DONE as `0027_merge_key_plural_s_only.sql`. It also fixes four cases 0024
      got wrong that nobody had noticed: the English sibilant plurals
      (`pinches` → `pinche`, and the same for bunches/dashes/boxes) now lose
      the whole `es`. 0024's deliberate `gr` → `g` fold is carried over
      explicitly so legacy gram rows keep merging.
      **SAFE FOR THE PHONES** (the 0022 lesson): it replaces a function BODY
      only – no signature change, nothing dropped – and `item_merge_key` is
      called at runtime rather than stored in a column or an index, so there is
      nothing to reindex. Builds 12 and 13 keep working and pick up the better
      merging the moment it runs, because the merge happens on the server.
      - [x] **APPLIED 2026-08-03**, verifying select returned all eight columns
            true (liter_fixed, jar_fixed, container_fixed, cloves_still_merge,
            danish_still_merges, pinches_now_merge, legacy_grams_kept,
            short_units_untouched). **This one IS live for everybody already** –
            a database change reaches every phone the moment it runs, so builds
            12 and 13 both merge liters correctly from now on.
      - [x] **The DISPLAY half landed too, 2026-08-03** (Thomas asked for it
            after the migration): `UNIT_SINGULARS` in
            [src/lib/quantity.ts](../src/lib/quantity.ts) is what turns a
            plural into a readable singular at "1", and it had the same gap –
            an item stored as "liters" and scaled down to 1 printed
            "1 liters". Added the r-ending singulars (liter, litre, jar,
            container), the remaining English plurals a recipe uses (bags,
            packs, boxes, dashes, glasses) and the Danish ones, since the UI
            language is English but the recipes are not.
            NOTE THESE ARE TWO LISTS DOING TWO JOBS, not a duplication to
            collapse: this one produces text a shopper reads, `norm_item_unit`
            produces a key nobody ever sees. Kept in the same shape so adding
            a missing unit is one obvious edit in each. **App code, so it is on
            dev build only** at the time; SHIPPED in TestFlight build 15.
            Known limit, not fixed: a multi-word unit never matches either list
            ("2 liters milk" typed wholly into the quantity field stays
            "1 liters milk"). Not reachable today, because name and quantity
            are separate fields; it becomes real if the "Milk 2L" smart-parsing
            idea is ever built.
      - [x] **AND THE OTHER DIRECTION, which is the common one** – found by
            Thomas on the device within minutes of the build above: a recipe
            storing "1 liter milk" doubled to x2 servings read "2 liter". The
            fix above only ever turned a plural INTO a singular at 1; nothing
            put the s back at 2, so scaling a recipe – the everyday action, far
            more common than editing an amount down to 1 – was the case left
            broken. `formatQuantity` now uses `UNIT_PLURALS`, derived by
            INVERTING `UNIT_SINGULARS` so the two directions cannot disagree
            and a new unit is still a one-line edit. Abbreviations are absent
            from both lists, which is what keeps "2 g" and "2 tsp" from growing
            an s, and so are the Danish invariants (glas, ris, fed).
            LESSON, and it is the 2026-08-03 retry-button one wearing a
            different hat: a fix aimed at the symptom that was REPORTED can
            leave the same defect standing in the direction nobody mentioned.
            "1 liters" was the example given, so that is what got fixed and
            what got tested – 14 units checked at quantity 1, none at 2. The
            question worth asking before calling a display fix done is what the
            value is the REST of the time, not just at the one value in the
            bug report.
      - **It does not repair existing rows**, same as 0024: this changes how
        rows are MATCHED from now on. A week's list that already holds milk
        twice keeps holding it twice until that week is rebuilt (remove the
        meals and add them again). New weeks merge correctly.
      - **Two-stage verification, worth copying** – there is no local Postgres
        on the Mac, so the fold RULE was proved first by mirroring it in Python
        and running it over every unit the importer knows plus the Danish ones
        (all 36 singular/plural pairs merge, no two unrelated units collide,
        and g/kg/ml/dl/l/oz/tsp/tbsp/stk/tsk/spsk/fed are untouched). That is
        what caught the `pinches` → `pinche` case 0024 also got wrong. The SQL
        itself was proved only by the verifying select above. Neither step
        substitutes for the other: the simulation cannot catch a syntax error,
        and an all-true select on three examples would not have found pinches.
- [x] **9. FIXED AND APPLIED 2026-08-07 (migration 0032), together with #10 –
      see the shared write-up under #10.**
      **A raw API call could leave an account belonging to zero households.**
      `supabase/migrations/0001_households_and_shopping_lists.sql`:157.
      The leave rules – reject leaving your only household, snapshot recipes
      on the way out for GDPR – live in the `leave_household` FUNCTION, which
      the app always calls. But the underlying delete-your-own-membership
      permission has no such guard, so a direct API client using the shipped
      anon key could delete its only membership row and break the "every user
      always belongs to a household" invariant, or leave a shared household
      with no copy-on-leave snapshot. Unreachable from the UI; blast radius is
      the caller's own account only.
      FIX: tighten the delete-self policy so it cannot remove a solo
      membership, or revoke direct delete on `household_members` and force
      every leave through the function.
- [x] **10. FIXED AND APPLIED 2026-08-07 (migration 0032).**
      **A member could mint a never-expiring invite code via raw API.**
      `supabase/migrations/0001_households_and_shopping_lists.sql`:165-169
      (and :52). The 14-day expiry is enforced only in the rotate function,
      not in the database: the expiry column is nullable with no default, the
      insert permission never checks it, and the redeem function still accepts
      codes with no expiry. So a CURRENT member using the anon key directly
      could plant an indefinitely-valid code – e.g. to rejoin after leaving.
      Requires an already-trusted insider using off-app tooling, exposes
      nothing to outsiders, and self-heals: the next "New code" rotation
      retires the planted code.
      FIX: make the expiry NOT NULL with a 14-day default plus a CHECK that it
      is in the future, and drop the "no expiry" branch from redeem.

      **DONE as `0032_household_boundary_only_through_functions.sql`, both
      findings in one migration because they are ONE MISTAKE MADE TWICE.** Each
      time, a rule was written into a SECURITY DEFINER function, the app was
      taught to call that function – and the raw TABLE PERMISSION the function
      was meant to replace was left switched on. The app obeys the rule because
      the app uses the front door. The anon key ships inside every copy of the
      app and is not a secret, so anyone can walk round the back.
      **THE FIX REMOVES THE BACK DOOR RATHER THAN PUTTING A LOCK ON IT**, and
      the audit's "tighten the policy" alternative was rejected for both: a
      tightened delete policy would still skip the GDPR copy-on-leave snapshot,
      and a tightened insert policy would be a second way to mint a code that
      must agree with `rotate_invite_code()` forever. One path is testable; two
      paths that must agree are a future divergence. Concretely, `0032`:
      - drops `household_members_delete_self`, so leaving is only
        `leave_household()` (guards + GDPR snapshot) and account deletion only
        `delete_profile()`;
      - drops `household_invites_insert`, so `rotate_invite_code()` is the only
        way a code exists at all;
      - makes `expires_at` NOT NULL with a 14-day default, and removes the
        null-expiry branch from redeem.
      **A CHECK CONSTRAINT WAS THE OBVIOUS FIX AND WOULD HAVE BEEN A TRAP,
      twice.** `check (expires_at > now())` reads right, but `rotate_invite_code`
      retires an old code by setting `expires_at = now()`, which the check would
      reject – and worse, a CHECK against `now()` **re-validates on RESTORE**, so
      every backup containing an expired code would refuse to load. The restore
      path is verified machinery here and must not become conditional on the
      clock. NOT NULL does the job with none of that.
      **SAFE FOR THE PHONES, and checked rather than assumed** – dropping a
      policy reaches every installed build the instant it runs. All 11 revisions
      of `src/lib/household.ts` in git history were scanned: not one issues a
      direct delete on `household_members` or a direct insert into
      `household_invites`. Leaving, account deletion, household deletion and
      code minting have always gone through the four SECURITY DEFINER functions,
      which bypass RLS and are untouched. The one direct write that does exist –
      `createHousehold()` inserting the creator's own membership – uses
      `household_members_insert_creator`, deliberately left alone. Builds 12–16
      keep working unchanged, and **this is live for everybody already**, no app
      change needed.
      - [x] **PROVED BY RUNNING THE SQL, not by mirroring it – the harness the
            2026-08-04 note asked for now exists and this is its first use.**
            `supabase/tests/household-boundary.sql` walks 12 checks as a real
            RLS-bound client against local Postgres: creator bootstrap still
            works, `rotate_invite_code` still mints a 14-day code, a raw invite
            insert is refused, a raw membership delete removes NOTHING, leaving
            your only household is still refused with its proper message, a live
            code still lets someone join, an expired one does not, and leaving
            still works when another household remains.
            **MOST OF THE CHECKS ASSERT THAT SOMETHING STILL WORKS**, which is
            the point: the risk in dropping a policy is never "did the hole
            close" (the verifying select shows that) but "did a legitimate path
            close with it".
      - [x] **APPLIED 2026-08-07** – backup first, all 32 migrations replayed
            onto an empty local database, dev, then production dry-run read,
            then production. Verifying select returned all six columns true on
            local, dev AND production; `backup:verify` re-run afterwards, 7,254
            rows restored exact. Production still holds 7 invites, 5 live codes,
            7 memberships – the migration moved no data.
      - [x] **WALKED IN THE APP ON DEVICE 2026-08-07** (dev build 09:38, dev
            database, both migrations already applied there). Thomas: *"List A
            1 to 4 is passed"* – the invite sheet shows a code, "New code"
            rotates it, creating a household works, joining with a code works,
            and a wrong code still says *"That code is not valid"* in plain
            language rather than a raw database error.
            **CORROBORATED IN THE DATA, not just on screen** – worth doing
            because a screen can look right for the wrong reason. Dev shows the
            join landing at 09:40:58 and the household creation at 09:42, both
            AFTER the migrations went on at ~09:21; and TestKitchen's previous
            code (6 Aug) is now dead with a fresh one minted 09:41, so
            rotate_invite_code still retires the old code with the raw insert
            permission gone.
            - [x] **LEAVING WALKED AND PASSED 2026-08-07** on the 2-member
                  TestKitchen, after a first attempt that failed on a bad
                  instruction: leaving is not in the switcher but under Edit
                  profile, and it only appears when the household has another
                  member – so the freshly created solo household had nothing to
                  leave either way.
                  **THE DATA IS THE PROOF, and it covers the two things
                  dropping `household_members_delete_self` could have broken.**
                  Thomas is out of TestKitchen while **thomas@sebell.dk is still
                  in it**, so the delete was scoped to the caller alone rather
                  than clearing the household; and "Tom's Kitchen" was created
                  09:47:40 holding **2 recipes, both with
                  `forked_from_recipe_id` set**, so the GDPR copy-on-leave
                  snapshot ran. TestKitchen keeps its own 2.
                  That is the whole reason the policy was dropped rather than
                  tightened – a tightened policy would have permitted a raw
                  leave that skipped exactly this snapshot.
      - [x] **THE VERIFYING SELECT CAUGHT ITSELF, first run, and the lesson is
            worth more than the bug.** `redeem_rejects_null_expiry` came back
            FALSE against a function body that was perfectly correct – because a
            COMMENT I had written inside that body said "the `expires_at is
            null` branch is gone", and the check greps `prosrc` for exactly that
            phrase. A prose-matching check reads the comments too.
            Fixed on both sides: the comment is reworded, and the column now
            asserts the negative AND the positive (`prosrc like '%0032%'`) –
            because "the old branch is absent" is also true of a function that
            was never replaced, while "this body knows it is 0032" is what
            proves the new body landed. That positive half is 0030's lesson;
            the negative half is this migration's.

**Verification of the 1 + 6 fixes: CONFIRMED ON DEVICE 2026-08-02.** Typecheck
and lint clean, every NativeWind class checked to exist elsewhere in `src/`
(worth doing explicitly – `tsc` does NOT catch an invented class name, so a
typo fails silently at runtime as unstyled text), then built to Thomas's
iPhone with `./scripts/build-iphone.sh` and walked through. Finding 6 is
evidenced by a screenshot of the real "… is ready" screen: the code renders in
dark `text/default`, not lime. Thomas: *"everything checks out"*.
Note this is the **dev build** (`app.prepeat.dev`, 2026-08-02), NOT a numbered
TestFlight build – neither fix is on any tester's phone until the next EAS
build ships. Per the definition-of-done rule from
[lessons-from-building-prepeat.md](lessons-from-building-prepeat.md) that
distinction is the whole point: verified ≠ delivered.

Two things learned while verifying, worth keeping:
- **The invite-code screen is FIRST-RUN ONLY.** Creating a household from the
  switcher (`create-household-modal.tsx`) goes straight to a Welcome screen
  with no code – you get the code afterwards from Household → Invite someone.
  Only a brand-new account with no household sees the onboarding "… is ready"
  panel. Claude's first test instructions sent Thomas down the switcher path
  and wasted a throwaway household.
- **The everyday invite sheet was already correct.**
  [invite-someone-sheet.tsx:145](../src/components/household/invite-someone-sheet.tsx)
  already rendered the code in `text/default`, so the lime was only ever on
  the first-run screen and the fix makes the two paths agree rather than
  inventing a new treatment. The sweep also confirms `text/link` now appears
  exactly ONCE in the app – see the wordmark question below.

- **DECIDED 2026-08-02: the wordmark full stops STAY lime, and the app is not
  touched.** [src/components/onboarding/onboarding-flow.tsx:388](../src/components/onboarding/onboarding-flow.tsx)
  renders the periods in the stacked welcome wordmark (*prep. cook. eat.
  repeat.*) in `text/link` #56C91D – the last use of that token in the app.
  Left alone on purpose: it is Thomas's design (the code comment cites the
  Figma frame "household set up 5" – each word subtle, each period lime),
  WCAG explicitly exempts logotypes and brand names from contrast minimums,
  and the periods carry no information anyway – the words are #5F503A and
  legible with or without them. Thomas: the token work belongs in the DS
  project, not here. See the DS nit under Code debts for the shape of it.
  Not re-flag this in a future audit.
  One thing never checked, aesthetic rather than compliance: the wordmark sits
  on `welcomePhoto` (an ImageBackground), so the real contrast of those lime
  periods varies with the photograph behind them. Only Thomas's eye settles
  whether they hold up.

Closed 2026-07-27:

- **The Plan tab spun forever on the phones.** Migration 0022 dropped
  `meal_plans.pushed_to_list_at` while the app the phones actually run
  (TestFlight build 10) still SELECTed it, so every plan load was rejected.
  Migration 0023 restored the column and Thomas ran it the same day: the plan
  loads again on build 10, with no new build and no reinstall. The rule that
  came out of it is in the decisions log.
- **A failed load left the Plan tab on a silent spinner** – the reason the
  outage above read as "won't load" instead of "something went wrong".
  `MealPlanProvider` only marked itself ready when the first fetch SUCCEEDED,
  so any boot failure (that outage, or simply opening the app with no signal)
  left a spinner with no message and no way out. Fixed by giving Plan the
  retry screen the app already had in two other places: `HouseholdLoadError`
  at launch and the shopping list's `LoadFailed`, both blessed as the design
  on 2026-07-25. Thomas spotted that the pattern already existed – worth
  checking for a precedent before calling something undesigned. Correcting a
  wrong note from earlier the same day: Shopping did NOT share this flaw,
  Plan was the only tab missing the recovery. **Not on the phones until the
  next build** – unlike the migration, this one is app code.
- **The Live badge lag** (fixed, see the decisions log) and the **"blank
  swiped row"** (never a bug – a short name sliding out of view).

### Later (v1.1+)

- [ ] **⭐ Show the app in Danish when the phone is set to Danish**
      Why: one app, two languages, iOS picks. Not a Danish edition and not a
           market decision – English stays the base language.
      Left: extract ~242 strings, add a Danish file, let anything untranslated
           fall back to English.
      Size: incremental – it can ship a screen at a time, and should.

      (Thomas, 2026-08-07, correcting a first write-up that had this far bigger
      than it is: *"I don't want to make a danish app, I just want the app to be
      able to use danish as well. I might be set by the OS in the phone."*).
      **SO IT IS LOCALISATION, NOT A DANISH EDITION.** One app, two languages,
      and iOS picks. A phone set to Danish shows Danish; every other phone shows
      English exactly as today.
      **THAT KILLS MOST OF WHAT THE FIRST DRAFT WORRIED ABOUT, and the corrections
      are worth keeping because they were wrong in an expensive direction:**
      - **It does NOT reverse the projektgrundlag.** English stays the base
        language and the international target is untouched – Danish is added
        alongside. The document needs a sentence, not an amendment.
      - **It is NOT a market decision.** No App Store listing work, no Danish
        screenshots, no second support address, no marketing site. A Danish
        listing localisation is possible later and entirely separate.
      - **There is no language SETTING to design.** The OS decides, so no screen,
        no picker, no stored preference. `expo-localization` reports the device
        locale and the i18n library does the rest.
      **WHAT IS ACTUALLY LEFT:** extract the strings, add a Danish file, let
      untranslated keys fall back to English.
      **THE SIZE, measured 2026-08-07 rather than guessed:** ~**242 user-visible
      strings** across 65 `.tsx` files – 105 text nodes between JSX tags and 137
      in `accessibilityLabel` / `placeholder` / `title` / `label` props. Plus
      `friendlyError()` and the OTP email Resend sends, which are read by users
      but live outside screen components.
      **⚠️ FALLBACK MAKES THIS INCREMENTAL, which is the thing worth planning
      around.** A missing Danish key renders the English one, so the app is
      shippable at any point on the way – translate the shopping list first, the
      settings screens last, and nothing is broken in between. This does NOT have
      to land as one large change, and it should not.
      **STILL TRUE, AND NOT TEXT:**
      - **Quantities and units already speak both languages.** `UNIT_SINGULARS` /
        `UNIT_PLURALS` and `norm_item_unit` carry Danish units *today* because
        recipes get imported in Danish even though the UI is English. A Danish UI
        does not change that machinery, but it does change which language a user
        expects to see back.
      - **Dates and week numbers** are already ISO weeks, which suits Denmark.
      - **The name and tagline stay English** – "Prep+Eat" and "prep. cook. eat.
        repeat." are brand, not UI.
      - **Recipe CONTENT is never translated.** A recipe typed or imported in
        Danish stays Danish whatever the phone says; only the app's own chrome
        changes. Worth stating because it is the obvious wrong assumption.
      **THE ONE REAL DECISION LEFT:** whether an in-app override is ever wanted –
      a Dane who prefers the app in English, or the reverse. Not needed for this,
      and adding it later costs little once the strings are extracted.

- [ ] **Let someone join a kitchen by tapping a link, not typing a code**
      Why: today you create an account, then have to find and remember a code.
           A link waits in the message thread; a code does not.
      Left: the joiner still has to make an account – that cannot be skipped.
           What the link removes is the code and the "set up your kitchen"
           fork, which sidesteps two panel findings outright.
      Blocked by: the site is on GitHub Pages, which cannot serve Apple's
           association file as JSON. Move the site first (see the item below);
           without that the links fail silently and look broken.

      (Thomas, 2026-08-10; researched by Claude the same day). His reasoning: *"I find it a bit
      troublesome joining with a code because you first have to create a user
      and then remember or find a code."* The ask is link → install → account →
      **already in the household**, with the code never entering the user's
      awareness.
      **MOST OF THE PIECES EXIST.** `prepeat.app` is ours and live, `expo-linking`
      is already a dependency, the scheme `prepeat` is in `app.json`, Apple Team
      ID is `Z58TG8X9KB` and the App Store ID is `6793690543`. The invite system
      already mints, expires (14 days), rotates and throttles codes – **a link
      would only carry the code that already exists**, so no new security model.
      **WHEN THE APP IS INSTALLED: fully solvable, and not much work.** Host
      `/.well-known/apple-app-site-association` on `prepeat.app`, add
      `associatedDomains: ["applinks:prepeat.app"]`, and a link of the form
      `https://prepeat.app/join/PREP-6A3V` opens the app directly. The app holds
      the code through sign-in and redeems it the moment the account exists.
      **⚠️ THE HONEST LIMIT ON THE ASK: the account step cannot be skipped.**
      Household membership has to attach to a user, so email + OTP still happens.
      What the link removes is the CODE (never seen, typed or remembered) and the
      **"Set up your household" fork, which the joiner never reaches at all.**
      **WHY THAT IS WORTH MORE THAN IT SOUNDS:** the Synthetic User Panel found
      step 5 to be the heaviest step in the entire first run, with every reader
      needing to know whether a household of one is supported – and five readers
      independently feared creating a DUPLICATE household. A link-joiner is never
      offered the choice, so both findings are sidestepped rather than reworded.
      See the panel section above.
      **⚠️ THE PART WITH NO CLEAN ANSWER: the app NOT yet installed.** iOS
      deliberately severs the link from the fresh install for privacy, so the
      newly installed app cannot know which link brought the user. This is an
      Apple constraint, not an Expo one. Four routes, ranked:
      1. **Tap the link again – RECOMMENDED.** `/join/PREP-6A3V` renders a web
         page naming the household plus an App Store button; after installing,
         the user returns to the message and taps the SAME link, which now opens
         the app. Free, no dependencies, no tracking. **The real gain over today
         is that a link waits in the message thread, whereas a code has to be
         remembered.**
      2. **App Clips – the genuinely seamless option, and a project.** A
         miniature app launches straight from the link with NOTHING installed,
         does the join, then hands off to the full app. This is the thing Thomas
         is imagining. Expo does not support App Clips out of the box: separate
         native target plus config-plugin work. Keep as its own later item.
      3. **⛔ Branch.io / AppsFlyer – RULED OUT, and not on technical grounds.**
         Deferred deep linking works probabilistically via device fingerprinting.
         But `prepeat.app` says the app has *"no ads, no analytics and no
         third-party tracking"*, and the App Store privacy label is published on
         that basis. This would cost a promise already made in public.
      4. **⛔ Clipboard bridge.** iOS now prompts before any app reads the
         clipboard – unreliable and reads as creepy. Skip.
      **⚠️ BLOCKER TO CLEAR FIRST – THE SITE IS ON GITHUB PAGES.** GitHub Pages
      serves extensionless files as `application/octet-stream`, and Apple
      requires the association file as `application/json`; GitHub Pages cannot
      set per-file headers. **Universal links would silently fail to register –
      it looks like "the link is broken" for days if you do not know.** Fix is to
      move the static site to Cloudflare Pages / Netlify / Vercel; it is a
      no-build, no-framework, no-JavaScript site, so the move is small.
      **This blocks anything universal-link-shaped later** – password reset,
      recipe sharing – so it is worth doing for its own sake. Interacts with the
      `github.io` → `prepeat.app` URL item directly below: do that one first, or
      together.
      **KEEP THE CODE AS WELL AS THE LINK.** The code still serves reading it
      aloud to a parent on the phone, and joining from a second device. Do not
      remove a working path.
      **⚠️ THE ONBOARDING COPY WAS ALREADY MADE CODE-AGNOSTIC FOR THIS**
      (Thomas, 2026-08-10, giving the reason after the fact: *"I plan to also
      introducing a link as a joining methode"*). The choice screen's join option
      dropped its "Got an invite code?" opener and now reads **"Join an existing
      kitchen / You'll share the same recipes, plan and shopping list – anything
      you add shows up for them too."** It names the DESTINATION, not the
      mechanism, so it survives whichever way people arrive. Same for the
      switcher item. **Do not "helpfully" put the code hint back** – its absence
      is deliberate.
      **WHAT STILL NAMES THE MECHANISM, and so changes when links land:** the
      GIVING side, not the joining side – *"Share this code and they'll see the
      same recipes, plan and list"* on the kitchen-is-ready screen, *"Invite
      someone, or give them the code below"* in the invite sheet, and the
      **Share the code** button. Note a link-joiner skips the choice screen
      entirely, so screen 5 needs nothing further.
      **SEQUENCE:** move hosting → association file + `associatedDomains` →
      build the `/join/` page → handle the link in-app. App Clips stays separate.

- [ ] **Point the App Store listing at prepeat.app instead of the GitHub URL**
      Why: the listing shows a github.io address for Privacy Policy and
           Support. Nothing is broken – those redirect – it just looks
           borrowed rather than like Thomas's own domain.
      Wait for: v1.0 to be approved. Changing metadata mid-review invites
           questions for no benefit.
      Size: small, and it pairs with the hosting move above.

      (found 2026-08-04). The custom domain went live
      at some point without the paperwork catching up: `prepeat.app` serves a
      valid certificate, `http://` returns 301 to `https://`, and DNS answers
      with all four GitHub Pages apex IPs. App Store Connect still holds the old
      `thomassebell.github.io/prepeat-web/…` links for Privacy Policy and
      Support.
      **NOT URGENT, AND DELIBERATELY NOT DONE NOW.** Setting a custom domain
      makes the `github.io` URLs redirect to it – verified: the privacy policy
      link Apple holds ends at `https://prepeat.app/privacy` with a 200. So
      nothing is broken, and changing metadata while a version is IN REVIEW
      invites questions for no benefit. Do it once v1.0 is approved, so the
      listing shows Thomas's own domain rather than a GitHub URL.
      Two things checked at the same time, both fine, both worth not
      re-investigating:
      - **The mail path is intact.** Resend's records live on the **`send.`
        subdomain** (SPF via `amazonses.com`, DKIM key, bounce MX), which is why
        the ROOT SPF mentions Porkbun instead. **That reads like a fault and is
        not** – "fixing" it would break the record carrying every user's sign-in
        code. Now written into `prepeat-web`'s README as a verified table.
      - **`prepeat-web`'s README described the domain move as a future plan**
        for a job already finished; rewritten as a record. The step ORDER is
        kept, because claiming the domain in the repo before pointing DNS is
        the part that is easy to get wrong, and `.app` being on the HSTS
        preload list makes a mistake unfixable-looking in the browser.

- [ ] **Add Sign in with Apple on iOS**
      Needs: Thomas – a frame placing the Apple button on the welcome screen.
      Why: a faster way in. Not required by Apple, so this is a product choice.
      Note: it does NOT replace the demo mailbox – a reviewer signing in with
           their own Apple ID lands in an empty account.
      Blocked by: no Figma frame places the Apple button on the welcome
           screen. Design first.

      Considered 2026-07-30 while setting up the
      App Review demo account, deferred to after v1.0 (Thomas: "Mailbox now,
      Apple later"). Findings worth keeping:
      - **Not required.** Apple's guideline 4.8 only forces a Sign-in-with-Apple
        option for apps using a THIRD-PARTY social login (Google/Facebook/…).
        Prep+Eat uses first-party email OTP, so it is exempt. This is a product
        choice, not compliance.
      - **It does NOT remove the demo-account work.** A reviewer signing in with
        their own Apple ID lands in a brand-new EMPTY account – the "reviews
        badly" risk. You cannot pre-seed the reviewer's Apple-ID account. The
        demo mailbox is what lets you hand over a full, seeded account, so it is
        still wanted even with SIWA.
      - **An addition, not a replacement.** Email OTP stays for Android (SIWA is
        effectively iOS-only) and for users without an Apple ID.
      - **Cost:** `expo-apple-authentication` (Expo SDK 56 supports it) →
        `supabase.auth.signInWithIdToken({provider:'apple'})`; Apple Developer
        portal (enable the capability, a Services ID + a key); Supabase Apple
        provider configured with those; capture Apple's name (given only on the
        FIRST authorization – feeds the onboarding first-name step); handle
        private-relay `@privaterelay.appleid.com` emails (they become the
        stored identity / the address shown on the Household screen); decide
        identity-linking if the same person later uses OTP with the same email.
      - **Design gap:** the Apple button glyph/label is Apple-specified (HIG),
        but its PLACEMENT on the welcome screen has no Figma frame – design
        first, per the no-improvised-UI rule.
- [ ] **Let the household teach the app that two ingredient names mean the same thing**
      Needs: Thomas – design the "same as…" action, and settle whether an alias is one-directional.
      Why: a real list showed three un-merged Parmesans and onion split three
           ways. No parser rule can settle these – `cream cheese` is not
           `cream` – so the household has to decide.
      Blocked by: the "same as…" action on the shopping-list edit sheet has no
           Figma design. Backend and merge logic can be built without it.
      Open question: is an alias one-directional (B → A) or a group of equal
           names? One-directional matches how categories already learn.

      This is the "advanced ingredient normalization (onion vs
      yellow onion)" line already in projektgrundlag under Later (v1.1+) –
      written up here 2026-07-30 after it showed on a real list as three
      un-merged Parmesans (`Parmesan`, `Parmesan cheese`, `shaved Parmesan
      cheese`) and onion split three ways (`onion` / `small onion` /
      `yellow onion`). See also the synonym note under Known bugs, which this
      supersedes.
      WHY IT CANNOT BE A PARSER RULE: these are genuinely different strings,
      and no mechanical rule settles them without breaking real distinctions –
      you cannot strip "cheese" (`cream cheese` ≠ `cream`), and `small onion`
      may be a deliberate distinction. The household has to decide.
      SHAPE (mirrors the learned-category pattern, decision #7, which is the
      precedent Thomas keeps pointing at):
      - A new per-household table, e.g. `item_name_alias(household_id,
        alias_name normalized, canonical_name normalized, primary key
        (household_id, alias_name))`, RLS `is_household_member` like
        `item_category_memory`. New numbered migration; never edit an applied
        one.
      - Fold the alias into the merge key: `norm_item_name` (or the merge
        step) resolves an alias to its canonical name BEFORE
        `item_merge_key`, so aliased rows merge and the canonical display name
        wins. Touches migration 0013's reconciler – needs care and re-test.
      - Teaching UI: on the shopping-list edit sheet, a "same as…" action that
        points item B at an existing item A. This is the ONLY genuinely new
        surface. NO FIGMA DESIGN EXISTS – must be designed before it is built
        (the multi-day-sheets rule: build Thomas's design, never an
        improvisation). Backend + merge logic can be built design-free; the
        sheet cannot.
      - Realtime: like categories, no realtime on the alias table itself – the
        visible effect is the shopping_list_items rows merging, already a
        realtime surface.
      Decision needed before any UI work: is an alias one-directional (B → A)
      or a group of equal names? One-directional is simpler and matches the
      category-memory precedent; start there unless Thomas wants groups.
- [ ] **Drag a meal to another day on the Plan screen**
      Needs: Thomas – the drag states (lifted card, drop highlight), and a yes/no on promoting it.
      Why: you can already do this by swiping and picking a day. Drag is a
           nicer way to do the same thing, not a missing capability.
      Priority: ⚠️ asked twice (2026-07-30 and again 2026-08-07). Twice-asked
           is the closest thing to a vote this backlog has – worth putting in
           front of Thomas next time the order is reviewed.
      Size: front-end only, but not a tweak – see the scrolling problem below.

      (Thomas asked)
      **RAISED AGAIN 2026-08-07, which is a priority signal.** Thomas listed
      this among his ideas a second time, apparently without recalling it was
      already filed. Twice-asked is the closest thing to a vote this backlog
      has - worth pulling out of "v1.1+ polish" and putting in front of him as a
      real candidate next time the order is reviewed, rather than leaving it to
      surface a third time.
      2026-07-30: *"is it possible to drag a meal to another day in Plan? It
      has the slide to edit already"*). Answer: yes, and the data side is
      already done – the swipe "Move to another day" action already calls
      `plan.moveEntry(id, date)` in [src/lib/meal-plan.tsx](../src/lib/meal-plan.tsx),
      so a drag gesture would reuse that exact function. This is therefore a
      pure front-end gesture/animation build, not a data-model change. Filed
      as v1.1+ polish, NOT a missing capability: moving a meal between days
      already ships today via swipe → day-picker sheet (MoveDaySheet). Drag is
      a nicer way to do the same thing.
      WHAT MAKES IT MORE THAN A TWEAK: the Plan screen stacks all 7 days in a
      vertical ScrollView ([src/app/(plan)/index.tsx](../src/app/(plan)/index.tsx)),
      and each meal row already owns a horizontal swipe-to-edit gesture
      (ReanimatedSwipeable in [src/components/plan/meal-row.tsx](../src/components/plan/meal-row.tsx)).
      Three things need care: (1) gesture disambiguation between swipe-to-edit,
      vertical scroll and pick-up – the standard fix is long-press-to-lift;
      (2) auto-scroll while dragging so off-screen days are reachable; (3)
      per-day drop-target highlighting. Standard pattern (reanimated + a
      draggable-list approach), a few days of build-and-polish.
      DESIGN GAP – NO FIGMA EXISTS for the drag states (lifted card, drop
      highlight, drag handle). Per the build-the-design rule, these must be
      designed before the build, or the improvisation flagged here. Note there
      is a sibling drag interaction already designed+built on the shopping list
      (see decisions log ~line 998: rows scroll inside, target slot shown) –
      reuse its visual language rather than inventing a new one.
- [ ] **Drag a shopping item into another category**
      Needs: Thomas – the item-drag states, and which regions are valid drop targets.
      Why: you can already recategorize by tapping the item and picking a
           category. Drag is a nicer way to do the same thing.
      Priority: ⚠️ asked twice (2026-07-30 and again 2026-08-07), same signal
           as the meal drag above.
      Decide first: which regions are valid drop targets – the uncategorized
           area and the checked-items area both need an answer.
      Blocked by: no Figma for the item-drag states. Reuse the category-group
           drag visuals rather than inventing new ones.

      (Thomas, 2026-07-30.)
      **RAISED AGAIN 2026-08-07, which is a priority signal.** Thomas listed
      this among his ideas a second time, apparently without recalling it was
      already filed. Twice-asked is the closest thing to a vote this backlog
      has - worth pulling out of "v1.1+ polish" and putting in front of him as a
      real candidate next time the order is reviewed, rather than leaving it to
      surface a third time.
      Pick up a single item and drop it on a different category group to
      recategorize it. Like the meal-drag item above, the data side already
      exists: `editItem(id, { ...aisle })` in
      [src/lib/shopping-list.tsx](../src/lib/shopping-list.tsx) (~line 771)
      already sets an item's aisle AND teaches `item_category_memory` so
      future items of that name auto-file to the same category. A drag-drop
      would call that same function with the drop target's category, getting
      the "learn it once" behaviour for free. Pure front-end gesture build.
      Filed as v1.1+ polish, NOT a missing capability: recategorizing already
      ships today via tap item → edit sheet → pick a category
      ([src/components/shopping/edit-item-sheet.tsx](../src/components/shopping/edit-item-sheet.tsx)).
      DISTINCT from the drag that already exists here – the shopping list
      already lets you drag category GROUPS to reorder them (inline drag,
      [src/app/shopping.tsx](../src/app/shopping.tsx) ~line 55, overlay in
      [src/components/shopping/inline-reorder-overlay.tsx](../src/components/shopping/inline-reorder-overlay.tsx)).
      This new item is dragging one ITEM between groups, a different gesture.
      WHAT MAKES IT MORE THAN A TWEAK: same three concerns as the meal drag –
      long-press-to-lift so it doesn't fight the row's swipe-to-edit and the
      list scroll, auto-scroll to reach off-screen categories, and drop-target
      highlighting on each group. Extra wrinkle: an item can also be dropped on
      the uncategorized/top region, and checked items sit in their own settled
      area – decide which regions are valid drop targets before building.
      DESIGN GAP – NO FIGMA for the item-drag states. Reuse the existing
      category-group drag visuals (decisions log ~line 998: rows scroll inside,
      target slot shown) rather than inventing new ones; flag any improvisation.
- [ ] **Teach the recipe importer languages beyond English and Danish**
      Why: recipe sites are overwhelmingly local-language, so this hits a new
           user on their very first import. `2 EL Olivenöl` currently files
           the unit as part of the ingredient name.
      When: per territory, as the App Store rollout reaches it.
      Size: ~30 lines per language – one units list, one participle list, one
           "to taste" phrase.

      (scoped 2026-07-29 – Thomas: *"English and danish is the most
      important. Log other languages as later versions"*). The parser in
      [src/lib/recipe-import.ts](../src/lib/recipe-import.ts) splits an
      ingredient string into name + quantity. The language-INDEPENDENT half
      works everywhere already: leading amounts, ranges, vulgar fractions
      (½ ¼ ¾), metric units, parentheticals and colon-sentences. The half that
      needs to KNOW WORDS is hand-written vocabulary, and only English and
      Danish are complete:
      - **local spoon/measure units** – German `EL`/`TL`, Swedish `msk`,
        Dutch `eetlepels`, Spanish `cucharadas`, Italian `cucchiai`. Missing
        ones fall into the NAME: `2 EL Olivenöl` → quantity `2`, name
        `EL Olivenöl`.
      - **prep participles** – `, gewürfelt` / `, hackad` / `, tritata` /
        `, émincé` are all kept verbatim, so the shopping list reads
        `Zwiebel, gewürfelt`.
      - **"to taste" qualifiers** – `nach Geschmack`, `al gusto`,
        `selon le goût`, `efter smak` (Swedish – the Danish `efter smag` IS
        handled).
      - **alternatives** – only `or`/`eller` are known; `oder`, `ou`, `o`,
        `of` are not.
      - **Romance connector words** – `200 g de farine` → name `de farine`,
        `200 g di farina` → name `di farina`. The `de`/`di`/`du`/`della`
        should be dropped after the unit.
      Each language is roughly one units list + one participle list + one
      qualifier phrase – the same shape as the existing tables, ~30 lines.
      Worth doing per territory as the App Store rollout reaches it, since
      recipe sites are overwhelmingly local-language and this hits a user on
      their very FIRST import.
      One trap already found and guarded: French `c. à soupe` is a TABLESPOON,
      and reading the bare `c` as `cup` inflates the amount ~16x. The parser
      now bails out when `c` is followed by `à`/`a`. Any future language work
      needs the same paranoia about collisions with English abbreviations.
- [ ] **⭐ Share a recipe with someone – FIRST ITEM IN v1.1**
      Needs: Thomas – how much of a recipe a stranger sees before installing.
      Why: Thomas's case is that this is the growth mechanic, not a
           convenience – *"without 'mouth to mouth' sharing, this app will not
           be a success. And having a recipe as a carrier will be key."*
      Decide first: how much a stranger sees – the whole recipe, or a teaser
           that needs the app. And the copyright question below, which is
           genuinely unanswered.
      Size: about a week. It is the project's first web deployment.
      Do before code: a spec doc, like leave-household.md.

      (Thomas, raised as an idea
      2026-07-25, weighed for v1.0 on 2026-07-27 and deliberately left out of
      it the same day: *"I must think some more over the sharing feature"*).
      The reason it is top of the list rather than one item among many:
      Thomas's case for it is that it is the growth mechanic, not a
      convenience – *"with out 'mouth to mouth' sharing, this app will not be
      a success. And having a recipe as a carrier will be key."* That case
      still stands; what is unsettled is the shape, and v1.0 was not the round
      to settle it in. Worth a spec doc (like leave-household.md and
      delete-account.md) before any code.
      Settled while it was briefly a v1 item:
      - **A shared recipe is a link to a page we host** (prepeat.app/r/<token>).
        Not a choice between "deep link" and "web page": an iOS universal link
        falls back to loading the URL in a browser when the app is not
        installed, so the page is the fallback target and has to exist either
        way. Recipients who HAVE the app get it opened there.
      - **The photo story is a non-issue** – contrary to the original note, the
        `recipe-photos` bucket is public-read (0006_recipes.sql). Migration 0018
        only stopped clients ENUMERATING it. Anyone holding a photo URL can
        already load it, so a public page can show the picture with no new
        infrastructure.
      - **Scope, so the deferral is not mistaken for a small job**: this is the
        project's first web deployment, plus a share-token table and
        universal-link setup on the domain. Roughly a week of new surface.
      Still open:
      - [ ] **How much the page shows a stranger.** The whole recipe, or a
            teaser (photo + title + "Get Prep+Eat to see it")? Thomas's
            argument for gating: a personal recommendation carries the install –
            *"I have this recipe, so please download the app to get it"* – and
            everyone who wants the recipe becomes a user rather than a reader
            who never installs. Claude first called deep-link-only "dead on
            arrival", withdrew it, and ended up recommending the teaser. A dial,
            changeable later if the install rate disappoints.
      - [ ] ⚠️ **Copyright on imported recipes – Thomas's question, 2026-07-27,
            NOT yet answered by anyone qualified.** Publishing an imported
            recipe is a different act from importing one. Importing to your own
            household is private copying; a public URL makes **Prep+Eat the
            publisher**, and takedowns arrive at our domain. What that turns on:
            ingredient lists are facts and not copyrightable (US/EU), bare
            procedural steps much the same, but headnotes, descriptive method
            prose and above all **photographs** are protected – and minor edits
            produce a derivative work, not a new one. There is no
            percentage-changed threshold that makes a copy legal.
            The sharp edge is the photo: `new.tsx:139` puts the scraped
            `imageUrl` into `photoUri` and line 162 uploads it to our public
            bucket, so imported recipes already carry a copy of the source
            site's photograph on our storage. Invisible while private, the most
            complaint-prone thing on a public page.
            Note the convergence: a **teaser page publishes almost nothing**, so
            gating largely sidesteps this. A full public recipe needs the
            mitigations: ingredients + a prominent link to the original, never
            the source's prose, never the imported photo – which needs photo
            PROVENANCE recorded, since a scraped photo and one you shot are
            today indistinguishable uploads in the same bucket.
            This question is NOT urgent while sharing sits in v1.1 – nothing
            ships publicly until then – but it is cheap to put to the attorney
            alongside the trademark clearance, so it is cross-referenced there.
      - [ ] **Does the recipient's copy get COPIED into their household** (their
            own editable version, matching copy-on-leave) or merely displayed?
            "Save to my recipes" is the conversion action if so.
      - [ ] **Revocation + snapshot.** A share token is readable by anyone
            holding the URL until revoked. Consistent with the project's
            snapshot principle, the page should probably show the recipe AS
            SHARED, not live – so later edits are never accidentally published.
      - [ ] A public share page makes household content readable outside the
            household, so the **privacy policy written for v1.0 will need
            updating** when this ships, and prepeat.app stops being a parked
            domain.
      Overlaps the merge item directly below – "copy a recipe to my other
      household" is the same mechanic pointed inward, so they are probably one
      feature and should be designed together.
- [ ] **Let recipes move between two kitchens you belong to**
      Why: leaving a kitchen when you already have another spawns yet another
           solo "[Firstname]'s Kitchen" – clutter. And a rejoiner has no way
           to bring their parked recipes back into the family.
      Size: this is the deferred merge mechanic from leave-household.md, rule A.

      the
      deferred merge mechanic that later lets a rejoiner bring their parked
      solo-kitchen recipes into the family (leave-household.md, rule A). Also
      covers a UX gripe from 2026-07-22: leaving a household when you ALREADY
      have another spawns yet another solo "[Firstname]'s Kitchen" (clutter).
      Better: let the copy-on-leave recipes land in an EXISTING kitchen you
      choose.

### Synthetic User Panel findings (round 1, 2026-08-10)

**Every item below is tagged `(Synthetic User Panel: …)` as well as sitting under
this heading.** That is deliberate belt-and-braces: if an item is promoted into
Known bugs, Later or In flight, the tag travels with it and the source stays
obvious. The few items that are **not** panel findings are tagged
`(NOT a panel finding …)` so the two never blur.

Findings from the Synthetic User Panel Thomas built (project
`~/Documents/Claude/Projects/Synthetic User Panel`). Five studies, twenty-four
isolated sessions, all seven personas. Source report:
`studies/2026-08-10-prepeat-combined-report.md` **in that project, not this
repo** – the per-study syntheses sit beside it and hold the detail.

**⚠️ READ THE THREE LIMITS BEFORE QUOTING ANY OF THIS.**
1. **No human was interviewed.** This is what the panel raised, not user
   research. No prevalence, no preference, no willingness to pay.
2. **Not one of the twenty-four sessions saw a screen.** Nothing here may be
   restated as a usability or visual finding.
3. **It is the worst possible instrument for the English-only question.** Every
   mode had readers notice the app carries no Danish; a fluent model registers
   the fact and feels none of the friction. Their implicit verdict that it is
   survivable is worth nothing – do not quote it as reassurance. (Bears on the
   Danish localisation item under Later.)

Each finding carries the mode and ceiling that earned it, and they are not
merged – a finding separated from its mode loses the confidence bound. Where
two modes found the same thing, that is two findings agreeing, not one
stronger finding.

**NONE OF THIS IS A BUG.** Verified 2026-08-10: `tsc --noEmit` exit 0, ESLint
clean. Nothing below is a code fault.

**WHERE THIS STANDS AFTER THE 2026-08-10 COPY ROUND: 8 solved, 5 partly, 9
untouched**, plus the 7 verify-with-humans items, which no amount of copy can
close. What landed was the first-run and household wording; what did not is the
empty week (screen 9), the capability gaps and money. **⚠️ NOTHING HAS BEEN
RE-TESTED** – "solved" means the mechanism was addressed, not that the fix was
shown to work. Re-running the comprehension study on the new screen 5 is the
cheapest way to find out, and is owed.

#### The reframe that decides how much work this is

Run against the product's real capabilities rather than the screens alone, most
findings turned out to be things **unsaid**, not things **missing**. First run
communicates none of: several meals per day, per-meal servings, leftovers and
eating out as meals, link import, ingredient search, belonging to more than one
household, manually added shopping-list items. So Henrik reading that the
product thinks a week is one dinner per day is *wrong about the product and
right about the screen*. That is a copy job, not a build job.

**Checked against the code 2026-08-10 so this is not re-litigated** – every
capability the report claims exists, does:

| Claim | Evidence |
|---|---|
| Several meals per day | no unique constraint on (plan, date) in `0007` |
| Per-meal servings | `meal_plan_entries.servings` |
| Leftovers / eating out | `0009_manual_meal_entries` |
| Link import | `importRecipeFromUrl` in `src/lib/recipe-import.ts` |
| Several households | `households: Household[]` in `household-context.tsx` |
| Manual shopping items | `addItem`, `src/lib/shopping-list.tsx:491` |

- [ ] **Tell people what the app can already do, somewhere in first run**
      Why: it does seven things nobody discovers. The panel called this its
           biggest reframe – the problem is things unsaid, not things missing.
      Left: several meals a day, per-meal servings, leftovers and eating out,
           link import, ingredient search, belonging to more than one kitchen.
      Done so far: the choice screen now names recipes, plan, list and sharing.

      The single
      orienting sentence (*Your shopping list updates as you plan*, last line of
      screen 9) hides all seven capabilities above.
      (Synthetic User Panel: persona-as-lens, medium-high, all four reviews.)
      **⚠️ PARTLY DONE 2026-08-10.** The choice screen now names recipes, plan,
      list and the sharing. **Still unsaid:** several meals a day, per-meal
      servings, leftovers and eating out, link import, ingredient search,
      belonging to more than one kitchen. This was the panel's biggest reframe and
      is mostly still open.

#### "household" – the one word that failed in all five modes

Seven readers out of seven could not say what a household *is*, proposing eleven
different nouns between them.

- [x] **Fix the referential instability.** Screen 5 calls it "the shared space",
      screen 7 says it "is ready", screen 8 says "Welcome to" it – a space, then
      an object, then a place, on three consecutive screens. (Comprehension,
      high.) Across four screens it is also a thing you configure, found, name
      and join. (Synthetic User Panel: comprehension, high + copy review, high.)
      **DONE 2026-08-10.** One metaphor now, held throughout: *Set up your
      kitchen* → *Your kitchen is ready* → *Welcome to The Sebells*. A place you
      make, then enter. This was the panel's central mechanism.
- [x] **It is a kommune word.** All five copy readers said so.
      **⚠️ ROUND 2 QUALIFIES THIS TICK (2026-08-10):** the replacement is
      understood by all five, and cost all five a beat to decode – *"a thing you
      name, a thing you're in, and a tab"*. The word failure is fixed; a smaller
      cost replaced it, and the "and a tab" half is structural. See round 2.
      (Synthetic User Panel: copy review, high.)
      **DONE 2026-08-10.** Replaced with **kitchen** everywhere.
      ⚠️ Note the "kommune" label was a DANISH artefact – the personas mapped
      "household" onto *husstand*. Thomas queried it and was right to. The word
      changed anyway, on the stronger grounds below (second-person register).
- [x] **Answer whether a household of one is supported or broken.** Step 5 was
      the heaviest step in the flow; every reader needed this, and three needed
      to know whether the choice is reversible.
      (Synthetic User Panel: walkthrough, medium.)
      **DONE 2026-08-10.** The create option now reads *"Start fresh.
      Invite people whenever you like, **or keep it to yourself**."* Reversibility
      is still unstated.
- [ ] **Say what happens if both adults start their own kitchen**
      Why: five readers independently feared ending up with two half-empty
           kitchens, and nothing says whether that is possible, preventable or
           recoverable.
      Done so far: "Join an existing kitchen" is now equally weighted, so the
           route exists.
      Left: nothing says *"if someone at home already made one, join theirs."*
      ⚠️ Do not reuse: the *"Is someone already using Prep+Eat?"* wording was
           tried and dropped – Thomas: *"The yes and no is not the right way to
           go."* This needs a different device.
      (Synthetic User Panel: comprehension, high.)
      **⚠️ PARTLY DONE 2026-08-10.** *"Join an existing kitchen"* is now equally
      weighted with create, so the route exists. **But nothing says "if someone at
      home already made one, join theirs instead."** The wording that addressed
      this head-on (*"Is someone already using Prep+Eat?"*) was tried and dropped
      2026-08-10 – Thomas: *"The yes and no is not the right way to go."* If this
      matters, it needs a different device, not that one back.
- [x] **Stop asserting a permanent multi-person family.** Steps 1 to 7 assert one
      five to seven times, which is factually untrue of three of the four
      households reviewed. **Tier A** – Danish population statistics, not
      assumption. (Synthetic User Panel: persona-as-lens, medium-high.)
      **DONE 2026-08-10.** Every assertion gone, grep-verified in both
      Figma and the code: the tagline no longer ends *"– as a family"*, the name
      step no longer promises to show your name *"to your family"*, the recipes
      empty state no longer assumes a family loves the dishes, and the invite and
      delete-profile lines were rewritten. This was the Tier A break.

#### Screen 9 is where it ends

**⚠️ STANDING CAVEAT ON WALKTHROUGH FINDINGS (Thomas, 2026-08-10:
*"overtesting/overthinking"*).** The walkthrough personas READ a description of
each screen; they could not tap. That converts every unknown into a blocker,
because the only way to resolve an unknown by tapping is unavailable to them.
A real user resolves *"what does + Add meal do?"* in half a second at the cost
of one tap. **So discount walkthrough findings whose whole content is "I could
not tell what would happen"** – the mode manufactures that. Findings about
EFFORT and MOTIVATION from the same mode are not affected, because those do not
depend on being able to act.

**⚠️ "Step 9" IS NOT AN ONBOARDING SCREEN – it is the app.** The walkthrough
brief describes it exactly: heading *Weekly plan*, arrows either side of the
week, seven rows MON–SUN each carrying **+ Add meal** and nothing else, one
line *Your shopping list updates as you plan*, four tabs. It is the Plan tab,
empty, on first launch – the destination, not a step.

- [ ] **⭐ Open the app on Recipes while the cookbook is empty, on Plan once it is not**
      Why: an empty week asks people to plan before they have anything to plan
           with. Agreed 2026-08-10; this is the surviving answer to it.
      Watch out: the redirect must fire ONCE PER LAUNCH. Otherwise someone who
           adds their first recipe and taps Plan is bounced back to Recipes.
      Not: a tab-bar change. Plan stays first. Reordering was tried and
           reverted – see below.
      Size: sketched, not built. `RootGate` already waits on a fetch, so the
           "any recipes?" query is nearly free.

      This
      replaces the tab-reorder idea below, which was tried and reverted.
      **WHY THE EMPTY COOKBOOK AND NOT "FIRST LAUNCH"** (Thomas): someone who
      onboards and closes the app to do the big task another time *"haven't
      learned any think yet anyways"* – a first-launch flag would assume they
      had, and drop them on the empty week the next morning. The cookbook being
      empty is the honest signal, and it is self-correcting: the moment there is
      a recipe, the app opens on Plan forever after.
      **⚠️ NOT A TAB-BAR CHANGE.** Plan stays first and stays the `/` index
      route, because most sessions are *"what's for dinner"* or *"I'm at the
      shop"*. This is a redirect on launch, not a reordering.
      **THE EDGE CASE THAT DECIDES THE IMPLEMENTATION:** the redirect must fire
      ONCE PER LAUNCH, not whenever the plan renders. Otherwise a user who adds
      their first recipe and then taps Plan is bounced straight back to Recipes.
      **SKETCH, not built:** `RootGate` already awaits a fetch before rendering
      anything, so a parallel "does this household have ≥1 recipe" query costs
      almost nothing and avoids a flash; pass it down, and have the plan's index
      return `<Redirect href="/recipes" />` on first mount only. Alternative is
      a cached AsyncStorage flag per household – no query, but it needs
      invalidating and gets existing users one odd launch.

**⚠️ THE TAB-REORDER IDEA BELOW WAS TRIED AND REVERTED on 2026-08-10.** Two
things were learned and are worth not rediscovering. **Trigger order does NOT
decide the opening tab** – the INDEX route does (*"the tab file named index.tsx
is the default tab when the app loads"*), so the first reorder changed the
visual order and nothing else, leaving Plan demoted but still opening. Making
Recipes the index then worked, but **it serves first-timers at the cost of every
returning user**, which is the wrong trade: most sessions start at the plan or
the shop. Kept only as the record of a dead end.

**THOMAS'S PROPOSAL, 2026-08-10 – REORDER THE TAB BAR to Recipes · Plan ·
Shopping · Kitchen, so the app opens on Recipes** and asks for one recipe
instead of a week. Worth taking seriously because it matches the pre-mortem's
sharpest observation: what beat Prep+Eat shared three properties, the first
being **no plan has to exist first**. Opening on Recipes means none does.
It also fixes a dependency the current order hides – *+ Add meal* is hollow
with an empty cookbook, so Plan-first sends people to the one screen that
cannot yet work. Cheap: the tab order IS the default route
(`src/components/app-tabs.tsx`, first trigger wins).
**What it does NOT fix:** *+ Add meal* is still an unknown when they get there,
and the planner half of the split is unhelped – a planner with a week in their
head still has to build a cookbook before they can enter it.
**Weigh against:** Plan is the product's headline promise and the App Store
screenshots lead on it; demoting it is a positioning call, not just a reorder.

**THOMAS'S SECOND PROPOSAL – COPY LAST WEEK'S PLAN.** Aimed at the planner
half, and it is the right shape for it: the planners stopped because the screen
asks them to retype a plan they already hold, so making entry near-free is
exactly the fix. Precedent exists – the shopping list already carries
*transfer items from last week*. Does nothing for non-planners, who have no
previous week to copy, which is the point: the split needs two fixes.

- [ ] **Give the empty week something to offer**
      Why: all five personas put the phone down there. Effort thresholds were
           crossed four steps earlier – compliance is not engagement.
      Evidence: three gave up at step 5, one at 7, one only at 9.
      (Synthetic User Panel: walkthrough, medium.)
- [x] **CLOSED 2026-08-10, Thomas: *"the result of overtesting/overthinking"*.**
      Agreed, and see the caveat above: the personas could not tap, so a label
      they could not resolve reads as a decision point. A real user taps it.
      **⚠️ WORTH KEEPING AS A QUESTION, NOT A FINDING:** *"what does a real
      household expect after + Add meal – to type, or to pick?"* is on the
      verify-with-humans list and costs one question to a real person.
      **Answer what happens when you tap "+ Add meal".** Three readers said this
      one unknown decided everything. Nothing answers it. Do users expect to type,
      or to pick? (Synthetic User Panel: walkthrough, medium.)
- [ ] **A LENS, NOT A TASK: check every empty-week fix against BOTH halves**
      Why: planners stopped at the empty week because it asks them to retype a
           plan they already hold. Non-planners stopped there because they
           cannot produce one at all. Same screen, opposite fixes.
      Use it: before building anything for the empty week, ask which half it
           serves. Opening on Recipes serves non-planners; copying last week
           serves planners. Neither serves both.
      Status: deferred as a feature 2026-08-10, Thomas's call.

      The tab reorder (Recipes first)
      serves the non-planners; copy-last-week's-plan serves the planners.
      Neither serves both, and that is the whole point of the finding – so when
      the empty week is picked up, check any fix against BOTH halves before
      building it.
      **⚠️ The most design-relevant split in the set, and it has opposite fixes.**
      Planners stopped at step 9 because it asks them to duplicate a plan they
      already hold. Non-planners stopped at the same step because they cannot
      produce that artefact at all. Same step, unrelated failures. Do not fix it
      as one thing. (Synthetic User Panel: walkthrough, medium.)

#### The strings that failed (copy review, ceiling high)

Reactions, not recommended replacements. Rewriting these is design work and
belongs in Figma – logged here, not improvised.

- [x] **`Can't reach your kitchen`** – the study's strongest single finding. All
      five misparsed it; two thought something was wrong at home. The server
      failed and the copy called it their kitchen.
      (`src/app/_layout.tsx:240`.) (Synthetic User Panel: copy review, high.)
      **DONE 2026-08-10.** Now *"Can't load your recipes / We couldn't
      reach Prep+Eat… nothing is lost."* **The rule this establishes: never name
      the container when the network breaks.** Renaming to "kitchen" made this
      compulsory rather than optional.
- [x] **`Already cooking?`** – unanimous. A joke where a function label belongs.
      (`onboarding-flow.tsx:106`.) (Synthetic User Panel: copy review, high.)
      **DONE 2026-08-10.** Deleted outright with the second button – the
      one-entrance change closed it rather than rewording it.
- [x] **`as a family`** – all five. Three read it as an instruction about who they
      ought to live with. Breaks **Tier A** constraints for the
      alternating-custody and no-children households. (`onboarding-flow.tsx:92`.)
      (Synthetic User Panel: copy review, high.)
      **DONE 2026-08-10.** The tagline is now *"Plan dinners, collect
      recipes and shop together."*
- [ ] **Make placeholder text look like a placeholder, not like real data**
      Why: `anna@example.com`, `Sofia` and `The Hansens` read as someone
           else's account. P07 said he would think he had signed into the
           wrong one.
      Evidence: five of five in round 2, four of five in round 1. Both rounds
           independently, which is why this survived a rename.
      Note: this is a TREATMENT problem, not a wording one – renaming to "The
           Hansens" fixed the other half and left this untouched.
      (`create-household-modal.tsx:135`, `onboarding-flow.tsx:318`.)
      (Synthetic User Panel: copy review, high; confirmed round 2.)

      Round 1's wording, kept because it names the half that IS fixed:
      **`The Hanson Kitchen`** taught the wrong task (naming a kitchen
      "… Kitchen" once kitchen is the type word) and **marked the reader as a
      second market** – Anglo where the reader is Nordic. Both gone.
- [x] **CLOSED 2026-08-10, Thomas: *"if they want to share, they will use it"*.**
      Two things support that. **The message is editable before sending** – the
      iOS share sheet drops it into Messages as a draft, so the worst case is
      the user rewrites it, which is exactly what P02 said she would do. And the
      readers were reacting to a string in isolation, not at a moment when they
      actually wanted someone in the app; motivation moves tolerance a long way.
      **The panel's own caveat applies:** objections *"arrive equally loud"*
      regardless of whether they cost a download.
      **The residual, small:** whoever RECEIVES an unedited message sees
      something that reads like spam, and they are the one deciding whether to
      install. Cheap to improve whenever the share link lands.
      **The share message** – four of five refused to send it. It is the only
      string the reader publishes under their own name.
      (Synthetic User Panel: copy review, high.)
- [ ] **Stop reassuring people about a loss they never worried about**
      Why: on first launch the reader owns nothing, so "your recipes and lists
           are safe" manufactures the anxiety it soothes.
      Done so far: now *"nothing is lost"* – shorter, and no longer calls the
           server failure their kitchen.
      Left: it still reassures, which is the mechanism the panel objected to.
      (`_layout.tsx:241`.) (Synthetic User Panel: copy review, high.)
      **⚠️ PARTLY DONE 2026-08-10.** Now *"nothing is lost"* – shorter, and no
      longer calls the server failure their kitchen. **But it still reassures about
      a loss nobody raised**, which is the mechanism the panel objected to.
- [ ] **Two lines land brilliantly for one reader and badly for the rest**
      Why: a line that splits the audience costs more than one that misses
           everybody, because it reads as written for someone else.
      Left: *Your shopping list updates as you plan* (Plan tab) – the best
           line in the deck to one reader, empty to the other four. And
           *repeat* in the tagline – accurate to one, an insult to two.
      Done so far: *If you're the first one here* is gone.
      Note: the tagline is brand, so changing it is a bigger call than copy.
      (`onboarding-flow.tsx:226`.) (Synthetic User Panel: copy review, high.)
      **⚠️ PARTLY DONE 2026-08-10.** *"If you're the first one here"* is gone.
      **Untouched:** *Your shopping list updates as you plan* (Plan tab) and
      *repeat* (the brand tagline) – both still split the panel.
- [x] **CLOSED 2026-08-10, Thomas: the App Store answers it before install.**
      The listing is free with no in-app purchases, so the question is settled
      on the store page – which **the panel never saw**, because only in-app
      screens were in the test. A scope artefact of the instrument, not a
      finding about the product. Reopen only if a paid tier ever exists.
      **Money is never mentioned** – no price, "free", trial or cancellation
      language anywhere. Two readers went looking; one stopped at the email screen
      over the silence. The product genuinely has no paid tier, **so this is a
      sentence, not a decision.** (Synthetic User Panel: copy review, high.)

#### Genuine capability gaps, as opposed to things merely unsaid

- [x] **Portion arithmetic is one scalar per meal**, where P07's household eats
      one pot in four sittings. Tier A on the timing facts. Confirmed in code:
      `servings` is a single integer per entry.
      (Synthetic User Panel: persona-as-lens, medium-high.)
      **CLOSED 2026-08-10, Thomas's call.** Partly mitigated already, which the
      panel did not credit: manual meals exist, so *Leftovers* can go on
      Wednesday (`0009_manual_meal_entries`). What is missing is the
      ARITHMETIC – the app does not know Wednesday's leftovers came from
      Tuesday's pot, so it cannot say how much is left. That is a hard
      modelling problem for one persona, and declining it is legitimate.
- [x] **OUT OF SCOPE 2026-08-10, Thomas's call.** It is a per-day note field
      (*"Tue: football 17:30, eat early"*) – P07 holds the week as a shape,
      which night is training, which night the other adult is late, and that is
      what decides what he cooks. Real, but it is scope creep toward a family
      organiser; Prep+Eat is a meal planner and Cozi is the other thing.
      **No per-day non-food logistics field.** Tier B.
      (Synthetic User Panel: persona-as-lens, medium-high.)
- [x] **OUT OF SCOPE 2026-08-10, Thomas: *"the app may not be for them"*.**
      The app never claimed to do this, and the panel's own synthesis files it
      under *"not a 1.0 or 1.1 decision – needs evidence first"*. P04's whole
      practice is shopping from offers, so she is outside the product rather
      than badly served by it. A strategy question, not a defect.
      **Nothing anywhere touches price or offers**, which is P04's entire
      practice. Tier A – but a product-scope decision, not a first-run defect.
      (Synthetic User Panel: persona-as-lens, medium-high.)

#### Two additions from the code that the panel could not see (Claude, 2026-08-10)

- [x] **CLOSED 2026-08-10, Thomas: *"This is my choice – close it!"*** The flat
      unlabelled day is a decision taken 2026-07-16 and recorded in
      `0007_meal_plans.sql`, not an oversight. Henrik's objection stands as a
      description of the product; the product is deliberate. Reopen only if
      breakfast/lunch/dinner is ever wanted for its own sake.
      **`meal_type` is in the schema but unused, so Henrik is more right than the
      report allows.** The report credits the app with "several meals per day",
      which is true – but a day is a flat, unlabelled list (decided 2026-07-16,
      `0007_meal_plans.sql`). A user can put three meals on Tuesday and cannot say
      which is lunch and which is dinner.
      (NOT a panel finding – code check by Claude, 2026-08-10, sharpening a claim
      the Synthetic User Panel got only half right.)
- [x] **"Sign in" goes nowhere different, and this finding survived by accident.**
      The walkthrough struck two findings because the brief stated "Get started"
      and "Sign in" lead to the same place. The brief was **factually correct** –
      `onboarding-flow.tsx:98` and `:110` both call `setStep({ kind: 'email' })`.
      Striking them as leaked knowledge was right; the underlying design fact
      stands on its own. *"Already cooking? Sign in"* promises a returning-user
      route and delivers the identical screen.
      (NOT a panel finding as it stands – the Synthetic User Panel walkthrough
      STRUCK this one; reinstated by code check, Claude, 2026-08-10.)
      **DONE 2026-08-10.** One entrance: a single **Continue with email**
      button. The fork now happens after the code, where the server actually knows
      whether you are new or returning.

#### What the pre-mortem added (objection harvest, ceiling high)

Seven distinct failure mechanisms, no two alike. Objections are claims about
mechanisms, which is why they are cheap to go and check – they are not market
evidence, and they arrive equally loud regardless of whether they cost a
download.

- **Sofie** – the plan still started in her head; her partner had the live list
  and texted from the shop anyway. Access was granted; the decision never moved.
- **Mette** – the architecture hangs off a week she cannot predict.
- **Anders** – everything he got depended on someone else filling it in. An empty
  shared app is worse than no app.
- **Camilla** – it runs backwards. She starts from offers; it starts from recipes.
- **Jonas** – the pipeline stops one step before his shop. He retyped the list
  into a laptop.
- **Rikke** – it solved storage; she arrived with a retrieval problem.
- **Henrik** – servings is one number; his Tuesday is one pot becoming four
  eatings.

**Nobody went to a competing meal-planning app.** They went back to memory, paper
on the fridge, Notes, shared Reminders, a text to a partner, the retailers' own
offer apps, a screenshots folder, and the chest freezer. Three properties recur
in what beat it: **no plan has to exist first, no second adult has to be
recruited, and nothing is lost when the week goes wrong.**

**⚠️ The sharpest line in the set, worth sitting with:** Prep+Eat ships the
feature Danish reviewers ask for more than any other – shared access – and the
panel raised that shipping it did not move the problem the request was about.

#### What to verify with real humans (ranked across all five studies)

- [ ] 1. **Show screen 5 cold and ask what they are about to create.** Every mode
      failed on this word. (Synthetic User Panel: all five modes.)
- [ ] 2. **Watch two people in one home set it up independently.** Do they make
      two households? Observable in an afternoon.
      (Synthetic User Panel: comprehension, high.)
- [ ] 3. **Does the second adult actually get in, and does anything change when
      they do?** The pre-mortem's central claim is that access was granted and the
      load did not move. That is the product's premise, testable with one
      household. (Synthetic User Panel: objection harvest, high.)
- [ ] 4. **Watch someone retrieve a recipe they saved six months ago.** Rikke's
      mechanism is Tier D and load-bearing for the whole recipe leg.
      (Synthetic User Panel: objection harvest, high + persona-as-lens.)
- [ ] 5. **What does a real household expect after "+ Add meal"** – to type, or to
      pick? (Synthetic User Panel: walkthrough, medium.)
- [ ] 6. **How do separated parents plan across a custody rota?** Still unasked,
      still changes the data model.
      (Synthetic User Panel: persona-as-lens, medium-high.)
- [ ] 7. **Does the English copy cost anything real** in a Danish household.
      (Synthetic User Panel: raised in every mode – and see limit 3 above, the
      panel cannot size this one.)

#### Panel health, for weighing the above

- **Held.** Twenty-four responses, all distinguishable with names removed. No
  persona invented a history with the product outside the pre-mortem, where the
  brief assigns one. All seven pre-mortem mechanisms were different.
- **One inflated agreement, marked.** Three personas cite the same Tier B line for
  the blank-week trait behind the walkthrough's strongest convergence – one piece
  of evidence wearing three faces.
- **Two panel-selection errors and one briefing leak**, logged in the panel's own
  `BACKLOG.md` with two re-runs owed: P07 left out of a walkthrough he is named
  for, P03 left out of a copy review whose most-rejected string only he would
  receive.
- **Still unanswered: "when did this panel last say no?"** A pre-mortem instructs
  rejection and comprehension never asks, so after five studies the panel has not
  yet had a fair chance to approve of anything. Weigh the findings accordingly.

### Synthetic User Panel findings, round 2 (2026-08-10)

Second round, run the same day as round 1 and against the REWRITTEN screens.
Source: `~/Documents/Claude/Projects/Synthetic User Panel`, study
`2026-08-10-prepeat-store-to-first-run`. Mode **comprehension**, ceiling
**high**. Panel P01, P02, P03, P05, P07 – baseline P02/P05, plus P01 and P07 for
first run, plus P01 and P03 together because sharing is involved. P04 and P06
deliberately out.

**⚠️ WHAT MAKES THIS ROUND DIFFERENT: THE APP STORE PAGE WAS IN THE ARTEFACT.**
Every earlier finding of the form *"the app never says X"* came from readers who
had never been told X anywhere, because only in-app screens were ever shown.
Here they read the store listing, then installed, then went through first run –
so they could compare a promise against what followed. **Recall was accurate
throughout; they quoted real lines.** This was Thomas's idea (2026-08-10).

**How the screens are numbered below**, because the numbers are the study's and
mean nothing on their own: **6** = *Set up your kitchen* (create or join), **7**
= *Name your kitchen*, **8** = *Your kitchen is ready* + invite code, **9** =
*Welcome to …* + Take a look around, **10** = the EMPTY RECIPES TAB, which is
where a new kitchen now lands.

**⚠️ EVERY FINDING CARRIES ITS REPORT NUMBER** – `2.1`, `2.2` … matching the
visual report, which is the numbering authority. Say "do 2.10" and it is
findable in both. **Numbers are names, not positions:** a finding added later
takes the next free number even though it sits higher up the page (2.27 is
between 2.22 and 2.23 in the report, deliberately), and a retired number is
never reused.

**Standing limits, both still true:** nothing here is visual, and nothing here
says whether any of it costs anything commercially.

#### What round 2 says about round 1's fixes

- [ ] `2.22` **Reduce what "kitchen" costs a first-time reader**
      Why: all five understood it, and all five had to work for it. That is a
           cost, not a failure – round 1 had seven of seven unable to say what
           a household was.
      Strength: ⭐ the round's strongest finding. Nothing in the personas'
           material pushed them here, so the agreement is real.
      Note: the structural half of P03's complaint is 2.27 below, and no word
           can fix it.

      All five got there; all five worked for it. P03: *"a thing you name, a
      thing you're in, and a tab. I have a kitchen. It's in Roskilde."*
      (Panel round 2: comprehension, high.)
      **⭐ RESTS ON NO SHARED SOURCE** – nothing in the personas' material pushed
      them here, so this agreement is real. That makes it the strongest finding
      in the round, despite being a smaller complaint than the round-1 one it
      replaces.
      **Still a large improvement:** round 1 had seven of seven unable to say
      what a household WAS. Nobody failed to decode kitchen. The residual is
      cost, not failure.
- [ ] `2.27` **Decide whether Kitchen should be a tab at all**
      Needs: Thomas – a navigation call, not a wording one.
      Why: Plan, Recipes and Shopping all live INSIDE the kitchen, so a fourth
           sibling tab called Kitchen sits next to its own contents.
      ⚠️ This is navigation work, not wording. Do not try to fix it with a word.
      (Panel round 2: comprehension, high.)
- [ ] `2.26` **Make placeholder text look like a placeholder** (same task as the
      round-1 item above – tracked in both because both rounds found it)
      Why: `anna@example.com`, `Sofia`, `The Hansens` – five of five stopped,
           and P07 said he would think he had signed into the wrong account.
      Note: a TREATMENT problem, not a wording one. Renaming did not touch it.
      (Panel round 2: comprehension, high.)

#### Screen 6 – what the report numbers 2.1 and 2.2

Missed when these findings were first logged, and caught on 2026-08-10 while
tagging the backlog against the report. Both are in the report.

- [x] `2.1` **Create-or-join is understood.** The fork itself now reads cleanly.
      In round 1, seven of seven could not say what the thing being created
      *was*. This is the round-1 rewrite holding, and is logged so the win is
      not invisible. (Panel round 2: comprehension, high.)
- [ ] `2.2` **Make setting up a kitchen feel like starting on food, not naming a box**
      Why: five of five. One reader expected to see a week; another expected to
           be asked who eats here, and when. Nothing about dinner has happened
           by the time they have a name and a code.

      *"I make an empty box with a name on it, and then I get a
      code I am supposed to send to Kasper. Nothing about dinner has happened. I
      have named something."* One reader expected to see a week; another
      expected to be asked who eats here, and when.
      (Panel round 2: comprehension, high.)

#### The precondition problem – the biggest finding, and the most over-readable

- [ ] `2.8` `2.9` **Stop the first screen reading as homework**
      Why: all five concluded, unprompted, that the plan and the shopping list
           do not work until recipes exist. Nobody told them that.
      ⚠️ Half of this is over-readable: *the words communicate a precondition*
           stands. *This is where people quit* does NOT – four of the five
           ledgers trace to one source.
      ⚠️ It judges a change made the same day (`dd7ccdb`, landing an empty
           kitchen on Recipes). Do not revert on this evidence alone.
      Related: 2.10 below is the one line that offers a way past it.

      P01: *"an empty cupboard with a note on it saying fill me."*
      P02: *"Skal jeg selv skrive pasta med kødsovs ind? Det kan jeg altså
      udenad."* and *"I had arrived in the wrong room."* P03: it says the job
      begins with building a cookbook, and that is a sit-down job.
      (Panel round 2: comprehension, high.)
      **⚠️ NOT FIVE INDEPENDENT READERS.** Four ledgers trace to the same source
      – Danish reviewers resenting setup burden – and P01's version is the
      invented assumption her character was built on. ***The words communicate a
      precondition* STANDS. *This is where people quit* DOES NOT.**
      **⚠️ THIS IS A VERDICT ON A CHANGE MADE THE SAME DAY** – landing an empty
      kitchen on Recipes (commit `dd7ccdb`). It was meant to spare people the
      empty week. It may have swapped "a week you cannot fill" for "homework".
      Do not revert on this evidence alone; the caveat above is why.
- [ ] `2.7` **Reword "Take a look around" – it promises a tour and delivers one empty screen**
      Why: two readers expected to be shown something.
      ⚠️ Self-inflicted, same day (`5bc480d`): the label was chosen to avoid
           promising a destination, and it promises an experience instead.
      (Panel round 2: comprehension, high.)

#### Screen 6 – the choice is understood, four things around it are not

The create-or-join fork itself now reads cleanly, which is the round-1 fix
holding. What remains is information, not wording.

- [ ] `2.3` **Say what the second person sees when they join**
      Why: both halves of the household asked. P01: does he see my plan, or
           another empty page asking him to add a recipe? P03, from the other
           side: if she puts nothing in, is this just a list I made for myself?
      (Panel round 2: information gap. This is exactly why P01 and P03 run as
      a pair.)

- [ ] `2.4` **Say whether create-or-join can be undone**
      Why: P05 and P07 both asked what happens if the other adult installs the
           app later and creates their own kitchen. P05 read *"join theirs
           instead of starting another"* as a warning that two kitchens can
           never be merged – and flagged that as a guess.
      Note: this half-closes the round-1 duplicate-kitchen item. The sentence
           added on 2026-08-10 stops the mistake and says nothing about
           recovering from it.
      (Panel round 2: information gap.)

- [ ] `2.4` **Say whether the person who made the kitchen owns it**
      Why: P03 – the first person names it and holds the code. Does that make
           them the owner of something?
      (Panel round 2: information gap.)

- [ ] `2.4` **Explain what "leave a kitchen and your recipes come with you" means**
      Why: three readers. Whose recipes, does the other person keep a copy,
           what if both leave. P05 called it the closest thing on the page to
           an answer about his own data, and could not tell what it promises.
      (Panel round 2: comprehension, high.)

#### The store page – promises the first session does not keep

**These are edits to text that has NOT shipped** (the v1.1 draft in
[app-store-listing.md](app-store-listing.md)), so they are the cheapest items
here. Fix them there, not in a copy of them.

- [ ] `2.10` **⭐ Show IN THE APP that a meal can go on the plan without a recipe**
      Why: it is the one line that offers a way past the precondition problem
           above, and nothing in the app confirms it. P01 built her whole
           escape route on it – "pasta" on Tuesday, no recipe – then had to
           mark it a guess.
      ⚠️ This one is an APP change, unlike the rest of this section. Three
           readers recalled the line; P03 liked it best on the page and asked
           why it is buried.
      (Panel round 2: comprehension, high.)

- [ ] `2.11` **Reword "Keep every recipe in one place"**
      Why: P02 read it as *they are already somewhere*, and the empty recipes
           screen contradicts it directly.

- [ ] `2.12` **Make "paste a link" real, or stop promising it equally**
      Why: the listing sets up two routes and the app offers one. P05 expected
           them to be equal. P01 sat up at the line, then found it does not
           describe what she has – 40 screenshots and saved Instagram posts,
           no links.

- [ ] `2.13` **Say whether you can plan a single day, not just a week**
      Why: all five inferred a seven-day grid from the repeated "the week"
           without being shown one. P02 noticed the missing option – *"it
           never offered me a day"* – and asked whether it can tell her what
           to make right now.
      Constraint: deciding shortly before cooking is the majority Danish
           pattern, so this is more than a wording gap.

- [ ] `2.14` **Say what "What can I make with aubergine?" actually searches**
      Why: read as searching only your own typed-in recipes, and nothing
           confirms or denies it. P02: it can answer that once she has done a
           lot of typing.

- [ ] `2.15` **Say whose list changes when the app learns a correction**
      Why: three readers. P05: if I move something to Dairy, has my wife's
           list changed?

- [ ] `2.16` **Say how to get your data OUT**
      Why: the privacy block answers deletion and conflates it with export.
           P05: *"Data i EU. Det er pænt. Men hvor får jeg dem ud henne?"*
      (Panel round 2: information gap.)

- [ ] `2.20` **Say somewhere in words that the app is free**
      Why: three readers filled the silence by assuming free. P05 – *"Ti
           skærme, og ingen pris"* – said a paywall after screen 10 would make
           the store page misleading by omission.
      Note: this is about the copy, not about willingness to pay. ⚠️ It partly
           reopens the round-1 money item, closed on the grounds that the store
           answers it – it answers it in the PRICE FIELD, not in the words.
- [ ] `2.17` **Stop the store page teaching a portions model the app cannot honour**
      Why: "cooking for three on Tuesday and eight on Saturday" teaches one
           number per meal. P07 derived it correctly and found nowhere for his
           real case – one pot, four sittings across an evening.
      Note: the round-1 portions finding was closed as out of scope and stays
           closed. What changed is that the page now advertises the limit.

- [ ] `2.18` **Say something about one person in the house eating differently**
      Why: P07 has a vegetarian daughter, P01 a child who will not eat sauce.
           Both found silence and assumed it cannot be done.
      (Panel round 2: information gap.)

- [ ] `2.19` **Stop the shopping copy assuming a physical shop**
      Why: P05 read *"whoever is closest to the shop"* and *"two people in two
           aisles"*, found not one word about ordering online, and concluded
           the app does not describe how he buys food.

- [ ] `2.21` **⚠️ BRAND-LEVEL: decide whether "Prep" is costing us readers**
      Needs: Thomas – a brand call, on one reader's evidence.
      Why: P02 read it as Sunday meal-prep with plastic tubs and filed the
           product as not-for-her off the NAME, before reading the page.
      Weight: one reader, no supporting ledger – and the only finding in
           either round that touches the name itself.
      (Panel round 2: comprehension, high.)

#### Sentences nobody could parse

The panel grouped these as *"words that failed for everyone"* – five of five
stopped on each, which is what makes them the cheapest items in the round.
**Two of the five are logged above as items in their own right** ("kitchen", and
the invented sample data) because they are bigger than a sentence. These three
are just sentences, and were missed on the first pass through these findings.

- [ ] `2.23` **Rewrite "on your phone only"**
      Why: five of five could not tell whether it is a reassurance or a
           limitation. It is meant as privacy and reads equally as a
           restriction.
      (Panel round 2: comprehension, high.)

- [ ] `2.24` **Rewrite "everything downstream keeps up"**
      Why: stopped all five. No reader could say what "downstream" referred to.
      (Panel round 2: comprehension, high.)

- [ ] `2.25` **Rewrite the sentence about ticked items surviving a rescale**
      The sentence: *"…remove it and its share comes back off – without
           touching anything you have already ticked or edited by hand."*
      Why: five of five stopped, and three reached the right meaning while
           saying they were not sure they had. A sentence doing correct work
           badly, not a wrong sentence.
      (Panel round 2: comprehension, high.)

#### One sentence that did opposite jobs

- [ ] `2.6` **Reassure people the invite code persists without telling them to skip it**
      Why: the same sentence did both jobs. P05 read *the code persists*. P01
           read *I need not do this now* – *"Jeg deler den kode i morgen"* –
           which she said she would not otherwise have done.
      ⚠️ Self-inflicted, same day (`d6e0367`): added to stop the invite step
           reading as compulsory. It worked, and that is the problem.

      P05 took it as *the code persists*.
      P01 took it as *I need not do this now* – *"Jeg deler den kode i morgen,"*
      which she said she would not otherwise have done. **Caused by a change
      made the same day** (`d6e0367`), added to stop the invite step reading as
      compulsory. It worked, and that is the problem.
      (Panel round 2: comprehension, high.)

#### What WORKS – logged before anyone changes it

- [x] `2.5` **The invite code is understood perfectly.** All five read `PREP-6A3V`
      correctly: the other person installs the app and types it in. **Nobody
      misread it.** (Panel round 2: comprehension, high.)
      **⚠️ READ THIS BEFORE BUILDING LINK-JOINING** (see the item under Later):
      the mechanism being replaced currently tests clean. Whatever replaces it
      has to clear this bar, and the case for the link is convenience, NOT
      comprehension.

#### What to verify with real humans (the panel's own three)

- [ ] 1. **Show a real person screen 10 cold and ask what has to happen before
      the plan works.** Directly tests the precondition finding, and the caveat
      above means only a human can settle it.
- [ ] 2. **Ask what a "kitchen" is, in their words.**
- [ ] 3. **⭐ Give the store page to one person in a household and the invite
      code to the other, then watch what actually happens.** The sharpest
      research idea in either round – it tests the product's actual premise,
      which is that the second person's arrival changes something.

## Someday – not committed

Wanted, unscheduled, or waiting for a trigger. Nothing here has a promise attached to it.

### Ideas – not yet committed

- [ ] **Finish the icon and splash variants**
      Why: nothing here ships while the app is iOS-only, so this waits for
           Android and for an iOS 18 appearance pass.
      Left: no ios-dark / ios-tinted icon variants, and the Android splash
           still uses Expo's default.
      Done: the iOS icon, the iOS launch screen, and the Android adaptive icon.

      iOS app icon + launch screen shipped
      2026-07-23; the **Android adaptive icon is DONE too** (foreground,
      background and monochrome art all present in assets/images, contrary to
      the older note here). Still open: no ios-dark / ios-tinted icon variants
      (iOS 18+ appearance icons), and the Android splash still uses Expo's
      splash-icon.png (the Android 12+ centred-icon-in-a-circle system cannot
      reuse the full-bleed iOS launch image). None of it ships while it is
      iOS-only.

- [ ] **🌙 MOONSHOT: import a recipe from an Instagram video**
      Why: the recipe is IN the video – spoken aloud or on-screen – not in the
           caption (Thomas, 2026-08-07).
      ⚠️ Settle first: getting the video file at all is a LEGAL question, not
           a technical one. Instagram blocks it and it is against their terms.
           If the answer is no, everything else is moot.
      Note: reading the content is the easy half – Apple ships on-device
           transcription and OCR.
      **⚠️ THE HARD PART IS NOT THE AI. IT IS GETTING THE VIDEO.** Ranked by
      actual difficulty, which is the reverse of how it feels:
      1. **Obtaining the file - the real blocker, and it is legal rather than
         technical.** Instagram has no public API for arbitrary Reels and blocks
         unauthenticated fetches hard; downloading media programmatically is
         against their terms. That is a genuine risk for an App Store app, not a
         puzzle to engineer around. **Settle this before writing any code** - if
         the answer is no, everything below is moot.
         The plausible route is the **iOS Share Sheet**: the user shares a Reel
         to Prep+Eat and the app receives a URL. Note that is a URL, not a video,
         so it does not by itself solve this step. A share extension is also a
         separate iOS target, app groups and config-plugin work - real effort
         before a single frame is read.
      2. **Reading the content - the solved part, and cheaper than expected on
         iOS.** Apple ships both halves on-device: `Speech` for transcription and
         `Vision` for OCR of on-screen text. On-device means no per-import API
         cost, no network dependency and no recipe text leaving the phone, which
         also keeps the privacy policy as it stands. Most Reels carry the
         ingredients as overlay TEXT, so OCR on sampled frames may beat
         transcription; likely both, merged.
      3. **Turning the result into ingredients - this is the moonshot below, but
         worse.** Spoken recipes routinely have no amounts at all ("a good glug
         of olive oil", "season to taste"), so the output is inherently poorer
         than any written source. Build that one first; this one depends on it.
      4. **Review - already built.** The import screen populates the editor and
         saves nothing until Save is pressed, so a rough extraction is
         correctable rather than damaging. Same de-risking as below.
      **THE MUCH CHEAPER ADJACENT WIN, worth knowing even though Thomas asked
      for the video:** a large share of recipe Reels ALSO put the full recipe in
      the caption. Caption text needs no transcription, no OCR and no frame
      sampling - it is ordinary text through the parser that already exists. If
      Instagram access is ever solved for step 1, the caption path is a fraction
      of the work for a large fraction of the recipes. Do not skip past it on the
      way to the harder thing.
      **RELATED:** the existing "Import fallback for bot-blocking sites" item
      under Conditional - a hidden WebView fetch - is the same class of problem
      one notch easier, and would be the natural place to learn whether this
      approach is viable at all.

- [ ] **🌙 MOONSHOT: pull just the ingredient and the amount out of a messy line**
      Why: prep text left in the name splits a shopping row – "long beans, cut
           into short pieces" and "long beans" are two things to buy. Same
           wound as the duplicate-items bug and Teach-a-synonym.
      Why it is hard: the boundary between a name and a modifier is semantic.
           `beans, black` and `long beans, chopped` have the same shape and
           opposite answers.
      ⚠️ Less risky than it sounds: the human reviews every import before it
           saves, so this is assistive, not autonomous. A wrong guess costs one
           edit – which moves the bar from "near perfect" to "usefully better".

      (Thomas, 2026-08-07.) His examples, one per language:
      - `½ cup long beans, cut into short pieces` → **long beans, ½ cup**
      - `æg, sammenpisket til pensling, 1` → **æg, 1**
      **WHY IT IS A MOONSHOT AND NOT A PARSER TWEAK.** The boundary between a
      NAME and a MODIFIER is semantic, not syntactic, and no rule finds it:
      - `long beans, cut into short pieces` → the tail is prep, drop it.
      - `beans, black` → the tail is the ingredient. Same shape, opposite answer.
      - `salt, flaky sea` → is "flaky sea" prep, or a different salt you would
        buy separately? Genuinely ambiguous, and the shopping list cares.
      - The Danish example puts the quantity **last** and the prep in the
        **middle**; today's `parseIngredient` strips only a LEADING amount, so it
        would not even find the `1`.
      - It has to work in at least two languages, and the prep vocabulary is
        entirely different in each (`chopped`/`minced` vs
        `hakket`/`sammenpisket`/`snittet`).
      **WHY IT MATTERS MORE THAN IT LOOKS.** The shopping list merges rows on
      `item_merge_key`, which is the normalised NAME plus unit. Prep text left in
      the name splits a row: "long beans, cut into short pieces" and "long beans"
      are two different items to buy. So this feeds straight into the open
      duplicate-items bug, and it is the same underlying wound as
      Teach-a-synonym - the shopping list cannot merge what the importer did not
      clean.
      **⚠️ THE THING THAT MAKES IT FAR LESS RISKY THAN IT SOUNDS: the human
      already reviews every import before it saves.** The import screen shows the
      parsed recipe in the editor and nothing is stored until Save is pressed. So
      this is ASSISTIVE extraction, not autonomous - it does not have to be
      right, it has to be better than leaving an instruction in the name, and a
      wrong guess costs one edit. That single fact moves the acceptable error
      rate from "near perfect" to "usefully better", which is the difference
      between impossible and buildable.
      **THREE ROUTES, cheapest first:**
      1. **Extend the rules.** Split on commas, drop a tail that starts with a
         known prep word, and look for a trailing amount as well as a leading
         one. Cheap, reuses everything already built (vulgar-fraction folding,
         `UNIT_SINGULARS`, the Danish unit lists). Partial by nature, and needs a
         hand-kept prep vocabulary per language. Will get `beans, black` wrong
         unless the list is conservative.
      2. **Ask a model per ingredient line**, returning `{name, quantity, unit}`.
         The only route that handles arbitrary phrasing in any language. Costs:
         an API key in the app's supply chain, a per-import cost, a network
         dependency on a flow that currently works offline once fetched, and
         non-determinism. Also sends recipe text off-device, which the privacy
         policy would have to cover.
      3. **Hybrid - rules first, model only for the lines rules cannot parse
         confidently.** Most lines are simple (`400 g cherry tomatoes`) and
         already work; the spend and the exposure land only on the hard ones.
         Probably the right shape if this is ever built.
      **RELATED, and worth reading first:** the existing code debt "Recipe import
      leaves prep instructions in the ingredient NAME" carries a list of real
      failures harvested from the demo household - that list is the test set for
      any of this. Note also that fixing the importer does NOT repair recipes
      already imported: there is still no re-import action.

- [ ] **Stop the screen dimming while you cook from a recipe**
      Needs: Thomas – whole recipe or a cook mode, steps or everything, visible or silent.
      Why: sticky hands and a phone that dims every 30 seconds. This is the one
           screen propped up and read from across a worktop.
      Decide first (none of it technical): the whole recipe or a deliberate
           "cook mode"? The steps only, or the ingredients too? And should the
           user be able to see it is on – an unexplained always-on screen reads
           as a bug.
      Size: tiny to build – `useKeepAwake()` is roughly the whole change.
      Blocked by: no design exists for any of the three decisions.

      (Thomas, 2026-08-07.)
      Cheap: `expo-keep-awake` ships with the SDK, and `useKeepAwake()` in
      [src/app/recipes/[id].tsx](../src/app/recipes/[id].tsx) is roughly the
      whole build - it activates on mount and releases on unmount, so leaving
      the screen restores normal behaviour by itself.
      **THREE THINGS TO DECIDE, none of them technical:**
      1. **The detail screen only, or a deliberate "cook mode"?** Always-on for
         anyone who merely opens a recipe to read it will flatten batteries for
         a benefit they did not ask for.
      2. **Does it belong to the whole screen or to the steps?** Arguably the
         instructions are where you are hands-busy; the ingredients you read
         once.
      3. **Should it be visible?** An always-on screen that the user did not ask
         for and cannot see the reason for reads as a bug, not a feature.
      No design exists for any of that.

- [ ] **⚠️ Put a height cap on the nine sheets that still lack one**
      Why: an uncapped sheet grows with its content until the close button goes
           off the top of the screen and the sheet cannot be dismissed. That
           already happened to the ingredient sheet the moment it gained one
           more button.
      Watch: import-recipe (keyboard is up) and edit-profile (three buttons).
           Neither is tall enough to break TODAY – which is exactly what was
           true of the ingredient sheet until it wasn't.
      Size: its own sitting, each sheet walked. Adding the cap also wraps the
           contents in a spacing container, so it can shift layout subtly, and
           nine screens changed without walking any is how a fix becomes a bug
           round.

      (Found 2026-08-07 while fixing
      the ingredient sheet, which was the tenth.) A `BottomSheet` without the
      `scroll` prop has no maxHeight at all: it simply grows with its body, and
      the title-and-close row sits ABOVE the scroll area, so once content plus
      keyboard exceeds the screen the close button goes off the top and the sheet
      cannot be dismissed. That is what happened to the ingredient sheet the
      moment it gained one more button.
      Capped today: recipe detail, edit-item, add-meal, add-to-plan, step,
      ingredient. **Uncapped: import-recipe, leave-household, move-day,
      invite-someone, servings, edit-profile, edit-household, delete-profile,
      delete-household.**
      Most are short confirmations that will never reach the top. The two to
      watch are **import-recipe** (a URL field, so the keyboard is up) and
      **edit-profile** (three buttons) – neither is tall enough to break TODAY,
      which is exactly what was true of the ingredient sheet until it wasn't.
      NOT done in the same pass on purpose: adding the cap also wraps a sheet's
      contents in a spacing container, so it can shift layout subtly, and nine
      screens changed without walking any of them is how a fix becomes a bug
      round. Worth its own sitting, each one walked.

- [ ] **Let people leave a kitchen from the switcher**
      Needs: Thomas – a frame for the leave affordance, and whether it belongs there at all.
      Why: Thomas went looking there and could not find it. Leaving lives
           inside Edit profile, which is about your name and your account –
           the switcher is where the kitchen itself is the subject.
      Weigh first: leaving is irreversible-ish, so it should not sit one tap
           from a routine switch.
      Blocked by: no frame draws a leave affordance in the switcher.
      Note: leaving DOES exist today – Kitchen tab → your name → Edit profile.

      (Thomas, 2026-08-07, walking the
      0032/0033 device list: *"it is not possible to leave a household from the
      switcher, but maybe it should be"*).
      **Leaving does exist** – Household tab → tap your own name → Edit profile →
      Leave household, gated on `members.length > 1`
      ([household.tsx:200](../src/app/household.tsx)). Thomas could not find it
      because it is not where he looked, and because the household he had just
      created was solo, so the option was correctly absent anyway.
      **THE REAL QUESTION IS WHERE LEAVING BELONGS, and Claude thinks the
      current home is wrong** (flagged as Claude's opinion, not Thomas's ask):
      leaving a HOUSEHOLD sits inside EDIT PROFILE, which is about your name and
      your account. The switcher is where the household you are in is the subject
      of the screen, so it is the natural place to ask to get out of one – and it
      is where a second household becomes visible in the first place.
      Worth weighing against two things before building: leaving is
      irreversible-ish (you get a copy of the recipes, not the shared household
      back), so it should not sit one tap from a routine switch; and the switcher
      is a small surface that already carries create and join.
      **Needs a design**, per the no-improvised-UI rule – no frame draws a leave
      affordance in the switcher today.

- [ ] **Show the shopping list when the phone has no signal**
      Why: the list is the one screen used standing in a shop, which is exactly
           where signal is worst – and today you get an error and nothing else.
      Not a defect: every error path behaves as designed. It is a product
           assumption (the app assumes it is online) with no fallback.
      Cheap first step: cache the CURRENT week's list and show it read-only
           when the load fails. Covers the in-the-shop case without touching
           the sync model.
      Decide: before the family relies on it weekly.

      (Found 2026-08-03 by Thomas testing the retry screens. The item's opening
      line was lost at some point before 2026-08-11 and is restored here.)
      Force-quit the app, lose signal, reopen: you get "Can't reach your
      kitchen" and nothing else – no plan, no recipes, and no shopping list.
      Confirmed in code: `AsyncStorage` holds only the auth session, the
      active household id and a one-time legacy-prefs migration. **No recipe,
      meal plan or shopping item is cached on the device**; every screen
      fetches from Supabase on each launch.
      WHY IT MATTERS more than it looks: the shopping list is the one screen
      used standing in a shop, which is exactly where signal is worst, and iOS
      evicts backgrounded apps routinely on a long trip. While the app stays
      in memory everything is fine – the failure needs a force-quit or an
      eviction, which is not constant but is not rare either.
      NOT A DEFECT – every error path behaves exactly as designed, which is
      why the pre-build audit did not flag it. It is a product assumption
      (the app assumes it is online) with no last-known-good fallback.
      A real offline mode is significant work and touches the sync model
      (last-write-wins via `updated_at`, realtime merges), so this is logged
      as a known limitation rather than a task. A cheap first step, if it ever
      bites: cache just the CURRENT week's list and show it read-only when the
      load fails, which covers the in-the-shop case without touching sync.
      Worth a decision before the family relies on it weekly.
- [ ] **Show the invite code as a filled brand chip**
      Needs: Thomas – a call on whether it is worth designing at all.
      Why: it would make the code look like a thing to be copied, while keeping
           the brand green.
      Note: purely an enhancement. The accessibility defect is already fixed
           and both invite surfaces agree – there is nothing wrong to repair.
      Only if: Thomas wants to design it.

      (Measured 2026-08-02, not
      committed to.) White on #378112 clears AA at 4.87:1 and would make the
      code look like a thing to be copied while keeping the brand green. Purely
      an enhancement – the accessibility defect is already fixed with
      `text/default` (9.12:1) and both invite surfaces now agree, so there is
      nothing wrong to repair. Only worth doing if Thomas wants to design it.
- [ ] **Sort the shopping list to the layout of the shop you are in**
      Why: aisle order differs per shop, and the list currently has one order.
      Simple version: pick the store ("Netto", "Bilka"…) when you start
           shopping. Stretch: auto-switch by location.
      Size: a small `store_layouts` table (household_id, name, category_order)
           on top of the existing single order.
      (Thomas, 2026-07-06.)

- [ ] **Have AI guess a category before the learned memory takes over**
      Why: decision #7 names this as the natural v1.1 upgrade.

- [ ] **Parse quantities typed into the add-item field** ("Milk 2L" → name + quantity)

- [ ] **Show the household what it actually cooks**
      Why: the plan has been collecting real history since July and nothing
           reads it back. It could suggest a week from your own rotation
           rather than a blank slate – which is the empty week's problem.
      Decide: how much is a screen you visit versus quiet suggestions inside
           the existing flow.
      Size: cheap to try – no new data collection needed for a first version.

      (Thomas, 2026-07-25): the household has been building a real history in
      `meal_plan_entries` since July (every meal, its day and its servings),
      and today nothing reads it back except the "recently planned" ordering
      in the picker. Ideas it could support: what you actually cook most; what
      has not appeared in a while ("you haven't made X since May"); which day
      each meal tends to land on; seasonal patterns once there is a year of
      data; a nudge when a week looks like a repeat of the last one. Could
      feed planning directly – suggesting a week from your own rotation rather
      than a blank slate. No new data collection needed for the first version,
      which makes it cheap to try. Worth deciding early how much is a screen
      you visit versus quiet suggestions inside the existing flow.

### Conditional – only if it bites

- [ ] **Make recipe import work on sites that block us**
      Why: madensverden.dk and allrecipes refuse non-browser fetches, so
           pasting a link from them fails.
      Trigger: only build it if a site the family actually uses gets blocked.
      Size: a hidden-WebView fetch is the known fix; nothing exists in code
           today (a comment in recipe-import.ts names it, and
           react-native-webview is not installed).

- [ ] **Add "Continue with Apple" sign-in**
      Why: convenience only.
      Trigger: not required by Apple – guideline 4.8 only forces it when you
           also offer a third-party login (Google/Facebook), and Prep+Eat only
           offers email-code sign-in.

### Code debts (small, known, deliberate)

- [ ] **The first ingredient heading sits 16px lower than the design draws it**
      Why not fixed: every LATER heading matches Figma exactly. Only the first
           one differs, because the design gives it no space above and the code
           draws every slot the same height.
      Cost of fixing: the uniform slot height is what makes the section-drag
           arithmetic provably correct (`src/lib/reorder.ts`, 24 checks). Losing
           it to win 16px is a bad trade.
      Status: recorded 2026-08-11 when the sections work closed. Reopen only if
           it reads wrong on a long recipe.

- [ ] **Clean up recipes imported before 2026-07-29**
      Why: the parser used to leave whole instructions in the ingredient name
           ("garlic clove, cut in half"), and the shopping list inherited it.
      Left: the parser itself is FIXED. What remains is the old recipes still
           holding mangled names – which needs the re-import gap below.

      (found 2026-07-29 while shooting App Store
      screenshots). `parseIngredient` in
      [src/lib/recipe-import.ts](../src/lib/recipe-import.ts) only strips a
      LEADING amount + known unit; everything else stays in the name verbatim.
      Real items produced from imported recipes in the demo household:
      - `Prik Nam Pla (condiment for seasoning the egg, optional): Mix together
        some fish sauce, a squeeze of lime juice, chopped Thai chilies, and
        chopped garlic.` – a whole instruction the source site filed under
        `recipeIngredient`
      - `½ tsp black soy sauce (or sub dark soy sauce and reduce regular soy
        sauce to 2 tsp)`, quantity `1` – the `½` never parsed as an amount
      - `coriander leaves, 1 large handful` – quantity is not leading, so it
        stays in the name
      - `½ cup long beans, cut into short pieces`, `cheese, grated (any melting
        cheese will do)`, `garlic clove, cut in half`, `tomato, sliced`
      This is the shopping list – the feature the listing calls the centrepiece
      ("The list builds itself from the plan"). It makes an imported week's list
      read as broken, and it is why the store screenshot of Shopping is not
      usable as-is. Worth fixing at least: vulgar fractions (½ ¼ ¾) as amounts,
      strip a trailing `, <prep word>` clause, drop parentheticals, and reject
      ingredient strings that are obviously sentences.
      **PARSER FIXED 2026-07-29** (vulgar fractions, trailing prep clauses
      both opening AND ending in the prep word, parentheticals, `or`/`eller`
      alternatives, trailing amounts, colon sentences, US `c.` for cup –
      31 English + 18 Danish cases verified, range/Danish regressions intact).
      Danish vocabulary completed the same day; other languages are a v1.1+
      item under Later. Recipes imported
      BEFORE that date still hold the old mangled names; see the re-import
      gap below.
- [ ] **Add "Re-import from source" to the recipe edit screen**
      Why: every parser improvement only ever benefits NEW recipes. Existing
           ones can only be fixed ingredient by ingredient by hand.
      Size: small – `applyImport` already does the right thing to the form and
           `replaceIngredientsAndSteps` already saves it in place.

      The "paste a link"
      button in [src/app/recipes/new.tsx](../src/app/recipes/new.tsx) is gated
      behind `!editing`, so the edit screen has no import trigger. Found
      2026-07-29 when the parser fix above could not be applied to recipes
      already in the demo household. Consequence: every parser improvement, and
      every site that fixes its own markup, only ever benefits NEW recipes –
      existing ones can only be corrected ingredient by ingredient by hand, or
      by creating a duplicate and deleting the original (which also orphans the
      meal-plan snapshots). A "Re-import from source" action on the edit screen
      would fix it; `applyImport` already does exactly the right thing to the
      form, and `replaceIngredientsAndSteps` already saves it in place.
- [ ] **Drop the `meal_plans.pushed_to_list_at` column, eventually**
      Why: it is a compatibility shim kept alive only for TestFlight build 10.
           Nothing reads or writes it.
      Wait for: every tester's phone to run build 11 or later, confirmed
           INSTALLED in App Store Connect – not merely committed here.
      Size: no hurry. A nullable column nobody touches costs nothing.

      Migration 0023,
      APPLIED 2026-07-27, an always-null compatibility shim so TestFlight
      build 10 keeps working. Nothing reads or writes it. Drop it
      again – a fresh migration, never by editing 0022 or 0023 – only once
      every tester's phone runs a build that does not SELECT it (11 or later,
      confirmed INSTALLED in App Store Connect, not merely committed here).
      No hurry: a nullable column nobody touches costs nothing.
- **NOT A DEBT – `fillFromWeeklyPlan` is unreachable from the UI on purpose.**
      Standing note so it stops being re-flagged as dead code (last reviewed
      2026-07-27). It is the "reset this week's list" escape hatch from the
      A + rails decision and the only repair path if a contribution ever fails
      mid-write (offline at the wrong moment – nothing retries it). Its doc
      comment and its RPC `push_plan_to_list` both say so.
- [ ] **Split the `text/link` token in the DS – it is unreadable on white**
      Why: #56C91D measures 2.15:1 on white, well below the accessibility
           minimum. The token whose whole job is "this is a link" cannot be
           legible only on coloured surfaces.
      Owner: THE DS PROJECT, not this repo (Thomas, 2026-08-02). The app picks
           it up on the next `npm run sync-ds-tokens`.
      Meanwhile: the app has one use left – the wordmark – and it is exempt.
           Any NEW use reintroduces the defect.

      (measured 2026-07-28
      while building the website). `text/link` is **#56C91D**, which is
      **2.15:1** against #FFFFFF – far below the WCAG AA minimum of 4.5:1 for
      body text. It is the token whose whole job is "this is a link", so it
      cannot be legible only on coloured surfaces.
      `text/brand` (#378112) is the same family and measures **4.87:1**, so the
      website uses that for links and underlines them as well, keeping colour
      off the critical path. Everything else measured clean: text/default 9.75:1,
      text/subtle 7.79:1, button label on lime 6.22:1.
      **SWEPT 2026-08-02, and it WAS in the app** – see finding 6 of the
      pre-build audit under Known bugs. The onboarding "household is ready"
      step printed the INVITE CODE in this token on the near-white panel
      (2.01:1), the worst possible place for it: the code a new user must read
      accurately to give a family member full access. **That screen is now
      fixed** (swapped to `text/default`, 9.12:1), and the sweep found no other
      app surface using `text/link`.
      **The TOKEN is still wrong, and the fix is a SPLIT – not a retune.**
      HANDED TO THE DS PROJECT 2026-08-02 (Thomas: *"this is a bigger token
      rewrite in the DS. Leave it for now and I will fix it in the DS
      project"*). Nothing more happens in this repo until the DS ships it;
      the app then picks it up on the next `npm run sync-ds-tokens`.
      WHY A SPLIT. `text/link` is doing two incompatible jobs: "this is
      tappable" (needs to be dark enough to read – #56C91D is 2.15:1 on white,
      a real accessibility defect) and "this is the brand" (the lime full stops
      in the welcome wordmark, which want to stay bright). Retuning the single
      token fixes links and silently darkens the brand mark – trading one
      problem for another, and the kind of change nobody notices until it has
      shipped.
      THE SHAPE, which needs no invention because the website already solved
      it: links there use `text/brand` #378112 with an underline, precisely
      because lime failed on white. So –
      - links point at `text/brand` (#378112, measures 4.55:1 on #F8F7F7 and
        4.87:1 on white – already the website's answer),
      - lime #56C91D survives unchanged under a name that says what it is for
        (a brand accent, not a link),
      - the wordmark periods point at THAT, and the welcome screen looks
        identical to today.
      Until it lands, any NEW use of `text/link` in the app reintroduces the
      defect – the app currently has exactly one, the wordmark, which is
      exempt (see the decided item under the pre-build audit).
- [ ] **Repoint `contrast-text` in the prep-eat brand – it is wired to the wrong colour**
      Why: DS hygiene. It aliases the dark ink where the sebell brand has
           near-white.
      Where: in FIGMA, not in code – the token exports are generated, so a
           hand-edit would be overwritten.
      Urgency: none. Nothing in the app consumes the affected tokens today.

      (diagnosed 2026-07-27):
      in the **prep-eat** brand `color/text/contrast-text` aliases
      `{color.text.primary}` – i.e. the dark ink #4F4230 – where the **sebell**
      brand has it as a literal near-white #FBFBF9. That asymmetry between the
      two brand modes is the wiring slip; Figma renders near-white, so the
      export is what is wrong. `figma-exports/*.tokens.json` are generated FROM
      Figma, so hand-editing them would be overwritten – the variable has to be
      repointed in the Figma file, then re-exported and rebuilt.
      NO EFFECT ON THE APP TODAY: the only contrast-text the app consumes is
      `error.contrast-text` (#FFFFFF), which is correct in both brands. Nothing
      uses text/success/warning/info contrast-text. So this is DS hygiene, not
      a bug in Prep+Eat, and it can wait for the next DS pass.

## Standing – recurring

Chores with a trigger rather than a finish line. These never get ticked off for good.

- [ ] **Watch for the moment Supabase Pro becomes necessary** (a standing check, not a task to do)
      Upgrade when ANY one of these is true:
        1. real users who cannot be phoned – ~30+ monthly actives, or the first
           support email from a stranger. Today's 18 are family and testers;
        2. more than a few days away from the Mac – turn it on BEFORE
           travelling;
        3. egress or database past half the free limit. At 162 MB / 31 MB
           today, so distant.
      Why not now: Pro only adds two things – it runs when the Mac does not,
           and it sits somewhere other than the desk. On retention it is
           WORSE than what we have, and its backups have never been restored.
      Do together with: the dev-environment decision. Trigger 1 is the same
           moment for both.

      (Thomas, 2026-08-04, after
      asking whether he had to upgrade or could watch – the honest answer
      changed once the local backup was proven to restore).
      **What Pro would actually add, given what now exists:** only two things –
      it runs when the Mac does not, and it lives somewhere other than the desk.
      On frequency it matches nightly-vs-daily, on retention it is WORSE (7 days
      against 30), and its backups have never been restored, where ours have.
      **Upgrade when any ONE of these becomes true:**
      1. **Real users who cannot be phoned** – ~30+ monthly actives, or the
         first support email from a stranger. Today's 18 are family and testers.
      2. **More than a few days away from the Mac.** Turn it on BEFORE
         travelling, not after.
      3. **Egress or database size past half the free limit** – 250 MB egress,
         250 MB database. At 162 MB / 31 MB today, so distant, but that is the
         point where the free tier stops being a choice.
      Keep the two free projects by putting anything else in a **separate Free
      organisation**; a Pro org bills every project in it.
      Not needed: PITR (~$100/mo add-on, rejected), and any capacity upgrade.
      **Decide the DEV ENVIRONMENT in the same sitting** – trigger 1 is the
      same moment for both, and doing them together is one upheaval instead of
      two. See "A second, free Supabase project as a DEV environment" under
      Ideas.

- [ ] **After every TestFlight build, sweep the open items and close what shipped**
      Trigger: the build's release notes being written – that is the one moment
           what-shipped exists in writing.
      Steps: read the new release-notes entry, find the open items it
           describes, tick them. Then check whether any `Blocked by` or
           `Wait for` line names something that has since landed.
      Why: added 2026-08-11 after two items were found finished – one of them
           for a week, unblocked by a fix whose own entry said it closed them.
           Closing is a separate job from doing and does not happen by itself.

- **Before changing the plan → shopping reconciler, run
  `node scripts/check-shopping-reconciler.mjs`** and read every row (agreed
  2026-08-04, after getting that reconciler wrong three times in one afternoon).
  WHAT WENT WRONG, because the two causes need different answers:
  1. **A decision made silently.** The choice between showing the plan's TOTAL
     and showing what is still OWED was noticed while writing migration 0028 and
     settled in favour of the total *because it kept the bookkeeping simple*.
     Thomas got a list asking for 4 litres when he needed 1.
     THE RULE: when implementation surfaces a choice between two behaviours,
     that is a decision, not a detail. Say so and ask. Convenience of the
     invariant is never a reason to pick what the user sees.
  2. **States nobody enumerated.** "Clear done items" silently switched the
     whole mechanism off, and earlier the same day a plural fix worked in one
     direction only. Both times the verification covered the path being thought
     about, and the bug sat in a state that was never listed – even though
     "cleared" is a BUTTON in the UI.
     THE RULE: enumerate the states and walk the cross-product, rather than
     writing down the scenarios that come to mind. That is what the script does:
     every line state (ticked / cleared / unticked / hand-edited / deleted by
     the shopper) against every plan change, plus the multi-step sequences that
     single-state checks cannot reach.
  IT PAID FOR ITSELF IMMEDIATELY: the grid found three more bugs in 0030 before
  it was ever applied – a hand-edited outstanding line being overwritten, a
  shopper-deleted one coming back, and sync's own tombstones being counted as
  "already bought" so that un-doubling then re-doubling showed nothing.
  ITS LIMIT, which matters: the script mirrors the SQL, it does not run it. It
  proves the rules are coherent, not that the functions implement them – and on
  both occasions the model was wrong, a mirror written from the same model would
  have agreed with the bug. A local Postgres harness would close that gap and
  does not exist; it is worth building if the mirror ever drifts, but it is not
  what failed today. **A device walk-through remains the only thing that settles
  a change.**
  **UPDATE 2026-08-04: the harness now exists** – local Supabase in Docker (see
  the next item and the 2026-08-04 decision). The mirror script keeps its value
  for enumerating the state cross-product cheaply, but "the model was wrong so
  the mirror agreed with the bug" is now testable against real SQL.

- **Run every migration against local Supabase before it touches production**
  (agreed 2026-08-04, off the back of the Free-plan-has-no-backups finding).
  Production is one project serving every installed build at once, so an applied
  migration has no blast radius limit. Two commands, in this order:
  1. `npm run db:reset` – replays EVERY migration onto an empty database. This
     is the one that catches what 0022 was: a migration that does not apply
     cleanly from scratch. It is not a substitute for reading the SQL, it is the
     check that the file even runs.
  2. `npm run db:start` and point a dev build at it, for anything that changes
     behaviour the shipped app relies on.
  Still standing, and NOT replaced by any of this: **never drop or rename a
  column in the same round as the code change that stops using it** (2026-07-27)
  – local Postgres cannot see what is on somebody's phone.

- **When a migration touches RLS, run and extend
  `supabase/tests/household-boundary.sql`** (started 2026-08-07 with 0032).
  It walks the household boundary as a REAL RLS-bound client against real SQL,
  and most of its checks assert that a LEGITIMATE path still works – which is
  where the risk in a policy change actually lives. A dropped policy reaches
  every installed build the instant it runs, so "the hole is closed" is the easy
  half; "the front door still opens" is the half that bites.
  Run it against a fresh `npm run db:reset`; the file carries its own how-to.
  Its first run also produced a false FAIL that was purely the test's own doing –
  a check reading under one user's RLS to assert a fact about another's. Read a
  failure before believing it.

- **Keep [release-notes.md](release-notes.md) current, INCLUDING the version
  number** (started 2026-08-03; Thomas wants something ready to post whenever
  the app updates, and has explicitly handed the number over: "I will
  forget"). Three standing jobs, in order of how easily they rot:
  1. **Add the user-facing line when a change lands**, not when a build
     ships – by build time the reasoning is cold and the wording is guesswork.
  2. **Re-check the NEXT VERSION line in the same edit.** Semver decides it,
     so this is bookkeeping: a feature raises a pending 1.0.1 to 1.1.0, and
     the number never drops again within one release.
  3. **Keep the three buckets honest** – accumulating (dev build only), per
     TestFlight build, and server changes, which reach every phone whatever
     version it runs and so belong to no version at all.
  At submission time, and only then: bump `app.json` `expo.version` to the
  number that line has been carrying, and move the section under its own
  heading with the date.

- **HOW TO RUN A BIG SQL SCRIPT: the Supabase SQL editor TRUNCATES long
  pastes.** Standing note, learned the hard way 2026-07-30 – five failed
  attempts at one 46 KB rebuild script before it landed. Not a hypothesis: the
  same script cut off at the same point twice, and the "copy file content"
  button lost content too (Thomas: *"Not all of the files content get
  copied"*).
  What each shape failed with, so the symptoms are recognisable next time:
  - **One `do $seed$ … $seed$` block** → `42601: unterminated dollar-quoted
    string`, echoing only the first third of the file. A truncated DO block can
    never parse.
  - **Plain statements wrapped in `begin;` / `commit;`** → `23503` foreign-key
    violation. The `begin` arrived, the `commit` did not, so the first part
    rolled back and later statements referenced rows that had vanished. This is
    the dangerous one: it looks like a data bug, not a truncation.
  - **Plain statements, no transaction, ~196 of them** → another `23503`,
    further down the file.
  What worked: **collapse to ~13 multi-row statements** (one `insert … values
  (…),(…),(…)` per table instead of one insert per row), no transaction
  wrapper, and every insert preceded by a delete of the same fixed ids so the
  whole file is safe to RE-RUN from the top. 46 KB → 30 KB, 196 statements →
  13. End the script with a verification `select` (counts + one known-merged
  row) so success is provable rather than assumed – "Success. No rows returned"
  proves nothing about a script that was cut in half.
  Also: the editor warns "creates tables without enabling RLS" on scripts that
  create no tables at all. Pattern-matching false positive – choose **Run
  without RLS**, never "Run and enable RLS", which would change security
  settings as a side effect.
  Generator for the working shape:
  `scratchpad/gen-bulk.ts` from that session – it drives the app's own
  `importRecipeFromUrl` + `parseQuantity` offline, so seeded data goes through
  exactly the same parser as a real import.
- [ ] **Rebuild the dev app when it stops opening** (probably obsolete – see below)
      When: if the dev app refuses to open on either phone, run
           `./scripts/build-iphone.sh` and re-trust it if prompted.
      ⚠️ Probably not needed at all: measured 2026-07-27, the signing is a PAID
           team, so the profile runs to 2027 – a year, not seven days. Kept as
           a safety net. If the app is still opening fine, delete this item.
      Note: TestFlight is separate and unaffected.

      BOTH phones now run the dev
      app ("Prep+Eat Dev", bundle app.prepeat.dev) from
      `./scripts/build-iphone.sh <UDID>` – no arg defaults to Thomas's. The
      2026-07-25 builds expire around **2026-08-01**; when the app stops
      opening, rebuild. The script deletes the provisioning profile, rebuilds
      with `xcodebuild -allowProvisioningUpdates
      -allowProvisioningDeviceRegistration` (minting a fresh 7-day profile),
      installs with `devicectl`, and prints the new expiry. WATCH that expiry –
      under ~7 days out means the free dev CERTIFICATE (also 7-day) is the
      limiter and needs regenerating too. Re-trust on the phone if prompted
      (Settings → General → VPN & Device Management → Trust).
      Device UDIDs are not kept in this public repo – read them off the Mac
      with `xcrun xctrace list devices`. (Note: `expo run:ios` does NOT pass
      -allowProvisioningUpdates, so xcodebuild must be driven directly – that
      is what the script does.) The TestFlight app is separate and unaffected,
      so this chore ends entirely once no phone needs cable builds.
      **PREMISE LOOKS WRONG (measured 2026-07-27):** the signing is a PAID
      team, so the profile runs to 2027-07-24 and the certificate to
      2027-07-06 – a year each, not seven days. The "expires 2026-08-01" date
      above is fiction. Kept as a safety net until mid-August; if the app is
      still opening fine then, delete this item.
- [ ] **After every DS publish, re-sync the tokens**
      Trigger: Thomas says "DS published".
      Steps: rebuild tokens in the DS repo → `npm run sync-ds-tokens` here →
           diff `ds-theme.cjs` → walk the affected screens.
      (Agreed 2026-07-12.)

## Record – closed work and decisions

Not work. Kept so a cold thread can pick things up without re-litigating them.

### In flight (built, not yet live)

- [x] **DONE – group a recipe's ingredients under headings like DOUGH and FILLING**
      Why: imported recipes arrive with those headings as ingredients with no
           amount, so they land on the shopping list as things to buy.
      Closed: 2026-08-11, Thomas – *"I'm happy with it."* Built, walked on
           device 2026-08-07, and shipped to the family in TestFlight builds
           16 and 17. Migration 0031 is on dev and production.
      Approved with it: the mid-drag look Claude improvised (the whole dragged
           section shows the lifted background, since no frame draws a section
           mid-drag). It was flagged as Claude's call and is now Thomas's.
      Left behind deliberately: the 16px first-heading spacing, moved to Code
           debts rather than dropped – see there for why it was not fixed.

      Thomas designed 2026-08-04; Figma `nA8SLN8rhdBov97B1IYxnP` node
      **121:11255**, "recipe – add recipe". Came out of importing
      ambitiouskitchen.com's cinnamon rolls.
      - [x] **Migration 0031 applied to DEV, then PRODUCTION (2026-08-06)** –
            `recipe_ingredients.is_section`. Backed up first, all 31 migrations
            replayed onto an empty local database first, and the restore
            re-verified afterwards (7,249 rows exact). Production came out
            identical to dev, 0 rows flagged - nothing is backfilled.
            **SAFE FOR THE PHONES:** additive only, and every installed build
            selects named columns, so TestFlight build 14 is unaffected.
      - [x] **⚠️ PRODUCTION HAD NO MIGRATION LEDGER – created 2026-08-06.**
            Found while applying 0031: `supabase_migrations.schema_migrations`
            did not exist there, because production's history had been applied
            by hand through the SQL editor. **`supabase db push` would have
            treated production as empty and re-run all 31 migrations, including
            0022, which DROPS columns.** One query to check; not checking would
            have caused the worst outage this project has had, using a command
            that looks routine.
            Fixed rather than worked around. The ledger's 31 rows were derived
            from the migration FILENAMES, after verifying those were
            byte-identical to the ledger the CLI itself wrote on the dev project
            - a copy of a known-good ledger, not a guess. Verified with
            `db push --dry-run`: *"Remote database is up to date"*, 0 pending.
            **So production is now pushable like dev**, which ends the
            hand-application that once half-applied a migration (the SQL editor
            runs only what is highlighted, 2026-07-30).
      - [x] **The DATA half works, verified on device 2026-08-06.** Importing
            ambitiouskitchen's cinnamon rolls now flags DOUGH / FILLING / CREAM
            CHEESE FROSTING as sections, keeps **"Extra-virgin olive oil"** as a
            real ingredient (the amountless case that detection could have
            hidden), and puts **no headings** in the plan snapshot or on the
            shopping list. Checked in the database, not on the screen.
      - **⚠️ IT TOOK THREE DEVICE BUILDS, AND THE LESSON IS STRUCTURAL.** The
            importer was right the whole time; the editor threw the flag away at
            **six** separate places – the import handoff, the edit load, the
            sheet's add and edit branches, and BOTH save branches. Each site
            rebuilt `{ name, quantityText }` by hand, so adding a field to the
            shared type could not make any of them fail to compile. It passed
            typecheck, lint, a device build and a careful re-read, twice.
            **What actually fixed it: making `isSection` REQUIRED on
            `DraftIngredient` rather than optional.** It found the sixth site
            within seconds. An optional field is one the compiler cannot help
            with, and the editor also had a *duplicate local* `DraftIngredient`
            shadowing the shared one – same name, narrower shape, no complaint.
            Both are gone; `toDraftIngredients()` is the single conversion.
            THE RULE: when a shape is built by hand in more than one place, make
            new fields required and give it one constructor. Vigilance is not a
            mechanism.
      - **NAMED "Section", NOT "Category"** (proposed by Claude, agreed by
            Thomas, corrected in Figma the same day). **"Category" already means
            the shopping list's aisles** – there is a `CategoryGroup` component,
            a `Category` type, and draggable category headers on the Shopping
            screen. Two different "categories", both rendered as a header over a
            group with a drag handle, with ingredients flowing from one into the
            other, is a collision users would meet within a minute.
      - **The four states, all Thomas's calls (2026-08-04):**
            1. **The first section absorbs what is already there.** It replaces
               the "Ingredients" header rather than sitting beside it, and the
               ingredients already listed become part of it.
            2. **Deleting a section keeps its ingredients** – they become
               unsectioned rather than being deleted with it.
            3. **An empty section is allowed** – a heading over nothing is a
               legitimate state, not something to prevent.
            4. **Delete every section and the "Ingredients" header comes back.**
      - **Sheet colour: match the add-meal sheet**, not a DS-wide retune – so
            no other screens need walking.
      - **The "Ingredients" header uses the SAME style as a section heading**
            (`header/display-6`, Montserrat) – Thomas, 2026-08-06, asked because
            no frame draws "Ingredients" in the new style and guessing would
            have invented it. It follows from decision 1: the first section
            *replaces* that line, so they are one slot and it must not change
            typeface the moment a section appears.
      - **Reuse, do not rebuild:** `add-meal-sheet.tsx` already has the tab
            component the design uses (`TabItem`, "Recipes"/…), and section
            headers want the Shopping screen's drag-handle reorder pattern.
      - [x] **TRUE SECTION DRAGGING – BUILT 2026-08-07** (deferred 2026-08-06,
            Thomas: *"for now is fine that every row moves independently"*).
            A heading now carries its ingredients, and a section can only land
            on a section boundary.
            **THE DESIGN QUESTION, decided by Thomas 2026-08-07** from three
            options. It is not obvious, and the example is why: with
            DOUGH[flour, water] / FILLING[sugar, cinnamon], dragging FILLING
            between flour and water would – if a group simply landed where you
            dropped it – leave **water inside FILLING**, because sections are
            positional. An ingredient changes section with nobody touching it.
            So the group **snaps to section boundaries** and that case is
            unreachable rather than merely unlikely. A single ROW still goes
            anywhere: dropping an ingredient into another section is how you
            assign it to one, so that freedom is the feature.
            **⚠️ THE DEFERRAL'S COST ESTIMATE WAS WRONG, and it is worth knowing
            why.** The note said groups are variable-height blocks so the drag
            geometry needed rewriting. Checking the actual Figma numbers
            (508:13822) says otherwise: a heading is drawn **24 tall with 16 of
            space either side, so in the body of the list it occupies exactly
            56 – the same as a row.** The design's rhythm and the code's uniform
            slots already agreed. A section is not a variable-height block, it is
            N+1 uniform slots, and the existing integer arithmetic still holds.
            **LESSON: the estimate was made from the code's shape alone.** Five
            minutes reading the design's numbers would have shown the geometry
            was never the problem – and deferring on a cost that was not real is
            a decision made on a wrong premise, even though deferring to get the
            DESIGN answer was right.
            - [x] **The arithmetic is its own module, and it is TESTED BY BEING
                  RUN.** `src/lib/reorder.ts` has zero runtime imports so
                  `scripts/check-reorder.mjs` transpiles and imports the REAL
                  functions – the recipe-import trick from 2026-08-04, and the
                  answer to the reconciler lesson that a mirror written from the
                  same wrong model agrees with the bug. 24 checks pass.
                  **The load-bearing check is not about sections at all:**
                  *"single-row moves match the old splice exactly, every
                  from/to"*, brute-forced over every combination. THREE screens
                  share this sheet – ingredients, instructions and shopping
                  categories – and the last two have no sections, so the real
                  risk in this change was regressing them. Also proved: every
                  legal section move leaves each section owning exactly the rows
                  it started with, a section can be dropped above loose leading
                  rows, and an empty section (allowed, decision 3) moves alone.
            - [x] **One rule, one place.** The "did this actually move anything"
                  test lives only in `reorder.ts`; the gesture calls back to the
                  JS thread rather than carrying its own copy. Deliberate – one
                  shape rebuilt by hand in two places is exactly how the
                  isSection bug survived three device builds on 2026-08-06.
            - [x] **WALKED AND PASSED ON DEVICE 2026-08-07.** A heading carries
                  its ingredients; a section dropped inside another section
                  snaps out ("works perfectly"); a single ingredient still moves
                  into another section; and the two sectionless lists –
                  instructions and shopping categories – behave exactly as
                  before, which was the real risk in the change.
            - [x] **⚠️ THE WALK FOUND A FLICKER ON DROP THAT WAS THREE MONTHS
                  OLD** (Thomas: *"a weird jumping animation when you let go"*,
                  reported on BOTH a section and a single row – which is the
                  clue that it was not about sections).
                  **PRE-EXISTING, proved by `git show 0a7a659^` rather than
                  assumed:** the idle branch of the animated style returned
                  `withTiming(0, 140)`, so the moment a drag ended the row you
                  had just dropped ANIMATED back towards its old position over
                  140ms while its slot jumped to the new one in the same
                  instant. Two movements at once. A single row doing it survived
                  three months and several device walks; a whole section doing it
                  was impossible to miss. **The group feature did not cause this
                  bug, it made it visible** – worth remembering as an argument
                  for building the thing that exercises a path harder.
                  **IT TOOK THREE GOES, AND THE FIRST TWO WERE THE WRONG KIND OF
                  FIX.** Removing the 140ms animation helped and left a
                  one-frame flicker; re-ordering the resets by hand did not fix
                  that. Both were attempts to win a RACE by guessing, and a race
                  won by guessing is one that comes back.
                  **THE REAL CAUSE: a row's position comes from TWO sources** –
                  React layout picks its slot (`top`), the shared values pick its
                  offset (`translateY`). On a drop both change, and nothing makes
                  them land in the same frame. Clear the offset early and it
                  paints at the old slot; clear it late and it paints at the new
                  slot still offset.
                  **THE FIX: `useLayoutEffect`, keyed on the ORDER**, which is
                  the one place React guarantees to run after the commit that
                  changed the order and before it is painted – so the new slot
                  and the cleared offset are painted together BY CONSTRUCTION
                  rather than by timing. It also degrades well: a slow parent now
                  leaves the block where it was dropped (where it belongs)
                  instead of flickering elsewhere.
                  The no-move drop is the one path it cannot cover, since nothing
                  reorders and no effect fires, so that path cleans up after
                  itself – walked separately and passes.
                  LESSON: when a visual bug survives two timing fixes, stop
                  adjusting the timing. Ask what two things are disagreeing, and
                  make one of them wait for the other by construction.
            - [x] **Cosmetic – MOVED to Code debts 2026-08-11**, so it is
                  recorded as a known deviation rather than an open task. The
                  design gives the FIRST heading no space above it, so a real
                  list is 16px shorter at the top than uniform slots draw.
            - [x] **Improvisation ACCEPTED by Thomas 2026-08-11** – *"I'm happy
                  with it."* The whole dragged section shows the lifted look
                  (the pale background a dragged row already had), rather than
                  only the heading under the finger. No frame draws a section
                  mid-drag; this was the minimal consistent extension of an
                  existing treatment, offered as Claude's call and now signed
                  off as design.
      - **Sections are REORDERABLE** – the Figma header carries a drag_handle,
            and there is one "Add ingredient" button at the end of the list
            rather than one per section.
      - [x] **Wording settled and corrected in Figma 2026-08-04.** The sheet
            **title follows the tab** – "Add ingredient" / "Add section"
            (`496:5765`), rather than one neutral title for both. And
            **placeholders all carry "e.g."**: "e.g. Cherry tomatoes" beside
            the existing "e.g. 250g".
            The Section field's placeholder is **"e.g. Sauce"** (Thomas, drawn
            in Figma the same day). Claude proposed "e.g. Dough" from the
            ingredient field and Thomas rejected it, rightly: it only makes
            sense to someone who bakes, and it repeated the word the filled
            frame already used, so the example taught nothing. "Sauce" is a part
            of the dish in almost any cuisine. **The rule for any future
            placeholder here: one concrete example, universal rather than
            domain-locked, and never the same word the filled state shows.**

- [x] **Build 14 shipped to TestFlight, VALID (2026-08-03).** Carries the
      leftover move and the two checkbox fixes; cut from the code as it stood
      at 15:39, so the "1 liter / 2 liters" app-side work committed after that
      is NOT in it. **The App Store review is untouched** – v1.0 stays bound to
      build 12.
      **I CALLED THIS WRONG AND IT IS THE LESSON OF THE DAY.** Three submits
      each sat on "Submitting" and were killed by the watchdog at 600s. I
      queried App Store Connect after the third, saw build 13 as newest, and
      concluded "Apple has never received 14" – and wrote it here. Thomas then
      found version 14 on his phone. A re-query showed build 14 VALID, uploaded
      17:06 CEST: one of the "stalled" submits HAD succeeded, the CLI hung
      after the upload rather than during it, and Apple was still processing
      when I looked.
      SO THE OLD RULE NEEDED SHARPENING. "Trust App Store Connect, not the
      CLI spinner" (2026-07-25) is right but incomplete: **ASC's answer is
      also a point in time.** A build missing right after a stall means "not
      processed YET", never "never arrived". The upload lands minutes before
      Apple lists it, so one negative check proves nothing – poll for 10-15
      minutes before concluding anything, and never write a conclusion into
      the backlog off a single query.
      The watchdog is still worth keeping (it stops a genuine 90-minute hang),
      but its message should say "check ASC in a few minutes" rather than
      implying failure. Retrying stays free either way – Apple ignores a
      duplicate upload of a build number it already has.
      Submission ids, if the server-side logs are ever worth reading:
      `031c4a16-7106-4a72-b190-a4379a3daeb0`,
      `59ac675d-75ec-425b-8b8f-be95d71d4908`,
      `8676ad2c-9c50-4481-925d-222237a502c8`.

- [x] **DONE – move a past week's unbought shopping items to this week**
      Why: things you did not get round to buying should not be stranded on a
           week that has ended.
      Closed: 2026-08-11. Shipped to the family in TestFlight build 15
           (2026-08-04), and the one thing holding it open – the inherited
           frozen-week bug – was fixed the same day and walked on device
           2026-08-07.
      ⚠️ It stayed open for a week for no reason. Known bug 3's entry says in
           its own words that it closes this item; nobody carried that back
           here. The mirror of the stale-fix lesson under Known bugs – **a fix
           that names what it closes has to go and close it.**

      Thomas 2026-08-03; Figma 434:7148 "transfer items from last week". Built
      the same day it was designed. A past week whose list still has unchecked
      items ends in a full-width **"Move all items to this week"**; pressing it
      empties that week onto the current one and offers the undo toast.
      Graduated out of Ideas – the decisions that shaped it are in the log below.
      - [x] **APPLIED 2026-08-03** (`0026_move_week_leftovers.sql`), verifying
            select returned move_fn and undo_fn both true.
            **SAFE FOR THE PHONES** (the 0022 lesson): it only ADDS two
            functions – nothing dropped, no signature changed – so TestFlight
            build 13 is unaffected by it. Note the asymmetry, the usual one:
            the server half is live for everybody now, but nothing can reach
            it until the app half ships in a build, so no phone behaves
            differently yet.
      - [x] **VERIFIED ON DEVICE 2026-08-03** – "it worked perfectly"
            (Thomas, on the dev build installed 14:53). Still only on the dev
            build: SHIPPED to the family in TestFlight build 15 (2026-08-04).
      - [x] **The pressed state is the DS's, not an improvisation** (checked
            2026-08-03 after Thomas pushed back on it being flagged at all,
            and he was right). `button/solid/fill/*` defines
            enabled #83E651 / pressed #56C91D with the label unchanged at
            #4F4230, and that is exactly what is built. The screen's frames
            not drawing a pressed state is normal – states live on the DS
            component, not on every frame that uses it. LESSON: before
            flagging a component state as a design gap, look it up in
            `ds-theme.cjs` and the DS component; a gap is a state nothing
            defines anywhere, not a state this particular frame did not draw.
      - [x] **PINNED above the tab bar** (Thomas, 2026-08-03), resolving the
            one gap the frames left. They only show short weeks, where the
            button sits at the bottom of the list area either way – but a week
            with twenty leftovers would have hidden it below the fold, the
            same trap the recipe Save button fell into on a long recipe
            (2026-07-28). So it reuses that footer exactly: top border in
            `border/subtle`, the screen's own background so rows scroll under
            rather than through, and the scroll area drops its tab-bar
            clearance while the footer is there. Note the footer chrome itself
            is still undrawn in Figma on both screens – worth a frame if a
            third one ever needs it.
      - [x] **It inherited known bug 3** (frozen "this week") – **fixed
            2026-08-04 with bug 3 itself, walked on device 2026-08-07.** The
            move used to target the current week as computed at app launch, so
            an app left open across Sunday midnight would push into what was by
            then last week. It now reads the live week from the shared clock.
            (The worst case was always a move that did nothing rather than a
            wrong one – the server refuses to move backwards.)

- [x] **Shopping checkbox sat between the two lines of a row** – found by
      Thomas on device 2026-08-03, fixed the same day. The checkbox and the
      text column were centred against each other, so on every row WITH an
      amount the box landed in the gap between name and amount; single-line
      rows looked right, which is why it survived. The design's `checkboxField`
      is `items-start` – box against the name, amount hanging below. The two
      lines also lacked their designed leadings (label 24, hint 16), so the
      name's line box was not 24 tall for the 24-tall checkbox slot to centre
      on, and rows missed the designed 56/72 heights.
      SHIPPED to the family in TestFlight build 15 (2026-08-04).
      - [x] **Checkbox now binds the forms/* recipe** (Thomas asked for it the
            same day): `forms/background/default` + `forms/border/enabled`
            unchecked, `forms/surface/active` checked – the same group the
            shared text input already uses. Only the unchecked box changes on
            screen; the checked fill is the same #56C91D either way, but the
            right token name is what survives the next DS retune.
      - [x] **NOT A BUG: the square checkbox is the DEFAULT brand.** I read
            the Figma output as specifying radius 0 (it emits a radius for the
            initials badge beside it and none for the checkbox) and flagged
            the app's `radius/xsmall` as a drift. Thomas, same day: "The
            square check box is the default brand, not the Prep+Eat brand."
            The rounded box was right; nothing changed.
            LESSON, the 2026-07-22 one again in a new coat: geometry resolves
            per brand just like colour and type, so the ABSENCE of a property
            in `get_design_context` is as brand-dependent as its value. A
            missing radius is not evidence of radius 0. `ds-theme.cjs` decides.

### Decisions log (recent)

- **2026-08-07 – NOTHING TO REORDER MEANS NO DRAG HANDLE, and the app was
  drawing one anyway.** Walked and confirmed the same day.
  **HOW IT WAS FOUND, which is the part worth keeping.** Chasing an unrelated
  problem (Claude could not point Thomas at a node in Figma), Claude painted a
  hidden `drag_handle` purple purely to prove the deep-link mechanism worked.
  Seeing it, Thomas remembered why he had hidden it: *"there is only one
  category, so it does not make any sense to order it differently."*
  **SO THE FIGMA FRAME WAS MORE CORRECT THAN THE CODE, and neither review
  direction could have caught it.** A hidden layer is invisible in the app by
  definition, and nobody reads a frame looking for things that are not there. It
  surfaced only because of a detour that had nothing to do with it.
  **LESSON: a hidden layer in a frame is usually a RULE, not a leftover.** Claude
  had called this one debris and suggested deleting it.
  Fixed in three places, and the rule was already half-applied:
  - **Shopping** – a lone category gets no handle. Reordering only ever moves the
    TITLED groups (the uncategorised group is pinned to the top), so one titled
    group means nothing can move, whether or not loose items sit above it.
  - **`CategoryGroup`** – draws no handle at all when there is no reorder
    callback and no gesture, rather than a dead one.
  - **The recipe EDIT screen's per-section handle** – the one place not gated.
    The "Ingredients" and "Instructions" handles above it already were
    (`length > 1`), and so was the detail screen. Now all four agree.

- **2026-08-07 – THE SHOPPING LIST'S HEADINGS NOW MATCH A RECIPE'S INGREDIENT
  SECTIONS.** Thomas: *"the category style on shopping should match the style of
  recipe sections"*, then *"the done section should match too"*. So all three
  headings across the two list screens are one treatment - `font-header
  text-display-6 font-emphasized leading-xsmall text-text-default` - token for
  token, which is what makes a DS retune move them together instead of leaving
  one behind. They were only ever different because sections arrived three weeks
  after the shopping list.
  - **⚠️ THE CHEVRON WAS AN SF SYMBOL, AND THE FRAME HAD ALWAYS SAID MATERIAL.**
    Thomas spotted it OPTICALLY before either of us checked the design: *"is the
    chevron a SF Symbol? Because it optically looks off."* It was - `SymbolView`
    - sitting beside a Material drag handle in a matching 24 box, and the two
    families draw to different weights. The Figma frame names the icon
    **`expand_less`**, a Material name (35:8048), so this was drift, not a design
    gap.
    **THE APP MIXES BOTH FAMILIES: 8 files on SF Symbols, 32 on Material**, and
    chevrons appear in BOTH - Material on the week picker, SF in the done band,
    edit-item picker, step sheet and collapsible. Only the done band put them
    side by side, which is why the seam showed there first. **Worth a
    foundations-level decision** rather than fixing them one at a time.
  - **ICON BOXES FOLLOW THE LINE-HEIGHT OF THE TEXT BESIDE THEM** (Thomas: *"if
    line-height of done header is 24px the icons bounding box should also be
    24px"*). Verified against the DS rather than assumed - `leading-xsmall` is
    exactly 24px in `ds-theme.cjs`. A rule worth applying to the next
    icon-beside-heading rather than guessing a size each time.
  - **The spacing came from the frame, not from taste** (35:8045, which Thomas
    reworked the same day): 16 padding all round the done band, 16 between its
    header and the items, 16 before the Clear button. The band's own bottom
    padding is still the 1000px bleed override, which is not a spacing choice.
  - **⚠️ THE SHADE WENT THE OTHER WAY, and that is worth knowing before someone
    "corrects" it.** The frame called for `surface/neutral/light`; implemented,
    Thomas compared it on the device and preferred the app's existing
    `lighter` - *"lighter is better (i have changed it in figma)"*. So the FRAME
    followed the APP here, which is the opposite of the usual direction.
  - **The frame's 8px category gap is STALE, not a disagreement.** It still shows
    header y=0 h=24, content y=32. That predates the heading growing from 16px
    text to 24px on the same day. The rhythm is **gap small - category header -
    gap small**, 16 either side, matching the recipe sections and the done band.
  - **Two stale claims found in code comments in one day**, after the reorder
    sheet's "reachable weeks mirror the plan's rule": this file said the
    `button/danger` tokens were absent from the DS bridge so the Clear button
    mapped to the error scale. They are present - the sheet delete button uses
    them. Same colour today (#DE2D12); the right token name is what survives the
    next retune. **A comment asserting what the DS does or does not carry is a
    claim with a shelf life.**
  - **⚠️ AND THE 2026-08-06 "FIGMA LAGS THE DS" RULE TURNS OUT TO BE TOO BROAD -
    CLAUDE.md CORRECTED.** The `get_design_context` payload was stale again
    (`Noto Serif`, `#e3ddcf`), so the token names were taken and the numbers
    ignored, as the rule said. But reading the SAME nodes with
    **`get_variable_defs` returned entirely correct values** - all seven colours
    matching `ds-theme.cjs` exactly, and Montserrat for the header font.
    So the published library is NOT lagging. Only that one output's CSS
    fallbacks are stale, and always were.
    **Thomas set the hierarchy straight (2026-08-07):** *"Figma should be correct
    as it is the source of truth for the DS. But I can still make mistakes in the
    design phase, but DS components should be right."* So: **DS components and
    variables in Figma are authoritative; screen frames are design work and can
    contain mistakes.** When a frame disagrees with a component, the component
    wins and the frame is worth querying rather than copying.
    **AND THE COMPARISON STILL HAPPENS** (Thomas, correcting a first draft of
    this entry that read as if Figma and `ds-theme.cjs` were interchangeable):
    *"you should still compare Figma to DS code."* They are not interchangeable -
    the bridge is a GENERATED COPY produced by `npm run sync-ds-tokens`, so it
    goes stale the moment the DS is republished and nobody re-syncs. **A
    disagreement is the signal that the sync was missed**, not a choice between
    two values. That comparison is exactly what was run here (all seven matched);
    the first write-up just described it as optional.
    WHY IT MATTERS: the old wording made every number Figma produced suspect,
    which is expensive. Reading Figma is now cheap and reliable - and checking it
    against the bridge is what catches a missed sync.
  - [x] **A RECONCILIATION PASS AFTER A FIGMA ROUND IS WORTH DOING, and this is
    the evidence.** Thomas: *"will you check Figma for the last shopping
    upgrades. I've done some of them, but not sure I got them all."* Four of five
    were already in sync (category headings, band shade, band spacing, chevron).
    The fifth was the **Clear button's corner radius**: the component uses
    `radius/medium` (12) and the app had `rounded-small` (8) - read straight off
    74:5764 with `get_variable_defs`. Not a thing either of us would have caught
    by eye. Cheap to repeat now the right call is known.
  - [x] **THE DRAG HANDLE'S TOKEN – FIXED IN BOTH FIGMA AND CODE 2026-08-07, and
    the reason it was wrong is the interesting part.** The frame bound it to
    `color/surface/secondary/main`; the app used `text.accent`. Both #6F5D44, so
    nothing looked wrong.
    **⚠️ WHY THOMAS HAD USED A SURFACE TOKEN ON AN ICON, in his words:** *"I
    scoped the text-tokens only to be visible to text. But you work in the code
    so you don't get 'scoped out' of applying a color-token."* Verified exactly:
    `text/accent` is scoped `[TEXT_FILL]` so it cannot be picked for a vector
    fill, while **`color/surface/secondary/main` is `ALL_SCOPES`** and therefore
    shows up in every picker. **His scoping worked; one unscoped token undermined
    it** and was the only plausible-looking thing on offer.
    **AND THE DS ALREADY HAD THE RIGHT ANSWER: `icon/subtle`** - same #6F5D44,
    scoped `[SHAPE_FILL, TEXT_FILL]`, sitting beside `icon/default` and
    `icon/brand` and already in use elsewhere in the file. So neither
    `surface/secondary/main` nor `text/accent` was right; the icon family was.
    Thomas's call once the scoping was understood: *"use icon/subtle everywhere,
    both figma and code."*
    DONE: **113 drag handles rebound in Figma** across Recipes, shopping and
    sketches (verified by re-reading every one), and **8 code sites across 4
    files** moved from `ds.colors.text.accent` to `ds.colors.icon.subtle`. No
    visible change - identical colour.
    **THE LESSON, and it is a general one: code has no scope guard, so a token
    has to be chosen by MEANING, not by matching a hex.** Figma physically
    stopped Thomas reaching a text token for a vector. Nothing stops Claude - the
    path is just typed. Which means when the two disagree about a token, the
    scoping is evidence about intent, not an obstacle to route around. The first
    fix here rebound 109 nodes to `text/accent` via the API, which is precisely
    routing around it.
    - [ ] **Worth doing in the DS: tighten `color/surface/secondary/main` off
      `ALL_SCOPES`.** It is what put a surface token in front of a designer
      colouring an icon, and it will do the same for any property until it is
      scoped. Thomas's repo, not this one.
  - [ ] **Figma has not caught up with the CATEGORY headings** - the frame still
    draws them at 16px text with an 8px gap. Thomas changed the done section;
    the categories were changed verbally. Worth updating the frame before this is
    treated as settled.

- **2026-08-07 – EDITING A RECIPE ROW: tap the row, delete inside the sheet.
  Two rejected attempts recorded, because both are the obvious thing to reach
  for.** Thomas: *"when recipe is in edit mode you have to tap the three dots to
  edit. you should be able to tap the whole row. And maybe the three dots should
  become a delete icon. I have not designed this, but it is ok for you to give
  it a go."* – an explicit, one-off waiver of the no-improvised-UI rule.
  **WHAT LANDED:** the whole row opens the editor (matching the section heading
  on the same screen, which already worked that way – the real complaint was that
  headings were one tap and rows were two), and deleting lives in the edit sheet
  beside Done. Instructions got the same treatment; leaving them on the old
  two-step interaction would have made the screen inconsistent with itself.
  - **REJECTED 1 – a delete icon on the row** (Claude built it, Thomas tried it:
    *"you did exactly as described, so thank you. but I'm not happy with it"*).
    His replacement is better and cheaper: the sheet ALREADY had a red delete
    button, drawn to his own 2026-08-06 spec and gated to sections only. So the
    fix was ungating something that existed rather than drawing something new,
    and it makes ingredients and sections behave identically instead of each
    having a private way to be removed. It also restores two deliberate steps
    before a destructive act, which the row icon had reduced to one.
    LESSON: before drawing a new control, check whether the app already draws
    one for that job somewhere it is currently hidden.
  - **REJECTED 2 – pinning Done and Delete in the sheet's `footer`** (Claude,
    reasoning that always-visible beats reachable-by-scrolling; Thomas on the
    device: *"this is worse. there is no room to move for your finger to scroll
    the screen"*). He is right, and the arithmetic explains it: two pinned
    full-width buttons cost ~120px of a strip the keyboard has already halved,
    leaving a scroll area one field tall – too small to get a thumb into. The
    quantity field went from ONE SCROLL AWAY to effectively unreachable while
    being technically visible.
    **This is written into the code beside the `scroll` prop**, because a future
    reader looking at a Done button that scrolls out of view will reach for
    `footer` immediately. It is the obvious-looking fix that makes it worse.
  - **The keyboard no longer opens on EDIT, only on ADD** (Thomas, same session:
    *"when editing, we don't know if the user wants to edit the name, quantity or
    delete the item. so let's not open with name input active"*). Adding has one
    sensible next action; editing has at least three, so auto-focusing guesses
    wrong most of the time AND buries the other options. It is also what makes
    the whole sheet visible on open, which turned out to matter more than any
    amount of height tuning.
  - **The sheet reaches 96% rather than 90%** (Thomas marked the unused strip on
    a screenshot: *"is there more room for the sheet"* – it was almost exactly
    the tenth the default ceiling reserves). NOT an invented number: the shopping
    list's edit-item sheet already ships `minHeightPercent 0` + `maxHeightPercent
    96`, so the app now has one answer to "hug short content, grow nearly
    full-screen when long". The remaining 4% keeps the title clear of the notch.
  - **Still improvised, and still flagged:** no frame draws any of this. The
    delete button was blessed verbally for sections on 2026-08-06 and is now the
    delete for every row; the tappable row copies the heading's existing layout.
    Worth frames if any of it is to be treated as settled.

- **2026-08-07 – SHOPPING DELIBERATELY DOES NOT CREATE WEEKS. Decided by
  Thomas; do not re-litigate.** Found on device the same day: *"you can not
  scroll the weeks in shopping before you have done so in plan. I think Plan is
  creating the weeks"* – exactly right. Plan's "›" past the last week CREATES a
  clean next week (`getOrCreatePlan`,
  [meal-plan.tsx:670](../src/lib/meal-plan.tsx), behaviour from 2026-07-17);
  Shopping's arrows only move between weeks that already exist, so a household
  that has never planned has one reachable week and two disabled arrows.
  **THE QUESTION THOMAS ASKED IS THE ONE THAT SETTLED IT** – *"is there a user
  story where you will create a new week without creating a new plan?"* Going
  looking for one is what killed the idea. The only real candidate is a
  NON-RECIPE item for a future week ("we're out of dishwasher tablets", and the
  list does take manually typed items) – **and that is already served**: add it
  to THIS week's list, which always exists, leave it unticked, and next week's
  "Move all items to this week" carries it forward, which is exactly what the
  leftover move (0026) was built for. Every other candidate collapses: a party
  in a future week means planning meals for it, which creates the week anyway;
  looking ahead at someone else's plan shows nothing if they have not planned.
  **And the data model agrees** – ingredients are snapshotted from the plan onto
  the list, so the list is downstream by design. A week nobody has planned has
  nothing to shop for, and creating list rows for it is empty scaffolding.
  **What is left is a first-run oddity, not a missing capability**, and a small
  one. **CONFIRMED BY THOMAS THE SAME DAY, and it is what closes the item:**
  *"arrows looked disabled as designed"*. So there is no UI defect here – the
  control correctly says it cannot go anywhere, and the surprise was conceptual
  (why does the identical control on the next tab behave differently?). A live
  button that did nothing would have been the 2026-08-03 retry-button bug again
  and would have needed fixing today; a correctly disabled one needs nothing.
  The whole thing self-resolves the moment anyone plans anything – which is the
  first thing anyone does.
  NOT A REGRESSION – `git log -S` puts it in `e1cc357`, 2026-07-18, three weeks
  before the clock work.
  **LESSON, and it is why this survived review for three weeks:** a code comment
  claimed *"Reachable weeks mirror the plan's rule"*. They do not, and nobody
  diffed the claim against what `meal-plan.tsx` actually does. A comment
  asserting that two pieces of code agree is a CLAIM, not documentation, and
  claims rot silently. Corrected in place 2026-08-07.

- **⚠️ 2026-08-06 – `get_design_context` output embeds STALE token values, and
  I read them out loud three times before Thomas caught it.** *"You keep saying
  you are using noto serif bold, but that's not the correct font. I think you
  keep reading the wrong tokens."* He was right, and the rule already existed
  (CLAUDE.md: published Figma library values lag the DS repo) – what was
  missing was noticing WHERE the stale value hides.
  **The trap:** the MCP returns CSS custom properties with a fallback baked in –
  `var(--typography/font-family/header, 'Noto_Serif:Bold')`. The NAME before the
  comma is authoritative. The VALUE after it is Figma's published library, which
  lags. It reads like a spec and is not one.
  **What was actually wrong on 2026-08-06**, Figma fallback → real DS value in
  `src/constants/ds-theme.cjs`:
  | token | Figma said | DS says |
  |---|---|---|
  | `font-family/header` | Noto Serif | **Montserrat** |
  | `font-family/paragraph` | Noto Sans | **IBM Plex Sans** |
  | `text/default` | `#0a0f0b` | **`#4F4230`** |
  | `text/subtle` | `#476b4a` | **`#5F503A`** |
  Independent corroboration that took ten seconds and should have been the first
  move: `package.json` installs `@expo-google-fonts/montserrat` and
  `@expo-google-fonts/ibm-plex-sans`, and no Noto anything.
  **Also found: `color/text/primary` does not exist in the DS at all.** The text
  group is default/subtle/disabled/link/brand/accent/inverse/danger/success/
  warning/info. Figma's frames name a token the token set does not have, so a
  literal translation would invent a colour. Nearest real token is
  `text/default`, which is what the existing headers already use.
  **THE RULE, sharpened: take the token NAME from Figma and the VALUE from
  `ds-theme.cjs`. Never quote a value that came out of the Figma payload** – not
  in code, not in conversation, because saying it aloud is how it gets believed.
  If a name has no match in `ds-theme.cjs`, that is a finding to raise, not a
  gap to fill.

- **2026-08-04 – DONE: a second, free Supabase project as the DEV environment.**
  Thomas decided to do it now rather than at the trigger. Until today every dev
  run read and wrote the household's REAL data – a test recipe invented at 11pm
  appeared on his wife's phone.
  **The shape, which turned out cleaner than expected because the app already
  had half of it:**
  | | database | how it is built |
  |---|---|---|
  | **Prep+Eat (dev)**, `app.prepeat.dev` | DEV | `./scripts/build-iphone.sh`, and `npm start` |
  | **Prep+Eat**, `app.prepeat` | PRODUCTION | TestFlight / App Store, via EAS |
  `APP_VARIANT=dev` already gave the direct-to-device build its own bundle id,
  name and icon, so the two install **side by side** on the phone. Nothing had
  to be built for that.
  **`.env` on the Mac points at DEV; EAS on Expo's servers points at
  PRODUCTION** – verified with `eas env:list`, not assumed. `.env` keeps the
  production pair as commented lines directly beneath, so switching back is a
  two-line edit rather than a hunt through the dashboard.
  **Setup facts worth keeping:**
  - Project `rulasawjdtymovobrovv`, **in a separate Free organisation
    ("Sebell Dev")** – a Pro org bills every project in it, so this is what
    keeps dev free forever.
  - **Postgres 17.6, North EU (Stockholm)** – deliberately identical to
    production, since a test bed on a different engine or region proves less.
  - Migrations applied with `supabase db push --db-url`, which needs no
    `supabase login` and records the migration ledger properly. All 30 applied
    clean, and dev came out an exact structural twin: 15 tables, 25 functions,
    19 policies, both roles granted on all 15 tables.
  - **GitHub integration deliberately NOT connected.** It auto-applies
    migrations on push, which is the opposite of the point – the value of a dev
    environment is that applying a migration is a deliberate act you can test
    before repeating it on production.
  - **Sign-in on dev needed FOUR things nobody had written down**, and getting
    there took an hour of blind debugging. Full checklist now in
    [backups-and-local-db.md](backups-and-local-db.md) → "Creating a Supabase
    project for this app". In the order they bit:
    1. **The built-in sender is not enough.** It reaches only project members
       AND locks template editing, so custom SMTP is a prerequisite, not an
       upgrade. Resend, same account as production, key scoped to
       `prepeat.app`, sender `dev@prepeat.app` so a dev code is never mistaken
       for a real one.
    2. **Stock templates send a LINK, not a code.** `{{ .Token }}` is the whole
       trick. BOTH **Confirm signup** (an address the project has never seen)
       and **Magic Link** (every time after) need it – fixing only one leaves a
       failure that looks intermittent.
    3. **⚠️ Email OTP Length defaults to 8 on new projects; this app needs 6.**
       The killer, because it fails silently: `CODE_LENGTH = 6` in
       `onboarding-flow.tsx` truncates the input, so the app submits the first
       6 digits of an 8-digit code and Supabase correctly says "invalid". The
       app, the template and the typing all look fine.
    4. Email confirmation left ON, matching production. (Turning it off was
       floated as a fix and withdrawn – it was working around a symptom of #3.)

- **⚠️ 2026-08-04 – a pattern, now twice: the app depends on Supabase settings
  the repo does not carry.** Worth naming, because both instances were found by
  accident within an hour of each other while building the dev project.
  1. **Table grants** come from "Automatically expose new tables", not from any
     SQL here (see the entry below).
  2. **OTP length** must be 6; new projects default to 8.
  Neither is in a migration, so **a database rebuilt from this repo alone is
  subtly broken** – and both fail in ways that point somewhere else entirely.
  THE SHARPER LESSON, from #2: **the knowledge already existed.**
  `CODE_LENGTH = 6` carried a comment recording the 2026-07-07 change from 8,
  and it still cost an hour – because a comment next to the code that assumes a
  setting is not where anyone looks while creating a database. Configuration
  the app depends on belongs in the setup checklist; the comment now points at
  it rather than standing alone.
  **This is also a restore risk**, not just a dev-setup annoyance: a disaster
  recovery into a fresh project hits every one of these, on the worst day.

- **⚠️ 2026-08-04 – the migrations do NOT grant table access, and that is a
  time bomb.** Found while creating the dev project, and it nearly broke it.
  The migrations only ever `grant` on three FUNCTIONS; they never grant
  anything on a TABLE. Production's `anon`/`authenticated` grants on all 15
  tables come from the project-level **"Automatically expose new tables"**
  setting, not from any SQL in this repo.
  **So the migrations are not self-contained.** A database rebuilt from them
  alone – a restore, a new dev project, a future migration to another host –
  comes out with 15 tables the app cannot read, failing in a way production
  never does. Ticking that box on the dev project is the only reason it works.
  **AND THE SETTING IS BEING REMOVED.** `supabase/config.toml` records that
  `auto_expose_new_tables` disappears on **2026-10-30**, once always-revoked
  becomes permanent. After that date a newly created project cannot be told to
  auto-expose at all, and the repo's migrations will produce a broken database
  with no switch to flip.
  **The fix, before that date:** a migration that grants explicitly
  (`grant select, insert, update, delete on ... to authenticated`, matching
  what production has today), so the SQL carries its own permissions. Cheap
  now; discovered during a restore it would be very expensive. Verify against
  production's actual grants rather than guessing at the list.

- **2026-08-04 – what protects the database once strangers have data in it.**
  *(The runbook – commands, file locations, what is installed on the Mac, and
  the real restore procedure – is
  [backups-and-local-db.md](backups-and-local-db.md). The entries below are the
  reasoning behind it.)*
  Thomas's realisation, unprompted: a migration is live for everybody the
  moment it runs, while app code waits for a build – so a bad one has no blast
  radius limit. Right, and the right week to act on it, with v1 sitting in
  review.
  **The asymmetry is narrower than it first looks, and that shapes the answer.**
  Migration 0022 broke the Plan tab on every phone in an hour; 0023 fixed every
  phone in five minutes, with no build and no Apple. A server change that
  BREAKS something is the cheapest bug we have. What cannot be fixed forward is
  DESTROYED DATA – a bad `UPDATE`/`DELETE`, or a `DROP` that takes the contents
  with it. So the defence is aimed at irreversibility, not at instantness.
  **Facts that decided it** (checked against Supabase's own pricing and backup
  docs on the day, because I had two of them wrong from memory):
  - **Free takes NO automatic backups at all.** Not few – none. Supabase's own
    advice to free users is to export the data yourself.
  - **Pro ($25/mo) is daily backups, 7-day retention.** Worst case: lose up to
    24 hours.
  - **PITR is NOT in Pro.** It is a ~$100/mo add-on. Rejected: paying that to
    turn "lose a day" into "lose a minute" is not a trade a meal-planning app
    needs to make.
  - **Usage is nowhere near any free limit** – 31 MB of 500 MB database, 18 of
    50,000 MAU, 162 MB of 5 GB egress. So growth is not a reason to upgrade and
    will not be for a long time; **the only thing $25 buys is the safety net**,
    which makes it a clean decision rather than a bundled one.
  **THE CALL (Thomas, all three):**
  1. **Pro at public launch, not before.** Today's 18 users are family and
     testers – people he can ring. That changes the moment a stranger has three
     months of recipes in there. In the pre-launch checklist, bound to the
     Release button rather than to a date.
  2. **A nightly export in the meantime** (`scripts/backup-supabase.sh`, launchd
     at 03:15). Free, and the copy is ours rather than Supabase's. Its honest
     weakness: it only runs when the Mac is on – which is exactly why it is a
     stopgap and not the answer.
  3. **Local Supabase in Docker as the migration test bed**, over a second
     cloud project. Both are free (2 free projects, and they survive a Pro
     upgrade if kept in a separate Free organisation) – but a free cloud project
     pauses after a week idle, which is friction on the day you are in a hurry,
     and local rebuilds the whole database from 0001 in seconds. **That last
     part is the real argument**: replaying every migration onto an empty
     database catches "this does not apply cleanly", which is the exact class
     0022 belonged to. It also builds the harness the reconciler note under
     Recurring says is missing – the mirror script proves the rules are
     coherent, a real Postgres proves the SQL does what the rules say.
  Three things found while wiring it up, all worth keeping:
  - **⚠️ A launchd job cannot read anything in `~/Documents`.** The first
    scheduled run failed with `Operation not permitted` (exit 126) – macOS
    privacy protection covers Desktop/Documents/Downloads, and a background job
    has none of the permissions a Terminal inherits. **The script run by hand
    worked perfectly**, which is exactly what makes this dangerous: it would
    have looked installed and produced nothing, and nobody finds that out until
    the day they need a backup. Fixed by installing a runtime copy into
    `~/Library/Application Support/Prepeat` (`npm run backup:install`), which
    also means **editing `scripts/backup-supabase.sh` does nothing until that
    command is re-run**. The general lesson: **a scheduled job is not installed
    until it has been observed succeeding ON THE SCHEDULER** – `launchctl
    kickstart` then read the exit code. Running the script yourself proves
    nothing about the job.
  - **`pg_dump` does not back up the recipe photos.** They are files in Supabase
    Storage, not rows in Postgres – 267 of them, 54 MB. The `recipe-photos`
    bucket is public-read, so the mirror needs no credentials at all: object
    names come from `storage.objects`, each file is fetched by URL with curl.
    That removed the last dependency on the Supabase CLI, node, and the repo –
    which the TCC problem above made necessary anyway. It is a MIRROR, not a
    snapshot: unchanged files are skipped (a second run takes 9s, not 2.5min)
    and a photo deleted upstream is KEPT, deletion being the case a backup is
    for.
  - **The archives hold real user data** (email addresses, recipes), so they
    live in `~/Prepeat-backups`, outside the repo – which is PUBLIC – and
    outside iCloud. Checked on the day: `~/Documents` is a real folder, not an
    iCloud symlink, and FileVault is on.
  **Verified 2026-08-04**, not just written: a launchd run exited 0, and the
  archive holds 115 recipes, 1,624 recipe ingredients, 204 plan entries, 1,857
  shopping-list items, 8 accounts, plus 15 tables / 25 functions / 19 RLS
  policies of schema.

- **2026-08-04 – the restore rehearsal found FOUR ways the backup would not
  have restored, and the file looked perfect throughout.** This is the entry to
  re-read if the value of `npm run backup:verify` is ever questioned. Every
  failure was invisible from the archive: right size, right row counts, written
  nightly, and it would have failed on the day it was needed.
  1. **`CREATE SCHEMA "public"` collides with every fresh database.** The dump
     opens with it; any new Postgres – including a brand-new Supabase project –
     already has one. Died on line 26. Fixed in the RESTORE (`drop schema
     public cascade` first) rather than by adding `--clean` to pg_dump: that
     would put DROP statements at the top of a file written nightly and kept
     for 30 days. The destructive step belongs where it is a conscious act.
  2. **The target has to be Supabase-shaped, not an empty database.** The dump
     refers to `auth` – RLS policies call `auth.uid()`, and public tables carry
     foreign keys into `auth.users`. Restoring into a plain scratch database
     died on line 9236. **And therefore ORDER MATTERS**: accounts first, app
     data second, or the foreign keys have nothing to point at. That ordering
     was not written down anywhere before this.
  3. **`auth.schema_migrations` / `storage.migrations` cannot be restored** –
     "permission denied". They are GoTrue's and Storage's own ledgers, owned by
     those services and recreated by them.
  4. **`storage.buckets_vectors` – the same thing again**, which is the real
     lesson: excluding service tables one by one is a denylist, and it would
     have broken silently the next time Supabase added an internal table. The
     dump now takes an **allowlist of exactly four tables** (`auth.users`,
     `auth.identities`, `storage.buckets`, `storage.objects`). Deliberately not
     kept: sessions, refresh tokens, MFA claims, one-time tokens, audit logs.
     People sign in again after a restore – which they must anyway, since a
     rebuilt project has a new JWT secret that old tokens cannot match.
  **THE RESTORE PROCEDURE, now that it is known** (`scripts/verify-backup-restore.sh`
  runs exactly this against local, so it stays true):
  `drop schema public cascade` → `truncate storage.objects, storage.buckets
  cascade` → `delete from auth.users cascade` → restore `auth-storage-data.sql`
  → restore `public.sql`.
  **PASSES as of 2026-08-04**: 7,246 rows across 15 tables restored exactly,
  8 accounts, 267 storage rows, 15 tables / 25 functions / 19 policies.
  **All 30 migrations also replay cleanly onto an empty database** – the 0022
  class of failure, tested for the first time and passing.
  THE GENERAL RULE: **an untested backup is a hypothesis.** Re-run
  `npm run backup:verify` after any change to the schema, the dump, or the
  Supabase plan.

- **2026-08-04 (later the same day) – cut it back, after Thomas said it had
  become "too patched together".** His words: *"I need my mac awake in the
  middle of the night. The back up is on my mac locally, seems unsafe. It feels
  like a lot of ifs and uncertainty."* All three correct, and the drift is worth
  naming: he asked whether he could monitor instead of paying $25/mo, I said
  yes, and then built a scheduled job, a workaround for macOS blocking it, an
  installer so the copy could not drift, an alarm to watch the job, and a
  rehearsal to prove the alarm's subject worked. **Each step was a sound answer
  to the previous step's weakness; the sum was machinery with more failure modes
  than the thing it replaced.** He declined Pro, so the fix had to be removal,
  not purchase.
  **What changed:**
  1. **No fixed hour.** At login, then every 6h while the Mac is on, and it does
     nothing unless the newest backup is over 12h old. A laptop is not a server.
     A week with the lid shut now self-heals at the next login instead of
     producing a week of misses.
  2. **One job, not two.** The freshness alarm was a second script and a second
     job watching the first; it is now a branch inside the backup script.
     `check-backup-freshness.sh` deleted. **Accepted cost:** if the job itself is
     removed, nothing notices. Fewer parts was worth more than that watchdog.
  3. **A failure only warns if it matters** – judged against the age of the last
     GOOD backup, so a flaky moment on the wifi retries at the next tick instead
     of raising a dialog.
  **iCloud Drive was tried for the off-site copy, and REJECTED.** A launchd job
  gets partial, unreliable access: it wrote the database archive, was refused on
  all 267 photos ("Operation not permitted"), and could not read the folder it
  had just written, so it re-fetched everything every run. Before that it
  refused to start at all (EX_CONFIG, exit 78) because launchd cannot even open
  a LOG file inside iCloud – so the log now lives in `~/Library/Logs`.
  **THIS IS THE SECOND TIME THE SAME LESSON ARRIVED** (the first was
  `~/Documents`): the manual run worked perfectly both times. **A scheduled job
  is not installed until it has been watched succeeding ON THE SCHEDULER.**
  So there is still no copy off the Mac. The honest options are Time Machine
  (no destination configured today) or Pro – written up in
  [backups-and-local-db.md](backups-and-local-db.md), not papered over.

- **2026-08-04 – a staleness alarm, because the danger is not the missing
  backup but the believed-in one.** *(SUPERSEDED the same day – merged into the
  backup script, see the entry above. Kept for the reasoning, which still
  holds.)* Thomas's call, in the same breath as
  deciding to monitor Pro rather than buy it: the risk that actually kills you
  is trusting a backup that quietly stopped in March, and that risk is
  identical whether or not Supabase is being paid. So it got built first.
  `scripts/check-backup-freshness.sh` warns with a dialog when the newest
  archive is more than 3 days old, when there is no archive at all, or when the
  last run logged FAILED.
  **`RunAtLoad` is the whole point** – it fires at login, so a fortnight away
  with the Mac shut is caught the moment Thomas comes back. A 10:00 daily run
  covers a Mac that just stays logged in. Three days of tolerance means a
  weekend away does not nag.
  Two things deliberately built in: the dialog carries a **"Back up now"**
  button that runs the backup, so noticing and fixing are one action; and it
  has `giving up after 300`, because a dialog nobody dismisses would otherwise
  keep a launchd job alive forever. The script also runs WITHOUT `set -e` – an
  alarm that dies silently on an unexpected error is worse than no alarm.
  Both paths tested on 2026-08-04: fresh backups log OK and exit 0 silently;
  forcing the threshold negative produced the dialog and the STALE log line.

- **2026-08-03 – Semantic Versioning, with the digits defined in app terms.**
  Thomas, after going back and forth on whether the next release was 1.0.1 or
  1.1: the value of the rule is that it decides instead of him. Semver was
  written for libraries, where MAJOR means "I broke your callers" – an app has
  none, so the digits are spelled out in
  [release-notes.md](release-notes.md): PATCH = fixes and polish only, MINOR =
  a new capability worth a sentence in the App Store notes, MAJOR = a release
  existing users have to re-learn. By that rule the next release is 1.1.0,
  because the leftover move is a feature.
  Two things it deliberately does NOT number: the EAS build counter (12, 13, …
  auto-increments, and many builds sit under one version – build 12 and 13 are
  both 1.0.0), and migrations, which are live for every version at once the
  moment they run.
  `app.json` `expo.version` is bumped when preparing a submission, not when
  work lands – v1.0.0 is in review and stays untouched.

- **2026-08-03 – moving a past week's leftovers onto this week.** Thomas's
  idea in the morning, designed and built the same day (Figma 434:7148).
  Product shape, all his calls:
  - **Unchecked items only.** A ticked item was bought; it belongs to the
    week it was bought in.
  - **Manual, never automatic.** Rolling leftovers forward by themselves is
    invisible and slightly spooky – things appear that nobody added, and by
    the time you notice, the undo window is long gone.
  - **Push, from the old week** – the button is drawn at the end of a PAST
    week's list and always targets the current week, so two weeks back still
    pushes forward to today rather than one week along. (First recorded
    backwards, as a pull from this week; corrected the same day.)
  - **No confirmation dialog.** The items vanish on tap and the existing undo
    toast offers them back. Cheap-and-reversible beat guarded-and-annoying.
  - **No button where there is nothing to move** – a fully-bought past week,
    or the current week itself, which has nowhere to push to.
  How it is built, and why it is not a `list_id` update. A plan-fed line
  carries `shopping_list_item_contributions` rows tied to the OLD week's meal
  entries, and those entries stay put – repointing the row would drag that
  bookkeeping onto a week the meal was never on, where `withdraw_entry` would
  later subtract from the wrong list. So a moved item arrives as a fresh,
  user-owned row (`added_manually`, no contributions) and the old row is
  soft-deleted: it stops being the plan's item and becomes yours, which is
  what it means in real life anyway. It merges through `item_merge_key`, so
  two leftover onions onto a week that already plans three give one line of
  five – not the double row the 2026-07-29 merge work removed.
  Two departures from `contribute_entry_into` worth knowing about, both
  deliberate. It merges only into an UNCHECKED line, because folding a
  leftover into something already ticked off this week would make it arrive
  pre-bought and invisible. And it DOES fold into a hand-edited line, which
  the plan reconciler refuses to do: those rails exist so automatic
  reconciliation never overwrites a number the family set by hand, and this
  is not automatic – somebody just asked for it, and folding adds to their
  number rather than replacing it.
  Undo reverses both halves from a server receipt rather than just clearing
  `deleted_at`, because the items also landed somewhere else and may have
  merged on arrival. Created lines are deleted; merged lines give back
  exactly what was added and no more – the same lesson as 0025's
  `applied_quantity`. It lives for the toast's five seconds and no longer, in
  memory, exactly like every other undo on this screen.

- **2026-07-30 – five small UI bugs from on-device testing** (PR #9,
  branch `fix/small-ui-bugs`). All reported by Thomas walking the app on his
  iPhone, each built to device and confirmed before the next:
  - **Household edit icon → vertical 3-dot.** Both edit affordances (the
    household card and your own member row) now use `more-vert` instead of a
    pencil, matching the list-row swipe-hint style. Started as `more-horiz`;
    Thomas wanted the vertical dots as on the list rows.
  - **Recipe description is a text area**, not a single-line input (multiline,
    top-aligned, ~4 lines tall).
  - **Add to weekly plan (recipe detail)** gained the shared week navigator
    (plan a recipe into a future week; back stops at the current week). The
    "Add to plan" button is pinned as the sheet footer – it was scrolling
    half off the bottom once the week nav made the sheet taller – and the
    sheet grows to near full-height.
  - **Shopping refetches on tab focus**, so a meal removed on the Plan tab
    always reconciles the week's list even if the realtime event is missed.
    The reconciler and realtime were already correct; the gap was the tab
    having no catch-up path short of app foregrounding.
  - **Edit-item sheet sizing**: hugs its content when the category picker is
    closed (no dead space above Done – the fixed 80% first try padded the
    closed state), grows to near full-height and auto-scrolls the category
    block into view when the picker opens.
  - Shared plumbing: `BottomSheet` gained `minHeightPercent` (0 = hug content)
    and `maxHeightPercent`, and now exposes its scroll position to the sheet
    body via a `useBottomSheetScroll` hook (used for the edit-item auto-scroll).
  All improvised where noted (no Figma frames for these sheets yet), flagged
  per the 2026-07-17 rule. The blessing note above (2026-07-25) that called the
  edit-item sheet "55% minimum height" is now superseded by the hug/auto-scroll
  behaviour.
- **2026-07-28 – the recipe form's save button is pinned to the bottom.**
  Thomas lost edits twice by leaving the form without reaching the button: it
  sat at the very end of the page, below ingredients and instructions, so on
  a real recipe it was several screens down and easy to walk past. It is now a
  footer bar outside the ScrollView (hairline top rule, page background, above
  the tab bar), so "Save changes" is on screen the whole time. Applies to
  adding too – it is one screen, and the same trap exists there.
  **IMPROVISED, flagged per the 2026-07-17 rule**: the Figma add/edit frame
  draws the button at the end of the page and the DS has no sticky-footer
  component, so the bar's rule, padding and background are mine. Worth a frame
  if the pattern is kept, since the same shape would suit any long form.
  Not covered: with the keyboard open on iOS the bar sits behind it – the
  keyboard is dismissed before saving anyway.
- **2026-07-28 – the GitHub account is now `thomassebell`** (was `sebellDS`, a
  leftover from when the Design System was the only thing on it). Done at the
  right moment by luck as much as judgement: the Pages URLs were not yet in App
  Store Connect, and the custom domain had not been set up – renaming after
  either would have meant changing a URL Apple held, or redoing DNS.
  What GitHub does and does not carry over, from its own warning dialog:
  **repository URLs redirect** (so git keeps working), **Pages sites do NOT**,
  and the old profile URL dies. So every `sebellds.github.io/...` link broke
  instantly and permanently.
  Updated: remotes on prepeat, prepeat-web and design-system; the two
  `github.com/sebellDS/...` links in the DS Storybook docs (Architecture.mdx,
  Welcome.mdx – done in a parallel session); this backlog. The DS was otherwise
  untouched: its token pipeline is a LOCAL file copy, it is `private: true` and
  unpublished, and it has no Pages site.
  ⚠️ **`sebellDS` is now unclaimed and anyone can register it.** GitHub's repo
  redirects stop working the moment somebody does. Nothing depends on them any
  more, but do not rely on one.
  Also learned: `sebell` was already taken, and so is `prepeat` – if an
  organisation for the app is ever wanted, `prepeat-app` / `prepeatapp` /
  `getprepeat` / `prepeat-hq` were all free on 2026-07-28.
- **2026-07-28 – how Prep+Eat's email actually works**, written down because it
  is invisible in the repo (all of it is dashboard and DNS) and because getting
  it wrong breaks sign-in for everybody at once. Sign-in is an emailed one-time
  code, so **email delivery is not a side feature – it is the front door**.
  - **Outbound: Resend**, via Supabase Auth's custom SMTP (smtp.resend.com:465),
    sending as **hello@prepeat.app**, sender name "Prep+Eat", minimum 60s
    between codes to one user. Supabase's built-in sender was never an option
    for production – 2 messages/hour, no SLA, and delivery only to
    pre-authorized team addresses. Had that been left on, the app would have
    looked fine for the family and failed for the public on day one.
  - **Free tier ceiling: 100 emails/DAY** (3,000/month, one domain). The
    failure mode when it is hit is total – no code, no sign-in, no workaround
    for the user.
  - **Inbound is the gap.** Resend sends only. People reply to the email in
    front of them, which is the sign-in email, so hello@prepeat.app needs to
    receive mail or support requests vanish silently.
  - ⚠️ **The SPF trap, for whenever a second sender is added** (a mail host, a
    newsletter tool): a domain may have exactly **ONE** SPF TXT record. Adding
    a second one does not add a sender, it makes SPF invalid and codes start
    landing in spam. Both senders go in the one record as two `include:`
    terms. This is the most likely way to silently break sign-in later.
- **2026-07-27 – the error/retry screen is designed, and it is ONE component**
  (Figma 392:11911, Thomas). The first improvisation from July is retired.
  The design: the block centres vertically in the screen body, text
  left-aligned at 40px margins – a 40px `wifi_off` icon, the title in
  text/accent at display-5, the message in text/default, then 24px to a
  full-width "Try again". Built as `src/components/ui/load-error.tsx` and used
  in all three places that can fail to load (launch, Shopping, Plan), which
  settles both open questions: **one shared component**, not three near-copies,
  and **one state** – no "retrying…", no offline-vs-server distinction.
  Thomas's call that only the copy changes per screen, so title and message
  are props. Two notes worth keeping: the frame carries a white bottom rule
  and sits inside the Household screen's list, both artefacts of where it was
  drawn – the rule was dropped on Thomas's word and the surrounding list is
  not part of the component. The copy keeps the app's en-dash over the frame's
  hyphen (writing style).
- **2026-07-27 – never drop a database column in the same round as the code
  change that stops using it.** Migration 0022 broke the Plan tab on every
  phone within the hour, and the reasoning that let it through was recorded
  right here: "the app no longer touches either one, so applying it late is
  harmless". That confused two different things – the REPO had stopped reading
  `pushed_to_list_at`, but the SHIPPED APP (TestFlight build 10) had not, and
  the shipped app is the one talking to the database. Supabase serves every
  installed build at once, and a phone updates days or weeks after a commit.
  The rule from here on, for any DROP or RENAME of a column the client names:
  **ship the client change first, wait until every install has it, drop
  afterwards** – two migrations, weeks apart, not one. When a drop has already
  gone out, restoring the column is the fast repair (0023): it fixes every
  phone at once with no App Store round trip, where a new build takes a
  build + submit + Apple + each tester updating.
- **2026-07-27 – the Live badge now believes a fetch, but only so far**
  (verified on device by Thomas). The badge lag was never a race in our code:
  realtime-js only notices a dead socket at its next **heartbeat, 25s**
  (CONNECTION_TIMEOUTS.HEARTBEAT_INTERVAL), then reconnects on a stepped
  backoff of up to 10s more, while the foreground refetch repairs the DATA the
  instant the network returns. Two signals, two clocks – so "Offline" sat over
  visibly fresh items. `refresh()` now rebuilds the realtime channel when a
  fetch succeeds while the badge says Offline; `subscribe()` calls
  `socket.connect()` itself on a disconnected socket, so "Live" arrives in
  about a second instead of after the heartbeat plus backoff.
  The restraint is the part worth keeping: a successful fetch only moves the
  badge to **Connecting**, never straight to Live. Reaching the server proves
  you have a network; it does not prove the other devices' edits are
  streaming in, and only SUBSCRIBED proves that. The reverse direction was
  deliberately left alone – a FAILED fetch does not force Offline, because
  that would invent a new wrong-badge case (one flaky request flashing
  Offline while realtime is fine) to fix one the socket already handles.
  Also settled that day: the "blank swiped row" was never a bug (Thomas read
  it off the screenshot – a short name slides out of view when the row
  translates left by the two 56px actions), and the iPad joined the test
  fleet, which is why the badge could be verified without borrowing a second
  family member's phone.
- **2026-07-26 – imported recipes credit their source.** Raised as an idea the
  night before and built the same session, because the data turned out to be
  there already: the importer has stored `recipes.source_url` since
  2026-07-12, but `fetchRecipe` never selected it back, so it had been
  accumulating invisibly for two weeks. The whole job was reading the column
  and showing it.
  A quiet underlined "From justonecookbook.com" sits between the instructions
  and the Edit recipe button – placement and style Thomas's call (the same
  paragraph / text-subtle as the Plan tab's status line), then made a link on
  his follow-up. It opens the phone's browser rather than an in-app one: it is
  somebody else's site, and leaving the app makes that plain. Hand-typed
  recipes have no source and show nothing.
  Finished 2026-07-27: the source is now a **field on the recipe form** (last
  of the facts, under Servings, mirroring the detail screen), pre-filled by an
  import, loading the existing value when editing, and saving null when
  emptied so the credit can be dropped. Behaviour change worth knowing:
  `updateRecipeFacts` never touched `source_url` before, so editing left it
  alone – now the field's contents win, which is the point, but an edit CAN
  clear a source.
  Same round: **Edit recipe** joined the ⋯ menu between "Add ingredients to
  shopping list" and "Delete recipe" (Thomas), keeping its button at the
  bottom of the page too so a long recipe does not have to be scrolled. Both
  call one `openEdit` handler – the routing has a subtlety worth not
  duplicating (edit must stay in whichever tab's stack the detail is rendered
  in, so saving returns to the plan when opened from there).
  Still open if wanted: `sourceLabel()` shows the host only – a full recipe
  URL would wrap over several lines in that quiet style. The form field is
  IMPROVISED (no Figma frame), like the detail line.
- **2026-07-25 – build 10 shipped to TestFlight, and the submit script now
  ends with a fact.** Everything from the day went up in one build: decision
  #8, the undo toasts (including the bulk clear), the reorder gap animation,
  the recipe menu, the keyboard-aware toast, the swap sync fix and the tab-bar
  spacing. Confirmed VALID via Apple's own API, not the CLI.
  That confirmation is now built in. `scripts/asc-build-state.mjs` asks App
  Store Connect for the newest build's processingState, and
  `eas-submit-ios.sh` ends by polling it for up to 20 minutes – so a submit
  finishes by telling you what Apple actually has, instead of a hopeful
  message. This closes the "poll ASC for VALID" item: `eas submit` has been
  seen spinning long AFTER a successful upload as well as during a stuck one,
  so its own output proves nothing either way. The 600s watchdog still handles
  the genuinely-stuck case; the ES256 JWT details (aud, and dsaEncoding
  'ieee-p1363' – node's default DER is rejected) are in the script.
- **2026-07-25 – the tab bar was being counted twice** (commit af982ae).
  Chasing a toast that floated too high turned into a real find: every scroll
  screen carried ~50pt of dead space at the bottom. `tabBarClearance` was
  `insets.bottom + BottomTabInset(50) + tail`, but the tab bar is a NATIVE iOS
  one (expo-router NativeTabs) and a native tab bar already contributes its
  height to the safe-area inset of the screens inside it – so the 50 was pure
  double-count and should never have existed. `BottomTabInset` is deleted, not
  retuned; `tabBarClearance` is now `insets.bottom + extra`, which makes each
  screen's tail an honest gap in points. The undo toast folds back into the
  same helper (its verified position is exactly `insets.bottom + 16`), so
  there is one model instead of two.
  How it was settled, and the reusable bit: Thomas measured the gap at three
  different offsets (+54pt → 82px, +74pt → 112px, +16pt → 24px; his px are
  1.5× points). Each gap equalled exactly what was added on top of
  insets.bottom, which pinned the model down with no guessing. Claude had
  first tried to *reason* the number out and made it worse – three
  measurements beat an argument. The numbers now live in the helper's comment
  so the next person sees where they came from.
- **2026-07-25 – undo now covers the bulk clear too.** "Clear done items" was
  the last delete without a safety net, and the most destructive one. It now
  shows "N items cleared · Undo" and one tap brings the whole batch back. Two
  things surfaced while building it:
  - The earlier reducer refactor (same day) had quietly given bulk clear a
    BROKEN undo: `clearCompleted` dispatched one `remove` per item, so the
    snapshot ended up as whichever item happened to be last, and a toast
    appeared naming one arbitrary row that Undo alone restored. Claude's own
    regression, caught while implementing the real feature. Bulk clear is now
    a single `clear-completed` action so the reducer snapshots the batch.
  - The server delete now targets the exact ids taken off screen instead of
    "every checked row in this list". The blanket version could also sweep
    away something the OTHER phone ticked a second earlier – which undo would
    then not bring back, because it was never in the snapshot.
- **2026-07-25 – every improvised screen blessed as designed** (Thomas, after
  walking them on device: *"every designed-block is approved and looks
  great"*). These stop being improvisations and become the design: the **undo
  toast** in both its resting positions (above the keyboard, above the tab
  bar); the **edit-item sheet** at 55% minimum height with "Done" pinned below
  the scroll; the **Plan status line** "Your shopping list updates as you
  plan." at the bottom of the day list and the **Shopping empty state** that
  pairs with it; the **offline/retry screens** (`HouseholdLoadError`,
  `LoadFailed`); and the **resend-code feedback states**. No Figma frames were
  drawn for any of them – the on-device build was the review surface. Worth
  noting for the future: this is the opposite of the 2026-07-17 rule ("build
  the design, never an approximation"), and it worked here only because each
  piece was small, shown on-device within minutes, and explicitly flagged as
  improvised rather than passed off as designed. Held back from the blessing
  because it was a missing feature rather than an undesigned one: the bulk
  "Clear done items" had no undo – built the same evening, see above.
- **2026-07-25 – the plan→list link step retired** (projektgrundlag decision
  #8, commit 6a251e3). Started as a product question from Thomas, not a bug:
  *"why do we need the button 'Update shopping list'?"* – then, on learning a
  week stayed unlinked until someone pressed it once, *"I want to delete the
  button all together."* The button was working as designed; the design had
  quietly been outdated by two changes from 2026-07-16 (per-week lists 0008 +
  live A + rails reconciliation), which removed the problem the opt-in solved.
  Every meal now contributes on write, `resolve_week_list` creates a new
  week's list on demand, migration 0021 swept in the three existing weeks, and
  a status line replaced the CTA. Net −23 lines. Worth remembering: nothing in
  the tests, types or lint could have flagged this – only asking whether the
  UI still matched the model.
- **2026-07-25 – two-phone realtime testing, finally possible.** Both phones
  got the dev app, all six tests passed, and one real bug fell out that a
  single phone could never have shown: a **swapped meal did not reach the
  other phone**. Realtime payloads carry no recipe join, so the receiving
  phone fell back to the cached title/image – it updated `recipeId` while
  still showing the OLD recipe's name and photo. The shopping list WAS
  correct (that reconciliation is server-side), and that asymmetry is what
  pinned it down. Lesson: sync bugs need two devices; "it works on my phone"
  is not evidence.
- **2026-07-25 – first dev-variant test round** (Prep+Eat Dev on Thomas's
  phone, six build/test cycles). Tested the tech-debt work from 2026-07-24;
  reorder + swap passed. Fixed from the feedback:
  - **Reorder sheet** was unusable on a long ingredient list – it grew past the
    notch and the close button was unreachable. Now capped below the safe area
    with the rows scrolling inside (scroll freezes while a row is dragged).
    Thomas then asked for the surrounding rows to slide aside and open a gap
    where the dragged row will land – built, so you can see the target slot.
  - **Recipe ⋯ menu** was pinned at a magic `top: 52px`; anchoring it to the
    measured header put it too high (the header offset is not the screen
    offset), so it now uses `measureInWindow` on the icon itself. Plus a soft
    drop shadow (needs explicit iOS shadow* + Android elevation; NativeWind's
    shadow-lg renders flat, and `overflow-hidden` KILLS an iOS shadow).
  - **Undo toast behind the keyboard** – see Known bugs. Worth remembering as
    a process point: Claude reasoned from code to a confident but WRONG
    conclusion ("provably a stale-ref snapshot"); Thomas found the real cause
    by looking at the screen. Read the device before trusting a code-only
    theory.

- **2026-07-24 – dev vs TestFlight builds now have separate identities**
  (Thomas). Direct-to-device builds are a distinct "dev" app that installs
  ALONGSIDE the TestFlight app, so it's obvious which is which. Mechanism:
  `app.config.js` (new, layered on app.json) switches icon → `icon-dev.png`
  (Figma node 323:10079, "dev prep+eat" on light grey), bundle id →
  `app.prepeat.dev`, and home-screen name → "Prep+Eat Dev" when
  `APP_VARIANT=dev`. That flag is set by scripts/build-iphone.sh and the EAS
  development/preview profiles; ONLY EAS `production` (→ TestFlight/App
  Store) leaves it unset and keeps the real Prep+Eat identity. The Expo
  `name` is intentionally unchanged so the native project/scheme stays
  "PrepEat" (the build script hardcodes it); the dev label rides on
  CFBundleDisplayName. build-iphone.sh now runs `expo prebuild` before
  xcodebuild – this also permanently fixes the old bug where direct builds
  showed the stale Expo template icon (the local ios/ project was generated
  Jul 3, before the icon existed, and the direct build never re-ran prebuild).
- **2026-07-24 – meal-plan "Remove meal" confirm dialog → undo toast**
  (Thomas). Reverses the 2026-07-16 "remove has a confirm dialog" call: undo
  is the less-interruptive safety net, consistent with shopping and the
  recipe editor. Remove is now instant; a 5s "{meal} removed · Undo" toast
  revives the entry (and re-links it to the shopping list if the week was
  pushed). RemoveMealSheet deleted. The undo toast itself is still an
  improvised placeholder pending a Figma design.
- **2026-07-22 – multi-household journey shipped end to end** (16 commits,
  built slice by slice on device in the Prepeat brand). At a glance:
  - Switcher + join another household + post-join welcome interstitial
    (61aa239, 9135cc9); invite-someone sheet, code-sharing only – email dropped
    (052aae0).
  - Leave household with copy-on-leave incl. photos (f4277cd, migration 0015);
    Delete profile / GDPR erasure with type-DELETE fail-safe (25df0ac,
    migration 0016 – a direct auth.users delete from a SECURITY DEFINER RPC
    works, no Edge Function); Delete household, sole-member only (52fc9a9,
    migration 0017).
  - Photo cleanup on delete (645fb19); storage read policy scoped to members
    (7a34b34, migration 0018); household image dropped (fb7f60d); join
    back-arrow safe-area fix + solid Delete profile (3299d42).
  - Migrations 0015–0018 applied on Supabase. Walked the whole flow on device.
    Deferred: merge / copy-to-my-other-kitchen (incl. the "extra kitchen on
    leave" gripe).
- Storage hardening (2026-07-22): recipe-photo listing scoped to members
  (migration 0018) – the old broad SELECT let any client enumerate every photo
  path, undermining the "unguessable URL" privacy (Supabase flagged it). Public
  display is unaffected (public-bucket URLs bypass RLS). Copy-on-leave was
  reworked to FETCH originals via their public URL and re-upload, instead of the
  authenticated storage copy API, which the tighter policy would deny to a
  just-departed member. Verified on device (photos display, leave keeps photos,
  banner cleared).
- Household journey BUILT (2026-07-22, Thomas), slice by slice on device in the
  Prepeat DS brand (Montserrat + lime): multi-household switcher + join (61aa239),
  invite-someone sheet simplified to code-sharing only – email field dropped
  (052aae0), leave household with copy-on-leave incl. photos (f4277cd), delete
  profile / GDPR erasure with the type-DELETE fail-safe (25df0ac). Two learnings
  worth keeping: a direct `delete from auth.users` from a SECURITY DEFINER RPC
  works in Supabase, so **no Edge Function** was needed for erasure; and Leave/
  Delete live in the Edit-**profile** sheet (not Edit household). Deferred at
  the time: photo-orphan cleanup (since done), the post-join welcome
  interstitial. Invite-by-email was later DROPPED (2026-07-22).
- CORRECTION (2026-07-22): an earlier note in this session claimed a "DS retune
  to sage/Noto" requiring a whole-app re-theme. That was wrong – the sage/Noto
  values came from reading a DIFFERENT brand's mode in the multi-brand Sebell DS
  via get_design_context fallbacks. The **Prepeat brand is Montserrat + lime**
  (`ds-theme.cjs`), which the app already ships. No re-theme is needed; the
  household screens are correctly Prepeat-branded. Trust `ds-theme.cjs` over
  Figma get_design_context hex fallbacks (they can resolve another brand mode).
- Household journey designed + reviewed (2026-07-22, Thomas). The Figma
  "Household" page now covers the switcher (header "Household ▾" dropdown +
  "Join a household"), join-another-household (reuses onboarding invite-code →
  welcome), invite-by-email, and moves Leave/Delete into the Edit household /
  Edit your profile sheets. Reviewed and copy-fixed in Figma (spelling,
  "1 member", lowercase "household", leave/delete confirmation copy aligned to
  the specs). Terminology: the UI calls it **"Delete profile"** / **"Edit your
  profile"** (the spec's "account" = this "profile"). Open: the auto-name shown
  ("Thomas3' kitchen") must follow the spec format "[Firstname]'s Kitchen"
  (capital K, proper 's) when built.
- Delete account / GDPR erasure spec settled (2026-07-21, Thomas) – full
  write-up in [delete-account.md](delete-account.md). Calls: lives in Household
  (no Settings area yet); instant hard delete (no grace period); recipes added
  to a shared family stay with the family; the deleted person's name is cleared
  (nothing replaces it). Pre-launch, because Apple requires in-app account
  deletion for any app with account creation.
- Leave household spec settled (2026-07-20, Thomas) – full write-up in
  [leave-household.md](leave-household.md). Calls: Leave lives in Household;
  copy recipes only; new kitchen auto-named "[Firstname]'s Kitchen"; copied
  recipes re-attributed to the leaver (GDPR). Rejoin = plain join, no
  auto-merge, nothing lost (rule A) – the leaver's solo kitchen is parked
  until the household switcher ships. Surfaced that "Change household" is an
  unbuilt dependency; all filed under Later (v1.1+).
- Leaving again (2026-07-21, Thomas): one uniform rule – every leave takes a
  fresh snapshot into a new personal kitchen ("Anna's Kitchen 2"), never
  reuses the stale one, never leaves the person with nothing. Stale kitchens
  are cleaned up later by the switcher + merge (leave-household.md).
- Plan → shopping list stays live in step for the week ("A + rails",
  decided 2026-07-16). The auto-generated part of the shopping list is a
  live projection of that week's plan, not a one-time copy. When a plan
  entry changes (servings edit, meal added/swapped/removed), the linked
  shopping items reconcile automatically – but only lines that are still
  "clean" are touched silently:
  - **Clean line** (unchecked, not hand-edited) → quantity updates in place.
    Example: Friday 3 → 8 servings before shopping just rescales flour,
    onions, etc.
  - **Checked line** → left checked; show a "quantity changed in the plan"
    marker so the shopper decides. Never silently un-tick.
  - **Hand-edited line** ("we already have flour → 0") → never overwritten;
    flag the conflict instead.
  - **Meal removed** → pull back only its clean, unchecked contribution.
  - Requires each shopping line to track which meal(s)/entries contributed,
    so a single change rescales only that meal's share of a merged line
    (Friday onions + Wednesday onions in one "Onions" row). This is the
    data-model consequence to build for: `source_entry_id` alone is not
    enough once lines merge across entries – need per-contribution tracking.
  - Refines the 2026-07-07 "fill from weekly plan sweeps checked items"
    decision: that full rebuild-and-sweep becomes the explicit "reset this
    week's list" escape hatch (option B), NOT the everyday sync. Small plan
    edits must not wipe ticked items.
- Plan design – first draft reviewed 2026-07-16 (Thomas designed, Claude
  reviewed for gaps/spelling/wording). Decisions:
  - **No meal types in v1.** A day holds a flat list of meals – add as many
    as you like, no breakfast/lunch/dinner/snack distinction. The data
    model's `meal_type` field stays unused for now (this replaces the
    earlier "up to four meal slots/day" idea).
  - **"Servings" everywhere**, not "people" – the row labels and the
    stepper now agree (fixed in Figma).
  - **Editing a planned meal** is a swipe on the meal row, revealing four
    actions: move to another day, swap, change servings, remove (remove has
    a confirm dialog).
  - **Multi-add**: you can select several recipes for one day at once; they
    all take the same serving count in that single add (edit individually
    afterward).
  - Still open (not decided this round): whether recipe-less meals
    ("Leftovers", "Eating out") are allowed. (Settled 2026-07-18: yes –
    the Manual tab on the add-meal sheet, see the Manual meals entry.)
- Plan – week navigation (designed + reviewed 2026-07-16):
  - **Week switcher** below the header: `‹ July 13-19 · Week 29 ›`. You can
    go **2 weeks back**; chevrons are **disabled at the edges** (a direction
    with no created week is not navigable). The switcher only moves between
    weeks that exist – it does not create them.
  - **Creating a week is the header "+"** (kept separate from the switcher),
    opening an "Add new week" sheet: **Add a clean week** or **Copy this
    week's meals**. A copy must snapshot ingredients into the new week, not
    reference the source recipes.
  - **Dynamic header title.** The big title is relative to today – "This
    week" / "Next week" / "Last week" (and further out as needed) – while
    the date pill stays the precise anchor. (Was a static "This week" that
    read wrong on other weeks.)
  - **Recipe search filters as you type**; the "No recipe for X yet →
    Add recipe" empty state shows only when zero recipes match.
  - (Note: the header was later reworked into a segmented day bar, 2026-07-17
    – the copy-week feature retired then. See git history.)
- Recipe ingredient quantities are one free-text field per ingredient
  (decided 2026-07-12): parsed into amount + unit like the shopping list;
  unparseable text ("a pinch") passes through and never scales. Servings
  is its own stepper on the recipe (default 4, the scaling anchor);
  scaling happens in the planner as planned ÷ recipe servings, with
  sensible display rounding. Parser to handle "1,5" and "1/2".
- Recipes list gets one search field matching names AND ingredients – no
  manual tags/filters in v1 (2026-07-12); tags parked on the ideas list.
- DS 7-step colour ramps adopted (2026-07-11): tokens re-synced, existing
  screens remapped one step (old "lighter" tints are now "lightest" etc.)
  so backgrounds/badges kept their look; the brand green retuned
  (#47A518 → #56C91D). The DS's Chip component is implemented natively at
  src/components/ui/chip.tsx (solid + outline, active/pressed/disabled).
- Solid buttons follow the DS button recipe (2026-07-11): light-lime fill +
  ink label (was green + white). The app consumes button/* tokens from the
  theme fragment (classes like bg-button-solid-fill-enabled); "button" was
  added to the DS's NativeWind export list alongside chip.
- Recipes before the weekly plan (2026-07-08, Thomas's catch): build the
  dependency first; the backlog gets re-ordered at each milestone boundary.
- Checked items clear two ways (decided 2026-07-07): a manual "Clear" button
  in the done section, plus an automatic sweep when the list is filled from
  the weekly plan. No time-based auto-clear. Cleared items are soft-deleted,
  so undo/history stays possible.
- Checked items move to the done section after 0.2s with a fade/slide
  animation (tuned down from 1.5s via 0.6s and 0.4s; 0.2s felt right,
  2026-07-08). Accidental taps are undone from the done section instead
  of a linger window.
