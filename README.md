# sightline-docs

The single source of truth for Sightline: specification, design system, decisions, rules and skills for AI agents. Published with Astro Starlight on Netlify.

| Path | Contents |
|---|---|
| `src/content/docs/spec/app/` | The Frappe app specification (start with `00-readme.md`) |
| `src/content/docs/spec/blueprint/` | Business context and the website specification |
| `src/content/docs/design/` | Design system |
| `src/content/docs/decisions/` | Decisions log |
| `src/content/docs/agents/` | Build workflow and GitHub setup for agents |
| `agents/rules/` | Rules loaded by Claude Code and Cursor in every repository |
| `agents/skills/` | Skills and commands (build-loop, next-task, plan-epic, ask-question, record-decision, review-pr) |
| `agents/github/` | Issue and pull request templates, label script |
| `reference/` | Frozen material from the old build (designs, tokens, emails, seeds) |

## Use in another repository

```bash
git submodule add https://github.com/azharumar/sightline-docs docs
docs/agents/sync-agent-files.sh        # links skills and copies GitHub templates
```

## Develop

```bash
npm install
npm run dev      # http://localhost:4321
npm run check    # checks and production build
```

Netlify: build command `npm run build`, publish directory `dist` (already in `netlify.toml`).
