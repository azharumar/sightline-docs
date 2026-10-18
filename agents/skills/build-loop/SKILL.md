---
name: build-loop
description: Orchestrate the build. Repeatedly take the next ready GitHub issue and hand it to a fresh sub-agent running next-task, until nothing is ready, a gate is reached or the run limit is hit. Use when asked to "run the build", "keep going", "work the backlog" or "/build-loop".
---

# build-loop

Follow `docs/src/content/docs/agents/workflow.md` (in `sightline-docs` itself: `src/content/docs/agents/workflow.md`). Use the GitHub CLI (`gh`) if available, otherwise your environment's GitHub tools.

Argument (optional): a run limit (number of issues, default 10) or an epic label such as `epic:E0`.

1. Ensure the `docs/` submodule is present: `git submodule update --init --recursive`.
2. List open issues labelled `status:ready` without `needs-human`, in the given epic if one was named. Drop any whose "Depends on" issues are still open. Sort by epic, then number.
3. If the list is empty: find open `type:task` or `type:spike` issues in the current epic with no status label whose dependencies are all closed, label them `status:ready`, and list again. If still empty, go to step 7.
4. Take the first issue. Start a sub-agent (Claude Code: the Agent tool; Cursor: a new agent or background agent) with exactly this instruction: "Run the next-task skill for issue #N in this repository." Give it nothing else. You may run up to 3 sub-agents in parallel when their issues share no files and do not depend on each other.
5. When a sub-agent finishes, keep only: issue number, pull request number, result (merged, waiting for security review, blocked, failed). Do not read its diff or logs.
6. Repeat from step 2 until the run limit is reached.
7. Stop and report in this format, nothing more:

```
Run: <n> issues
Merged: #.., #..
Waiting for review (security): #..
Blocked: #.. (one line each, why)
Questions opened: #..
Next ready: #.. or "none: waiting on <gate or question>"
```

Never build an issue yourself in this skill, never merge `security` or `needs-human` pull requests, and never close a gate or question issue.
