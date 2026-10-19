---
name: review-pr
description: Review a pull request against its issue, the rules and the spec sections it names, and report only real problems. Use for pull requests labelled security, or when asked to review.
---

# review-pr

1. Read the pull request, its linked issue, the rules files and the issue's spec sections. Do not read unrelated code.
2. Check: every "Done when" item is met; tests cover the change and pass; no permission path bypasses `sightline.core.access`; no new whitelisted method missing from the allow list; no role names in code; copy rules; no secrets; no files outside "Files it may touch" without a reason.
3. Comment on the pull request with findings only, most serious first, each with file and line and a concrete fix. If there are none, say "No findings" and what you checked.
4. Only review a pull request you did not build. For a `security` pull request: if there are no findings and the repository's checks pass on the latest commit, squash-merge it (`gh pr merge --squash --delete-branch`). If there are findings, do not merge; report them so the orchestrator can send them back to `next-task`.
