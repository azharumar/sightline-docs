---
name: next-task
description: Build exactly one GitHub issue end to end. Branch, implement, test, open a pull request that closes the issue, and merge on green unless it needs human review. Use with an issue number ("/next-task 12"), or with no number to take the first ready issue.
---

# next-task

Rules: `docs/agents/rules/core.md` plus the repository's own rules file (`docs/agents/rules/app.md` in sightline-app). Workflow: `docs/src/content/docs/agents/workflow.md`. Use `gh` if available, otherwise your environment's GitHub tools.

1. **Pick.** With a number, use that issue. Without, take the first open `status:ready` issue without `needs-human` whose dependencies are closed. If it is not ready (dependency open, `needs-human`), stop and say why.
2. **Claim.** Replace its status label with `status:in-progress` and comment "Started by <agent>".
3. **Read only what is needed:** the issue, the two rules files, and the spec sections the issue lists. Open only the files it lists, plus what those files import. If something is unclear, run `ask-question`, then continue with the default it proposes.
4. **Branch** from the latest `main`: `issue-<number>-<short-slug>`. Make the change in small commits and push after each.
5. **Check:** run the repository's checks (in sightline-app: ruff check, ruff format check, and the tests for what you changed). Fix until clean. Re-read your diff as a reviewer would.
6. **Pull request:** title = issue title; body from `.github/pull_request_template.md` with `Closes #<number>`; label the issue `status:in-review`.
7. **Merge decision:**
   - If the diff touches access, auth, view as, files, the allow list or security tests, or the issue has `needs-human`: add the `security` label to the pull request and stop here.
   - Otherwise wait for the `ci` check on the latest commit and squash-merge when it has succeeded (`gh pr checks --watch`, then `gh pr merge --squash`). Never merge on a red or pending check. GitHub Free has no auto-merge for private repositories.
8. **If CI fails:** read the failing check's log, fix, push. After two failed rounds on the same failure: label the issue `status:blocked`, comment the failing check and your diagnosis, and stop.
9. **Report** in at most 5 lines: issue, pull request, result, open points.
