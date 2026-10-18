/* ================= Shared context ================= */
const CTX = { hotel: HOTELS[0], long: false, viewer: "manager" };
const hotelName = () => (CTX.long ? LONG_HOTEL.n : CTX.hotel.n);
const ROLES = { admin: "Admin", auditor: "Auditor", group: "Group Head", manager: "Hotel Manager", dept: "Department Head", staff: "Staff" };
const ROLE_NOTE = { admin: "Sightline staff", auditor: "Sightline staff or freelance", group: "Client team", manager: "Client team", dept: "Client team", staff: "Client team" };

/* ================= Overlays ================= */
function openSheet(vp, html, o = {}) {
  const scrim = el("div", "scrim"), sh = el("div", "sheet" + (o.full ? " sheet-full" : "") + (o.cls ? " " + o.cls : ""));
  scrim.style.zIndex = ++Z; sh.style.zIndex = ++Z;
  sh.setAttribute("role", "dialog"); sh.setAttribute("aria-modal", "true");
  if (o.label) sh.setAttribute("aria-label", o.label);
  sh.innerHTML = '<div class="sheet-handle"></div>' + html;
  vp.append(scrim, sh);
  const api = {
    el: sh, closed: false,
    close() {
      if (api.closed) return; api.closed = true;
      scrim.classList.remove("on"); sh.classList.remove("on");
      setTimeout(() => { scrim.remove(); sh.remove(); }, 260);
      o.onClose && o.onClose();
    },
  };
  scrim.addEventListener("click", api.close);
  sh.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) { e.stopPropagation(); api.close(); } });
  if (o.instant) { scrim.classList.add("on"); sh.classList.add("on"); }
  else requestAnimationFrame(() => requestAnimationFrame(() => { scrim.classList.add("on"); sh.classList.add("on"); }));
  return api;
}
function toast(host, msg) {
  let t = host.querySelector(":scope > .toast");
  if (!t) { t = el("div", "toast"); t.setAttribute("role", "status"); host.append(t); }
  t.style.zIndex = 9999; t.textContent = msg; t.classList.add("on");
  clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove("on"), 2600);
}
/* Every drawer and sheet: back chevron top left, title, one optional action on the right. */
const backBtn = (label = "Back", attrs = "data-close") => `<button class="icon-btn" data-back ${attrs} aria-label="${esc(label)}">${ic("chevronLeft")}</button>`;
const sheetHead = (title, sub, right = "", o = {}) => `<div class="sh-head">${o.back || backBtn("Back")}<div class="grow sh-tt"><div class="sh-title ${o.wrap ? "wrap" : "trunc"}">${title}</div>${sub ? `<div class="sh-sub">${sub}</div>` : ""}</div>${right}</div>`;
const secH = (t, right = "") => `<div class="sec-h"><h2 class="h2 trunc">${t}</h2>${right}</div>`;
const emptyState = (icon, t, s, action = "") => `<div class="empty">${ic(icon)}<p class="empty-t">${t}</p>${s ? `<p class="empty-s">${s}</p>` : ""}${action}</div>`;
const skRows = (n) => Array.from({ length: n }, () => `<div class="sk-row" aria-hidden="true"><span class="row-main"><span class="sk" style="height:14px;width:70%"></span><span class="sk" style="height:12px;width:45%;margin-top:6px"></span></span><span class="sk" style="height:12px;width:56px"></span></div>`).join("");
const menuRows = (items) => items.map(([i, l, act, msg, cls]) => `<button class="menu-row ${cls || ""}" data-act="${act}" ${msg ? `data-msg="${esc(msg)}"` : ""}>${ic(i)}${l}</button>`).join("");

/* Number cards: set height, one-line label with full text in title, tabular value, one-line secondary. */
function ncards(cards, cls = "") {
  return `<div class="ncards ${cls}">${cards.map((c) => `<button class="ncard" data-act="${c.act || "toast"}" ${c.tab ? `data-tab="${c.tab}"` : ""} data-msg="${esc(c.msg || "Opens " + c.k)}" title="${esc(c.k)}: ${esc(String(c.v))}${c.st ? ". " + esc(c.st) : ""}"><span class="nc-k">${esc(c.k)}</span><span class="nc-v num">${c.v}</span>${c.s ? `<span class="nc-s">${c.s}</span>` : ""}</button>`).join("")}</div>`;
}

