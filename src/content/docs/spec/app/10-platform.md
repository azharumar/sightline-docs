---
title: "10. Platform: hosting, operations, security, testing"
sidebar:
  order: 10
---

## 1. Hosting (self-hosted)

- **Production today:** `app.sightline.zarnik.com` points (DNS only) to the Frappe instance at `161.97.167.96`, live with a valid HTTPS certificate (Azhar, 2026-10-18). The app is installed there with `bench get-app` and `bench --site app.sightline.zarnik.com install-app sightline` (see the app repository's README). How that instance is run (bench directly on the host or frappe_docker) is recorded in the runbook once confirmed; until then the points below describe the target setup.
- Production site `app.sightline.zarnik.com`, staging site `staging.sightline.zarnik.com`, each a separate stack (own MariaDB, redis, workers, scheduler, bucket and secrets). Never two environments on one bench.
- Image: a custom image built from frappe_docker's `images/custom` Containerfile with `apps.json` listing `frappe` (pinned tag) and `sightline` (this repo, pinned commit). Built on the Dokploy server from this repository at a pinned commit (no GitHub Actions). The Vue app is built during the image build (`yarn build` in `frontend`).
- Containers: `frontend` (nginx), `backend` (gunicorn), `websocket`, `queue-short`, `queue-long` (and `queue-default`), `scheduler`, `db` (MariaDB), `redis-cache`, `redis-queue`, `backup`. Traefik in Dokploy terminates HTTPS with Let's Encrypt.
- Deploys: merge to `main` builds the image and deploys staging; production deploys from the `production` branch after staging is green. Deploy runs `bench --site <site> migrate` (DocType changes, patches, fixtures) before switching traffic; `bench build` is part of the image.
- Rollback: redeploy the previous image; data patches are written to be safe to run twice and never need a reverse.
- Site config (`site_config.json`, set by Dokploy secrets, never in the repo): `db_password`, `encryption_key`, R2 endpoint, bucket, keys, Resend signing secret, Sentry DSN, `host_name`. The Resend SMTP password is stored in the Email Account (encrypted by Frappe).
- Frappe version upgrades: minors monthly on staging, then production; majors as a planned task with the full test suite and a restore drill first.

## 2. Backups and restore

- Nightly `bench --site <site> backup` (database and site config; files are in R2) copied to the second server with rclone SFTP; nightly `rclone sync` of the R2 bucket to the same second server without deleting on the backup side.
- Keep 30 daily and 12 monthly backups.
- `deploy/backup/restore.sh`: new bench from the same image, `bench --site <site> restore <db.sql.gz>`, point at a restored bucket copy, run a smoke check (login, open an audit report, download a PDF). Tested against a sample backup by `scripts/check.sh --full`.
- Monthly restore test on a fresh server; one full drill before the first real hotel goes live.

## 3. Monitoring and logging

- sentry-sdk initialised in the app (backend and workers) and @sentry/vue in the app, sending to GlitchTip, with `send_default_pii=False` and a scrubber for emails, codes, notepad text and answers.
- Frappe's Error Log stays on; a scheduled check alerts when new errors spike.
- Alerts to audits@zarnik.com: error spike, uptime failure, email queue errors in the last hour, scheduler not run in 15 minutes, RQ queue older than 10 minutes.
- Uptime: GlitchTip uptime monitor on `/api/method/ping` every minute.
- Admin screens in the app: email log (Email Queue), error log, background jobs (RQ Job), scheduled job log.
- Logs: container stdout collected by Dokploy; Frappe's request and worker logs; never log codes, tokens, notepad text or answers.

## 4. Security

- HTTPS only; HSTS; secure cookies (`sid` HttpOnly, SameSite Lax); CSRF token on every call.
- Desk closed to Sightline roles (`desk_access = 0`, redirects) and the API allow list on every request (`04-permissions.md` section 7).
- Password login disabled for Sightline users (random passwords never shown, `/login` redirected); System Manager accounts use passwords plus Frappe's two-factor authentication.
- Email code: 6 digits, stored hashed in redis with a 10 minute expiry, 3 attempts, rate limited; the same response whether the email exists or not.
- Invite links expire after 7 days and work once.
- Files private in R2; links expire in 5 minutes; uploads checked by real type and size.
- Allowed CSP and security headers set in nginx: `default-src 'self'`, images and connections allowed to the R2 endpoint, `frame-ancestors 'none'`.
- Secrets only in site config and Dokploy; gitleaks in `scripts/check.sh`.
- Dependency checks: `pip-audit` on the app's dependencies and `yarn audit` on the frontend in `scripts/check.sh --full`.
- Admin view as is read only and logged.

## 5. Testing

- **Backend:** `bench --site test_site run-tests --app sightline` (FrappeTestCase) on a fresh test site: DocType rules, services, API methods, the security suite, the allow list completeness test. Pure modules (scoring, size band, digest grouping) also run under plain pytest with hypothesis.
- **Frontend:** ESLint, Prettier, Vitest; Playwright against a running staging-like stack (phone and laptop profiles), with axe checks.
- **Copy lint** over the Vue app, Jinja templates, email templates and fixtures (em dashes, banned words).
- **Fixtures check:** `bench --site test_site export-fixtures` produces no diff, so database edits are never left out of the repo.
- No CI. `scripts/check.sh` runs the fast set before every push; `scripts/check.sh --full` runs everything on the developer bench (fresh test site) before merging a pull request that changes DocTypes, permissions, the API or the frontend build.
