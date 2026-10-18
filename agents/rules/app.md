# Rules for sightline-app (the Frappe app)

Adds to `core.md`. The specification is `docs/src/content/docs/spec/app/` (start with `00-readme.md`; the issue names the sections you need).

## Layout

- The repository root is the Frappe app root. The Python package is `sightline/`; the Vue app is `frontend/` (built into `sightline/public/frontend/`).
- Install on a site: `bench get-app <repo url>` then `bench --site <site> install-app sightline`. Schema changes reach sites with `bench --site <site> migrate`.

## Frappe conventions

- DocTypes are JSON plus a Python controller, created the Frappe way (`bench new-doctype` or Desk on a developer site with `developer_mode`, then committed). Configuration is fixtures; data changes are patches in `patches.txt` (append only).
- If you change anything through Desk on a developer site, export it into the repository before the task ends (`bench --site <site> export-fixtures`, DocType JSON is written automatically in developer mode).
- Never modify Frappe itself: no forks, no monkey patches. Use hooks, documented overrides in `hooks.py`, or Sightline methods.
- The site runs only the Sightline app. Do not add ERPNext or any other app.

## Data and permissions

- Every hotel data read goes through `sightline.core.access` (Frappe permission hooks or `access.query_condition`). Every write goes through a service that calls `access.require`. No role names in code outside the access module and tests.
- Every new whitelisted method is added to the API allow list in the same pull request, with a security test.
- Admin has no access to issues, including through view as. Auditors have no access to issues.
- Pull requests that touch `sightline/core/access.py`, `sightline/core/allow_list.py`, authentication, view as, files or the security tests get the `security` label and are not merged by agents; Azhar or the orchestrating session reviews them.

## Screens

- Every screen is in the Vue app under `/s/`. No Desk screens for Sightline users.
- Only design system components and tokens (`docs/src/content/docs/design/`). Copy rules apply.

## Checks before every push

- `ruff check .` and `ruff format --check .`
- Python tests for what you changed (`bench --site <test site> run-tests --app sightline --module <module>` once a dev bench exists; pure modules with `pytest`).
- Frontend lint and tests once `frontend/` exists.
