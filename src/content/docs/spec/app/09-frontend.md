---
title: "09. Frontend: the Sightline app (Vue 3, frappe-ui, PWA)"
sidebar:
  order: 9
---

One single-page app for every role, Admin included, built like Frappe CRM: Vue 3, Vue Router, Vite, Tailwind and frappe-ui, inside the app repository at `frontend/`. Installable as a progressive web app. Online only.

## 1. Principles

- **One app, controlled by the server.** Navigation, home, screens and buttons come from `api.me.get` (roles per hotel, home route) and `_perms` on records. No role names in component logic; a lint rule flags string literals matching Sightline role names outside tests.
- **Uniform first, focused where needed.** Most screens are built from shared metadata-driven views (list, form, report view, calendar, kanban, wizard). Field users get focused pages where a generic view is too much (capture, Staff issues, dashboards, report). Both use the same data layer and permission answers.
- **Approved design, re-applied.** zarnik-ds tokens (pin `99988d1`) become the Tailwind theme for frappe-ui (colours, type, radius, spacing, light and dark). Layout, copy and component behaviour follow the approved screens of the old repo (commit `10c17a3…`). Components the old design has and frappe-ui lacks are built once in `src/components/` from frappe-ui primitives.
- **Phone first:** every screen works at 360 px wide.

## 2. Structure

```
frontend/
├── index.html, vite.config.js (frappe-ui Vite plugin, vite-plugin-pwa), tailwind.config.js (frappe-ui preset + zarnik-ds theme)
└── src/
    ├── main.js, router.js, App.vue
    ├── data/            session, me (roles per hotel), hotel switcher state, resources (createResource wrappers)
    ├── design/          zarnik-ds tokens, generated theme
    ├── components/      shell, list shell, form renderer, field controls, timeline, comments, attachments, dialogs, empty states, banners
    ├── views/           ListView, FormView, ReportView, CalendarView, KanbanView, WizardView (metadata driven)
    ├── pages/           focused pages: audit capture, review, correction, report, Staff issues, dashboards, history, profile, login
    ├── admin/           masters, templates builder, hotels, users, invites, schedule, logs (built mostly from views/)
    └── overrides.js     view overrides and layout variants per role
```

## 3. Data layer

- frappe-ui `createResource`, `createListResource` and `createDocumentResource` against Sightline methods (`api.records.*`, `api.audits.*`, ...), never against Frappe Desk endpoints (blocked by the allow list).
- CSRF token from the boot data; session cookie from Frappe.
- Errors: Frappe's `_server_messages` and `exc_type` shown as plain toasts or field errors; `TimestampMismatchError` shows "This changed. Reload".
- Realtime: subscribe to `doc_update` and list events through frappe-ui's socket helper so open lists and records refresh when someone else changes them.

## 4. Approved flexibility (built into the shared views)

