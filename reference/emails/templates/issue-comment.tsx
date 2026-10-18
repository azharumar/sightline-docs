import * as React from "react";

import { appUrl, emailPaths, formatDateTime } from "../config";
import { SimpleEmail, simpleText, type SimpleContent } from "../layout";
import type { IssueFields } from "./issue-shared";

export type IssueCommentProps = IssueFields & {
  recipientName: string;
  commenterName: string;
  /** ISO date-time. */
  commentedAt: string;
  comment: string;
  /** Photos and files attached to the comment. */
  fileCount: number;
};

function content(p: IssueCommentProps): SimpleContent {
  const files = p.fileCount === 0 ? null : p.fileCount === 1 ? "1 file" : `${p.fileCount} files`;
  return {
    subject: `New comment on your issue: ${p.itemLabel}`,
    preview: `${p.commenterName}: ${p.comment}`,
    heading: "New comment on your issue",
    reason: "You got this email because someone commented on an issue assigned to you.",
    greeting: `Hello ${p.recipientName},`,
    intro: [`${p.commenterName} commented on ${formatDateTime(p.commentedAt)}:`],
    quote: p.comment,
    details: [
      ["Item", p.itemLabel],
      ["Hotel", p.hotelName],
      ["Department", p.departmentName],
      ...(files ? [["Files", files] as [string, string]] : []),
    ],
    action: { label: "Open comments", href: appUrl(emailPaths.issueComments(p.issueId)) },
  };
}

export const issueComment = {
  subject: (p: IssueCommentProps) => content(p).subject,
  text: (p: IssueCommentProps) => simpleText(content(p)),
  Component: (p: IssueCommentProps) => <SimpleEmail c={content(p)} />,
};
