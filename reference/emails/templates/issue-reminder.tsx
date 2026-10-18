import * as React from "react";

import { statusLabel, type Status } from "@/design/tokens";
import { appUrl, emailPaths, formatDate } from "../config";
import { SimpleEmail, simpleText, type SimpleContent } from "../layout";
import { issueRows, type IssueFields } from "./issue-shared";

export type IssueReminderProps = IssueFields & {
  /** dueSoon: sent 2 days before the due date. overdue: sent once the due date has passed. */
  kind: "dueSoon" | "overdue";
  recipientName: string;
  status: Status;
  /** Calendar date the email is sent, e.g. 2026-10-03. */
  today: string;
};

function daysLate(dueDate: string, today: string): number {
  const ms = Date.parse(`${today}T00:00:00.000Z`) - Date.parse(`${dueDate}T00:00:00.000Z`);
  return Math.max(1, Math.round(ms / 86_400_000));
}

const daysText = (n: number) => (n === 1 ? "1 day" : `${n} days`);

function content(p: IssueReminderProps): SimpleContent {
  const due = formatDate(p.dueDate);
  const status = statusLabel[p.status];
  const soon = p.kind === "dueSoon";
  const line = soon
    ? `An issue assigned to you is due on ${due}. It is not resolved yet.`
    : `An issue assigned to you was due on ${due}, ${daysText(daysLate(p.dueDate, p.today))} ago. It is not resolved yet.`;
  return {
    subject: soon ? `Issue due in 2 days: ${p.itemLabel}` : `Issue overdue: ${p.itemLabel}`,
    preview: line,
    heading: soon ? "Issue due in 2 days" : "Issue overdue",
    reason: "You got this email because an issue assigned to you is not resolved.",
    canTurnOff: true,
    greeting: `Hello ${p.recipientName},`,
    intro: [line],
    details: issueRows(p, [["Status", status]]),
    action: { label: "Open issue", href: appUrl(emailPaths.issue(p.issueId)) },
  };
}

export const issueReminder = {
  subject: (p: IssueReminderProps) => content(p).subject,
  text: (p: IssueReminderProps) => simpleText(content(p)),
  Component: (p: IssueReminderProps) => <SimpleEmail c={content(p)} />,
};
