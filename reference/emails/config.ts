// Sender, app address and formatting shared by every email.

/** Sender chosen by Azhar on 2026-10-03, replacing audits@zarnik.com from p1-03. Display name from p1-03. */
export const EMAIL_FROM = { name: "Zarnik Sightline", address: "no-reply@zescloud.com" } as const;
export const EMAIL_FROM_HEADER = `${EMAIL_FROM.name} <${EMAIL_FROM.address}>`;

/** Blueprint p1-03: the app lives at app.sightline.zarnik.com. */
export const APP_URL = "https://app.sightline.zarnik.com";

/** Full link to an app path, e.g. appUrl("/issues/123"). */
export function appUrl(path: string): string {
  return `${APP_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** App paths used in emails. Kept in one place so screens and emails agree. */
export const emailPaths = {
  invite: (token: string) => `/invite/${token}`,
  signIn: () => "/login",
  issue: (issueId: string) => `/issues/${issueId}`,
  issueComments: (issueId: string) => `/issues/${issueId}#comments`,
  auditReport: (auditId: string) => `/audits/${auditId}/report`,
  user: (userId: string) => `/users/${userId}`,
  emailSettings: () => "/profile/email",
} as const;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** India time, the only time zone Sightline works in. */
const IST_OFFSET_MS = 330 * 60_000;

const pad = (n: number) => String(n).padStart(2, "0");

/** Calendar date in India time. A plain "2026-07-14" is taken as that day. */
function istParts(value: string) {
  const d =
    value.length === 10
      ? new Date(`${value}T00:00:00.000Z`)
      : new Date(new Date(value).getTime() + IST_OFFSET_MS);
  return {
    day: d.getUTCDate(),
    month: MONTHS[d.getUTCMonth()] ?? "",
    year: d.getUTCFullYear(),
    time: `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`,
  };
}

/** "2026-07-14" or an ISO date-time -> "14 Jul 2026". Same output in every runtime. */
export function formatDate(value: string): string {
  const p = istParts(value);
  return `${p.day} ${p.month} ${p.year}`;
}

/** ISO date-time -> "14 Jul 2026, 15:00 IST". */
export function formatDateTime(value: string): string {
  const p = istParts(value);
  return `${p.day} ${p.month} ${p.year}, ${p.time} IST`;
}

/** 82.456 -> "82.46" with no trailing zeros, e.g. "82.5" or "82". */
export function formatScore(n: number): string {
  return String(Math.round(n * 100) / 100);
}
