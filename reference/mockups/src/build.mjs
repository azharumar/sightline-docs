// Assembles index.html from shell.html, styles.css, app.js, tokens below and the before image.
import fs from "node:fs";
const dir = new URL(".", import.meta.url).pathname;
const out = new URL("../index.html", import.meta.url).pathname;

// [light, dark]. Values come from zarnik-ds 99988d1 tokens/desk.css ([data-portal] layer) unless noted.
const T = {
  // Neutrals (desk.css, shadcn neutral)
  "bg": ["oklch(1 0 0)", "oklch(0.145 0 0)"],                 // --surface-page
  "surface": ["oklch(1 0 0)", "oklch(0.205 0 0)"],            // --surface-card
  "sidebar": ["oklch(0.985 0 0)", "oklch(0.205 0 0)"],        // --sidebar
  "muted": ["oklch(0.97 0 0)", "oklch(0.269 0 0)"],           // --muted / --secondary
  "hover": ["oklch(0.97 0 0)", "oklch(0.3 0 0)"],             // --surface-hover (n-50 / n-150)
  "fg": ["oklch(0.145 0 0)", "oklch(0.985 0 0)"],             // --foreground (n-900)
  "text": ["oklch(0.3 0 0)", "oklch(0.87 0 0)"],              // --text-body (n-700)
  "text-2": ["oklch(0.44 0 0)", "oklch(0.8 0 0)"],            // --text-secondary (n-600)
  "text-3": ["oklch(0.5 0 0)", "oklch(0.708 0 0)"],           // --muted-foreground (n-500)
  "line": ["oklch(0.922 0 0)", "oklch(1 0 0 / 10%)"],         // --border
  "input": ["oklch(0.922 0 0)", "oklch(1 0 0 / 15%)"],        // --input
  "line-strong": ["oklch(0.87 0 0)", "oklch(1 0 0 / 18%)"],   // --border-strong
  "ring": ["oklch(0.708 0 0)", "oklch(0.556 0 0)"],           // --ring (n-450)
  "field": ["color-mix(in oklch, oklch(0.97 0 0) 40%, transparent)", "color-mix(in oklch, oklch(1 0 0 / 15%) 30%, transparent)"], // --field-surface
  "primary": ["oklch(0.205 0 0)", "oklch(0.922 0 0)"],        // --primary (n-800)
  "on-primary": ["oklch(0.985 0 0)", "oklch(0.205 0 0)"],     // --primary-foreground
  "primary-hover": ["oklch(0.3 0 0)", "oklch(0.87 0 0)"],     // n-700 step
  "inverse": ["oklch(0.145 0 0)", "oklch(0.985 0 0)"],        // --surface-inverse (n-900)
  "on-inverse": ["oklch(0.985 0 0)", "oklch(0.205 0 0)"],     // --text-inverse
  // Brand (desk.css). Logo mark and the capture progress line only.
  "brand": ["oklch(0.67 0.224 41.116)", "oklch(0.67 0.224 41.116)"],
  // Semantic hues (desk.css)
  "red": ["oklch(0.577 0.245 27.325)", "oklch(0.704 0.191 22.216)"],      // --red-600 / --destructive
  "red-text": ["oklch(0.505 0.21 27.325)", "oklch(0.78 0.15 22.216)"],    // --red-700
  "amber": ["oklch(0.769 0.188 70.08)", "oklch(0.769 0.188 70.08)"],      // --amber-600 / --warning
  "amber-text": ["oklch(0.56 0.14 70.08)", "oklch(0.85 0.14 70.08)"],     // --amber-800
  "green": ["oklch(0.627 0.194 149.214)", "oklch(0.627 0.194 149.214)"],  // --green-600 / --success
  "green-text": ["oklch(0.52 0.16 149.214)", "oklch(0.75 0.16 149.214)"], // --green-700
  "blue": ["oklch(0.623 0.214 259.815)", "oklch(0.623 0.214 259.815)"],   // --blue-600 / --info
  "gray-dot": ["color-mix(in oklch, oklch(0.5 0 0) 50%, transparent)", "color-mix(in oklch, oklch(0.708 0 0) 50%, transparent)"], // --tone-gray
  // Sightline additions (blueprint p2-23): built only from the zarnik hues above.
  "s0": ["var(--red)", "var(--red)"],
  "s1": ["color-mix(in oklch, var(--red) 55%, var(--amber))", "color-mix(in oklch, var(--red) 55%, var(--amber))"],
  "s2": ["var(--amber)", "var(--amber)"],
  "s3": ["color-mix(in oklch, var(--amber) 55%, var(--green))", "color-mix(in oklch, var(--amber) 55%, var(--green))"],
  "s4": ["color-mix(in oklch, var(--green) 75%, var(--amber))", "color-mix(in oklch, var(--green) 75%, var(--amber))"],
  "s5": ["var(--green)", "var(--green)"],
  "b-excellent": ["var(--s5)", "var(--s5)"],
  "b-good": ["var(--s4)", "var(--s4)"],
  "b-needs": ["var(--s2)", "var(--s2)"],
  "b-poor": ["var(--s0)", "var(--s0)"],
  "st-open": ["var(--amber)", "var(--amber)"],       // desk tone: needs a human
  "st-progress": ["var(--blue)", "var(--blue)"],     // desk tone: in flight
  "st-resolved": ["var(--green)", "var(--green)"],   // desk tone: good terminal state
  "st-redflag": ["var(--red)", "var(--red)"],        // desk tone: critical
  // Elevation (desk.css): overlays and sheets only
  "shadow-overlay": ["0 4px 12px oklch(0 0 0 / 8%), 0 1px 2px oklch(0 0 0 / 5%)", "0 4px 12px oklch(0 0 0 / 45%), 0 1px 2px oklch(0 0 0 / 35%)"],
  "shadow-modal": ["0 12px 40px oklch(0 0 0 / 12%)", "0 12px 40px oklch(0 0 0 / 60%)"],
  "scrim": ["oklch(0 0 0 / 10%)", "oklch(0 0 0 / 40%)"],
  "focus-ring": ["0 0 0 3px color-mix(in oklch, oklch(0.708 0 0) 50%, transparent)", "0 0 0 3px color-mix(in oklch, oklch(0.556 0 0) 50%, transparent)"],
};
const block = (i) => Object.entries(T).map(([k, v]) => `  --${k}: ${v[i]};`).join("\n");
const tokens = `:root {\n  color-scheme: light;\n${block(0)}\n}\n@media (prefers-color-scheme: dark) {\n  :root:not([data-theme="light"]) {\n  color-scheme: dark;\n${block(1)}\n  }\n}\n:root[data-theme="dark"] {\n  color-scheme: dark;\n${block(1)}\n}\n`;

const img = fs.readFileSync(dir + "before.jpg").toString("base64");
let html = fs.readFileSync(dir + "shell.html", "utf8");
html = html
  .replace("/*__TOKENS__*/", () => tokens)
  .replace("/*__CSS__*/", () => fs.readFileSync(dir + "styles.css", "utf8"))
  .replace("/*__JS__*/", () => ["data.js","core.js","capture.js","screens.js","admin.js","main.js"].map((f) => fs.readFileSync(dir + f, "utf8")).join("\n"))
  .replace("__BEFORE_IMG__", () => "data:image/jpeg;base64," + img);
fs.writeFileSync(out, html);
console.log("wrote", out, (html.length / 1024).toFixed(0) + " KB");
