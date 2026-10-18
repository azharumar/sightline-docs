// Sample schedules and audits. A pure builder: given the seed day it returns every row to
// insert, with scores worked out by scoring.ts. No database access here.
import { at, addDays, addMonths, monthYear, rng, sid, type Day } from "./ids";
import {
  AUDIT_ITEMS,
  SOP_FOR_ITEM,
  REASONS,
  TEMPLATES,
  sectionId,
  sectionName,
  sectionWeight,
  evidenceTypeId,
  auditItemCode,
  auditItemId,
  templateItemWeight,
  templateLayout,
  templateVersionId,
  SOPS,
  type SectionKey,
  type TemplateKey,
} from "./reference";
import { HOTELS, MEMBERSHIPS, USERS, userId, type HotelKey, type UserKey } from "./people";
import { scoreRevision, type ScoredSubSection } from "./scoring";

export type AuditStatus = "scheduled" | "in_progress" | "submitted" | "cancelled";

export type ScheduleSpec = {
  key: string;
  hotel: HotelKey;
  template: TemplateKey;
  everyMonths: 1 | 3 | 6 | 12;
  nextDueDate: Day;
  status: "active" | "paused" | "ended";
};

export type AuditSpec = {
  key: string;
  hotel: HotelKey;
  template: TemplateKey;
  schedule?: string;
  windowStart: Day;
  windowEnd: Day;
  auditDate?: Day;
  status: AuditStatus;
  cancelReason?: string;
  auditors: UserKey[];
  /** Average score on the 0 to 5 scale. Shapes the trend. */
  bias: number;
  /** An item (by key) scored 0 on purpose, to raise a red flag. */
  redFlagItem?: string;
  /** Share of items answered, for audits in progress. */
  answered?: number;
  /** A restart of a submitted audit: revision 1 is archived, revision 2 replaces it. */
  restart?: { reason: string; daysAfter: number; bias: number };
};

/** Items that do not apply at a hotel. They start as N/A, which is left out of every score. */
const HOTEL_NA: Record<HotelKey, string[]> = {
  grand: [],
  express: [],
  pinewood: [
    "PA-003",
    "FB-003",
    ...AUDIT_ITEMS.filter((i) => i.section === "WR").map((i) => i.key),
  ],
};

export function buildSchedules(today: Day): ScheduleSpec[] {
  return [
    {
      key: "grand-ops",
      hotel: "grand",
      template: "ops",
      everyMonths: 3,
      nextDueDate: addDays(today, 85),
      status: "active",
    },
    {
      key: "express-ops",
      hotel: "express",
      template: "ops",
      everyMonths: 3,
      nextDueDate: addDays(today, 12),
      status: "active",
    },
    {
      key: "pinewood-ops",
      hotel: "pinewood",
      template: "ops",
      everyMonths: 3,
      nextDueDate: addDays(today, 22),
      status: "active",
    },
    {
      key: "grand-kitchen",
      hotel: "grand",
      template: "kitchen",
      everyMonths: 6,
      nextDueDate: addDays(today, 120),
      status: "paused",
    },
  ];
}

