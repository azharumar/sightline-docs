// Loads the sample data into a database. Usage: pnpm db:seed
//
// Needs DATABASE_URL (a database that already has the migrations, see pnpm db:migrate).
// Optional, to also create the Supabase Auth accounts for the sample users:
//   SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY.
// Optional: SEED_EMAIL_DOMAIN (default sightline-sample.test), SEED_TODAY (YYYY-MM-DD).
//
// Safe to run again: every row has a fixed id and is skipped when it exists, and an audit or
// issue that exists is not touched. Runs in one transaction, so a failure leaves nothing behind.
// Refuses to run unless the database is local, or staging with SEED_TARGET=staging.
import { refuseProduction } from "./guard";
import { eq, sql } from "drizzle-orm";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import type { PgTable } from "drizzle-orm/pg-core";
import { Pool } from "pg";
import * as t from "../../src/db/schema";
import { ensureAuthUsers } from "./auth";
import { buildAudits, buildSchedules, type BuiltAudit } from "./audits";
import { addDays, at, day, sid, type Day } from "./ids";
import { ISSUES, commentId, dueDate, issueId, when } from "./issues";
import {
  HOTEL_GROUPS,
  HOTEL_GROUP_MEMBERSHIPS,
  HOTELS,
  MEMBERSHIPS,
  SAMPLE_EMAIL_DOMAIN,
  USERS,
  accessEndsOn,
  hotelGroupId,
  hotelGroupOfHotel,
  emailOf,
  hotelId,
  userId,
} from "./people";
import {
  SECTIONS,
  EVIDENCE_TYPES,
  AUDIT_ITEMS,
  REASONS,
  SCALES,
  SOPS,
  SOP_FOR_ITEM,
  TAGS,
  TEMPLATES,
  evidenceTypeId,
  auditItemCode,
  auditItemId,
  sectionId,
  subSectionId,
  sopId,
  templateId,
  templateItemWeight,
  templateLayout,
  templateVersionId,
  sectionName,
  sectionWeight,
} from "./reference";

type Db = NodePgDatabase;

const std = (createdAt: Date, by: string | null) => ({
  createdAt,
  createdBy: by,
  updatedAt: createdAt,
  updatedBy: by,
});

async function insertAll<T extends PgTable>(db: Db, table: T, rows: T["$inferInsert"][]) {
  for (let i = 0; i < rows.length; i += 100) {
    await db
      .insert(table)
      .values(rows.slice(i, i + 100))
      .onConflictDoNothing();
  }
}

async function has(db: Db, table: string, id: string): Promise<boolean> {
  const r = await db.execute(sql`select 1 from ${sql.identifier(table)} where id = ${id}`);
  return r.rows.length > 0;
}

async function count(db: Db, table: string): Promise<number> {
  const r = await db.execute(sql`select count(*)::int as n from ${sql.identifier(table)}`);
  return Number((r.rows[0] as { n: number }).n);
}

const TABLES = [
  "users",
  "hotel_groups",
  "hotels",
  "audit_items",
  "audit_templates",
  "audit_schedules",
  "audits",
  "audit_revisions",
  "audit_results",
  "audit_auditors",
  "issues",
  "issue_comments",
];

/** Masters are looked up by name when they already exist, so ids must match what we expect. */
async function assertIds(db: Db, table: string, ids: string[], what: string) {
  const r = await db.execute(
    sql`select id from ${sql.identifier(table)} where id in (${sql.join(
      ids.map((i) => sql`${i}`),
      sql`, `,
    )})`,
  );
  if (r.rows.length !== ids.length) {
    throw new Error(
      `${what}: some rows already exist with other ids, so the sample data cannot link to them. ` +
        `Load the sample data into an empty database, or remove those rows first.`,
    );
  }
}

