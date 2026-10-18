---
title: "11. Build plan, agent rules and gates"
sidebar:
  order: 11
---

Repository: `azharumar/sightline-app`, holding the Frappe app `sightline` at its root. This specification reaches it through the `docs/` submodule (`azharumar/sightline-docs`).

## 1. Agent rules

The rules for agents live in `sightline-docs/agents/rules/` (`core.md` for every repository, `app.md` for this app) and the task loop in `agents/workflow`. The points below are the app-specific essentials; `agents/rules/app.md` is the version agents load.

- This specification is the source of truth. Gaps become a `type:question` issue with a default; build the default and continue.
- Follow Frappe conventions: DocTypes as JSON plus controllers, fixtures for configuration, patches for data changes, `bench migrate` for every schema change. Never edit the database by hand on a shared site; if a change is made in Desk on a dev site, export it to the repo before the task ends (the fixtures check fails otherwise).
- Never modify Frappe itself. No forks, no monkey patches. If Frappe lacks something, use a hook, an override listed in `hooks.py`, or a Sightline method.
- Every hotel data read goes through `sightline.core.access` (hooks or `access.query_condition`). Every write goes through a service that calls `access.require`. No role names in code outside the access module and tests.
- Every new whitelisted method is added to the allow list in the same pull request, with a security test.
- Screens only in the Sightline app (`frontend/`); no Desk screens for Sightline users. Design tokens from zarnik-ds only; copy rules apply.
- One task, one branch, one pull request, about one hour of work. Commit and push after every working step. Tests in every pull request. `scripts/check.sh` passes before pushing; CI green before merge.
- Diffs touching `core/access.py`, `core/allow_list.py`, auth, view as, files or the security suite are read in full by the orchestrating session or Azhar before merge.
- Secrets only in site config and the server's secret store; never commit or ask for production values.
- Stop at every gate and tell Azhar exactly what to check.

**Pipeline:** one GitHub issue per task in `azharumar/sightline-app` (goal, spec sections, files it may touch, done-when list, tests), grouped under an epic issue as sub-issues → `status:ready` → an agent takes it (`status:in-progress`), builds on branch `issue-<number>-<slug>`, runs the checks, opens a pull request that closes the issue → merges when CI is green and no human label applies → takes the next ready issue. Two failed rounds on the same failure: `status:blocked` with the reason. Status lives on the issues and the GitHub Project, never in files. Full loop: `agents/workflow`.

## 2. Epics and tasks

### E0. Foundation and Frappe spikes

| ID | Task |
|---|---|
| E0-01 | Boilerplate app (done in the setup pull request): pyproject, hooks, modules, agent files, docs submodule; then a dev bench with the production Frappe version and MariaDB (frappe_docker devcontainer) |
| E0-02 | CI with a disposable bench that installs the app on a fresh site and runs tests; pytest for pure modules; copy lint; `scripts/check.sh` |
| E0-03 | Vue app scaffold in `frontend/` (frappe-ui, Vite, Tailwind), built into `public/frontend`, served by the `www` page |
| E0-04 | **Spike: app mount.** Serve the app at `/s/` with route rules and `/` redirecting to it; deep links and reloads work; redirect `/login` and `/app` for Sightline roles |
| E0-05 | **Spike: Website Users.** A Website User with a `desk_access = 0` role reads and writes a test DocType through `frappe.get_list`, `get_doc`, comments and the resource API, with `has_permission` and `permission_query_conditions` applied; confirm `safe_eval_globals` works in a Workflow condition |
| E0-06 | **Spike: per-hotel roles.** Hotel Member, the access module skeleton and a Issue DocType: the three-membership person gets Hotel Manager rights at A1 and Staff rights at A3 across list, get, update, report view and link search. Pass: tests green and the access code stays under about 200 lines |
| E0-07 | **Spike: PWA and PDF.** Manifest and service worker served from the root, install on Android Chrome and iPhone Safari; a print format with SVG and zarnik-ds fonts renders to PDF in the image |

The spikes E0-04 to E0-07 must pass before E1 starts. Any failure is written up as a `type:question` issue with the fallback (wrap a refused API, change approach) for Azhar.

### E1. Design system on frappe-ui (Gate 1)

| ID | Task |
|---|---|
| E1-01 | zarnik-ds tokens (pin `99988d1`) to a Tailwind theme for frappe-ui, light and dark, with a test that the values match the pin |
| E1-02 | Shared components the approved design needs and frappe-ui lacks (score pill, band pill, status pill, list row, page header, empty state, banners) |
| E1-03 | Shell: sidebar, phone bottom bar, top bar, hotel switcher, user menu, view as and offline banners (static data) |
| E1-04 | `/design` page in the app (Admin only in production) |

**Gate 1:** Azhar and Vijayalakshmi confirm the `/design` page on staging matches the approved design, light and dark.

### E2. Infrastructure (alongside E0 and E1)

