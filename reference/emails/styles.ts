// Inline styles for emails. Every value comes from the design tokens, so emails match the app.
// Email clients ignore CSS variables and handle rem badly, so sizes are converted to px here.
import type { CSSProperties } from "react";

import {
  bandLabel,
  emailPalette,
  fontFamily,
  fontSize,
  fontWeight,
  radius,
  type Band,
  type Status,
} from "@/design/tokens";
import type { ScoreBand } from "@/sample";

/** "1.25rem" -> "20px". Email clients get fixed pixel sizes. */
export function remToPx(rem: string): string {
  return `${Math.round(parseFloat(rem) * 16)}px`;
}

const type = (size: keyof typeof fontSize): CSSProperties => ({
  fontSize: remToPx(fontSize[size][0]),
  lineHeight: remToPx(fontSize[size][1]),
});

const space = (n: number) => `${n * 4}px`;

/**
 * Emails always use light mode: most clients force it or invert colours themselves.
 * Hex values, because email clients cannot read the oklch tokens the app uses.
 */
export const emailColor = {
  page: emailPalette.page,
  card: emailPalette.card,
  text: emailPalette.text,
  muted: emailPalette.muted,
  border: emailPalette.border,
  primary: emailPalette.primary,
  onPrimary: emailPalette.onPrimary,
  panel: emailPalette.panel,
} as const;

export const s = {
  body: {
    margin: 0,
    padding: `${space(6)} 0`,
    backgroundColor: emailColor.page,
    fontFamily: fontFamily.sans,
    color: emailColor.text,
  },
  container: {
    maxWidth: "560px",
    margin: "0 auto",
    padding: space(6),
    backgroundColor: emailColor.card,
    border: `1px solid ${emailColor.border}`,
    borderRadius: remToPx(radius.base),
  },
  appName: { ...type("sm"), margin: 0, fontWeight: fontWeight.semibold, color: emailColor.muted },
  heading: {
    ...type("xl"),
    margin: `${space(4)} 0 ${space(2)}`,
    fontWeight: fontWeight.semibold,
    color: emailColor.text,
  },
  text: { ...type("base"), margin: `0 0 ${space(4)}`, color: emailColor.text },
  small: { ...type("sm"), margin: `0 0 ${space(2)}`, color: emailColor.muted },
  label: { ...type("sm"), margin: 0, color: emailColor.muted },
  value: { ...type("base"), margin: 0, color: emailColor.text },
  detailCell: { padding: `${space(1)} 0`, verticalAlign: "top" },
  detailLabelCell: { padding: `${space(1)} ${space(4)} ${space(1)} 0`, verticalAlign: "top" },
  panel: {
    padding: space(4),
    margin: `0 0 ${space(4)}`,
    backgroundColor: emailColor.panel,
    borderRadius: remToPx(radius.base),
  },
  quote: {
    ...type("base"),
    margin: 0,
    padding: `0 0 0 ${space(3)}`,
    borderLeft: `3px solid ${emailColor.border}`,
    color: emailColor.text,
    whiteSpace: "pre-line",
  },
  sectionTitle: {
    ...type("base"),
    margin: `${space(4)} 0 ${space(2)}`,
    fontWeight: fontWeight.semibold,
    color: emailColor.text,
  },
  button: {
    ...type("base"),
    display: "inline-block",
    padding: `${space(3)} ${space(5)}`,
    backgroundColor: emailColor.primary,
    color: emailColor.onPrimary,
    fontWeight: fontWeight.medium,
    textDecoration: "none",
    borderRadius: remToPx(radius.base),
  },
  link: { color: emailColor.primary, textDecoration: "underline" },
  rule: {
    border: "none",
    borderTop: `1px solid ${emailColor.border}`,
    margin: `${space(6)} 0 ${space(4)}`,
  },
  footer: { ...type("sm"), margin: `0 0 ${space(2)}`, color: emailColor.muted },
  chip: {
    ...type("sm"),
    display: "inline-block",
    padding: `${space(0.5)} ${space(2)}`,
    fontWeight: fontWeight.medium,
    borderRadius: remToPx(radius.base),
  },
  tableHead: {
    ...type("sm"),
    padding: `${space(2)} ${space(2)} ${space(2)} 0`,
    textAlign: "left",
    fontWeight: fontWeight.medium,
    color: emailColor.muted,
    borderBottom: `1px solid ${emailColor.border}`,
  },
  tableCell: {
    ...type("sm"),
    padding: `${space(2)} ${space(2)} ${space(2)} 0`,
    color: emailColor.text,
    borderBottom: `1px solid ${emailColor.border}`,
    verticalAlign: "top",
  },
} satisfies Record<string, CSSProperties>;

const bandByLabel = Object.fromEntries(
  (Object.entries(bandLabel) as [Band, string][]).map(([band, label]) => [label, band]),
) as Record<ScoreBand, Band>;

/** Muted chip with a coloured left edge, the email form of the app's dot and label. */
const chip = (colour: string): CSSProperties => ({
  ...s.chip,
  backgroundColor: emailColor.panel,
  color: emailColor.text,
  borderLeft: `4px solid ${colour}`,
});

/** Chip for a score band, e.g. "Needs work". */
export function bandChip(label: ScoreBand): CSSProperties {
  return chip(emailPalette.band[bandByLabel[label]]);
}

/** Chip for a status. */
export function statusChip(status: Status): CSSProperties {
  return chip(emailPalette.status[status]);
}