export async function loadSampleData(db: Db, today: Day, domain: string) {
  const admin = userId("admin");
  const longAgo = at(addDays(today, -420), 9);

  // ---------------------------------------------------------------- people
  await insertAll(
    db,
    t.users,
    USERS.map((u) => {
      const ends = accessEndsOn(u, today);
      return {
        id: userId(u.key),
        ...std(at(addDays(today, -u.createdDaysAgo), 9), u.key === "admin" ? null : admin),
        fullName: u.fullName,
        email: emailOf(u, domain),
        platformRole: u.platformRole,
        auditorType: u.auditorType ?? null,
        baseCity: u.baseCity ?? null,
        status: u.status,
        accessExpiry: u.expiry,
        accessExpiresAt: ends === null ? null : at(ends, 18, 29),
        lastSignInAt:
          u.status === "expired" ? at(addDays(today, -30), 9) : at(addDays(today, -1), 9),
      };
    }),
  );
  await insertAll(
    db,
    t.hotelGroups,
    HOTEL_GROUPS.map((c) => ({
      id: hotelGroupId(c.key),
      ...std(longAgo, admin),
      name: c.name,
      code: c.code,
    })),
  );
  await insertAll(
    db,
    t.hotels,
    HOTELS.map((h) => ({
      id: hotelId(h.key),
      ...std(longAgo, admin),
      hotelGroupId: hotelGroupId(h.hotelGroup),
      name: h.name,
      code: h.code,
      city: h.city,
      state: h.state,
      rooms: h.rooms,
      propertyType: h.propertyType,
      siteContactName: h.contactName,
      siteContactPhone: h.contactPhone,
    })),
  );
  await insertAll(
    db,
    t.hotelGroupMemberships,
    HOTEL_GROUP_MEMBERSHIPS.map((m) => ({
      id: sid(`client-membership:${m.user}`),
      ...std(longAgo, admin),
      userId: userId(m.user),
      hotelGroupId: hotelGroupId(m.hotelGroup),
    })),
  );
  await insertAll(
    db,
    t.memberships,
    MEMBERSHIPS.map((m) => ({
      id: sid(`membership:${m.user}`),
      ...std(longAgo, admin),
      userId: userId(m.user),
      hotelId: hotelId(m.hotel),
      hotelGroupId: hotelGroupId(hotelGroupOfHotel(m.hotel)),
      role: m.role,
    })),
  );

  // ---------------------------------------------------------------- masters
  const masterStd = std(longAgo, admin);
  await insertAll(
    db,
    t.sections,
    SECTIONS.map((d, i) => ({
      id: sectionId(d.key),
      ...masterStd,
      name: d.name,
      sortOrder: i + 1,
    })),
  );
  await insertAll(
    db,
    t.subSections,
    SECTIONS.map((d) => ({
      id: subSectionId(d.key),
      ...masterStd,
      sectionId: sectionId(d.key),
      name: "Core checks",
      sortOrder: 1,
    })),
  );
  await insertAll(db, t.scoreScales, [
    {
      id: SCALES.zero_to_five.id,
      ...masterStd,
      name: SCALES.zero_to_five.name,
      type: "zero_to_five",
    },
    { id: SCALES.yes_no.id, ...masterStd, name: SCALES.yes_no.name, type: "yes_no" },
  ]);
  await insertAll(
    db,
    t.evidenceTypes,
    EVIDENCE_TYPES.map((e) => ({ id: e.id, ...masterStd, name: e.name })),
  );
  await insertAll(
    db,
    t.reasons,
    REASONS.map((r) => ({ id: r.id, ...masterStd, label: r.label, sortOrder: r.sortOrder })),
  );
  await insertAll(
    db,
    t.tags,
    TAGS.map((g) => ({ id: g.id, ...masterStd, name: g.name })),
  );
  await insertAll(
    db,
    t.sops,
    SOPS.map((s) => ({
      id: sopId(s.key),
      ...masterStd,
      sectionId: sectionId(s.key),
      code: s.code,
      title: s.title,
      shortDescription: s.text,
    })),
  );
  await insertAll(
    db,
    t.auditItems,
    AUDIT_ITEMS.map((i) => {
      const sop = SOP_FOR_ITEM[i.key];
      return {
        id: auditItemId(i.key),
        ...masterStd,
        code: auditItemCode(i.key),
        label: i.label,
        sectionId: sectionId(i.section),
        subSectionId: subSectionId(i.section),
        sopId: sop ? sopId(sop) : null,
        scoreScaleId: i.yesNo ? SCALES.yes_no.id : SCALES.zero_to_five.id,
        isCritical: !!i.critical,
        defaultRecommendation: i.recommendation,
        status: "active" as const,
      };
    }),
  );
  await insertAll(
    db,
    t.auditItemEvidenceTypes,
    AUDIT_ITEMS.flatMap((i) => {
      const types: ("photo" | "document" | "sample_check")[] = ["photo"];
      if (i.sampleCheck) types.push("sample_check");
      if (i.section === "FA" || i.key === "SC-005") types.push("document");
      return types.map((n) => ({
        id: sid(`item-evidence:${i.key}:${n}`),
        ...masterStd,
        auditItemId: auditItemId(i.key),
        evidenceTypeId: evidenceTypeId(n),
      }));
    }),
  );
  await insertAll(
    db,
    t.auditItemTags,
    AUDIT_ITEMS.filter((i) => i.critical).map((i) => ({
      id: sid(`item-tag:${i.key}:critical`),
      ...masterStd,
      auditItemId: auditItemId(i.key),
      tagId: TAGS[0]!.id,
    })),
  );
  await assertIds(
    db,
    "sections",
    SECTIONS.map((d) => sectionId(d.key)),
    "Sections",
  );
  await assertIds(
    db,
    "evidence_types",
    EVIDENCE_TYPES.map((e) => e.id),
    "Evidence types",
  );
  await assertIds(
    db,
    "reasons",
    REASONS.map((r) => r.id),
    "Reasons",
  );
  await assertIds(
    db,
    "audit_items",
    AUDIT_ITEMS.map((i) => auditItemId(i.key)),
    "Audit items",
  );

  // ---------------------------------------------------------------- audit templates
  for (const tpl of TEMPLATES) {
    if (await has(db, "audit_templates", templateId(tpl.key))) continue;
    const published = at(addDays(today, -400), 9);
    await db.insert(t.auditTemplates).values({
      id: templateId(tpl.key),
      ...std(longAgo, admin),
      name: tpl.name,
      description: tpl.description,
    });
    await db.insert(t.templateVersions).values({
      id: templateVersionId(tpl.key),
      ...std(longAgo, admin),
      auditTemplateId: templateId(tpl.key),
      versionNumber: 1,
      // Published after its sub-sections and items are in: a published version is frozen (E04-11).
      status: "draft",
      publishedAt: published,
      publishedBy: admin,
    });
    await db
      .update(t.auditTemplates)
      .set({ currentVersionId: templateVersionId(tpl.key) })
      .where(eq(t.auditTemplates.id, templateId(tpl.key)));
    const layout = templateLayout(tpl.key);
    await insertAll(
      db,
      t.templateSubSections,
      layout.map(({ section }, i) => ({
        // The id string keeps the old name (template-section) so a migrated database keeps matching ids.
        id: sid(`template-section:${tpl.key}:${section}`),
        ...std(longAgo, admin),
        templateVersionId: templateVersionId(tpl.key),
        sectionId: sectionId(section),
        name: sectionName(section),
        weight: String(sectionWeight(section)),
        sortOrder: i + 1,
      })),
    );
    await insertAll(
      db,
      t.templateItems,
      layout.flatMap(({ section, items }) =>
        items.map((it, i) => ({
          id: sid(`template-item:${tpl.key}:${it.key}`),
          ...std(longAgo, admin),
          templateSubSectionId: sid(`template-section:${tpl.key}:${section}`),
          auditItemId: auditItemId(it.key),
          weight: String(templateItemWeight(it)),
          isCritical: !!it.critical,
          sortOrder: i + 1,
        })),
      ),
    );
    await db
      .update(t.templateVersions)
      .set({ status: "published" })
      .where(eq(t.templateVersions.id, templateVersionId(tpl.key)));
    await insertAll(
      db,
      t.auditTemplateVisibility,
      tpl.visibility.map((role) => ({
        id: sid(`template-visibility:${tpl.key}:${role}`),
        ...std(longAgo, admin),
        auditTemplateId: templateId(tpl.key),
        role,
      })),
    );
  }

  // ---------------------------------------------------------------- schedules and audits
  await insertAll(
    db,
    t.auditSchedules,
    buildSchedules(today).map((s) => ({
      id: sid(`schedule:${s.key}`),
      ...std(longAgo, admin),
      hotelGroupId: hotelGroupId(hotelGroupOfHotel(s.hotel)),
      hotelId: hotelId(s.hotel),
      auditTemplateId: templateId(s.template),
      everyMonths: s.everyMonths,
      nextDueDate: s.nextDueDate,
      status: s.status,
    })),
  );

  const audits = buildAudits(today);
  for (const a of audits) {
    if (await has(db, "audits", a.id)) continue;
    await loadAudit(db, a);
  }

  // ---------------------------------------------------------------- issues
  for (const i of ISSUES) {
    const id = issueId(i.key);
    if (await has(db, "issues", id)) continue;
    const raised = when(today, i.raisedDaysAgo);
    const base = {
      hotelGroupId: hotelGroupId(hotelGroupOfHotel(i.hotel)),
      hotelId: hotelId(i.hotel),
    };
    await db.insert(t.issues).values({
      id,
      ...std(raised, userId(i.raisedBy)),
      ...base,
      title: i.title,
      description: i.description,
      priority: i.priority,
      status: "open",
      assignedTo: i.assignedTo ? userId(i.assignedTo) : null,
      dueDate: dueDate(i, today),
    });
    // Status history is written by a trigger. Each step is recorded, then given its real date.
    const history: { from: string | null; to: string; by: string; at: Date }[] = [
      { from: null, to: "open", by: userId(i.raisedBy), at: raised },
    ];
    let current: string = "open";
    for (const step of i.steps ?? []) {
      const stepAt = when(today, step.daysAgo, 12);
      const doneHere = step.to === "done";
      await db
        .update(t.issues)
        .set({
          status: step.to,
          doneAt: doneHere ? stepAt : null,
          doneBy: doneHere ? userId(step.by) : null,
          updatedBy: userId(step.by),
        })
        .where(eq(t.issues.id, id));
      history.push({ from: current, to: step.to, by: userId(step.by), at: stepAt });
      current = step.to;
    }
    await redateHistory(db, id, history);
    await insertAll(
      db,
      t.issueComments,
      (i.comments ?? []).map((c, n) => ({
        id: commentId(i.key, n + 1),
        ...std(when(today, c.daysAgo, 15), userId(c.by)),
        ...base,
        issueId: id,
        body: c.body,
      })),
    );
  }
}

