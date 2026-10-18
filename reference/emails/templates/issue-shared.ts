import { formatDate } from "../config";
import type { TextRow } from "../text";

/** Fields every issue email carries. */
export type IssueFields = {
  issueId: string;
  hotelName: string;
  departmentName: string;
  itemLabel: string;
  observation: string;
  recommendation: string;
  priority: string;
  dueDate: string;
  auditName: string;
};

/** The issue itself: item, Observation and Recommendation, then where and when. */
export function issueRows(issue: IssueFields, extra: TextRow[] = []): TextRow[] {
  return [
    ["Item", issue.itemLabel],
    ...(issue.observation ? [["Observation", issue.observation] as TextRow] : []),
    ...(issue.recommendation ? [["Recommendation", issue.recommendation] as TextRow] : []),
    ["Hotel", issue.hotelName],
    ["Department", issue.departmentName],
    ["Priority", issue.priority],
    ["Due date", formatDate(issue.dueDate)],
    ["Audit", issue.auditName],
    ...extra,
  ];
}
