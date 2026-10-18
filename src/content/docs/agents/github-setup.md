---
title: GitHub setup for the build loop
description: Labels, project fields and branch protection, set once per repository.
sidebar:
  order: 2
---

## Labels

Run `docs/agents/github/setup-labels.sh <owner/repo>` once (needs the GitHub CLI signed in). It creates or updates:

| Label | Meaning |
|---|---|
| `type:epic`, `type:task`, `type:spike`, `type:question`, `type:bug` | Kind of issue |
| `status:ready`, `status:in-progress`, `status:in-review`, `status:blocked` | Where the issue is |
| `needs-human` | Only Azhar can move it (questions, gates) |
| `gate` | A review gate from the build plan |
| `security` | Touches access, auth, view as, files or security tests; human review before merge |
| `area:backend`, `area:frontend`, `area:infra`, `area:docs`, `area:tests` | Part of the system |
| `size:s`, `size:m` | About 30 minutes, about one hour |
| `epic:E0` to `epic:E13` | Which epic of the build plan |

## GitHub Project

Create one Project, "Sightline build", linked to `sightline-app` (and later `sightline-web`), with a board view grouped by Status. Fields: Status (Backlog, Ready, In progress, In review, Blocked, Needs human, Done), Epic, Size. Add the built-in workflow "Item added to project → Backlog" and "Item closed → Done". Labels stay the source of truth for agents; the Project is the view for people.

## Branch protection on `main` (not available on GitHub Free)

The repositories are private on GitHub Free (decision of 2026-10-18), and GitHub Free offers neither branch protection rules nor auto-merge for private repositories. So the rules are enforced by the agents themselves:

- Never push to `main`; always a branch and a pull request.
- Merge only after reading the pull request's check runs and seeing `ci` completed with success on the latest commit. Use squash merge.
- Never merge a pull request labelled `security` or `needs-human`.

If the account moves to GitHub Pro or Team later: require a pull request and the `ci` check on `main`, allow squash merge and auto-merge, and agents will use auto-merge instead of waiting.

## GitHub Free limits that matter

- Actions: 2,000 minutes a month for private repositories. CI jobs are kept short; the optional agent loop workflow uses minutes too.
- Issues, sub-issues, labels and Projects are free and are all the loop needs.

## Access for agents

- Cursor: connect GitHub in Cursor settings; background agents need access to both `sightline-app` and `sightline-docs` (the submodule).
- Claude Code: the GitHub CLI or the GitHub connector with access to both repositories.
- `sightline-docs` is private, so CI in `sightline-app` and `sightline-web` needs the secret `DOCS_READ_TOKEN` (a fine-grained token with Contents: read on `sightline-docs`) to check out the submodule.
- Netlify must also read the private submodule when it builds `sightline-web`: add the Netlify site's deploy key (Netlify: Site configuration, Build and deploy, Deploy key) to `sightline-docs` as a read-only deploy key, or give the Netlify GitHub app access to `sightline-docs`.
