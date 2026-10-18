---
title: "03. DocTypes (data model)"
sidebar:
  order: 3
---

MariaDB through Frappe DocTypes. Each DocType is a JSON file plus a Python controller in its module folder, created with `bench new-doctype` style scaffolding and committed.

## 1. Conventions

- DocType names are singular Title Case (`Hotel Group`, `Audit Result`). Field names snake_case. Labels follow the copy rules.
- **Standard fields Frappe adds to every DocType:** `name` (primary key), `owner` (created by), `creation` (created at), `modified` (updated at), `modified_by` (updated by), `docstatus` (0 draft, 1 submitted, 2 cancelled), `idx`; child rows add `parent`, `parenttype`, `parentfield`. These are the "created by, created at, modified by, modified at" metadata on every table. Frappe's `modified` check refuses saving a document that changed after it was loaded (optimistic locking).
- **History:** `track_changes = 1` on every DocType except Audit Note (private) and log DocTypes. Frappe writes a Version row per save with the changed fields. Deletes are copied to Deleted Document.
- **No deletes:** no role has `delete` on any Sightline DocType except where stated; controllers raise in `on_trash` for DocTypes that must never be removed. Data is kept indefinitely.
- **Scope fields:** every hotel data DocType has `hotel_group` and `hotel` (Link, indexed, `set_only_once`; on children of a parent document, `fetch_from` the parent). Permission hooks use them.
- **Naming:** codes where people read them (hotel code, audit item code), naming series where a sequence is needed (`SL-.YYYY.-.####` for audits), `hash` elsewhere.
- **Choices:** `Select` fields; status fields set only by controller methods are `read_only` in the DocType.
- **Child tables** cannot contain child tables in Frappe. Where a template has sub-sections and items, both are child tables of the version, and items point to their sub-section by a stable `sub_section_key`.
- **Large collections are separate DocTypes, not child tables.** Audit results (60 to 150 per revision, saved one at a time by more than one auditor) are their own DocType, so each save touches one small record and two auditors never block each other on the whole audit.
- **Integrity** is enforced in controllers (`validate`, `before_save`, `on_update`, `on_trash`, `before_update_after_submit`) and proven by tests. Frappe apps do not use database triggers; the security and integrity test suites take their place.
- **Indexes:** `search_index = 1` on filter fields; composite indexes added in `on_doctype_update()` with `frappe.db.add_index`.

## 2. People and access

**User (Frappe core) with Custom Fields from fixtures**

| Field | Type | Notes |
|---|---|---|
| `sightline_kind` | Select: Admin, Auditor, Client | Set from the invite; never changes between platform and client kinds |
| `sightline_status` | Select: Invited, Active, Expired, Disabled | Kept in step with Frappe's `enabled` (Expired and Disabled set `enabled = 0`, so Frappe itself refuses sessions) |
| `access_expiry` | Select: 7 days, 30 days, 60 days, 90 days, Custom, No expiry | |
| `access_expires_on` | Datetime | Empty only with No expiry |
| `invited_by` | Link User | |
| `auditor_type` | Select: Employee, Freelancer | Auditors only |
| `base_city` | Data | Auditors only |
| `last_hotel` | Link Hotel | Hotel switcher memory |
| `email_frequency` | Select: Each, Daily digest | Group Heads start on Daily digest |
| `email_bounced` | Check | Set by the Resend webhook |

Every Sightline user is a Website User with an unusable random password. Roles are given by the invite and membership controllers, never by hand (`04-permissions.md`).

**Hotel Group Member**: `user`, `hotel_group`, `status` (Active, Ended), `ended_on`, `end_reason`. Unique active pair. Means Group Head of that hotel group.

**Hotel Member**: `user`, `hotel`, `hotel_group` (fetched), `role` (Hotel Manager, Staff), `invited_by`, `status` (Active, Ended), `ended_on`, `end_reason`. Unique active (user, hotel).

Controller rules on both: the user's `sightline_kind` must be Client; every active membership of a user is inside one hotel group; ending a hotel group ends all its memberships.

**Sightline Invite**: `email`, `full_name`, `role` (Admin, Auditor, Group Head, Hotel Manager, Staff), `hotel_group`, `hotel`, `auditor_type`, `access_expiry`, `access_expires_on`, `token_hash` (SHA-256; the token is only in the email), `token_expires_on` (7 days), `status` (Pending, Accepted, Revoked, Expired), `accepted_on`, `accepted_user`. `owner` is the inviter. Rules: Admin and Auditor invites name no hotel group or hotel; Group Head names a hotel group; Hotel Manager and Staff name a hotel; Hotel Managers create Staff invites for their own hotel only.

**Support Session** (view as log): `admin`, `viewed_user`, `reason` (at least 10 characters), `started_on`, `ended_on`.

**Sightline Settings** (Single): `reference_prefix` (SL), `default_access_expiry` (90 days), `default_window_days` (7), `photo_max_px` (1600), `photo_target_kb` (300), `custom_audit_default_visibility` (Group Head, Hotel Manager, Auditor), `digest_time` (08:00).

## 3. Tenancy