/* ================= Link field picker ================= */
function linkPicker(container, o) {
  container.innerHTML = `<div class="sh-search"><label class="search">${ic("search")}<input class="input ${o.small ? "md" : ""}" type="search" placeholder="${esc(o.placeholder)}" aria-label="${esc(o.placeholder)}" autocomplete="off"></label></div><div class="lp-list"></div>`;
  const input = container.querySelector("input"), list = container.querySelector(".lp-list");
  const row = (it) => { const r = o.row(it); return `<button class="lp-row" data-pick="${esc(o.key(it))}"><span class="row-main"><span class="lp-t trunc">${esc(r.t)}</span>${r.s ? `<span class="row-s trunc">${esc(r.s)}</span>` : ""}</span>${o.key(it) === o.current ? ic("check") : ""}</button>`; };
  const grouped = (arr) => {
    if (!o.group) return arr.map(row).join("");
    let h = "", last = null;
    arr.forEach((it) => { const g = o.group(it); if (g !== last) { h += `<div class="lp-grp client"><span class="trunc">${esc(g)}</span><span class="num">${o.groupCount ? o.groupCount(g) : ""}</span></div>`; last = g; } h += row(it); });
    return h;
  };
  const draw = () => {
    const q = input.value.trim().toLowerCase(); let h = "";
    const lim = o.limit || 400;
    if (!q) {
      if (o.recents && o.recents.length) h += `<div class="lp-grp">Recent</div>` + o.recents.map(row).join("");
      h += `<div class="lp-grp"><span>${o.allLabel}</span><span class="num">${o.items.length.toLocaleString("en-IN")}</span></div>` + grouped(o.items.slice(0, lim));
      if (o.items.length > lim) h += `<p class="lp-more num">Showing ${lim} of ${o.items.length.toLocaleString("en-IN")}. Search to find the rest.</p>`;
    } else {
      const m = o.items.filter((it) => o.text(it).toLowerCase().includes(q));
      h += m.length ? `<div class="lp-grp num">${m.length.toLocaleString("en-IN")} ${m.length === 1 ? "match" : "matches"}</div>` + grouped(m.slice(0, 60)) + (m.length > 60 ? `<p class="lp-more num">Showing 60 of ${m.length.toLocaleString("en-IN")}. Keep typing to narrow the list.</p>` : "")
        : emptyState("search", `No match for "${esc(input.value.trim())}"`, o.emptyHint || "Check the spelling.");
    }
    list.innerHTML = h;
  };
  input.addEventListener("input", draw); draw();
  container.addEventListener("click", (e) => {
    const b = e.target.closest("[data-pick]"); if (!b) return;
    const it = [...(o.recents || []), ...o.items].find((x) => o.key(x) === b.dataset.pick);
    if (it) o.onPick(it);
  });
  if (o.focus) setTimeout(() => input.focus({ preventScroll: true }), 280);
  return { input };
}
function pickerSheet(vp, o) {
  const s = openSheet(vp, sheetHead(o.title, o.sub) + `<div class="sh-body lp"></div>` + (o.footer || ""), { full: true, instant: o.instant, label: o.title });
  linkPicker(s.el.querySelector(".lp"), { ...o, onPick: (it) => { s.close(); o.onPick(it); } });
  return s;
}
/* Hotel switcher. Sightline roles see every hotel grouped by client. */
const hotelOpts = (cur, onPick, scope = "sightline") => {
  const items = scope === "sightline" ? HOTELS_BY_CLIENT : HOTELS.filter((h) => h.g === CLIENTS[0]);
  return {
    title: "Switch hotel", sub: scope === "sightline" ? `${HOTELS.length.toLocaleString("en-IN")} hotels · ${CLIENTS.length} clients` : CLIENTS[0],
    placeholder: "Search hotel, client, code or city", allLabel: scope === "sightline" ? "All hotels by client" : "Hotels",
    recents: HOTELS.slice(0, 3), items, key: (x) => x.c, current: cur, limit: 120,
    group: scope === "sightline" ? (x) => x.g : null, groupCount: (g) => `${hotelCount(g)} hotels`,
    row: (x) => ({ t: x.n, s: `${x.c} · ${x.city}${scope === "sightline" ? " · " + x.g : ""}` }), text: (x) => `${x.n} ${x.c} ${x.city} ${x.g}`,
    emptyHint: "Search by hotel, client, code or city.", onPick,
  };
};
const peopleOpts = (title, items, cur, onPick) => ({
  title, placeholder: "Search people", allLabel: "People", recents: items.slice(0, 2), items, key: (x) => x.n, current: cur,
  row: (x) => ({ t: x.n, s: `${x.r} · ${x.h}` }), text: (x) => `${x.n} ${x.r} ${x.h}`, onPick,
});
const auditorOpts = (cur, onPick) => ({
  title: "Auditor", placeholder: "Search auditors", allLabel: "Auditors", recents: AUDITORS.slice(0, 2), items: AUDITORS, key: (x) => x.n, current: cur,
  row: (x) => ({ t: x.n, s: `${x.h} · ${x.open} open ${x.open === 1 ? "audit" : "audits"}` }), text: (x) => `${x.n} ${x.h}`, onPick,
});
const deptOpts = (cur, onPick) => ({
  title: "Department", placeholder: "Search departments", allLabel: "Departments", recents: [DEPTS[2], DEPTS[1]], items: DEPTS, key: (x) => x, current: cur,
  row: (x) => ({ t: x, s: `${ITEMS.filter((i) => i.dept === x).length} items in Ops & Quality` }), text: (x) => x, onPick,
});
const auditOpts = (cur, onPick) => ({
  title: "Audit", placeholder: "Search audits", allLabel: "Audits", recents: [AUDIT_NAMES[0]], items: AUDIT_NAMES, key: (x) => x, current: cur,
  row: (x) => ({ t: x, s: "Harbour View Hotel" }), text: (x) => x, onPick,
});
const templateOpts = (cur, onPick) => ({
  title: "Audit template", placeholder: "Search audit templates", allLabel: "Audit templates", recents: [], items: TEMPLATES.map((t) => t[0]), key: (x) => x, current: cur,
  row: (x) => ({ t: x, s: `${TEMPLATES.find((t) => t[0] === x)[1]} items` }), text: (x) => x, onPick,
});

