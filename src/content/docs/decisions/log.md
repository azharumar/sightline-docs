---
title: Decisions log
description: Every decision that shapes Sightline, newest first, with its reason.
---

The app specification states the current rule; this log says when and why it was decided. Add an entry for every answered `type:question` issue.

| Date | Decision | Reason | Where it applies |
|---|---|---|---|
| 2026-10-18 | Three repositories: `sightline-docs` (single source of truth, Astro Starlight on Netlify), `sightline-app` (Frappe app), `sightline-web` (Astro site on Netlify); app and web include docs as a submodule | One source of truth so agents and people never read contradicting copies | All |
| 2026-10-18 | All repositories work with both Claude Code and Cursor | Azhar builds with Cursor; Claude Code orchestrates | All |
| 2026-10-18 | Build tasks are GitHub issues (epics with sub-issues), worked by agents in a loop | Small, self-contained tasks keep tokens low and need no human hand-offs | `agents/workflow` |
| 2026-10-18 | Build on Frappe (MariaDB), one Vue 3 + frappe-ui app for every role at `/s/`, installable PWA, online only | A mature framework instead of building one; Frappe CRM shows custom apps on Frappe work | App spec |
| 2026-10-18 | Production site `app.sightline.zarnik.com` on the Frappe instance at `161.97.167.96` | Set up by Azhar | App spec `10-platform` |
| 2026-10-18 | Email code login; Resend SMTP from `no-reply@sightline.zarnik.com`; Cloudflare R2 for files; Frappe print formats for PDF | Fewer moving parts, branded sender, private files with expiring links | App spec |
| 2026-10-18 | Admin is a full platform administrator but has no access to hotel issues, including through view as | Issues are a feature for hotel teams only | App spec `01`, `04` |
| 2026-10-18 | Admin can correct a submitted audit with a reason; scores recalculated; no email to hotel teams | Fix mistakes without a full restart | App spec `06` |
| 2026-10-18 | Custom audits work like any other audit; items come from a plan Admin builds | Same lifecycle, no hidden templates | App spec `03`, `06` |
| 2026-10-18 | Removed: hotel comparison and ranking, all reminder emails, offline capture | Azhar's review | App spec `01` |
| 2026-10-18 | The site runs only the Sightline app; the DocType is named Issue | No other Frappe apps will be installed | App spec `03` |
| 2026-10-05 | Scores belong to audits; no hotel or hotel group score | A hotel takes several unrelated audit templates | App spec `01`, `08` |
| 2026-10-05 | Blueprint R2: hotel groups, audit items and results, Sections and Sub-sections, no departments, no Department Head | Azhar's revision R2 | App spec `01` |