| DocType | Naming | Fields |
|---|---|---|
| **Hotel Group** | `field:code` | `group_name` (title), `code` (upper case), `status` (Active, Paused, Ended) |
| **Hotel** | `field:code` | `hotel_group` (Link, set only once), `hotel_name` (title), `code`, `address_line`, `city`, `district`, `state` (Select of Indian states and union territories), `pincode` (6 digits), `rooms` (Int), `property_type` (Hotel, Resort, Other), `size_band` (read only, set in `validate`: Resort → Large; 40 rooms or fewer Small; 41 to 100 Medium; above 100 Large), `site_contact_name`, `site_contact_phone` (Phone, permlevel 1), `status` |

## 4. Masters (global)

| DocType | Naming | Fields |
|---|---|---|
| **Section** | `field:section_name` | `section_name`, `sort_order` |
| **Sub-section** | hash | `section`, `sub_section_name` (unique per section), `sort_order` |
| **SOP** | `field:code` | `section`, `code`, `title`, `short_description`, `link` |
| **Score Scale** | `field:scale_name` | `scale_type` (Zero to five, Yes or No); two fixed rows from a patch |
| **Evidence Type** | `field:type_name` | Photo, Document, Sample check; fixed rows |
| **Audit Reason** | `field:label` | `label`, `sort_order`; seeded: No SOP, Not trained, Short of stock, Equipment not working, Already reported, Disagrees |
| **Audit Tag** | `field:tag_name` | `tag_name` (named Audit Tag to avoid Frappe's own Tag) |
| **Audit Item** | `field:code` | `code` (for example HK-014), `label`, `guidance`, `section`, `sub_section` (must belong to the section), `sop`, `score_scale`, `is_critical`, `default_weight` (Float, above 0), `default_recommendation`, `status` (Draft, Active, Retired), `item_revision` (Int, read only), `evidence_types` (Table MultiSelect of Evidence Type), `tags` (Table MultiSelect of Audit Tag). Controller: a change to label, guidance, default recommendation or SOP needs a reason (passed with the save) and raises `item_revision`; `on_trash` refuses |

## 5. Audit templates (global)

| DocType | Naming | Fields |
|---|---|---|
| **Audit Template** | hash, title `template_name` | `template_name` (unique), `description`, `current_version`, `status` (Active, Retired), `visibility` (child **Audit Template Visibility**: `role` Select of Group Head, Hotel Manager, Staff, Auditor) |
| **Audit Template Version** (submittable) | `{audit_template}-V{version_number}` set in `autoname` | `audit_template`, `version_number`, `status` (Draft, Published, Discarded). Submit = publish (sets `current_version` on the template); cancel = discard (drafts only). One draft per template. Child tables below |
| **Audit Template Sub-section** (child) | | `key` (stable UUID, kept across versions), `section`, `sub_section`, `label`, `weight` (Select 1, 2, 3), `status` (Active, Disabled), `idx` |
| **Audit Template Item** (child) | | `sub_section_key`, `audit_item` (unique per version), `weight` (Float), `is_critical`, `status` (Active, Disabled), `idx`; filled on publish: `item_revision`, `label`, `guidance`, `default_recommendation`, `sop_code`, `sop_title`, `sop_short_description`, `sop_link`, `score_scale_type`, `allowed_evidence_types` |

Editing a published template creates the next draft version by copying all rows. Rows are never removed from a draft that came from a published version, only disabled (controller check). Published versions are frozen by `docstatus = 1`.

## 6. Audits

| DocType | Naming | Fields |
|---|---|---|
| **Audit Schedule** | hash | `hotel`, `hotel_group`, `audit_template`, `every_months` (1, 3, 6, 12), `window_days`, `next_due_date`, `status` (Active, Paused, Ended). One active per hotel and template |
| **Audit** | naming series `SL-.YYYY.-.####` | `hotel`, `hotel_group` (fetched), `is_custom`, `audit_template` (empty for a custom audit), `template_version` (empty for a custom audit), `audit_schedule`, `audit_name`, `window_start`, `window_end`, `audit_date`, `status` (Scheduled, In progress, Submitted, Cancelled; read only), `cancel_reason`, `current_revision`, `released_revision`, `is_released` (Check), `revision_count`, `score` (permlevel 1), `has_red_flag` (permlevel 1), `red_flag_count` (permlevel 1), `last_corrected_on`, child **Audit Visibility** (`role`), child **Audit Auditor** (`user`, `revision`, `status` Assigned or Ended, `ended_on`, `end_reason` Submitted, Cancelled or Removed); for custom audits only, the plan Admin builds before start: child **Audit Plan Sub-section** (`key`, `section`, `sub_section`, `label`, `weight`) and child **Audit Plan Item** (`sub_section_key`, `audit_item`, `weight`, `is_critical`), editable while the audit is Scheduled |
| **Audit Revision** (submittable) | `{audit}-R{revision_number}` | `audit`, `hotel`, `hotel_group`, `revision_number`, `status` (In progress, Submitted, Archived; allow on submit), `restart_reason`, `copied_from`, `submitted_on`, `submitted_by`, `archived_on`, `score`, `raw_score`, `has_red_flag`, `red_flag_count` (all allow on submit, written only by the scoring service), `auditor_comment` (allow on submit for correction), `auditor_names`, `correction_count`, `last_corrected_on`, `last_corrected_by`, child **Audit Correction** (`corrected_on`, `corrected_by`, `reason`) |
| **Audit Sub-section** | hash | `revision`, `audit`, `hotel`, `hotel_group`, `section`, `sub_section`, `template_key`, `label`, `weight`, `score`, `auditor_comment`, `sort_order` |
| **Audit Section Score** | hash | `revision`, `audit`, `hotel`, `hotel_group`, `section`, `score`. Unique (revision, section) |
| **Audit Result** | hash | `revision`, `audit`, `audit_sub_section`, `hotel`, `hotel_group`, `audit_item`, `section`; frozen copy: `item_code`, `label`, `guidance`, `sop_code`, `sop_title`, `sop_short_description`, `sop_link`, `score_scale_type`, `weight`, `is_critical`, `item_revision`, `allowed_evidence_types`; answers: `score` (Int 0 to 5, empty until answered), `is_na`, `observation`, `responded_by_name`, `responded_by_role`, `team_response`, `reason`, `recommendation`; `is_added_during_audit`, `copied_from`, `answered_on`, `answered_by`, `sort_order`; child **Audit Evidence** (`evidence_type`, `file` (Link File), `checked_count`, `exception_count`, `note`, `captured_on`, `upload_status`) |
| **Audit Note** | hash | `audit`, `hotel`, `hotel_group`, `body`. One per audit per auditor (`owner`). `track_changes = 0`. Never copied by a restart, never in a print format |
| **Audit Report** | hash | `audit`, `revision`, `hotel`, `hotel_group`, `report_type` (Full, Summary), `file` (Link File), `generated_on`, `status` (Queued, Ready, Failed), `error` |

Controller rules: Audit Result and Audit Sub-section refuse changes unless their revision is In progress and the caller holds an active assignment, or the change runs inside the correction service (Admin, reason, released revision). `is_released` turns on at the first submit and never turns off.

Indexes (`on_doctype_update`): Audit Result (`audit_item`, `hotel`); Audit Result (`revision`, `audit_sub_section`, `sort_order`); Audit (`hotel`, `audit_template`, `audit_date`); Audit (`status`, `window_start`); Audit (`hotel_group`, `is_released`, `audit_date`); Audit Sub-section (`sub_section`, `hotel`); Audit Section Score (`section`, `hotel`).

## 7. Issues

| DocType | Naming | Fields |
|---|---|---|
| **Issue** | hash | `hotel`, `hotel_group` (fetched), `title` (title field), `description` (label "Details"), `priority` (High, Medium, Low), `workflow_state` (managed by the Issue workflow: Open, In progress, Done; Admin can add states), `assigned_to` (Link User, permlevel 1), `assigned_by`, `assigned_on`, `due_date` (permlevel 1), `done_on`, `done_by`. No link to any audit DocType |

This site runs only the Sightline app, so the plain name Issue is safe. Photos are attachments (File), comments are Frappe Comments, status history is the Version log. Indexes: (`hotel`, `workflow_state`, `due_date`), (`assigned_to`, `workflow_state`).

## 8. System DocTypes

| DocType | Fields |
|---|---|
| **Sightline Saved View** | `user` (owner), `list_key`, `view_name`, `query` (JSON: filters, sort, columns, search). Personal |
| **Sightline Inbound Event** | `provider` (Resend), `event_id` (unique), `event_type`, `payload` (JSON), `processed_on`, `error`. Not tracked |
| Custom Fields on **File** | `storage` (Local, R2), `storage_key`, `sha256`, `upload_status` (Pending, Ready, Rejected) |
| Custom Field on **Workflow State** | `state_category` (Open, Active, Done), used by dashboards instead of state names |

## 8. Decisions this model adds

- **D-1** Section scores stored in Audit Section Score.
- **D-2** Template and audit sub-sections carry the master Sub-section and a stable key, so trends survive versions and renames.
- **D-3** A custom audit works like any other audit; its sub-sections and items come from a plan Admin builds on the audit (Audit Plan Sub-section and Audit Plan Item) instead of a template version, and Admin sets its visibility when scheduling. Start freezes the plan with the audit items' current wording. Custom audits have no template, so they appear in item history but not in template score trends.
- **D-4** Memberships are Hotel Member and Hotel Group Member DocTypes; Frappe roles are kind-level only (`04-permissions.md`).
- **D-5** Audit results, sub-sections and notes are separate DocTypes, not child tables, so per-item saves are small and concurrent.
- **D-6** Published template versions keep a wording snapshot of each audit item.
- **D-7** Admin corrects a submitted revision through `allow_on_submit` fields and a correction service, with a reason; scores are recalculated.
- **D-8** Data is never deleted; ended hotel groups keep their data with access ended.
- **D-9** Integrity rules live in controllers and tests, not in database triggers, following Frappe conventions.
