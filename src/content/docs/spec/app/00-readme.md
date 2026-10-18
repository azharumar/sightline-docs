---
title: "00. Sightline on Frappe: build specification"
sidebar:
  order: 0
---

This section is the complete specification for building Zarnik Sightline as a **Frappe app** (`sightline`, repository `azharumar/sightline-app`), with one installable web app (PWA) for every role, built with Vue 3 and frappe-ui in the same way as Frappe CRM and Frappe Helpdesk. It is written for AI build agents. It lives in `azharumar/sightline-docs` at `src/content/docs/spec/app/`; the app repository includes this repository as the `docs/` submodule, so agents read it at `docs/src/content/docs/spec/app/`.

Sightline is a hotel audit app. Sightline auditors visit hotels, score audit items on a phone and submit audits. Hotel teams read the reports and track their own issues (a feature for hotels only; Sightline staff do not see them). Admin runs the masters, templates, hotels, users and scheduling.

## How to use this folder

| File | What it covers | Read it when |
|---|---|---|
| `00-README.md` | Decisions, glossary, copy rules, what Frappe gives and what we build | Always, first |
| `01-product-spec.md` | Every product rule (shared with the Django specification) | Before any feature task |
| `02-architecture.md` | Frappe stack, app layout, versions, libraries, request paths | Epic 0 and before adding a dependency |
| `03-doctypes.md` | Every DocType with fields, naming, child tables, indexes and integrity rules | Any DocType or patch task |
| `04-permissions.md` | Roles, DocPerms, permission levels, hotel membership, permission hooks, API allow list, view as, security tests | Anything that reads or writes data |
| `05-backend.md` | Whitelisted API methods, document events, hooks.py, background jobs, scheduler, workflows | Backend tasks |
| `06-audit-capture.md` | Scheduling, start, capture (online only), submit, restart, correction | Audit epic |
| `07-scoring.md` | Scoring rules, reference code, test cases | Scoring epic |
| `08-email-files-pdf.md` | Email through Resend, notifications and digest, R2 files, print formats and PDF | Email, files, reports |
| `09-frontend.md` | The Sightline app: Vue 3, frappe-ui, PWA, shell, shared views, focused pages, screens per role | Any UI task |
| `10-platform.md` | Hosting on Dokploy, environments, backups, monitoring, logging, security, testing and CI | Infrastructure and hardening |
| `11-build-plan.md` | Agent rules, epics and tasks, gates, setup checklist, open questions | Planning and before every task |

**Order of authority:** this specification; then the frozen reference material in `sightline-docs/reference/` (approved designs, tokens, email wording and seed item lists copied from the old repo at commit `10c17a3261b985c85f9c78dab18b0f44bf6b7e7f`); then Frappe's own documentation and the source code of Frappe CRM and Helpdesk for framework patterns. The old repository `azharumar/sightline` is history only and is never read for rules. Gaps become a GitHub issue labelled `type:question` in the repository where the work happens, with a proposed default; the agent builds the default and continues, and the answer is written back into this specification.

## Decisions made (2026-10-18)

