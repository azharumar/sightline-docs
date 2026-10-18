// Audit scores for the sample data, from p2-14 and p2-15. Pure functions.
// Sub-section score = sum(score x weight) / sum(5 x weight) x 100, applicable items only.
// Property score = sub-section scores averaged by sub-section weight. A critical item scoring 0
// (or answered No) raises a red flag and caps the property score at 50.

export const RED_FLAG_CAP = 50;

export const round2 = (n: number) => Math.round(n * 100) / 100;

export type ScoredItem = { score: number | null; isNa: boolean; weight: number; critical: boolean };
export type ScoredSubSection = { weight: number; items: ScoredItem[] };

const applicable = (i: ScoredItem) => !i.isNa && i.score !== null;

export function subSectionScore(items: ScoredItem[]): number | null {
  const rows = items.filter(applicable);
  if (rows.length === 0) return null;
  const num = rows.reduce((s, r) => s + (r.score ?? 0) * r.weight, 0);
  const den = rows.reduce((s, r) => s + 5 * r.weight, 0);
  return round2((num / den) * 100);
}

export function scoreRevision(subSections: ScoredSubSection[]): {
  subSections: (number | null)[];
  property: number | null;
  hasRedFlag: boolean;
} {
  const scores = subSections.map((s) => subSectionScore(s.items));
  let num = 0;
  let den = 0;
  subSections.forEach((s, i) => {
    const sc = scores[i];
    if (sc === null || sc === undefined) return;
    num += sc * s.weight;
    den += s.weight;
  });
  const hasRedFlag = subSections.some((s) =>
    s.items.some((i) => applicable(i) && i.critical && i.score === 0),
  );
  if (den === 0) return { subSections: scores, property: null, hasRedFlag };
  const raw = num / den;
  return {
    subSections: scores,
    property: round2(hasRedFlag ? Math.min(raw, RED_FLAG_CAP) : raw),
    hasRedFlag,
  };
}

/** Score bands (p2-14). */
export function band(score: number): "Excellent" | "Good" | "Needs work" | "Poor" {
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Good";
  if (score >= 60) return "Needs work";
  return "Poor";
}
