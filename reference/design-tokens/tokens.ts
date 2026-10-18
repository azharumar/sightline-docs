// Sightline design tokens. Single source for every colour, size and radius in the app.
// Brand values come from zarnik-ds (./zarnik-ds.ts), never redefined here. Sightline adds only
// score, band and status colours, built only from zarnik-ds hues, plus its type and density
// choices from the approved mockups.
// After editing, regenerate src/app/globals.css: pnpm exec tsx src/design/write-css.ts
import { contrast, mixOklch, toHex } from "./color";
import { brandMark, desk, font, hue, motion as dsMotion, n, shape } from "./zarnik-ds";

export type Mode = "light" | "dark";
export const modes: readonly Mode[] = ["light", "dark"];
const at = (m: Mode) => (m === "light" ? 0 : 1);

/**
 * Theme roles. Keys become CSS variables in kebab case, e.g. mutedForeground -> --muted-foreground,
 * and Tailwind colours, e.g. bg-muted, text-muted-foreground.
 * Text steps, strongest first: foreground (headings, row titles), bodyForeground (running text),
 * subtleForeground (secondary lines, pills), mutedForeground (meta, captions, placeholders).
 */
export type ThemeRole =
  | "background"
  | "ground"
  | "foreground"
  | "bodyForeground"
  | "subtleForeground"
  | "card"
  | "cardForeground"
  | "popover"
  | "popoverForeground"
  | "primary"
  | "primaryForeground"
  | "primaryHover"
  | "secondary"
  | "secondaryForeground"
  | "muted"
  | "mutedForeground"
  | "accent"
  | "accentForeground"
  | "hover"
  | "destructive"
  | "destructiveForeground"
  | "warningForeground"
  | "successForeground"
  | "border"
  | "borderStrong"
  | "input"
  | "field"
  | "ring"
  | "sidebar"
  | "sidebarForeground"
  | "sidebarBorder"
  | "sidebarAccent"
  | "sidebarAccentForeground"
  | "brand";

const themeFor = (m: Mode): Record<ThemeRole, string> => {
  const i = at(m);
  return {
    background: desk.surfacePage[i],
    // Grey ground under Section panels. Dark mode lifts the panels instead, so the ground is the page.
    ground: m === "light" ? desk.surfaceSubtle[0] : desk.surfacePage[1],
    foreground: n[900][i],
    bodyForeground: n[700][i],
    subtleForeground: n[600][i],
    card: desk.surfaceCard[i],
    cardForeground: n[900][i],
    popover: desk.surfaceCard[i],
    popoverForeground: n[900][i],
    primary: n[800][i],
    primaryForeground: desk.primaryForeground[i],
    primaryHover: n[700][i],
    secondary: desk.secondary[i],
    secondaryForeground: n[800][i],
    muted: desk.secondary[i],
    mutedForeground: n[500][i],
    accent: desk.secondary[i],
    accentForeground: n[800][i],
    hover: desk.surfaceHover[i],
    // Destructive is text as often as a fill. In light mode the desk red-600 measures 4.37 on
    // muted and hover surfaces, so Sightline uses the desk red-700 text step (5.9) instead.
    destructive: m === "light" ? hue.red700[0] : hue.red600[1],
    // Text on a filled red: white on the light red, near-black on the lifted dark red.
    destructiveForeground: m === "light" ? n[0][0] : n[900][0],
    // Text colours for warnings (overdue, observation needed) and good news. Named
    // *Foreground so they do not shadow the zarnik-ds --warning and --success hues.
    // Light amber-800 measures 4.38 on muted surfaces, so it is taken 10% toward n-900 (5.2).
    warningForeground: m === "light" ? mixOklch(hue.amber800[0], n[900][0], 0.9) : hue.amber800[1],
    successForeground: hue.green700[i],
    border: desk.border[i],
    borderStrong: desk.borderStrong[i],
    input: desk.input[i],
    field: desk.fieldSurface[i],
    ring: n[450][i],
    sidebar: desk.sidebar[i],
    sidebarForeground: n[900][i],
    sidebarBorder: desk.border[i],
    sidebarAccent: desk.secondary[i],
    sidebarAccentForeground: n[800][i],
    brand: brandMark,
  };
};

