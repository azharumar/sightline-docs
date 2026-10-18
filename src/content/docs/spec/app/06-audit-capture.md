---
title: "06. Audit capture (online only)"
sidebar:
  order: 6
---

Azhar's decision (2026-10-18): no offline capture and no sync. The app needs a connection. When the connection drops, the app shows that it is offline and disables every input until it is back. Nothing is queued on the device.

**The trade-off, stated once:** kitchens, basements and plant rooms often have no signal. In those places the auditor cannot score until they step back into signal; they use the paper or the private notepad (once back online) and enter the scores then. This removes the largest source of bugs and data loss in the old design (browser storage, sync conflicts, Safari clearing data). If pilots show it slows audits too much, offline can be added later as its own epic.

Every step below is a whitelisted method in `sightline.api.audits` that calls `access.require` first and a service in `sightline/audits/services.py` (`05-backend.md`). Status fields are read only in the DocTypes, so only these methods change them. Every change is in the Version history.

## 1. Lifecycle

```
Admin schedules ──► Audit: Scheduled ──(auditor starts)──► Revision 1: In progress
     │                                                       │ capture item by item, saved on every change
 Admin cancels                                               ▼
     ▼                                       review ──► submit
 cancelled                                                    ▼
                         Revision 1 submitted: scores saved, released to hotel teams,
                         assignments ended, PDFs generated, report ready email
                              │                                     │
                     Admin corrects (reason)               Admin restarts (reason)
                     same revision, scores recalculated     Revision 2 copied, Revision 1 archived
```

## 2. Scheduling (Administrator)

`api.audits.schedule` (Admin): hotel, standard template (or a custom item list), window, auditors.

1. Hotel and hotel group must be active. From a template: the template must have a published version. Custom audit: no template; Admin builds the plan (sub-sections from the Section and Sub-section masters, items picked from Active audit items, weights and critical flags) and chooses the visibility. The plan stays editable until the audit starts.
2. Name from the naming series `SL-.YYYY.-.####`: `SL-2026-0012`.
3. Copy the template's visibility to the audit.
4. For each auditor: an Audit Auditor row (Assigned). Email "Audit assigned to you". The row is what gives the auditor access (`04-permissions.md` section 1).
5. `is_released` stays off until the first submit, so no client role can read the audit or its date.

Reassign (before start): end the old row (`Removed`), email "Audit taken off you"; add the new auditor as in step 4. Cancel (before start, reason): end every row (`Cancelled`), email each auditor.

Recurring schedules: the daily job `ensure_scheduled_audits` (05:00 India time) creates the next unassigned audit for every active schedule that has no open audit, then moves `next_due_date` on by `every_months`.

## 3. Start and freeze (auditor)

`api.audits.start`, one transaction:

1. Lock the audit (`frappe.db.get_value(..., for_update=True)`). Caller has an Assigned row on it, status Scheduled, today's India date inside the window.
2. From a template: take its current published version and store it on the audit. Custom audit: take the audit's plan.
3. Create Revision 1 (In progress). Copy every active sub-section into Audit Sub-section, and every active item whose audit item is not retired into Audit Result: from a template version with its wording snapshot, from a custom plan with the audit items' current wording. `recommendation` is prefilled.
4. Audit `in_progress`, `audit_date` today, `current_revision`, `revision_count = 1`.

## 4. Capture screen

A focused page (`/audits/:id/capture`) inside the app shell, in focus mode (no sidebar).

