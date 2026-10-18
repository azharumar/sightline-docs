/* ================= Admin workspace (Sightline staff) ================= */
const allHotelsCtx = `<button class="ctx-btn" data-act="hotel" aria-label="Go to a hotel">${ic("building", "ic-16")}<span class="trunc">All hotels</span>${ic("chevronsUpDown", "ic-16")}</button>`;
const schedOpen = () => SCHED.filter((s) => s.state !== "Scheduled" && s.state !== "Cancelled");
const cancelForm = (sc) => `<p class="fg">Cancel the ${esc(sc.t)} audit at ${esc(sc.h)}?${sc.who ? ` ${esc(sc.who)} will no longer see it in their list.` : ""}</p><label class="fld" style="margin-top:16px"><span class="fld-l">Reason <span class="warn">Required</span></span><textarea class="input" data-cr rows="3" placeholder="Why is this audit cancelled?"></textarea></label>`;
function wireCancel(root, sc, done) { const ta = root.querySelector("[data-cr]"), b = root.querySelector("[data-cgo]"); ta.addEventListener("input", () => { b.disabled = !ta.value.trim(); }); b.addEventListener("click", () => { sc.state = "Cancelled"; sc.why = ta.value.trim(); done(); }); }
const schedState = (s) => `<span class="dot ${SCHED_ST[s.state]}"></span>${s.state}`;
const fmtN = (n) => n.toLocaleString("en-IN");
function adminCards(lap) {
  const L = CTX.long, open = schedOpen();
  const c = [
    { k: L ? "Audits waiting for a date or an auditor" : "To schedule", v: open.length, s: L ? "Oldest request is 12 days old, Lotus Hotel Kochi" : "Oldest 12 days", act: "toast", msg: "Opens Audits to schedule" },
    { k: L ? "Scheduled audits with no auditor assigned yet" : "Not assigned", v: SCHED.filter((s) => s.state === "Not assigned").length, act: "toast", msg: "Opens Not assigned" },
    { k: L ? "Client companies with an active contract" : "Clients", v: fmtN(CLIENTS.length), act: "go", tab: "AW" },
    { k: L ? "Hotels across every client company" : "Hotels", v: fmtN(HOTELS.length), s: L ? "Spread across 18 cities in Kerala and Karnataka" : "18 cities", act: "go", tab: "AW" },
  ];
  return ncards(c, lap ? "c4" : "");
}
const scheduleForm = (s = {}) => `<div class="fld"><span class="fld-l">Hotel</span><button class="input link-in" data-sfl="hotel"><span class="v ${s.h ? "" : "t3"}" data-sv="hotel">${esc(s.h || "Search 1,046 hotels")}</span>${ic("chevronsUpDown")}</button>${s.g ? `<span class="fld-h" data-sv="client">${esc(s.g)}</span>` : `<span class="fld-h" data-sv="client">Hotels are grouped by client</span>`}</div>
  <div class="fld"><span class="fld-l">Audit template</span><button class="input link-in" data-sfl="tpl"><span class="v" data-sv="tpl">${esc(s.t || "Ops & Quality")}</span>${ic("chevronsUpDown")}</button></div>
  <label class="fld"><span class="fld-l">Date</span><input class="input" type="date" value="${s.date || "2026-10-20"}"></label>
  <div class="fld"><span class="fld-l">Auditor</span><button class="input link-in" data-sfl="who"><span class="v ${s.who ? "" : "t3"}" data-sv="who">${esc(s.who || "Not assigned")}</span>${ic("chevronsUpDown")}</button><span class="fld-h">The auditor sees only the audits assigned to them.</span></div>`;
function wireSchedule(root, openPicker, onChange) {
  const set = (k, v) => { const e = root.querySelector(`[data-sv="${k}"]`); if (e) { e.textContent = v; e.classList.remove("t3"); } onChange && onChange(k, v); };
  root.addEventListener("click", (e) => {
    const l = e.target.closest("[data-sfl]"); if (!l) return;
    const k = l.dataset.sfl;
    const o = k === "hotel" ? { ...hotelOpts(null, (h) => { set("hotel", h.n); set("client", h.g); }), title: "Hotel", footer: "" } : k === "tpl" ? templateOpts(null, (t) => set("tpl", t)) : auditorOpts(null, (a) => set("who", a.n));
    openPicker(o, l);
  });
}