/* Switching hotel always lands on that hotel's dashboard. */
function goHotel(h, viewer) {
  CTX.hotel = h; CTX.long = false; if (viewer) CTX.viewer = viewer;
  (COMPS.D || []).forEach((c) => c.render());
  showTab("D");
  const d = (COMPS.D || [])[0]; if (d) toast(d.vp, `Switched to ${h.n}`);
}

/* ================= Search (command palette) ================= */
const PAGES = [
  { type: "Page", t: "Issues", s: "All issues for this hotel", i: "circleDot", go: "E" },
  { type: "Page", t: "Audits", s: "Audits for this hotel", i: "clipboard" },
  { type: "Page", t: "Home", s: "Your workspace", i: "home", go: "D" },
  { type: "Page", t: "Reports", s: "Full and summary PDF reports", i: "fileText" },
  { type: "Page", t: "Score history", s: "Scores over time", i: "chart" },
  { type: "Page", t: "Users", s: "People with access to this hotel", i: "users" },
  { type: "Page", t: "Settings", s: "Your account", i: "settings" },
];
const TYPE_ORDER = [["Issue", "Issues"], ["Audit", "Audits"], ["Hotel", "Hotels"], ["Client", "Clients"], ["Audit template", "Audit templates"], ["User", "Users"], ["Department", "Departments"], ["Page", "Pages"]];
const IDX = [
  ...ISSUES.map((f) => ({ type: "Issue", t: f.label, s: `${f.code} · ${f.audit}`, meta: f.iid, st: f.status, i: "circleDot", go: f.code === "FO-004" && f.audit === AUD.sep ? "F" : null })),
  ...AUDITS.map((a) => ({ type: "Audit", t: a.t, s: a.s, i: "clipboard", go: a.go })),
  ...HOTELS.map((x) => ({ type: "Hotel", t: x.n, s: `${x.city} · ${x.g}`, meta: x.c, i: "building", hotel: x })),
  ...CLIENTS.map((c) => ({ type: "Client", t: c, s: `${hotelCount(c)} hotels`, i: "briefcase" })),
  ...TEMPLATES.map(([t, n]) => ({ type: "Audit template", t, s: `${n} items`, i: "library" })),
  ...PEOPLE.map((p) => ({ type: "User", t: p.n, s: `${p.r} · ${p.h}`, i: "user" })),
  ...DEPTS.map((d) => ({ type: "Department", t: d, s: `${ITEMS.filter((i) => i.dept === d).length} items`, i: "layers" })),
  ...PAGES,
];
const RECENT = [IDX.find((x) => x.meta === ISSUES[0].iid), IDX.find((x) => x.type === "Audit"), IDX.find((x) => x.type === "Hotel" && x.meta === "PCI")];
function mountPalette(container, o) {
  container.innerHTML = `<div class="pal-in ${o.phone ? "ph-in" : ""}">${o.phone ? backBtn("Back") : ""}${ic("search")}<input class="input" type="text" placeholder="Search issues, audits, hotels and clients" aria-label="Search everything" autocomplete="off">${o.phone ? "" : '<span class="kbd">Esc</span>'}</div><div class="pal-list" role="listbox"></div>${o.phone ? "" : '<div class="pal-foot"><span><span class="kbd">↑</span><span class="kbd">↓</span>to move</span><span><span class="kbd">Enter</span>to open</span><span><span class="kbd">Esc</span>to close</span></div>'}`;
  const input = container.querySelector("input"), list = container.querySelector(".pal-list");
  let act = 0, flat = [];
  const row = (x, i) => `<button class="pal-row ${i === act && !o.phone ? "act" : ""}" role="option" data-ix="${i}">${ic(x.i)}<span class="row-main"><span class="row-t trunc">${esc(x.t)}</span><span class="row-s trunc">${x.st ? `<span class="dot ${ST[x.st].c}"></span>${ST[x.st].l} · ` : ""}${esc(x.s || "")}</span></span><span class="meta num">${esc(x.meta || x.type)}</span></button>`;
  const draw = () => {
    const q = input.value.trim().toLowerCase(); let groups;
    if (!q) groups = [["Recent", RECENT], ["Go to", PAGES.slice(0, 5)]];
    else {
      const by = {};
      IDX.forEach((x) => { if ((x.t + " " + (x.s || "") + " " + (x.meta || "")).toLowerCase().includes(q)) (by[x.type] ||= []).push(x); });
      groups = TYPE_ORDER.filter(([t]) => by[t]).map(([t, p]) => [p, by[t].slice(0, t === "Issue" ? 5 : 4), by[t].length]);
    }
    flat = []; let h = "";
    groups.forEach(([g, items, total]) => {
      h += `<div class="lp-grp"><span>${g}</span>${total ? `<span class="num">${total.toLocaleString("en-IN")}</span>` : ""}</div>`;
      items.forEach((x) => { h += row(x, flat.length); flat.push(x); });
    });
    if (!flat.length) h = emptyState("search", `Nothing found for "${esc(input.value.trim())}"`, "Search by name, code, hotel, client or city.");
    act = Math.min(act, Math.max(flat.length - 1, 0));
    list.innerHTML = h;
  };
  const mark = () => list.querySelectorAll(".pal-row").forEach((r) => { r.classList.toggle("act", +r.dataset.ix === act); if (+r.dataset.ix === act) r.scrollIntoView({ block: "nearest" }); });
  input.addEventListener("input", () => { act = 0; draw(); });
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") { act = Math.min(act + 1, flat.length - 1); mark(); e.preventDefault(); }
    else if (e.key === "ArrowUp") { act = Math.max(act - 1, 0); mark(); e.preventDefault(); }
    else if (e.key === "Enter" && flat[act]) { o.onGo(flat[act]); e.preventDefault(); }
    else if (e.key === "Escape") { o.onEsc && o.onEsc(); }
  });
  list.addEventListener("click", (e) => { const r = e.target.closest("[data-ix]"); if (r) o.onGo(flat[+r.dataset.ix]); });
  draw();
  if (o.focus) setTimeout(() => input.focus({ preventScroll: true }), 280);
}
function goRecord(it, host) {
  if (it.hotel) { goHotel(it.hotel); return; }
  if (it.go) { showTab(it.go); return; }
  toast(host, `Opens ${it.type.toLowerCase()}: ${it.t}`);
}
function paletteSheet(vp, o = {}) {
  const s = openSheet(vp, `<div class="sh-body pal" style="display:flex;flex-direction:column"></div>`, { full: true, instant: o.instant, label: "Search" });
  mountPalette(s.el.querySelector(".pal"), { phone: true, focus: o.focus, onGo: (it) => { s.close(); goRecord(it, vp); } });
  return s;
}

