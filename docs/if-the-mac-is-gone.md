# If the Mac is gone

A step-by-step guide for the day the work Mac is stolen, dies, or goes back to
the employer. Written 2026-08-11, at Thomas's request, and checked against the
actual machine rather than assumed.

**Every step says who does it.** 🧑 means only Thomas can do it – it needs a
browser, an account password, or a decision. 🤖 means hand it to Claude, who
will run it. There is nothing here Thomas has to type into a terminal himself.

---

## Read this first – 30 seconds

**The project is not at risk.** The code, the database and every account live
somewhere else. What is at risk is a few folders and a bit of time.

| | Where it really is | Gone with the Mac? |
|---|---|---|
| All the code, migrations, docs | GitHub – 5 repos | no |
| The live app and its database | Supabase | no |
| Recipes, photos, users | Supabase | no |
| Apple signing key | Apple Passwords (personal Apple ID) | no |
| Release build credentials | Expo's servers | no |
| How Claude and Thomas work | `claude-config` repo + iCloud | no |
| The App Store listing | App Store Connect | no |
| **Local database backups** (64 MB) | **only this Mac** | **yes** |
| **App Store screenshots** (10 MB) | **only this Mac** | **yes** |

**The disk is encrypted.** FileVault is on, verified 2026-08-11. A stolen Mac
that is switched off is a brick to whoever has it – they get no files, no
passwords, no database access. This is the single fact that turns "stolen"
from an emergency into a nuisance, and it is why the steps below are ordered
the way they are.

---

## A. If it was STOLEN or LOST

Do these in order. The first one matters most and takes two minutes.

### 1. 🧑 Mark it lost, from your iPhone

Open **Find My** → **Devices** → the Mac → **Mark As Lost**. This locks it
remotely and shows a message on screen. If you are confident it is not coming
back, choose **Erase This Device** as well.

Do this even if you think it is just misplaced. Marking it lost is reversible;
finding out later that you did not is not.

### 2. 🧑 Change your Apple ID password

