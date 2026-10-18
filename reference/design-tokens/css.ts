// Renders src/app/globals.css from tokens.ts so CSS never drifts from the tokens.
import { font } from "./zarnik-ds";
import {
  bandColor,
  bands,
  fontFamily,
  gutter,
  heights,
  laptopMinWidth,
  motion,
  radius,
  scoreColor,
  scores,
  shadow,
  spacingUnit,
  statusColor,
  statuses,
  theme,
  touchTarget,
  typeNames,
  typeScale,
  typeWeight,
  type Mode,
  type Screen,
  type SemanticColor,
  type ThemeRole,
} from "./tokens";

export const kebab = (s: string) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

/** Every semantic colour as [css name, colours per mode], e.g. ["score-0", {...}]. */
export const semanticEntries = (): [string, Record<Mode, SemanticColor>][] => [
  ...scores.map((s): [string, Record<Mode, SemanticColor>] => [`score-${s}`, scoreColor[s]]),
  ...bands.map((b): [string, Record<Mode, SemanticColor>] => [`band-${kebab(b)}`, bandColor[b]]),
  ...statuses.map((s): [string, Record<Mode, SemanticColor>] => [
    `status-${kebab(s)}`,
    statusColor[s],
  ]),
];

const semanticVars = (name: string, c: SemanticColor) => [
  `--${name}: ${c.solid};`,
  `--${name}-foreground: ${c.onSolid};`,
  `--${name}-soft: ${c.soft};`,
  `--${name}-soft-foreground: ${c.onSoft};`,
];

/** Type step variables for one screen size, e.g. --type-title-size. */
const typeVars = (screen: Screen): string[] =>
  typeNames.flatMap((k) => {
    const t = typeScale[screen][k];
    return [
      `--type-${k}-size: ${t.size};`,
      `--type-${k}-line-height: ${t.lineHeight};`,
      ...(t.tracking ? [`--type-${k}-tracking: ${t.tracking};`] : []),
    ];
  });

/** Mode-independent variables: radius, type scale, gutter and motion. Phone values first. */
export const rootVars = (): string[] => [
  `--radius: ${radius.base};`,
  ...typeVars("phone"),
  `--gutter: ${gutter.phone};`,
  `--duration-fast: ${motion.duration.fast};`,
  `--duration-base: ${motion.duration.base};`,
  `--duration-slow: ${motion.duration.slow};`,
];

/** CSS custom properties for one mode, without the selector. */
export const modeVars = (mode: Mode): string[] => [
  ...(Object.entries(theme[mode]) as [ThemeRole, string][]).map(
    ([role, value]) => `--${kebab(role)}: ${value};`,
  ),
  ...semanticEntries().flatMap(([name, c]) => semanticVars(name, c[mode])),
  `--shadow-overlay: ${shadow[mode].overlay};`,
  `--shadow-modal: ${shadow[mode].modal};`,
];

const themeColorNames = (): string[] => [
  ...Object.keys(theme.light).map(kebab),
  ...semanticEntries().flatMap(([n]) => [
    n,
    `${n}-foreground`,
    `${n}-soft`,
    `${n}-soft-foreground`,
  ]),
];

