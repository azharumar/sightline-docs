// Checks the sample data without a database: the rows are consistent, the scores add up, and
// the shapes asked for in task E04-05 are there. The load itself is proven against a database
// (see docs/runbook.md, Load sample data).
import { describe, expect, it } from "vitest";
import { buildAuditSpecs, buildAudits, buildSchedules } from "./audits";
import { ISSUES, dueDate } from "./issues";
import { addDays, sid } from "./ids";
import { refuseProduction } from "./guard";
import {
  HOTEL_GROUPS,
  HOTELS,
  MEMBERSHIPS,
  SAMPLE_EMAIL_DOMAIN,
  USERS,
  emailOf,
  hotelId,
} from "./people";
import { SECTIONS, AUDIT_ITEMS, TEMPLATES, templateLayout } from "./reference";
import { scoreRevision } from "./scoring";

const TODAY = "2026-10-05";
const audits = buildAudits(TODAY);
const submitted = audits.filter((a) => a.spec.status === "submitted");

describe("ids", () => {
  it("are stable and well formed", () => {
    expect(sid("x")).toBe(sid("x"));
    expect(sid("x")).not.toBe(sid("y"));
    expect(sid("x")).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-8[0-9a-f]{3}-[0-9a-f]{12}$/);
  });
  it("build the same audits on every run", () => {
    expect(JSON.stringify(buildAudits(TODAY))).toBe(JSON.stringify(buildAudits(TODAY)));
  });
  it("are unique across audit results, sub-sections and revisions", () => {
    const ids = audits.flatMap((a) => [
      a.id,
      ...a.revisions.flatMap((r) => [
        r.id,
        ...r.subSections.flatMap((s) => [s.id, ...s.results.map((i) => i.id)]),
      ]),
    ]);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("people", () => {
  it("has 2 hotel groups and 3 hotels of different sizes", () => {
    expect(HOTEL_GROUPS).toHaveLength(2);
    expect(HOTELS).toHaveLength(3);
    const rooms = HOTELS.map((h) => h.rooms).sort((a, b) => a - b);
    expect(rooms[0]).toBeLessThanOrEqual(40);
    expect(rooms[1]).toBeGreaterThan(40);
    expect(rooms[1]).toBeLessThanOrEqual(100);
    expect(rooms[2]).toBeGreaterThan(100);
    expect(new Set(HOTELS.map((h) => h.hotelGroup)).size).toBe(2);
  });
  it("puts every hotel in a hotel group that exists", () => {
    const keys = new Set<string>(HOTEL_GROUPS.map((g) => g.key));
    for (const h of HOTELS) expect(keys.has(h.hotelGroup), h.name).toBe(true);
  });
  it("has one user per role, an auditor of each type, and an expired user", () => {
    const roles = new Set<string>();
    for (const u of USERS) {
      if (u.platformRole !== "none") roles.add(u.platformRole);
      const m = MEMBERSHIPS.find((x) => x.user === u.key);
      if (m) roles.add(m.role);
    }
    roles.add("group_head");
    expect([...roles].sort()).toEqual(
      ["admin", "auditor", "group_head", "hotel_manager", "staff"].sort(),
    );
    expect(USERS.filter((u) => u.auditorType === "employee")).toHaveLength(1);
    expect(USERS.filter((u) => u.auditorType === "freelancer")).toHaveLength(1);
    expect(USERS.some((u) => u.status === "expired" && (u.expiresInDays ?? 0) < 0)).toBe(true);
  });
  it("keeps the permanent Admin and never gives Admins or Auditors a membership", () => {
    const admin = USERS.find((u) => u.platformRole === "admin");
    expect(admin?.expiry).toBe("no_expiry");
    for (const m of MEMBERSHIPS) {
      expect(USERS.find((u) => u.key === m.user)?.platformRole).toBe("none");
    }
  });
  it("uses a made up email domain that cannot reach a real person", () => {
    expect(SAMPLE_EMAIL_DOMAIN).toBe("sightline-sample.test");
    for (const u of USERS)
      expect(emailOf(u, SAMPLE_EMAIL_DOMAIN)).toMatch(/@sightline-sample\.test$/);
    for (const u of USERS) expect(emailOf(u)).toBe(`${u.handle}@${SAMPLE_EMAIL_DOMAIN}`);
  });
});

describe("audit templates and items", () => {
  it("has one sample audit template per group, with unique item codes", () => {
    expect(TEMPLATES.length).toBeGreaterThanOrEqual(3);
    const codes = AUDIT_ITEMS.map((i) => i.key);
    expect(new Set(codes).size).toBe(codes.length);
    for (const t of TEMPLATES) {
      for (const { items } of templateLayout(t.key)) expect(items.length).toBeGreaterThan(0);
    }
    for (const d of SECTIONS) expect(AUDIT_ITEMS.some((i) => i.section === d.key)).toBe(true);
  });
  it("marks as critical only safety, hygiene or legal checks", () => {
    const critical = AUDIT_ITEMS.filter((i) => i.critical).map((i) => i.key);
    expect(critical).toEqual(
      expect.arrayContaining(["SC-001", "SC-002", "SC-003", "KT-001", "KT-002", "FO-002"]),
    );
    expect(critical).not.toContain("AE-001");
    expect(critical).not.toContain("SG-001");
  });
});

describe("audits", () => {
  it("has at least 3 submitted audits per hotel", () => {
    for (const h of HOTELS) {
      const n = submitted.filter((a) => a.spec.hotel === h.key).length;
      expect(n, h.name).toBeGreaterThanOrEqual(3);
    }
  });
  it("covers every audit status, a restart, and a schedule", () => {
    const statuses = new Set(audits.map((a) => a.spec.status));
    expect([...statuses].sort()).toEqual(["cancelled", "in_progress", "scheduled", "submitted"]);
    expect(audits.some((a) => a.revisions.length === 2)).toBe(true);
    expect(buildSchedules(TODAY).length).toBeGreaterThan(0);
    expect(audits.some((a) => a.spec.status === "scheduled" && a.assignments.length === 0)).toBe(
      true,
    );
  });
  it("has a red flag audit, capped at 50", () => {
    const flagged = submitted.filter((a) => a.hasRedFlag);
    expect(flagged.length).toBeGreaterThanOrEqual(1);
    for (const a of flagged) expect(Number(a.propertyScore)).toBeLessThanOrEqual(50);
  });
  it("saves scores that match the scoring rules", () => {
    for (const a of submitted) {
      for (const rev of a.revisions) {
        const r = scoreRevision(
          rev.subSections.map((s) => ({
            weight: Number(s.weight),
            items: s.results.map((i) => ({
              score: i.row.score === null ? null : Number(i.row.score),
              isNa: i.row.isNa,
              weight: Number(i.row.weight),
              critical: i.row.isCritical,
            })),
          })),
        );
        expect(Number(rev.propertyScore)).toBe(r.property);
        expect(rev.hasRedFlag).toBe(r.hasRedFlag);
      }
    }
  });
  it("has trends with shape: scores differ from audit to audit at each hotel", () => {
    for (const h of HOTELS) {
      const scores = submitted
        .filter((a) => a.spec.hotel === h.key && a.spec.template === "ops")
        .sort((a, b) => a.spec.windowStart.localeCompare(b.spec.windowStart))
        .map((a) => Number(a.propertyScore));
      expect(new Set(scores).size, h.name).toBe(scores.length);
    }
  });
  it("starts audit results as N/A where the hotel has no such facility", () => {
    const inn = audits.find((a) => a.spec.hotel === "pinewood" && a.spec.status === "submitted");
    const wellness = inn?.revisions[0]?.subSections.find((s) => s.sectionKey === "WR");
    expect(wellness?.results.every((i) => i.row.isNa)).toBe(true);
    expect(wellness?.score).toBeNull();
  });
  it("requires an observation for scores of 2 or below", () => {
    for (const a of audits)
      for (const r of a.revisions)
        for (const s of r.subSections)
          for (const i of s.results) {
            const score = i.row.score === null ? null : Number(i.row.score);
            if (score !== null && score <= 2)
              expect(i.row.observation, i.row.itemCode).toBeTruthy();
          }
  });
  it("freezes the item copy: code, label, weight and critical flag on every audit result", () => {
    for (const a of audits)
      for (const r of a.revisions)
        for (const s of r.subSections)
          for (const i of s.results) {
            expect(i.row.itemCode).toMatch(/^SMP-/);
            expect(i.row.label.length).toBeGreaterThan(0);
            expect(Number(i.row.weight)).toBeGreaterThan(0);
          }
  });
  it("points each restart audit result back to the audit result it was copied from", () => {
    const restarted = audits.find((a) => a.revisions.length === 2);
    const [r1, r2] = restarted?.revisions ?? [];
    const first = new Set(r1?.subSections.flatMap((s) => s.results.map((i) => i.id)));
    for (const s of r2?.subSections ?? [])
      for (const i of s.results) expect(first.has(i.row.copiedFromId ?? "")).toBe(true);
  });
});

describe("issues", () => {
  const today = TODAY;
  const team = (hotel: string) =>
    new Set(MEMBERSHIPS.filter((m) => m.hotel === hotel).map((m) => m.user));
  it("has every status, with some overdue", () => {
    expect(new Set(ISSUES.map((i) => i.status))).toEqual(new Set(["open", "in_progress", "done"]));
    const overdue = ISSUES.filter((i) => {
      const due = dueDate(i, today);
      return i.status !== "done" && due !== null && due < today;
    });
    expect(overdue.length).toBeGreaterThanOrEqual(2);
  });
  it("mixes priorities, due dates, assignees and unassigned issues", () => {
    expect(new Set(ISSUES.map((i) => i.priority))).toEqual(new Set(["high", "medium", "low"]));
    expect(ISSUES.some((i) => i.assignedTo === null)).toBe(true);
    expect(ISSUES.some((i) => dueDate(i, today) === null)).toBe(true);
    const roles = new Set(
      ISSUES.filter((i) => i.assignedTo).map(
        (i) => MEMBERSHIPS.find((m) => m.user === i.assignedTo)?.role,
      ),
    );
    expect(roles, "assigned to Hotel Managers and to Staff").toEqual(
      new Set(["hotel_manager", "staff"]),
    );
  });
  it("has some assigned to an expired user", () => {
    const expired = USERS.filter((u) => u.status === "expired").map((u) => u.key);
    expect(
      ISSUES.filter((i) => i.assignedTo && expired.includes(i.assignedTo)).length,
    ).toBeGreaterThanOrEqual(2);
  });
  it("is standalone: no audit link, no department, no Auditor", () => {
    const auditors = new Set(USERS.filter((u) => u.platformRole === "auditor").map((u) => u.key));
    for (const i of ISSUES) {
      expect(Object.keys(i), i.key).not.toEqual(
        expect.arrayContaining([expect.stringMatching(/link|audit|department|verified|reopen/i)]),
      );
      expect(auditors.has(i.raisedBy), `${i.key} raised by an Auditor`).toBe(false);
      for (const c of i.comments ?? []) expect(auditors.has(c.by), i.key).toBe(false);
      for (const s of i.steps ?? []) expect(auditors.has(s.by), i.key).toBe(false);
    }
  });
  it("is assigned to people of the issue's hotel team, and follows only forward status steps", () => {
    const order = ["open", "in_progress", "done"];
    for (const i of ISSUES) {
      if (i.assignedTo) expect(team(i.hotel).has(i.assignedTo), i.key).toBe(true);
      let at = 0;
      for (const s of i.steps ?? []) {
        expect(order.indexOf(s.to), i.key).toBeGreaterThan(at);
        at = order.indexOf(s.to);
        expect(s.daysAgo).toBeLessThan(i.raisedDaysAgo);
      }
      expect(at, `${i.key}: final status matches the last step`).toBe(order.indexOf(i.status));
    }
  });
  it("has comments and a status history on some issues", () => {
    expect(ISSUES.filter((i) => (i.comments ?? []).length > 0).length).toBeGreaterThanOrEqual(5);
    expect(ISSUES.filter((i) => (i.steps ?? []).length > 0).length).toBeGreaterThanOrEqual(5);
  });
  it("is about hotels that exist", () => {
    for (const i of ISSUES) expect(hotelId(i.hotel)).toBeTruthy();
  });
});

describe("copy", () => {
  it("has no em dash and none of the words the copy rules forbid", () => {
    const all = JSON.stringify({
      ISSUES,
      USERS,
      HOTELS,
      HOTEL_GROUPS,
      AUDIT_ITEMS,
      TEMPLATES,
      audits: buildAuditSpecs(TODAY),
    });
    expect(all).not.toMatch(/—/); // copy-lint-ignore
    expect(all).not.toMatch(/audit types?\b/i); // copy-lint-ignore
    expect(all).not.toMatch(/management response/i); // copy-lint-ignore
    expect(all).not.toMatch(/(^|[^a-z])fix(es)?([^a-z]|$)/i); // copy-lint-ignore
    expect(JSON.stringify(audits)).not.toMatch(/—/); // copy-lint-ignore
  });
});

describe("production guard", () => {
  const local = "postgresql://postgres:postgres@127.0.0.1:54322/postgres";
  const refused = (env: Record<string, string | undefined>) =>
    expect(() => refuseProduction(env)).toThrow(/Refusing to load sample data/);

  it("refuses the production hostname", () => {
    refused({ DATABASE_URL: local, SITE_URL: "https://app.sightline.zarnik.com" });
    refused({ DATABASE_URL: "postgres://x@app.sightline.zarnik.com:5432/postgres" });
  });
  it("refuses the internal production database name with no other variables", () => {
    refused({ DATABASE_URL: "postgres://x@db:5432/postgres" });
  });
  it("refuses mixed case production hostnames", () => {
    refused({ DATABASE_URL: local, SITE_URL: "https://APP.Sightline.Zarnik.com" });
    refused({ DATABASE_URL: "postgres://x@DB.Sightline.Zarnik.com/postgres" });
  });
  it("refuses a missing or unparseable DATABASE_URL", () => {
    refused({});
    refused({ DATABASE_URL: "not a url" });
  });
  it("accepts localhost and 127.0.0.1 and ::1", () => {
    expect(() =>
      refuseProduction({ DATABASE_URL: "postgres://x@localhost:5432/postgres" }),
    ).not.toThrow();
    expect(() => refuseProduction({ DATABASE_URL: local })).not.toThrow();
    expect(() =>
      refuseProduction({ DATABASE_URL: "postgres://x@[::1]:5432/postgres" }),
    ).not.toThrow();
    expect(() =>
      refuseProduction({ DATABASE_URL: local, SUPABASE_URL: "http://127.0.0.1:54321" }),
    ).not.toThrow();
  });
  it("accepts staging only with SEED_TARGET=staging and a staging host", () => {
    const db = "postgres://x@db:5432/postgres";
    const ok = {
      DATABASE_URL: db,
      SEED_TARGET: "staging",
      SITE_URL: "https://staging.sightline.zarnik.com",
    };
    expect(() => refuseProduction(ok)).not.toThrow();
    expect(() =>
      refuseProduction({
        DATABASE_URL: db,
        SEED_TARGET: "staging",
        SUPABASE_URL: "https://api-staging.sightline.zarnik.com",
      }),
    ).not.toThrow();
    refused({ ...ok, SEED_TARGET: undefined });
  });
  it("refuses SEED_TARGET=staging with a non-staging host", () => {
    const db = "postgres://x@db:5432/postgres";
    refused({ DATABASE_URL: db, SEED_TARGET: "staging" });
    refused({
      DATABASE_URL: db,
      SEED_TARGET: "staging",
      SITE_URL: "https://app.sightline.zarnik.com",
    });
    refused({
      DATABASE_URL: db,
      SEED_TARGET: "staging",
      SITE_URL: "https://evilstaging.sightline.zarnik.com",
    });
  });
  it("refuses http for SUPABASE_URL on a non-local host", () => {
    refused({
      DATABASE_URL: "postgres://x@db:5432/postgres",
      SEED_TARGET: "staging",
      SUPABASE_URL: "http://api-staging.sightline.zarnik.com",
    });
  });
});
