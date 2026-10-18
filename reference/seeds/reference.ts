// Sample masters and audit templates. These are sample items for staging, so audits and
// issues have something real to point at. They are NOT the seed audit template items of
// Epic 6: those start as draft and wait for approval at Gate 3. Codes start with SMP- so
// the two never mix. Sections, score scales, evidence types and reasons are the shared
// masters of the app and keep their real names.
import { sid } from "./ids";

export type SectionKey = "AE" | "FO" | "HK" | "FB" | "KT" | "PA" | "WR" | "EM" | "SC" | "SG" | "FA";

/** Section weights follow p2-14: High 3, Medium 2, Low 1. */
export const SECTIONS: { key: SectionKey; name: string; weight: number }[] = [
  { key: "AE", name: "Arrival & Exterior", weight: 1 },
  { key: "FO", name: "Front Office & Guest Services", weight: 2 },
  { key: "HK", name: "Rooms & Housekeeping", weight: 3 },
  { key: "FB", name: "Food & Beverage", weight: 2 },
  { key: "KT", name: "Kitchen & Back of House", weight: 3 },
  { key: "PA", name: "Public Areas & Facilities", weight: 1 },
  { key: "WR", name: "Wellness & Recreation", weight: 1 },
  { key: "EM", name: "Engineering & Maintenance", weight: 2 },
  { key: "SC", name: "Safety, Security & Compliance", weight: 3 },
  { key: "SG", name: "Staff, Grooming & Service Culture", weight: 1 },
  { key: "FA", name: "Finance & Accounting", weight: 2 },
];

// The id strings keep the names the rows had before E04-14 (department, section), so a database
// that was migrated keeps matching ids when the seed runs again.
export const sectionId = (k: SectionKey) => sid(`department:${k}`);
export const subSectionId = (k: SectionKey) => sid(`section:${k}`);
export const sopId = (k: SectionKey) => sid(`sop:${k}`);

export const SCALES = {
  zero_to_five: { id: sid("scale:zero_to_five"), name: "0 to 5" },
  yes_no: { id: sid("scale:yes_no"), name: "Yes / No" },
} as const;

export const EVIDENCE_TYPES = [
  { id: sid("evidence-type:photo"), name: "photo" },
  { id: sid("evidence-type:document"), name: "document" },
  { id: sid("evidence-type:sample_check"), name: "sample_check" },
] as const;
export const evidenceTypeId = (n: "photo" | "document" | "sample_check") =>
  sid(`evidence-type:${n}`);

export const REASONS = [
  "No SOP",
  "Not trained",
  "Short of stock",
  "Equipment not working",
  "Already reported",
  "Disagrees",
].map((label, i) => ({ id: sid(`reason:${label}`), label, sortOrder: i + 1 }));

export const TAGS = ["Critical", "FSSAI", "Monsoon"].map((name) => ({
  id: sid(`tag:${name}`),
  name,
}));

export const SOPS: { key: SectionKey; code: string; title: string; text: string }[] = [
  {
    key: "HK",
    code: "SMP-SOP-HK-01",
    title: "Guest room inspection",
    text: "Supervisor inspects every released room against the room checklist before it is sold.",
  },
  {
    key: "KT",
    code: "SMP-SOP-KT-01",
    title: "Food storage and temperature",
    text: "Store raw and cooked food apart, log cold room temperature twice a day.",
  },
  {
    key: "SC",
    code: "SMP-SOP-SC-01",
    title: "Fire safety checks",
    text: "Test detectors and lights monthly, check extinguisher dates every month.",
  },
  {
    key: "FA",
    code: "SMP-SOP-FA-01",
    title: "Daily cash handling",
    text: "Count, record and sign cash and card totals every day. Cash and records are handled by different people.",
  },
];

type AuditItemDef = {
  key: string; // short code part, e.g. "HK-001"
  section: SectionKey;
  label: string;
  critical?: boolean;
  yesNo?: boolean;
  recommendation: string;
  sampleCheck?: boolean;
};

const I = (
  key: string,
  section: SectionKey,
  label: string,
  recommendation: string,
  o: Partial<AuditItemDef> = {},
): AuditItemDef => ({ key, section, label, recommendation, ...o });