/* ================= Navigation per role ================= */
const NAVI = { home: { l: "Home", i: "home" }, audits: { l: "Audits", i: "clipboard" }, issues: { l: "Issues", i: "circleDot" }, myissues: { l: "My issues", i: "circleDot" }, clients: { l: "Clients", i: "briefcase" }, reports: { l: "Reports", i: "fileText" }, setup: { l: "Setup", i: "sliders" }, settings: { l: "Settings", i: "settings" }, more: { l: "More", i: "menu" } };
const NAV = {
  admin: { bar: ["home", "audits", "clients"], more: ["issues", "reports", "setup", "settings"] },
  manager: { bar: ["home", "audits", "issues"], more: ["reports", "setup", "settings"] },
  group: { bar: ["home", "audits", "issues"], more: ["reports", "settings"] },
  dept: { bar: ["home", "audits", "issues"], more: ["reports", "settings"] },
  auditor: { bar: ["home", "audits"], more: ["settings"] },
  staff: { bar: ["myissues"], more: ["settings"] },
};
const SETUP = {
  admin: [["Library items", 412, "listChecks"], ["Audit templates", TEMPLATES.length, "library"], ["Departments", 10, "layers"], ["Clients", CLIENTS.length, "briefcase"], ["Hotels", HOTELS.length, "building"], ["Team members", 3812, "users"], ["Auditors", AUDITORS.length, "user"], ["Reasons", 6, "listChecks"], ["Score scales", 2, "listChecks"], ["Evidence types", 3, "image"]],
  manager: [["Team members", 6, "users"], ["Hotel settings", null, "building"]],
};
function bnav(role, active) {
  const n = NAV[role];
  return `<nav class="bnav" aria-label="Main" data-zone="Bottom nav">${[...n.bar, "more"].map((k) => `<button data-act="nav" data-k="${k}" ${k === active ? 'aria-current="page"' : ""}>${ic(NAVI[k].i)}<span>${NAVI[k].l}</span></button>`).join("")}</nav>`;
}
const SIDE = {
  admin: [[null, [["home", "Home", "home"]]], ["Audits", [["schedule", "To schedule", "calendarPlus", SCHED.filter((s) => s.state !== "Scheduled").length], ["audits", "All audits", "clipboard"]]], ["Masters", [["library", "Library items", "listChecks", 412], ["templates", "Audit templates", "library", TEMPLATES.length], ["depts", "Departments", "layers", 10]]], ["Clients and users", [["clients", "Clients", "briefcase", CLIENTS.length], ["hotels", "Hotels", "building", HOTELS.length], ["team", "Team members", "users", 3812], ["auditors", "Auditors", "user", AUDITORS.length]]], ["Reports", [["issues", "Issues", "circleDot"], ["reports", "Reports", "fileText"], ["compare", "Hotel comparison", "columns"]]]],
  manager: [[null, [["home", "Home", "home"]]], ["Audits", [["audits", "Audits", "clipboard"], ["history", "Score history", "chart"]]], ["Issues", [["issues", "All issues", "circleDot", ISSUES.length], ["mine", "My open issues", "user", 3], ["overdue", "Overdue issues", "alert", 3], ["waiting", "Waiting for team response", "history", 2]]], ["Reports", [["reports", "Reports", "fileText"]]], ["Setup", [["team", "Team members", "users", 6], ["hsettings", "Hotel settings", "building"]]]],
  group: [[null, [["home", "Home", "home"]]], ["Audits", [["audits", "Audits", "clipboard"], ["history", "Score history", "chart"]]], ["Issues", [["issues", "All issues", "circleDot"], ["overdue", "Overdue issues", "alert"]]], ["Reports", [["reports", "Reports", "fileText"], ["compare", "Hotel comparison", "columns"]]]],
  dept: [[null, [["home", "Home", "home"]]], ["Audits", [["audits", "Audits", "clipboard"]]], ["Issues", [["issues", "My departments", "circleDot", 6], ["overdue", "Overdue issues", "alert", 2]]], ["Reports", [["reports", "Reports", "fileText"]]]],
  auditor: [[null, [["home", "Home", "home"]]], ["Audits", [["audits", "Assigned to me", "clipboard", 3], ["upcoming", "Upcoming", "calendar", 2]]]],
  staff: [["Issues", [["issues", "My issues", "circleDot", 2]]]],
};
const WHO = { admin: PEOPLE[4], manager: PEOPLE[0], group: PEOPLE[5], dept: PEOPLE[1], auditor: PEOPLE[3], staff: PEOPLE[2] };
function sidebar(role, active, o = {}) {
  const p = WHO[role];
  let h = `<aside class="side" aria-label="Sidebar"><div class="side-brand">${MARK}Sightline</div>`;
  if (o.hotel) h += o.switchable ? `<button class="side-hotel" data-act="hotel" aria-label="Switch hotel" title="${esc(o.hotel)}">${ic("building")}<span class="trunc">${esc(o.hotel)}</span>${ic("chevronsUpDown")}</button>` : `<div class="side-hotel static" title="${esc(o.hotel)}">${ic("building")}<span class="trunc">${esc(o.hotel)}</span></div>`;
  else if (role === "admin") h += `<button class="side-hotel" data-act="hotel" aria-label="Go to a hotel">${ic("search")}<span class="trunc t3">Go to a hotel</span>${ic("chevronsUpDown")}</button>`;
  SIDE[role].forEach(([g, items]) => {
    if (g) h += `<div class="side-grp">${g}</div>`;
    items.forEach(([k, l, i, c]) => { h += `<button class="side-a" data-act="side" data-k="${k}" ${k === active ? 'aria-current="page"' : ""}>${ic(i)}<span class="trunc">${l}</span>${c != null ? `<span class="cnt">${c.toLocaleString("en-IN")}</span>` : ""}</button>`; });
  });
  h += `<div class="side-user"><span class="av">${ini(p.n)}</span><span class="who">${p.n}<span>${ROLES[role]}</span></span><button class="icon-btn sm" data-act="toast" data-msg="Opens your settings" aria-label="Settings">${ic("settings")}</button></div></aside>`;
  return h;
}

