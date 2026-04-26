#!/bin/bash
# ralph/afk.sh — multiple unattended Ralph iterations.
#
# Usage:
#   cd /Users/jrkphani/Projects/loom/loom-meta
#   ./ralph/afk.sh 10
#
# Each iteration runs in a docker sandbox, picks one AFK issue, and stops
# when all AFK tasks are complete or the iteration cap is reached.

set -eo pipefail

if [ -z "$1" ]; then
  echo "Usage: $0 <iterations>"
  exit 1
fi

# jq filter to extract streaming text from assistant messages.
stream_text='select(.type == "assistant").message.content[]? | select(.type == "text").text // empty | gsub("\n"; "\r\n") | . + "\r\n\n"'

# jq filter to extract final result.
final_result='select(.type == "result").result // empty'

for ((i=1; i<=$1; i++)); do
  echo ""
  echo "═══ Ralph iteration $i / $1 ═══"
  echo ""

  tmpfile=$(mktemp)
  trap "rm -f $tmpfile" EXIT

  # Pull last 5 commits per sibling repo.
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

  issues=$(find issues -maxdepth 1 -name "*.md" -type f -exec cat {} \; 2>/dev/null || echo "No issues found")
  prompt=$(cat ralph/prompt.md)

  docker sandbox run claude . -- \
    --verbose \
    --print \
    --output-format stream-json \
    "Previous commits: $commits

Issues: $issues

$prompt" \
  | grep --line-buffered '^{' \
  | tee "$tmpfile" \
  | jq --unbuffered -rj "$stream_text"

  result=$(jq -r "$final_result" "$tmpfile")

  if [[ "$result" == *"<promise>NO MORE TASKS</promise>"* ]]; then
    echo ""
    echo "Ralph complete after $i iterations."
    exit 0
  fi
done

echo ""
echo "Ralph hit iteration cap ($1) without exhausting AFK queue."
