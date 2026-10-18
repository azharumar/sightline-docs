// Email props built from the shared sample data, for the preview page and tests.
import {
  sampleData,
  SAMPLE_TODAY,
  inCurrentRevision,
  isOverdue,
  raisesRedFlag,
  scoreBand,
  type Audit,
  type Issue,
  type IssueStatus,
  type Hotel,
  type MembershipRole,
  type User,
} from "@/sample";
import type { AccessEmailProps } from "./templates/access";
import type { AuditReportReadyProps } from "./templates/audit-report-ready";
import type { IssueAssignedProps } from "./templates/issue-assigned";
import type { IssueCommentProps } from "./templates/issue-comment";
import type { IssueReminderProps } from "./templates/issue-reminder";
import type { IssueStatusChangedProps } from "./templates/issue-status-changed";
import type { InviteProps } from "./templates/invite";
import type { Status } from "@/design/tokens";

const d = sampleData;

const must = <T>(value: T | undefined, what: string): T => {
  if (value === undefined) throw new Error(`Sample data has no ${what}`);
  return value;
};

const user = (id: string | null): User =>
  must(
    d.users.find((u) => u.id === id),
    `user ${id}`,
  );
const hotel = (id: string): Hotel =>
  must(
    d.hotels.find((h) => h.id === id),
    `hotel ${id}`,
  );
const department = (id: string) =>
  must(
    d.departments.find((x) => x.id === id),
    `department ${id}`,
  ).name;
const auditResult = (id: string) =>
  must(
    d.auditResults.find((x) => x.id === id),
    `audit item ${id}`,
  );
const audit = (id: string): Audit =>
  must(
    d.audits.find((a) => a.id === id),
    `audit ${id}`,
  );

const roleLabels: Record<MembershipRole, string> = {
  hotel_manager: "Hotel Manager",
  department_head: "Department Head",
  staff: "Staff",
};

function membershipOf(u: User) {
  return must(
    d.memberships.find((m) => m.user_id === u.id),
    `membership for ${u.full_name}`,
  );
}

function managerOf(hotelId: string): User {
  const m = must(
    d.memberships.find((x) => x.hotel_id === hotelId && x.role === "hotel_manager"),
    `hotel manager for ${hotelId}`,
  );
  return user(m.user_id);
}

function addDays(date: string, days: number): string {
  const t = new Date(`${date}T00:00:00.000Z`);
  t.setUTCDate(t.getUTCDate() + days);
  return t.toISOString().slice(0, 10);
}

const statusKey: Record<IssueStatus, Status> = {
  open: "open",
  in_progress: "inProgress",
  resolved: "resolved",
};

const priorityLabel: Record<Issue["priority"], string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

/** Fields every issue email shows. */
function issueFields(issue: Issue) {
  const item = issue.audit_result_id ? auditResult(issue.audit_result_id) : null;
  return {
    issueId: issue.id,
    hotelName: hotel(issue.hotel_id).name,
    departmentName: department(issue.department_id),
    itemLabel: item?.label ?? issue.title,
    observation: item?.observation ?? issue.description,
    recommendation: item?.recommendation ?? "",
    priority: priorityLabel[issue.priority],
    dueDate: issue.due_date,
    auditName: issue.audit_id ? audit(issue.audit_id).name : "Raised from the Issues list",
  };
}

const assignedIssues = d.issues.filter((f) => f.assigned_to !== null);

// ---------- audit report ready ----------

// Prefer a recent audit with a red flag and failed critical items, so the email shows them.
const criticalFails = (a: Audit) =>
  d.auditResults.filter(
    (i) =>
      i.audit_id === a.id &&
      inCurrentRevision(i, a) &&
      i.is_critical &&
      !i.is_na &&
      i.score !== null &&
      i.score < 3,
  ).length;
const submitted = d.audits
  .filter((a) => a.status === "submitted")
  .sort((a, b) => b.audit_date.localeCompare(a.audit_date));
