---
title: GitHub setup for the build loop
description: Labels and project fields, set once per repository.
sidebar:
  order: 2
---

## Labels

Run `docs/agents/github/setup-labels.sh <owner/repo>` once (needs the GitHub CLI signed in). It creates or updates:

| Label | Meaning |
|---|---|
| `type:epic`, `type:task`, `type:spike`, `type:question`, `type:bug` | Kind of issue |
| `status:ready`, `status:in-progress`, `status:in-review`, `status:blocked` | Where the issue is |
| `needs-human` | For Azhar's answer or final review; never blocks the loop (questions, gates) |
| `gate` | A review gate from the build plan |
| `security` | Touches access, auth, view as, files or security tests; an independent review agent merges it |
| `area:backend`, `area:frontend`, `area:infra`, `area:docs`, `area:tests` | Part of the system |
| `size:s`, `size:m` | About 30 minutes, about one hour |
| `epic:E0` to `epic:E13` | Which epic of the build plan |

## GitHub Project

Create one Project, "Sightline build", linked to `sightline-app` (and later `sightline-web`), with a board view grouped by Status. Fields: Status (Backlog, Ready, In progress, In review, Blocked, Needs human, Done), Epic, Size. Add the built-in workflow "Item added to project → Backlog" and "Item closed → Done". Labels stay the source of truth for agents; the Project is the view for people.

## No CI, no branch protection, no secrets

By Azhar's decision (2026-10-18), the repositories have no GitHub Actions workflows, no branch protection and no repository secrets. Nothing in GitHub blocks or gates a merge. The rules are kept by the agents:

- Never push to `main`; always a branch and a pull request.
- Run the repository's checks locally before every push, including `scripts/sync-agent-files.sh --check` in `sightline-app` and `sightline-web`.
- Merge your own pull request (squash) once the checks pass. A pull request labelled `security` is merged only by an independent `review-pr` agent.
- Never add a workflow file, a required check or a repository secret.

Issues, sub-issues, labels and Projects are free on GitHub Free and are all the loop needs.

## Access for agents

- Cursor: connect GitHub in Cursor settings; agents need access to `sightline-app`, `sightline-web` and `sightline-docs` (the submodule).
- Claude Code: the GitHub CLI or the GitHub connector with access to the same repositories.
- Netlify reads the private submodule when it builds `sightline-web`. If that build fails at the submodule step, give the Netlify GitHub app access to `sightline-docs` (or add the site's deploy key to `sightline-docs`, read only). This is a one-time Netlify setting, not a GitHub secret.
