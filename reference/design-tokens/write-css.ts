// Writes src/app/globals.css from the design tokens. Run: pnpm exec tsx src/design/write-css.ts
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { renderGlobalsCss } from "./css";

writeFileSync(join(__dirname, "..", "app", "globals.css"), renderGlobalsCss());
