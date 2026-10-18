// Sample hotel groups, hotels, people and their links. All names are made up.
import { sid, type Day, addDays } from "./ids";

export const SAMPLE_EMAIL_DOMAIN = "sightline-sample.test";

export type UserKey =
  | "admin"
  | "rohan"
  | "nandini"
  | "gh1"
  | "gh2"
  | "hm1"
  | "hm2"
  | "hm3"
  | "staff1"
  | "staff2"
  | "staff3"
  | "staffExpired";

export const userId = (k: UserKey) => sid(`user:${k}`);

type ExpiryOption = "7_days" | "30_days" | "60_days" | "90_days" | "custom" | "no_expiry";

export type UserDef = {
  key: UserKey;
  fullName: string;
  handle: string;
  platformRole: "admin" | "auditor" | "none";
  auditorType?: "employee" | "freelancer";
  baseCity?: string;
  status: "active" | "expired";
  expiry: ExpiryOption;
  /** Days from the seed day until access ends. Negative means it has already ended. */
  expiresInDays: number | null;
  /** Days before the seed day that the account was created. */
  createdDaysAgo: number;
};

export const USERS: UserDef[] = [
  {
    key: "admin",
    fullName: "Asha Verma",
    handle: "asha.verma",
    platformRole: "admin",
    status: "active",
    expiry: "no_expiry",
    expiresInDays: null,
    createdDaysAgo: 400,
  },
  {
    key: "rohan",
    fullName: "Rohan Mehta",
    handle: "rohan.mehta",
    platformRole: "auditor",
    auditorType: "employee",
    baseCity: "Bengaluru",
    status: "active",
    expiry: "no_expiry",
    expiresInDays: null,
    createdDaysAgo: 390,
  },
  {
    key: "nandini",
    fullName: "Nandini Rao",
    handle: "nandini.rao",
    platformRole: "auditor",
    auditorType: "freelancer",
    baseCity: "Pune",
    status: "active",
    expiry: "90_days",
    expiresInDays: 70,
    createdDaysAgo: 330,
  },
  {
    key: "gh1",
    fullName: "Vikram Nair",
    handle: "vikram.nair",
    platformRole: "none",
    status: "active",
    expiry: "90_days",
    expiresInDays: 60,
    createdDaysAgo: 300,
  },
  {
    key: "gh2",
    fullName: "Sunita Kapoor",
    handle: "sunita.kapoor",
    platformRole: "none",
    status: "active",
    expiry: "90_days",
    expiresInDays: 45,
    createdDaysAgo: 260,
  },
  {
    key: "hm1",
    fullName: "Daniel Pereira",
    handle: "daniel.pereira",
    platformRole: "none",
    status: "active",
    expiry: "90_days",
    expiresInDays: 80,
    createdDaysAgo: 300,
  },
  {
    key: "hm2",
    fullName: "Farah Sheikh",
    handle: "farah.sheikh",
    platformRole: "none",
    status: "active",
    expiry: "60_days",
    expiresInDays: 25,
    createdDaysAgo: 290,
  },
  {
    key: "hm3",
    fullName: "Gautam Bose",
    handle: "gautam.bose",
    platformRole: "none",
    status: "active",
    expiry: "90_days",
    expiresInDays: 50,
    createdDaysAgo: 250,
  },
  {
    key: "staff1",
    fullName: "Joseph Thomas",
    handle: "joseph.thomas",
    platformRole: "none",
    status: "active",
    expiry: "30_days",
    expiresInDays: 9,
    createdDaysAgo: 200,
  },
  {
    key: "staff2",
    fullName: "Meena Pillai",
    handle: "meena.pillai",
    platformRole: "none",
    status: "active",
    expiry: "90_days",
    expiresInDays: 55,
    createdDaysAgo: 190,
  },
  {
    key: "staff3",
    fullName: "Kavya Hegde",
    handle: "kavya.hegde",
    platformRole: "none",
    status: "active",
    expiry: "90_days",
    expiresInDays: 65,
    createdDaysAgo: 180,
  },
  {
    key: "staffExpired",
    fullName: "Tarun Joshi",
    handle: "tarun.joshi",
    platformRole: "none",
    status: "expired",
    expiry: "7_days",
    expiresInDays: -12,
    createdDaysAgo: 120,
  },
];

