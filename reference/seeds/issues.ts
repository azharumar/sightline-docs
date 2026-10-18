// Sample issues and their comments. Issues are standalone to-do items for the hotel team (p2-16):
// no audit, audit result or audit item link and no department. Raised by Group Heads, Hotel
// Managers and Staff, never by an Auditor. Dates count from the seed day.
import { addDays, at, sid, type Day } from "./ids";
import type { HotelKey, UserKey } from "./people";

export type IssueStatus = "open" | "in_progress" | "done";

export type IssueSpec = {
  key: string;
  hotel: HotelKey;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  /** Final status. The issue is created open and moved through the steps below. */
  status: IssueStatus;
  raisedBy: UserKey;
  raisedDaysAgo: number;
  assignedTo: UserKey | null;
  /** Days from the seed day. Negative means overdue when the issue is not done. */
  dueInDays: number | null;
  /** Status changes after creation, oldest first. `daysAgo` counts from the seed day. */
  steps?: { to: IssueStatus; by: UserKey; daysAgo: number }[];
  comments?: { by: UserKey; daysAgo: number; body: string }[];
};

export const ISSUES: IssueSpec[] = [
  {
    key: "grand-grout",
    hotel: "grand",
    title: "Bathroom grouting is stained in rooms on floor 3",
    description: "Grouting is dark in the shower area of at least six rooms on floor 3.",
    priority: "medium",
    status: "open",
    raisedBy: "hm1",
    raisedDaysAgo: 40,
    assignedTo: "staff1",
    dueInDays: 7,
    comments: [
      { by: "staff1", daysAgo: 38, body: "Housekeeping has booked the grout clean for Thursday." },
      { by: "hm1", daysAgo: 37, body: "Please share photos once the first five rooms are done." },
    ],
  },
  {
    key: "grand-cold-room",
    hotel: "grand",
    title: "Cold room temperature log has gaps",
    description: "Evening readings are missing on five of the last fourteen days.",
    priority: "high",
    status: "in_progress",
    raisedBy: "gh1",
    raisedDaysAgo: 50,
    assignedTo: "staff1",
    dueInDays: -5,
    steps: [{ to: "in_progress", by: "staff1", daysAgo: 46 }],
    comments: [
      {
        by: "staff1",
        daysAgo: 46,
        body: "New log sheet is on the cold room door. Night cook has been briefed.",
      },
      {
        by: "gh1",
        daysAgo: 20,
        body: "Still one missing reading last week. Please check the night shift.",
      },
    ],
  },
  {
    key: "grand-extinguishers",
    hotel: "grand",
    title: "Two fire extinguishers on level 2 are past refill date",
    description: "Tags show refill due three months ago. Both are near the east stairs.",
    priority: "high",
    status: "done",
    raisedBy: "hm1",
    raisedDaysAgo: 80,
    assignedTo: "staff1",
    dueInDays: -60,
    steps: [
      { to: "in_progress", by: "staff1", daysAgo: 78 },
      { to: "done", by: "staff1", daysAgo: 70 },
    ],
    comments: [
      {
        by: "staff1",
        daysAgo: 70,
        body: "Both extinguishers refilled and tagged. Vendor receipt is attached to the safety file.",
      },
    ],
  },
  {
    key: "grand-queue",
    hotel: "grand",
    title: "Queue at the desk exceeds ten minutes at check-out peak",
    description: "Between 10 and 11 am only one counter is open while up to eight guests wait.",
    priority: "medium",
    status: "open",
    raisedBy: "gh1",
    raisedDaysAgo: 45,
    assignedTo: "staffExpired",
    dueInDays: -3,
    comments: [
      {
        by: "gh1",
        daysAgo: 44,
        body: "Assigned to Tarun. Please open the second counter from 9:45.",
      },
    ],
  },
  {
    key: "grand-lobby-ac",
    hotel: "grand",
    title: "Lobby air conditioning unit is noisy",
    description: "A rattling sound from the unit near the lounge, worse in the afternoon.",
    priority: "low",
    status: "open",
    raisedBy: "gh1",
    raisedDaysAgo: 12,
    assignedTo: null,
    dueInDays: null,
  },
  {
    key: "grand-kettles",
    hotel: "grand",
    title: "Kettles are missing in six rooms",
    description: "Rooms 208, 211, 214, 305, 309 and 312 have no kettle.",
    priority: "medium",
    status: "in_progress",
    raisedBy: "staff1",
    raisedDaysAgo: 15,
    assignedTo: "staff1",
    dueInDays: 4,
    steps: [{ to: "in_progress", by: "staff1", daysAgo: 10 }],
    comments: [
      {
        by: "staff1",
        daysAgo: 10,
        body: "Four kettles are back in the rooms. Waiting for two from stores.",
      },
    ],
  },
  {
    key: "grand-lift",
    hotel: "grand",
    title: "Lift 2 door sensor fails now and then",
    description: "The door reopens twice before closing and sometimes stays open.",
    priority: "high",
    status: "done",
    raisedBy: "hm1",
    raisedDaysAgo: 150,
    assignedTo: "staffExpired",
    dueInDays: -130,
    steps: [
      { to: "in_progress", by: "staffExpired", daysAgo: 145 },
      { to: "done", by: "staffExpired", daysAgo: 135 },
    ],
    comments: [
      {
        by: "hm1",
        daysAgo: 134,
        body: "Checked after the engineer visit. The sensor works.",
      },
    ],
  },
  {
    key: "grand-pool-sign",
    hotel: "grand",
    title: "Pool depth marking is faded",
    description: "Depth marks on the pool edge are hard to read.",
    priority: "medium",
    status: "in_progress",
    raisedBy: "gh1",
    raisedDaysAgo: 100,
    assignedTo: "hm1",
    dueInDays: 14,
    steps: [{ to: "in_progress", by: "hm1", daysAgo: 95 }],
    comments: [
      { by: "hm1", daysAgo: 95, body: "Painter is booked once the pool is drained." },
      { by: "gh1", daysAgo: 55, body: "Please give a date for the repaint." },
    ],
  },
  {
    key: "express-exit-light",
    hotel: "express",
    title: "Emergency exit sign is unlit on the second floor",
    description: "The sign over the east stairwell door is dark.",
    priority: "high",
    status: "open",
    raisedBy: "gh1",
    raisedDaysAgo: 210,
    assignedTo: "hm2",
    dueInDays: -2,
    comments: [
      { by: "hm2", daysAgo: 205, body: "Electrician has ordered the replacement unit." },
      { by: "gh1", daysAgo: 30, body: "This is still open. Please give a date." },
    ],
  },
  {
    key: "express-allergen",
    hotel: "express",
    title: "Buffet labels do not show allergen information",
    description: "Labels show the dish name only.",
    priority: "medium",
    status: "in_progress",
    raisedBy: "hm2",
    raisedDaysAgo: 30,
    assignedTo: "staff2",
    dueInDays: 10,
    steps: [{ to: "in_progress", by: "staff2", daysAgo: 24 }],
    comments: [{ by: "staff2", daysAgo: 24, body: "New label cards are being printed." }],
  },
  {
    key: "express-id",
    hotel: "express",
    title: "ID not recorded for two foreign guests",
    description: "Two registration cards from last week have no ID details.",
    priority: "high",
    status: "done",
    raisedBy: "gh1",
    raisedDaysAgo: 118,
    assignedTo: "hm2",
    dueInDays: -100,
    steps: [
      { to: "in_progress", by: "hm2", daysAgo: 116 },
      { to: "done", by: "hm2", daysAgo: 110 },
    ],
  },
  {
    key: "express-pressure",
    hotel: "express",
    title: "Water pressure is low in rooms 204 and 206",
    description: "Showers run weakly after 7 pm.",
    priority: "low",
    status: "open",
    raisedBy: "staff2",
    raisedDaysAgo: 8,
    assignedTo: null,
    dueInDays: null,
  },
  {
    key: "pinewood-mildew",
    hotel: "pinewood",
    title: "Mildew smell in two rooms",
    description: "Rooms 6 and 9 smell of damp, mostly near the bathroom door.",
    priority: "medium",
    status: "open",
    raisedBy: "gh2",
    raisedDaysAgo: 150,
    assignedTo: "hm3",
    dueInDays: 9,
    comments: [
      {
        by: "hm3",
        daysAgo: 140,
        body: "Dehumidifier placed in both rooms. We will watch it for two weeks.",
      },
    ],
  },
  {
    key: "pinewood-smoke",
    hotel: "pinewood",
    title: "Smoke detector in the kitchen annex was not tested this quarter",
    description: "The test log has no entry for the annex in three months.",
    priority: "high",
    status: "in_progress",
    raisedBy: "gh2",
    raisedDaysAgo: 40,
    assignedTo: "hm3",
    dueInDays: -1,
    steps: [{ to: "in_progress", by: "hm3", daysAgo: 33 }],
    comments: [
      { by: "hm3", daysAgo: 33, body: "Vendor visit booked. Will log the test the same day." },
      { by: "gh2", daysAgo: 6, body: "Please confirm by Friday." },
    ],
  },
  {
    key: "pinewood-signboard",
    hotel: "pinewood",
    title: "Signboard lighting is out",
    description: "The board is not visible after dark from the main road.",
    priority: "low",
    status: "done",
    raisedBy: "hm3",
    raisedDaysAgo: 70,
    assignedTo: "hm3",
    dueInDays: -50,
    steps: [
      { to: "in_progress", by: "hm3", daysAgo: 66 },
      { to: "done", by: "hm3", daysAgo: 58 },
    ],
  },
  {
    key: "pinewood-badges",
    hotel: "pinewood",
    title: "Name badges are missing on the evening shift",
    description: "Three of five staff on duty had no badge.",
    priority: "low",
    status: "open",
    raisedBy: "gh2",
    raisedDaysAgo: 20,
    assignedTo: "staff3",
    dueInDays: 6,
  },
];

export const issueId = (k: string) => sid(`issue:${k}`);
export const commentId = (issueKey: string, n: number) => sid(`issue-comment:${issueKey}:${n}`);

export const dueDate = (i: IssueSpec, today: Day): Day | null =>
  i.dueInDays === null ? null : addDays(today, i.dueInDays);
export const when = (today: Day, daysAgo: number, hour = 10): Date =>
  at(addDays(today, -daysAgo), hour);
