# Rules for sightline-docs

Adds to `core.md`.

- This repository is the single source of truth. Every fact lives in exactly one page. Before adding a page or a paragraph, search for an existing place for it; link instead of repeating.
- Specification pages are in `src/content/docs/spec/`. Each page has frontmatter with `title` (Starlight requires it). Keep the numbered file names of the app specification stable; other pages and issues refer to them.
- A change to what the product does needs an answered `type:question` issue or Azhar's instruction, and an entry in `src/content/docs/decisions/log.md`.
- `reference/` is frozen. Never edit it.
- Agent rules are in `agents/rules/`, skills in `agents/skills/<name>/SKILL.md` (frontmatter `name` and `description`, used by both Claude Code and Cursor), GitHub templates in `agents/github/`. Consuming repositories link or copy these with their `scripts/sync-agent-files.sh`; keep paths stable.
- Run `npm run check` before pushing.
