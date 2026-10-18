# Rules for sightline-web (marketing site)

Adds to `core.md`. Feature work on this repository starts after the app's first release; until then only setup tasks. The specification is `docs/src/content/docs/spec/blueprint/part-3-website.md`, to be reconciled with the app decisions of 2026-10-18 before any page is built (the app no longer compares hotels, sends no reminders, and has no offline capture).

## Layout and stack

- Astro (static output), deployed by Netlify to `https://sightline-web.netlify.app` from `main`; `netlify.toml` holds the build settings.
- Pages in `src/pages/`, shared layout and components in `src/layouts/` and `src/components/`. No client framework unless a page needs interaction; then an Astro island.
- Brand values come only from `docs/reference/design-tokens/` (zarnik-ds). Never redefine them.

## Rules

- Static pages only. No app data, no logins, no forms that store personal data except the request a call form named in the specification.
- Copy rules apply with extra force: every heading says plainly what the section is; a visitor must understand the page from its headings alone.
- Every page has a title, a meta description and an Open Graph image.

## Checks before every push

- `npm run check` (Astro type check and production build).