| ID | Task |
|---|---|
| E2-01 | Custom image build (frappe_docker `images/custom`, `apps.json`), GHCR |
| E2-02 | Dokploy staging stack, site, HTTPS, scheduler on |
| E2-03 | Dokploy production stack from the `production` branch |
| E2-04 | R2 buckets wired in site config; GlitchTip projects and alerts; uptime monitor |
| E2-05 | Backups to the second server, R2 sync, restore script tested in CI |

### E3. Data model and access

| ID | Task |
|---|---|
| E3-01 | Roles, User Custom Fields, user kinds, last Admin guard |
| E3-02 | Hotel Group, Hotel, Hotel Member, Hotel Group Member with their rules |
| E3-03 | Masters DocTypes and fixed rows |
| E3-04 | Audit template DocTypes with versions and snapshot |
| E3-05 | Audit DocTypes (schedule, audit, revision, sub-section, section score, result, evidence, note, report) with controller rules and indexes |
| E3-06 | Issue DocType and the Issue workflow (with `state_category`) |
| E3-07 | Access module complete (`ACCESS_MATRIX`, hooks for every hotel data DocType, field rights, caching) |
| E3-08 | API allow list and the view as guard |
| E3-09 | Security suite with the fixture world and the allow list completeness test |
| E3-10 | Sample data loader for staging |

### E4. App views and the UI spike (Gate 1b)

