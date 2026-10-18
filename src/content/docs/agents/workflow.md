---
title: Build workflow for AI agents
description: How Claude Code and Cursor agents pick, build, check and merge GitHub issues in a loop without hand-offs.
sidebar:
  order: 1
---

The build runs as a loop over GitHub issues. Each issue is small and self-contained, so an agent needs only the issue, the rules and the spec sections it names. A human is needed only at gates, for `type:question` answers, and to review `security` pull requests.

## 1. Issues

| Kind | Label | What it is |
|---|---|---|
| Epic | `type:epic` | One epic from the build plan (for example E0). Holds its tasks as GitHub sub-issues. Never built directly |
| Task | `type:task` | About one hour of work, one pull request |
| Spike | `type:spike` | A time-boxed experiment that answers a question with evidence (Epic 0) |
| Question | `type:question` + `needs-human` | Something only Azhar can decide, with a proposed default |
| Bug | `type:bug` | A defect found after merge |
| Gate | `gate` + `needs-human` | A review gate from the build plan. Tasks after it depend on it |

Every task or spike body follows the template in `agents/github/ISSUE_TEMPLATE/task.yml`:

- **Goal:** one or two sentences.
- **Spec sections:** exact files and headings, for example `spec/app/04-permissions.md#2-the-access-module`.
- **Files it may touch:** paths or folders.
- **Done when:** a checklist a reviewer can tick.
- **Tests:** what proves it.
- **Depends on:** issue numbers, or "none".

**Labels line.** An issue body may start with `Labels: ` followed by label names in backticks (used when issues were created before the labels existed). Before working on such an issue, an agent adds any of those labels the issue does not have yet, creating missing ones with `docs/agents/github/setup-labels.sh`.

## 2. Status

Status is a label, mirrored in the GitHub Project's Status field: no label (backlog) → `status:ready` → `status:in-progress` → `status:in-review` → closed. `status:blocked` carries a comment saying why. Agents change labels; nobody edits status in files.

An issue is **ready** when it is open, has `status:ready`, has no `needs-human` label, and every issue in "Depends on" is closed.

## 3. The loop

**`build-loop`** (orchestrator, `agents/skills/build-loop/SKILL.md`):

1. List ready issues in the repository, lowest epic first, then lowest number.
2. If none are ready, promote backlog tasks of the current epic whose dependencies are closed to `status:ready`. If still none, stop and report what is blocked and why.
3. Hand the first ready issue to a fresh sub-agent running **`next-task`** with only the issue number. Independent issues (no shared files, no dependency between them) may run in parallel, at most 3.
4. Record the outcome (merged, blocked, waiting for security review) and go back to step 1.
5. Stop when an epic's gate issue is the only thing left, when the same issue fails twice, or after the run limit you were given.

**`next-task`** (one issue, `agents/skills/next-task/SKILL.md`):

1. Label `status:in-progress`, assign yourself if possible, comment "Started".
2. Read the issue, `docs/agents/rules/core.md`, the repository's rules file, and only the listed spec sections.
3. Branch `issue-<number>-<slug>` from the latest `main`. Build in small commits; push after each.
4. Run the repository's checks locally (the "Checks before every push" list in its rules file). Fix until clean.
5. Open a pull request: title = issue title, body from the template, `Closes #<number>`. Label `status:in-review` on the issue.
6. Merge: if the change touches a `security` path or the issue has `needs-human`, label the pull request `security` and stop. Otherwise squash-merge it yourself once the local checks pass on the latest commit. There is no CI, no branch protection and no required check to wait for.
7. If the checks keep failing: after two failed rounds on the same failure, label the issue `status:blocked`, comment the failure, and stop.
8. Report in at most 5 lines: issue, pull request, result, anything left open.

## 4. Questions and decisions

- An agent that hits something unclear does not stop the loop: it opens a `type:question` issue with a proposed default (`ask-question` skill), builds the default if it is safe to change later, notes the question number in its pull request, and continues.
- When Azhar answers, an agent runs `record-decision`: updates the specification in `sightline-docs`, adds a Decisions log entry, moves the submodule in the consuming repository, and closes the question.

## 5. Planning (rolling waves)

Only the current epic has task issues. When an epic's last task is merged, `plan-epic` creates the next epic's sub-issues from the build plan (`spec/app/11-build-plan.md`), splitting anything larger than an hour, with dependencies, and labels the first ones ready.

## 6. Running the loop

| Tool | How |
|---|---|
| Cursor | Open an Agent chat in the repository (local or background agent) and run the `/build-loop` command. With auto-run enabled for terminal commands, it loops without approvals while the session is open |
| Claude Code (terminal or web) | Run `/build-loop` in the repository. Sub-agents per issue keep the main context small. `.claude/settings.json` pre-approves the routine commands |

## 7. Guardrails

- The repositories have no GitHub Actions workflows, no branch protection and no repository secrets, by Azhar's decision. Agents never push to `main` directly; they merge their own pull requests after the local checks pass. Never add a workflow, a required check or a secret.
- Agents never merge `security` or `needs-human` pull requests, never close gate issues, never close questions without an answer from Azhar.
- Agents never change a check to make it pass, and never skip or delete tests.
