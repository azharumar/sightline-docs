---
title: "02. Architecture"
sidebar:
  order: 2
---

## 1. Shape of the system

```
Phone or laptop
  Sightline app (installable PWA, Vue 3 + frappe-ui), one codebase for every role
        │ HTTPS, same origin, Frappe session cookie (sid) + CSRF token, online only
        ▼
Traefik (Dokploy) ── app.sightline.zarnik.com   (staging.sightline.zarnik.com for staging)
        ▼
frappe_docker stack (one bench, one site per environment)
  ├── nginx (frontend container): /assets, /files, routes to backend and socket.io
  ├── backend (gunicorn): Frappe + sightline app
  │     ├── /s/                    Sightline app (SPA routes); / redirects here
  │     ├── /api/method/sightline.*   Sightline whitelisted methods
  │     ├── /api/resource/<DocType>   Frappe REST, behind the Sightline allow list
  │     ├── /api/method/sightline.api.files.*   R2 presign, confirm, download
  │     └── /app                   Desk: System Manager developer accounts only
  ├── websocket (socket.io): realtime list and document updates
  ├── queue-short, queue-default, queue-long (RQ workers)
  ├── scheduler
  ├── MariaDB
  ├── redis-cache, redis-queue
  └── backup (cron container)
Cloudflare R2: files and PDFs (private, presigned links)
Resend SMTP: email from no-reply@sightline.zarnik.com
GlitchTip: errors from backend, workers and the app
```

## 2. Versions (pin exact versions at Epic 0)