export const AUDIT_ITEMS: AuditItemDef[] = [
  I(
    "AE-001",
    "AE",
    "Approach road and signage are clear and lit",
    "Repair or replace faded, hidden or unlit signage.",
  ),
  I(
    "AE-002",
    "AE",
    "Entrance and porch are clean and welcoming",
    "Add the porch to the morning cleaning round and check it at 10 am.",
  ),
  I(
    "AE-003",
    "AE",
    "Parking and drop-off are orderly and safe",
    "Mark bays and assign a staff member to the drop-off at peak times.",
  ),

  I(
    "FO-001",
    "FO",
    "Guest is greeted within one minute at the desk",
    "Brief the desk team on greeting every guest, even when busy.",
  ),
  I(
    "FO-002",
    "FO",
    "ID and payment handling follows the procedure",
    "Retrain the desk team and add an ID check to the shift handover.",
    { critical: true, yesNo: true },
  ),
  I(
    "FO-003",
    "FO",
    "Check-out bill matches the charges posted",
    "Review the bill with the guest and correct posting errors on the same day.",
    { sampleCheck: true },
  ),
  I(
    "FO-004",
    "FO",
    "Desk queue is managed during peak hours",
    "Open a second counter when more than three guests wait.",
  ),

  I(
    "HK-001",
    "HK",
    "Room door lock works and the safety notice is displayed",
    "Repair faulty locks the same day and replace missing safety notices.",
    { critical: true },
  ),
  I(
    "HK-002",
    "HK",
    "Room is clean with no odour",
    "Deep clean the room and check it again before it is sold.",
    { sampleCheck: true },
  ),
  I(
    "HK-003",
    "HK",
    "Bed and linen are clean and undamaged",
    "Replace stained or worn linen and check the par stock.",
  ),
  I(
    "HK-004",
    "HK",
    "Bathroom fixtures and grouting are clean",
    "Schedule a grout and fixture clean for the affected rooms.",
  ),
  I(
    "HK-005",
    "HK",
    "Water pressure and drainage are acceptable",
    "Raise an engineering request and recheck within two days.",
  ),
  I(
    "HK-006",
    "HK",
    "Air conditioning cools the room and is quiet",
    "Service the unit and clean the filters.",
  ),

  I(
    "FB-001",
    "FB",
    "Table setup is complete and clean",
    "Use a setup checklist before each service.",
  ),
  I(
    "FB-002",
    "FB",
    "Menu matches what is served",
    "Update the menu or the kitchen list so both agree.",
  ),
  I(
    "FB-003",
    "FB",
    "Buffet labels and hot holding are correct",
    "Label every dish and check hot holding temperature every hour.",
    { sampleCheck: true },
  ),

  I(
    "KT-001",
    "KT",
    "Raw and cooked food are stored separately",
    "Separate shelves and containers, and label them.",
    { critical: true, yesNo: true },
  ),
  I(
    "KT-002",
    "KT",
    "Cold room temperature is in range and logged",
    "Log temperature twice a day and report readings above 5 C at once.",
    { critical: true, sampleCheck: true },
  ),
  I(
    "KT-003",
    "KT",
    "Staff wash hands and wear clean uniforms and hair covers",
    "Place handwash reminders and check at the start of each shift.",
  ),
  I(
    "KT-004",
    "KT",
    "Pest control records are current",
    "Renew the pest control visit and keep the report in the kitchen file.",
  ),
  I(
    "KT-005",
    "KT",
    "Gas safety checks and hood cleaning are up to date",
    "Book the gas check and hood cleaning and display the dates.",
    { critical: true },
  ),

  I("PA-001", "PA", "Lobby and lounge are clean and tidy", "Add a lobby round every two hours."),
  I(
    "PA-002",
    "PA",
    "Public restrooms are clean and stocked",
    "Use a restroom checklist signed every two hours.",
  ),
  I(
    "PA-003",
    "PA",
    "Lifts work and are clean",
    "Report lift faults the same day and clean the cabins daily.",
  ),

  I(
    "WR-001",
    "WR",
    "Pool water is tested and logged, with safety signs",
    "Test the water three times a day and display the safety rules.",
    { critical: true },
  ),
  I("WR-002", "WR", "Gym equipment works and is clean", "Tag broken equipment and arrange repair."),
  I("WR-003", "WR", "Changing rooms are clean and dry", "Add a cleaning round after peak hours."),

  I(
    "EM-001",
    "EM",
    "No visible defects, leaks or stains in guest areas",
    "Create a defect list and repair in order of guest impact.",
  ),
  I("EM-002", "EM", "Lighting works in all public areas", "Replace failed bulbs within one day."),
  I(
    "EM-003",
    "EM",
    "Generator and power backup are tested and logged",
    "Run a monthly load test and keep the log.",
    { yesNo: true },
  ),

  I(
    "SC-001",
    "SC",
    "Fire extinguishers are in date and easy to reach",
    "Refill extinguishers that are past date and clear the access.",
    { critical: true },
  ),
  I(
    "SC-002",
    "SC",
    "Smoke detectors and alarms are tested",
    "Test every detector this month and log the result.",
    { critical: true },
  ),
  I(
    "SC-003",
    "SC",
    "Exits are clear and emergency lighting works",
    "Clear the exit routes and repair emergency lights at once.",
    { critical: true },
  ),
  I(
    "SC-004",
    "SC",
    "CCTV covers entrances and records are kept for 30 days",
    "Adjust camera angles and set the recorder to keep 30 days.",
    { yesNo: true },
  ),
  I(
    "SC-005",
    "SC",
    "Licences are displayed and valid",
    "Renew expired licences and display copies at the desk.",
    { yesNo: true },
  ),

  I(
    "SG-001",
    "SG",
    "Uniforms and name badges are worn correctly",
    "Hold a grooming check at each shift briefing.",
  ),
  I(
    "SG-002",
    "SG",
    "Staff are courteous and respond quickly",
    "Coach the team on responding within two minutes.",
  ),
  I(
    "SG-003",
    "SG",
    "Staff know the hotel products and services",
    "Add a weekly product briefing to the roster.",
  ),

  I(
    "FA-001",
    "FA",
    "Daily cash and card reconciliation is signed",
    "Sign the reconciliation every day and file it.",
    { yesNo: true },
  ),
  I(
    "FA-002",
    "FA",
    "Petty cash count matches the book",
    "Count petty cash weekly and report any difference.",
    { sampleCheck: true },
  ),
  I(
    "FA-003",
    "FA",
    "Night audit reports are signed",
    "Have the duty manager sign the reports each morning.",
    { yesNo: true },
  ),
  I(
    "FA-004",
    "FA",
    "GST invoices and filings are up to date",
    "Reconcile invoices monthly and file on time.",
    { critical: true, yesNo: true },
  ),
];