export const theme: Record<Mode, Record<ThemeRole, string>> = {
  light: themeFor("light"),
  dark: themeFor("dark"),
};

/**
 * A semantic colour in one mode.
 * solid: the hue, for dots and filled chips. onSolid: text on a filled chip.
 * soft: a light tint of the hue on the page. onSoft: text on the tint.
 */
export type SemanticColor = { solid: string; onSolid: string; soft: string; onSoft: string };
type Semantic = Record<Mode, SemanticColor>;

/** Builds both modes from one hue per mode. Text picks whichever neutral reads best. */
const sem = (solidFor: (m: Mode) => string): Semantic => {
  const one = (m: Mode): SemanticColor => {
    const solid = solidFor(m);
    const light = desk.primaryForeground[0];
    const dark = n[900][0];
    const onSolid = contrast(light, solid) >= contrast(dark, solid) ? light : dark;
    return {
      solid,
      onSolid,
      soft: mixOklch(solid, theme[m].background, 0.15),
      onSoft: theme[m].foreground,
    };
  };
  return { light: one("light"), dark: one("dark") };
};

// zarnik-ds hues, and the steps between them for scores 1, 3 and 4 (mixed in oklch).
const red = (m: Mode) => hue.red600[at(m)];
const amber = (m: Mode) => hue.amber600[at(m)];
const green = (m: Mode) => hue.green600[at(m)];
const blue = (m: Mode) => hue.blue600[at(m)];

/** Item scores 0 to 5. 0 is worst, 5 is best. */
export const scores = [0, 1, 2, 3, 4, 5] as const;
export type Score = (typeof scores)[number];
export const scoreColor: Record<Score, Semantic> = {
  0: sem(red),
  1: sem((m) => mixOklch(red(m), amber(m), 0.55)),
  2: sem(amber),
  3: sem((m) => mixOklch(amber(m), green(m), 0.55)),
  4: sem((m) => mixOklch(green(m), amber(m), 0.75)),
  5: sem(green),
};

export const bands = ["excellent", "good", "needsWork", "poor"] as const;
export type Band = (typeof bands)[number];
export const bandLabel: Record<Band, string> = {
  excellent: "Excellent",
  good: "Good",
  needsWork: "Needs work",
  poor: "Poor",
};
export const bandColor: Record<Band, Semantic> = {
  excellent: scoreColor[5],
  good: scoreColor[4],
  needsWork: scoreColor[2],
  poor: scoreColor[0],
};

export const statuses = ["open", "inProgress", "resolved", "redFlag"] as const;
export type Status = (typeof statuses)[number];
export const statusLabel: Record<Status, string> = {
  open: "Open",
  inProgress: "In progress",
  resolved: "Resolved",
  redFlag: "Red flag",
};
/** Desk tones: amber needs a person, blue is in flight, green is done, red is critical. */
export const statusColor: Record<Status, Semantic> = {
  open: sem(amber),
  inProgress: sem(blue),
  resolved: sem(green),
  redFlag: sem(red),
};

/**
 * Type steps in px, chosen for Sightline in the approved round 3 mockups. Laptop follows the
 * zarnik-ds desk scale (page title 24/600/-0.025em, body 14, caption 12) with a 15px section
 * title. Phone uses the compact steps from zarnik-ds typography, capped at 18. Inputs are 16 on
 * phones so iPhone Safari does not zoom on focus.
 */
const type = {
  phone: { title: 18, section: 15, item: 14, body: 14, meta: 12, form: 16 },
  laptop: { title: 24, section: 15, item: 14, body: 14, meta: 12, form: 14 },
  titleTracking: { phone: "-0.01em", laptop: "-0.025em" },
  weights: { regular: 400, medium: 500, semibold: 600 },
} as const;

/**
 * Heights and gutters in px, chosen for Sightline from the approved mockups. Laptop chrome,
 * fields and rows match the zarnik-ds desk density (32, 36, 40); touch 44 and tab bar 56 match
 * zarnik-ds spacing; gutters match the desk page padding (16, then 24 from 768px).
 */
const density = {
  controlH: 32,
  fieldH: 36,
  rowH: 40,
  touch: 44,
  tabBar: 56,
  pagePadPhone: 16,
  pagePadLaptop: 24,
} as const;

