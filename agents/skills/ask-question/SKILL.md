---
name: ask-question
description: Record something only Azhar can decide as a GitHub question issue with a proposed default, then continue working with that default. Never waits for the answer. Use whenever the spec is unclear, contradicts itself, or does not cover a case.
---

# ask-question

1. Search open `type:question` issues first; if the same question exists, add your context as a comment and use its default.
2. Otherwise create an issue with the question template: one clear question; context (which issue, which spec section, why it matters); proposed default (what you will build, and how hard it is to change later). Labels `type:question`, `needs-human`.
3. Continue your task with the default and mention the question number in your pull request. If the default would need a migration to change later (data model, permissions), choose the most conservative option (fewest permissions, easiest to migrate) and say in the question what a different answer would cost. Never block a task on a question.
