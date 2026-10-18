import { Section, Text } from "@react-email/components";
import * as React from "react";

import { RED_FLAG_CAP, type ScoreBand } from "@/sample";
import { appUrl, emailPaths, formatDate, formatScore } from "../config";
import { ActionButton, Details, EmailLayout, Paragraph, SubHeading } from "../layout";
import { bandChip, s } from "../styles";
import { textDetails, textEmail, textLink, type TextRow } from "../text";

export type AuditReportReadyProps = {
  recipientName: string;
  hotelName: string;
  auditId: string;
  auditName: string;
  auditReference: string;
  templateName: string;
  /** Calendar date, e.g. 2026-09-14. */
  auditDate: string;
  auditorNames: string[];
  propertyScore: number;
  previousScore: number | null;
  band: ScoreBand;
  hasRedFlag: boolean;
  departments: { name: string; score: number | null; previousScore: number | null }[];
  /** Critical items scored below 3, or answered No. */
  criticalItems: {
    code: string;
    label: string;
    departmentName: string;
    score: string;
    isRedFlag: boolean;
  }[];
  issueCount: number;
};

/** "+3.5", "-2", "No change", or "" when there is nothing to compare. */
function change(score: number | null, previous: number | null): string {
  if (score === null || previous === null) return "";
  const diff = Math.round((score - previous) * 100) / 100;
  if (diff === 0) return "No change";
  return diff > 0 ? `+${formatScore(diff)}` : `-${formatScore(-diff)}`;
}

function content(p: AuditReportReadyProps) {
  const date = formatDate(p.auditDate);
  const propertyChange = change(p.propertyScore, p.previousScore);
  const critical = p.criticalItems.length;
  const details: TextRow[] = [
    ["Hotel", p.hotelName],
    ["Audit", p.auditName],
    ["Audit template", p.templateName],
    ["Audit date", date],
    ["Reference", p.auditReference],
    [p.auditorNames.length === 1 ? "Auditor" : "Auditors", p.auditorNames.join(", ")],
  ];
  return {
    subject: `Audit report ready: ${p.hotelName}, ${date}`,
    preview: `Property score ${formatScore(p.propertyScore)} out of 100. ${critical === 1 ? "1 critical item" : `${critical} critical items`} below 3. ${p.issueCount === 1 ? "1 issue" : `${p.issueCount} issues`}.`,
    heading: `Audit report ready for ${p.hotelName}`,
    reason: "You got this email because you can see reports for this hotel.",
    greeting: `Hello ${p.recipientName},`,
    intro: `The report for the audit on ${date} is ready.`,
    details,
    score: `${formatScore(p.propertyScore)} out of 100`,
    propertyChange: propertyChange ? `${propertyChange} since last audit` : "",
    redFlag: p.hasRedFlag
      ? `Red flag: the property score is capped at ${RED_FLAG_CAP} because a critical item scored 0.`
      : "",
    noCritical: "No critical item scored below 3.",
    issues:
      p.issueCount === 1
        ? "1 issue was created from this audit."
        : `${p.issueCount} issues were created from this audit.`,
    action: { label: "Open report", href: appUrl(emailPaths.auditReport(p.auditId)) },
  };
}

function Table({ head, rows }: { head: string[]; rows: { key: string; cells: string[] }[] }) {
  return (
    <Section>
      <table role="presentation" cellPadding={0} cellSpacing={0} border={0} width="100%">
        <thead>
          <tr>
            {head.map((h) => (
              <th key={h} style={s.tableHead}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key}>
              {r.cells.map((cell, i) => (
                <td key={i} style={s.tableCell}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Section>
  );
}

const deptRows = (p: AuditReportReadyProps) =>
  p.departments.map((d) => ({
    key: d.name,
    cells: [
      d.name,
      d.score === null ? "N/A" : formatScore(d.score),
      change(d.score, d.previousScore) || "None",
    ],
  }));

const criticalRows = (p: AuditReportReadyProps) =>
  p.criticalItems.map((i) => ({
    key: i.code,
    cells: [`${i.label}${i.isRedFlag ? " (red flag)" : ""}`, i.departmentName, i.score],
  }));

function AuditReportReadyEmail(p: AuditReportReadyProps) {
  const c = content(p);
  return (
    <EmailLayout preview={c.preview} heading={c.heading} reason={c.reason}>
      <Paragraph>{c.greeting}</Paragraph>
      <Paragraph>{c.intro}</Paragraph>
      <Details rows={c.details} />

      <SubHeading>Property score</SubHeading>
      <Text style={s.text}>
        <strong>{c.score}</strong> <span style={bandChip(p.band)}>{p.band}</span>
        {c.propertyChange ? ` ${c.propertyChange}` : ""}
      </Text>
      {c.redFlag ? <Paragraph>{c.redFlag}</Paragraph> : null}

      <SubHeading>Department scores</SubHeading>
      <Table head={["Department", "Score", "Change"]} rows={deptRows(p)} />

      <SubHeading>Critical items</SubHeading>
      {p.criticalItems.length === 0 ? (
        <Paragraph>{c.noCritical}</Paragraph>
      ) : (
        <Table head={["Item", "Department", "Score"]} rows={criticalRows(p)} />
      )}

      <Paragraph>{c.issues}</Paragraph>
      <ActionButton href={c.action.href}>{c.action.label}</ActionButton>
    </EmailLayout>
  );
}

function text(p: AuditReportReadyProps): string {
  const c = content(p);
  return textEmail(
    c.heading,
    [
      c.greeting,
      c.intro,
      textDetails(c.details),
      `Property score: ${c.score}, ${p.band}${c.propertyChange ? `, ${c.propertyChange}` : ""}`,
      c.redFlag,
      [
        "Department scores",
        ...deptRows(p).map((r) => `- ${r.cells[0]}: ${r.cells[1]} (change: ${r.cells[2]})`),
      ].join("\n"),
      p.criticalItems.length === 0
        ? `Critical items\n${c.noCritical}`
        : [
            "Critical items",
            ...criticalRows(p).map((r) => `- ${r.cells[0]}, ${r.cells[1]}, score ${r.cells[2]}`),
          ].join("\n"),
      c.issues,
      textLink(c.action.label, c.action.href),
    ],
    { reason: c.reason },
  );
}

export const auditReportReady = {
  subject: (p: AuditReportReadyProps) => content(p).subject,
  text,
  Component: AuditReportReadyEmail,
};