- **Item list** grouped by sub-section: label, state pill (Not started, Done, N/A), Critical marker. Progress "34 of 60 done". Sub-section comment at the end of each group.
- **Item drawer** (phone: full-height sheet; laptop: side panel): score buttons 0 to 5 or Yes / No, and N/A (48 px targets, one tap saves); Observation (marked required at 2 or below or No); Recommendation (prefilled); Responded by name and role, Team response, Reason (collapsed under "Team response and reason"); evidence (Take photo, Add document, Add sample check); SOP code, title, description, link; critical flag; earlier results (last 3 submitted results of this audit item at this hotel, any template, only from audits whose visibility lists Auditor; score pill, date, revision, Observation, Recommendation, link). Previous and Next buttons and swipe.
- **Saving:** every change saves that one result with `api.audits.save_result(name, values, modified)`. Text fields save 800 ms after typing stops and on blur. A small "Saved" or "Saving" mark sits in the drawer header. A timestamp mismatch (another auditor saved the same item) shows "Another auditor changed this item" with their values and a Reload button; nothing is overwritten silently.
- **Offline:** the app listens to `online`/`offline` events and a 15-second health ping. When offline, a fixed banner says "You are offline. Changes are paused until the connection is back", every input is disabled, and an unsaved text value stays in the field (in memory only) so it saves the moment the connection returns. A failed save is retried automatically when online again, and the field shows "Not saved" until it succeeds.
- **Photos:** compressed in the browser to about 300 KB (longest side 1600 px) with browser-image-compression, then uploaded at once through the R2 upload flow (`08-email-files-pdf.md`) with a progress bar. A failed upload shows Retry. Camera input: `<input type="file" accept="image/*" capture="environment">`.
- **Add item:** search Active audit items, choose a sub-section; the server copies the live audit item (`is_added_during_audit`).
- **Notepad:** a sheet with one text area, "Private notes. Only you can read these.", saved like any field.
- **Performance target:** scoring one item (open, tap score, Next) under 10 seconds on a mid-range Android phone on 4G.

## 5. Review and submit

Review screen (from `api.audits.submit_check`): unanswered items, items scored 2 or below or No without an Observation, uploads still in progress, red flags (listed first, in red), preview of the audit and sub-section scores labelled "Preview".

`api.audits.submit`, one transaction:

1. Lock audit and revision. Caller has an Assigned row.
2. Server re-checks: every result answered or N/A; required Observations present; no file still uploading.
3. Scores from `07-scoring.md` on the database rows. Write sub-section scores, `audit_section_scores`, revision `score`, `raw_score`, `has_red_flag`, `red_flag_count`, `auditor_names`, `submitted_on`, `submitted_by`, status Submitted, then `revision.submit()` (docstatus 1).
4. Audit Submitted, `released_revision`, `is_released` on, copy score and flags: hotel teams whose role is in the visibility can now read it.
5. End every Assigned auditor row with reason Submitted; they keep read only access to the audit and their notepad.
6. Queue after commit: PDF jobs (Full and Summary print formats), the report ready Notification fires on submit, webhooks fire from the Webhook DocType.

## 6. Restart (Administrator, reason)

`api.audits.restart` (Admin, reason): previous revision `archived` (still the `released_revision` until the new one is submitted); new revision copied from it (sub-sections with comments, results with all answers and `copied_from`, evidence rows pointing to the same files; notes not copied); audit `in_progress`; assign an auditor (last auditor preselected) as in section 2 step 4. Hotel teams keep seeing the archived revision until the new one is submitted.

## 7. Correct a submitted audit (Administrator, reason)

Azhar's decision (2026-10-18): Admin can correct a submitted audit without a restart.

- "Correct" opens the read only audit in correction mode for the released revision: the same item drawer with inputs enabled for Admin only. Saves go through `api.audits.correct`, which bypasses the In progress rule only for Admin, only on the released revision, and only with a reason.
- A reason is required once per correction session and is stored with every change in history.
- On closing the correction: scores of that revision are recalculated with the same engine and saved; `correction_count`, `last_corrected_at`, `last_corrected_by` updated; the audit's copied score and flags updated; new PDFs generated (the old ones stay in the file history); a "Corrected" line with date and reason shows on the audit and in the print formats.
- Corrections never touch archived revisions, and never change the template version or the frozen item wording.
- No email to hotel teams for a correction (Azhar can turn on a notification rule if wanted).

## 8. Tests this area must have

- Freeze copies only active rows of the version published at start, with its wording snapshot; later template or audit item edits change nothing in the audit.
- Hotel teams cannot read the audit or any of its rows before submit (every allowed endpoint, list, search, print and file link); afterwards they read it if their role is in the visibility.
- Submit refused with an unanswered item, a missing Observation, a file still uploading, or a removed assignment.
- After submit, results refuse changes from the auditor (controller and API); Admin correction with a reason changes them and recalculates scores exactly as the test cases say.
- Restart creates Revision 2 copying answers and evidence; Revision 1 opens read only; hotel teams see Revision 1 until Revision 2 is submitted.
- Two auditors saving the same item: the second gets a timestamp mismatch and sees the first's values.
- Offline banner appears and inputs disable when the browser goes offline (Playwright `setOffline`); an unsaved Observation saves once online.
- A removed auditor loses the audit and notepad on the next request.
