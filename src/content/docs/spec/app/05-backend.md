---
title: "05. Backend: hooks, API methods, jobs"
sidebar:
  order: 5
---

## 1. hooks.py (what the app registers)

| Hook | Value |
|---|---|
| `app_name`, `app_title`, `required_apps` | `sightline`, "Sightline", `["frappe"]` |
| `home_page` | `s` (the SPA page at `/s/`) |
| `website_route_rules` | `/s/<path:app_path>` to the SPA page (`02-architecture.md` section 5) |
| `fixtures` | Roles, Custom Fields on User and Workflow State, Workflows, Notifications, Email Templates, Print Formats, Property Setters, filtered to Sightline names |
| `permission_query_conditions`, `has_permission` | `sightline.core.access.*` for every hotel data DocType |
| `doc_events` | Per DocType handlers below; `"*": {"on_update": "sightline.core.realtime.publish"}` for live updates |
| `before_request` | `sightline.core.allow_list.check`, `sightline.core.view_as.guard`, `sightline.core.auth.check_access_expiry` |
| `on_session_creation` | Refuse inactive, expired, ended-group users; update `last_hotel` defaults |
| `scheduler_events` | Section 4 |
| `safe_eval_globals` | `sightline_can` for workflow conditions |
| `website_redirects` | `/` to `/s/`; `/login` and `/app` (non System Manager) to the app |
| `override_whitelisted_methods` | Frappe's `upload_file` to the R2 flow for Sightline roles |
| `on_doctype_update` | Composite indexes (`03-doctypes.md`) |
| `after_install`, `after_migrate` | Seed fixed rows, ensure roles and workflow, verify allow list |
| `boot_session` | Not used (Desk only) |

## 2. API methods (`sightline/api/`)

Every method is `@frappe.whitelist()` (guest only where stated), calls `access.require` first, validates input with typed arguments, returns plain JSON with `_perms` on records, and is listed in the allow list. Rate limits use `@rate_limit` from `frappe.rate_limiter`.

