// Values copied from zarnik-ds (ZHSPL/zarnik-ds) at the commit pinned in package.json under
// "zarnikDs". This file holds only copied values; Sightline's own choices live in tokens.ts.
// Never edit a value here: update the pin, copy again, and update the hash in tokens.test.ts.
// Sightline uses the portal desk layer (tokens/desk.css, [data-portal]) on top of the foundations.
// Each value is [light, dark] where the theme changes it, or one value when it does not.
// Two colours are resolved to one value instead of a CSS expression: fieldSurface (desk
// --field-surface, a color-mix with transparent) and surfaceHover (colors.css --surface-hover
// on the desk ramp).

export const zarnikDs = {
  repo: "ZHSPL/zarnik-ds",
  commit: "99988d1ba89190b7e79508b3d145bd1b0eafaba4",
} as const;

type Pair = readonly [light: string, dark: string];

/** tokens/desk.css section 1: shadcn neutral ramp. Index is ink strength, not lightness. */
export const n = {
  0: ["oklch(1 0 0)", "oklch(1 0 0)"],
  25: ["oklch(0.985 0 0)", "oklch(0.185 0 0)"],
  50: ["oklch(0.97 0 0)", "oklch(0.269 0 0)"],
  100: ["oklch(0.955 0 0)", "oklch(0.205 0 0)"],
  150: ["oklch(0.938 0 0)", "oklch(0.3 0 0)"],
  200: ["oklch(0.922 0 0)", "oklch(0.34 0 0)"],
  300: ["oklch(0.87 0 0)", "oklch(0.44 0 0)"],
  400: ["oklch(0.78 0 0)", "oklch(0.5 0 0)"],
  450: ["oklch(0.708 0 0)", "oklch(0.556 0 0)"],
  500: ["oklch(0.5 0 0)", "oklch(0.708 0 0)"],
  600: ["oklch(0.44 0 0)", "oklch(0.8 0 0)"],
  700: ["oklch(0.3 0 0)", "oklch(0.87 0 0)"],
  800: ["oklch(0.205 0 0)", "oklch(0.922 0 0)"],
  900: ["oklch(0.145 0 0)", "oklch(0.985 0 0)"],
  950: ["oklch(0.1 0 0)", "oklch(1 0 0)"],
} as const satisfies Record<number, Pair>;

/** tokens/desk.css section 1: surfaces and the shadcn semantic bridge. */
export const desk = {
  surfacePage: ["oklch(1 0 0)", "oklch(0.145 0 0)"],
  surfaceCard: ["oklch(1 0 0)", "oklch(0.205 0 0)"],
  surfaceSubtle: ["oklch(0.97 0 0)", "oklch(0.269 0 0)"],
  textInverse: ["oklch(0.985 0 0)", "oklch(0.205 0 0)"],
  secondary: ["oklch(0.97 0 0)", "oklch(0.269 0 0)"],
  primaryForeground: ["oklch(0.985 0 0)", "oklch(0.205 0 0)"],
  sidebar: ["oklch(0.985 0 0)", "oklch(0.205 0 0)"],
  border: ["oklch(0.922 0 0)", "oklch(1 0 0 / 10%)"],
  input: ["oklch(0.922 0 0)", "oklch(1 0 0 / 15%)"],
  borderStrong: ["oklch(0.87 0 0)", "oklch(1 0 0 / 18%)"],
  /** --field-surface: --muted at 40% light, --input at 30% dark, resolved to one alpha. */
  fieldSurface: ["oklch(0.97 0 0 / 40%)", "oklch(1 0 0 / 4.5%)"],
  /** --surface-hover from tokens/colors.css: n-50 light, n-150 dark, on the desk ramp. */
  surfaceHover: ["oklch(0.97 0 0)", "oklch(0.3 0 0)"],
} as const satisfies Record<string, Pair>;

/** tokens/desk.css section 1: the console's four semantic hues. */
export const hue = {
  red600: ["oklch(0.577 0.245 27.325)", "oklch(0.704 0.191 22.216)"],
  red700: ["oklch(0.505 0.21 27.325)", "oklch(0.78 0.15 22.216)"],
  amber600: ["oklch(0.769 0.188 70.08)", "oklch(0.769 0.188 70.08)"],
  amber800: ["oklch(0.56 0.14 70.08)", "oklch(0.85 0.14 70.08)"],
  green600: ["oklch(0.627 0.194 149.214)", "oklch(0.627 0.194 149.214)"],
  green700: ["oklch(0.52 0.16 149.214)", "oklch(0.75 0.16 149.214)"],
  blue600: ["oklch(0.623 0.214 259.815)", "oklch(0.623 0.214 259.815)"],
  blue800: ["oklch(0.52 0.18 259.815)", "oklch(0.78 0.13 259.815)"],
} as const satisfies Record<string, Pair>;

/** tokens/desk.css: the brand mark. Logo and the capture progress line only. */
export const brandMark = "oklch(0.67 0.224 41.116)";

/** tokens/typography.css and tokens/fonts.css: one web typeface, self-hosted. */
export const font = {
  family: "Noto Sans",
  sans: '"Noto Sans", system-ui, -apple-system, "Segoe UI", sans-serif',
  mono: 'ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace',
  /** Weights shipped to the browser. 700 exists in zarnik-ds but Sightline does not use it. */
  files: [
    { weight: 400, file: "NotoSans-Regular" },
    { weight: 500, file: "NotoSans-Medium" },
    { weight: 600, file: "NotoSans-SemiBold" },
  ],
  /** Unicode ranges from tokens/fonts.css, one per woff2 subset. */
  unicodeRange: {
    latin:
      "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+20B9, U+2122, U+2190-2199, U+2212, U+2215, U+FEFF, U+FFFD",
    "latin-ext":
      "U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF",
  },
} as const;

/** tokens/desk.css section 2. Base radius 10px: controls 10, panels 14. */
export const shape = {
  radius: "0.625rem",
  radiusControl: "10px",
  radiusPanel: "14px",
  radiusPill: "999px",
  shadowOverlay: [
    "0 4px 12px oklch(0 0 0 / 8%), 0 1px 2px oklch(0 0 0 / 5%)",
    "0 4px 12px oklch(0 0 0 / 45%), 0 1px 2px oklch(0 0 0 / 35%)",
  ],
  shadowModal: ["0 12px 40px oklch(0 0 0 / 12%)", "0 12px 40px oklch(0 0 0 / 60%)"],
  scrim: "oklch(0 0 0 / 10%)",
} as const;

/** tokens/motion.css plus the desk curves in tokens/desk.css section 5. */
export const motion = {
  durFast: "120ms",
  durBase: "180ms",
  durSlow: "240ms",
  easeStandard: "cubic-bezier(.2,0,.2,1)",
  easeOut: "cubic-bezier(0,0,.2,1)",
  easeSmooth: "cubic-bezier(.32,.72,0,1)",
  easeSpring: "cubic-bezier(.22,1.2,.36,1)",
} as const;
