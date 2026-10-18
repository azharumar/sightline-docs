/* ================= Tabs and panels ================= */
const TABS = [
  ["A", "Capture"], ["B", "Item drawer"], ["C", "Section list"], ["AV", "Audit view"], ["D", "Hotel dashboard"], ["AW", "Admin"],
  ["E", "Issues list"], ["F", "Issue detail"], ["G", "Auditor home"], ["H", "Navigation"], ["HS", "Hotel switcher"], ["S", "Search"],
  ["BA", "Before and after"], ["SH", "Shell"], ["VS", "Visual system"],
];
const phone = (id, cap) => `<div class="stage-col"><div id="${id}"></div>${cap ? `<div class="caption">${cap}</div>` : ""}</div>`;
const laptop = (id, cap) => `<div class="stage-wide">${cap ? `<div class="caption">${cap}</div>` : ""}<div id="${id}"></div></div>`;
const notes = (items) => `<section class="notes"><h3>What changed and why</h3><ul>${items.map((x) => `<li>${x}</li>`).join("")}</ul></section>`;
const PANELS = {
  A: {
    h: "Capture", lede: "Tap an item to open it in the drawer, score it, then use Next. The list shows only each item's title and state. On laptop the drawer is a right panel, and keys 0 to 5, N, J and K work.",
    demo: `<span class="lbl">Demo</span><button class="btn btn-secondary btn-sm" data-demo="offline">Go offline</button><button class="btn btn-secondary btn-sm" data-demo="online">Back online</button>`,
    stage: phone("ph-A", "Phone, 390 px. In progress, 7 of 34 done.") + laptop("lap-A", "Laptop, 1280 px. Sections left, items centre, item panel right."),
    notes: ["The list shows only the title and the state: Not started, Done, or Observation needed when a score of 2 or below has no Observation, plus Critical. No score chips and no buttons, so 10 or more items fit on a phone screen.",
      "Opening an item opens the drawer: a bottom sheet on phone, a right panel on laptop. It holds the score, N/A, Observation, evidence, Raise issue and the optional fields, with Previous and Next, so the auditor moves through items without closing it.",
      "Close stays at the top left of capture. The audit name is the title, and search finds any item.",
      "No sync text. The cloud icon appears only when you are offline or changes are waiting, with a count badge. Tap it to see what is waiting. Use the demo buttons to try it.",
      "Issues are raised by hand from the drawer. Nothing is created on submit."],
  },
  B: {
    h: "Item drawer", lede: "The phone starts offline with 3 changes waiting, so the icon and badge show behind the drawer. Try Previous and Next, Raise issue and the evidence buttons.",
    stage: phone("ph-B", "Phone, 390 px, offline. Item HK-002."),
    notes: ["The drawer header has back at the top left, the item title (up to two lines), code, sub-section, Critical and an SOP link.",
      "The score control is the first thing in the drawer: six equal segments 48 px tall, with N/A beside them. A score of 2 or below marks Observation as required.",
      "Evidence, Raise issue and Team response sit below, always in the same order. Responded by, Team response, Reason and Recommendation stay behind one disclosure, because they are optional.",
      "Previous, the item position and Next stay in the footer, in thumb reach. On the last item, Next becomes Review answers."],
  },
  C: {
    h: "Section list", lede: "Tap the section title in the page header, or the search icon. Search covers sections and items. Type \"linen\" or \"KT-\".",
    stage: phone("ph-C", "Phone, 390 px. Section list open."),
    notes: ["The section list is a drawer with back at the top left, like every other drawer.",
      "Each section shows its done count, with the same dots used everywhere: green when done, blue ring when started, grey ring when not started.",
      "Search covers sections and items, so it still works with 30 sections or a 200 item audit template."],
  },
  AV: {
    h: "Audit view: submitted and locked", lede: "The same list and drawer as capture, read only. Open \"...\" for Revision history and Restart audit. Restarting asks for a reason, archives Revision 2 and reopens the audit as Revision 3.",
    stage: phone("ph-AV", "Phone, 390 px. September audit, Revision 2.") + laptop("lap-AV", "Laptop, 1280 px. Same audit, item panel open."),
    notes: ["A submitted audit uses the same item list and drawer as capture. The drawer is read only, with one exception: Raise issue still works after the audit.",
      "The header shows Submitted, Locked and \"Revision 2\". Tap Revision 2 to see who restarted the audit, when and why.",
      "Restart audit sits in the \"...\" or Actions menu and needs a reason. Earlier revisions are archived and can still be opened, read only.",
      "Back goes to Audits on phone and laptop. The laptop also shows breadcrumbs."],
  },
  D: {
    h: "Hotel dashboard", lede: "The Hotel Manager's home. Admin lands on the same dashboard after switching hotel, with back to Admin home. Use Long labels to test the number cards with long text and a long hotel name.",
    demo: `<span class="lbl">Demo</span><button class="btn btn-secondary btn-sm" data-demo="long" aria-pressed="false">Long labels</button><button class="btn btn-secondary btn-sm" data-demo="ws-loading">Loading state</button>`,
    stage: phone("ph-D", "Phone, 390 px. Priya Menon, Hotel Manager.") + laptop("lap-D", "Laptop, 1280 px. Select a row to change the right panel."),
    notes: ["\"Needs your attention\" comes first: overdue issues, then issues waiting for a team response.",
      "Number cards keep their shape: 88 px on phone and 96 px on laptop, in a strict grid. Labels and secondary text stay on one line with an ellipsis, the full text is in the tooltip, and values use tabular numbers.",
      "The top bar shows the hotel. A Hotel Manager with one hotel sees a plain name. Admin and Group Head get the switcher.",
      "On laptop: sidebar, breadcrumbs, a page header, then cards, a 40 px row table and an inspector with one action for the selected issue."],
  },
  AW: {
    h: "Admin workspace", lede: "Admin is Sightline staff. The workspace leads with the admin's jobs: scheduling and assignment, then masters, then clients and users. The hotels list shows the scale: 1,046 hotels grouped by 200 clients.",
    demo: `<span class="lbl">Demo</span><button class="btn btn-secondary btn-sm" data-demo="long" aria-pressed="false">Long labels</button>`,
    stage: phone("ph-AW", "Phone. Admin home.") + phone("ph-AW2", "Phone. Audits to schedule, list view.") + laptop("lap-AW", "Laptop. Admin home: scheduling queue with assign and reassign in the right panel.") + laptop("lap-AW2", "Laptop. Hotels list: 1,046 hotels, group by client with search across 200 clients, Load more."),
    notes: ["Scheduling comes first: every audit to schedule shows its hotel, client, audit template, date and auditor. Admin assigns, reassigns or cancels (with a reason) in a drawer on phone or the right panel on laptop. An assigned audit appears straight away in the auditor's list, ready to start. There is no response step.",
      "Masters are global, not per hotel: library items, audit templates and departments.",
      "Clients and users: client companies own hotels. Team members belong to a client. Auditors are Sightline staff or freelance.",
      "Scale: every record type uses the same list view, with search, quick filters, the filter builder, a searchable group-by sidebar and Load more, so 1,046 hotels and 200 clients stay workable.",
      "Opening a hotel lands on that hotel's dashboard, with back to Admin home."],
  },
  E: {
    h: "Issues list", lede: `One list pattern for every record type. Try the saved views (tap the title), quick filters, the filter builder, sort, search, Load more and New issue. Issues for Harbour View Hotel: ${ISSUES.length}.`,
    demo: `<span class="lbl">Demo</span><button class="btn btn-secondary btn-sm" data-demo="list-empty">Empty state</button><button class="btn btn-secondary btn-sm" data-demo="list-loading">Loading state</button><button class="btn btn-secondary btn-sm" data-demo="list-all">All issues with Load more</button>`,
    stage: phone("ph-E", "Phone. Saved view: Open issues.") + phone("ph-E2", "Phone. Filter builder open.") + laptop("lap-E", "Laptop, 1280 px. Group-by sidebar, column picker, New issue."),
    notes: ["The page header holds the saved view as the title, the count, \"...\" and one primary button: New issue. Issues are created by hand, from here or from an audit item.",
      "Search, Filter and Sort sit in one row, then quick filters for Status, Department and Assigned to. Every active filter shows as a removable chip.",
      "Department, Assigned to and Audit are link fields with search and recents. Selects are used only for short closed lists, such as status.",
      "Rows are 56 px on phone and 40 px on laptop. Load more shows \"20 of 49\"."],
  },
  F: {
    h: "Issue detail", lede: "Use the primary button to move the issue along. Phone and laptop share one state. Add a comment to see it in the timeline.",
    stage: phone("ph-F", "Phone, 390 px.") + laptop("lap-F", "Laptop, 1280 px."),
    notes: ["The header holds the title, status, issue number and due date, \"...\" at the top right, and one primary button for the next step: Start work, then Mark resolved.",
      "Change assignee, change due date, reopen and copy link are in \"...\" on phone and Actions on laptop.",
      "Finding, Team response and Details are sections that collapse, with 15/600 headings.",
      "The timeline starts with who raised the issue and from which audit item, then comments and every change."],
  },
  G: {
    h: "Auditor home", lede: "Auditors are Sightline staff or freelance, and see only the audits assigned to them. \"Continue audit\" opens Capture.",
    stage: phone("ph-G", "Phone, 390 px. Rohan Iyer, Auditor."),
    notes: ["The audit in progress comes first, with progress and one Continue audit button. No sync text.",
      "Admin assigns audits. They appear under Assigned to you, ready to start, with no response step.",
      "Assigned to you, then Submitted. The submitted Harbour View audit opens the locked audit view.",
      "The nav has Home, Audits and More. Auditors do not work on issues and never see other auditors' audits."],
  },
  H: {
    h: "Navigation", lede: "Pick a role to see its bottom nav and laptop sidebar. Open More, then Setup. Admin starts in review mode: tap the pill and choose a person to land on that person's dashboard.",
    demo: `<span class="lbl">Role</span>${Object.entries(ROLES).map(([k, l]) => `<button class="btn btn-secondary btn-sm" data-role="${k}" aria-pressed="${k === "admin"}">${l}</button>`).join("")}<button class="btn btn-secondary btn-sm" data-review aria-pressed="true">Review mode</button>`,
    stage: phone("ph-H", "Phone, 390 px.") + `<div class="stage-col"><div class="side-prev" id="side-H"></div><div class="caption">Laptop sidebar, same role.</div></div>`,
    notes: ["Roles: Admin is Sightline staff. Auditor is Sightline staff or freelance. The client team is Group Head, Hotel Manager, Department Head and Staff.",
      "The bottom nav has at most 4 items, each with a label. Admin: Home, Audits, Clients, More. Client roles: Home, Audits, Issues, More. Search is always in the top bar.",
      "Setup and masters live in one searchable list (More, then Setup), never in tabs.",
      "Review mode is a small floating pill. Choosing a person always lands on that person's dashboard."],
  },
  HS: {
    h: "Hotel switcher and link fields", lede: "For Sightline roles the switcher groups 1,046 hotels by client. Search by hotel, client, code or city. Picking a hotel lands on its dashboard. The second phone uses link fields in the Schedule audit form.",
    stage: phone("ph-HS", "Phone. Hotel switcher, grouped by client.") + phone("ph-HS2", "Phone. Schedule audit form."),
    notes: ["The hotel switcher is a link field: recent hotels first, then every hotel grouped under its client with a hotel count.",
      "Searching a client name lists all its hotels. Results cap at 60 with a prompt to keep typing, so it stays fast at 1,046 hotels.",
      "Switching hotel always lands on that hotel's dashboard.",
      "Every choice that grows (hotel, audit template, auditor, assignee, department) uses the same link field."],
  },
  S: {
    h: "Search", lede: "Phone: the search icon in every top bar. Laptop: Ctrl K or Cmd K, arrow keys and Enter. Try \"FO-004\", \"Coastline\", \"Kochi\" or \"Priya\".",
    stage: phone("ph-S", "Phone. Search open.") + laptop("lap-S", "Laptop, 1280 px. Press Ctrl K or Cmd K while this tab is open."),
    notes: ["One search reaches any issue, audit, hotel, client, audit template, user or department.",
      "Results are grouped by record type with counts. Each row has a line of context and its code.",
      "Opening a hotel from search lands on that hotel's dashboard."],
  },
  BA: {
    h: "Before and after: capture", lede: "Left: the current app on an iPhone in dark mode. Right: the redesign, live.",
    stage: `<div class="ba"><div class="stage-col"><img src="__BEFORE_IMG__" alt="Current capture screen: review mode bar, app header, audit header with Review button, section picker with arrows, three item cards each with code, Critical badge, SOP link, three icon buttons, a chevron and seven boxed score buttons, and a five item bottom nav." width="400" height="871"><div class="caption">Before</div></div>${phone("ph-BA", "After")}</div>
      <table class="metric"><thead><tr><th>Measure</th><th>Before</th><th>After</th></tr></thead><tbody>
      <tr><td>Chrome during capture</td><td>Review bar, app header, audit header, section picker, bottom nav: about 45% of the screen</td><td>52 px top bar and a 2 px progress line</td></tr>
      <tr><td>Targets per item on the list</td><td>11 boxed targets</td><td>1 row</td></tr>
      <tr><td>Items visible at once</td><td>About 3</td><td>About 9 rows</td></tr>
      <tr><td>Scoring</td><td>Inline on every card</td><td>In the drawer, with Previous and Next</td></tr>
      <tr><td>Sync status</td><td>Status text on screen at all times</td><td>Nothing when everything has uploaded. Icon with a count only when waiting or offline</td></tr>
      <tr><td>Largest phone text</td><td>About 22 px</td><td>18 px</td></tr>
      </tbody></table>`,
    notes: ["The structure changed: capture lost four layers of chrome, and scoring moved into a drawer.",
      "The list now answers one question: what is left. Each row shows its state, Not started or Done.",
      "Phone type is capped at 18 px. Hierarchy comes from weight and space, not size."],
  },
};