export function buildAuditSpecs(today: Day): AuditSpec[] {
  const past = (months: number, offset = 0): { start: Day; date: Day; end: Day } => {
    const date = addDays(addMonths(today, -months), offset);
    return { start: addDays(date, -3), date, end: addDays(date, 4) };
  };
  const spec = (
    key: string,
    hotel: HotelKey,
    template: TemplateKey,
    when: { start: Day; date?: Day; end: Day },
    rest: Partial<AuditSpec> & Pick<AuditSpec, "status" | "auditors" | "bias">,
  ): AuditSpec => ({
    key,
    hotel,
    template,
    windowStart: when.start,
    windowEnd: when.end,
    auditDate: when.date,
    ...rest,
  });
  const g = (m: number, o = 0) => past(m, o);
  return [
    // Harbor Lane Grand: improving
    spec("grand-1", "grand", "ops", g(9), {
      schedule: "grand-ops",
      status: "submitted",
      auditors: ["rohan"],
      bias: 3.3,
    }),
    spec("grand-2", "grand", "ops", g(6, 2), {
      schedule: "grand-ops",
      status: "submitted",
      auditors: ["rohan"],
      bias: 3.7,
    }),
    spec("grand-3", "grand", "ops", g(3, 1), {
      schedule: "grand-ops",
      status: "submitted",
      auditors: ["rohan"],
      bias: 4.1,
    }),
    spec("grand-kitchen", "grand", "kitchen", g(2, 6), {
      status: "submitted",
      auditors: ["rohan"],
      bias: 3.4,
    }),
    spec(
      "grand-now",
      "grand",
      "ops",
      { start: addDays(today, -2), date: addDays(today, -1), end: addDays(today, 5) },
      {
        schedule: "grand-ops",
        status: "in_progress",
        auditors: ["rohan"],
        bias: 3.9,
        answered: 0.55,
      },
    ),
    spec(
      "grand-next",
      "grand",
      "ops",
      { start: addDays(today, 85), end: addDays(today, 92) },
      { schedule: "grand-ops", status: "scheduled", auditors: [], bias: 0 },
    ),
    // Harbor Lane Express: steady, then a red flag, then recovery
    spec("express-1", "express", "ops", g(10), {
      schedule: "express-ops",
      status: "submitted",
      auditors: ["nandini"],
      bias: 3.8,
    }),
    spec("express-2", "express", "ops", g(7, 3), {
      schedule: "express-ops",
      status: "submitted",
      auditors: ["nandini"],
      bias: 3.9,
      redFlagItem: "SC-003",
    }),
    spec("express-3", "express", "ops", g(4, 1), {
      schedule: "express-ops",
      status: "submitted",
      auditors: ["nandini"],
      bias: 3.9,
    }),
    spec(
      "express-cancelled",
      "express",
      "ops",
      { start: addDays(addMonths(today, -2), 0), end: addDays(addMonths(today, -2), 7) },
      {
        status: "cancelled",
        cancelReason: "The hotel asked to move the visit because of a booked conference week.",
        auditors: ["nandini"],
        bias: 0,
      },
    ),
    spec(
      "express-next",
      "express",
      "ops",
      { start: addDays(today, 12), end: addDays(today, 19) },
      { schedule: "express-ops", status: "scheduled", auditors: ["nandini"], bias: 0 },
    ),
    // Pinewood Inn: slipping
    spec("pinewood-1", "pinewood", "ops", g(11), {
      schedule: "pinewood-ops",
      status: "submitted",
      auditors: ["nandini"],
      bias: 4.3,
    }),
    spec("pinewood-2", "pinewood", "ops", g(8, 2), {
      schedule: "pinewood-ops",
      status: "submitted",
      auditors: ["nandini"],
      bias: 4.0,
      restart: {
        reason: "The hotel supplied the missing licence copies after the visit.",
        daysAfter: 6,
        bias: 4.1,
      },
    }),
    spec("pinewood-3", "pinewood", "ops", g(5), {
      schedule: "pinewood-ops",
      status: "submitted",
      auditors: ["nandini"],
      bias: 3.6,
    }),
    spec(
      "pinewood-next",
      "pinewood",
      "ops",
      { start: addDays(today, 22), end: addDays(today, 29) },
      { schedule: "pinewood-ops", status: "scheduled", auditors: [], bias: 0 },
    ),
  ];
}

// ---------------------------------------------------------------- answers

const NOTE_START = [
  "Gap seen on the walk-through",
  "Not at the expected standard on the day",
  "Found incomplete at the time of the visit",
  "Repeat of an earlier finding",
];
const TEAM_REPLIES = [
  "Team said this is being worked on this week.",
  "Team said the supervisor was on leave.",
  "Team said it was reported earlier and is waiting for approval.",
  "Team did not have an answer on the day.",
];

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

type Answer = { score: number | null; isNa: boolean };