| Part | Version |
|---|---|
| Frappe Framework | Latest stable major at the start of Epic 0 (version 16 if it has been stable for at least three months, otherwise version 15), pinned to a release tag; upgrade minors monthly on staging first |
| Python | The version Frappe's release requires |
| Node | The LTS version Frappe's release requires |
| MariaDB | The version frappe_docker ships for that release (10.11 LTS or 11.x LTS) |
| Redis | As frappe_docker ships |
| frappe-ui | Latest release compatible with the pinned Frappe (match Frappe CRM's version at that time) |
| Vue 3, Vue Router, Vite, Tailwind | As frappe-ui requires |

## 3. Repository and app layout

Repository: `azharumar/sightline-app`. The repository root is the Frappe app root, so `bench get-app https://github.com/azharumar/sightline-app` installs it directly. Specification, rules and skills come from the `docs/` submodule (`azharumar/sightline-docs`).

```
sightline-app/                       repository root = Frappe app root
├── AGENTS.md, CLAUDE.md             thin pointers to docs/agents/rules (Cursor and Claude Code)
├── .cursor/rules/, .cursor/commands/, .claude/skills/   generated links into docs/agents (scripts/sync-agent-files.sh)
├── docs/                            git submodule: azharumar/sightline-docs (single source of truth)
├── pyproject.toml, README.md, license.txt
├── sightline/                       the Python package
│   ├── __init__.py
│   ├── hooks.py
│   ├── modules.txt              Tenancy, Masters, Audit Templates, Audits, Issues, Reports, Core
│   ├── patches.txt              data patches (seeds of fixed rows, migrations of data)
│   ├── fixtures/                roles, custom DocPerms, workflows, notifications, email templates, print formats
│   ├── tenancy/doctype/…        Hotel Group, Hotel, Hotel Member, Hotel Group Member
│   ├── masters/doctype/…        Section, Sub-section, SOP, Reason, Tag, Audit Item, …
│   ├── audit_templates/doctype/…
│   ├── audits/doctype/…
│   ├── issues/doctype/…
│   ├── reports/                 report data builders, print format Jinja, chart macros
│   ├── core/                    access (permission hooks), auth (email code), files (R2), view_as, allow_list, digest
│   ├── scoring/                 pure Python scoring engine
│   ├── api/                     whitelisted methods grouped by area
│   ├── www/                     the SPA entry page (s.html, s.py, served at /s/)
│   ├── public/                  built SPA assets, PWA manifest and icons
│   └── tests/                   integration tests (FrappeTestCase) and the security suite
├── frontend/                        the Vue app (Vite), built into sightline/public/frontend (added in E0-03)
├── deploy/                          deployment and backup scripts (added in E2)
└── scripts/                         check.sh, sync-agent-files.sh, copy-lint
```

## 4. Libraries

**Backend (Python, in the app's `pyproject.toml`; Frappe brings its own core dependencies)**

| Library | Use |
|---|---|
| boto3 | Cloudflare R2 through the S3 API (presigned PUT and GET, HEAD, delete) |
| filetype | Real file type from the first bytes of an upload |
| sentry-sdk | Errors and traces to GlitchTip from web and workers |
| hypothesis, pytest | Scoring property tests and pure unit tests (no site) |

Everything else comes from Frappe: ORM and query builder (`frappe.qb`), migrations, naming series, permissions, workflows, email queue, notifications, Jinja print formats and PDF, RQ jobs and scheduler, rate limiter (`frappe.rate_limiter.rate_limit`), REST API, API keys, Webhook DocType, realtime, Version history, Comment, File, Error Log.

**Frontend (in `frontend/package.json`)**

| Library | Use |
|---|---|
| Vue 3, Vue Router, Vite | The app |
| frappe-ui | Components (Button, Dialog, Dropdown, ListView, FormControl, Avatar, Badge, Tabs, Toast, charts), `createResource`, `createListResource`, `createDocumentResource`, session and socket helpers |
| Tailwind CSS (frappe-ui preset) | Styling with zarnik-ds tokens as the theme |
| vite-plugin-pwa | Web manifest and service worker (app shell only) |
| browser-image-compression | Photos to about 300 KB before upload |
| @sentry/vue | Browser errors to GlitchTip |
| dayjs (frappe-ui uses it) | Dates in India time |
| Vitest, @vue/test-utils, Playwright, @axe-core/playwright | Tests |

Not used: ERPNext, Print Designer, any community app (fewer moving parts and upgrade risks). Add one only with an entry in the Decisions log of sightline-docs.

## 5. How the app is served

- The Vue app is built with Vite into `sightline/public/frontend/` and served by an index page in `sightline/www/s.html` (the pattern Frappe CRM uses for `/crm`).
- Routing (approved 2026-10-18): the app lives under `/s/`. `website_route_rules = [{"from_route": "/s/<path:app_path>", "to_route": "s"}]` send every app route to the page, and Vue Router uses `/s/` as its base (`/s/audits/…`, `/s/issues/…`). `/` redirects to `/s/`. Frappe's own paths are untouched: `/api`, `/assets`, `/files`, `/socket.io`, `/app`, `/login` (redirected, see below).
- `/login` and `/app` for anyone who is not a System Manager redirect to the app's own sign-in page and home.
- The page's Python context passes boot data (CSRF token, site name, session user, app version) into the HTML, so the first screen needs no extra round trip.

## 6. Request path for data

1. The app calls a whitelisted method (`/api/method/sightline.api.<area>.<method>`) or Frappe's resource API for an allowed DocType, with the session cookie and `X-Frappe-CSRF-Token`.
2. `before_request` hooks run the Sightline allow list (`04-permissions.md` section 7), the view as read-only guard, and the access expiry check.
3. Frappe checks DocPerms; Sightline's `has_permission` and `permission_query_conditions` hooks apply hotel scope and per-hotel roles.
4. Controllers and services validate and save; `track_changes` records history; document events queue notifications and jobs with `frappe.enqueue(..., enqueue_after_commit=True)`.
5. Realtime: `frappe.publish_realtime` events after commit refresh open lists and documents for people who can read them.

## 7. User types

- Every Sightline person is a Frappe **Website User** holding Sightline roles that have `desk_access = 0`, so Desk is closed to them by Frappe itself.
- Developer and maintenance accounts are System Users with System Manager. They are not product users and never appear in Sightline lists.
- The Epic 0 spike (E0-05) confirms that DocPerms, permission hooks, file access, comments and the resource API all work for Website Users with Sightline roles. If a needed Frappe API refuses Website Users, the Sightline method wraps it.