/**
 * The status history is written by a trigger, with the load time and no person. The change
 * guard keeps created_at and created_by fixed, so to give each step its real date and person
 * the guards are switched off for this one statement (needs a role that may set
 * session_replication_role, such as the database owner). If that is not allowed, the history
 * keeps the load time and no person, and the load goes on.
 */
async function redateHistory(
  db: Db,
  issue: string,
  history: { from: string | null; to: string; by: string; at: Date }[],
) {
  await db.execute(sql`savepoint redate`);
  try {
    await db.execute(sql`set local session_replication_role = replica`);
    for (const h of history) {
      await db.execute(sql`
        update public.issue_status_history
        set created_at = ${h.at.toISOString()}, created_by = ${h.by}
        where issue_id = ${issue} and to_status = ${h.to} and from_status is not distinct from ${h.from}
      `);
    }
    await db.execute(sql`set local session_replication_role = origin`);
    await db.execute(sql`release savepoint redate`);
  } catch (e) {
    await db.execute(sql`rollback to savepoint redate`);
    await db.execute(sql`release savepoint redate`);
    if (!warnedRedate) {
      warnedRedate = true;
      console.warn(
        `Issue status history keeps the load time and no person: ${e instanceof Error ? e.message : String(e)}`,
      );
    }
  }
}
let warnedRedate = false;