function answerFor(
  s: AuditSpec,
  revision: number,
  auditItemKey: string,
  yesNo: boolean,
  critical: boolean,
  bias: number,
  isNaItem: boolean,
): Answer {
  if (isNaItem) return { score: null, isNa: true };
  if (s.redFlagItem === auditItemKey && revision === 1) return { score: 0, isNa: false };
  // A restart keeps the first answers: the random draw does not depend on the revision.
  const r = rng(`${s.key}:${auditItemKey}`)();
  if (yesNo) {
    const pass = r < clamp(0.55 + bias * 0.09, 0, 0.97) || critical;
    return { score: pass ? 5 : 0, isNa: false };
  }
  let v = Math.round(bias + (r - 0.5) * 3);
  if (critical) v = Math.max(v, 3);
  return { score: clamp(v, 0, 5), isNa: false };
}

// ---------------------------------------------------------------- built rows

export type BuiltResult = {
  id: string;
  subSectionId: string;
  auditItemKey: string;
  row: {
    auditItemId: string;
    itemCode: string;
    label: string;
    sopCode: string | null;
    sopShortDescription: string | null;
    scoreScaleType: "zero_to_five" | "yes_no";
    weight: string;
    isCritical: boolean;
    score: string | null;
    isNa: boolean;
    observation: string | null;
    respondedByName: string | null;
    respondedByRole: string | null;
    teamResponse: string | null;
    reasonId: string | null;
    recommendation: string | null;
    sortOrder: number;
    copiedFromId: string | null;
  };
  evidence: {
    id: string;
    evidenceTypeId: string;
    checkedCount: number;
    exceptionCount: number;
    note: string;
  }[];
};

export type BuiltSubSection = {
  id: string;
  sectionKey: SectionKey;
  sectionId: string;
  name: string;
  weight: string;
  score: string | null;
  auditorComment: string | null;
  sortOrder: number;
  results: BuiltResult[];
};

export type BuiltRevision = {
  id: string;
  revisionNumber: number;
  /** Final status once everything is loaded. */
  status: "in_progress" | "submitted" | "archived";
  restartReason: string | null;
  submittedAt: Date | null;
  submittedBy: string | null;
  archivedAt: Date | null;
  propertyScore: string | null;
  hasRedFlag: boolean;
  auditorComment: string | null;
  createdAt: Date;
  subSections: BuiltSubSection[];
};

export type BuiltAudit = {
  spec: AuditSpec;
  id: string;
  reference: string;
  name: string;
  templateVersionId: string | null;
  scheduleId: string | null;
  createdAt: Date;
  revisions: BuiltRevision[];
  /** The revision the audit points to. */
  currentRevisionId: string | null;
  propertyScore: string | null;
  hasRedFlag: boolean;
  /** One assignment row per auditor. */
  assignments: {
    id: string;
    userId: string;
    createdAt: Date;
    endedAt: Date | null;
    endReason: "submitted" | "cancelled" | null;
  }[];
  /** A private notepad per assigned auditor, for audits in progress. */
  notes: { id: string; auditorId: string; body: string }[];
};

const managerOf = (hotel: HotelKey) => {
  const m = MEMBERSHIPS.find((x) => x.hotel === hotel && x.role === "hotel_manager");
  const u = USERS.find((x) => x.key === m?.user);
  if (!u) throw new Error(`No Hotel Manager for ${hotel}`);
  return u.fullName;
};