export const emailOf = (u: UserDef, domain = SAMPLE_EMAIL_DOMAIN) => `${u.handle}@${domain}`;

export const accessEndsOn = (u: UserDef, today: Day): Day | null =>
  u.expiresInDays === null ? null : addDays(today, u.expiresInDays);

// The id strings keep the old word (`client:`, `client-membership:`) so a database that was
// migrated keeps matching ids when the seed runs again.
export type HotelGroupKey = "c1" | "c2";
export const hotelGroupId = (k: HotelGroupKey) => sid(`client:${k}`);

export const HOTEL_GROUPS: { key: HotelGroupKey; name: string; code: string }[] = [
  { key: "c1", name: "Harbor Lane Hotels", code: "HLH" },
  { key: "c2", name: "Pinewood Stays", code: "PWS" },
];

export type HotelKey = "grand" | "express" | "pinewood";
export const hotelId = (k: HotelKey) => sid(`hotel:${k}`);

export const HOTELS: {
  key: HotelKey;
  hotelGroup: HotelGroupKey;
  name: string;
  code: string;
  city: string;
  state: string;
  rooms: number;
  propertyType: "hotel" | "resort" | "other";
  contactName: string;
  contactPhone: string;
}[] = [
  {
    key: "grand",
    hotelGroup: "c1",
    name: "Harbor Lane Grand",
    code: "HLH-GRAND",
    city: "Kochi",
    state: "Kerala",
    rooms: 150,
    propertyType: "hotel",
    contactName: "Daniel Pereira",
    contactPhone: "+91 90000 00101",
  },
  {
    key: "express",
    hotelGroup: "c1",
    name: "Harbor Lane Express",
    code: "HLH-EXPRESS",
    city: "Coimbatore",
    state: "Tamil Nadu",
    rooms: 64,
    propertyType: "hotel",
    contactName: "Farah Sheikh",
    contactPhone: "+91 90000 00102",
  },
  {
    key: "pinewood",
    hotelGroup: "c2",
    name: "Pinewood Inn",
    code: "PWS-INN",
    city: "Mysuru",
    state: "Karnataka",
    rooms: 28,
    propertyType: "hotel",
    contactName: "Gautam Bose",
    contactPhone: "+91 90000 00103",
  },
];

export const hotelGroupOfHotel = (h: HotelKey) => {
  const hotel = HOTELS.find((x) => x.key === h);
  if (!hotel) throw new Error(`Unknown hotel ${h}`);
  return hotel.hotelGroup;
};

/** Group Head links: person and hotel group. */
export const HOTEL_GROUP_MEMBERSHIPS: { user: UserKey; hotelGroup: HotelGroupKey }[] = [
  { user: "gh1", hotelGroup: "c1" },
  { user: "gh2", hotelGroup: "c2" },
];

/** Hotel links: person, hotel and role. */
export const MEMBERSHIPS: {
  user: UserKey;
  hotel: HotelKey;
  role: "hotel_manager" | "staff";
}[] = [
  { user: "hm1", hotel: "grand", role: "hotel_manager" },
  { user: "hm2", hotel: "express", role: "hotel_manager" },
  { user: "hm3", hotel: "pinewood", role: "hotel_manager" },
  { user: "staff1", hotel: "grand", role: "staff" },
  { user: "staff2", hotel: "express", role: "staff" },
  { user: "staff3", hotel: "pinewood", role: "staff" },
  { user: "staffExpired", hotel: "grand", role: "staff" },
];