/** One audit with its revisions, assignments and notepad. Audits that exist are never reloaded. */
async function loadAudit(db: Db, a: BuiltAudit) {
  const s = a.spec;
  const hotelGroupIdV = hotelGroupId(hotelGroupOfHotel(s.hotel));
  const hotelIdV = hotelId(s.hotel);
  const scope = { hotelGroupId: hotelGroupIdV, hotelId: hotelIdV };
  const admin = userId("admin");
  const started = a.revisions.length > 0;
  const first = a.assignments[0];

  await db.insert(t.audits).values({
    id: a.id,
    ...std(a.createdAt, admin),
    ...scope,
    reference: a.reference,
    auditTemplateId: templateId(s.template),
    templateVersionId: a.templateVersionId,
    auditScheduleId: a.scheduleId,
    name: a.name,
    windowStart: s.windowStart,
    windowEnd: s.windowEnd,
    auditDate: s.auditDate ?? null,
    // A submitted audit is created in progress and submitted below, after its revision.
    status: started ? "in_progress" : "scheduled",
  });
  await insertAll(
    db,
    t.auditAuditors,
    a.assignments.map((x) => ({
      id: x.id,
      ...std(x.createdAt, admin),
      ...scope,
      auditId: a.id,
      userId: x.userId,
    })),
  );

  for (const rev of a.revisions) {
    const actor = rev.submittedBy ?? first?.userId ?? admin;
    // The restart (revision 2) is Admin's, with a reason.
    const by = rev.revisionNumber > 1 ? admin : actor;
    await db.insert(t.auditRevisions).values({
      id: rev.id,
      ...std(rev.createdAt, by),
      ...scope,
      auditId: a.id,
      revisionNumber: rev.revisionNumber,
      restartReason: rev.restartReason,
    });
    await insertAll(
      db,
      t.auditSubSections,
      rev.subSections.map((sec) => ({
        id: sec.id,
        ...std(rev.createdAt, by),
        ...scope,
        auditRevisionId: rev.id,
        auditId: a.id,
        sectionId: sec.sectionId,
        name: sec.name,
        weight: sec.weight,
        score: sec.score,
        auditorComment: sec.auditorComment,
        sortOrder: sec.sortOrder,
      })),
    );
    const results = rev.subSections.flatMap((sec) => sec.results);
    await insertAll(
      db,
      t.auditResults,
      results.map((it) => ({
        id: it.id,
        ...std(rev.createdAt, by),
        ...scope,
        auditRevisionId: rev.id,
        auditId: a.id,
        auditSubSectionId: it.subSectionId,
        ...it.row,
      })),
    );
    await insertAll(
      db,
      t.evidence,
      results.flatMap((it) =>
        it.evidence.map((e) => ({
          id: e.id,
          ...std(rev.createdAt, by),
          ...scope,
          auditResultId: it.id,
          evidenceTypeId: e.evidenceTypeId,
          checkedCount: e.checkedCount,
          exceptionCount: e.exceptionCount,
          note: e.note,
          capturedAt: rev.createdAt,
        })),
      ),
    );
    if (rev.status !== "in_progress") {
      // Submit the revision: the scores are saved once, at submit.
      await db
        .update(t.auditRevisions)
        .set({
          status: "submitted",
          submittedAt: rev.submittedAt,
          submittedBy: rev.submittedBy,
          propertyScore: rev.propertyScore,
          hasRedFlag: rev.hasRedFlag,
          auditorComment: rev.auditorComment,
        })
        .where(eq(t.auditRevisions.id, rev.id));
      if (rev.revisionNumber === 1 || rev.status === "submitted") {
        // Point the audit at this revision; the first one also submits the audit.
        await db
          .update(t.audits)
          .set({
            currentRevisionId: rev.id,
            revisionCount: rev.revisionNumber,
            propertyScore: rev.propertyScore,
            hasRedFlag: rev.hasRedFlag,
            ...(rev.revisionNumber === 1 ? { status: "submitted" as const } : {}),
          })
          .where(eq(t.audits.id, a.id));
      }
      if (rev.status === "archived") {
        await db
          .update(t.auditRevisions)
          .set({ status: "archived", archivedAt: rev.archivedAt })
          .where(eq(t.auditRevisions.id, rev.id));
      }
    } else {
      await db
        .update(t.audits)
        .set({ currentRevisionId: rev.id, revisionCount: rev.revisionNumber })
        .where(eq(t.audits.id, a.id));
    }
  }

  if (s.status === "cancelled") {
    await db
      .update(t.audits)
      .set({ status: "cancelled", cancelReason: s.cancelReason ?? "Cancelled" })
      .where(eq(t.audits.id, a.id));
  }
  // Submitting or cancelling ended the assignments, now. Give them their real end dates.
  for (const x of a.assignments) {
    if (x.endedAt) {
      await db
        .update(t.auditAuditors)
        .set({ endedAt: x.endedAt })
        .where(eq(t.auditAuditors.id, x.id));
    }
  }
  if (a.revisions.length > 1) {
    // The restart gave the audit a second assignment, ended when revision 2 was submitted.
    const last = a.revisions[a.revisions.length - 1]!;
    const who = first?.userId;
    if (who && last.submittedAt) {
      await db.insert(t.auditAuditors).values({
        id: sid(`assignment:${s.key}:${s.auditors[0]}:restart`),
        ...std(last.createdAt, admin),
        ...scope,
        auditId: a.id,
        userId: who,
        status: "ended",
        endedAt: last.submittedAt,
        endReason: "submitted",
      });
    }
  }
  for (const n of a.notes) {
    await db.insert(t.auditNotes).values({
      id: n.id,
      ...std(at(s.auditDate ?? s.windowStart, 11), n.auditorId),
      ...scope,
      auditId: a.id,
      auditorId: n.auditorId,
      body: n.body,
    });
  }
}