| Feature | How |
|---|---|
| View overrides per role | `overrides.js` maps (DocType, view, role at the record's hotel) to a focused page. Example: Issue form for Staff → `pages/StaffIssue.vue` |
| Layout variants per role | `api.meta.get` returns the layout for the caller's role (full for Admin, compact for client roles: fewer sections, no timeline by default, sticky primary action) |
| Wizard view | `WizardView` with steps from metadata, server validation per step, one save at the end. Used for Schedule an audit, Invite a person, New hotel group with first hotel |
| Phone patterns as defaults | Below 768 px: bottom action bar with the primary action and transitions; forms as full-screen sheets; sidebar content in a "More" sheet; filters in a bottom sheet; 44 px targets |
| Computed fields in lists | `api.records.list` returns computed values declared per DocType (for example latest audit score per template on hotel rows, band on audit rows, open issue count on hotel rows), usable in filters and sorts |
| Empty states and first-run hints | From `api.meta.get`: plain sentence and the primary action; first-run hint shown once per person per list |

## 5. List shell (every collection)

Header (title, count, primary action); quick filter chips with counts; filter builder; sort; saved views (personal, stored in a Sightline Saved View DocType); rows with title, at most 2 meta fields, one status pill and one marker (Critical, high priority, red flag); Load more. Laptop: table with at most 5 default columns and a Columns menu. State in the URL. No card grids for collections.

Rows per list: audits (hotel name; date and template; status or score once submitted; red flag marker), issues (title; hotel for people with more than one hotel, and due date; state; high priority marker), audit items (label; Section; status; Critical marker), hotels, users and audit templates (name; one field; Active or Inactive), items while auditing (label; Done, N/A or Not started; Critical marker).

## 6. Shell and navigation

- Laptop: sidebar; phone: bottom bar with More. Items from `api.me.get` in order.
- Top bar: hotel switcher (people with more than one hotel, and Admin; switching lands on that hotel's dashboard and is remembered in `last_hotel`), search, user menu (Profile, Install app, Sign out).
- Banners: view as (whose view, reason, Stop), offline ("You are offline. Changes are paused until the connection is back"; every input disabled).
- Page headers show title and actions only, never a description sentence.

| Role | Home | Navigation |
|---|---|---|
| Admin | Admin home: Masters, Hotel groups and users, Audit schedule first; counts of unassigned audits, failed emails | Masters (audit items, audit templates, Sections and other masters), Hotel groups, Hotels, Users, Auditors, Invites, Audit schedule (calendar, unassigned, windows passed, recurring), Audits, Reports, Logs. No Issues |
| Auditor | My audits (assigned and in progress, submitted read only) | My audits, Profile. No Issues anywhere |
| Group Head | Hotel group dashboard (hotels with open issues, red flags, latest audit score per template; totals of open issues and red flags; no group score, no comparison) | Dashboard, Hotels, Issues, Reports, History |
| Hotel Manager | Hotel dashboard (red flags first, latest score per template with change, open issues, recent reports) | Dashboard, Issues, Reports, History, People |
| Staff | My issues | My issues, Reports (only templates whose visibility lists Staff) |

## 7. Focused pages

- **Audit capture** (`/audits/:id/capture`, focus mode): item list by sub-section, item drawer (score buttons 0 to 5 or Yes / No and N/A, 48 px; Observation; Recommendation; Responded by, Team response, Reason under one fold; evidence; SOP; critical flag; earlier results), previous and next with swipe, add item, notepad, sub-section and overall comments, "Saved" mark, conflict message, offline banner. Target: score one item in under 10 seconds.
- **Review and submit** (`/audits/:id/review`) and **Correction** (`/audits/:id/correct`, Admin, reason first).
- **Report** (`/audits/:id/report?type=full|summary&revision=`): phone-friendly report page; Download PDF for allowed roles.
- **Staff issues:** "My issues" list and a simple issue page (title, details, photos, comments, state buttons). Target: change an issue's state in 2 taps.
- **Dashboards:** hotel, hotel group, My hotels.
- **Score history** (`/history`): hotel and audit template chosen first; trend, Section and sub-section trends, most improved and declined, repeat failures, reason patterns, issue closure, item history (frappe-ui charts).
- **Template builder** (Admin): sub-sections and items in drag and drop groups, weights, critical, disable and enable, visibility, publish with a summary of changes.
- **Profile:** name, email (read only), email frequency, signed-in devices with "Sign out of other devices", Install app.

## 8. Installable app (PWA)

- `vite-plugin-pwa` generates `manifest.webmanifest` served under `/s/`: name "Sightline", short name "Sightline", icons 192 and 512 px plus a maskable icon and an Apple touch icon from the zarnik-ds brand mark, `display: standalone`, `start_url: /s/`, `scope: /s/`, theme and background colours from the tokens, `orientation: any`.
- **Service worker:** caches only the app shell (HTML, JS, CSS, fonts, icons) so the app opens instantly and can show the offline banner. It never caches API responses or files. `registerType: "autoUpdate"` with a "New version available. Reload" toast; never reloads in the middle of a capture.
- **Install:** "Install app" in the user menu and on Profile. Android and desktop Chrome: uses the saved `beforeinstallprompt` event. iPhone: shows the three steps (Share, Add to Home Screen, Add). The button hides when the app already runs standalone. No automatic or repeated prompts.
- The manifest and service worker are served under `/s/` (scope `/s/`), through the app's `www` routes or nginx config; Epic 0 proves installation on Android Chrome and iPhone Safari.
- Sign-in works inside the installed app because login is a code typed into the app, never a link that opens a browser tab.

## 9. Quality and tests

- WCAG 2.1 AA, axe checks in Playwright, 44 px targets.
- First load on slow 4G under 4 seconds; Admin screens code-split.
- Safari iOS 17+, Chrome Android 12+, current desktop browsers; installed PWA on both phones.
- Vitest for components, the overrides map and field state logic; Playwright (phone and laptop profiles) for each role's main journey, view as, the offline banner, PWA install and start, and the UI spike screens.
