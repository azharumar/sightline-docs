---
title: How this repository works
description: One source of truth for every Sightline repository, read by people and by AI agents.
---

## One source of truth

Everything that says what Sightline is or how it is built lives here, once:

| What | Where (in this repository) |
|---|---|
| Product rules and the app specification | `src/content/docs/spec/app/` |
| Business context and the website specification | `src/content/docs/spec/blueprint/` |
| Design system | `src/content/docs/design/` and `reference/design-tokens/` |
| Decisions and their reasons | `src/content/docs/decisions/` |
| Rules for AI agents | `agents/rules/` |
| Skills (repeatable agent procedures) | `agents/skills/` |
| GitHub issue and pull request templates, labels | `agents/github/` |
| Frozen material from the old build | `reference/` |

Nothing above is copied into another repository by hand. `sightline-app` and `sightline-web` include this repository as a git submodule at `docs/`, pinned to a commit, and their agent files only point here.

## How the other repositories use it

```
sightline-app/                     sightline-web/
├── docs/  ──── submodule ────┐    ├── docs/  ──── submodule ──┐
├── AGENTS.md (pointers)      │    ├── AGENTS.md (pointers)    │
├── CLAUDE.md (imports)       ├────┼── CLAUDE.md (imports)     ├──► sightline-docs (this repo)
├── .cursor/rules/*.mdc       │    ├── .cursor/rules/*.mdc     │
├── .claude/skills/* (links)  │    ├── .claude/skills/* (links)│
└── .cursor/commands/* (links)┘    └── .cursor/commands/*      ┘
```

- **Claude Code** reads `CLAUDE.md`, which imports `docs/agents/rules/*.md`, and finds skills in `.claude/skills/`, which are symbolic links into `docs/agents/skills/`.
- **Cursor** reads `AGENTS.md` and `.cursor/rules/*.mdc` (which reference `docs/agents/rules/*.md`), and finds commands in `.cursor/commands/`, which are symbolic links to the same skill files.
- `scripts/sync-agent-files.sh` in each repository regenerates the links and copies the GitHub templates from `docs/agents/github/`; `--check` reports drift and is part of the local checks.

## Changing anything

1. Change it here, in one place, through a pull request.
2. Record the reason in the Decisions log when it is a decision.
3. In the consuming repository, move the submodule to the new commit (`git submodule update --remote docs`) in the pull request that needs the change.

If two pages ever disagree, the order is: app specification, then decisions log, then everything else. Fix the losing page in the same pull request that finds the conflict.

## Publishing

Astro Starlight, deployed by Netlify from `main` (`netlify.toml`). `npm run check` validates frontmatter and copy rules and builds the site.
