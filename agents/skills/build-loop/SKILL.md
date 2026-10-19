---
name: build-loop
description: Orchestrate the build. Repeatedly take the next ready GitHub issue and hand it to a fresh sub-agent running next-task, until nothing is buildable or the run limit is hit. Never waits for a person. Use when asked to "run the build", "keep going", "work the backlog" or "/build-loop".
---

# build-loop

Follow `docs/src/content/docs/agents/workflow.md` (in `sightline-docs` itself: `src/content/docs/agents/workflow.md`). Use the GitHub CLI (`gh`) if available, otherwise your environment's GitHub tools.

Argument (optional): a run limit (number of issues, default 10) or an epic label such as `epic:E0`.

1. Ensure the `docs/` submodule is present: if `docs/` is empty, run `git submodule update --init --recursive` (only then: it resets a bumped pointer).
2. List open issues labelled `status:ready`, in the given epic if one was named. Skip `type:question` and `gate` issues. Drop any whose "Depends on" issues are still open, but treat a dependency on a gate or question issue as met. Sort by epic, then number.
3. If the list is empty: find open `type:task`, `type:spike` or `type:bug` issues in the current epic with no status label whose dependencies are met (as in step 2), label them `status:ready`, and list again. If the current epic has no open tasks left, start a sub-agent with "Run the plan-epic skill for the next epic in this repository.", then list again. If still empty, go to step 8.
4. Take the first issue. Start a sub-agent (Claude Code: the Agent tool; Cursor: a new agent or background agent) with exactly this instruction: "Run the next-task skill for issue #N in this repository." Give it nothing else. You may run up to 3 sub-agents in parallel when their issues share no files and do not depend on each other.
5. When a sub-agent finishes, keep only: issue number, pull request number, result (merged, needs security review, blocked, failed). Do not read its diff or logs.
6. **Security review.** For each pull request with result "needs security review", start a fresh sub-agent (never the one that built it) with exactly: "Run the review-pr skill for pull request #P in this repository." It merges on "No findings". If it reports findings, start a fresh sub-agent with "Run the next-task skill for issue #N in this repository; fix the review findings on pull request #P.", then review again. After two review rounds with findings, label the issue `status:blocked` and move on.
7. **Gates.** When every task an open gate issue depends on is closed, start a sub-agent with "Run the check-gate steps of the build-loop skill for gate issue #G." (below). Do not wait for it: the loop has already moved on.
8. Repeat from step 2 until the run limit is reached or nothing is buildable. Then report in this format, nothing more:

```
Run: <n> issues
Merged: #.., #.. (security-reviewed: #..)
Blocked: #.. (one line each, why)
Questions opened (built on defaults): #..
Gates checked: #.. (passed / findings filed as #..)
Next ready: #.. or "none: <why>"
```

## check-gate steps

1. Read the gate issue and its checklist.
2. Check every item an agent can verify (pages load, tests pass, PDFs render, screenshots with Playwright at phone and laptop width). Comment each item with its evidence: pass, or fail with what is wrong.
3. For every failure, open a `type:bug` issue labelled `status:ready` with the gate's epic label.
4. Leave the gate issue open with `needs-human` for Azhar's final review after the build. Never close it yourself.

Never build an issue yourself in the orchestrator, never let the agent that built a pull request review it, never close a gate or question issue, and never stop to ask a person.