/**
 * Control heights in px per screen. Phone buttons look 36 (small 32) and fields 40, smaller than
 * the 44px touch target; an invisible tap area (the tap-area utility) keeps every button 44px to
 * the thumb. Fields keep 16px text on phones so iPhone Safari does not zoom. Laptop is unchanged.
 * Tailwind: button h-9, small h-8, icon size-9, field h-10 on phone; h-10, h-9, size-10, h-10 from sm.
 */
export const controlHeight = {
  phone: { button: 36, buttonSmall: 32, icon: 36, field: 40 },
  laptop: { button: 40, buttonSmall: 36, icon: 40, field: 40 },
} as const;

/** Screen sizes for the type scale. Laptop starts at the md breakpoint (768px). */
export const screens = ["phone", "laptop"] as const;
export type Screen = (typeof screens)[number];
export const laptopMinWidth = "48rem";

export type TypeStep = { size: string; lineHeight: string; tracking?: string };
const rem = (px: number) => `${px / 16}rem`;

/**
 * Type scale per screen. Six steps only, so a page never mixes more.
 * title: page title. section: section heading. item: row and list title (use font-medium).
 * body: running text, buttons. meta: labels, captions, chips. form: text inside inputs, selects and text areas.
 */
export const typeScale: Record<Screen, Record<keyof typeof type.phone, TypeStep>> = {
  phone: {
    title: { size: rem(type.phone.title), lineHeight: rem(24), tracking: type.titleTracking.phone },
    section: { size: rem(type.phone.section), lineHeight: rem(20) },
    item: { size: rem(type.phone.item), lineHeight: rem(20) },
    body: { size: rem(type.phone.body), lineHeight: rem(21) },
    meta: { size: rem(type.phone.meta), lineHeight: rem(16) },
    form: { size: rem(type.phone.form), lineHeight: rem(24) },
  },
  laptop: {
    title: {
      size: rem(type.laptop.title),
      lineHeight: rem(30),
      tracking: type.titleTracking.laptop,
    },
    section: { size: rem(type.laptop.section), lineHeight: rem(20) },
    item: { size: rem(type.laptop.item), lineHeight: rem(20) },
    body: { size: rem(type.laptop.body), lineHeight: rem(21) },
    meta: { size: rem(type.laptop.meta), lineHeight: rem(16) },
    form: { size: rem(type.laptop.form), lineHeight: rem(20) },
  },
};
export type TypeName = keyof typeof typeScale.phone;
export const typeNames = Object.keys(typeScale.phone) as TypeName[];

export const fontFamily = { sans: font.sans, mono: font.mono } as const;

/** Three weights: regular text, medium for row titles and buttons, semibold for headings. */
export const typeWeight = {
  normal: String(type.weights.regular),
  medium: String(type.weights.medium),
  semibold: String(type.weights.semibold),
} as const;

/**
 * Text levels, strongest first. Each level differs from the next in at least two of size,
 * weight, colour, spacing or container, so a section, a heading and a subheading never look alike.
 * step: the type scale step. color: the theme role. spaceAbove: px above the heading.
 * Classes for each level are in classes.ts (textLevelClasses); components in
 * components/patterns/section.tsx.
 */
export const textLevels = {
  /** Page title: 18 on phone, 24 on laptop, semibold, near black. One per screen. */
  pageTitle: { step: "title", weight: "semibold", color: "foreground" },
  /** Section heading: 15 semibold, thin divider below, 24px above, in its own white panel. */
  section: {
    step: "section",
    weight: "semibold",
    color: "foreground",
    spaceAbove: 24,
    divider: true,
    panel: true,
  },
  /** Subheading inside a section: 14 semibold dark grey, 12px above, no divider. */
  subsection: {
    step: "item",
    weight: "semibold",
    color: "bodyForeground",
    spaceAbove: 12,
    divider: false,
    panel: false,
  },
  /** Running text: 14 regular. */
  body: { step: "body", weight: "normal", color: "bodyForeground" },
  /** Field label: 12 medium grey. */
  label: { step: "meta", weight: "medium", color: "subtleForeground" },
  /** Meta and captions: 12 regular, lighter grey. */
  meta: { step: "meta", weight: "normal", color: "mutedForeground" },
} as const satisfies Record<
  string,
  {
    step: TypeName;
    weight: keyof typeof typeWeight;
    color: ThemeRole;
    spaceAbove?: number;
    divider?: boolean;
    panel?: boolean;
  }