/* ================= Shell: phone ================= */
const hotelCtx = (name, switchable = true) => switchable
  ? `<button class="ctx-btn" data-act="hotel" aria-label="Switch hotel. Current: ${esc(name)}" title="${esc(name)}">${ic("building", "ic-16")}<span class="trunc">${esc(name)}</span>${ic("chevronsUpDown", "ic-16")}</button>`
  : `<span class="ctx-btn" title="${esc(name)}">${ic("building", "ic-16")}<span class="trunc">${esc(name)}</span></span>`;
const markCtx = `<span class="ctx-btn">${MARK}<span>Sightline</span></span>`;
function topBar(o) {
  let left = "";
  if (o.close) left = `<button class="icon-btn" data-back data-act="close" aria-label="Close audit">${ic("x")}</button>`;
  else if (o.back) left = `<button class="icon-btn" data-back data-act="back" ${o.back.tab ? `data-tab="${o.back.tab}"` : ""} data-label="${esc(o.back.label)}" aria-label="Back to ${esc(o.back.label)}">${ic("chevronLeft")}</button>`;
  return `<header class="app-top${left ? "" : " is-home"}" data-zone="Top bar">${left}<div class="top-ctx">${o.ctx || ""}</div>${o.actions || ""}${o.search === false ? "" : `<button class="icon-btn" data-act="search" aria-label="Search">${ic("search")}</button>`}</header>`;
}
function pageHead(o) {
  const t = o.titleAct ? `<button class="ph-tbtn" data-act="${o.titleAct}" aria-label="${esc(o.titleLabel || o.title)}"><h1 class="ph-t">${esc(o.title)}</h1>${ic("chevronDown")}</button>` : `<h1 class="ph-t">${esc(o.title)}</h1>`;
  return `<div class="ph" data-page-head data-zone="Page header"><div class="ph-row"><div class="ph-tw">${t}${o.count != null ? `<span class="ph-c num" data-count>${o.count}</span>` : ""}</div>${o.menu === false ? "" : `<button class="icon-btn menu" data-act="menu" aria-label="More actions">${ic("more")}</button>`}</div>${o.meta ? `<div class="ph-meta">${o.meta}</div>` : ""}${o.primary ? `<button class="btn btn-primary btn-block ph-p" data-act="${o.primary.act}" ${o.primary.disabled ? "disabled" : ""}>${o.primary.icon ? ic(o.primary.icon) : ""}${o.primary.label}</button>` : ""}</div>`;
}

