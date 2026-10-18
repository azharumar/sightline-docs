// Product name and brand mark. Colours and fonts come from zarnik-ds (./zarnik-ds.ts).
import { brandMark, zarnikDs } from "./zarnik-ds";

export const brand = {
  name: "Sightline",
  /** The Zarnik mark colour. Logo and the capture progress line only. */
  mark: brandMark,
  source: zarnikDs,
} as const;
