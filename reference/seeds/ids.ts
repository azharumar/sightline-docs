// Stable ids and dates for the sample data. Every row gets an id that is derived from a key,
// so running the seed twice, or on two databases, produces the same ids and never duplicates.
import { createHash } from "node:crypto";

/** A UUID (version 7 shape) derived from a key. The same key always gives the same id. */
export function sid(key: string): string {
  const h = createHash("sha1")
    .update(`sightline-sample:${key}`)
    .digest("hex")
    .slice(0, 32)
    .split("");
  h[12] = "7";
  h[16] = "8";
  const s = h.join("");
  return `${s.slice(0, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16, 20)}-${s.slice(20)}`;
}

/** Small deterministic random numbers, so sample scores do not change between runs. */
export function rng(key: string): () => number {
  let a = createHash("sha1").update(key).digest().readUInt32LE(0);
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** "YYYY-MM-DD". All dates in the sample data are plain dates, counted from the seed day. */
export type Day = string;

export const day = (d: Date): Day => d.toISOString().slice(0, 10);

export function addDays(base: Day, n: number): Day {
  const d = new Date(`${base}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return day(d);
}

export function addMonths(base: Day, n: number): Day {
  const d = new Date(`${base}T00:00:00.000Z`);
  d.setUTCMonth(d.getUTCMonth() + n);
  return day(d);
}

/** A moment on a given day, at a fixed hour in UTC. */
export const at = (d: Day, hour = 9, minute = 0): Date =>
  new Date(`${d}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00.000Z`);

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const monthYear = (d: Day): string =>
  `${MONTHS[Number(d.slice(5, 7)) - 1]} ${d.slice(0, 4)}`;
