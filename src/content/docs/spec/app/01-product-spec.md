---
title: "01. Product specification"
sidebar:
  order: 1
---

The product is the same whatever the stack. This file is shared word for word with the Django specification, except for references to other files.

Every product rule Sightline must follow. This is blueprint revision R2 plus the decisions Azhar made up to 2026-10-05, restated so the build agent does not need the old repo. Rule numbers (for example `R-ROLE-3`) are stable: tests and task files cite them.

## 1. Users and roles

Every user is on one of two sides, never both.

**Sightline side (platform roles, stored on the user)**

- **Admin:** a Sightline employee who runs the platform like a system administrator: masters, hotel groups and hotels, users, audit scheduling and assignment, corrections, settings, and every hotel group's audits and reports. The one exception is issues, which belong only to hotel teams (section 14).
- **Auditor:** a Sightline employee or hired freelancer (`auditor_type`: employee, freelancer) with a base city. Sees only the audits assigned to them, and what those audits need, while the assignment is active. After the submit, read only access to the audits they worked on.

**Client side (hotel team members, role stored on the membership)**

- **Group Head:** every hotel of their hotel group. Reads reports, creates, assigns and works issues, exports PDFs, uses the hotel group dashboard.
- **Hotel Manager:** their hotel. Invites and removes Staff, creates, assigns and works any issue in their hotel, reads reports, exports PDFs.
- **Staff:** their hotel. Creates issues, and reads and works the issues assigned to them or created by them. No reports export.

**Rules**

- R-ROLE-1: An Admin or Auditor is never a client-side member. The database refuses a membership or hotel group membership for a user whose platform role is admin or auditor.
- R-ROLE-2: Auditors reach a hotel only through an audit assigned to them.
- R-ROLE-3: Auditors have no access to issues at all: no list, no detail, no comments, no photos, no status history, no navigation item.
- R-ROLE-3a: Admin has no access to issues either, including through view as. Issues are a feature Sightline gives hotel teams, not part of Sightline's own work.
- R-ROLE-4: A client-side role belongs to the person's link with a hotel group or hotel, not to the person. One person can be Hotel Manager at two hotels and Staff at a third, all within one hotel group.
- R-ROLE-5: A person is a member of one hotel group at a time.
- R-ROLE-6: There is no Department Head role and no department scoping of anything.

## 2. Hotel groups, hotels and memberships

Hotel group → Hotels → Audits → Revisions → Results

- R-HG-1: A hotel group is the company that buys Sightline, with one hotel or many. Every hotel belongs to exactly one hotel group.
- R-HG-2: Each hotel group's data is kept apart from every other hotel group's. No screen, report, export or email mixes two hotel groups.
- R-HG-3: Onboarding: Admin creates the hotel group, adds its hotels (with a site contact), then invites the Group Head or Hotel Managers.
- R-HG-4: Membership is person + hotel + role (Hotel Manager or Staff). Hotel group membership is person + hotel group, role always Group Head.
- R-HG-5: Ending a hotel group: Admin sets status Ended. Its members lose access (their role assignments end). Its audits, reports and issues are kept indefinitely. Admin can read its audits and reports; its issues stay unread by anyone. Hotels can also be Paused or Ended individually.
- R-HG-6: Hotels never move between hotel groups. If a hotel changes owner, Admin ends it under the old hotel group and adds it again under the new one. History stays with the old one.
- R-HG-7: A hotel's size band is calculated, never typed: resort is always large; otherwise 40 rooms or fewer is small, 41 to 100 is medium, above 100 is large.

**Invites**

- R-INV-1: Admin and Auditor invites name no hotel group and no hotel.
- R-INV-2: Group Head invites name a hotel group. Hotel Manager and Staff invites name a hotel.
- R-INV-3: Hotel Managers invite Staff to their own hotel only. Admin invites everyone else.
- R-INV-4: A Hotel Manager can remove Staff from their own hotel (the membership is soft deleted).
- R-INV-5: The invite link expires after 7 days and works once. The token is stored hashed.
- R-INV-6: Accepting an invite signs the person in and lands them on their dashboard. With email code login there is no password to set.
- R-INV-7: Inviting an email that already has an active account adds the new membership to that account (same hotel group only) instead of creating a second account.

## 3. Access expiry

