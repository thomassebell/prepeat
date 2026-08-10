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

printf '%s  snapshot: %s memories\n' \
  "$(date '+%F %T')" \
  "$(ls -1 "$DEST/memory"/*.md 2>/dev/null | wc -l | tr -d ' ')" \
  >> "$DEST/.last-run"

# Keep the marker from growing for ever.
if [ -f "$DEST/.last-run" ] && [ "$(wc -l < "$DEST/.last-run" | tr -d ' ')" -gt 200 ]; then
  tail -50 "$DEST/.last-run" > "$DEST/.last-run.trim" && mv "$DEST/.last-run.trim" "$DEST/.last-run"
fi