function buildRevision(
  s: AuditSpec,
  auditId: string,
  revisionNumber: number,
  bias: number,
  opts: {
    status: BuiltRevision["status"];
    createdAt: Date;
    submittedAt?: Date;
    archivedAt?: Date;
    restartReason?: string;
    auditorId: string | null;
  },
): BuiltRevision {
  const revId = sid(`revision:${s.key}:${revisionNumber}`);
  const layout = templateLayout(s.template);
  const hotel = HOTELS.find((h) => h.key === s.hotel);
  if (!hotel) throw new Error(`Unknown hotel ${s.hotel}`);
  const manager = managerOf(s.hotel);
  const inProgress = opts.status === "in_progress";
  const answered = s.answered ?? 1;

  const subSections: BuiltSubSection[] = layout.map(({ section, items }, si) => {
    // The id string keeps the old name (audit-section) so a migrated database keeps matching ids.
    const subSectionId = sid(`audit-section:${s.key}:${revisionNumber}:${section}`);
    const built: BuiltResult[] = items.map((def, ii) => {
      const isNaItem = HOTEL_NA[s.hotel].includes(def.key);
      const wantsAnswer = rng(`${s.key}:answered:${def.key}`)() < answered;
      const a: Answer =
        inProgress && !wantsAnswer && !isNaItem
          ? { score: null, isNa: false }
          : answerFor(s, revisionNumber, def.key, !!def.yesNo, !!def.critical, bias, isNaItem);
      const low = a.score !== null && a.score <= 2;
      const pick = (arr: string[]) =>
        arr[Math.floor(rng(`${s.key}:text:${def.key}`)() * arr.length)] ?? "";
      const reason = REASONS[Math.floor(rng(`${s.key}:reason:${def.key}`)() * REASONS.length)];
      const sopKey = SOP_FOR_ITEM[def.key];
      const sop = SOPS.find((x) => x.key === sopKey);
      const mid = a.score !== null && a.score <= 3;
      const itemRowKey = `${s.key}:${revisionNumber}:${def.key}`;
      const sampleChecked = def.sampleCheck && a.score !== null && !a.isNa;
      return {
        id: sid(`audit-item:${itemRowKey}`),
        subSectionId,
        auditItemKey: def.key,
        row: {
          auditItemId: auditItemId(def.key),
          itemCode: auditItemCode(def.key),
          label: def.label,
          sopCode: sop?.code ?? null,
          sopShortDescription: sop?.text ?? null,
          scoreScaleType: def.yesNo ? ("yes_no" as const) : ("zero_to_five" as const),
          weight: String(templateItemWeight(def)),
          isCritical: !!def.critical,
          score: a.score === null ? null : String(a.score),
          isNa: a.isNa,
          observation: low ? `${pick(NOTE_START)}: ${def.label.toLowerCase()}.` : null,
          respondedByName: low ? manager : null,
          respondedByRole: low ? "Hotel Manager" : null,
          teamResponse: low ? pick(TEAM_REPLIES) : null,
          reasonId: low && reason ? reason.id : null,
          recommendation: mid ? def.recommendation : null,
          sortOrder: ii + 1,
          copiedFromId:
            revisionNumber > 1 ? sid(`audit-item:${s.key}:${revisionNumber - 1}:${def.key}`) : null,
        },
        evidence: sampleChecked
          ? [
              {
                id: sid(`evidence:${itemRowKey}`),
                evidenceTypeId: evidenceTypeId("sample_check"),
                checkedCount: 10,
                exceptionCount: a.score !== null ? Math.min(10, 5 - a.score) : 0,
                note: "Checked ten records or rooms picked on the day.",
              },
            ]
          : [],
      };
    });
    const sc = { weight: sectionWeight(section), items: built.map(toScored) };
    const total = inProgress ? null : (scoreRevision([sc]).subSections[0] ?? null);
    return {
      id: subSectionId,
      sectionKey: section,
      sectionId: sectionId(section),
      name: sectionName(section),
      weight: String(sectionWeight(section)),
      score: total === null ? null : total.toFixed(2),
      auditorComment:
        !inProgress && total !== null && total < 70
          ? "Needs attention. See the items below and the recommendations."
          : null,
      sortOrder: si + 1,
      results: built,
    };
  });

  const scored = inProgress
    ? null
    : scoreRevision(
        subSections.map((sec): ScoredSubSection => ({
          weight: Number(sec.weight),
          items: sec.results.map(toScored),
        })),
      );
  return {
    id: revId,
    revisionNumber,
    status: opts.status,
    restartReason: opts.restartReason ?? null,
    submittedAt: opts.submittedAt ?? null,
    submittedBy: opts.status === "in_progress" ? null : opts.auditorId,
    archivedAt: opts.archivedAt ?? null,
    propertyScore: scored?.property == null ? null : scored.property.toFixed(2),
    hasRedFlag: scored?.hasRedFlag ?? false,
    auditorComment: inProgress
      ? null
      : scored?.hasRedFlag
        ? "A critical safety item failed. It is marked as a red flag and capped the score."
        : (scored?.property ?? 0) >= 75
          ? "A good visit. The team knows the standard and the gaps are small."
          : "Several gaps need follow-up. The main ones are in the section comments.",
    createdAt: opts.createdAt,
    subSections,
  };
}