Every user account has an access expiry, set when the person is invited and changeable later.

- Options: 7 days, 30 days, 60 days, 90 days, Custom date, No expiry. 90 days is preselected.
- R-EXP-1: Applies to every role.
- R-EXP-2: Admin sets and changes expiry for anyone. Hotel Managers set and change it only for Staff they invited.
- R-EXP-3: At least one active Admin always has No expiry. The server refuses any change (expiry, disable, role change) that would leave none.
- R-EXP-4: On expiry the person cannot sign in and any open session ends on its next request. Their audits, comments and history stay.
- R-EXP-5: Open issues assigned to an expired person show as Unassigned. The `assigned_to` value is kept, so renewal restores it.
- R-EXP-6: An expired account is renewed with a new expiry; nothing is re-created.
- R-EXP-7: An Auditor's access to an audit also ends when Admin removes them or the audit is cancelled, whatever the account expiry.
- R-EXP-8: Email: access expired, to the person and to whoever invited them. There is no advance warning email (no reminders).

## 4. Hotel switching, My hotels and view as

**Hotel switching**

- R-SW-1: Client-side members with more than one hotel, and Admin, switch hotels from anywhere in the app. Switching always lands on that hotel's dashboard.
- R-SW-2: The app remembers the last hotel used (stored on the user, per account, not per device).
- R-SW-3: Switching hotels changes both what you see and what you can do (your role may differ per hotel).
- R-SW-4: Auditors do not switch hotels. They open audits from My audits.
- R-SW-5: **My hotels** (only for people with more than one hotel): each hotel with open issues, red flags, and the latest audit score for each audit template taken there, the audit template named, or no score. Never one score per hotel. For a Group Head, My hotels is the hotel group dashboard.

**View as (Admin support tool)**

- R-VA-1: Admin only. Admin picks a user, gives a reason, and sees the app exactly as that person sees it: same reads, same navigation, same hotel scope.
- R-VA-2: Always lands on that user's dashboard.
- R-VA-3: Read only. Nothing can be saved while viewing as someone. Enforced by the database (read-only transaction), not only the screens.
- R-VA-4: The user viewed, the reason, start and end are logged in `support_sessions`.
- R-VA-5: A banner shows whose view it is, with a Stop button.
- R-VA-6: The notepad of an Auditor is never shown in view as.

## 5. Masters

Masters are global: one list for every hotel group and hotel. Only Admin creates, edits and retires them. Everyone signed in can read them (except where noted). Hotel groups and hotels never own or copy masters.

**Master lists:** Sections, Sub-sections, Audit items, SOPs, Audit templates, Score scales, Evidence types, Reasons, Tags (for example FSSAI, Critical, Monsoon).

**Audit item fields:** permanent ID, code (readable, for example HK-014), label, Section and Sub-section, SOP (code, short description, link), score scale (0 to 5, or Yes / No), evidence types allowed, critical flag, default weight, default recommendation, tags, status (Draft, Active, Retired), revision number.

- R-MAS-1: Draft is Admin's working status. Only Active audit items go into audit templates and audits.
- R-MAS-2: An audit item's `id` never changes, so score trends stay correct.
- R-MAS-3: Amending an audit item's label, default recommendation or SOP needs a reason and raises its revision number by one. Every audit template using it shows the new wording from its next published version. Audits already started keep their frozen copy.
- R-MAS-4: Audit items are never removed. Admin can retire one. A retired audit item stays in old audits and reports, and cannot be added to an audit template or audit.
- R-MAS-5: The score scale belongs to the audit item, so it is the same in every audit template.
- R-MAS-6: Auditors add items to an audit only by picking from the Active audit items list. Nobody but Admin creates audit items.

## 6. Audit templates and versions

An audit template is a global master: a saved set of sub-sections and audit items used to start an audit. There are no hotel group or hotel copies.

**Fields:** name, description; sub-sections (each with a Section, name, weight, order); items (each with weight, critical flag, order); result visibility by role (Group Head, Hotel Manager, Staff, Auditor). Example: Financial & Accounting Practices visible only to Group Head and Hotel Manager. Leadership Capability Review: Group Head only.

