---
title: "08. Email, notifications, files and PDF"
sidebar:
  order: 8
---

## 1. Email (Frappe Email Account through Resend SMTP)

- **Email Account** (fixture plus setup checklist): outgoing only, `email_id = no-reply@sightline.zarnik.com`, sender name "Sightline", SMTP server `smtp.resend.com`, port 587 with STARTTLS (or 465 with SSL), login `resend`, password = Resend API key (entered by Azhar on each site, never in the repo), "Default Outgoing" on. Incoming email is off.
- Azhar verifies `sightline.zarnik.com` in Resend (SPF, DKIM, DMARC) before the email epic finishes.
- Frappe's **Email Queue** sends and retries; every email is visible to Admin in the app's email log (a Sightline screen over Email Queue: to, subject, status, error, retry).
- Development and CI: an Email Account pointing at Mailpit.
- **Delivery events:** a guest method `sightline.api.webhooks.resend` checks Resend's signature (Svix headers with the signing secret from site config), stores the raw event in a **Sightline Inbound Event** row (unique by event id), and a job marks the Email Queue row and sets `email_bounced` on the user for hard bounces. Bounced addresses are skipped by the notification layer until Admin clears the flag.

## 2. Notifications

Built on Frappe's **Notification** DocType (channel Email, Jinja subject and message, recipients by document field or role, conditions) and **Email Template**, all shipped as fixtures, plus a thin Sightline layer for things Frappe does not express:

- **Recipients by hotel role** (for example "Hotel Managers of this hotel"): the Notification uses a `Method` event or a recipient field filled by `sightline.core.recipients` before send, so recipients come from Hotel Member and Hotel Group Member, filtered by the audit's visibility where relevant.
- **Daily digest:** for people with `email_frequency = Daily digest`, digest-eligible notifications are written as Notification Log rows instead of emails (the `before_send` hook in `sightline.core.digest`), and the daily job sends one email per person listing them, grouped by hotel, dropping any the person can no longer read.
- **Only active readers:** the layer drops recipients who are not Active or can no longer read the record.

| Email | Trigger | To | Digest allowed |
|---|---|---|---|
| Sign-in code | `api.auth.request_code` (sent directly, not a Notification) | Person signing in | No |
| Invite (names the hotel group or hotel for client roles) | Sightline Invite created or resent | Invitee | No |
| Audit assigned to you | Audit Auditor row added | Auditor | No |
| Audit taken off you, or cancelled | Audit Auditor row ended (Removed or Cancelled) | Auditor | No |
| Issue assigned to you | Issue `assigned_to` changed | New assignee | Yes |
| Comment on your issue | Comment added on a Issue | Creator and assignee, not the commenter | Yes |
| Status changed on an issue you assigned | Issue workflow state changed | `assigned_by` | Yes |
| Audit report ready (template named, revision N of M, that audit's score and red flags first; never a hotel score) | Audit Revision submitted | Hotel Managers of the hotel and Group Heads of the group whose role is in the visibility | No |
| Access expired | Access expiry job | The person and `invited_by` | No |
| Daily digest | Daily job | People on the daily digest | n/a |

No reminders (no due soon, no overdue, no access expiring warning). Group Heads start on the daily digest. Wording is ported from the old repo's `src/emails/templates/`, written as Jinja with CSS inlined (Frappe inlines styles in emails).

## 3. Files on Cloudflare R2

Frappe stores files on the server disk by default. Sightline keeps every file in R2 instead, with Frappe's File DocType as the record.

**Upload (photos, documents, issue photos, comment files):**

1. App calls `api.files.presign_upload(doctype, name, field, content_type, size, sha256)`. The method checks `access.can(user, "attach", doc)`, the allowed type and size for that field, creates a File row (`is_private = 1`, `file_url = /api/method/sightline.api.files.download?file=<name>`, custom fields `storage = R2`, `storage_key`, `sha256`, `upload_status = Pending`), and returns a presigned PUT URL (5 minutes, content type and length signed; R2 has no presigned POST).
2. The browser PUTs the file to R2 with a progress bar.
3. App calls `api.files.confirm_upload(file)`: HEAD for size, first 262 bytes checked with `filetype`; `upload_status = Ready`, or the object is deleted and the File marked Rejected.
4. A duplicate (same record and sha256) returns the existing File.

**Download:** `api.files.download(file)` loads the File, checks `access.can(user, "read", attached_doc)`, and redirects to a 5 minute presigned GET. Links are never stored or cached. Frappe's own `/private/files/...` paths are not used for Sightline files, and Frappe's `upload_file` method is overridden for Sightline roles so nothing lands on local disk.

**Keys:** `<doctype>/<hotel_group>/<hotel>/<docname>/<file name>.<ext>`. Bucket private, one per environment, bucket-scoped tokens, CORS for PUT and GET from the site origin only.

**Limits:** photos JPEG, PNG, WebP, HEIC up to 2 MB (the app sends about 300 KB, longest side 1600 px); documents PDF, XLSX, XLS, JPEG, PNG up to 20 MB; issue and comment files up to 10 MB.

**Deletion:** files are never deleted while their record exists; the cleanup job removes Pending uploads older than 48 hours.

**Backups:** R2 is synced nightly to the second server (`10-platform.md`), separately from `bench backup`, which no longer contains the files.

## 4. Reports and PDF

- **In the app:** the report is a Vue page (`/audits/:id/report`), designed for phone and laptop, reading `api.reports.get(revision, report_type)`. That method builds the report data once (cover, score with band and change, red flags, Section and sub-section scores with change, findings with photos, auditor comments, revision history, corrections), applying visibility and field rights.
- **PDF:** two Frappe Print Formats on Audit Revision, "Sightline Full" and "Sightline Summary" (Jinja, shipped as fixtures), rendered from the same report data function (`frappe.get_attr("sightline.reports.data.build")` in the template context), so the numbers match the app exactly.
- Charts in the print formats are server-side SVG from Jinja macros (`sightline/reports/templates/macros/charts.html`), because the PDF generator does not run JavaScript.
- Photos in the PDF are embedded as data URIs read from R2 by the job, so rendering makes no network calls.
- `render_pdf` runs Frappe's PDF generation for the print format, saves the PDF to R2 as a File attached to the revision, and writes an Audit Report row (type, file, generated on). Submit and correction create both PDFs; "Export again" creates a new one; older PDFs stay listed.
- Who can download: Admin, Group Head, Hotel Manager when their role is in the visibility. Staff read the report page only; Auditors read it after submit only.
- Archived revisions print "Archived"; corrected revisions list their corrections.
- The PDF generator is whatever the pinned Frappe version uses by default (wkhtmltopdf or Chrome). Epic 0 confirms it is installed in the image and renders a test print format with SVG and fonts from zarnik-ds.