export const SOP_FOR_ITEM: Record<string, SectionKey> = {
  "HK-001": "HK",
  "HK-002": "HK",
  "KT-001": "KT",
  "KT-002": "KT",
  "SC-001": "SC",
  "SC-002": "SC",
  "SC-003": "SC",
  "FA-001": "FA",
};

export const auditItemCode = (key: string) => `SMP-${key}`;
export const auditItemId = (key: string) => sid(`item:${key}`);
export const auditItemDef = (key: string): AuditItemDef => {
  const found = AUDIT_ITEMS.find((i) => i.key === key);
  if (!found) throw new Error(`Unknown sample item ${key}`);
  return found;
};

export type TemplateKey = "ops" | "kitchen" | "finance";
type VisibleRole = "auditor" | "group_head" | "hotel_manager" | "staff";

export const TEMPLATES: {
  key: TemplateKey;
  name: string;
  description: string;
  sections: SectionKey[];
  /** Items to use, by Section. Omitted means every item of that Section. */
  only?: Partial<Record<SectionKey, string[]>>;
  visibility: VisibleRole[];
}[] = [
  {
    key: "ops",
    name: "Ops & Quality (sample)",
    description: "Sample audit template: every Ops & Quality Section in one audit.",
    sections: ["AE", "FO", "HK", "FB", "KT", "PA", "WR", "EM", "SC", "SG"],
    visibility: ["auditor", "group_head", "hotel_manager"],
  },
  {
    key: "kitchen",
    name: "Kitchen & Back of House (sample)",
    description: "Sample audit template: kitchen hygiene and safety.",
    sections: ["KT", "SC"],
    only: { SC: ["SC-001", "SC-002"] },
    visibility: ["auditor", "group_head", "hotel_manager", "staff"],
  },
  {
    key: "finance",
    name: "Financial & Accounting Practices (sample)",
    description: "Sample audit template: cash handling and records. Senior roles only.",
    sections: ["FA"],
    visibility: ["auditor", "group_head", "hotel_manager"],
  },
];

export const templateId = (k: TemplateKey) => sid(`template:${k}`);
export const templateVersionId = (k: TemplateKey) => sid(`template:${k}:v1`);

/** Items of one template, grouped by Section in template order. */
export function templateLayout(k: TemplateKey) {
  const t = TEMPLATES.find((x) => x.key === k);
  if (!t) throw new Error(`Unknown template ${k}`);
  return t.sections.map((section) => {
    const only = t.only?.[section];
    const items = AUDIT_ITEMS.filter(
      (i) => i.section === section && (!only || only.includes(i.key)),
    );
    return { section, items };
  });
}

/** Weight of an item inside a template: critical items count double. */
export const templateItemWeight = (i: AuditItemDef) => (i.critical ? 2 : 1);

export const sectionWeight = (k: SectionKey) => {
  const d = SECTIONS.find((x) => x.key === k);
  if (!d) throw new Error(`Unknown Section ${k}`);
  return d.weight;
};
export const sectionName = (k: SectionKey) => {
  const d = SECTIONS.find((x) => x.key === k);
  if (!d) throw new Error(`Unknown Section ${k}`);
  return d.name;
};
