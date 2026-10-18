import { describe, expect, it } from "vitest";

import { tokens } from "@/design/tokens";
import {
  APP_URL,
  EMAIL_FROM_HEADER,
  emailPreviews,
  formatDate,
  formatDateTime,
  renderEmail,
  templates,
} from "./index";
import { emailSamples } from "./samples";

/** Every colour string anywhere in the design tokens. */
function tokenColours(value: unknown, out = new Set<string>()): Set<string> {
  if (typeof value === "string" && /^#[0-9a-f]{3,8}$/i.test(value)) out.add(value.toLowerCase());
  else if (value && typeof value === "object")
    Object.values(value).forEach((v) => tokenColours(v, out));
  return out;
}

const EM_DASH = String.fromCharCode(0x2014);
/** Words the copy rules ban in user-facing text. */
const FORBIDDEN_WORDS = /audit types?\b|management response|corrective action|\btasks?\b/i; // copy-lint-ignore

/** HTML with entities decoded, for text checks. */
const decode = (html: string) =>
  html
    .replace(/&amp;/g, "&")
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"');

const rendered = await Promise.all(
  emailPreviews.map(async (p) => ({ preview: p, email: await p.render() })),
);
const byId = Object.fromEntries(rendered.map((r) => [r.preview.id, r.email]));

describe("email list", () => {
  it("covers every trigger in blueprint p2-17", () => {
    expect([...new Set(emailPreviews.map((p) => p.trigger))]).toEqual([
      "Invite to join a hotel",
      "Issue assigned to you",
      "Comment added on your issue",
      "Status changed on an issue you assigned",
      "Issue due in 2 days",
      "Issue overdue",
      "Audit report ready",
      "Access expiring in 7 days",
      "Access expired",
    ]);
  });

  it("sends access emails to the person and whoever invited them", () => {
    const to = emailPreviews.filter((p) => p.trigger.startsWith("Access")).map((p) => p.to);
    expect(to).toEqual([
      "The person",
      "Whoever invited them",
      "The person",
      "Whoever invited them",
    ]);
  });

  it("has unique ids", () => {
    const ids = emailPreviews.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe.each(rendered.map((r) => [r.preview.id, r] as const))("%s", (_id, { preview, email }) => {
  it("has a sender, a plain subject and both versions", () => {
    expect(email.from).toBe(EMAIL_FROM_HEADER);
    expect(email.from).toBe("Zarnik Sightline <no-reply@zescloud.com>");
    expect(email.subject.length).toBeGreaterThan(5);
    expect(email.subject).not.toContain("!");
    expect(email.subject).not.toContain(EM_DASH);
    expect(email.html.startsWith("<!DOCTYPE html")).toBe(true);
    expect(email.text.length).toBeGreaterThan(50);
  });

  it("follows the copy rules", () => {
    for (const s of [email.subject, email.html, email.text]) {
      expect(s).not.toContain(EM_DASH);
      expect(s).not.toMatch(FORBIDDEN_WORDS);
    }
  });

  it("links only to the app, and the text version carries the same links", () => {
    const hrefs = [...email.html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]!);
    // Someone whose access has expired cannot sign in, so that email has no link.
    expect(hrefs.length > 0).toBe(preview.id !== "access-expired-person");
    for (const href of hrefs) {
      expect(href.startsWith(`${APP_URL}/`)).toBe(true);
      expect(email.text).toContain(href.replace(/&amp;/g, "&"));
    }
  });

  it("uses inline styles with token colours and pixel sizes only", () => {
    expect(email.html).not.toMatch(/<style|class="/);
    expect(email.html).not.toMatch(/var\(--|\d(rem|em);/);
    const allowed = tokenColours(tokens);
    const used = [...email.html.matchAll(/(?<!&)#[0-9a-f]{3,8}\b/gi)].map((m) =>
      m[0].toLowerCase(),
    );
    expect(used.length).toBeGreaterThan(0);
    for (const c of used) expect(allowed).toContain(c);
  });

  it("offers to turn off only due and overdue reminders", () => {
    expect(email.text.includes("Email reminders")).toBe(preview.canTurnOff);
    expect(email.html.includes("Email reminders")).toBe(preview.canTurnOff);
  });
});

describe("content", () => {
  it("audit report ready shows hotel, date, scores, critical items and a link", () => {
    const p = emailSamples.auditReportReady;
    const e = byId["audit-report-ready"]!;
    for (const s of [decode(e.html), e.text]) {
      expect(s).toContain(p.hotelName);
      expect(s).toContain(formatDate(p.auditDate));
      expect(s).toContain(`${p.propertyScore} out of 100`);
      expect(s).toContain(p.departments[0]!.name);
      expect(s).toContain(`/audits/${p.auditId}/report`);
    }
    expect(p.criticalItems.length).toBeGreaterThan(0);
    expect(e.text).toContain(p.criticalItems[0]!.label);
    expect(e.text).toContain("Red flag");
  });

  it("issue assigned shows department, Observation, Recommendation, due date and a link", () => {
    const p = emailSamples.issueAssigned;
    const e = byId["issue-assigned"]!;
    expect(e.subject).toBe(`Issue assigned to you: ${p.itemLabel}`);
    for (const s of [decode(e.html), e.text]) {
      expect(s).toContain(p.departmentName);
      expect(s).toContain("Observation");
      expect(s).toContain("Recommendation");
      expect(s).toContain(formatDate(p.dueDate));
      expect(s).toContain(`/issues/${p.issueId}`);
    }
  });

  it("issue comment shows the commenter, the comment and a link to the comments", () => {
    const p = emailSamples.issueComment;
    const e = byId["issue-comment"]!;
    expect(e.text).toContain(p.commenterName);
    expect(e.text).toContain(`> ${p.comment}`);
    expect(decode(e.html)).toContain(p.commenterName);
    expect(e.html).toContain(`/issues/${p.issueId}#comments`);
  });

  it("status change names both statuses", () => {
    expect(byId["issue-status-changed"]!.text).toMatch(/Status: (Open|In progress) to Resolved/);
  });

  it("overdue reminder says how many days late", () => {
    expect(byId["issue-overdue"]!.text).toMatch(/\d+ days? ago/);
  });

  it("access emails tell the inviter how to renew", () => {
    expect(byId["access-expired-inviter"]!.text).toContain("Renew access: ");
    expect(byId["access-expired-person"]!.text).not.toContain("Renew access");
  });

  it("renders any props, not only the samples", async () => {
    const e = await renderEmail(templates.issueComment, {
      ...emailSamples.issueComment,
      commenterName: "Test Person",
      comment: "Line one\nLine two",
      fileCount: 2,
    });
    expect(e.text).toContain("> Line one\n> Line two");
    expect(e.text).toContain("Files: 2 files");
  });
});

describe("dates", () => {
  it("formats calendar dates and India time the same in every runtime", () => {
    expect(formatDate("2026-07-14")).toBe("14 Jul 2026");
    expect(formatDate("2026-09-15T18:29:59.000Z")).toBe("15 Sep 2026");
    expect(formatDateTime("2026-01-23T07:00:00.000Z")).toBe("23 Jan 2026, 12:30 IST");
  });
});