function shellHtml() {
  const rules = [
    ["Top bar", "Phone 52 px: back chevron at the top left (Close in capture), then the context title, actions, and search last. The role's home has no back.", "48 px: back with the parent name, breadcrumbs, actions, and search (Ctrl K) last."],
    ["Page header", "Title 18/600 with count or status, \"...\" at the top right, meta line 12, then one primary button, full width.", "Title 24/600 with count or status, then the primary button, then Actions. Meta line 14 below."],
    ["Content", "16 px gutters. Section headings 15/600, 44 px. Rows 56 px (two lines) or 48 px (one line).", "24 px gutters. Section headings 15/600. Table rows 40 px. Group-by sidebar 240 px."],
    ["Lists", "Title is the saved view, then search, Filter and Sort, quick filter chips, list meta, rows and Load more.", "Same order, plus Columns and a group-by sidebar with counts."],
    ["Drawers", "Bottom sheet with a 14 px top radius. Back at the top left, title 15/600, one optional text action on the right, footer for the drawer's actions.", "Right panel 360 to 400 px, or a popover for short forms."],
    ["Number cards", "88 px, two per row. One-line label and secondary text with an ellipsis, value 18/600 in tabular numbers.", "96 px, four or five per row. Value 24/600."],
    ["States", "Empty: icon 24, title 15/600, one line, one action. Loading: skeleton rows of the same height. No sync text: icon with a count only when waiting or offline.", "Same."],
    ["Navigation", "Bottom nav, at most 4 items, with labels. More holds the rest. Setup is a searchable list.", "Left sidebar grouped by module. Hotel switcher at the top for roles with more than one hotel."],
    ["Exception", "Capture is a focus mode: Close instead of back, no bottom nav, and a sticky Next section button.", "No sidebar. Sections, items and the item panel in three columns."],
  ];
  const audit = [
    ["Capture", "Close", "Section, count, \"...\"", "Next section (sticky)"], ["Item drawer", "Back", "Title, code, SOP", "Next (footer)"], ["Section list", "Back", "Sections, count", "None"],
    ["Audit view", "Back", "Section, Submitted, Revision 2", "None (locked)"], ["Hotel dashboard", "None (home)", "Home", "None"], ["Admin home", "None (home)", "Home", "Schedule audit"],
    ["Audits to schedule", "Back", "Saved view, count", "Schedule audit"], ["Issues list", "Back", "Saved view, count", "New issue"], ["Issue detail", "Back", "Title, status", "Start work"],
    ["Auditor home", "None (home)", "Home", "None"], ["Schedule audit", "Back", "Schedule audit", "Schedule audit"], ["Hotels list (laptop)", "Back", "Hotels, count", "New hotel"],
  ];
  return `<div class="stage">${phone("ph-SH", "Phone frame zones on the Issues list.")}${laptop("lap-SH", "Laptop frame zones on the Hotels list.")}</div>
    <div class="vs" style="margin-top:32px"><section class="vs-sec"><h3>Frame rules</h3><p>Every screen uses the same frame, in the same order: top bar, page header, content. Drawers and states are shared.</p>
    <div class="vs-box"><table class="vs-tbl"><thead><tr><th>Part</th><th>Phone</th><th>Laptop</th></tr></thead><tbody>${rules.map((r) => `<tr><td class="fg" style="font-weight:500">${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join("")}</tbody></table></div></section>
    <section class="vs-sec"><h3>Screen check</h3><p>Every screen in these mockups, checked against the frame. The Playwright check also confirms the back control and the 18 px cap automatically.</p>
    <div class="vs-box"><table class="vs-tbl"><thead><tr><th>Screen</th><th>Top left</th><th>Page header</th><th>Primary</th></tr></thead><tbody>${audit.map((r) => `<tr>${r.map((c, i) => `<td${i ? "" : ' class="fg"'}>${c}</td>`).join("")}</tr>`).join("")}</tbody></table></div></section></div>`;
}
function tagZones(root) {
  root.querySelectorAll(".zone-tag").forEach((t) => t.remove());
  root.querySelectorAll("[data-zone]").forEach((z) => { const t = el("span", "zone-tag"); t.textContent = z.dataset.zone; t.style.bottom = "2px"; z.append(t); });
}

function vsHtml() {
  const sw = (v, l) => `<div class="sw"><i style="background:var(--${v})"></i><b>${l}</b><span>--${v}</span></div>`;
  return `<div class="vs">
  <section class="vs-sec"><h3>Type scale</h3><p>Phone uses the zarnik-ds compact steps and never goes above 18 px. Laptop keeps the desk scale. Weights 400, 500 and 600. Sentence case. Tabular numbers for scores, dates and counts.</p>
    <div class="vs-box"><table class="vs-tbl"><thead><tr><th>Role</th><th>Phone</th><th>Laptop</th><th>Used for</th></tr></thead><tbody>
    <tr><td>Page title</td><td><code>18 / 600</code></td><td><code>24 / 600 / -0.025em</code></td><td>Page header title</td></tr>
    <tr><td>Section title</td><td><code>15 / 600</code></td><td><code>15 / 600</code></td><td>Section headings, drawer titles, empty state titles</td></tr>
    <tr><td>Body and list title</td><td><code>14 / 400 and 500</code></td><td><code>14 / 400 and 500</code></td><td>Rows, fields, buttons, top bar title</td></tr>
    <tr><td>Meta</td><td><code>12 / 400 and 500</code></td><td><code>12</code> captions, <code>14</code> meta lines</td><td>Row second line, labels, chips, bottom nav</td></tr>
    <tr><td>Inputs</td><td><code>16</code></td><td><code>14</code></td><td>16 on phone so iPhone Safari does not zoom on focus</td></tr>
    <tr><td>Card value</td><td><code>18 / 600</code></td><td><code>24 / 600</code></td><td>Number cards</td></tr></tbody></table></div>
    <div class="vs-type phone-scale" style="margin-top:16px">
      <div><span class="spec">Phone page title, 18 / 600</span><span class="ph-t">Rooms & Housekeeping</span></div>
      <div><span class="spec">Phone section title, 15 / 600</span><span class="h2">Needs your attention</span></div>
      <div><span class="spec">Phone body and list title, 14</span><span style="font-size:14px;color:var(--fg);font-weight:500">Check-out and billing accuracy</span></div>
      <div><span class="spec">Phone meta, 12</span><span style="font-size:12px;color:var(--text-3)" class="num">Open · ISS-1001 · Front Office & Guest Services</span></div>
    </div></section>

  <section class="vs-sec"><h3>Colour</h3><p>Neutral interface, one near-black primary. The brand orange is the logo mark and the capture progress line only. Score, band and status colours appear only as dots and small chips.</p>
    <div class="vs-row">${sw("bg", "Page")}${sw("sidebar", "Sidebar")}${sw("muted", "Muted fill")}${sw("line", "Hairline")}${sw("text-3", "Muted text")}${sw("text", "Body text")}${sw("fg", "Heading text")}${sw("primary", "Primary")}${sw("brand", "Brand mark")}</div>
    <p style="margin:24px 0 8px" class="t3">Status: dot plus label in lists and the timeline. Muted pill with a dot in headers.</p>
    <div class="vs-row">${stat("open")}${stat("progress")}${stat("resolved")}${stat("redflag")}<span class="sep">|</span>${pill("open")}${pill("progress")}${pill("resolved")}${pill("redflag")}</div>
    <p style="margin:24px 0 8px" class="t3">Item state on audit lists. Scores show only inside the drawer.</p>
    <div class="vs-row"><span class="status"><span class="dot dot-ring"></span>Not started</span><span class="status"><span class="dot st-resolved"></span>Done</span><span class="status warn"><span class="dot st-open"></span>Observation needed</span><span class="crit" style="font-size:12px">Critical</span></div>
    <p style="margin:24px 0 8px" class="t3">Scores 0 to 5 and N/A as small chips in the drawer and reports. Bands as dot plus label.</p>
    <div class="vs-row">${[0, 1, 2, 3, 4, 5].map(scoreChip).join("")}${scoreChip("na")}<span class="sep">|</span>${bandTag(92)}${bandTag(78)}${bandTag(66)}${bandTag(48)}</div></section>

  <section class="vs-sec"><h3>Spacing, radius and depth</h3><p>4 px grid. Gutters 16 px on phone, 24 px on laptop. 32 px between blocks, 16 inside a block, 12 between fields, 8 between actions.</p>
    <div style="display:grid;gap:8px">${[4, 8, 12, 16, 24, 32, 48].map((n) => `<div class="sp"><i style="width:${n}px"></i><span class="num">${n}</span></div>`).join("")}</div>
    <div class="vs-row" style="margin-top:24px">
      <div style="width:120px;height:44px;border:1px solid var(--input);border-radius:var(--r-ctl);display:grid;place-items:center" class="t3">Control 10</div>
      <div style="width:160px;height:80px;border:1px solid var(--line);border-radius:var(--r-panel);display:grid;place-items:center" class="t3">Panel 14</div>
      <div style="width:160px;height:80px;background:var(--surface);border-radius:var(--r-panel);box-shadow:var(--shadow-overlay);display:grid;place-items:center" class="t3">Popover shadow</div>
      <div style="width:160px;height:80px;background:var(--surface);border-radius:var(--r-panel);box-shadow:var(--shadow-modal);display:grid;place-items:center" class="t3">Drawer shadow</div>
    </div></section>

  <section class="vs-sec phone-scale"><h3>Buttons, inputs and the score control (phone)</h3><p>One primary per screen. Phone controls are 44 px. Laptop chrome is 32 px and fields 36 px.</p>
    <div class="vs-row"><button class="btn btn-primary">Start work</button><button class="btn btn-secondary">Previous</button><button class="btn btn-ghost">Cancel</button><button class="btn-text" style="margin:0">${ic("plus")}Raise issue</button><button class="btn btn-danger">Restart audit</button><button class="btn btn-primary" disabled>Schedule audit</button></div>
    <div class="vs-row" style="margin-top:12px"><span class="qchip on"><button>Status is not Resolved</button><button aria-label="Remove">${ic("x")}</button></span><button class="qchip">Department${ic("chevronDown")}</button><span class="pill">Revision 2</span></div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;margin-top:16px;max-width:900px">
      <label class="fld" style="margin:0"><span class="fld-l">Text</span><input class="input" value="Latha Krishnan"></label>
      <div class="fld" style="margin:0"><span class="fld-l">Link field</span><button class="input link-in"><span class="v">Harbour View Hotel</span>${ic("chevronsUpDown")}</button></div>
      <label class="fld" style="margin:0"><span class="fld-l">Select (closed lists only)</span><select class="input"><option>is</option><option>is not</option></select></label>
    </div>
    <div style="max-width:358px;margin-top:16px"><div class="score-row"><div class="seg">${[0, 1, 2, 3, 4, 5].map((v) => `<button class="seg-b ${v === 4 ? "on" : ""}">${v}</button>`).join("")}</div><button class="na">N/A</button></div></div></section>

  <section class="vs-sec phone-scale"><h3>Rows, number cards, drawer and states (phone)</h3><p>Rows 56 px or 48 px. Number cards 88 px, two per row, with the long-label test shown in the second card.</p>
    <div class="vs-row" style="align-items:flex-start">
      <div class="vs-box" style="width:358px">${issueRow(FX.f)}<button class="row done"><span class="row-main"><span class="row-t">Cleanliness and smell</span><span class="row-s"><span class="status"><span class="dot st-resolved"></span>Done</span></span></span>${ic("chevronRight", "ic-16")}</button><button class="row"><span class="row-main"><span class="row-t">Door, lock and safety notice</span><span class="row-s"><span class="status"><span class="dot dot-ring"></span>Not started</span><span class="sep">·</span><span class="crit">Critical</span></span></span>${ic("chevronRight", "ic-16")}</button></div>
      <div style="width:358px">${ncards([{ k: "Property score", v: 78, s: '<span class="dot b-good"></span>Good · Up 4 since June' }, { k: "Waiting for team response from department heads", v: 2, s: "Oldest is 6 days overdue, Front Office & Guest Services" }]).replace('class="ncards ', 'style="margin:0" class="ncards ')}</div>
      <div class="vs-box" style="width:358px;border-radius:var(--r-panel) var(--r-panel) 0 0;box-shadow:var(--shadow-modal);background:var(--surface)"><div class="sheet-handle"></div>${sheetHead("Sections", '<span class="num">7 of 34 done</span>')}<div class="sec-row cur"><span class="dot dot-half"></span><span class="sec-n">Rooms & Housekeeping</span><span class="sec-c num">0 of 5</span></div><div class="sec-row" style="border:0"><span class="dot st-resolved"></span><span class="sec-n">Front Office & Guest Services</span><span class="sec-c num">4 of 4</span></div></div>
      <div class="vs-box" style="width:358px">${emptyState("filter", "No issues match", "Nothing matches these filters.", '<button class="btn btn-secondary btn-sm">Clear filters</button>')}${skRows(2)}<div style="display:flex;gap:12px;align-items:center;padding:12px 16px"><span class="t3" style="font-size:12px">Sync icon, only when needed:</span><span class="icon-btn" style="color:var(--text-2)">${ic("cloudOff")}<span class="badge num">3</span></span><span class="icon-btn" style="color:var(--text-2)">${ic("uploadCloud")}<span class="badge num">1</span></span></div></div>
    </div></section>

  <section class="vs-sec"><h3>Source</h3><p>Every value comes from zarnik-ds at commit 99988d1, portal desk layer, plus Sightline's score, band and status colours (blueprint p2-23), mixed only from zarnik-ds hues.</p>
    <div class="vs-box"><table class="vs-tbl"><thead><tr><th>Token</th><th>Light</th><th>Dark</th><th>File</th></tr></thead><tbody>
    ${[["Font", "Noto Sans 400, 500, 600", "same", "tokens/typography.css, tokens/fonts.css"], ["Phone type steps", "18, 15, 14, 12", "same", "tokens/typography.css (h3 17 not used; label-sm 13 not used)"], ["Laptop type steps", "24, 15, 14, 12", "same", "tokens/desk.css desk-page-title, desk-body, desk-caption"], ["Page ground", "oklch(1 0 0)", "oklch(0.145 0 0)", "tokens/desk.css --surface-page"], ["Card, drawer", "oklch(1 0 0)", "oklch(0.205 0 0)", "tokens/desk.css --surface-card"], ["Sidebar", "oklch(0.985 0 0)", "oklch(0.205 0 0)", "tokens/desk.css --sidebar"], ["Muted fill", "oklch(0.97 0 0)", "oklch(0.269 0 0)", "tokens/desk.css --muted"], ["Heading text", "oklch(0.145 0 0)", "oklch(0.985 0 0)", "tokens/desk.css --n-900"], ["Body text", "oklch(0.3 0 0)", "oklch(0.87 0 0)", "tokens/desk.css --n-700"], ["Muted text", "oklch(0.5 0 0)", "oklch(0.708 0 0)", "tokens/desk.css --n-500"], ["Hairline", "oklch(0.922 0 0)", "white at 10%", "tokens/desk.css --border"], ["Primary", "oklch(0.205 0 0)", "oklch(0.922 0 0)", "tokens/desk.css --primary"], ["Brand mark", "oklch(0.67 0.224 41.116)", "same", "tokens/desk.css --brand, assets/icon.svg"], ["Radius", "control 10, panel and drawer 14, pill 999", "", "tokens/desk.css section 2"], ["Heights", "chrome 32, field 36, row 40, touch 44, tab bar 56", "", "tokens/desk.css section 3, tokens/spacing.css"], ["Shadow", "popover and drawer only", "", "tokens/desk.css"], ["Icons", "Lucide, stroke 2", "", "readme.md section 4"]].map((r) => `<tr><td>${r[0]}</td><td><code>${r[1]}</code></td><td><code>${r[2]}</code></td><td>${r[3]}</td></tr>`).join("")}
    </tbody></table></div></section>
  </div>`;
}

/* ================= Tabs, theme, init ================= */
const COMPS = {};
function showTab(id) {
  if (!TABS.some((t) => t[0] === id)) id = "A";
  document.querySelectorAll(".tab").forEach((t) => t.setAttribute("aria-selected", t.dataset.tab === id));
  document.querySelectorAll(".panel").forEach((p) => p.classList.toggle("on", p.dataset.panel === id));
  const tab = document.querySelector(`.tab[data-tab="${id}"]`); if (tab) tab.scrollIntoView({ block: "nearest", inline: "nearest" });
  if (location.hash !== "#" + id) history.replaceState(null, "", "#" + id);
  const top = document.querySelector(".page-head").offsetHeight + 24; if (window.scrollY > top) window.scrollTo({ top });
  fitLaptops();
  (COMPS[id] || []).forEach((c) => { if (!c._shown) { c._shown = true; if (c.firstShow) c.firstShow(); } else if (c.refreshOnShow) c.render(); });
}
function fitLaptops() {
  document.querySelectorAll(".panel.on .lap-wrap").forEach((w) => { const s = Math.min(1, w.clientWidth / 1280); w.firstChild.style.transform = `scale(${s})`; w.style.height = 800 * s + 2 + "px"; });
}
function init() {
  document.getElementById("tabs").innerHTML = TABS.map(([id, l]) => `<button class="tab" role="tab" data-tab="${id}" aria-selected="false">${l}</button>`).join("");
  document.getElementById("panels").innerHTML = TABS.map(([id, l]) => {
    if (id === "VS") return `<section class="panel" data-panel="VS" role="tabpanel"><h2 class="panel-h">Visual system</h2><p class="lede">The approved look becomes the design system spec. Switch light and dark at the top of the page.</p>${vsHtml()}</section>`;
    if (id === "SH") return `<section class="panel" data-panel="SH" role="tabpanel"><h2 class="panel-h">Shell</h2><p class="lede">One frame for every screen: top bar, page header, content. Zones are outlined in orange.</p>${shellHtml()}</section>`;
    const p = PANELS[id];
    return `<section class="panel" data-panel="${id}" role="tabpanel"><h2 class="panel-h">${p.h}</h2><p class="lede">${p.lede}</p>${p.demo ? `<div class="demo">${p.demo}</div>` : ""}<div class="stage">${p.stage}</div>${notes(p.notes)}</section>`;
  }).join("");
  const $ = (id) => document.getElementById(id);
  const reg = (tab, c, refresh) => { c.refreshOnShow = !!refresh; (COMPS[tab] ||= []).push(c); return c; };
  const capA = reg("A", new CapturePhone($("ph-A"), { onClose: () => showTab("G") }));
  reg("A", new CaptureLaptop($("lap-A")));
  reg("B", new CapturePhone($("ph-B"), { offline: true, extra: [["HK-001", 4, 1]], openItem: "HK-002" }));
  reg("C", new CapturePhone($("ph-C"), { openSections: true }));
  reg("AV", new CapturePhone($("ph-AV"), { mode: "submitted" }));
  reg("AV", new CaptureLaptop($("lap-AV"), { mode: "submitted", sel: "FO-004" }));
  const dP = reg("D", new HotelDashPhone($("ph-D")), true);
  reg("D", new HotelDashLaptop($("lap-D")), true);
  reg("AW", new AdminHomePhone($("ph-AW")), true);
  reg("AW", new ScheduleListPhone($("ph-AW2")), true);
  reg("AW", new AdminHomeLaptop($("lap-AW")), true);
  reg("AW", new HotelsListLaptop($("lap-AW2")));
  const lE = reg("E", new IssueListPhone($("ph-E")), true);
  reg("E", new IssueListPhone($("ph-E2"), { openBuilder: true }));
  const lapE = reg("E", new IssueListLaptop($("lap-E")), true);
  lapE.firstShow = () => lapE.a_lcols(lapE.lap.querySelector('[data-act="lcols"]'));
  reg("F", new IssueDetailPhone($("ph-F")));
  reg("F", new IssueDetailLaptop($("lap-F")));
  reg("G", new AuditorHome($("ph-G")));
  const nav = reg("H", new NavDemo($("ph-H")));
  nav.side = $("side-H"); nav.render();
  const hs = reg("HS", new AdminHomePhone($("ph-HS")));
  hs.a_hotel(); hs.vp.querySelectorAll(".sheet,.scrim").forEach((x) => x.classList.add("on"));
  reg("HS", new ScheduleFormPhone($("ph-HS2")));
  const sp = reg("S", new HotelDashPhone($("ph-S")));
  paletteSheet(sp.vp, { instant: true });
  const lapS = reg("S", new HotelDashLaptop($("lap-S")));
  lapS.firstShow = () => lapS.openPalette();
  reg("BA", new CapturePhone($("ph-BA"), { onClose: () => showTab("G") }));
  const shP = new IssueListPhone($("ph-SH")), shL = new HotelsListLaptop($("lap-SH"));
  [shP.root, shL.root].forEach((r) => { r.classList.add("shell-demo"); tagZones(r); r.addEventListener("click", () => setTimeout(() => tagZones(r), 60)); });

  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-tab]"); if (t && t.classList.contains("tab")) showTab(t.dataset.tab);
    const d = e.target.closest("[data-demo]");
    if (d) {
      const k = d.dataset.demo;
      if (k === "offline") capA.setOnline(false);
      if (k === "online") capA.setOnline(true);
      if (k === "ws-loading") dP.showLoading();
      if (k === "long") { CTX.long = !CTX.long; document.querySelectorAll('[data-demo="long"]').forEach((b) => b.setAttribute("aria-pressed", CTX.long)); [...(COMPS.D || []), ...(COMPS.AW || [])].forEach((c) => c.render()); fitLaptops(); }
      if (k === "list-empty") { lE.filters = [{ f: "who", c: "is", v: "Asha Kumari" }, { f: "dept", c: "is", v: "Safety, Security & Compliance" }]; lE.reload(); }
      if (k === "list-loading") lE.reload();
      if (k === "list-all") { lE.filters = []; lE.reload(); }
    }
    const r = e.target.closest("[data-role]"); if (r) { nav.vp.querySelectorAll(".sheet,.scrim").forEach((x) => x.remove()); nav.role = r.dataset.role; nav.render(); syncNavDemo(nav); }
    const rv = e.target.closest("[data-review]"); if (rv) { nav.vp.querySelectorAll(".sheet,.scrim").forEach((x) => x.remove()); nav.review = !nav.review; if (nav.review) nav.role = "admin"; nav.render(); syncNavDemo(nav); }
    const th = e.target.closest("[data-theme-set]");
    if (th) {
      const v = th.dataset.themeSet;
      if (v === "system") document.documentElement.removeAttribute("data-theme"); else document.documentElement.setAttribute("data-theme", v);
      document.querySelectorAll("[data-theme-set]").forEach((b) => b.setAttribute("aria-pressed", b === th));
    }
  });
  document.addEventListener("keydown", (e) => {
    const panel = document.querySelector(".panel.on"); if (!panel) return;
    const lapApp = LAPS.find((l) => panel.contains(l.root) && !l.root.classList.contains("shell-demo"));
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k" && lapApp) { e.preventDefault(); if (lapApp.pal) lapApp.pal.close(); else lapApp.openPalette(); return; }
    if (e.key === "Escape" && lapApp) { if (lapApp.pal) lapApp.pal.close(); lapApp.closePop(); return; }
    if (lapApp && lapApp.key && !e.metaKey && !e.ctrlKey) { lapApp.key(e); }
    if (e.key === "/" && lapApp && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { const q = lapApp.lap.querySelector("[data-q]"); if (q) { e.preventDefault(); q.focus(); } }
  });
  window.addEventListener("resize", fitLaptops);
  showTab((location.hash || "#A").slice(1));
}
init();