// ---------------------------------------------------------------- command line

async function main() {
  refuseProduction(process.env);
  const dbUrl = process.env.DATABASE_URL!;
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const today = process.env.SEED_TODAY ?? day(new Date());
  if (!/^\d{4}-\d{2}-\d{2}$/.test(today)) throw new Error("SEED_TODAY must look like 2026-10-05");
  const domain = process.env.SEED_EMAIL_DOMAIN ?? SAMPLE_EMAIL_DOMAIN;

  if (supabaseUrl && serviceKey) {
    const r = await ensureAuthUsers({ url: supabaseUrl, serviceKey, domain });
    console.log(
      `Auth users: ${r.created.length} created, ${r.exists.length} already there, ${r.conflict.length} email in use by another auth user.`,
    );
    if (r.conflict.length > 0) {
      throw new Error(
        `These emails already belong to other auth users, so they cannot be linked: ${r.conflict.join(", ")}. ` +
          `Remove those auth users or set a different SEED_EMAIL_DOMAIN, then run again.`,
      );
    }
  } else {
    console.warn(
      "SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set: no Auth accounts were created. " +
        "The sample users exist in the database but cannot sign in until their Auth accounts exist.",
    );
  }

  const pool = new Pool({ connectionString: dbUrl, max: 1 });
  const db = drizzle(pool);
  try {
    const before: Record<string, number> = {};
    for (const tb of TABLES) before[tb] = await count(db, tb);
    await db.execute(sql`begin`);
    try {
      // Needed by the guards on submitted audits; written to the change log.
      await db.execute(sql`select set_config('app.change_reason', 'Sample data load', true)`);
      await loadSampleData(db, today, domain);
      await db.execute(sql`commit`);
    } catch (e) {
      await db.execute(sql`rollback`);
      throw e;
    }
    for (const tb of TABLES) {
      const after = await count(db, tb);
      console.log(`${tb.padEnd(18)} ${String(after).padStart(5)}  (+${after - before[tb]!})`);
    }
    console.log("Sample data is loaded.");
  } finally {
    await pool.end();
  }
}

if (process.argv[1] && /run\.[tj]s$/.test(process.argv[1])) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error));
    const cause = error instanceof Error ? (error as { cause?: unknown }).cause : undefined;
    if (cause instanceof Error) console.error(`caused by: ${cause.message}`);
    process.exit(1);
  });
}