- R-TPL-1: Admin can add items and sub-sections. They are never removed (the database refuses deletes).
- R-TPL-2: Admin can disable and re-enable an item or sub-section. A disabled one stays in the template, is not copied into new audits, and keeps its history. A disabled sub-section takes its items with it.
- R-TPL-3: Admin can amend an item's weight, critical flag, sub-section and order, and a sub-section's name, Section, weight and order.
- R-TPL-4: Wording and guidance live only on the audit item, never on the template.
- R-VER-1: Editing an audit template creates (or continues) a draft version. Publishing makes it the version used for new audits. A published version is frozen for everyone: its rows can never change.
- R-VER-2: A draft version can be discarded.
- R-VER-3: Starting an audit freezes a copy of the published version: active sub-sections and active items only, with their weights and critical flags, and the audit item's current wording.
- R-VER-4: A scheduled audit uses the version published when it starts, not when it was scheduled.
- R-VER-5: A restarted audit keeps the version frozen in its first revision.
- R-VER-6: Later edits to templates or audit items never change past audits or reports.

## 7. Sections and sub-sections

- R-SEC-1: Sections are a global master list kept by Admin, for example Rooms & Housekeeping, Kitchen & Back of House. They only classify and organise.
- R-SEC-2: Sections never scope people, issues, permissions, notifications or hotels. A hotel has no list of its own Sections.
- R-SEC-3: An item that does not apply at a hotel is marked N/A by the auditor. N/A is left out of every score.
- R-SEC-4: Scores roll up by Sub-section and by Section in reports and history.

## 8. Audit flow

