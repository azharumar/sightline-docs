// Plain text versions of emails. Written by hand so tables and lists read well without HTML.
import { brand } from "@/design/brand";
import { appUrl, emailPaths } from "./config";

export type TextRow = [label: string, value: string];

/** Label: value, one per line. */
export function textDetails(rows: TextRow[]): string {
  return rows.map(([label, value]) => `${label}: ${value}`).join("\n");
}

/** "Open issue: https://app.sightline.zarnik.com/issues/..." */
export function textLink(label: string, href: string): string {
  return `${label}: ${href}`;
}

export const footerLines = {
  sentBy: `This email was sent by Zarnik ${brand.name}. Do not reply.`,
  turnOffLead: "To stop due and overdue reminders, go to",
  turnOffLink: "Email reminders",
};

/** Joins blocks with blank lines and adds the standard footer. Empty blocks are skipped. */
export function textEmail(
  heading: string,
  blocks: (string | null | false | undefined)[],
  footer: { reason: string; canTurnOff?: boolean },
): string {
  const foot = [
    footer.reason,
    footer.canTurnOff
      ? textLink(
          `${footerLines.turnOffLead} ${footerLines.turnOffLink}`,
          appUrl(emailPaths.emailSettings()),
        )
      : null,
    footerLines.sentBy,
  ];
  return (
    [`Zarnik ${brand.name}`, heading, ...blocks, "----", ...foot]
      .filter((b): b is string => typeof b === "string" && b.length > 0)
      .join("\n\n") + "\n"
  );
}