At [account.apple.com](https://account.apple.com). The Mac was signed in to
your Apple ID, and that account holds the signing key, the App Store Connect
access and Find My itself.

### 3. 🧑 Reset the Supabase database password

[supabase.com/dashboard](https://supabase.com/dashboard) → project **prepeat**
→ Settings → Database → **Reset database password**.

Why: the file `~/.prepeat-backup.env` on that Mac contains the production
database password in plain text. FileVault means it is encrypted, but resetting
costs a minute and removes the question entirely. Do the same for the
**Prepeat Dev** project.

### 4. 🧑 Revoke the Apple API key

[App Store Connect](https://appstoreconnect.apple.com) → Users and Access →
Integrations → App Store Connect API → revoke key **UN3YR958DC**.

Why: it signs and uploads releases. Revoke rather than replace – the other two
pieces needed to use it (`ascApiKeyId` and `ascApiKeyIssuerId`) sit in
`eas.json` in the **public** prepeat repo, so the key file is the only secret.

Then 🧑 create a new one and save it straight into Apple Passwords, the same
way the old one was. **It can only be downloaded once.**

### 5. 🧑 Sign out everything else

- **GitHub** → Settings → Applications, and Settings → Developer settings →
  Personal access tokens: revoke anything issued to that Mac.
- **Expo** → [expo.dev](https://expo.dev) → Account Settings → Access Tokens.
- **Figma** → Settings → Sessions → log out other sessions.
- **Supabase** → Account → Access Tokens.

### 6. 🧑 About the household data

`~/Prepeat-backups/` held 64 MB of real database backups – family members'
email addresses, recipes, shopping lists – and `app-store-assets/` held
screenshots of a real household. **FileVault means none of it is readable**, so
this is not a data breach requiring anyone to be notified. Written down here so
the question can be answered rather than worried about.

---

## B. If you are HANDING IT BACK to the employer

No rush and no revoking – but four folders exist nowhere else. Do this **before
the machine leaves the building**.

### 1. 🤖 Push everything

Ask Claude: *"check every repo for unpushed commits"*.

**Every repo pushes itself** after a commit on `main` – prepeat, design-system,
prepeat-web and synthetic-user-panel each carry the hook at
`scripts/git-hooks/post-commit`, and claude-config is pushed by the snapshot
script. So the honest answer is that unpushed work should not happen.

Check anyway. A hook only fires on `main`, so anything committed on a branch is
still local, and a failed push prints a warning that is easy to scroll past –
`.git/autopush.log` in each repo is the record.

**After cloning any repo onto a new Mac, install its hook:**

```bash
./scripts/install-git-hooks.sh
```

Git never runs the tracked copy – `.git/hooks/` is not version controlled, so a
fresh clone has no hooks at all until that command is run.

### 2. 🤖 Copy off the four things

Ask Claude: *"copy everything that only exists on this Mac to iCloud"*. That is
`~/Prepeat-backups/` (64 MB), `app-store-assets/` (10 MB), and – already done
automatically – Claude's memory and the global `CLAUDE.md`.

### 3. 🧑 Check the signing key is really in Apple Passwords

On your **iPhone**, not the Mac: Settings → Passwords → look for the App Store
Connect key entry. If it is only visible on the Mac it is not backed up, it is
just saved. This exact check has caught the problem before.

### 4. 🧑 Sign out of everything and erase

System Settings → General → Transfer or Reset → **Erase All Content and
Settings**. Sign out of Apple ID, iCloud, GitHub, Figma and Supabase first.

### 5. ⚖️ Ask someone qualified about the contract

Prep+Eat is a commercial product built on employer-owned hardware. Some
employment contracts have IP clauses that reach further than people expect.
**This is a question for a professional, not for Claude** – and it is far
cheaper to ask before the machine goes back than after.

---

## C. Getting working again on a new Mac

Roughly half a day, most of it waiting for downloads. Nothing here is difficult
and nothing depends on the old machine.

### 1. 🧑 Sign in first

Apple ID, then install **Xcode** from the App Store (large – start it first and
let it run), and sign in to GitHub in a browser.

### 2. 🤖 Everything else

Hand Claude this list and it will work through it:

```
Set up this Mac for Prep+Eat: install Homebrew, node, git and libpq; clone
prepeat, prepeat-web, design-system, synthetic-user-panel and claude-config
from GitHub, and run ./scripts/install-git-hooks.sh in each; restore
Claude's memory from claude-config; recreate .env and ~/.prepeat-backup.env
from the Supabase dashboard; run npm install, npm run hooks:install and
npm run backup:install; then verify with npm run backup and npx tsc --noEmit.
```

The details behind each step are in
[backups-and-local-db.md](backups-and-local-db.md) → "Setting this up on a new
Mac", including two traps: the database URL must be the **Session pooler** one
(direct connections are IPv6-only), and a scheduled backup job is not installed
until it has been seen succeeding *on the scheduler* – running it by hand
proves nothing.

### 3. 🧑 Two passwords Claude cannot get for you

- The **Supabase database password** – reset it in the dashboard and paste it
  to Claude, or let Claude tell you exactly where it goes.
- The **Apple signing key** – copy it out of Apple Passwords.

### 4. 🤖 Restore the working relationship

This is the part that makes Claude *itself* again rather than a stranger:

```bash
git clone https://github.com/thomassebell/claude-config.git ~/claude-config
```

Then ask Claude to restore it – the instructions are in that repo's README. It
puts back the global `CLAUDE.md` (write with en-dashes, Thomas is not a
developer, fetch the real design spec, know what is live versus what is in the
code) and 16 memories about this project. Without it, Claude starts from
nothing and every lesson gets learned twice.

### 5. 🧑 Trust the new phone build

The dev app is signed per-device. First `./scripts/build-iphone.sh` on the new
Mac will need Settings → General → VPN & Device Management → Trust on the
iPhone.

---

## D. What you genuinely cannot get back

Being honest about it, because the rest of this document is reassuring.

| | Why it matters | What to do instead |
|---|---|---|
| The local database backups | Production is untouched, so no data is lost – but there is no backup at all until the new Mac runs one | 🤖 Run `npm run backup` on day one |
| The App Store screenshots | Regenerable, but tedious – they need a populated household | 🤖 Re-shoot from the demo account |
| Session transcripts older than the last archive | The conversations themselves | Nothing – the *distilled* result is in `claude-config` |
| The Apple Development certificate | Signs dev builds for the iPhone | 🤖 Regenerates automatically from Xcode |

---

## E. Keeping this document true

A recovery plan that has gone stale is worse than none, because it is trusted.
This file has already been wrong once: the disaster table listed the Apple
signing key as living "nowhere else" for a week after it was safely in Apple
Passwords, which made the situation read far worse than it was.

**🤖 Re-check it whenever a new secret, service or single-copy folder appears.**
The test is one question: *if this Mac vanished right now, what would we not be
able to get back?* If the answer has changed, this document is out of date.

Last verified 2026-08-11: FileVault on, 4 repos on GitHub, signing key in Apple
Passwords, config in `claude-config` + iCloud, transcripts archived weekly.
