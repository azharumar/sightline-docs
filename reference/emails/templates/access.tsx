import * as React from "react";

import { appUrl, emailPaths, formatDate } from "../config";
import { SimpleEmail, simpleText, type SimpleContent } from "../layout";
import type { TextRow } from "../text";

export type AccessEmailProps = {
  /** expiring: sent 7 days before. expired: sent when access ends. */
  kind: "expiring" | "expired";
  /** person: the one whose access ends. inviter: whoever invited them. */
  recipient: "person" | "inviter";
  recipientName: string;
  personName: string;
  personId: string;
  invitedByName: string;
  hotelName: string;
  roleLabel: string;
  /** ISO date-time. */
  expiresAt: string;
};

function content(p: AccessEmailProps): SimpleContent {
  const date = formatDate(p.expiresAt);
  const self = p.recipient === "person";
  const expiring = p.kind === "expiring";

  const subject = self
    ? expiring
      ? `Your Sightline access expires on ${date}`
      : "Your Sightline access has expired"
    : expiring
      ? `Access for ${p.personName} expires on ${date}`
      : `Access for ${p.personName} has expired`;

  const heading = self
    ? expiring
      ? "Your access expires in 7 days"
      : "Your access has expired"
    : expiring
      ? `Access for ${p.personName} expires in 7 days`
      : `Access for ${p.personName} has expired`;

  const intro = self
    ? expiring
      ? [
          `Your access to Sightline for ${p.hotelName} expires on ${date}. After that you cannot sign in.`,
          `To keep access, ask ${p.invitedByName} to renew it.`,
        ]
      : [
          `Your access to Sightline for ${p.hotelName} expired on ${date}. You cannot sign in until it is renewed.`,
          `Your audits, comments and history are kept. To get access again, ask ${p.invitedByName} to renew it.`,
        ]
    : expiring
      ? [
          `You invited ${p.personName} to ${p.hotelName}. Their access expires on ${date}. After that they cannot sign in.`,
          "Renew it now if they still need access.",
        ]
      : [
          `You invited ${p.personName} to ${p.hotelName}. Their access expired on ${date} and they cannot sign in.`,
          "Their audits, comments and history are kept. Open issues assigned to them show as Unassigned until you renew their access or assign the issues to someone else.",
        ];

  const details: TextRow[] = [
    ...(self ? [] : [["Person", p.personName] as TextRow]),
    ["Hotel", p.hotelName],
    ["Role", p.roleLabel],
    [expiring ? "Access until" : "Access ended", date],
    ["Invited by", p.invitedByName],
  ];

  return {
    subject,
    preview: intro[0] ?? heading,
    heading,
    reason: self
      ? "You got this email because your Sightline access has an end date."
      : `You got this email because you invited ${p.personName}.`,
    greeting: `Hello ${p.recipientName},`,
    intro,
    details,
    action: self
      ? expiring
        ? { label: "Sign in", href: appUrl(emailPaths.signIn()) }
        : undefined
      : { label: "Renew access", href: appUrl(emailPaths.user(p.personId)) },
  };
}

export const access = {
  subject: (p: AccessEmailProps) => content(p).subject,
  text: (p: AccessEmailProps) => simpleText(content(p)),
  Component: (p: AccessEmailProps) => <SimpleEmail c={content(p)} />,
};