/** Tailwind @theme inline block mapping utilities (bg-score-0, text-title) to variables. */
export const themeInlineVars = (): string[] => [
  `--font-sans: ${fontFamily.sans};`,
  `--font-mono: ${fontFamily.mono};`,
  // Only the Sightline type scale and weights exist; Tailwind's defaults are removed.
  "--text-*: initial;",
  "--font-weight-*: initial;",
  ...typeNames.flatMap((k) => [
    `--text-${k}: var(--type-${k}-size);`,
    `--text-${k}--line-height: var(--type-${k}-line-height);`,
    ...(typeScale.phone[k].tracking
      ? [`--text-${k}--letter-spacing: var(--type-${k}-tracking);`]
      : []),
  ]),
  ...Object.entries(typeWeight).map(([k, v]) => `--font-weight-${k}: ${v};`),
  `--spacing: ${spacingUnit};`,
  ...Object.entries(heights).map(([k, v]) => `--spacing-${kebab(k)}: ${v};`),
  "--spacing-gutter: var(--gutter);",
  `--radius-sm: ${radius.sm};`,
  `--radius-md: ${radius.md};`,
  `--radius-lg: ${radius.lg};`,
  `--radius-xl: ${radius.xl};`,
  "--shadow-overlay: var(--shadow-overlay);",
  "--shadow-modal: var(--shadow-modal);",
  `--ease-standard: ${motion.ease.standard};`,
  `--ease-smooth: ${motion.ease.smooth};`,
  ...themeColorNames().map((n) => `--color-${n}: var(--${n});`),
];

const block = (selector: string, lines: string[], indent = "") =>
  `${indent}${selector} {\n${lines.map((l) => `${indent}  ${l}`).join("\n")}\n${indent}}\n`;

/** Self-hosted Noto Sans from zarnik-ds, latin and latin-ext subsets, in public/fonts. */
export const fontFaces = (): string[] =>
  font.files.flatMap(({ weight, file }) =>
    (Object.entries(font.unicodeRange) as [string, string][]).map(([subset, range]) =>
      block("@font-face", [
        `font-family: "${font.family}";`,
        `src: url("/fonts/${file}.${subset}.woff2") format("woff2");`,
        `font-weight: ${weight};`,
        "font-style: normal;",
        "font-display: swap;",
        `unicode-range: ${range};`,
      ]),
    ),
  );

/**
 * tap-area: an invisible ::after, centred on the element, at least 44px each way. Lets a control
 * look 32 to 40px tall on phones while the thumb still gets 44px. Phone widths only; laptops use
 * a pointer. It sets no position: add relative (or absolute, fixed) beside it, so tailwind-merge
 * can resolve position classes. Use on buttons and other controls without overflow clipping.
 */
export const tapAreaUtility = (): string[] => [
  "@utility tap-area {",
  `  @media (max-width: calc(${laptopMinWidth} - 0.02px)) {`,
  "    &::after {",
  '      content: "";',
  "      position: absolute;",
  "      top: 50%;",
  "      left: 50%;",
  `      width: max(100%, ${touchTarget});`,
  `      height: max(100%, ${touchTarget});`,
  "      transform: translate(-50%, -50%);",
  "    }",
  "  }",
  "}",
  "",
];

export function renderGlobalsCss(): string {
  return [
    "/* Generated from src/design/tokens.ts. Do not edit by hand. */",
    "/* Regenerate: pnpm exec tsx src/design/write-css.ts */",
    '@import "tailwindcss";',
    '@import "tw-animate-css";',
    "",
    "@custom-variant dark (&:is(.dark *));",
    "",
    ...fontFaces(),
    block(":root", ["color-scheme: light;", ...rootVars(), ...modeVars("light")]),
    block(".dark", ["color-scheme: dark;", ...modeVars("dark")]),
    `@media (min-width: ${laptopMinWidth}) {`,
    block(":root", [...typeVars("laptop"), `--gutter: ${gutter.laptop};`], "  "),
    "}",
    "",
    "@media (prefers-reduced-motion: reduce) {",
    block(
      ":root",
      ["--duration-fast: 0ms;", "--duration-base: 0ms;", "--duration-slow: 0ms;"],
      "  ",
    ),
    "}",
    "",
    block("@theme inline", themeInlineVars()),
    ...tapAreaUtility(),
    "@layer base {",
    "  * {",
    "    @apply border-border outline-ring/50;",
    "  }",
    "  body {",
    "    @apply bg-background text-body text-foreground font-sans;",
    "    -webkit-font-smoothing: antialiased;",
    "  }",
    "}",
    "",
  ].join("\n");
}