const reportAudit = must(
  submitted.find((a) => a.has_red_flag) ??
    [...submitted].sort((a, b) => criticalFails(b) - criticalFails(a))[0],
  "submitted audit",
);
const mainHotel = hotel(reportAudit.hotel_id);
const previousAudit = submitted.find(
  (a) => a.hotel_id === mainHotel.id && a.audit_date < reportAudit.audit_date,
);

function auditReportReady(): AuditReportReadyProps {
  const items = d.auditResults.filter(
    (i) => i.audit_id === reportAudit.id && inCurrentRevision(i, reportAudit),
  );
  const sectionById = new Map(d.auditSections.map((x) => [x.id, x]));
  const previousSections = previousAudit
    ? d.auditSections.filter(
        (x) => x.audit_id === previousAudit.id && inCurrentRevision(x, previousAudit),
      )
    : [];
  const template = d.auditTemplates.find((t) => t.id === reportAudit.audit_template_id);
  const score = reportAudit.property_score ?? 0;
  return {
    recipientName: managerOf(reportAudit.hotel_id).full_name,
    hotelName: mainHotel.name,
    auditId: reportAudit.id,
    auditName: reportAudit.name,
    auditReference: reportAudit.reference,
    templateName: template?.name ?? "Custom audit",
    auditDate: reportAudit.audit_date,
    auditorNames: d.auditAuditors
      .filter((x) => x.audit_id === reportAudit.id)
      .map((x) => user(x.user_id).full_name),
    propertyScore: score,
    previousScore: previousAudit?.property_score ?? null,
    band: scoreBand(score),
    hasRedFlag: reportAudit.has_red_flag,
    departments: d.auditSections
      .filter((x) => x.audit_id === reportAudit.id && inCurrentRevision(x, reportAudit))
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((x) => ({
        name: x.name,
        score: x.score,
        previousScore:
          previousSections.find((p) => p.department_id === x.department_id)?.score ?? null,
      })),
    criticalItems: items
      .filter((i) => i.is_critical && !i.is_na && i.score !== null && i.score < 3)
      .map((i) => ({
        code: i.item_code,
        label: i.label,
        departmentName: sectionById.get(i.audit_section_id)?.name ?? "",
        score: i.score_scale_type === "yes_no" ? (i.score === 0 ? "No" : "Yes") : String(i.score),
        isRedFlag: raisesRedFlag(i),
      })),
    issueCount: d.issues.filter((f) => f.audit_id === reportAudit.id).length,
  };
}

// ---------- issues ----------

function issueAssigned(): IssueAssignedProps {
  const issue = must(
    assignedIssues.find((f) => f.audit_id === reportAudit.id && f.status === "open") ??
      assignedIssues[0],
    "assigned issue",
  );
  return {
    ...issueFields(issue),
    recipientName: user(issue.assigned_to).full_name,
    assignedByName: managerOf(issue.hotel_id).full_name,
  };
}

function issueComment(): IssueCommentProps {
  const comment = must(
    d.issueComments.find((c) => {
      const issue = d.issues.find((f) => f.id === c.issue_id);
      return issue?.assigned_to && issue.assigned_to !== c.created_by;
    }),
    "comment by someone other than the assignee",
  );
  const issue = must(
    d.issues.find((f) => f.id === comment.issue_id),
    "issue",
  );
  return {
    ...issueFields(issue),
    recipientName: user(issue.assigned_to).full_name,
    commenterName: user(comment.created_by).full_name,
    commentedAt: comment.created_at,
    comment: comment.body,
    fileCount: d.issueCommentFiles.filter((x) => x.issue_comment_id === comment.id).length,
  };
}

