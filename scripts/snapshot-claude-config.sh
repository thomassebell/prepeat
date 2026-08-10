#!/bin/sh
# Copy the parts of Claude Code's setup that live NOWHERE ELSE into iCloud Drive.
#
#   npm run claude:snapshot     (also runs from the post-commit hook)
#
# WHY THIS EXISTS (Thomas, 2026-08-11): "I'm most concerned with Claude memory.
# The way we work together is the most valuable to me." He is right that it is
# the least protected thing in the project - the code is on GitHub, the accounts
# are personal, the signing key is in Apple Passwords, and this was the one
# irreplaceable thing held on a Mac that belongs to an employer.
#
# ⚠️ NOT IN THE SCHEDULED BACKUP JOB, ON PURPOSE. launchd cannot write inside
# iCloud Drive - see the comment in backup-supabase.sh, where that was learned
# the hard way, twice. A git hook runs in Thomas's own session and can.
#
# ⚠️ Editing this file is enough; the hook calls it by path. But editing the
# HOOK does nothing until `npm run hooks:install` is re-run.

set -eu

SRC_GLOBAL="$HOME/.claude/CLAUDE.md"
SRC_SETTINGS="$HOME/.claude/settings.json"
SRC_MEMORY="$HOME/.claude/projects/-Users-tseb-Documents-Claude-Projects-Prepeat/memory"
DEST="$HOME/Library/Mobile Documents/com~apple~CloudDocs/Claude-config"

# No iCloud Drive on this machine? Then there is nothing to protect it with, and
# failing loudly here would only break commits.
[ -d "$(dirname "$DEST")" ] || { echo "iCloud Drive not found – skipping"; exit 0; }

mkdir -p "$DEST/memory"

[ -f "$SRC_GLOBAL" ] && cp -f "$SRC_GLOBAL" "$DEST/CLAUDE-global.md"
[ -f "$SRC_SETTINGS" ] && cp -f "$SRC_SETTINGS" "$DEST/settings.json"

if [ -d "$SRC_MEMORY" ]; then
  # Copy in, then remove anything deleted at source, so a memory Claude
  # retired as WRONG does not live on here and get restored later.
  cp -f "$SRC_MEMORY"/*.md "$DEST/memory/" 2>/dev/null || true
  for f in "$DEST/memory"/*.md; do
    [ -e "$f" ] || continue
    [ -f "$SRC_MEMORY/$(basename "$f")" ] || rm -f "$f"
  done
fi

# --- 2. the private git repo, which is the versioned copy -------------------
# iCloud holds the newest state; this holds the HISTORY, so a memory deleted by
# mistake can be recovered and the working agreement's evolution is readable.
REPO="$HOME/claude-config"
if [ -d "$REPO/.git" ]; then
  mkdir -p "$REPO/memory"
  [ -f "$SRC_GLOBAL" ] && cp -f "$SRC_GLOBAL" "$REPO/CLAUDE-global.md"
  [ -f "$SRC_SETTINGS" ] && cp -f "$SRC_SETTINGS" "$REPO/settings.json"
  if [ -d "$SRC_MEMORY" ]; then
    cp -f "$SRC_MEMORY"/*.md "$REPO/memory/" 2>/dev/null || true
    for f in "$REPO/memory"/*.md; do
      [ -e "$f" ] || continue
      [ -f "$SRC_MEMORY/$(basename "$f")" ] || rm -f "$f"
    done
  fi
  # Commit only when something actually changed, so the history is a record of
  # the working agreement moving rather than one commit per prepeat commit.
  if [ -n "$(git -C "$REPO" status --porcelain 2>/dev/null)" ]; then
    git -C "$REPO" add -A >/dev/null 2>&1 || true
    git -C "$REPO" -c user.name="Thomas Sebell" -c user.email="thomas@sebell.dk" \
      commit -q -m "Sync from $(hostname -s), $(date '+%F %T')" >/dev/null 2>&1 || true
    git -C "$REPO" push -q origin main >/dev/null 2>&1 || \
      printf '%s  PUSH FAILED – config repo is local only\n' "$(date '+%F %T')" >> "$DEST/.last-run"
  fi
fi

# --- 3. the transcripts, weekly ---------------------------------------------
# 300+ MB of session logs: where the working relationship was actually built,
# as opposed to the distilled result above. Far too churny to sync live, so it
# is archived on a slow cadence and only a few are kept.
ARCHIVES="$DEST/transcripts"
# ⚠️ MEASURED, NOT ESTIMATED: an archive is ~160 MB, not the 30-50 MB first
# guessed. The transcripts hold base64 screenshots, which are already
# compressed, so tar barely helps - one session alone is 118 MB. Two weeks is
# therefore ~320 MB of somebody's iCloud quota. Raise KEEP only after looking
# at what iCloud has spare.
KEEP=2
mkdir -p "$ARCHIVES"
newest_archive_age_days() {
  newest=$(ls -t "$ARCHIVES"/transcripts-*.tar.gz 2>/dev/null | head -1)
  [ -n "$newest" ] || { echo 9999; return; }
  echo $(( ( $(date +%s) - $(stat -f %m "$newest") ) / 86400 ))
}
if [ "$(newest_archive_age_days)" -ge 7 ] && [ -d "$HOME/.claude/projects" ]; then
  STAMP=$(date '+%Y-%m-%d')
  if tar -czf "$ARCHIVES/transcripts-$STAMP.tar.gz.part" \
        -C "$HOME/.claude" projects 2>/dev/null; then
    mv "$ARCHIVES/transcripts-$STAMP.tar.gz.part" "$ARCHIVES/transcripts-$STAMP.tar.gz"
    # Keep the newest few; older weeks are of diminishing value and this is
    # somebody's iCloud quota.
    ls -t "$ARCHIVES"/transcripts-*.tar.gz 2>/dev/null | tail -n +$((KEEP + 1)) | while read -r old; do
      rm -f "$old"
    done
    printf '%s  transcripts archived: %s\n' "$(date '+%F %T')" \
      "$(du -h "$ARCHIVES/transcripts-$STAMP.tar.gz" | cut -f1)" >> "$DEST/.last-run"
  else
    rm -f "$ARCHIVES/transcripts-$STAMP.tar.gz.part"
  fi
fi

printf '%s  snapshot: %s memories\n' \
  "$(date '+%F %T')" \
  "$(ls -1 "$DEST/memory"/*.md 2>/dev/null | wc -l | tr -d ' ')" \
  >> "$DEST/.last-run"

# Keep the marker from growing for ever.
if [ -f "$DEST/.last-run" ] && [ "$(wc -l < "$DEST/.last-run" | tr -d ' ')" -gt 200 ]; then
  tail -50 "$DEST/.last-run" > "$DEST/.last-run.trim" && mv "$DEST/.last-run.trim" "$DEST/.last-run"
fi
