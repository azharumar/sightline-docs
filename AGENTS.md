# sightline-docs: instructions for AI agents

This repository is the **single source of truth** for Sightline: specification, design system, decisions, agent rules and skills. `sightline-app` and `sightline-web` include it as their `docs/` submodule.

Read before any change:

1. `agents/rules/core.md` (rules for every repository)
2. `agents/rules/docs.md` (rules for this repository)
3. `src/content/docs/how-this-repo-works.md` (what lives where)

Commands: `npm install`, `npm run dev` (local site), `npm run check` (frontmatter, em dashes, build). Skills are in `agents/skills/` (Claude Code: `.claude/skills/`, Cursor: `.cursor/commands/`, both links created by `agents/sync-agent-files.sh`).