| ID | Task |
|---|---|
| E4-00 | **UI spike:** with the first ListView and FormView plus view overrides, layout variants and phone patterns, build Staff "My issues" and the issue page, the Hotel Manager dashboard, and the audit report page, on sample data, on a phone. Record taps (Staff changes an issue's state in 2 taps) |
| E4-01 | `api.meta.get` and `api.records.*` (metadata with field rights, generic list, get, create, update, transition) |
| E4-02 | ListView (list shell, filters, saved views, Load more, laptop columns) |
| E4-03 | FormView (layout, field controls, field rights, save with timestamp check, transitions, timeline, comments, attachments) |
| E4-04 | View overrides per role and layout variants per role |
| E4-05 | Phone patterns as defaults |
| E4-06 | Computed fields in lists |
| E4-07 | Empty states and first-run hints |
| E4-08 | WizardView |
| E4-09 | ReportView (columns, group by, export where allowed), CalendarView, KanbanView |

**Gate 1b:** Azhar and Vijayalakshmi use the three spike screens on a phone. Pass: they read as Sightline, not as ERP software, and the tap targets are met. If not, focused pages become the default for client roles before E4 continues.

### E5. Login, users and access

| ID | Task |
|---|---|
| E5-01 | Email code login (`api.auth`), password login closed, sign-in screens |
| E5-02 | Invites (Admin and Auditor, Group Head, Hotel Manager and Staff; Hotel Manager invites Staff), accept and sign in |
| E5-03 | Access expiry, renew, disable, the expiry job and email |
| E5-04 | Hotel groups and hotels screens (wizard for a new hotel group), ending a hotel group |
| E5-05 | Users, auditors and people screens; Hotel Manager removes Staff |
| E5-06 | Hotel switcher, last hotel, My hotels |
| E5-07 | View as with reason, banner, read-only guard, Stop |
| E5-08 | Profile, email frequency, signed-in devices, Install app |

### E6. Masters and templates (Gate 2)

| ID | Task |
|---|---|
| E6-01 | Masters screens |
| E6-02 | Audit items with wording revision and reason; import from CSV or Excel (Frappe Data Import is Desk only, so a Sightline import method with dry run) |
| E6-03 | Templates: drafts, sub-sections and items, disable and enable, visibility, publish with snapshot, discard |
| E6-04 | Template builder page |
| E6-05 | Seed audit templates from the old repo (`deploy/seeds/`, blueprint p2-09), items Draft |

**Gate 2:** Azhar approves every seed audit template item on staging.

### E7. Audits (Gate 3, with E8)

| ID | Task |
|---|---|
| E7-01 | Schedule (standard and custom, wizard), assign, reassign, cancel, emails |
| E7-02 | Calendar, unassigned and overdue-to-start lists, recurring schedules and job |
| E7-03 | Start and freeze |
| E7-04 | Capture page: item list, drawer, score buttons, saving with timestamp check, offline banner |
| E7-05 | Evidence: photos (compression, R2 upload), documents, sample checks; earlier results |
| E7-06 | Add item, notepad, comments |
| E7-07 | Review and submit (checks, scores, release, assignments end, PDFs queued) |
| E7-08 | Restart with reason |
| E7-09 | Correction with reason and recalculation |
| E7-10 | Audit page (score card, results by sub-section, revisions, corrections), My audits |

### E8. Scoring (after E7-03)

| ID | Task |
|---|---|
| E8-01 | Scoring engine with `cases.json` and hypothesis properties |
| E8-02 | Change from last audit for audit, Section and sub-section |

**Gate 3:** a full audit captured on Azhar's phone in the installed app, with photos, submitted, scores correct, then corrected by Admin.

### E9. Issues

| ID | Task |
|---|---|
| E9-01 | Issue methods (create, update, assign, transitions), list rows, kanban by state |
| E9-02 | Staff, Hotel Manager and Group Head journeys; Auditors and Admin see nothing, including through view as |

### E10. Email and notifications

| ID | Task |
|---|---|
| E10-01 | Email Account (Resend SMTP; Mailpit in dev), email log screen with retry |
| E10-02 | Notifications and Email Templates as fixtures, recipients by hotel role, active readers only |
| E10-03 | Daily digest through Notification Log |
| E10-04 | Resend delivery webhook, bounce flag |

### E11. Reports, history and dashboards (Gate 4)

| ID | Task |
|---|---|
| E11-01 | Report data builder (one function for the page and the PDF) |
| E11-02 | Report page for phone and laptop |
| E11-03 | Full and Summary print formats with SVG charts and embedded photos; `render_pdf`; Audit Report rows; downloads |
| E11-04 | Score history methods and page |
| E11-05 | Hotel, hotel group and My hotels dashboards (no group score, no comparison) |

**Gate 4:** Azhar and Vijayalakshmi go through every screen on phone and laptop (view as each role) in the installed app, and approve the full and summary PDF as client-ready.

### E12. Hardening and launch (Gate 5)

| ID | Task |
|---|---|
| E12-01 | End-to-end tests for every role's main journey |
| E12-02 | Low-end Android on slow 4G: capture under 10 seconds per item |
| E12-03 | Load check: 1,000 hotels, 20,000 audits, 2 million results; lists under 500 ms at p95; indexes reviewed |
| E12-04 | Security review: allow list, permissions, files, headers, dependencies |
| E12-05 | Full restore drill |
| E12-06 | Pilot audit at one hotel with the hotel team working issues |
| E12-07 | Production launch |

**Gate 5:** pilot sign-off by Azhar.

### E13. Integrations (after launch)

| ID | Task |
|---|---|
| E13-01 | API keys for integration users (Frappe's per-user API key and secret) limited by the same access module |
| E13-02 | Webhooks through Frappe's Webhook DocType (HMAC signature) for audit submitted and issue events |
| E13-03 | MCP server over Sightline methods |

**Parallel work:** E2 alongside E0 and E1; E4 after E3-07; E5 and E6 alongside each other after E4-03; E8 and E9 alongside E7 after E7-03; E10 alongside E7; E11 after E8 and E10-02.

## 3. Gates

| Gate | After | Azhar checks |
|---|---|---|
| 0 | E0 spikes | Spike results: app mount at `/s/`, Website Users, per-hotel roles, PWA install and PDF |
| 1 | E1 | `/design` matches the approved design |
| 1b | E4-00 | Spike screens on a phone read as Sightline and meet tap targets |
| 2 | E6 | Every seed audit template item |
| 3 | E7, E8 | Full audit in the installed app on his phone, submitted and corrected |
| 4 | E11 | Every screen on phone and laptop; PDFs client-ready |
| 5 | E12 | Pilot sign-off |

## 4. What only Azhar can do

1. Done 2026-10-18: repositories `sightline-app`, `sightline-docs`, `sightline-web` created.
2. Done 2026-10-18 for production: `app.sightline.zarnik.com` points to the Frappe instance at `161.97.167.96` with HTTPS. Still to do: `staging.sightline.zarnik.com`.
2a. Install the app on the site after the boilerplate lands (app repository README), and create the GitHub Project and labels (`agents/github-setup` page).
3. Create the R2 buckets (`sightline-staging`, `sightline-production`), bucket-scoped tokens and CORS rules.
4. Create the Resend account, verify `sightline.zarnik.com` (SPF, DKIM, DMARC), create the API key and webhook signing secret, and enter the key in each site's Email Account.
5. Provide the second server for backups.
6. Put every secret in Dokploy and site config per environment.
7. Approve seed audit template items (Gate 2) and run the pilot (Gate 5).

## 5. Answered questions

| Question | Answer |
|---|---|
| Database | MariaDB |
| Frontend | Vue 3 with frappe-ui, one app for every role including Admin |
| Desk | Closed to Sightline users |
| Installable | PWA, online only, no app store |
| Hosting | Self-hosted at `app.sightline.zarnik.com` |
| Login | Email code, custom |
| Files | Cloudflare R2 |
| Staff and reports | Reports only for templates whose visibility lists Staff; no export |
| Next scheduled audit date for hotel teams | Never shown |
| Admin corrects a submitted audit | Yes, with a reason; scores recalculated; no email to hotel teams |
| Custom audits | Work like any other audit; items come from a plan Admin builds, not a template; Admin sets visibility |
| App path | `/s/`, with `/` redirecting to it |
| Admin and issues | Admin is a full platform administrator but has no access to hotel issues, not even through view as |
| Other Frappe apps on the site | None; the site runs only Sightline |
| Hotel comparison, reminders, offline | None |
| Ended hotel group data | Kept indefinitely; members lose access |

## 6. Still open (defaults are built until answered)

| Question | Default |
|---|---|
| Can Admin add Issue states from the app (a Workflow editor screen) at launch, or later? | Later; states are changed by a fixture update until then |