>;
export type TextLevel = keyof typeof textLevels;
export const textLevelNames = Object.keys(textLevels) as TextLevel[];

/** Email type sizes in rem: [font size, line height]. Email only; the app uses typeScale. */
export const fontSize = {
  xs: ["0.75rem", "1rem"],
  sm: ["0.875rem", "1.25rem"],
  base: ["1rem", "1.5rem"],
  lg: ["1.125rem", "1.75rem"],
  xl: ["1.25rem", "1.75rem"],
  "2xl": ["1.5rem", "2rem"],
  "3xl": ["1.875rem", "2.25rem"],
} as const;

/** Email font weights. Email only; the app uses typeWeight. */
export const fontWeight = { normal: "400", medium: "500", semibold: "600" } as const;

/** Spacing unit. Tailwind multiplies it: p-1 = 0.25rem, p-4 = 1rem. 4px grid. */
export const spacingUnit = "0.25rem";

/** Minimum touch target for thumb use on phones (44px). Use h-touch, min-h-touch, size-touch. */
export const touchTarget = rem(density.touch);

/** Named heights from the desk density scale. Tailwind: h-control, h-field, h-row, h-tab-bar. */
export const heights = {
  control: rem(density.controlH),
  field: rem(density.fieldH),
  row: rem(density.rowH),
  touch: touchTarget,
  tabBar: rem(density.tabBar),
} as const;

/** Page gutter per screen: 16px on phones, 24px on laptops. Tailwind: px-gutter. */
export const gutter: Record<Screen, string> = {
  phone: rem(density.pagePadPhone),
  laptop: rem(density.pagePadLaptop),
};

/** Corner radius. Base 10px: sm 6 (small marks), md 8, lg 10 (controls), xl 14 (panels). */
export const radius = {
  base: shape.radius,
  sm: "calc(var(--radius) - 4px)",
  md: "calc(var(--radius) - 2px)",
  lg: "var(--radius)",
  xl: "calc(var(--radius) + 4px)",
} as const;

/** Shadows only for things that float: menus and popovers (overlay), sheets and dialogs (modal). */
export const shadow: Record<Mode, { overlay: string; modal: string }> = {
  light: { overlay: shape.shadowOverlay[0], modal: shape.shadowModal[0] },
  dark: { overlay: shape.shadowOverlay[1], modal: shape.shadowModal[1] },
};

/** "cubic-bezier(.2,0,.2,1)" -> "cubic-bezier(0.2, 0, 0.2, 1)", the form Prettier writes. */
const curve = (v: string) => v.replace(/([(,])\./g, "$10.").replace(/,/g, ", ");

/** Motion: three durations and two curves. Reduced motion sets every duration to 0. */
export const motion = {
  duration: { fast: dsMotion.durFast, base: dsMotion.durBase, slow: dsMotion.durSlow },
  ease: { standard: curve(dsMotion.easeStandard), smooth: curve(dsMotion.easeSmooth) },
} as const;

/** Light mode colours as hex, for email clients, which cannot read oklch. */
export const emailPalette = {
  page: toHex(desk.sidebar[0]),
  card: toHex(theme.light.card),
  text: toHex(theme.light.foreground),
  muted: toHex(theme.light.mutedForeground),
  border: toHex(theme.light.border),
  primary: toHex(theme.light.primary),
  onPrimary: toHex(theme.light.primaryForeground),
  panel: toHex(theme.light.muted),
  band: Object.fromEntries(bands.map((b) => [b, toHex(bandColor[b].light.solid)])) as Record<
    Band,
    string
  >,
  status: Object.fromEntries(statuses.map((s) => [s, toHex(statusColor[s].light.solid)])) as Record<
    Status,
    string
  >,
} as const;

export const tokens = {
  theme,
  scoreColor,
  bandColor,
  statusColor,
  typeScale,
  typeWeight,
  textLevels,
  fontSize,
  fontFamily,
  fontWeight,
  spacingUnit,
  touchTarget,
  heights,
  gutter,
  radius,
  shadow,
  motion,
  emailPalette,
} as const;
