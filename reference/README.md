# Reference material (frozen)

Copied on 2026-10-18 from the old repository `azharumar/sightline` at commit `10c17a3261b985c85f9c78dab18b0f44bf6b7e7f`. It is input for porting, not a source of rules.

| Folder | What it is | Used for |
|---|---|---|
| `design-tokens/` | zarnik-ds values pinned at commit `99988d1` (`zarnik-ds.ts`), Sightline tokens (`tokens.ts`, `color.ts`), and the generated CSS variables (`globals.css`, light and dark) | Porting the design system to the Tailwind theme of the Frappe app |
| `mockups/` | The approved round 3 redesign mockups (open `index.html`) and their screenshots | Layout and behaviour of screens |
| `approved-screens/` | Screenshots of every screen approved at Gate 2 (phone and laptop, before and after) and the Gate 2 checklist | What "matches the approved design" means |
| `emails/` | Email templates and wording (React Email) | Porting wording into Frappe Email Templates |
| `seeds/` | Seed data scripts, including the starting audit item lists | Seed audit templates (items stay Draft until Azhar approves them) |

Rules:

- Never edit files here. If something here is wrong, the specification in `src/content/docs/` says what is right.
- Old names in this material (for example "fixes", "client", "department", "property score") are history. The glossary in the specification wins.
