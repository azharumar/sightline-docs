import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { brand } from "./brand";
import { bandClasses, scoreClasses, statusClasses, textLevelClasses } from "./classes";
import { contrast, mixOklch, parseOklch, toHex } from "./color";
import { kebab, renderGlobalsCss, semanticEntries } from "./css";
import {
  bandColor,
  bandLabel,
  bands,
  controlHeight,
  emailPalette,
  modes,
  scoreColor,
  scores,
  statusColor,
  statusLabel,
  statuses,
  textLevelNames,
  textLevels,
  theme,
  typeNames,
  typeScale,
  typeWeight,
} from "./tokens";
import * as copied from "./zarnik-ds";
import { brandMark, desk, font, hue, n, zarnikDs } from "./zarnik-ds";

const OKLCH = /^oklch\(/;
const px = (rem: string) => parseFloat(rem) * 16;

/**
 * SHA-256 of every value copied from zarnik-ds, per pinned commit. Editing src/design/zarnik-ds.ts
 * fails this test. To take a new zarnik-ds commit: change the pin, copy the values again, and add
 * the new commit and hash here.
 */
const copiedValuesHash: Record<string, string> = {
  "99988d1ba89190b7e79508b3d145bd1b0eafaba4":
    "b98f19565275dab0beb0b1130912fa15eb6b5116b6c0606a29ef306fcfe7d161",
};

describe("zarnik-ds pin", () => {
  const pkg = JSON.parse(readFileSync(join(__dirname, "..", "..", "package.json"), "utf8"));

  it("package.json pins the same zarnik-ds commit as the copied values", () => {
    expect(pkg.zarnikDs).toEqual({ repo: zarnikDs.repo, commit: zarnikDs.commit });
    expect(zarnikDs.commit).toMatch(/^99988d1[0-9a-f]{33}$/);
  });

  it("copied values are unchanged for the pinned commit", () => {
    const hash = createHash("sha256").update(JSON.stringify(copied)).digest("hex");
    expect(hash).toBe(copiedValuesHash[pkg.zarnikDs.commit]);
  });

  it("ships every Noto Sans file the CSS names", () => {
    const css = readFileSync(join(__dirname, "..", "app", "globals.css"), "utf8");
    for (const { file } of font.files)
      for (const subset of Object.keys(font.unicodeRange)) {
        const path = `/fonts/${file}.${subset}.woff2`;
        expect(css).toContain(path);
        expect(() => readFileSync(join(__dirname, "..", "..", "public", path))).not.toThrow();
      }
  });
});

describe("brand values", () => {
  it("theme colours are zarnik-ds desk values, not redefined", () => {
    expect(theme.light.background).toBe(desk.surfacePage[0]);
    expect(theme.dark.background).toBe(desk.surfacePage[1]);
    expect(theme.light.primary).toBe(n[800][0]);
    expect(theme.dark.primary).toBe(n[800][1]);
    expect(theme.light.foreground).toBe(n[900][0]);
    expect(theme.light.destructive).toBe(hue.red700[0]);
    expect(theme.dark.destructive).toBe(hue.red600[1]);
    expect(theme.light.successForeground).toBe(hue.green700[0]);
    expect(theme.dark.warningForeground).toBe(hue.amber800[1]);
    expect(theme.light.brand).toBe(brandMark);
    expect(theme.light.ground).toBe(desk.surfaceSubtle[0]);
    expect(theme.dark.ground).toBe(desk.surfacePage[1]);
    expect(brand.mark).toBe(brandMark);
  });
});

describe("colour helpers", () => {
  it("converts oklch to hex", () => {
    expect(toHex("oklch(1 0 0)")).toBe("#ffffff");
    expect(toHex("oklch(0 0 0)")).toBe("#000000");
    expect(toHex("oklch(0.145 0 0)")).toBe("#0a0a0a");
    // Tailwind red-600 is defined as this oklch value.
    expect(toHex("oklch(0.577 0.245 27.325)")).toBe("#e7000b");
  });

  it("lays translucent colours over the ground", () => {
    expect(toHex("oklch(0 0 0 / 50%)")).toBe("#808080");
    expect(parseOklch("oklch(1 0 0 / 10%)").alpha).toBeCloseTo(0.1);
  });

  it("mixes like CSS color-mix in oklch", () => {
    expect(mixOklch("oklch(0.5 0.1 10)", "oklch(0.7 0.2 350)", 0.5)).toBe("oklch(0.6 0.15 0)");
    expect(contrast("oklch(0 0 0)", "oklch(1 0 0)")).toBeCloseTo(21, 0);
  });
});

describe("theme colours", () => {
  it.each(modes)("%s mode text meets WCAG AA (4.5:1)", (mode) => {
    const t = theme[mode];
    const pairs: [string, string][] = [
      [t.foreground, t.background],
      [t.bodyForeground, t.background],
      [t.subtleForeground, t.background],
      [t.subtleForeground, t.muted],
      [t.mutedForeground, t.background],
      [t.mutedForeground, t.card],
      [t.mutedForeground, t.muted],
      [t.cardForeground, t.card],
      [t.popoverForeground, t.popover],
      [t.primaryForeground, t.primary],
      [t.primaryForeground, t.primaryHover],
      [t.secondaryForeground, t.secondary],
      [t.accentForeground, t.accent],
      [t.destructiveForeground, t.destructive],
      [t.sidebarForeground, t.sidebar],
    ];
    // Status text tones on every surface they can sit on.
    for (const fg of [t.destructive, t.warningForeground, t.successForeground])
      for (const bg of [t.background, t.card, t.popover, t.muted, t.hover, t.sidebar])
        pairs.push([fg, bg]);
    for (const [fg, bg] of pairs)
      expect(contrast(fg, bg, t.background), `${fg} on ${bg}`).toBeGreaterThanOrEqual(4.5);
  });

  it("light and dark define the same roles as oklch values", () => {
    expect(Object.keys(theme.dark).sort()).toEqual(Object.keys(theme.light).sort());
    for (const mode of modes) for (const v of Object.values(theme[mode])) expect(v).toMatch(OKLCH);
  });
});

describe("score, band and status colours", () => {
  it("cover every score 0 to 5, every band and every status", () => {
    expect(Object.keys(scoreColor).map(Number)).toEqual([...scores]);
    expect(Object.keys(bandColor)).toEqual([...bands]);
    expect(Object.keys(statusColor)).toEqual([...statuses]);
    expect(Object.values(bandLabel)).toEqual(["Excellent", "Good", "Needs work", "Poor"]);
    expect(Object.values(statusLabel)).toEqual(["Open", "In progress", "Resolved", "Red flag"]);
  });

  it.each(semanticEntries())("%s is readable in light and dark mode", (_name, c) => {
    for (const mode of modes) {
      const { solid, onSolid, soft, onSoft } = c[mode];
      for (const v of [solid, onSolid, soft, onSoft]) expect(v).toMatch(OKLCH);
      expect(contrast(onSolid, solid)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(onSoft, soft)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("scores run red to green through amber, built only from zarnik-ds hues", () => {
    expect(scoreColor[0].light.solid).toBe(hue.red600[0]);
    expect(scoreColor[0].dark.solid).toBe(hue.red600[1]);
    expect(scoreColor[2].light.solid).toBe(hue.amber600[0]);
    expect(scoreColor[5].light.solid).toBe(hue.green600[0]);
    const solids = scores.map((s) => scoreColor[s].light.solid);
    expect(new Set(solids).size).toBe(scores.length);
    const hues = solids.map((s) => parseOklch(s).h);
    for (let i = 1; i < hues.length; i++) expect(hues[i]).toBeGreaterThan(hues[i - 1] ?? 0);
  });

  it("bands use the score colours: Excellent 5, Good 4, Needs work 2, Poor 0", () => {
    expect(bandColor.excellent).toBe(scoreColor[5]);
    expect(bandColor.good).toBe(scoreColor[4]);
    expect(bandColor.needsWork).toBe(scoreColor[2]);
    expect(bandColor.poor).toBe(scoreColor[0]);
  });

  it("statuses: Open amber, In progress blue, Resolved green, Red flag red", () => {
    for (const mode of modes) {
      const i = mode === "light" ? 0 : 1;
      expect(statusColor.open[mode].solid).toBe(hue.amber600[i]);
      expect(statusColor.inProgress[mode].solid).toBe(hue.blue600[i]);
      expect(statusColor.resolved[mode].solid).toBe(hue.green600[i]);
      expect(statusColor.redFlag[mode].solid).toBe(hue.red600[i]);
    }
  });

  it("email palette is hex, since email clients cannot read oklch", () => {
    const all = [
      ...Object.values(emailPalette).filter((v) => typeof v === "string"),
      ...Object.values(emailPalette.band),
      ...Object.values(emailPalette.status),
    ];
    for (const v of all) expect(v).toMatch(/^#[0-9a-f]{6}$/);
  });
});

describe("type scale", () => {
  it("phone steps are 18, 15, 14 and 12 and never above 18", () => {
    const p = typeScale.phone;
    expect([p.title, p.section, p.body, p.meta].map((t) => px(t.size))).toEqual([18, 15, 14, 12]);
    for (const k of typeNames) if (k !== "form") expect(px(p[k].size)).toBeLessThanOrEqual(18);
    expect(px(p.form.size)).toBe(16);
  });

  it("laptop uses the desk scale: title 24, section 15, body 14, caption 12", () => {
    const l = typeScale.laptop;
    expect([l.title, l.section, l.body, l.meta].map((t) => px(t.size))).toEqual([24, 15, 14, 12]);
    expect(l.title.tracking).toBe("-0.025em");
  });
});

describe("text levels", () => {
  const kebabCase = (s: string) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

  it("page title 18, section 15, subheading 14, body 14, label 12 medium, meta 12", () => {
    const size = (l: (typeof textLevelNames)[number]) =>
      px(typeScale.phone[textLevels[l].step].size);
    expect(textLevelNames.map(size)).toEqual([18, 15, 14, 14, 12, 12]);
    expect(textLevelNames.map((l) => typeWeight[textLevels[l].weight])).toEqual([
      "600",
      "600",
      "600",
      "400",
      "500",
      "400",
    ]);
    expect(textLevels.section).toMatchObject({ spaceAbove: 24, divider: true, panel: true });
    expect(textLevels.subsection).toMatchObject({ spaceAbove: 12, divider: false });
  });

  it("each level differs from the next in at least two of size, weight, colour, spacing or container", () => {
    const traits = (l: (typeof textLevelNames)[number]) => {
      const t = textLevels[l] as { spaceAbove?: number; divider?: boolean; panel?: boolean };
      return [
        typeScale.phone[textLevels[l].step].size,
        textLevels[l].weight,
        theme.light[textLevels[l].color],
        t.spaceAbove ?? 0,
        `${t.divider ?? false} ${t.panel ?? false}`,
      ];
    };
    for (let i = 1; i < textLevelNames.length; i++) {
      const a = traits(textLevelNames[i - 1]!);
      const b = traits(textLevelNames[i]!);
      const differ = a.filter((v, k) => v !== b[k]).length;
      expect(differ, `${textLevelNames[i - 1]} and ${textLevelNames[i]}`).toBeGreaterThanOrEqual(2);
    }
  });

  it("classes match the tokens", () => {
    for (const l of textLevelNames) {
      const t = textLevels[l];
      expect(textLevelClasses[l].split(" ")).toEqual([
        `text-${t.step}`,
        `font-${t.weight}`,
        `text-${kebabCase(t.color)}`,
      ]);
    }
  });

  it("phone controls are smaller than laptop, never below 32, fields 40", () => {
    expect(controlHeight.phone).toEqual({ button: 36, buttonSmall: 32, icon: 36, field: 40 });
    expect(controlHeight.laptop).toEqual({ button: 40, buttonSmall: 36, icon: 40, field: 40 });
  });
});

describe("generated CSS", () => {
  const squash = (s: string) => s.replace(/\s+/g, " ").trim();
  const css = readFileSync(join(__dirname, "..", "app", "globals.css"), "utf8");

  it("globals.css matches tokens.ts (regenerate with pnpm exec tsx src/design/write-css.ts)", () => {
    expect(squash(css)).toBe(squash(renderGlobalsCss()));
  });

  it("defines a Tailwind colour for every class name in classes.ts", () => {
    const all = [scoreClasses, bandClasses, statusClasses].flatMap((m) =>
      Object.values(m).flatMap((c) => [c.solid, c.soft, c.dot, c.border].join(" ").split(" ")),
    );
    for (const cls of all) {
      const name = cls.replace(/^(bg|text|border)-/, "");
      expect(css, cls).toContain(`--color-${name}: var(--${name});`);
    }
  });

  it("uses kebab case variable names", () => {
    expect(kebab("needsWork")).toBe("needs-work");
    expect(css).toContain("--status-red-flag:");
    expect(css).toContain("--band-needs-work-soft-foreground:");
  });

  it("switches to the laptop type scale at 768px and honours reduced motion", () => {
    expect(css).toContain("@media (min-width: 48rem)");
    expect(css).toContain("--type-title-size: 1.5rem;");
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(css).toContain('font-family: "Noto Sans";');
  });
});
