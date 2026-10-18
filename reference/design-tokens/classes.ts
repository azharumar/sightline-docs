// Tailwind class names for score, band and status colours.
// Written out in full so Tailwind can find them. Use these instead of building class names.
import type { Band, Score, Status, TextLevel } from "./tokens";

/** solid: filled chip. soft: tinted background. dot: the coloured dot beside a label. */
export type SemanticClasses = { solid: string; soft: string; dot: string; border: string };

export const scoreClasses: Record<Score, SemanticClasses> = {
  0: {
    solid: "bg-score-0 text-score-0-foreground",
    soft: "bg-score-0-soft text-score-0-soft-foreground",
    dot: "bg-score-0",
    border: "border-score-0",
  },
  1: {
    solid: "bg-score-1 text-score-1-foreground",
    soft: "bg-score-1-soft text-score-1-soft-foreground",
    dot: "bg-score-1",
    border: "border-score-1",
  },
  2: {
    solid: "bg-score-2 text-score-2-foreground",
    soft: "bg-score-2-soft text-score-2-soft-foreground",
    dot: "bg-score-2",
    border: "border-score-2",
  },
  3: {
    solid: "bg-score-3 text-score-3-foreground",
    soft: "bg-score-3-soft text-score-3-soft-foreground",
    dot: "bg-score-3",
    border: "border-score-3",
  },
  4: {
    solid: "bg-score-4 text-score-4-foreground",
    soft: "bg-score-4-soft text-score-4-soft-foreground",
    dot: "bg-score-4",
    border: "border-score-4",
  },
  5: {
    solid: "bg-score-5 text-score-5-foreground",
    soft: "bg-score-5-soft text-score-5-soft-foreground",
    dot: "bg-score-5",
    border: "border-score-5",
  },
};

export const bandClasses: Record<Band, SemanticClasses> = {
  excellent: {
    solid: "bg-band-excellent text-band-excellent-foreground",
    soft: "bg-band-excellent-soft text-band-excellent-soft-foreground",
    dot: "bg-band-excellent",
    border: "border-band-excellent",
  },
  good: {
    solid: "bg-band-good text-band-good-foreground",
    soft: "bg-band-good-soft text-band-good-soft-foreground",
    dot: "bg-band-good",
    border: "border-band-good",
  },
  needsWork: {
    solid: "bg-band-needs-work text-band-needs-work-foreground",
    soft: "bg-band-needs-work-soft text-band-needs-work-soft-foreground",
    dot: "bg-band-needs-work",
    border: "border-band-needs-work",
  },
  poor: {
    solid: "bg-band-poor text-band-poor-foreground",
    soft: "bg-band-poor-soft text-band-poor-soft-foreground",
    dot: "bg-band-poor",
    border: "border-band-poor",
  },
};

export const statusClasses: Record<Status, SemanticClasses> = {
  open: {
    solid: "bg-status-open text-status-open-foreground",
    soft: "bg-status-open-soft text-status-open-soft-foreground",
    dot: "bg-status-open",
    border: "border-status-open",
  },
  inProgress: {
    solid: "bg-status-in-progress text-status-in-progress-foreground",
    soft: "bg-status-in-progress-soft text-status-in-progress-soft-foreground",
    dot: "bg-status-in-progress",
    border: "border-status-in-progress",
  },
  resolved: {
    solid: "bg-status-resolved text-status-resolved-foreground",
    soft: "bg-status-resolved-soft text-status-resolved-soft-foreground",
    dot: "bg-status-resolved",
    border: "border-status-resolved",
  },
  redFlag: {
    solid: "bg-status-red-flag text-status-red-flag-foreground",
    soft: "bg-status-red-flag-soft text-status-red-flag-soft-foreground",
    dot: "bg-status-red-flag",
    border: "border-status-red-flag",
  },
};

/**
 * Text level classes, from textLevels in tokens.ts: type step, weight and colour.
 * Spacing, dividers and panels come with the components in components/patterns/section.tsx.
 */
export const textLevelClasses: Record<TextLevel, string> = {
  pageTitle: "text-title font-semibold text-foreground",
  section: "text-section font-semibold text-foreground",
  subsection: "text-item font-semibold text-body-foreground",
  body: "text-body font-normal text-body-foreground",
  label: "text-meta font-medium text-subtle-foreground",
  meta: "text-meta font-normal text-muted-foreground",
};
