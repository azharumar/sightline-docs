---
title: "04. Roles and permissions"
sidebar:
  order: 4
---

Frappe checks permissions in Python, not in the database, and gives every user the same roles everywhere. Sightline needs roles that differ per hotel and auditor access that ends with an assignment. This file sets how both are done safely on Frappe, with three layers: Frappe roles and DocPerms for the coarse rules, one Sightline access module for hotel scope and per-hotel roles, and an API allow list that keeps the reachable surface small enough to test completely.

## 1. Who a person is

| Kind (on User) | Frappe role | Where their rights come from |
|---|---|---|
| Admin | Sightline Admin | Global: everything on the platform, like a system administrator, except hotel issues (section 4) |
| Auditor | Sightline Auditor | Per audit: an Audit Auditor row (Assigned gives capture; Ended with Submitted gives read only; Removed or Cancelled gives nothing) |
| Client | Sightline Client | Per hotel: Hotel Group Member (Group Head at every hotel of the group) and Hotel Member (Hotel Manager or Staff at one hotel) |
| Developer | System Manager (System User) | Desk and maintenance only; never a Sightline user |

Rules: a user is exactly one kind and never changes kind; a Client's active memberships are all in one hotel group; Group Head beats Hotel Manager beats Staff at the same hotel; a membership counts only while it is Active, the user is Active and not expired, and the hotel and hotel group are not Ended.

All three Sightline roles have `desk_access = 0`. Users are Website Users. Desk is closed to them by Frappe.

## 2. The access module (`sightline/core/access.py`)

One module answers every permission question. Nothing else in the app decides access.

```python
role_in_hotel(user, hotel) -> "group_head" | "hotel_manager" | "staff" | None
hotels_for(user) -> set[str]                       # hotels where the user holds a client role
auditor_state(user, audit) -> "active" | "worked_on" | None
can(user, action, doc) -> bool                     # action: read, write, create, assign, export, start, submit, correct, ...
require(user, action, doc) -> None                 # raises frappe.PermissionError
field_rights(user, doc) -> {"readable": set, "writable": set}
query_condition(user, doctype) -> str              # SQL condition for lists
```

**The rights matrix is code** (`ACCESS_MATRIX`), one row per DocType and action, keyed by the effective role at the record's hotel or audit. It is the single source used by the hooks, by the Sightline API methods, by `_perms` sent to the app, and by the security tests' expectations (which are written separately from the blueprint so a matrix mistake is caught).

Results are cached per request (`frappe.local`) and per user in redis for 5 minutes, cleared when a membership, assignment or user changes.

## 3. Frappe layer: roles, DocPerms and hooks

**DocPerms (fixtures):** each Sightline role gets the widest rights any of its effective roles needs on each DocType (for example Sightline Client gets read, write, create on Issue, because Group Heads and Hotel Managers have them). The hooks then narrow per record.

**Hooks in `hooks.py` for every Sightline DocType with hotel data:**

```python
permission_query_conditions = {dt: "sightline.core.access.query_condition" for dt in HOTEL_DATA_DOCTYPES}
has_permission = {dt: "sightline.core.access.has_permission" for dt in HOTEL_DATA_DOCTYPES}
```

- `query_condition` returns a SQL condition built only from the user's own membership and assignment IDs (escaped with `frappe.db.escape`), for example `` `tabIssue`.hotel in ('A1','A2') and (`tabIssue`.hotel in ('A1') or `tabIssue`.assigned_to = 'u@x' or `tabIssue`.owner = 'u@x') ``. Admin returns an empty condition on every DocType except Issue, where Admin gets `1=0` like any user with no hotel role; a user with nothing returns `1=0`.
- `has_permission(doc, ptype, user)` calls `access.can(user, ptype, doc)`.
- Frappe uses both in `get_list`, `get_all` with permission checks, report view, link search, `get_doc` permission checks, print, attachments and comments on those documents.

**Permission levels:** fields whose visibility depends on the hotel role (site contact phone, audit score and red flags, issue assignee and due date) are permlevel 1 for Frappe and are also filtered by the Sightline API serializer from `field_rights`, because Frappe's permlevels follow Frappe roles, not hotel roles. Writes to a field outside `writable` are refused in `validate` with the field named.

**User Permissions are not used** for hotel scope: they apply per Frappe role, cannot express a different role per hotel, and would add a second source of truth.

## 4. The Sightline rights (seeded in `ACCESS_MATRIX`)

| DocType | Admin | Auditor active | Auditor worked on | Group Head (own group) | Hotel Manager (own hotel) | Staff (own hotel) |
|---|---|---|---|---|---|---|
| Masters, Audit Item | read, write, create, retire | read (Active items) | | | | |
| Audit Template, Version | read, write, create, publish | read | | | | |
| Hotel Group | all | | | read | read | read |
| Hotel (basic) | all | read (assigned hotel) | read (hotel of worked-on audits) | read | read | read |
| Hotel site contact | read, write | read (assigned hotel) | | read | read | |
| User | all | own | own | read people of the group | read people of the hotel; set expiry, renew, remove for Staff they invited | own |
| Sightline Invite | all | | | | create and revoke Staff invites for own hotel | |
| Audit Schedule | all | | | | | |
| Audit (and its revisions, sub-sections, section scores, results, evidence) | all; schedule, assign, cancel, restart, correct | read, start, capture, add item, submit | read released revisions | read released, if Group Head in visibility | read released, if Hotel Manager in visibility | read released, if Staff in visibility |
| Earlier results at the assigned hotel | | read released, if Auditor in their visibility | | | | |
| Audit score and red flags | read | read | read | read (visibility) | read (visibility) | read (visibility) |
| Audit Note | none | own: read, write | own: read, write | | | |
| Audit Report (PDF) | read, export | | | read, export (visibility) | read, export (visibility) | |
| Issue | none (hotel teams only) | none | none | read, write, create, assign, transitions, comment | read, write, create, assign, transitions, comment | read and comment if assigned to them or created by them; create; write if creator; transitions on readable issues |
| Logs (Email Queue, Error Log, Version, Support Session) | read | | | | | |

