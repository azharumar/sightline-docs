---
name: ask-question
description: Record something only Azhar can decide as a GitHub question issue with a proposed default, then continue working with that default. Use whenever the spec is unclear, contradicts itself, or does not cover a case.
---

# ask-question

1. Search open `type:question` issues first; if the same question exists, add your context as a comment and use its default.
2. Otherwise create an issue with the question template: one clear question; context (which issue, which spec section, why it matters); proposed default (what you will build, and how hard it is to change later). Labels `type:question`, `needs-human`.
3. If building the default is safe to change later, continue your task with it and mention the question number in your pull request. If it is not safe (data model, permissions, anything a later change would have to migrate), label your task `status:blocked` with a comment linking the question, and stop.