| Module | Methods |
|---|---|
| `api.auth` | `request_code(email)` (guest, 3 per email per 10 minutes, 20 per IP per hour), `verify_code(email, code)` (guest, 3 attempts per code) |
| `api.invites` | `preview(token)` (guest), `accept(token)` (guest), `create(...)`, `resend(name)`, `revoke(name)` |
| `api.me` | `get()` (profile, kind, hotels with role, home route, view as state), `set_hotel(hotel)`, `update_profile(full_name)`, `set_email_frequency(value)`, `sessions()`, `logout_other_sessions()` |
| `api.meta` | `get(doctype)` (fields, labels, layout, list settings, views, actions, empty state, filtered by the caller's rights), `workspace()` (home blocks for the caller) |
| `api.records` | `list(doctype, filters, search, sort, limit, cursor)`, `get(doctype, name)`, `create(doctype, values)`, `update(doctype, name, values, modified)`, `transition(doctype, name, action, reason)`; generic over hotel data DocTypes, applying hooks and field rights |
| `api.timeline` | `get(doctype, name)` (Version changes and comments the caller may read), `add_comment(doctype, name, text, parent)` |
| `api.files` | `presign_upload(doctype, name, field, content_type, size, sha256)`, `confirm_upload(file)`, `download(file)` (redirect to a 5 minute presigned link) |
| `api.users` | `list_people(hotel)`, `set_expiry(user, ...)`, `renew(user, ...)`, `disable(user)`, `enable(user)`, `end_membership(name, reason)`, `assignable(hotel, search)` |
| `api.hotels` | `list(...)`, `get(name)`, `pause`, `end`, `reactivate` |
| `api.templates` | `create_draft(template)`, `add_sub_section`, `add_item`, `update_row`, `disable_row`, `enable_row`, `reorder`, `set_visibility`, `publish(version)`, `discard(version)` |
| `api.audits` | `schedule(...)`, `update_window`, `assign(audit, user)`, `unassign(audit, user)`, `cancel(audit, reason)`, `calendar(from, to, filters)`, `queue()`, `auditor_load(user, from, to)`, `start(audit)`, `capture(audit)`, `save_result(name, values, modified)`, `add_item(audit, audit_item, sub_section)`, `save_comment(...)`, `note_get(audit)`, `note_save(audit, body, modified)`, `submit_check(audit)`, `submit(audit)`, `restart(audit, reason, auditor)`, `correct(audit, reason, changes)` |
| `api.issues` | `list`, `get`, `create`, `update`, `assign(name, user, due_date)`, `transition(name, action)` |
| `api.reports` | `get(revision, report_type)` (report data for the app page), `export(revision, report_type)` (queue a PDF), `download(report)` |
| `api.history` | `audit_trend`, `section_trend`, `item_history`, `movers`, `repeat_failures`, `reasons`, `issue_closure` |
| `api.dashboards` | `hotel(hotel)`, `hotel_group(hotel_group, filters)`, `my_hotels()` |
| `api.support` | `start_view_as(user, reason)`, `stop_view_as()`, `sessions()` |
| `api.admin` | `email_log`, `retry_email`, `error_log`, `job_log`, `changes(doctype, name, filters)` |

**List contract for `api.records.list` and the other lists:** `filters` as `[[field, operator, value], ...]` with operators `=`, `!=`, `in`, `not in`, `<`, `>`, `<=`, `>=`, `like`, `is set`, `is not set`; `search` over the DocType's search fields; `sort` as `field asc|desc`; `limit` (default 25, maximum 100); `cursor` from the previous page. Returns `{items, total, next_cursor}`. Every list query goes through `frappe.get_list` (which applies the hooks) or `frappe.qb` with `access.query_condition` added, never raw SQL without it.

**Errors:** methods raise `frappe.ValidationError`, `frappe.PermissionError` or `frappe.DoesNotExistError` with plain messages; the app shows `exc` messages from `_server_messages`. A record the caller may not read raises DoesNotExist, so existence never leaks. Optimistic locking: `save_result` and `update` pass `modified`; a mismatch raises `frappe.TimestampMismatchError`, which the app shows as "This changed. Reload".

## 3. Document events and services

| DocType | Events |
|---|---|
| Hotel Group | `on_update`: on Ended, end every membership in it and refuse sessions of members with no other membership |
| Hotel | `validate`: size band; `on_update`: on Ended, end memberships at it |
| Hotel Member, Hotel Group Member | `validate`: one hotel group per person, client kind only; `on_update`: clear access cache |
| Audit Item | `validate`: wording change needs a reason and raises `item_revision`; `on_trash`: refuse |
| Audit Template Version | `before_submit`: publish checks, wording snapshot; `on_submit`: set `current_version` |
| Audit | `before_insert`: copy visibility; controller methods for lifecycle (`06-audit-capture.md`) |
| Audit Result, Audit Sub-section | `validate`: revision In progress and caller assigned, or correction service; score rules (0 to 5; Yes or No only 0 or 5; N/A clears score) |
| Audit Revision | `on_submit`: release, scores, PDFs, email; `before_update_after_submit`: only the correction service |
| Issue | `validate`: assignee must be on the hotel's team; set `done_on` and `done_by` when entering a Done category state |
| User | `validate`: last Admin with no expiry guard; `on_update`: sync `enabled` with `sightline_status`, clear access cache |

Business logic lives in service modules (`sightline/audits/services.py`, `sightline/issues/services.py`, ...); controllers and API methods call them. Services take the acting user explicitly so jobs can act as the system user.

## 4. Background jobs and scheduler

Frappe RQ queues: `short` (emails Frappe sends itself, small updates), `default` (notifications, PDFs, webhooks), `long` (imports, digests, schedules). Jobs are queued with `frappe.enqueue(..., enqueue_after_commit=True)` so a rolled-back request leaves no job, and with `job_id` for de-duplication where repeats are possible.

| Job | Queue | When |
|---|---|---|
| `sightline.reports.jobs.render_pdf(report)` | default | Submit, correction, Export |
| `sightline.core.digest.send_daily_digest` | long | `scheduler_events.cron["30 2 * * *"]` (08:00 India) |
| `sightline.core.access_expiry.run` | long | `cron["30 0 * * *"]` (06:00 India): expire accounts whose time has passed, end their sessions, email "Access expired" |
| `sightline.audits.jobs.ensure_scheduled_audits` | long | `cron["30 23 * * *"]` (05:00 India) |
| `sightline.core.invites.expire_old` | short | `hourly` |
| `sightline.core.view_as.end_stale_sessions` | short | `cron["*/10 * * * *"]` |
| `sightline.core.files.cleanup_unconfirmed` | long | `daily`: uploads never confirmed after 48 hours |

Frappe's Email Queue sends and retries email on its own scheduler. There are no reminder jobs. The scheduler is enabled on staging and production (`bench enable-scheduler`) and its health is checked (`10-platform.md`).

## 5. Seeds and patches

- `after_install` and patches create fixed rows: Score Scales, Evidence Types, Audit Reasons, Sightline Settings defaults, the Issue workflow, roles and their DocPerms.
- `bench --site <site> execute sightline.seed.sample_data.load` loads sample data on staging only (2 hotel groups, 3 hotels, one user per role, auditors in every assignment state, past audits with revisions, issues).
- `sightline.seed.templates.load` loads the seed audit templates (items start Draft until Azhar approves them).
- Patches are append only in `patches.txt` and run with `bench migrate` on deploy.