"Released" means the audit's `is_released` is set; until then no client role can read the audit or any of its rows, so Mystery Guest visits stay unannounced.

## 5. Record states and transitions

- **Audit lifecycle** (Scheduled, In progress, Submitted, Cancelled) is driven by whitelisted methods (`start`, `submit`, `cancel`, `restart`, `correct`) that call `access.require` first. Status fields are read only in the DocType, so no ordinary save can change them.
- **Issue** uses Frappe's Workflow DocType so Admin can add states without code: states Open, In progress, Done (with `doc_status` 0); transitions Start work, Mark done, Reopen. Workflow transition roles are Sightline Client only; the transition `condition` calls `sightline_can(doc, "transition")` (exposed through the `safe_eval_globals` hook) so the hotel role decides. Custom states added by Admin follow the same condition. Dashboards count "open" issues by a `state_category` Custom Field on Workflow State (Open, Active, Done), never by state name.
- **Audit Template Version** uses `docstatus`: submit is publish, cancel is discard.
- **Audit Revision** uses `docstatus`: submit at audit submit; corrections use `allow_on_submit` fields through the correction service only.

## 6. View as (Admin support)

- Admin picks a user and gives a reason. The method `sightline.api.support.start_view_as` writes a Support Session and switches the session to the user, keeping the Admin in the session data (`impersonated_by`), following Frappe's own impersonation mechanism.
- A `before_request` hook refuses every request that could write (any method not on the read list, any `POST`, `PUT` or `DELETE` to resources) while `impersonated_by` is set, except `stop_view_as`. Frappe's document events also refuse saves when the flag is set, as a second guard.
- A banner shows whose view it is, the reason and Stop. Stop ends the Support Session and restores the Admin's session.
- Notepads are never shown in view as.
- Issues are hidden in view as too: Admin has no access to issues, and viewing as a hotel user does not open them (the issue methods refuse when `impersonated_by` is set).

## 7. API allow list (keeps the surface testable)

A `before_request` hook (`sightline.core.allow_list.check`) runs on every `/api/` request from a Sightline role:

- Allowed methods: every `sightline.api.*` method (each one calls `access.require`), the email code login methods, `frappe.auth.get_logged_user`, `logout`, `frappe.client.get_list` and `frappe.client.get` for global masters only, and the small set of frappe-ui session and socket calls listed in `sightline/core/allow_list.py`.
- `/api/resource/<DocType>`: allowed only for global masters (read for all roles, write for Admin). Hotel data DocTypes are read and written only through Sightline methods, which apply per-hotel field rules.
- Everything else (Desk form loaders, report view, global search, `frappe.client.get_value`, file upload, Version reads, Comment reads, Notification Log, user settings) returns 403 for Sightline roles. Sightline methods provide what the app needs (timeline, comments, files, search) with the access checks.
- System Managers are not restricted.

This turns "is there any Frappe endpoint that leaks?" into a short, closed list, which the security suite checks completely.

## 8. Security tests (every pull request)

Run with `bench run-tests --app sightline` on a fresh test site, plus API tests over HTTP.

**Fixture world:** hotel groups A, B and ended C; hotels A1, A2, A3, B1, C1; one user per role; one person who is Hotel Manager at A1 and A2 and Staff at A3; auditors with assigned, submitted, removed and cancelled rows; released and unreleased audits; audits whose visibility excludes Staff; issues created by, assigned to and not related to the Staff user.

**Must always pass:**

- No client user reads or writes any record of another hotel group, or of a hotel where they hold no role, through any allowed endpoint.
- The three-membership person has Hotel Manager rights at A1 and A2 and only Staff rights at A3 (cannot assign, cannot see site contact, sees only own issues).
- No client role reads an unreleased audit or any of its results, sub-sections, evidence or files.
- An auditor reads nothing of an audit after removal or cancellation; after submit reads it only; the notepad stays editable after submit and is gone after removal.
- An auditor with an active assignment reads earlier results at that hotel only from released audits whose visibility lists Auditor.
- Auditors and Admin read and write no issue, issue comment or issue file, including through view as.
- Staff read only issues assigned to them or created by them and cannot set assignee or due date.
- Results are absent for roles not in the audit's visibility, in the app, the API, print formats and PDFs.
- The notepad is unreadable by Admin, view as and every other user.
- View as refuses every write.
- **Allow list completeness:** a test lists every whitelisted method in every installed app and every DocType, calls each as a Staff user and as an Auditor, and fails on any 200 response that is not on the allow list.
- Files: a private file of another hotel cannot be downloaded by guessing its URL; presigned links expire.
- Expired, disabled and ended-group users are refused on every request.
- The last Admin with no expiry cannot be expired, disabled or demoted.
