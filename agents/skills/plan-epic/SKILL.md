---
name: plan-epic
description: Turn one epic of the build plan into small GitHub sub-issues (about one hour each) with goals, spec sections, files, done-when lists, tests and dependencies. Use when an epic has no task issues yet, or when an issue is too big to build in one go.
---

# plan-epic

Source: `docs/src/content/docs/spec/app/11-build-plan.md` (the epic's table) and the spec sections each task needs.

1. Find or create the epic issue: title "E<n>. <epic name>", labels `type:epic`, `epic:E<n>`, body = the epic's purpose in two lines and its gate, if any.
2. For each row of the epic's table, decide if it fits in about one hour and one pull request. If not, split it into parts that each leave the app working and tested.
3. Create one issue per part with the task template (`.github/ISSUE_TEMPLATE/task.yml` fields): Goal, Spec sections (exact file and heading), Files it may touch, Done when (checklist), Tests, Depends on. Title: "E<n>-<nn> <short imperative title>". Labels: `type:task` or `type:spike`, `epic:E<n>`, one `area:*`, `size:s` or `size:m`.
4. Add each issue as a sub-issue of the epic.
5. If the epic ends in a gate, create a gate issue "Gate <x>: <what Azhar checks>" with labels `gate`, `needs-human`, `epic:E<n>`, listing exactly what to check and how, depending on the epic's last tasks.
6. Label the tasks with no open dependencies `status:ready`.
7. Report: epic number, the list of created issues with their dependencies, which are ready.

Keep each issue self-contained: an agent must be able to build it from the issue, the rules and the named sections alone.