function toScored(i: BuiltResult) {
  return {
    score: i.row.score === null ? null : Number(i.row.score),
    isNa: i.row.isNa,
    weight: Number(i.row.weight),
    critical: i.row.isCritical,
  };
}

export function buildAudits(today: Day): BuiltAudit[] {
  const specs = buildAuditSpecs(today);
  const order = [...specs].sort((a, b) => a.windowStart.localeCompare(b.windowStart));
  return order.map((s, n) => {
    const auditId = sid(`audit:${s.key}`);
    const year = s.windowStart.slice(0, 4);
    const tpl = TEMPLATES.find((t) => t.key === s.template);
    const createdAt = at(addDays(s.windowStart, -20), 10);
    const auditorId = s.auditors[0] ? userId(s.auditors[0]) : null;
    const submitted = s.status === "submitted";
    const started = s.status === "submitted" || s.status === "in_progress";
    const revisions: BuiltRevision[] = [];
    if (started && s.auditDate) {
      const submittedAt = at(s.auditDate, 17);
      if (submitted && s.restart) {
        revisions.push(
          buildRevision(s, auditId, 1, s.bias, {
            status: "archived",
            createdAt: at(s.auditDate, 8),
            submittedAt,
            archivedAt: at(addDays(s.auditDate, s.restart.daysAfter), 11),
            auditorId,
          }),
        );
        revisions.push(
          buildRevision(s, auditId, 2, s.restart.bias, {
            status: "submitted",
            createdAt: at(addDays(s.auditDate, s.restart.daysAfter), 11),
            submittedAt: at(addDays(s.auditDate, s.restart.daysAfter + 1), 16),
            restartReason: s.restart.reason,
            auditorId,
          }),
        );
      } else {
        revisions.push(
          buildRevision(s, auditId, 1, s.bias, {
            status: submitted ? "submitted" : "in_progress",
            createdAt: at(s.auditDate, 8),
            submittedAt: submitted ? submittedAt : undefined,
            auditorId,
          }),
        );
      }
    }
    const current = revisions[revisions.length - 1] ?? null;
    return {
      spec: s,
      id: auditId,
      reference: `SL-${year}-${String(n + 1).padStart(4, "0")}`,
      name: `${tpl?.name.replace(" (sample)", "") ?? "Audit"}, ${monthYear(s.auditDate ?? s.windowStart)}`,
      templateVersionId: started ? templateVersionId(s.template) : null,
      scheduleId: s.schedule ? sid(`schedule:${s.schedule}`) : null,
      createdAt,
      revisions,
      currentRevisionId: current?.id ?? null,
      propertyScore: submitted ? (current?.propertyScore ?? null) : null,
      hasRedFlag: submitted ? (current?.hasRedFlag ?? false) : false,
      assignments: s.auditors.map((u) => {
        const uid = userId(u);
        const ends = s.status === "submitted" || s.status === "cancelled";
        return {
          id: sid(`assignment:${s.key}:${u}`),
          userId: uid,
          createdAt: at(addDays(s.windowStart, -14), 12),
          endedAt: !ends
            ? null
            : s.status === "cancelled"
              ? at(addDays(s.windowStart, 2), 9)
              : (revisions[0]?.submittedAt ?? null),
          endReason: !ends
            ? null
            : s.status === "cancelled"
              ? ("cancelled" as const)
              : ("submitted" as const),
        };
      }),
      notes:
        s.status === "in_progress" && auditorId
          ? [
              {
                id: sid(`note:${s.key}:${auditorId}`),
                auditorId,
                body: "Lift 2 door sensor flickers. Ask about the gas log in the kitchen. Check room 312 again before leaving.",
              },
            ]
          : [],
    };
  });
}
