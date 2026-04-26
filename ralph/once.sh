#!/bin/bash
# ralph/once.sh — single Ralph run with human-in-the-loop edit approval.
#
# Run from the loom-meta directory:
#   cd /Users/jrkphani/Projects/loom/loom-meta
#   ./ralph/once.sh
#
# Ralph picks one AFK issue, completes it through TDD, commits in the
# relevant sibling repo, and stops.

set -eo pipefail

# Concatenate all open issue files (excluding done/).
issues=$(find issues -maxdepth 1 -name "*.md" -type f -exec cat {} \; 2>/dev/null || echo "No issues found")

# Pull the last 5 commits across every sibling repo so Ralph has full context.
commits=""
for repo in ../loom-core ../loom-mcp ../loom-apple-ai ../loom-ui; do
  if [ -d "$repo/.git" ]; then
    repo_name=$(basename "$repo")
    repo_log=$(cd "$repo" && git log -n 5 --format="%H%n%ad%n%B---" --date=short 2>/dev/null || echo "")
    if [ -n "$repo_log" ]; then
      commits="${commits}### ${repo_name}\n${repo_log}\n\n"
    fi
  fi
done

if [ -z "$commits" ]; then
  commits="No commits found in any sibling repo."
fi

prompt=$(cat ralph/prompt.md)

claude --permission-mode acceptEdits \
  "Previous commits: $commits

Issues: $issues

$prompt"