/* ================= Shell: laptop ================= */
function lapTop(o) {
  let left = "";
  if (o.close) left = `<button class="btn btn-ghost btn-sm" data-back data-act="close">${ic("x")}Close</button><span class="vsep"></span>`;
  else if (o.back) left = `<button class="btn btn-ghost btn-sm" data-back data-act="back" ${o.back.tab ? `data-tab="${o.back.tab}"` : ""} data-label="${esc(o.back.label)}">${ic("chevronLeft")}${esc(o.back.label)}</button><span class="vsep"></span>`;
  const cr = o.crumbs.map(([l, tab], i) => i === o.crumbs.length - 1 ? `<b class="trunc">${esc(l)}</b>` : `${tab ? `<button data-act="go" data-tab="${tab}">${esc(l)}</button>` : `<span class="trunc">${esc(l)}</span>`}${ic("chevronRight", "ic-16")}`).join("");
  return `<div class="ltop" data-zone="Top bar">${left}<nav class="crumbs" aria-label="Breadcrumbs">${cr}</nav>${o.actions || ""}<button class="cmdk" data-act="palette">${ic("search")}<span>Search</span><span class="kbd">Ctrl K</span></button></div>`;
}
function lapHead(o) {
  const t = o.titleAct ? `<button class="lph-tbtn" data-act="${o.titleAct}"><h1 class="h1">${esc(o.title)}</h1>${ic("chevronDown")}</button>` : `<h1 class="h1" title="${esc(o.title)}">${esc(o.title)}</h1>`;
  return `<div class="lph" data-zone="Page header"><div class="lph-row">${t}${o.count != null ? `<span class="lph-c num" data-count>${o.count}</span>` : ""}${o.status || ""}<span class="grow"></span>${o.extra || ""}${o.primary ? `<button class="btn btn-primary btn-sm" data-act="${o.primary.act}" ${o.primary.disabled ? "disabled" : ""}>${o.primary.icon ? ic(o.primary.icon) : ""}${o.primary.label}</button>` : ""}${o.menu === false ? "" : `<button class="btn btn-secondary btn-sm" data-act="lmenu">Actions${ic("chevronDown")}</button>`}</div>${o.meta ? `<div class="lph-meta">${o.meta}</div>` : ""}</div>`;
}