class AdminHomePhone extends PhoneApp {
  constructor(root, o = {}) { super(root, { ...o, role: "admin" }); this.viewer = "admin"; this.render(); }
  render() {
    this.frame({
      home: true, ctx: allHotelsCtx,
      head: pageHead({ title: "Home", meta: "Meera Nair · Admin · Sightline staff", primary: { label: "Schedule audit", act: "schedule", icon: "calendarPlus" } }),
      body: adminCards(false)
        + secH("Audits to schedule", `<button class="btn-text sm" data-act="toast" data-msg="Opens Audits to schedule">See all</button>`)
        + schedOpen().slice(0, 4).map(schedRow).join("")
        + secH("Masters") + [["listChecks", "Library items", 412], ["library", "Audit templates", TEMPLATES.length], ["layers", "Departments", 10]].map(masterRow).join("")
        + secH("Clients and users") + [["briefcase", "Clients", CLIENTS.length], ["building", "Hotels", HOTELS.length], ["users", "Team members", 3812], ["user", "Auditors", AUDITORS.length]].map(masterRow).join("") + `<div style="height:24px"></div>`,
      nav: ["admin", "home"],
    });
  }
  menuItems() { return [["sliders", "Edit shortcuts", "toast", "Choose which sections show here"], ["refresh", "Refresh", "toast", "Refreshed"]]; }
  a_schedule() { scheduleSheet(this.vp); }
  a_sched(t) { assignSheet(this.vp, SCHED[+t.dataset.id], () => this.render()); }
}
const schedRow = (s) => `<button class="row" data-act="sched" data-id="${s.id}"><span class="row-main"><span class="row-t">${esc(s.h)}</span><span class="row-s">${schedState(s)}<span class="sep">·</span><span class="trunc">${esc(s.t)} · ${esc(s.g)}</span></span></span><span class="row-r num">${s.date ? fd(s.date) : '<span class="warn">No date</span>'}<span class="${s.who ? "" : "warn"}">${s.who ? esc(s.who.split(" ")[0]) : "Not assigned"}</span></span></button>`;
const masterRow = ([i, l, c]) => `<button class="row h48" data-act="toast" data-msg="Opens the ${l.toLowerCase()} list">${ic(i, "row-ic")}<span class="row-main"><span class="row-t n">${l}</span></span><span class="cnt-b">${fmtN(c)}</span>${ic("chevronRight", "ic-16")}</button>`;
function scheduleSheet(vp) {
  const s = openSheet(vp, sheetHead("Schedule audit") + `<div class="sh-body sh-pad">${scheduleForm()}</div><div class="sh-foot"><button class="btn btn-primary btn-block" data-sgo>Schedule audit</button></div>`, { full: true, label: "Schedule audit" });
  wireSchedule(s.el, (o) => pickerSheet(vp, o));
  s.el.querySelector("[data-sgo]").addEventListener("click", () => { s.close(); toast(vp, "Audit scheduled"); });
}
function assignSheet(vp, sc, after) {
  const s = openSheet(vp, sheetHead(esc(sc.h), `${esc(sc.g)}`) + `<div class="sh-body sh-pad"><p class="status" style="margin-bottom:16px">${schedState(sc)}</p>${scheduleForm(sc)}</div><div class="sh-foot"><button class="btn btn-danger" data-cancel>Cancel audit</button><button class="btn btn-primary grow" data-sgo>${sc.who ? "Reassign auditor" : "Assign auditor"}</button></div>`, { full: true, label: "Audit to schedule" });
  s.el.querySelector("[data-cancel]").addEventListener("click", () => {
    const c = openSheet(vp, sheetHead("Cancel audit", esc(sc.h)) + `<div class="sh-body sh-pad">${cancelForm(sc)}</div><div class="sh-foot"><button class="btn btn-primary btn-block" data-cgo disabled>Cancel audit</button></div>`, { label: "Cancel audit" });
    wireCancel(c.el, sc, () => { c.close(); s.close(); after(); toast(vp, "Audit cancelled. The reason is saved in its history."); });
  });
  let who = sc.who;
  wireSchedule(s.el, (o) => pickerSheet(vp, o), (k, v) => { if (k === "who") who = v; });
  s.el.querySelector("[data-sgo]").addEventListener("click", () => { const prev = sc.who; sc.who = who; if (sc.who && sc.date) sc.state = "Scheduled"; s.close(); after(); toast(vp, prev && prev !== who ? `Reassigned from ${prev} to ${who}` : who ? `Assigned to ${who}` : "Saved"); });
}