function issueStatusChanged(): IssueStatusChangedProps {
  const row = must(
    d.issueStatusHistory.find((h) => {
      const issue = d.issues.find((f) => f.id === h.issue_id);
      return issue && h.to_status === "resolved" && managerOf(issue.hotel_id).id !== h.created_by;
    }),
    "status change by someone other than the hotel manager",
  );
  const issue = must(
    d.issues.find((f) => f.id === row.issue_id),
    "issue",
  );
  return {
    ...issueFields(issue),
    recipientName: managerOf(issue.hotel_id).full_name,
    changedByName: user(row.created_by).full_name,
    changedAt: row.created_at,
    fromStatus: statusKey[row.from_status],
    toStatus: statusKey[row.to_status],
    assignedToName: issue.assigned_to ? user(issue.assigned_to).full_name : "Unassigned",
  };
}

const openAssigned = assignedIssues.filter(
  (f) => f.status !== "resolved" && user(f.assigned_to).status === "active",
);

function issueDueSoon(): IssueReminderProps {
  const dueDate = addDays(SAMPLE_TODAY, 2);
  const issue = must(
    openAssigned.find((f) => f.due_date === dueDate) ??
      openAssigned.find((f) => !isOverdue(f)) ??
      openAssigned[0],
    "open issue",
  );
  return {
    ...issueFields(issue),
    kind: "dueSoon",
    recipientName: user(issue.assigned_to).full_name,
    // The reminder goes out 2 days before the due date.
    dueDate,
    status: statusKey[issue.status],
    today: SAMPLE_TODAY,
  };
}

function issueOverdue(): IssueReminderProps {
  const issue = must(
    openAssigned.find((f) => isOverdue(f)),
    "overdue issue",
  );
  return {
    ...issueFields(issue),
    kind: "overdue",
    recipientName: user(issue.assigned_to).full_name,
    status: statusKey[issue.status],
    today: SAMPLE_TODAY,
  };
}

// ---------- people ----------

const invitee = must(
  d.users.find(
    (u) =>
      u.status === "active" && d.memberships.some((m) => m.user_id === u.id && m.role === "staff"),
  ),
  "staff member",
);
const inviteeMembership = membershipOf(invitee);
const inviter = managerOf(inviteeMembership.hotel_id);

function invite(): InviteProps {
  return {
    recipientName: invitee.full_name,
    invitedByName: inviter.full_name,
    hotelName: hotel(inviteeMembership.hotel_id).name,
    roleLabel: roleLabels[inviteeMembership.role],
    accessUntil: `${addDays(SAMPLE_TODAY, 90)}T18:29:59.000Z`,
    inviteToken: "sample-invite",
  };
}

const expired = must(
  d.users.find((u) => u.status === "expired" && u.access_expires_at),
  "expired user",
);
const expiredMembership = membershipOf(expired);

function accessProps(
  kind: AccessEmailProps["kind"],
  recipient: AccessEmailProps["recipient"],
): AccessEmailProps {
  const person = kind === "expiring" ? invitee : expired;
  const m = kind === "expiring" ? inviteeMembership : expiredMembership;
  const by = managerOf(m.hotel_id);
  return {
    kind,
    recipient,
    recipientName: recipient === "person" ? person.full_name : by.full_name,
    personName: person.full_name,
    personId: person.id,
    invitedByName: by.full_name,
    hotelName: hotel(m.hotel_id).name,
    roleLabel: roleLabels[m.role],
    expiresAt:
      kind === "expiring"
        ? `${addDays(SAMPLE_TODAY, 7)}T18:29:59.000Z`
        : must(person.access_expires_at ?? undefined, "expiry date"),
  };
}

export const emailSamples = {
  invite: invite(),
  issueAssigned: issueAssigned(),
  issueComment: issueComment(),
  issueStatusChanged: issueStatusChanged(),
  issueDueSoon: issueDueSoon(),
  issueOverdue: issueOverdue(),
  auditReportReady: auditReportReady(),
  accessExpiringPerson: accessProps("expiring", "person"),
  accessExpiringInviter: accessProps("expiring", "inviter"),
  accessExpiredPerson: accessProps("expired", "person"),
  accessExpiredInviter: accessProps("expired", "inviter"),
};