/* ================= Base classes ================= */
class PhoneApp {
  constructor(root, o = {}) {
    this.root = root; this.o = o; this.role = o.role || "manager";
    root.classList.add("phone");
    root.innerHTML = '<div class="vp"><div class="screen"></div></div>';
    this.vp = root.firstChild; this.screen = this.vp.firstChild;
    root.addEventListener("click", (e) => {
      const t = e.target.closest("[data-act]"); if (!t || !root.contains(t)) return;
      const f = this["a_" + t.dataset.act]; if (f) f.call(this, t, e);
    });
    root.addEventListener("input", (e) => this.onInput && this.onInput(e));
    root.addEventListener("change", (e) => this.onChange && this.onChange(e));
  }
  frame(o) {
    const sc = this.screen.querySelector(".scroll"), keep = sc && o.keep ? sc.scrollTop : 0;
    this.screen.dataset.home = o.home ? "true" : "false";
    this.screen.innerHTML = topBar(o) + (o.progress != null ? `<div class="progress"><i style="width:${o.progress * 100}%"></i></div>` : "")
      + `<div class="scroll" data-zone="Content">${o.head || ""}${o.body || ""}</div>` + (o.footer ? `<div class="sticky-foot" data-zone="Sticky action">${o.footer}</div>` : "") + (o.after || "") + (o.nav ? bnav(o.nav[0], o.nav[1]) : "");
    const s2 = this.screen.querySelector(".scroll"); if (s2 && keep) s2.scrollTop = keep;
  }
  menuItems() { return [["link", "Copy link", "toast", "Link copied"]]; }
  a_menu() { this.menuSheet = openSheet(this.vp, sheetHead("Actions") + `<div class="sh-body">${menuRows(this.menuItems())}</div>`, { label: "Actions" }); }
  closeMenu() { if (this.menuSheet) { this.menuSheet.close(); this.menuSheet = null; } }
  a_back(t) { if (t.dataset.tab) showTab(t.dataset.tab); else if (this.onBack) this.onBack(); else toast(this.vp, `Back to ${t.dataset.label}`); }
  a_hotel() { pickerSheet(this.vp, hotelOpts(CTX.hotel.c, (it) => goHotel(it, this.viewer || CTX.viewer))); }
  a_search() { paletteSheet(this.vp); }
  a_allhotels() { toast(this.vp, "Opens the Hotels list"); }
  a_toast(t) { this.closeMenu(); toast(this.vp, t.dataset.msg); }
  a_go(t) { showTab(t.dataset.tab); }
  a_nav(t) {
    const k = t.dataset.k;
    if (k === "more") return this.openMore();
    const map = { home: { auditor: "G", admin: "AW" }[this.navRole || this.role] || "D", issues: "E", myissues: "E" };
    if (map[k] && !this.o.navDemo) showTab(map[k]); else toast(this.vp, `Opens ${NAVI[k].l}`);
  }
  openMore() {
    const role = this.navRole || this.role;
    const rows = NAV[role].more.map((k) => `<button class="menu-row" data-act="${k === "setup" ? "setup" : "toast"}" data-msg="Opens ${NAVI[k].l}">${ic(NAVI[k].i)}${NAVI[k].l}<span class="r">${ic("chevronRight")}</span></button>`).join("");
    this.moreSheet = openSheet(this.vp, sheetHead("More") + `<div class="sh-body">${rows}<button class="menu-row" data-act="toast" data-msg="Signs you out">${ic("logout")}Sign out</button></div>`, { label: "More" });
  }
  a_setup() {
    const role = this.navRole || this.role; const list = SETUP[role] || SETUP.manager;
    const s = openSheet(this.vp, sheetHead("Setup", "Record types you can manage") + `<div class="sh-search"><label class="search">${ic("search")}<input class="input" type="search" placeholder="Search setup" aria-label="Search setup"></label></div><div class="sh-body setup-list"></div>`, { full: true, label: "Setup" });
    const box = s.el.querySelector(".setup-list"), inp = s.el.querySelector("input");
    const draw = () => { const q = inp.value.toLowerCase(); const m = list.filter((x) => x[0].toLowerCase().includes(q)); box.innerHTML = m.length ? m.map(([l, c, i]) => `<button class="menu-row" data-act="toast" data-msg="Opens the ${l.toLowerCase()} list">${ic(i)}${l}<span class="r">${c != null ? `<span class="cnt-b">${c.toLocaleString("en-IN")}</span>` : ""}${ic("chevronRight")}</span></button>`).join("") : emptyState("search", "No record type matches"); };
    inp.addEventListener("input", draw); draw();
  }
}
function relRect(node, root) { let x = 0, y = 0, n = node; while (n && n !== root) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; } return { x, y, w: node.offsetWidth, h: node.offsetHeight }; }
const LAPS = [];
class LaptopApp {
  constructor(root, o = {}) {
    this.root = root; this.o = o; this.role = o.role || "manager";
    root.classList.add("lap-wrap");
    root.innerHTML = '<div class="lap"></div>';
    this.lap = root.firstChild;
    root.addEventListener("click", (e) => {
      const t = e.target.closest("[data-act]"); if (!t || !root.contains(t)) return;
      const f = this["a_" + t.dataset.act]; if (f) f.call(this, t, e);
    });
    root.addEventListener("input", (e) => this.onInput && this.onInput(e));
    root.addEventListener("change", (e) => this.onChange && this.onChange(e));
    LAPS.push(this);
  }
  lframe(o) {
    this.closePop();
    this.lap.dataset.home = o.home ? "true" : "false";
    this.lap.classList.toggle("focus", !o.side);
    this.lap.innerHTML = (o.side || "") + `<div class="lcol">${lapTop(o)}${o.progress != null ? `<div class="progress"><i style="width:${o.progress * 100}%"></i></div>` : ""}${o.content}</div>`;
  }
  popover(anchor, build, o = {}) {
    this.closePop();
    const p = el("div", "pop"); p.style.zIndex = ++Z;
    const r = relRect(anchor, this.lap), w = o.w || 320;
    p.style.width = w + "px";
    p.style.left = Math.max(8, Math.min(1280 - w - 8, o.right ? r.x + r.w - w : r.x)) + "px";
    p.style.top = r.y + r.h + 6 + "px";
    this.lap.append(p); build(p); this.pop = p;
    setTimeout(() => { this._out = (e) => { if (this.pop && !this.pop.contains(e.target) && !anchor.contains(e.target) && document.contains(e.target)) this.closePop(); }; document.addEventListener("mousedown", this._out); });
    return p;
  }
  closePop() { if (this.pop) { this.pop.remove(); this.pop = null; } if (this._out) { document.removeEventListener("mousedown", this._out); this._out = null; } }
  menuItems() { return [["link", "Copy link", "toast", "Link copied"]]; }
  a_lmenu(t) { this.popover(t, (p) => { p.innerHTML = `<div class="pop-list">${menuRows(this.menuItems())}</div>`; }, { w: 260, right: true }); }
  a_hotel(t) {
    this.popover(t, (p) => {
      const box = el("div"); p.append(box);
      linkPicker(box, { ...hotelOpts(CTX.hotel.c, null), small: true, focus: true, onPick: (it) => { this.closePop(); goHotel(it, this.viewer || CTX.viewer); } });
      p.insertAdjacentHTML("beforeend", `<div class="pop-f"><span class="t3 num" style="font-size:12px">${HOTELS.length.toLocaleString("en-IN")} hotels · ${CLIENTS.length} clients</span></div>`);
    }, { w: 380 });
  }
  a_palette() { this.openPalette(); }
  openPalette() {
    if (this.pal) return;
    const scrim = el("div", "scrim on"); const m = el("div", "pal-modal");
    m.setAttribute("role", "dialog"); m.setAttribute("aria-label", "Search");
    this.lap.append(scrim, m);
    const close = () => { scrim.remove(); m.remove(); this.pal = null; };
    scrim.addEventListener("click", close);
    mountPalette(m, { focus: true, onEsc: close, onGo: (it) => { close(); goRecord(it, this.lap); } });
    this.pal = { close };
  }
  a_toast(t) { this.closePop(); toast(this.lap, t.dataset.msg); }
  a_back(t) { if (t.dataset.tab) showTab(t.dataset.tab); else if (this.onBack) this.onBack(); else toast(this.lap, `Back to ${t.dataset.label}`); }
  a_side(t) {
    const k = t.dataset.k;
    const map = { home: this.role === "admin" ? "AW" : "D", issues: "E", mine: "E", overdue: "E", waiting: "E", schedule: "AW", hotels: "AW", clients: "AW" };
    if (map[k]) showTab(map[k]); else toast(this.lap, `Opens ${t.querySelector(".trunc").textContent}`);
  }
  a_go(t) { showTab(t.dataset.tab); }
}