/* Audits to schedule: the list view pattern on phone */
class ScheduleListPhone extends PhoneApp {
  constructor(root, o = {}) { super(root, { ...o, role: "admin" }); this.viewer = "admin"; this.view = "open"; this.q = ""; this.render(); }
  rows() { return SCHED.filter((s) => s.state !== "Cancelled" && (this.view === "open" ? s.state !== "Scheduled" : this.view === "na" ? s.state === "Not assigned" : true) && (!this.q || (s.h + s.g + s.t + (s.who || "")).toLowerCase().includes(this.q.toLowerCase()))); }
  render() {
    const V = { open: "Audits to schedule", na: "Not assigned", all: "All upcoming audits" }, rows = this.rows();
    this.frame({
      back: { label: "Home", tab: "AW" }, ctx: allHotelsCtx, keep: true,
      head: pageHead({ title: V[this.view], titleAct: "views", count: rows.length, primary: { label: "Schedule audit", act: "schedule", icon: "calendarPlus" } })
        + `<div class="toolbar"><label class="search grow">${ic("search")}<input class="input" type="search" placeholder="Search hotel, client or auditor" data-q value="${esc(this.q)}" aria-label="Search audits"></label><button class="icon-btn bd" data-act="toast" data-msg="Opens the filter builder" aria-label="Filters">${ic("filter")}</button><button class="icon-btn bd" data-act="toast" data-msg="Sort by date, hotel or client" aria-label="Sort">${ic("sort")}</button></div>
          <div class="qf">${["Client", "Audit template", "Auditor", "Month"].map((k) => `<button class="qchip" data-act="toast" data-msg="Filter by ${k.toLowerCase()}">${k}${ic("chevronDown")}</button>`).join("")}</div>`,
      body: `<div data-list>${this.listHtml(rows)}</div>`, nav: ["admin", "audits"],
    });
  }
  listHtml(rows) { return rows.length ? `<div class="list-meta num"><span>Date, earliest first</span><span>${rows.length} of ${rows.length}</span></div>` + rows.map(schedRow).join("") : emptyState("search", "No audits match", "Try another hotel, client or auditor."); }
  onInput(e) { if (e.target.dataset.q != null) { this.q = e.target.value; const r = this.rows(); this.screen.querySelector("[data-list]").innerHTML = this.listHtml(r); this.screen.querySelector("[data-count]").textContent = r.length; } }
  menuItems() { return [["calendar", "Show as calendar", "toast", "Shows the same audits on a month calendar"], ["fileText", "Export as CSV", "toast", "Downloads the list as CSV"]]; }
  a_views() {
    const V = [["open", "Audits to schedule"], ["na", "Not assigned"], ["all", "All upcoming audits"]];
    const s = openSheet(this.vp, sheetHead("Saved views") + `<div class="sh-body">${V.map(([k, l]) => `<button class="menu-row" data-v="${k}">${ic("bookmark")}${l}${this.view === k ? `<span class="r">${ic("check")}</span>` : ""}</button>`).join("")}</div>`, { label: "Saved views" });
    s.el.addEventListener("click", (e) => { const b = e.target.closest("[data-v]"); if (!b) return; s.close(); this.view = b.dataset.v; this.render(); });
  }
  a_schedule() { scheduleSheet(this.vp); }
  a_sched(t) { assignSheet(this.vp, SCHED[+t.dataset.id], () => this.render()); }
}

