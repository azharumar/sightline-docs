---
title: Design system
description: Brand values, tokens and how they reach the Frappe app.
---

## Source

- Brand colours, fonts and logo come from **zarnik-ds** (`ZHSPL/zarnik-ds`), pinned at commit `99988d1`. Brand values are never redefined.
- Sightline adds only what zarnik-ds lacks: score colours (0 to 5), band colours (Excellent, Good, Needs work, Poor), status colours (Open, In progress, Done, Red flag), type sizes, spacing and radius for dense screens.
- The values are in `reference/design-tokens/`: `zarnik-ds.ts` (the pinned brand values), `tokens.ts` (Sightline roles built from them), and `globals.css` (the resulting CSS variables for light and dark mode). `globals.css` is the quickest table of final values.

## In the Frappe app

- The tokens become the Tailwind theme of the Vue app, layered on the frappe-ui preset (app specification, `09-frontend`).
- A test in the app checks the theme values against `reference/design-tokens/globals.css`, so the brand cannot drift.
- Screens follow the approved designs in `reference/approved-screens/` and `reference/mockups/`.

## Rules

- Only design system components and tokens; no raw colours or one-off styles.
- Plain, literal labels; no eyebrows; no em dashes; no page description text.
- Score pills: red, amber and green as approved on 2026-10-05.
