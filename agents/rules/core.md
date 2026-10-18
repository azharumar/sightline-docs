# Core rules for every Sightline repository

These rules apply to every AI agent (Claude Code, Cursor or any other) and every person working in `sightline-app`, `sightline-web` or `sightline-docs`. Repository-specific rules add to them (`app.md`, `web.md`, `docs.md` in this folder).

## 1. One source of truth

- The `sightline-docs` repository is the only source of rules, specification, design decisions and agent procedures. In `sightline-app` and `sightline-web` it is the `docs/` submodule.
- Never copy a rule, a specification section or a design value into another repository. Link to it or read it from `docs/`.
- Never edit anything inside a `docs/` submodule from a consuming repository. Changes go to `sightline-docs` as their own pull request, and the consuming repository then moves its submodule pointer.
- If what you are asked to do contradicts the specification, stop that part and open a `type:question` issue (see `docs/agents/skills/ask-question/SKILL.md`). Never quietly pick one side.
- `reference/` in `sightline-docs` is frozen material from the old build. It informs porting; the specification wins when they differ.

## 2. How work is organised

- Work comes only from GitHub issues in the repository where the code changes. One issue, one branch (`issue-<number>-<short-slug>`), one pull request that says `Closes #<number>`.
- Follow `docs/src/content/docs/agents/workflow.md` for picking, building, checking and merging.
- Issues are small: about one hour of agent work, a handful of files. If an issue is bigger, split it into sub-issues first (`plan-epic` skill) instead of building it.
- Status lives on the issue labels and the GitHub Project, never in files in the repository.

## 3. Token discipline

- Read only what the issue lists under "Spec sections" and "Files it may touch", plus the rules files. Do not scan the whole repository or the whole specification.
- Search with targeted file and text searches; open only the lines you need.
- Keep replies and pull request descriptions short: what changed, how it was checked, anything left open.
- When orchestrating, give each issue to a fresh sub-agent with only the issue number. Keep only issue numbers and outcomes in your own context.

## 4. Quality bar

- Every pull request has tests for what it changes, and all checks pass before merge.
- Re-read your own diff before opening the pull request: what would a reviewer or CI reject?
- Smallest change that meets the issue's "Done when" list. No drive-by refactors, no unrequested features.
- Commit and push after every working step, so a restart loses minutes.

## 5. Copy rules (screens, emails, PDFs, messages, docs)

- Plain, literal labels that say what the thing is. No eyebrows. No em dashes. No slogans or metaphors. No page description text under page titles.
- Use the glossary in `docs/src/content/docs/spec/app/00-readme.md`. Never use: audit type, client, library item, department, Department Head, fixes or actions or tasks (for issues), management response, property score, hotel score.
- Dates shown in India time.

## 6. Safety

- Secrets only in environment variables, site config or the server's secret store. Never commit a secret, never print one, never ask for production values.
- Never force-push to `main`, never rewrite shared history, never disable or skip a test to get green.
- Never install packages or services that the specification does not list without a `type:question` issue first.

## 7. Never build

Marketing features inside the app · CRM or lead tracking · invoicing, billing, payments · WhatsApp, SMS, push notifications · native or app store apps · importing hotel accounts, ledgers or PMS data · supplier recommendations · paying auditors or timesheets · hotel group contracts or pricing · benchmarking or comparing hotels · reminder emails · offline capture.