class AdminHomeLaptop extends LaptopApp {
  constructor(root, o = {}) { super(root, { ...o, role: "admin" }); this.viewer = "admin"; this.sel = schedOpen()[0].id; this.render(); }
  render() {
    const rows = schedOpen(), s = SCHED[this.sel];
    this.lframe({
      side: sidebar("admin", "home"), home: true, crumbs: [["Home"]],
      content: `<div class="lsplit"><div class="lbody">${lapHead({ title: "Home", meta: "Meera Nair · Admin · Sightline staff", primary: { label: "Schedule audit", act: "lschedule", icon: "calendarPlus" } })}<div class="lpage">
        ${adminCards(true)}
        <div><div class="lsec-h"><h2 class="h2">Audits to schedule</h2><span class="cnt-b">${rows.length}</span><span class="grow"></span><button class="btn-text sm" data-act="toast" data-msg="Opens Audits to schedule, also as a calendar">See all</button></div>
          <table class="tbl"><thead><tr><th>Hotel</th><th>Client</th><th>Audit template</th><th>Date</th><th>Auditor</th></tr></thead><tbody>
          ${rows.map((x) => `<tr class="click ${x.id === this.sel ? "sel" : ""}" data-act="sel" data-id="${x.id}"><td class="fg"><span class="dot ${SCHED_ST[x.state]}" style="margin-right:8px"></span>${esc(x.h)}</td><td>${esc(x.g)}</td><td>${esc(x.t)}</td><td class="num">${x.date ? fd(x.date) : '<span class="warn">No date</span>'}</td><td>${x.who ? esc(x.who) : '<span class="warn">Not assigned</span>'}</td></tr>`).join("")}
          </tbody></table></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:32px">
          <div><div class="lsec-h"><h2 class="h2">Masters</h2><span class="t3">Global, shared by every client</span></div><table class="tbl"><tbody>${[["Library items", 412], ["Audit templates", TEMPLATES.length], ["Departments", 10], ["Reasons", 6]].map(([l, c]) => `<tr class="click" data-act="toast" data-msg="Opens the ${l.toLowerCase()} list"><td class="fg">${l}</td><td class="num" style="text-align:right">${fmtN(c)}</td></tr>`).join("")}</tbody></table></div>
          <div><div class="lsec-h"><h2 class="h2">Clients and users</h2></div><table class="tbl"><tbody>${[["Clients", CLIENTS.length, "AW"], ["Hotels", HOTELS.length, "AW"], ["Team members", 3812], ["Auditors", AUDITORS.length]].map(([l, c]) => `<tr class="click" data-act="toast" data-msg="Opens the ${l.toLowerCase()} list"><td class="fg">${l}</td><td class="num" style="text-align:right">${fmtN(c)}</td></tr>`).join("")}</tbody></table></div>
        </div></div></div>
      <aside class="insp" aria-label="Selected audit">
        <div class="insp-h" style="padding-left:20px"><div class="grow"><div class="h2">${esc(s.h)}</div><div class="t3" style="font-size:12px;margin-top:2px">${esc(s.g)}</div><div class="status" style="margin-top:8px">${schedState(s)}</div></div></div>
        <div class="insp-b">${scheduleForm(s)}</div>
        <div class="insp-f"><button class="btn btn-danger btn-sm" data-act="lcancel">Cancel audit</button><span class="grow"></span><button class="btn btn-primary btn-sm" data-act="assign">${s.who ? "Reassign auditor" : "Assign auditor"}</button></div>
      </aside></div>`,
    });
    this.who = s.who;
    wireSchedule(this.lap.querySelector(".insp"), (o, btn) => this.pick(o, btn), (k, v) => { if (k === "who") this.who = v; });
  }
  pick(o, btn) { this.popover(btn, (p) => { const b = el("div"); p.append(b); linkPicker(b, { ...o, small: true, focus: true, onPick: (it) => { this.closePop(); o.onPick(it); } }); }, { w: 340, right: true }); }
  menuItems() { return [["calendar", "Show schedule as calendar", "toast", "Shows audits on a month calendar"], ["refresh", "Refresh", "toast", "Refreshed"]]; }
  a_sel(t) { this.sel = +t.dataset.id; this.render(); }
  a_lcancel(t) {
    const sc = SCHED[this.sel];
    this.popover(t, (p) => { p.innerHTML = `<div class="pop-h">Cancel audit</div><div class="pop-body">${cancelForm(sc)}</div><div class="pop-f"><span class="grow"></span><button class="btn btn-primary btn-sm" data-cgo disabled>Cancel audit</button></div>`; wireCancel(p, sc, () => { this.sel = (schedOpen()[0] || sc).id; this.render(); toast(this.lap, "Audit cancelled. The reason is saved in its history."); }); }, { w: 380 });
  }
  a_assign() { const s = SCHED[this.sel], prev = s.who; s.who = this.who; if (s.who && s.date) s.state = "Scheduled"; const msg = prev && prev !== s.who ? `Reassigned from ${prev} to ${s.who}` : s.who ? `Assigned to ${s.who}` : "Saved"; if (s.state === "Scheduled") this.sel = (schedOpen()[0] || s).id; this.render(); toast(this.lap, msg); }
  a_lschedule(t) {
    this.popover(t, (p) => {
      p.innerHTML = `<div class="pop-h">Schedule audit</div><div class="pop-body">${scheduleForm()}</div><div class="pop-f"><span class="grow"></span><button class="btn btn-primary btn-sm" data-act="toast" data-msg="Audit scheduled">Schedule audit</button></div>`;
      wireSchedule(p, (o, btn) => { const dd = el("div", "dd pop"); dd.style.width = "340px"; btn.parentElement.style.position = "relative"; btn.parentElement.append(dd); linkPicker(dd, { ...o, small: true, focus: true, onPick: (it) => { dd.remove(); o.onPick(it); } }); });
    }, { w: 420, right: true });
  }
}

