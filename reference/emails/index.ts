// Every email Sightline sends (blueprint p2-17), with subject, HTML and plain text rendering.
// Sending, retries and the email log are built in Epic 10; this module only renders.
import { render } from "@react-email/render";
import * as React from "react";

import { EMAIL_FROM_HEADER } from "./config";
import { emailSamples } from "./samples";
import { access, type AccessEmailProps } from "./templates/access";
import { auditReportReady, type AuditReportReadyProps } from "./templates/audit-report-ready";
import { issueAssigned, type IssueAssignedProps } from "./templates/issue-assigned";
import { issueComment, type IssueCommentProps } from "./templates/issue-comment";
import { issueReminder, type IssueReminderProps } from "./templates/issue-reminder";
import { issueStatusChanged, type IssueStatusChangedProps } from "./templates/issue-status-changed";
import { invite, type InviteProps } from "./templates/invite";

export * from "./config";
export type {
  AccessEmailProps,
  AuditReportReadyProps,
  IssueAssignedProps,
  IssueCommentProps,
  IssueReminderProps,
  IssueStatusChangedProps,
  InviteProps,
};

export type RenderedEmail = { from: string; subject: string; html: string; text: string };

export type EmailTemplate<P> = {
  subject: (props: P) => string;
  /** Plain text version, sent alongside the HTML. */
  text: (props: P) => string;
  Component: (props: P) => React.ReactElement;
};

/** Renders one email to a subject, HTML with inline styles, and a plain text version. */
export async function renderEmail<P extends object>(
  template: EmailTemplate<P>,
  props: P,
): Promise<RenderedEmail> {
  const element = React.createElement(template.Component, props);
  const html = await render(element);
  return {
    from: EMAIL_FROM_HEADER,
    subject: template.subject(props),
    html,
    text: template.text(props),
  };
}

/** One template per trigger in blueprint p2-17. Reminders and access emails cover two triggers each. */
export const templates = {
  invite,
  issueAssigned,
  issueComment,
  issueStatusChanged,
  issueReminder,
  auditReportReady,
  access,
} satisfies Record<string, EmailTemplate<never>>;

export type EmailPreview = {
  id: string;
  /** The trigger, worded as in blueprint p2-17. */
  trigger: string;
  /** Who receives this version. */
  to: string;
  /** Due and overdue reminders can be turned off by each person. */
  canTurnOff: boolean;
  render: () => Promise<RenderedEmail>;
};

const preview = <P extends object>(
  id: string,
  trigger: string,
  to: string,
  template: EmailTemplate<P>,
  props: P,
  canTurnOff = false,
): EmailPreview => ({ id, trigger, to, canTurnOff, render: () => renderEmail(template, props) });

const x = emailSamples;

/** One entry per email the app sends, in blueprint order, with sample data. */
export const emailPreviews: EmailPreview[] = [
  preview("invite", "Invite to join a hotel", "The person invited", templates.invite, x.invite),
  preview(
    "issue-assigned",
    "Issue assigned to you",
    "The person assigned",
    templates.issueAssigned,
    x.issueAssigned,
  ),
  preview(
    "issue-comment",
    "Comment added on your issue",
    "The person assigned",
    templates.issueComment,
    x.issueComment,
  ),
  preview(
    "issue-status-changed",
    "Status changed on an issue you assigned",
    "The person who assigned the issue",
    templates.issueStatusChanged,
    x.issueStatusChanged,
  ),
  preview(
    "issue-due-soon",
    "Issue due in 2 days",
    "The person assigned",
    templates.issueReminder,
    x.issueDueSoon,
    true,
  ),
  preview(
    "issue-overdue",
    "Issue overdue",
    "The person assigned",
    templates.issueReminder,
    x.issueOverdue,
    true,
  ),
  preview(
    "audit-report-ready",
    "Audit report ready",
    "People who can see the hotel's reports",
    templates.auditReportReady,
    x.auditReportReady,
  ),
  preview(
    "access-expiring-person",
    "Access expiring in 7 days",
    "The person",
    templates.access,
    x.accessExpiringPerson,
  ),
  preview(
    "access-expiring-inviter",
    "Access expiring in 7 days",
    "Whoever invited them",
    templates.access,
    x.accessExpiringInviter,
  ),
  preview(
    "access-expired-person",
    "Access expired",
    "The person",
    templates.access,
    x.accessExpiredPerson,
  ),
  preview(
    "access-expired-inviter",
    "Access expired",
    "Whoever invited them",
    templates.access,
    x.accessExpiredInviter,
  ),
];
