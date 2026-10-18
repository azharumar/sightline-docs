import * as React from "react";

import { appUrl, emailPaths, formatDate } from "../config";
import { SimpleEmail, simpleText, type SimpleContent } from "../layout";
import { issueRows, type IssueFields } from "./issue-shared";

export type IssueAssignedProps = IssueFields & {
  recipientName: string;
  assignedByName: string;
};

function content(p: IssueAssignedProps): SimpleContent {
  const due = formatDate(p.dueDate);
  return {
    subject: `Issue assigned to you: ${p.itemLabel}`,
    preview: `${p.assignedByName} assigned you an issue in ${p.departmentName}, due ${due}.`,
    heading: "Issue assigned to you",
    reason: "You got this email because an issue was assigned to you.",
    greeting: `Hello ${p.recipientName},`,
    intro: [
      `${p.assignedByName} assigned you an issue in ${p.departmentName} at ${p.hotelName}. It is due on ${due}.`,
    ],
    details: issueRows(p, [["Assigned by", p.assignedByName]]),
    action: { label: "Open issue", href: appUrl(emailPaths.issue(p.issueId)) },
  };
}

export const issueAssigned = {
  subject: (p: IssueAssignedProps) => content(p).subject,
  text: (p: IssueAssignedProps) => simpleText(content(p)),
  Component: (p: IssueAssignedProps) => <SimpleEmail c={content(p)} />,
};
