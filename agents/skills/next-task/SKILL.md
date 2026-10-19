---
name: next-task
description: Build exactly one GitHub issue end to end. Branch, implement, test, open a pull request that closes the issue, and merge on green, or hand security pull requests to an independent review agent. Use with an issue number ("/next-task 12"), or with no number to take the first ready issue.
---

# next-task

Rules: `docs/agents/rules/core.md` plus the repository's own rules file (`docs/agents/rules/app.md` in sightline-app). Workflow: `docs/src/content/docs/agents/workflow.md`. Use `gh` if available, otherwise your environment's GitHub tools.

1. **Pick.** With a number, use that issue. Without, take the first open `status:ready` task, spike or bug whose dependencies are closed (a dependency on a gate or question issue counts as met). If a task dependency is still open, stop and say why. If you were told to fix review findings on an existing pull request, check out its branch, fix each finding, and go to step 5.
2. **Claim.** Replace its status label with `status:in-progress` and comment "Started by <agent>".
3. **Read only what is needed:** the issue, the two rules files, and the spec sections the issue lists. Open only the files it lists, plus what those files import. If something is unclear, run `ask-question`, then continue with the default it proposes.
4. **Branch** from the latest `main`: `issue-<number>-<short-slug>`. Make the change in small commits and push after each.
5. **Check:** run the repository's checks locally (the "Checks before every push" list in its rules file, plus `scripts/sync-agent-files.sh --check`). Fix until clean. Re-read your diff as a reviewer would.
6. **Pull request:** title = issue title; body from `.github/pull_request_template.md` with `Closes #<number>`; label the issue `status:in-review`.
7. **Merge decision:**
   - If the diff touches access, auth, view as, files, the allow list or security tests: add the `security` label to the pull request, report "needs security review" and stop. The orchestrator hands it to an independent `review-pr` agent, which merges it.
   - Otherwise squash-merge it yourself (`gh pr merge --squash --delete-branch`). There is no CI and no required check; the local checks in step 5 are the gate.
8. **If a check keeps failing:** after two failed rounds on the same failure, label the issue `status:blocked`, comment the failing check and your diagnosis, and stop.
9. **Report** in at most 5 lines: issue, pull request, result, open points.