| Topic | Decision |
|---|---|
| Platform | Frappe Framework, latest stable major version at the start of Epic 0 (pinned), as a custom app named `sightline` |
| Database | MariaDB (Frappe's primary database) |
| Frontend | One Vue 3 single-page app built with frappe-ui, Tailwind and Vite, inside the Frappe app (like Frappe CRM) |
| Who uses it | Every role, Admin included. Frappe Desk (`/app`) is closed to everyone except developer System Manager accounts used for emergencies and maintenance |
| Installable | Progressive web app: manifest, icons, service worker for the app shell, "Install app" in the user menu. Online only: no data is stored on the device |
| Hosting | Self-hosted at `app.sightline.zarnik.com` on Dokploy, with a separate staging site |
| Login | Email one-time code (custom endpoints on Frappe's session system), no passwords, invite only |
| Files | Cloudflare R2 through the S3 API, private, presigned links |
| Email | Resend SMTP from `no-reply@sightline.zarnik.com`, through Frappe's Email Account and Email Queue |
| PDF | Frappe print formats (Jinja), rendered by Frappe's PDF generator |
| Data | Fresh start; seeds and sample data by patches and commands; data kept indefinitely; ended hotel groups lose access, not data |
| Corrections | Admin corrects a submitted audit with a reason; scores recalculated; no email to hotel teams |
| Admin | A full platform administrator (masters, templates, hotels, users, audits, settings), except hotel issues, which belong only to hotel teams |
| Custom audits | Like any other audit; items come from a plan Admin builds instead of a template |
| App path | `/s/` on the site; `/` redirects there |
| Other apps | The site runs only Sightline; no ERPNext, CRM or Helpdesk |
| Removed | Hotel comparison and ranking, every reminder email, offline capture |
| Staff and reports | As the blueprint: Staff see reports only for audit templates whose visibility lists Staff; no export |

Why Frappe and not our own framework: `../django-rebuild/13-why-not-frappe.md` section 6. In short: a mature framework gives DocTypes, permissions, workflows, email, notifications, print formats, files, history, jobs and REST APIs from day one, and Frappe CRM and Helpdesk prove a fully custom app on top of it works.

## What Frappe gives and what we build

| Need | Frappe gives | We build |
|---|---|---|
| Data model, migrations, naming, child tables, submittable documents, singles, trees | DocTypes, `bench migrate`, naming series, `docstatus`, Single and tree DocTypes | DocType JSON files and controllers |
| Change history and comments | `track_changes` (Version), Comment, Activity, Deleted Document | Timeline component in the app |
| Roles, permission levels, record rules | Role, DocPerm, permlevel, if owner, User Permission, `has_permission` and `permission_query_conditions` hooks | Hotel membership model, per-hotel role checks, API allow list, security tests |
| Workflows | Workflow DocType (states, transitions, roles, conditions, allow edit) | Issue workflow; audit lifecycle in controllers |
| Email | Email Account, Email Queue with retries, Email Template, Notification, Notification Log | Templates, notification rules, daily digest job, delivery webhook |
| Jobs and schedules | `frappe.enqueue` on RQ queues, `scheduler_events` with cron | Job functions |
| Files | File DocType, private files | R2 storage adapter and presigned upload and download |
| PDF | Print Format, `download_pdf` | Two print formats (full and summary) |
| API | REST for every DocType, whitelisted methods, API keys, Webhook DocType with HMAC | Sightline methods, allow list |
| Admin screens | Desk | Admin screens inside the Sightline app (Desk is closed to Sightline users) |
| Login | Password login, email link | Email code login |
| UI | frappe-ui components, resources, list view, dialogs, charts | The app, its shell, shared metadata-driven list and form views, focused pages, PWA |

## Glossary (code, DocTypes, screens, emails, tests)

| Word | Meaning |
|---|---|
| Hotel group | The company that buys Sightline; every hotel belongs to one |
| Hotel | One property in a hotel group |
| Hotel member | A person's role at one hotel (Hotel Manager or Staff) |
| Hotel group member | A person's Group Head role for one hotel group |
| Section | Global master of broad operating areas; only classifies |
| Sub-section | A group of audit items inside a template or audit; belongs to one Section |
| Audit item | A master item kept by Admin, for example HK-014 |
| Audit template | A global master set of sub-sections and audit items |
| Template version | Draft or published version of an audit template |
| Audit | One audit of one hotel; has revisions |
| Revision | One round of capture and submit |
| Audit result | The audit's frozen copy of an audit item with its answers ("items" inside an audit, "results" in reports) |
| Evidence | Photo, document or sample check on a result |
| Observation, Responded by, Team response, Reason, Recommendation | The answer fields |
| Red flag | A critical item scored 0 or No; caps the audit score at 50 |
| Issue | A standalone to-do for a hotel team, never linked to an audit |
| Notepad | An auditor's private notes for one audit |
| Correction | Admin's change to a submitted revision, with a reason |

Frappe words (DocType, DocPerm, permlevel, docstatus, whitelisted method, child table, Single) appear only in code and in this specification, never on screen.

**Never use:** audit type, client, library item, department, Department Head, fixes or actions or tasks (for issues), management response, property score, hotel score.

## Copy rules

Plain literal labels; no eyebrows; no em dashes; no slogans; no page description text (page headers show title and actions only); India time for display. A copy lint in CI checks the Vue app, Jinja templates, email templates and fixtures.

## Never build

Marketing website · CRM or lead tracking · invoicing, billing, payments · WhatsApp, SMS, push notifications · native or app store apps · importing hotel accounts, ledgers or PMS data · supplier recommendations · paying auditors or timesheets · hotel group contracts or pricing · benchmarking or comparing hotels · reminder emails · offline capture · Desk screens for Sightline users · ERPNext or any other Frappe app as a dependency.

## People

- **Azhar** (azhar@zarnik.com): product owner; approves every gate and every seed audit template item.
- **Vijayalakshmi**: approves the design and screens with Azhar.
