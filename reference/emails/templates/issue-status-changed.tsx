import * as React from "react";

import { statusLabel, type Status } from "@/design/tokens";
import { appUrl, emailPaths, formatDateTime } from "../config";
import { SimpleEmail, simpleText, type SimpleContent } from "../layout";
import { issueRows, type IssueFields } from "./issue-shared";

export type IssueStatusChangedProps = IssueFields & {
  /** The person who assigned the issue. */
  recipientName: string;
  changedByName: string;
  /** ISO date-time. */
  changedAt: string;
  fromStatus: Status;
  toStatus: Status;
  assignedToName: string;
};

function content(p: IssueStatusChangedProps): SimpleContent {
  const from = statusLabel[p.fromStatus];
  const to = statusLabel[p.toStatus];
  return {
    subject: `Issue status changed to ${to}: ${p.itemLabel}`,
    preview: `${p.changedByName} changed the status from ${from} to ${to}.`,
    heading: "Issue status changed",
    reason: "You got this email because you assigned this issue.",
    greeting: `Hello ${p.recipientName},`,
    intro: [
      `On ${formatDateTime(p.changedAt)}, ${p.changedByName} changed the status of an issue you assigned.`,
    ],
    statusChange: { from: p.fromStatus, to: p.toStatus },
    details: issueRows(p, [["Assigned to", p.assignedToName]]),
    action: { label: "Open issue", href: appUrl(emailPaths.issue(p.issueId)) },
  };
}

export const issueStatusChanged = {
  subject: (p: IssueStatusChangedProps) => content(p).subject,
  text: (p: IssueStatusChangedProps) => simpleText(content(p)),
  Component: (p: IssueStatusChangedProps) => <SimpleEmail c={content(p)} />,
};