/* Hotels list: 1,046 hotels, grouped by 200 clients */
class HotelsListLaptop extends LaptopApp {
  constructor(root, o = {}) { super(root, { ...o, role: "admin" }); this.viewer = "admin"; this.q = ""; this.cq = ""; this.client = null; this.shown = 20; this.render(); }
  rows() { const q = this.q.toLowerCase(); return HOTELS_BY_CLIENT.filter((h) => (!this.client || h.g === this.client) && (!q || (h.n + " " + h.c + " " + h.city + " " + h.g).toLowerCase().includes(q))); }
  render() {
    const rows = this.rows();
    this.lframe({
      side: sidebar("admin", "hotels"), back: { label: "Home", tab: "AW" }, crumbs: [["Clients and users"], ["Hotels"]],
      content: lapHead({ title: "Hotels", count: fmtN(rows.length), primary: { label: "New hotel", act: "toast", icon: "plus" } }).replace('data-act="toast"', 'data-act="toast" data-msg="Opens the New hotel form"')
        + `<div class="ltool"><label class="search">${ic("search")}<input class="input sm" type="search" placeholder="Search hotel, code, city or client" data-q value="${esc(this.q)}" aria-label="Search hotels"></label><button class="btn btn-secondary btn-sm" data-act="toast" data-msg="Opens the filter builder">${ic("filter")}Filter</button><button class="btn btn-secondary btn-sm" data-act="toast" data-msg="Sort by name, city or last audit">${ic("sort")}Client, then name</button><span class="grow"></span><button class="btn btn-secondary btn-sm" data-act="toast" data-msg="Choose columns">${ic("columns")}Columns</button></div>
        ${this.client ? `<div class="lchips"><span class="qchip on"><button>Client is ${esc(this.client)}</button><button data-act="noclient" aria-label="Remove filter">${ic("x")}</button></span></div>` : ""}
        <div class="lgrid"><aside class="gby" aria-label="Group by client"><div class="t3" style="font-size:12px;font-weight:500;padding:0 8px 8px">Group by client · ${CLIENTS.length}</div><label class="search">${ic("search")}<input class="input sm" type="search" placeholder="Search 200 clients" data-cq value="${esc(this.cq)}" aria-label="Search clients"></label><div data-clients>${this.clientsHtml()}</div></aside><div class="lbody" data-list>${this.tableHtml(rows)}</div></div>`,
    });
  }
  clientsHtml() {
    const q = this.cq.toLowerCase(), cs = [...CLIENTS].sort().filter((c) => !q || c.toLowerCase().includes(q));
    return `<button class="gby-a ${!this.client ? "on" : ""}" data-act="client" data-v=""><span class="trunc">All clients</span><span class="cnt">${fmtN(HOTELS.length)}</span></button>` + (cs.length ? cs.map((c) => `<button class="gby-a ${this.client === c ? "on" : ""}" data-act="client" data-v="${esc(c)}" title="${esc(c)}"><span class="trunc">${esc(c)}</span><span class="cnt">${hotelCount(c)}</span></button>`).join("") : `<p class="t3" style="padding:8px;font-size:12px">No client matches.</p>`);
  }
  tableHtml(rows) {
    if (!rows.length) return emptyState("search", "No hotels match", "Search by hotel, code, city or client.");
    const s = Math.min(this.shown, rows.length);
    return `<table class="tbl"><thead><tr><th>Hotel</th><th>Client</th><th>City</th><th>Last audit</th><th>Score</th></tr></thead><tbody>${rows.slice(0, s).map((h, i) => { const sc = 60 + ((i * 7 + h.c.length * 3) % 36); return `<tr class="click" data-act="openhotel" data-c="${h.c}"><td class="fg" title="${esc(h.n)} · ${h.c}">${esc(h.n)}</td><td>${esc(h.g)}</td><td>${esc(h.city)}</td><td class="num">${fd("2026-09-" + String(2 + (i % 26)).padStart(2, "0"))}</td><td><span class="num" style="margin-right:8px">${sc}</span>${bandTag(sc)}</td></tr>`; }).join("")}</tbody></table>
      <div class="more-row num"><span>${fmtN(s)} of ${fmtN(rows.length)}</span>${s < rows.length ? `<button class="btn btn-secondary btn-sm" data-act="more">Load more</button>` : ""}</div>`;
  }
  onInput(e) {
    if (e.target.dataset.q != null) { this.q = e.target.value; this.shown = 20; const r = this.rows(); this.lap.querySelector("[data-list]").innerHTML = this.tableHtml(r); this.lap.querySelector("[data-count]").textContent = fmtN(r.length); }
    if (e.target.dataset.cq != null) { this.cq = e.target.value; this.lap.querySelector("[data-clients]").innerHTML = this.clientsHtml(); }
  }
  menuItems() { return [["fileText", "Export as CSV", "toast", "Downloads 1,046 hotels as CSV"], ["uploadCloud", "Import hotels", "toast", "Opens hotel import"]]; }
  a_client(t) { this.client = t.dataset.v || null; this.shown = 20; this.render(); }
  a_noclient() { this.client = null; this.render(); }
  a_more() { this.shown += 20; this.lap.querySelector("[data-list]").innerHTML = this.tableHtml(this.rows()); }
  a_openhotel(t) { goHotel(HOTELS.find((h) => h.c === t.dataset.c), "admin"); }
}

/* Schedule audit form as a full page (link fields for hotel, template and auditor) */
class ScheduleFormPhone extends PhoneApp {
  constructor(root, o = {}) { super(root, { ...o, role: "admin" }); this.v = {}; wireSchedule(this.screen, (oo) => pickerSheet(this.vp, oo), (k, v) => { if (k === "hotel") this.v.hotel = v; if (k === "client") this.v.client = v; if (k === "who") this.v.who = v; if (k !== "client") this.render(); }); this.render(); }
  render() {
    const ok = this.v.hotel && this.v.who;
    this.frame({
      back: { label: "Audits to schedule", tab: "AW" }, ctx: allHotelsCtx,
      head: pageHead({ title: "Schedule audit", primary: { label: "Schedule audit", act: "create", disabled: !ok } }),
      body: `<div style="padding:16px">${scheduleForm({ h: this.v.hotel, g: this.v.client, who: this.v.who })}</div>`,
    });
  }
  menuItems() { return [["calendar", "Check auditor availability", "toast", "Shows each auditor's booked days"]]; }
  a_create() { toast(this.vp, `Audit scheduled at ${this.v.hotel} with ${this.v.who}`); }
}
