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

## Branch protection on `main`

- Require a pull request before merging, with the `ci` check passing.
- Allow squash merging and auto-merge.
- No required human approval (agents merge on green), except that pull requests labelled `security` are left for review by rule.

## Access for agents

- Cursor: connect GitHub in Cursor settings; background agents need access to both `sightline-app` and `sightline-docs` (the submodule).
- Claude Code: the GitHub CLI or the GitHub connector with access to both repositories.
- If `sightline-docs` is private, CI needs a token that can read it to check out the submodule (secret `DOCS_READ_TOKEN`, a fine-grained token with read access to `sightline-docs`).
