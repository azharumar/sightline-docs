import * as React from "react";

import { appUrl, emailPaths, formatDate } from "../config";
import { SimpleEmail, simpleText, type SimpleContent } from "../layout";

export type InviteProps = {
  recipientName: string;
  invitedByName: string;
  hotelName: string;
  roleLabel: string;
  /** ISO date-time, or null for no expiry. */
  accessUntil: string | null;
  inviteToken: string;
};

function content(p: InviteProps): SimpleContent {
  return {
    subject: `Invite to join ${p.hotelName} on Sightline`,
    preview: `${p.invitedByName} invited you to join ${p.hotelName}.`,
    heading: `Join ${p.hotelName} on Sightline`,
    reason: `You got this email because ${p.invitedByName} invited you to Sightline.`,
    greeting: `Hello ${p.recipientName},`,
    intro: [
      `${p.invitedByName} invited you to join ${p.hotelName} on Sightline, the hotel audit app. Set a password to finish joining.`,
    ],
    details: [
      ["Hotel", p.hotelName],
      ["Role", p.roleLabel],
      ["Invited by", p.invitedByName],
      ["Access until", p.accessUntil ? formatDate(p.accessUntil) : "No expiry"],
    ],
    action: { label: "Set your password", href: appUrl(emailPaths.invite(p.inviteToken)) },
    outro: ["This link works once and expires after 7 days."],
  };
}

export const invite = {
  subject: (p: InviteProps) => content(p).subject,
  text: (p: InviteProps) => simpleText(content(p)),
  Component: (p: InviteProps) => <SimpleEmail c={content(p)} />,
};
