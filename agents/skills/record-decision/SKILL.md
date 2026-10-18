---
name: record-decision
description: Write an answered question into the single source of truth. Update the specification in sightline-docs, add a Decisions log entry, move the docs submodule in the consuming repository, and close the question. Use when Azhar has answered a type:question issue.
---

# record-decision

1. Read the question issue and Azhar's answer. If the answer is ambiguous, ask in a comment and stop.
2. In `sightline-docs`: change the specification page that owns the rule (only one page should; if two pages state it, fix both in this pull request so they agree). Add a row to `src/content/docs/decisions/log.md` (date, decision, reason, where it applies). Open a pull request, run `npm run check`, merge when green.
3. In the consuming repository: move the submodule (`git submodule update --remote docs`), commit "Docs: <decision>", open a pull request that references the question, merge when green.
4. Comment on the question with both pull request links and close it. Remove `status:blocked` from any task that was waiting on it and label it `status:ready`.
