#!/usr/bin/env bash
# Links skills for Claude Code and Cursor and copies GitHub templates from sightline-docs into a repository.
# Single source: sightline-docs/agents. Run from the repository root.
#   In sightline-app or sightline-web:  docs/agents/sync-agent-files.sh [--check]
#   In sightline-docs itself:           agents/sync-agent-files.sh [--check]
set -euo pipefail
check=0; [[ "${1:-}" == "--check" ]] && check=1
if [[ -d docs/agents/skills ]]; then src="docs/agents"; else src="agents"; fi
fail() { echo "out of sync: $1" >&2; exit 1; }

link() { # link <target relative to the link's folder> <link path>
  local target="$1" path="$2"
  if [[ $check == 1 ]]; then
    [[ -L "$path" && "$(readlink "$path")" == "$target" ]] || fail "$path"
  else
    mkdir -p "$(dirname "$path")"; ln -sfn "$target" "$path"
  fi
}
copy() { # copy <source> <destination>
  if [[ $check == 1 ]]; then cmp -s "$1" "$2" || fail "$2"; else mkdir -p "$(dirname "$2")"; cp "$1" "$2"; fi
}

for dir in "$src"/skills/*/; do
  name="$(basename "$dir")"
  link "../../$src/skills/$name" ".claude/skills/$name"
  link "../../$src/skills/$name/SKILL.md" ".cursor/commands/$name.md"
done
for f in "$src"/github/ISSUE_TEMPLATE/*; do copy "$f" ".github/ISSUE_TEMPLATE/$(basename "$f")"; done
copy "$src/github/pull_request_template.md" ".github/pull_request_template.md"

[[ $check == 1 ]] && echo "agent files in sync" || echo "agent files synced from $src"
