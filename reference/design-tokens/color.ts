// OKLCH helpers. zarnik-ds declares colours in oklch; emails and contrast checks need sRGB.
// Conversion follows CSS Color 4 (OKLab to linear sRGB), clamped to the sRGB gamut.

export type Oklch = { l: number; c: number; h: number; alpha: number };

const OKLCH = /^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*([\d.]+)(%?)\s*)?\)$/;

export function parseOklch(value: string): Oklch {
  const m = OKLCH.exec(value.trim());
  if (!m) throw new Error(`Not an oklch colour: ${value}`);
  const alpha = m[4] === undefined ? 1 : Number(m[4]) / (m[5] ? 100 : 1);
  return { l: Number(m[1]), c: Number(m[2]), h: Number(m[3]), alpha };
}

const round = (x: number, d = 3) => Number(x.toFixed(d));

export function formatOklch({ l, c, h, alpha }: Oklch): string {
  const base = `${round(l)} ${round(c)} ${round(h)}`;
  return alpha < 1 ? `oklch(${base} / ${round(alpha * 100, 1)}%)` : `oklch(${base})`;
}

/** Linear sRGB channels 0 to 1, clamped. */
function toLinearRgb({ l, c, h }: Oklch): [number, number, number] {
  const rad = (h * Math.PI) / 180;
  const a = c * Math.cos(rad);
  const b = c * Math.sin(rad);
  const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const clamp = (x: number) => Math.min(1, Math.max(0, x));
  return [
    clamp(4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_),
    clamp(-1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_),
    clamp(-0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_),
  ];
}

const gamma = (x: number) => (x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055);
const ungamma = (x: number) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4);

type Rgb = [number, number, number];
const WHITE: Rgb = [1, 1, 1];

/** Gamma-encoded sRGB channels 0 to 1, a translucent colour laid over `under`. */
function flatten(value: string, under: Rgb): Rgb {
  const col = parseOklch(value);
  const [r, g, b] = toLinearRgb(col).map(gamma) as Rgb;
  const a = col.alpha;
  return [r * a + under[0] * (1 - a), g * a + under[1] * (1 - a), b * a + under[2] * (1 - a)];
}

/** sRGB channels 0 to 255. A translucent colour is laid over `over` (default white). */
export function toRgb(value: string, over?: string): Rgb {
  const under = over ? flatten(over, WHITE) : WHITE;
  return flatten(value, under).map((x) => Math.round(x * 255)) as Rgb;
}

/** "#rrggbb" for places that cannot read oklch, such as email clients. */
export function toHex(value: string, over?: string): string {
  return `#${toRgb(value, over)
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("")}`;
}

const luminance = (rgb: Rgb) => {
  const [r, g, b] = rgb.map(ungamma) as Rgb;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/** WCAG contrast ratio. A translucent background is laid over `ground` (the page). */
export function contrast(fg: string, bg: string, ground = "oklch(1 0 0)"): number {
  const back = flatten(bg, flatten(ground, WHITE));
  const a = luminance(flatten(fg, back));
  const b = luminance(back);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

/**
 * CSS color-mix(in oklch, a p%, b): lightness and chroma blend linearly, hue takes the
 * shorter arc. Sightline mixes zarnik-ds hues this way to fill the steps between them.
 */
export function mixOklch(a: string, b: string, p: number): string {
  const x = parseOklch(a);
  const y = parseOklch(b);
  let dh = y.h - x.h;
  if (dh > 180) dh -= 360;
  if (dh < -180) dh += 360;
  // An achromatic side has no hue; CSS takes the other side's hue.
  const h = x.c === 0 ? y.h : y.c === 0 ? x.h : (x.h + dh * (1 - p) + 360) % 360;
  return formatOklch({
    l: x.l * p + y.l * (1 - p),
    c: x.c * p + y.c * (1 - p),
    h,
    alpha: x.alpha * p + y.alpha * (1 - p),
  });
}
