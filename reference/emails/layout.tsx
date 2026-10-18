import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

import { brand } from "@/design/brand";
import { appUrl, emailPaths } from "./config";
import { statusLabel, type Status } from "@/design/tokens";
import { s, statusChip } from "./styles";
import { footerLines, textDetails, textEmail, textLink, type TextRow } from "./text";

export type EmailLayoutProps = {
  /** Short line shown next to the subject in the inbox. */
  preview: string;
  heading: string;
  children: React.ReactNode;
  /** Why this person got the email, shown in the footer. */
  reason: string;
  /** Due and overdue reminders can be turned off; the footer links to the setting. */
  canTurnOff?: boolean;
};

export function EmailLayout({ preview, heading, children, reason, canTurnOff }: EmailLayoutProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={s.body}>
        <Container style={s.container}>
          <Text style={s.appName}>Zarnik {brand.name}</Text>
          <Heading as="h1" style={s.heading}>
            {heading}
          </Heading>
          {children}
          <Hr style={s.rule} />
          <Text style={s.footer}>{reason}</Text>
          {canTurnOff ? (
            <Text style={s.footer}>
              {footerLines.turnOffLead}{" "}
              <Link href={appUrl(emailPaths.emailSettings())} style={s.link}>
                {footerLines.turnOffLink}
              </Link>
              .
            </Text>
          ) : null}
          <Text style={s.footer}>{footerLines.sentBy}</Text>
        </Container>
      </Body>
    </Html>
  );
}

export function Paragraph({ children }: { children: React.ReactNode }) {
  return <Text style={s.text}>{children}</Text>;
}

export function ActionButton({ href, children }: { href: string; children: string }) {
  return (
    <Section style={{ margin: "8px 0 16px" }}>
      <Button href={href} style={s.button}>
        {children}
      </Button>
    </Section>
  );
}

/** Label and value pairs in a two column table, which every email client lays out the same. */
export function Details({ rows }: { rows: [label: string, value: React.ReactNode][] }) {
  return (
    <Section style={s.panel}>
      <table role="presentation" cellPadding={0} cellSpacing={0} border={0} width="100%">
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label}>
              <td style={s.detailLabelCell} width="40%">
                <Text style={s.label}>{label}</Text>
              </td>
              <td style={s.detailCell}>
                <Text style={s.value}>{value}</Text>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Section>
  );
}

export function Quote({ children }: { children: React.ReactNode }) {
  return (
    <Section style={{ margin: "0 0 16px" }}>
      <Text style={s.quote}>{children}</Text>
    </Section>
  );
}

export function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <Heading as="h2" style={s.sectionTitle}>
      {children}
    </Heading>
  );
}

export { Link, s };

/** Content for emails made of paragraphs, a details panel and one button. Feeds HTML and text. */
export type SimpleContent = {
  subject: string;
  preview: string;
  heading: string;
  reason: string;
  canTurnOff?: boolean;
  greeting: string;
  intro: string[];
  /** A comment or other text quoted as written. */
  quote?: string;
  /** Status change shown as two coloured chips. */
  statusChange?: { from: Status; to: Status };
  details: TextRow[];
  action?: { label: string; href: string };
  outro?: string[];
};

export function SimpleEmail({ c }: { c: SimpleContent }) {
  return (
    <EmailLayout
      preview={c.preview}
      heading={c.heading}
      reason={c.reason}
      canTurnOff={c.canTurnOff}
    >
      <Paragraph>{c.greeting}</Paragraph>
      {c.intro.map((line) => (
        <Paragraph key={line}>{line}</Paragraph>
      ))}
      {c.quote ? <Quote>{c.quote}</Quote> : null}
      {c.statusChange ? (
        <Paragraph>
          <span style={statusChip(c.statusChange.from)}>{statusLabel[c.statusChange.from]}</span> to{" "}
          <span style={statusChip(c.statusChange.to)}>{statusLabel[c.statusChange.to]}</span>
        </Paragraph>
      ) : null}
      <Details rows={c.details} />
      {c.action ? <ActionButton href={c.action.href}>{c.action.label}</ActionButton> : null}
      {(c.outro ?? []).map((line) => (
        <Paragraph key={line}>{line}</Paragraph>
      ))}
    </EmailLayout>
  );
}

export function simpleText(c: SimpleContent): string {
  return textEmail(
    c.heading,
    [
      c.greeting,
      ...c.intro,
      c.quote ? c.quote.replace(/^/gm, "> ") : null,
      c.statusChange
        ? `Status: ${statusLabel[c.statusChange.from]} to ${statusLabel[c.statusChange.to]}`
        : null,
      textDetails(c.details),
      c.action ? textLink(c.action.label, c.action.href) : null,
      ...(c.outro ?? []),
    ],
    { reason: c.reason, canTurnOff: c.canTurnOff },
  );
}