1. **Schedule:** Admin creates the audit for a hotel: from an audit template, or as a custom audit, a date or date window, and one or more auditors (or none yet). A custom audit works exactly like any other audit; the only difference is that Admin builds its sub-sections and items by picking audit items, instead of them coming from a template. Admin also sets its result visibility, the same choice a template carries.
2. **Start:** an assigned auditor sees the audit in My audits and starts it on the day. No accept or decline step.
3. **Freeze:** the server copies the published template version into the audit as Revision 1 (active sub-sections and items only).
4. **Capture:** the auditor opens each item from the item list and each answer saves at once.
5. **Add items:** the auditor can search Active audit items and add them during the audit, into an existing sub-section.
6. **Review:** unanswered items, missing Observations, red flags and unsynced changes shown before submit.
7. **Submit:** blocked until every item is answered or N/A, every required Observation is filled, and everything is synced.
8. **Lock:** the revision is locked; the auditors' assignments end with reason `submitted`.
9. **Scores saved:** sub-section, Section and audit scores calculated once on the server and stored. Never recalculated.
10. **Report ready:** PDFs generated and an email sent to the Hotel Manager and Group Head (only roles the audit's visibility allows).

**Audit status:** Scheduled → In progress → Submitted. A Scheduled audit can be Cancelled with a reason.

**Scheduling and assignment**

- R-AUD-1: Admin schedules and assigns every audit. Hotel teams do not.
- R-AUD-2: A date window has a first and last day; the auditor starts on any day within it. A fixed date is a window of one day. Starting outside the window is allowed only for Admin-extended windows (Admin edits the window).
- R-AUD-3: Recurring schedule: hotel + audit template + every 1, 3, 6 or 12 months. The app always keeps the next audit of each active schedule created, unassigned, for Admin to assign.
- R-AUD-4: Admin works from an audit calendar and a queue: unassigned audits, and audits whose window has passed without a start.
- R-AUD-5: Reassign: Admin can change the auditors any time before the audit starts. A removed auditor loses access at once.
- R-AUD-6: Cancel: Admin can cancel before start, with a reason.
- R-AUD-7: Hotel teams never see a scheduled audit, its date, its schedule or its recurring schedule. They see an audit only once a revision is submitted, so Mystery Guest visits stay unannounced. Enforced in the database through scope.
- R-AUD-8: Audit reference is unique and human readable: `SL-<year>-<4 digit sequence per year>`, for example SL-2026-0012, printed on reports.
- R-AUD-9: Admin sees each auditor's upcoming assignments when assigning, so load can be balanced.

**Auditor access**

- R-AA-1: An assignment is active from when Admin assigns it until the audit is submitted or cancelled, or Admin removes the auditor. It then ends once with a reason: `submitted`, `cancelled` or `removed`. An ended row never becomes active again; Admin assigns again with a new row.
- R-AA-2: While active, the auditor sees the audit, the hotel's basic details and site contact, and the hotel's earlier submitted audits where those audits' visibility lists the Auditor role.
- R-AA-3: Ended by submit: the auditor keeps read only access to the audits they worked on: the audit, every released revision, the report, their own notepad (they can still read and edit it), and the hotel's basic details so My audits can show the hotel name. They read their own audits whatever the visibility says. They cannot change any answer. A revision still in progress (for example a restart assigned to another auditor) stays hidden from them.
- R-AA-4: Ended by removal or cancellation: all access to that audit ends at once, notepad included.

**Notepad and auditor comments**

- R-NOTE-1: Each auditor has one private notepad per audit. Only the auditor who wrote it can read or edit it, while the assignment is active or ended by submit. Admin, other auditors and hotel teams never see it, not even through view as. It is not part of the audit, report, score or change log. It is not copied by a restart.
- R-NOTE-2: Auditor comments: one per sub-section and one overall per revision. They are answers: they freeze on submit and show in results to the roles allowed to see them. A restart copies them into the new revision.

**Item list and item detail**

- R-ITEM-1: The item list shows only each item's title and state: Not started or Done (Done means scored or N/A), with a Critical marker on critical items.
- R-ITEM-2: Opening an item shows its detail in a drawer (phone: full-height sheet; laptop: side panel): score or N/A, evidence, Observation, Responded by, Team response, Reason, Recommendation, SOP, critical flag, earlier results.
- R-ITEM-3: Previous and Next move through items without going back to the list.
- R-ITEM-4: A submitted audit and an archived revision open the same way, read only.

**Revisions**

- R-REV-1: A submitted revision is locked for auditors and hotel teams. Only Admin can correct it, with a reason (R-COR).
- R-REV-2: For a new round of capture, Admin restarts the audit with a reason. This creates a new revision copied from the previous revision's answers, auditor comments and evidence (evidence rows point to the same stored files). The previous revision becomes Archived: read only, never deleted, still openable.
- R-REV-3: Admin assigns the new revision to an auditor, with the last auditor preselected. It is captured, reviewed and submitted like the first.
- R-REV-4: Until the new revision is submitted, hotel teams keep seeing the last submitted one.
- R-REV-5: Scores are saved for each revision when it is submitted. Score history, dashboards and reports use the latest submitted revision.
- R-REV-6: The audit and its report show "Revision N of M" and the revision history: who restarted, when, and the reason.

**Corrections (Azhar, 2026-10-18)**

- R-COR-1: Admin can correct any answer of a submitted revision (score, N/A, Observation, Responded by, Team response, Reason, Recommendation, evidence, auditor comments) without a restart.
- R-COR-2: A reason is required. Every change is in the history with who, when and the reason.
- R-COR-3: The revision's scores are recalculated with the same rules and saved; its PDFs are generated again; the audit and its report show "Corrected" with the date and reason.
- R-COR-4: Archived revisions are never corrected. The template version and frozen item wording never change.

## 9. Item fields

**Captured by the auditor (saved on the audit result)**

- Score or N/A
- Evidence
- Observation: what the auditor found
- Responded by: name and role (free text)
- Team response: what they said
- Reason: one of the Reasons master (No SOP, Not trained, Short of stock, Equipment not working, Already reported, Disagrees)
- Recommendation: starts with the item's default recommendation; the auditor edits it

**Shown in the item detail while capturing**

- SOP code, short description and link
- Critical flag
- Earlier results on this audit item at this hotel: the last 3 submitted audits from any audit template, newest first, each with audit date, revision, score as a red, amber or green pill (or N/A), Observation and Recommendation, and a link to open that audit read only. Only results whose audit visibility lists the Auditor role. Auditor names are not shown. Never pre-fills the score.

**Rules**

- R-FLD-1: These fields show in the item detail, never in the item list.
- R-FLD-2: Responded by, Team response and Reason are optional, so scoring is never slowed down.
- R-FLD-3: Observation is required when the score is 2 or below, or No.
- R-FLD-4: Scoring one item on a phone takes under 10 seconds (one tap on the score, Next).

## 10. Evidence

- R-EV-1: Photo: taken with the phone camera, compressed in the browser to about 300 KB (longest side 1600 px) before upload.
- R-EV-2: Document: PDF, Excel (xlsx, xls), or image, for example a scanned register. Maximum 20 MB.
- R-EV-3: Sample check: number checked, number with exceptions, short note, for example "10 invoices checked, 2 exceptions". No file.
- R-EV-4: Each item allows only the evidence types set on its audit item. More than one piece of evidence per item is allowed.
- R-EV-5: A restart copies evidence into the new revision without uploading again.
- R-EV-6: Photos and documents open only through links that expire (5 minutes).

## 11. Connection

Azhar's decision (2026-10-18): there is no offline capture.

- R-OFF-1: The app needs a connection. Every answer is saved on the server as it is entered.
- R-OFF-2: When the connection drops, the app shows that it is offline and disables every input until it is back. Nothing is stored on the device.
- R-OFF-3: A value typed just before the connection dropped stays in the field and saves when the connection returns; until then the field shows "Not saved".
- R-OFF-4: Photos upload at once with a progress bar and a Retry on failure.

## 12. Scoring

Full algorithm and test cases: `07-scoring.md`. Summary:

- Scale 0 to 5: 0 critical fail · 1 poor · 2 below standard · 3 acceptable · 4 good · 5 excellent. Yes counts as 5, No as 0. N/A is left out of every calculation.
- Item weight: 1 by default, can be raised in the template. Sub-section weight: High 3, Medium 2, Low 1.
- Sub-section score = sum(score × weight) / sum(5 × weight) × 100, applicable items only.
- Section score = weighted average of its sub-section scores (by sub-section weight).
- Audit score = weighted average of all sub-section scores (by sub-section weight).
- A sub-section with no applicable items is left out.
- A critical item scored 0 or No raises a red flag. Any red flag caps the audit score at 50.
- Bands: Excellent 90 and above; Good 75 to below 90; Needs work 60 to below 75; Poor below 60.
- Scores are calculated at submit and saved; they are recalculated only when Admin corrects that revision (R-COR-3).
- R-SCO-1: A score belongs to one audit revision. There is no hotel score, no hotel group score, no average across audit templates and no ranking of hotels at all.
- R-SCO-2: Where a screen, report or email needs a score for a hotel, it shows the latest audit score for each audit template, with the audit template named, or no score.
- R-SCO-3: Ops & Quality starting sub-section weights come from their Section: High for Rooms & Housekeeping, Kitchen & Back of House, Safety, Security & Compliance; Medium for Food & Beverage, Front Office & Guest Services, Engineering & Maintenance; Low for Arrival & Exterior, Public Areas & Facilities, Wellness & Recreation, Staff, Grooming & Service Culture.

## 13. Critical items and red flags

- R-RF-1: A critical item scoring 0, or answered No, raises a red flag.
- R-RF-2: A red flag caps the audit score at 50, whatever the average.
- R-RF-3: Red flags show first on the report, the hotel dashboard and the email.

## 14. Issues

An issue is a simple to-do item for the hotel team. It stands on its own: no link to an audit, revision, result or audit item. Submitting an audit never creates one.

**Who can use issues**

Issues belong to the hotel teams. They are a feature Sightline gives hotels, not part of Sightline's own work, so Sightline Admin has no access to issues: no list, no records, no counts, no emails. Admin can still configure the Issue workflow (states and transitions) as part of running the platform.

| Role | Read | Create | Assign | Work (edit, change status, set Done) | Comment |
|---|---|---|---|---|---|
| Admin | None | No | No | No | No |
| Group Head | Every hotel of their group | Yes | Yes | Yes | Yes |
| Hotel Manager | Their hotel | Yes | Yes | Yes | Yes |
| Staff | Only issues assigned to them or created by them, in their hotel | Yes | No | Issues they can read | Issues they can read |
| Auditor | None | No | No | No | No |

**Fields:** title, details, hotel, assigned to (one person on that hotel's team, or empty), due date, priority (high, medium, low), photos, threaded comments (author, time, photos and files allowed).

**Status:** Open → In progress → Done, with Reopen from Done. These are the seeded states of the Issue workflow; Admin can add states (for example "Waiting for vendor") and their transitions without code.

- R-ISS-1: Every status change is kept with who and when.
- R-ISS-2: The due date is set by the person assigning (or the creator).
- R-ISS-3: Assignable people: Group Heads of the hotel's group, and Hotel Managers and Staff of that hotel, with active accounts.
- R-ISS-4: An issue never shows on an audit, in an item drawer, in earlier results or in a report. It has no department.

## 15. Email notifications

Email is the only notification channel.

| Email | To | Timing |
|---|---|---|
| Invite to Sightline (names the hotel group or hotel for client roles; none for Admin and Auditor) | Invitee | At once |
| Your sign-in code | The person signing in | At once |
| Audit assigned to you | Auditor | At once |
| Audit taken off you, or cancelled | Auditor | At once |
| Issue assigned to you | Assignee | Each or daily digest |
| Comment added on your issue (you created it or are assigned) | Creator and assignee, not the commenter | Each or daily digest |
| Status changed on an issue you assigned | The assigner | Each or daily digest |
| Audit report ready (revision number, audit template named, that audit's score, red flags first; never a hotel score) | Hotel Managers of the hotel and Group Heads of the group, if the audit's visibility allows their role | At once |
| Access expired | Person and their inviter | At once |

- R-EM-1: Sent by a background job, retried if it fails.
- R-EM-2: Every email logged: to whom, which template, subject, related record, queued, sent or failed, attempts, error.
- R-EM-3: Daily digest: each person can get issue emails as one email a day instead of one each. Group Heads start on the daily digest; everyone else starts on each.
- R-EM-4: There are no reminder emails (no due soon, no overdue, no access expiring warning). Invites, sign-in codes, audit assignment and access expired emails always send at once, never in a digest.
- R-EM-6: Sent from `no-reply@sightline.zarnik.com` through Resend.
- R-EM-5: Emails go only to people with active accounts, except the invite and the access expired email.

## 16. Reports and PDF export

**Full report**

1. Cover: hotel group, hotel, audit template, audit reference, date, auditors, revision number and number of revisions.
2. Audit score with band and change from the last audit of the same audit template at that hotel.
3. Red flags.
4. Section scores and sub-section scores, each with change from the last audit of the same audit template.
5. Findings: results scored 2 or below or No: score, photo, Observation, Team response, Reason, Recommendation. Grouped by Section and sub-section.
6. Auditor comments (overall and per sub-section).
7. Revision history (revision, who restarted, when, reason), only when there is more than one revision.
8. Corrections (date, who, reason), only when the revision was corrected.

**Summary report:** cover, scores and red flags only, for owners who will not read every page.

- R-REP-1: The report is a page in the app (built for phone and laptop) and a Frappe print format for the PDF, generated on the server from the same report data.
- R-REP-2: Each PDF export is stored with the date it was made and the revision it shows. Submit generates the full and summary PDFs automatically.
- R-REP-3: Every report names the auditor or auditors.
- R-REP-4: An archived revision's report can still be opened, marked Archived.
- R-REP-5: Export: Admin, Group Head, Hotel Manager. Staff and Auditors cannot export (Auditors keep read only access in the app after submit).
- R-REP-6: Results hidden by the audit's visibility are never in a report shown to a role that cannot see them. A role that cannot see results of an audit does not see the report at all.

## 17. Score history

Audit, Section and sub-section scores are compared only within the same audit template. Item history belongs to the audit item at the hotel, across every audit template.

- Audit score trend across the audits of one audit template at a hotel. Never one line that mixes audit templates.
- Section and sub-section trends.
- Change from last audit on every score, against the previous audit of the same audit template at the hotel.
- Most improved and most declined items, by audit item and hotel, across audit templates.
- Repeat failures: items scoring 2 or below (or No) in two or more audits in a row, by audit item and hotel.
- Reason patterns, for example "40% of failures this quarter: Short of stock".
- Issue closure: issues opened and done per hotel per month.
- Item history: every submitted result for an audit item at a hotel, newest first, with audit template, date, revision, score, Observation and Recommendation.
- R-HIS-1: Each audit counts once, with its latest submitted revision.
- R-HIS-2: Visibility applies: a role sees history only from audits whose visibility lists that role.

## 18. Hotel group dashboard

For Group Heads and Admin. Always within one hotel group. Admin sees the same dashboard without any issue figures.

- Every hotel of the group: open issues (Group Heads only), red flags (on each hotel's latest audits), and the latest audit score per audit template with change from the audit before, the audit template named. A hotel with no submitted audit shows no score.
- Search by hotel name; filter by city, size band and audit template; paged on the server.
- Hotel group totals: open issues (Group Heads only) and red flags. No score is totalled or averaged for the group.
- R-CMP-1: There is no hotel comparison and no ranking of hotels anywhere (Azhar, 2026-10-18).

## 19. Hotel dashboard (Hotel Manager, and Admin or Group Head after switching to a hotel)

- Red flags first (from the latest audits).
- Latest audit score per audit template with change, template named.
- Open issues, recent reports.

## 20. Screens: what people must be able to do

Screens are built in the Sightline app (Vue 3 and frappe-ui) from shared list, form and page components driven by DocType metadata, plus focused pages where a role needs them (`09-frontend.md`), using the approved designs from the old repo. These limits apply:

- R-UI-1: One app for every role, Admin included, on phone and computer. It is an installable web app (PWA): people can add it to the home screen on Android and iPhone and it opens full screen with its own icon. An "Install app" button sits in the user menu; the app never nags with repeated prompts. No app store.
- R-UI-2: Audits can be captured on a phone (online; see section 11).
- R-UI-3: Each role sees only what permissions allow; hidden actions are not rendered, not just disabled.
- R-UI-4: Built only from design system components and zarnik-ds brand values.
- R-UI-5: Every list is searched, filtered, sorted and paged on the server. People can save a list's filters, sort and columns as a personal saved view.
- R-UI-6: Every collection page uses the standard list view component (the list shell, `09-frontend.md` section 5).
- R-UI-7: List rows: title, at most one meta line with at most 2 fields, at most one status pill. A Critical or high priority marker may sit next to the title. Laptop tables show at most 5 columns by default; more from the Columns menu.
- R-UI-8: Pickers (hotel, user, audit item, auditor) search as you type.

**Home and navigation by role**

- Admin: Masters (audit items, audit templates, Sections and other masters); Hotel groups and users (hotel groups, hotels, client-side users, auditors, invites); Audit schedule (calendar, unassigned queue, assignments). Then Audits, Reports, Logs (email log, job log, change log, support sessions). No Issues item.
- Auditor: My audits (upcoming, in progress, submitted). No Issues item.
- Group Head: hotel group dashboard.
- Hotel Manager: hotel dashboard.
- Staff: My issues.
- Everyone: Profile at `/profile` with a person icon: own name, email (read only), email frequency (each or daily digest) at `/profile/email`, signed-in devices. No phone number, no Settings item. Hotel settings stay on the hotel.

## 21. Acceptance criteria (the product is done when all pass)

- A user with three memberships sees exactly the right data in each hotel, nothing more.
- A user in Hotel A gets zero rows when querying Hotel B directly through the API.
- A user in Hotel Group A gets zero rows from Hotel Group B, and no screen or report mixes two hotel groups.
- A field hidden from a role by permission level is absent from every API response to that role, and a field read only for a role refuses writes.
- An Auditor reads nothing of an audit once their assignment on it is removed or cancelled; after the submit they read it, read only.
- An audit Admin assigns shows in the auditor's list and can be started with no accept step; once reassigned, the old auditor cannot open it.
- No department, no Department Head role and no page description text anywhere; every collection page uses the list shell.
- Issues are standalone; no audit screen, report or PDF shows or creates them; Auditors cannot see or create them.
- An expired user cannot sign in; their audits, comments and history stay.
- The last Admin with No expiry cannot be given an expiry.
- When the phone loses connection the app says it is offline and disables inputs; nothing typed is lost once it reconnects.
- Admin corrects a submitted audit with a reason; scores are recalculated and the report shows the correction.
- Scoring one item on a phone takes under 10 seconds.
- Scores match the test cases in `07-scoring.md` exactly.
- A critical item scored 0 raises a red flag and caps the audit score at 50.
- Editing a template never changes a submitted audit.
- A submitted audit cannot be changed by auditors or hotel teams; a restart creates Revision 2 and Revision 1 still opens, read only.
- An issue assignment sends an email, logged as sent.
- Three months of audits for one hotel and one audit template show a trend chart and a PDF an owner understands in two minutes.
- A full backup restores onto a fresh server and the app works.
- View as shows exactly the viewed user's data and saves nothing.
