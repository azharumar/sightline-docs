/* ================= Issue helpers ================= */
function issueRow(f) {
  return `<button class="row" data-act="openiss" data-id="${f.id}"><span class="row-main"><span class="row-t">${esc(f.label)}</span><span class="row-s"><span class="dot ${ST[f.status].c}"></span>${ST[f.status].l}<span class="sep">·</span><span class="num">${f.iid}</span><span class="sep">·</span><span class="trunc">${esc(f.dept)}</span></span></span><span class="row-r num">${dueText(f)}<span>${esc(f.who.split(" ")[0])}</span></span></button>`;
}
function openIssue(f, host) { if (f === ISSUES[0]) showTab("F"); else toast(host, `Opens issue ${f.iid}. The detail mock shows ${ISSUES[0].iid}.`); }

/* New issue form (manual creation). Shared by the list on phone and laptop. */
const newIssueForm = () => `<label class="fld"><span class="fld-l">Title <span class="warn">Required</span></span><input class="input" data-ni="t" placeholder="What needs to be done?"></label>
  <div class="fld"><span class="fld-l">Hotel</span><button class="input link-in" data-nil="hotel"><span class="v" data-nv="hotel">${esc(hotelName())}</span>${ic("chevronsUpDown")}</button></div>
  <div class="fld-2" style="margin-top:16px"><div class="fld"><span class="fld-l">Department</span><button class="input link-in" data-nil="dept"><span class="v t3" data-nv="dept">Choose</span>${ic("chevronsUpDown")}</button></div><div class="fld"><span class="fld-l">Audit item</span><button class="input link-in" data-nil="item"><span class="v t3" data-nv="item">Optional</span>${ic("chevronsUpDown")}</button></div></div>
  <label class="fld"><span class="fld-l">Observation</span><textarea class="input" rows="2" placeholder="What was found"></textarea></label>
  <label class="fld"><span class="fld-l">Recommendation</span><textarea class="input" rows="2" placeholder="What should be done"></textarea></label>
  <div class="fld-2" style="margin-top:16px"><div class="fld"><span class="fld-l">Assigned to</span><button class="input link-in" data-nil="who"><span class="v t3" data-nv="who">Choose</span>${ic("chevronsUpDown")}</button></div><label class="fld"><span class="fld-l">Due date</span><input class="input" type="date" value="2026-10-18"></label></div>`;
function wireNewIssue(root, openPicker, onCreate) {
  const set = (k, v) => { const s = root.querySelector(`[data-nv="${k}"]`); s.textContent = v; s.classList.remove("t3"); };
  const t = root.querySelector('[data-ni="t"]'), go = root.querySelector("[data-nigo]");
  t.addEventListener("input", () => { go.disabled = !t.value.trim(); });
  root.addEventListener("click", (e) => {
    const l = e.target.closest("[data-nil]");
    if (l) {
      const k = l.dataset.nil;
      const o = k === "hotel" ? hotelOpts(CTX.hotel.c, (h) => set("hotel", h.n)) : k === "dept" ? deptOpts(null, (d) => set("dept", d)) : k === "who" ? peopleOpts("Assigned to", TEAM, null, (p) => set("who", p.n))
        : { title: "Audit item", placeholder: "Search items", allLabel: "Items in Ops & Quality", items: ITEMS, key: (x) => x.code, row: (x) => ({ t: x.label, s: `${x.code} · ${x.dept}` }), text: (x) => x.code + " " + x.label, onPick: (x) => set("item", `${x.code} ${x.label}`) };
      openPicker(o, l);
    }
    if (e.target.closest("[data-nigo]")) onCreate(t.value.trim());
  });
}

/* ================= Filter engine (list view pattern) ================= */
const FF = {
  status: { l: "Status", t: "select", conds: ["is", "is not"], opts: ["open", "progress", "resolved"], lab: (v) => ST[v].l, get: (f) => f.status },
  dept: { l: "Department", t: "link", conds: ["is", "is not"], get: (f) => f.dept, opts: deptOpts },
  who: { l: "Assigned to", t: "link", conds: ["is", "is not"], get: (f) => f.who, opts: (cur, pick) => peopleOpts("Assigned to", TEAM, cur, (p) => pick(p.n)) },
  due: { l: "Due date", t: "date", conds: ["before", "after"], get: (f) => f.due, lab: (v) => fd(v, true) },
  audit: { l: "Audit", t: "link", conds: ["is", "is not"], get: (f) => f.audit, opts: auditOpts },
  resp: { l: "Team response", t: "none", conds: ["is empty", "is set"], get: (f) => f.resp },
};
function test(f, c) {
  const v = FF[c.f].get(f);
  if (c.c === "is empty") return !v; if (c.c === "is set") return !!v;
  if (c.v == null || c.v === "") return true;
  if (c.c === "is") return v === c.v; if (c.c === "is not") return v !== c.v;
  if (c.c === "before") return v < c.v; if (c.c === "after") return v > c.v;
  return true;
}
const chipLabel = (c) => { const F = FF[c.f]; if (F.t === "none") return `${F.l} ${c.c}`; return `${F.l} ${c.c} ${c.v == null ? "..." : F.lab ? F.lab(c.v) : c.v}`; };
const VIEWS = {
  open: { l: "Open issues", f: [{ f: "status", c: "is not", v: "resolved" }] },
  mine: { l: "My open issues", f: [{ f: "who", c: "is", v: "Priya Menon" }, { f: "status", c: "is not", v: "resolved" }] },
  overdue: { l: "Overdue issues", f: [{ f: "due", c: "before", v: TODAY }, { f: "status", c: "is not", v: "resolved" }] },
  waiting: { l: "Waiting for team response", f: [{ f: "resp", c: "is empty" }, { f: "status", c: "is not", v: "resolved" }] },
  all: { l: "All issues", f: [] },
};
const SORTS = { due: "Due date, earliest first", dueDesc: "Due date, latest first", updated: "Last updated", dept: "Department" };
function sortIssues(rows, s) {
  const r = [...rows];
  if (s === "due") r.sort((a, b) => (a.status === "resolved") - (b.status === "resolved") || a.due.localeCompare(b.due));
  if (s === "dueDesc") r.sort((a, b) => b.due.localeCompare(a.due));
  if (s === "updated") r.sort((a, b) => b.updated.localeCompare(a.updated));
  if (s === "dept") r.sort((a, b) => a.dept.localeCompare(b.dept) || a.due.localeCompare(b.due));
  return r;
}
const matchView = (fs) => Object.keys(VIEWS).find((k) => JSON.stringify(VIEWS[k].f) === JSON.stringify(fs)) || null;
const matchQ = (f, q) => !q || (f.label + " " + f.code + " " + f.iid + " " + f.dept + " " + f.who).toLowerCase().includes(q.toLowerCase());
function mountBuilder(box, pending, o) {
  const draw = () => {
    const rows = pending.map((c, i) => {
      const F = FF[c.f];
      const fieldSel = `<select class="input md" data-fb="f" data-i="${i}" aria-label="Field">${Object.entries(FF).map(([k, x]) => `<option value="${k}" ${k === c.f ? "selected" : ""}>${x.l}</option>`).join("")}</select>`;
      const condSel = `<select class="input md" data-fb="c" data-i="${i}" aria-label="Condition">${F.conds.map((x) => `<option ${x === c.c ? "selected" : ""}>${x}</option>`).join("")}</select>`;
      let val = "";
      if (F.t === "select") val = `<select class="input md" data-fb="v" data-i="${i}" aria-label="Value">${F.opts.map((x) => `<option value="${x}" ${x === c.v ? "selected" : ""}>${F.lab(x)}</option>`).join("")}</select>`;
      if (F.t === "link") val = `<span class="rel" style="display:block"><button class="input md link-in" data-fbl="${i}" aria-label="Choose ${F.l.toLowerCase()}"><span class="v ${c.v ? "" : "t3"}">${esc(c.v || "Choose " + F.l.toLowerCase())}</span>${ic("chevronsUpDown")}</button></span>`;
      if (F.t === "date") val = `<input class="input md" type="date" data-fb="v" data-i="${i}" value="${c.v || ""}" aria-label="Date">`;
      const rm = `<button class="icon-btn sm" data-fbrm="${i}" aria-label="Remove filter">${ic("x", "ic-16")}</button>`;
      if (o.laptop) return `<div class="fbl"><span class="w">${i ? "and" : "Where"}</span>${fieldSel}${condSel}${val || "<span></span>"}${rm}</div>`;
      return `<div class="fb-item"><div class="fb-where">${i ? "and" : "Where"}</div><div class="fb-line">${fieldSel}${condSel}${rm}</div>${val ? `<div style="margin-top:8px">${val}</div>` : ""}</div>`;
    }).join("");
    box.innerHTML = (pending.length ? rows : emptyState("filter", "No filters", "Add a filter to narrow the list.")) + `<div style="padding:${o.laptop ? "4px 16px 8px" : "8px 0"}"><button class="btn-text sm" data-fbadd>${ic("plus")}Add a filter</button></div>`;
  };
  box.addEventListener("change", (e) => {
    const t = e.target, i = +t.dataset.i, k = t.dataset.fb; if (!k) return;
    if (k === "f") { const F = FF[t.value]; pending[i] = { f: t.value, c: F.conds[0], v: F.t === "select" ? F.opts[0] : null }; }
    if (k === "c") pending[i].c = t.value;
    if (k === "v") pending[i].v = t.value;
    draw();
  });
  box.addEventListener("click", (e) => {
    const add = e.target.closest("[data-fbadd]"), rm = e.target.closest("[data-fbrm]"), lk = e.target.closest("[data-fbl]");
    if (add) { pending.push({ f: "dept", c: "is", v: null }); draw(); }
    if (rm) { pending.splice(+rm.dataset.fbrm, 1); draw(); }
    if (lk) { const c = pending[+lk.dataset.fbl], F = FF[c.f]; const pick = (v) => { c.v = typeof v === "string" ? v : v.n || v; draw(); }; o.onLink(F.opts(c.v, pick), lk); }
  });
  draw();
  return { draw };
}

/* ================= Issues list: phone ================= */
class IssueListPhone extends PhoneApp {
  constructor(root, o = {}) { super(root, o); this.filters = clone(VIEWS.open.f); this.view = "open"; this.sort = "due"; this.q = ""; this.shown = 20; this.render(); if (o.openBuilder) this.openFilters(true); }
  rows() { return sortIssues(ISSUES.filter((f) => this.filters.every((c) => test(f, c)) && matchQ(f, this.q)), this.sort); }
  render() {
    const rows = this.rows(), vl = this.view ? VIEWS[this.view].l : "Custom view";
    const chips = this.filters.map((c, i) => `<span class="qchip on"><button data-act="${["status", "dept", "who"].includes(c.f) ? "qf" : "filters"}" data-f="${c.f}">${esc(chipLabel(c))}</button><button data-act="rmf" data-i="${i}" aria-label="Remove filter ${esc(chipLabel(c))}">${ic("x")}</button></span>`).join("")
      + ["status", "dept", "who"].filter((k) => !this.filters.some((c) => c.f === k)).map((k) => `<button class="qchip" data-act="qf" data-f="${k}">${FF[k].l}${ic("chevronDown")}</button>`).join("");
    this.frame({
      back: { label: "Home", tab: "D" }, ctx: hotelCtx(hotelName(), false),
      head: pageHead({ title: vl, titleAct: "views", titleLabel: `Saved views. Current: ${vl}`, count: rows.length, primary: { label: "New issue", act: "newissue", icon: "plus" } })
        + `<div class="toolbar"><label class="search grow">${ic("search")}<input class="input" type="search" placeholder="Search issues" value="${esc(this.q)}" data-q aria-label="Search issues"></label><button class="icon-btn bd" data-act="filters" aria-label="Filters">${ic("filter")}${this.filters.length ? `<span class="badge num">${this.filters.length}</span>` : ""}</button><button class="icon-btn bd" data-act="sort" aria-label="Sort. ${SORTS[this.sort]}">${ic("sort")}</button></div><div class="qf">${chips}</div>`,
      body: `<div data-list>${this.listHtml(rows)}</div>`, nav: [this.role, "issues"],
    });
  }
  menuItems() { return [["bookmark", "Save current view", "toast", "Saves these filters and sort as your own view"], ["fileText", "Export as CSV", "toast", "Downloads the list as CSV"]]; }
  listHtml(rows) {
    if (this.loading) return `<div class="list-meta"><span class="sk" style="height:12px;width:120px"></span></div>` + skRows(7);
    if (!rows.length) return this.filters.length || this.q
      ? emptyState("filter", "No issues match", `Nothing matches these filters${this.q ? ` and "${esc(this.q)}"` : ""}.`, `<button class="btn btn-secondary" data-act="clear">Clear filters</button>`)
      : emptyState("inbox", "No issues yet", "Raise an issue from an audit item, or tap New issue.");
    const n = rows.length, s = Math.min(this.shown, n);
    return `<div class="list-meta num"><span>${SORTS[this.sort]}</span><span>${s} of ${n}</span></div>` + rows.slice(0, s).map(issueRow).join("") + `<div class="more-row num"><span>${s} of ${n}</span>${s < n ? `<button class="btn btn-secondary btn-sm" data-act="more">Load more</button>` : ""}</div>`;
  }
  drawList() { const rows = this.rows(); this.screen.querySelector("[data-list]").innerHTML = this.listHtml(rows); this.screen.querySelector("[data-count]").textContent = rows.length; }
  reload() { this.view = matchView(this.filters); this.shown = 20; this.loading = true; this.render(); clearTimeout(this._t); this._t = setTimeout(() => { this.loading = false; this.render(); }, 450); }
  onInput(e) { if (e.target.dataset.q != null) { this.q = e.target.value; this.shown = 20; this.drawList(); } }
  a_more() { this.shown += 20; this.drawList(); }
  a_clear() { this.filters = []; this.q = ""; this.reload(); }
  a_rmf(t) { this.filters.splice(+t.dataset.i, 1); this.reload(); }
  a_openiss(t) { openIssue(ISSUES[+t.dataset.id], this.vp); }
  setField(k, c, v) { const i = this.filters.findIndex((x) => x.f === k); const nf = { f: k, c, v }; if (i >= 0) this.filters[i] = nf; else this.filters.push(nf); this.reload(); }
  a_qf(t) {
    const k = t.dataset.f;
    if (k === "status") {
      const opts = [["is", "open", "Open"], ["is", "progress", "In progress"], ["is", "resolved", "Resolved"], ["is not", "resolved", "Not resolved"]];
      const cur = this.filters.find((x) => x.f === "status");
      const s = openSheet(this.vp, sheetHead("Status") + `<div class="sh-body">${opts.map(([c, v, l], i) => `<button class="menu-row" data-o="${i}">${c === "is" ? `<span class="dot ${ST[v].c}"></span>` : `<span class="dot dot-ring"></span>`}${l}${cur && cur.c === c && cur.v === v ? `<span class="r">${ic("check")}</span>` : ""}</button>`).join("")}</div>`, { label: "Status" });
      s.el.addEventListener("click", (e) => { const b = e.target.closest("[data-o]"); if (!b) return; const [c, v] = opts[+b.dataset.o]; s.close(); this.setField("status", c, v); });
      return;
    }
    const cur = (this.filters.find((x) => x.f === k) || {}).v;
    pickerSheet(this.vp, FF[k].opts(cur, (v) => this.setField(k, "is", typeof v === "string" ? v : v.n)));
  }
  a_views() {
    const s = openSheet(this.vp, sheetHead("Saved views") + `<div class="sh-body">${Object.entries(VIEWS).map(([k, v]) => `<button class="menu-row" data-v="${k}">${ic("bookmark")}${v.l}<span class="r num">${ISSUES.filter((f) => v.f.every((c) => test(f, c))).length}${this.view === k ? ic("check") : ""}</span></button>`).join("")}</div>`, { label: "Saved views" });
    s.el.addEventListener("click", (e) => { const b = e.target.closest("[data-v]"); if (!b) return; s.close(); this.filters = clone(VIEWS[b.dataset.v].f); this.reload(); });
  }
  a_sort() {
    const s = openSheet(this.vp, sheetHead("Sort by") + `<div class="sh-body">${Object.entries(SORTS).map(([k, l]) => `<button class="menu-row" data-s="${k}">${l}${this.sort === k ? `<span class="r">${ic("check")}</span>` : ""}</button>`).join("")}</div>`, { label: "Sort" });
    s.el.addEventListener("click", (e) => { const b = e.target.closest("[data-s]"); if (!b) return; s.close(); this.sort = b.dataset.s; this.reload(); });
  }
  a_filters() { this.openFilters(false); }
  openFilters(instant) {
    const pending = clone(this.filters);
    if (instant) pending.push({ f: "dept", c: "is", v: "Rooms & Housekeeping" });
    const s = openSheet(this.vp, sheetHead("Filters", "Issues that match all of these") + `<div class="sh-body sh-pad fbbox"></div><div class="sh-foot"><button class="btn-text" data-clear>Clear all</button><span class="grow"></span><button class="btn btn-primary" data-apply>Apply</button></div>`, { full: true, instant, label: "Filters" });
    const b = mountBuilder(s.el.querySelector(".fbbox"), pending, { onLink: (opts) => pickerSheet(this.vp, opts) });
    s.el.addEventListener("click", (e) => {
      if (e.target.closest("[data-clear]")) { pending.length = 0; b.draw(); }
      if (e.target.closest("[data-apply]")) { this.filters = pending.filter((c) => c.v != null || FF[c.f].t === "none"); s.close(); this.reload(); }
    });
  }
  a_newissue() {
    const s = openSheet(this.vp, sheetHead("New issue", esc(hotelName())) + `<div class="sh-body sh-pad">${newIssueForm()}</div><div class="sh-foot"><button class="btn btn-primary btn-block" data-nigo disabled>Create issue</button></div>`, { full: true, label: "New issue" });
    wireNewIssue(s.el, (o) => pickerSheet(this.vp, o), (t) => { s.close(); toast(this.vp, `Issue ISS-1100 created: ${t}`); });
  }
}

/* ================= Issues list: laptop ================= */
const COLS = [["status", "Status"], ["iid", "Issue"], ["label", "Title"], ["dept", "Department"], ["who", "Assigned to"], ["due", "Due"], ["audit", "Audit"], ["updated", "Updated"]];
function cell(f, k) {
  if (k === "status") return `<td>${stat(f.status)}</td>`;
  if (k === "iid") return `<td class="num">${f.iid}</td>`;
  if (k === "label") return `<td class="fg">${esc(f.label)}</td>`;
  if (k === "due") return `<td class="num">${isOver(f) ? `<span class="overdue">${fd(f.due)}</span>` : fd(f.due)}</td>`;
  if (k === "updated") return `<td class="num">${fd(f.updated)}</td>`;
  if (k === "who") return `<td><span style="display:inline-flex;align-items:center;gap:8px"><span class="av sm">${ini(f.who)}</span>${esc(f.who)}</span></td>`;
  return `<td>${esc(f[k])}</td>`;
}
class IssueListLaptop extends LaptopApp {
  constructor(root, o = {}) { super(root, o); this.filters = clone(VIEWS.open.f); this.view = "open"; this.sort = "due"; this.q = ""; this.shown = 20; this.gby = "status"; this.cols = new Set(["status", "iid", "label", "dept", "who", "due"]); this.render(); }
  rows() { return sortIssues(ISSUES.filter((f) => this.filters.every((c) => test(f, c)) && matchQ(f, this.q)), this.sort); }
  render() {
    const rows = this.rows(), vl = this.view ? VIEWS[this.view].l : "Custom view";
    this.lframe({
      side: sidebar("manager", "issues", { hotel: hotelName() }), back: { label: "Home", tab: "D" }, crumbs: [[hotelName()], ["Issues"]],
      content: lapHead({ title: vl, titleAct: "views", count: rows.length, primary: { label: "New issue", act: "newissue", icon: "plus" } })
        + `<div class="ltool"><label class="search">${ic("search")}<input class="input sm" type="search" placeholder="Search issues" value="${esc(this.q)}" data-q aria-label="Search issues"></label>
          <button class="btn btn-secondary btn-sm" data-act="lfilters" data-anchor="f">${ic("filter")}Filter${this.filters.length ? ` <span class="cnt-b">${this.filters.length}</span>` : ""}</button>
          <button class="btn btn-secondary btn-sm" data-act="lsort">${ic("sort")}${SORTS[this.sort]}</button><span class="grow"></span>
          <button class="btn btn-secondary btn-sm" data-act="lcols">${ic("columns")}Columns</button></div>
        ${this.filters.length ? `<div class="lchips">${this.filters.map((c, i) => `<span class="qchip on"><button data-act="lfilters">${esc(chipLabel(c))}</button><button data-act="rmf" data-i="${i}" aria-label="Remove filter">${ic("x")}</button></span>`).join("")}<button class="btn-text sm" data-act="clear">Clear</button></div>` : ""}
        <div class="lgrid"><aside class="gby" aria-label="Group by">${this.gbyHtml()}</aside><div class="lbody" data-list>${this.tableHtml(rows)}</div></div>`,
    });
  }
  menuItems() { return [["bookmark", "Save current view", "toast", "Saves the filters, sort and columns as your own view"], ["fileText", "Export as CSV", "toast", "Downloads the list as CSV"]]; }
  gbyHtml() {
    const labels = { status: "Status", dept: "Department", who: "Assigned to" };
    const others = this.filters.filter((c) => c.f !== this.gby);
    const base = ISSUES.filter((f) => others.every((c) => test(f, c)) && matchQ(f, this.q));
    const keys = this.gby === "status" ? ["open", "progress", "resolved"] : this.gby === "dept" ? DEPTS : TEAM.map((p) => p.n);
    const curF = this.filters.find((c) => c.f === this.gby && c.c === "is");
    let h = `<button class="btn btn-ghost btn-sm" data-act="gby" style="margin:0 0 8px -2px;flex:none">Group by ${labels[this.gby]}${ic("chevronDown")}</button>`;
    h += `<button class="gby-a ${!curF ? "on" : ""}" data-act="gpick" data-v=""><span class="trunc">All</span><span class="cnt">${base.length}</span></button>`;
    keys.forEach((k) => { h += `<button class="gby-a ${curF && curF.v === k ? "on" : ""}" data-act="gpick" data-v="${esc(k)}">${this.gby === "status" ? `<span class="dot ${ST[k].c}"></span>` : ""}<span class="trunc">${esc(this.gby === "status" ? ST[k].l : k)}</span><span class="cnt">${base.filter((f) => FF[this.gby].get(f) === k).length}</span></button>`; });
    return h;
  }
  tableHtml(rows) {
    if (this.loading) return `<table class="tbl"><tbody>${Array.from({ length: 10 }, (_, i) => `<tr><td colspan="8"><span class="sk" style="height:12px;width:${40 + ((i * 37) % 50)}%"></span></td></tr>`).join("")}</tbody></table>`;
    if (!rows.length) return emptyState("filter", "No issues match", "Nothing matches these filters.", `<button class="btn btn-secondary btn-sm" data-act="clear">Clear filters</button>`);
    const cols = COLS.filter(([k]) => this.cols.has(k)), n = rows.length, s = Math.min(this.shown, n);
    return `<table class="tbl"><thead><tr>${cols.map(([, l]) => `<th>${l}</th>`).join("")}</tr></thead><tbody>${rows.slice(0, s).map((f) => `<tr class="click" data-act="openiss" data-id="${f.id}">${cols.map(([k]) => cell(f, k)).join("")}</tr>`).join("")}</tbody></table>
      <div class="more-row num"><span>${s} of ${n}</span>${s < n ? `<button class="btn btn-secondary btn-sm" data-act="more">Load more</button>` : ""}<span class="t3" style="margin-left:auto">Press <span class="kbd">/</span> to search</span></div>`;
  }
  reload() { this.view = matchView(this.filters); this.shown = 20; this.loading = true; this.render(); clearTimeout(this._t); this._t = setTimeout(() => { this.loading = false; this.render(); }, 400); }
  onInput(e) { if (e.target.dataset.q != null) { this.q = e.target.value; this.shown = 20; this.lap.querySelector("[data-list]").innerHTML = this.tableHtml(this.rows()); this.lap.querySelector("[data-count]").textContent = this.rows().length; this.lap.querySelector(".gby").innerHTML = this.gbyHtml(); } }
  a_more() { this.shown += 20; this.lap.querySelector("[data-list]").innerHTML = this.tableHtml(this.rows()); }
  a_clear() { this.filters = []; this.q = ""; this.reload(); }
  a_rmf(t) { this.filters.splice(+t.dataset.i, 1); this.reload(); }
  a_openiss(t) { openIssue(ISSUES[+t.dataset.id], this.lap); }
  a_gby() { this.gby = { status: "dept", dept: "who", who: "status" }[this.gby]; this.lap.querySelector(".gby").innerHTML = this.gbyHtml(); }
  a_gpick(t) { this.filters = this.filters.filter((c) => c.f !== this.gby); if (t.dataset.v) this.filters.push({ f: this.gby, c: "is", v: t.dataset.v }); this.reload(); }
  a_views(t) {
    this.popover(t, (p) => {
      p.innerHTML = `<div class="pop-list">${Object.entries(VIEWS).map(([k, v]) => `<button class="menu-row" data-v="${k}">${ic("bookmark")}${v.l}<span class="r num">${ISSUES.filter((f) => v.f.every((c) => test(f, c))).length}${this.view === k ? ic("check") : ""}</span></button>`).join("")}</div>`;
      p.addEventListener("click", (e) => { const b = e.target.closest("[data-v]"); if (!b) return; this.filters = clone(VIEWS[b.dataset.v].f); this.reload(); });
    }, { w: 300 });
  }
  a_lsort(t) {
    this.popover(t, (p) => {
      p.innerHTML = `<div class="pop-list">${Object.entries(SORTS).map(([k, l]) => `<button class="menu-row" data-s="${k}">${l}${this.sort === k ? `<span class="r">${ic("check")}</span>` : ""}</button>`).join("")}</div>`;
      p.addEventListener("click", (e) => { const b = e.target.closest("[data-s]"); if (!b) return; this.sort = b.dataset.s; this.reload(); });
    }, { w: 260 });
  }
  a_lcols(t) {
    this.popover(t, (p) => {
      p.innerHTML = `<div class="pop-h">Columns</div><div class="pop-list colpick">${COLS.map(([k, l]) => `<label><input type="checkbox" data-col="${k}" ${this.cols.has(k) ? "checked" : ""} ${k === "label" ? "disabled" : ""}>${l}</label>`).join("")}</div>`;
      p.addEventListener("change", (e) => { const k = e.target.dataset.col; if (!k) return; e.target.checked ? this.cols.add(k) : this.cols.delete(k); this.lap.querySelector("[data-list]").innerHTML = this.tableHtml(this.rows()); });
    }, { w: 220, right: true });
  }
  a_lfilters() { this.openBuilder(clone(this.filters)); }
  openBuilder(pending) {
    const anchor = this.lap.querySelector('[data-anchor="f"]');
    this.popover(anchor, (p) => {
      p.innerHTML = `<div class="pop-h">Filters</div><div class="fbbox"></div><div class="pop-f"><button class="btn-text sm" data-clear>Clear all</button><span class="grow"></span><button class="btn btn-secondary btn-sm" data-cancel>Cancel</button><button class="btn btn-primary btn-sm" data-apply>Apply</button></div>`;
      const box = p.querySelector(".fbbox");
      const b = mountBuilder(box, pending, {
        laptop: true,
        onLink: (opts, btn) => {
          p.querySelectorAll(".dd").forEach((d) => d.remove());
          const dd = el("div", "dd pop"); dd.style.width = "320px"; btn.parentElement.append(dd);
          linkPicker(dd, { ...opts, small: true, focus: true, onPick: (it) => { dd.remove(); opts.onPick(it); } });
        },
      });
      p.addEventListener("click", (e) => {
        if (e.target.closest("[data-clear]")) { pending.length = 0; b.draw(); }
        if (e.target.closest("[data-cancel]")) this.closePop();
        if (e.target.closest("[data-apply]")) { this.filters = pending.filter((c) => c.v != null || FF[c.f].t === "none"); this.reload(); }
      });
    }, { w: 640 });
  }
  a_newissue(t) {
    this.popover(t, (p) => {
      p.innerHTML = `<div class="pop-h">New issue</div><div class="pop-body">${newIssueForm()}</div><div class="pop-f"><span class="grow"></span><button class="btn btn-secondary btn-sm" data-act="toast" data-msg="Cancelled">Cancel</button><button class="btn btn-primary btn-sm" data-nigo disabled>Create issue</button></div>`;
      wireNewIssue(p, (o, btn) => { p.querySelectorAll(".dd").forEach((d) => d.remove()); const dd = el("div", "dd pop"); dd.style.width = "320px"; dd.style.position = "absolute"; btn.parentElement.style.position = "relative"; btn.parentElement.append(dd); linkPicker(dd, { ...o, small: true, focus: true, onPick: (it) => { dd.remove(); o.onPick(it); } }); }, (tt) => { this.closePop(); toast(this.lap, `Issue ISS-1100 created: ${tt}`); });
    }, { w: 520, right: true });
  }
}

/* ================= Issue detail (shared state for phone and laptop) ================= */
const FX = {
  f: ISSUES[0], role: "Department Head",
  tl: [
    { k: "change", who: "Rohan Iyer", text: "raised this issue from Ops & Quality, September 2026, item FO-004 (score 1)", rel: "11 days ago", t: "23 Sep 2026, 10:02 AM" },
    { k: "change", who: "Priya Menon", text: "assigned this to Latha Krishnan and set the due date to 28 Sep 2026", rel: "11 days ago", t: "23 Sep 2026, 10:15 AM" },
    { k: "comment", who: "Latha Krishnan", text: "Asha is checking the minibar charges on all September folios.", rel: "9 days ago", t: "25 Sep 2026, 4:40 PM" },
    { k: "change", who: "Asha Kumari", text: "attached Folio check September.xlsx", rel: "2 days ago", t: "2 Oct 2026, 9:05 AM" },
    { k: "comment", who: "Priya Menon", text: "Please share the corrected folios here when done.", rel: "2 h ago", t: "4 Oct 2026, 9:12 AM" },
  ],
  files: [["Bill 2231.jpg", "310 KB"], ["Bill 2240.jpg", "290 KB"], ["Folio check September.xlsx", "48 KB"]],
  subs: [], notify() { this.subs.forEach((s) => s.render()); },
};
const NEXT = { open: { l: "Start work", to: "progress" }, progress: { l: "Mark resolved", to: "resolved" } };
function fxStatus(to) { const from = FX.f.status; FX.f.status = to; FX.f.updated = TODAY; FX.tl.push({ k: "status", who: "Priya Menon", from, to, rel: "Just now", t: "4 Oct 2026, 11:48 AM" }); FX.notify(); }
function fxAssign(n) { const from = FX.f.who; if (from === n) return; FX.f.who = n; FX.tl.push({ k: "change", who: "Priya Menon", text: `changed Assigned to from ${from} to ${n}`, rel: "Just now", t: "4 Oct 2026, 11:48 AM" }); FX.notify(); }
function fxComment(text) { FX.tl.push({ k: "comment", who: "Priya Menon", text, rel: "Just now", t: "4 Oct 2026, 11:48 AM" }); FX.notify(); }
function tlHtml(filter) {
  return FX.tl.filter((e) => filter === "all" || (filter === "comments" ? e.k === "comment" : e.k !== "comment")).map((e) => {
    const time = `<span class="tl-time num" title="${e.t}">${e.rel}</span>`;
    if (e.k === "comment") return `<li class="tl c"><span class="av">${ini(e.who)}</span><div class="tl-b"><b>${e.who}</b> ${time}<p>${esc(e.text)}</p></div></li>`;
    if (e.k === "status") return `<li class="tl"><span class="tl-dot"><span class="dot ${ST[e.to].c}"></span></span><div class="tl-b"><b>${e.who}</b> changed status from ${ST[e.from].l} to ${ST[e.to].l} · ${time}</div></li>`;
    return `<li class="tl"><span class="tl-dot"><span class="dot"></span></span><div class="tl-b"><b>${e.who}</b> ${esc(e.text)} · ${time}</div></li>`;
  }).join("") || `<li class="t3" style="padding:12px 0">Nothing here yet.</li>`;
}
function fxSections(open) {
  const f = FX.f, cs = (k, title, body) => `<section class="cs"><button class="cs-h" data-act="cs" data-k="${k}" aria-expanded="${open[k]}">${title}${ic("chevronDown", "ic-16")}</button><div class="cs-b">${body}</div></section>`;
  const kv = (k, v, full) => `<div class="kv ${full ? "full" : ""}"><div class="k">${k}</div><div class="v">${v}</div></div>`;
  return cs("finding", "Finding", kv("Observation", esc(f.obs), 1) + kv("Recommendation", esc(f.rec), 1) + kv("Score", `${scoreChip(f.score)} <span class="t3" style="font-size:12px">in ${esc(f.audit)}</span>`, 1) + `<div class="kv full"><div class="k">Evidence</div><div class="thumbs" style="margin-top:4px"><div class="thumb">${ic("image")}<span>Bill 2231</span></div><div class="thumb">${ic("image")}<span>Bill 2240</span></div></div></div>`)
    + cs("team", "Team response", kv("Responded by", `Latha Krishnan, ${FX.role}`) + kv("Reason", esc(f.reason)) + kv("Team response", esc(f.resp), 1))
    + cs("details", "Details", kv("Department", esc(f.dept)) + kv("Audit item", `<span class="num">${f.code}</span> ${esc(f.label)}`) + kv("Raised by", "Rohan Iyer, Auditor") + kv("Hotel", esc(hotelName())) + kv("Raised", "23 Sep 2026, 10:02 AM") + kv("Issue", `<span class="num">${f.iid}</span>`));
}
const relHtml = () => `
  <button class="rel-row" data-act="assign"><span class="k">Assigned to</span><span class="v"><span class="av sm">${ini(FX.f.who)}</span>${esc(FX.f.who)}</span>${ic("chevronsUpDown")}</button>
  <button class="rel-row" data-act="toast" data-msg="Opens a date picker"><span class="k">Due date</span><span class="v num">${fd(FX.f.due, true)}</span>${ic("calendar")}</button>
  <button class="rel-row" data-act="toast" data-msg="Lists the 3 attachments"><span class="k">Attachments</span><span class="v"><span class="cnt-b">${FX.files.length}</span></span>${ic("chevronRight")}</button>
  <button class="rel-row" data-act="go" data-tab="AV"><span class="k">Audit</span><span class="v">Ops & Quality, September 2026</span>${ic("chevronRight")}</button>
  <button class="rel-row" data-act="toast" data-msg="Lists earlier issues on FO-004"><span class="k">Earlier issues</span><span class="v"><span class="cnt-b">2</span>on this item</span>${ic("chevronRight")}</button>`;
const fxMenu = () => [["userPlus", "Change assignee", "assign"], ["calendar", "Change due date", "toast", "Opens a date picker"], ...(FX.f.status === "resolved" ? [["rotate", "Reopen issue", "reopen"]] : []), ["link", "Copy link", "toast", "Link copied"]];
const dueMeta = (f) => f.status === "resolved" ? "Resolved" : isOver(f) ? `<span class="overdue">Due ${fd(f.due)}, ${dayDiff(TODAY, f.due)} days overdue</span>` : "Due " + fd(f.due);
class IssueDetailPhone extends PhoneApp {
  constructor(root, o = {}) { super(root, o); this.open = { finding: true, team: true, details: false }; this.af = "all"; FX.subs.push(this); this.render(); }
  render() {
    const f = FX.f, n = NEXT[f.status];
    this.frame({
      back: { label: "Issues", tab: "E" }, ctx: hotelCtx(hotelName(), false), keep: true,
      head: pageHead({ title: f.label, meta: `${pill(f.status)}<span class="num">${f.iid}</span><span class="sep">·</span><span class="num">${dueMeta(f)}</span>`, primary: n ? { label: n.l, act: "advance" } : null }),
      body: fxSections(this.open) + `<section class="cs"><div class="cs-h">People and related records</div><div style="padding:0 16px 8px">${relHtml()}</div></section>`
        + secH("Activity", `<div class="seg3" role="group" aria-label="Show">${[["all", "All"], ["comments", "Comments"], ["changes", "Changes"]].map(([k, l]) => `<button data-act="af" data-k="${k}" aria-pressed="${this.af === k}">${l}</button>`).join("")}</div>`) + `<ul class="tl-list">${tlHtml(this.af)}</ul>`,
      after: `<div class="composer"><button class="icon-btn" data-act="toast" data-msg="Attach a photo or file to your comment" aria-label="Attach">${ic("paperclip")}</button><input class="input" placeholder="Add a comment" data-cmt aria-label="Add a comment"><button class="icon-btn" data-act="send" aria-label="Send">${ic("send")}</button></div>`,
    });
    this.screen.querySelector("[data-cmt]").addEventListener("keydown", (e) => { if (e.key === "Enter") this.a_send(); });
  }
  menuItems() { return fxMenu(); }
  a_cs(t) { this.open[t.dataset.k] = !this.open[t.dataset.k]; this.render(); }
  a_af(t) { this.af = t.dataset.k; this.render(); }
  a_advance() { const n = NEXT[FX.f.status]; fxStatus(n.to); toast(this.vp, `Status changed to ${ST[n.to].l}`); }
  a_send() { const i = this.screen.querySelector("[data-cmt]"); if (!i.value.trim()) return; fxComment(i.value.trim()); const sc = this.screen.querySelector(".scroll"); sc.scrollTop = sc.scrollHeight; }
  a_assign() { this.closeMenu(); pickerSheet(this.vp, peopleOpts("Assigned to", TEAM, FX.f.who, (p) => fxAssign(p.n))); }
  a_reopen() { this.closeMenu(); fxStatus("open"); }
}
class IssueDetailLaptop extends LaptopApp {
  constructor(root, o = {}) { super(root, o); this.open = { finding: true, team: true, details: true }; this.af = "all"; FX.subs.push(this); this.render(); }
  render() {
    const f = FX.f, n = NEXT[f.status];
    this.lframe({
      side: sidebar("manager", "issues", { hotel: hotelName() }), back: { label: "Issues", tab: "E" }, crumbs: [[hotelName()], ["Issues", "E"], [f.iid]],
      content: `<div class="dform"><div class="dform-main" style="padding:0">${lapHead({ title: f.label, status: pill(f.status), meta: `<span class="num">${f.iid}</span><span class="sep">·</span><span class="num">${dueMeta(f)}</span><span class="sep">·</span>${esc(f.dept)}`, primary: n ? { label: n.l, act: "advance" } : null })}
        <div style="padding:0 24px 32px"><div style="border-top:1px solid var(--line)">${fxSections(this.open)}</div>
        <div class="lsec-h" style="margin-top:24px"><h2 class="h2 grow">Activity</h2><div class="seg3" role="group" aria-label="Show">${[["all", "All"], ["comments", "Comments"], ["changes", "Changes"]].map(([k, l]) => `<button data-act="af" data-k="${k}" aria-pressed="${this.af === k}">${l}</button>`).join("")}</div></div>
        <ul class="tl-list">${tlHtml(this.af)}</ul>
        <div style="display:flex;gap:8px;align-items:flex-start"><span class="av">PM</span><div class="grow"><textarea class="input" rows="2" placeholder="Add a comment" data-cmt aria-label="Add a comment" style="min-height:64px"></textarea><div style="display:flex;gap:8px;margin-top:8px"><button class="btn btn-ghost btn-sm" data-act="toast" data-msg="Attach a photo or file">${ic("paperclip")}Attach</button><span class="grow"></span><button class="btn btn-secondary btn-sm" data-act="send">Comment</button></div></div></div></div></div>
      <aside class="dform-side" aria-label="Issue sidebar">
        <div><div class="k">Assigned to</div><button class="input md link-in" data-act="lassign"><span class="av sm">${ini(f.who)}</span><span class="v">${esc(f.who)}</span>${ic("chevronsUpDown")}</button></div>
        <div><div class="k">Due date</div><button class="input md link-in" data-act="toast" data-msg="Opens a date picker"><span class="v num ${isOver(f) ? "overdue" : ""}">${fd(f.due, true)}</span>${ic("calendar")}</button></div>
        <div><div class="k">Attachments <span class="cnt-b">${FX.files.length}</span></div>${FX.files.map(([nn, s]) => `<div class="ev-li">${ic("fileText")}<span class="grow trunc">${nn}</span><span class="t3 num" style="font-size:12px">${s}</span></div>`).join("")}</div>
        <div><div class="k">Related</div>
          <button class="rel-row" data-act="go" data-tab="AV"><span class="v">Ops & Quality, September 2026</span>${ic("chevronRight")}</button>
          <button class="rel-row" data-act="toast" data-msg="Lists earlier issues on FO-004"><span class="v">Earlier issues on this item</span><span class="cnt-b">2</span></button></div>
      </aside></div>`,
    });
    this.lap.querySelector("[data-cmt]").addEventListener("keydown", (e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) this.a_send(); });
  }
  menuItems() { return fxMenu(); }
  a_cs(t) { this.open[t.dataset.k] = !this.open[t.dataset.k]; this.render(); }
  a_af(t) { this.af = t.dataset.k; this.render(); }
  a_advance() { fxStatus(NEXT[FX.f.status].to); }
  a_send() { const i = this.lap.querySelector("[data-cmt]"); if (i.value.trim()) fxComment(i.value.trim()); }
  a_assign() { this.a_lassign(this.lap.querySelector('[data-act="lassign"]')); }
  a_reopen() { fxStatus("open"); }
  a_lassign(t) { this.popover(t, (p) => { const b = el("div"); p.append(b); linkPicker(b, { ...peopleOpts("Assigned to", TEAM, FX.f.who, null), small: true, focus: true, onPick: (it) => { this.closePop(); fxAssign(it.n); } }); }, { w: 280 }); }
}

/* ================= Hotel dashboard (Hotel Manager home; Admin lands here after switching hotel) ================= */
const attention = () => [...ISSUES.filter(isOver).sort((a, b) => a.due.localeCompare(b.due)), ...ISSUES.filter((f) => waiting(f) && !isOver(f))];
function numbers() { return { open: ISSUES.filter((f) => f.status !== "resolved").length, over: ISSUES.filter(isOver).length, wait: ISSUES.filter(waiting).length }; }
function hotelScore() { let h = 0; for (const ch of CTX.hotel.c) h = (h * 31 + ch.charCodeAt(0)) % 997; return CTX.hotel.c === "HVH" ? 78 : 62 + (h % 30); }
function dashCards(lap) {
  const n = numbers(), L = CTX.long, sc = hotelScore();
  const c = [
    { k: L ? "Property score in the latest audit, Ops & Quality" : "Property score", v: sc, s: `<span class="dot ${band(sc)[1]}"></span>${band(sc)[0]} · Up 4 since June`, st: `${band(sc)[0]}. Up 4 since June`, msg: "Opens score history" },
    { k: L ? "Open issues across all departments" : "Open issues", v: L ? "1,248" : n.open, act: "go", tab: "E" },
    { k: L ? "Overdue issues past their due date" : "Overdue", v: n.over, s: L ? "Oldest is 6 days overdue, Front Office & Guest Services" : "Oldest 6 days", act: "go", tab: "E" },
    { k: L ? "Waiting for team response from department heads" : "Waiting for team response", v: n.wait, act: "go", tab: "E" },
  ];
  if (lap) c.push({ k: L ? "Red flags in the latest submitted audit" : "Red flags", v: 0, s: "None in September" });
  return ncards(c);
}
class HotelDashPhone extends PhoneApp {
  constructor(root, o = {}) { super(root, o); this.render(); }
  get viewer() { return CTX.viewer; }
  render() {
    const admin = CTX.viewer === "admin";
    const body = this.loading
      ? `<div class="sec-h"><span class="sk" style="height:16px;width:180px"></span></div>${skRows(4)}<div class="ncards" aria-hidden="true">${Array.from({ length: 4 }, () => `<div class="ncard"><span class="sk" style="height:12px;width:60%"></span><span class="sk" style="height:20px;width:40%;margin-top:8px"></span></div>`).join("")}</div>`
      : secH("Needs your attention", `<button class="btn-text sm" data-act="go" data-tab="E">See all</button>`)
        + attention().slice(0, 4).map((f) => `<button class="row" data-act="openiss" data-id="${f.id}"><span class="row-main"><span class="row-t">${esc(f.label)}</span><span class="row-s"><span class="dot ${ST[f.status].c}"></span>${ST[f.status].l}<span class="sep">·</span><span class="num">${f.iid}</span></span></span><span class="row-r num">${isOver(f) ? dueText(f) : "No team response"}</span></button>`).join("")
        + dashCards(false)
        + secH("Latest audit", `<button class="btn-text sm" data-act="toast" data-msg="Opens Audits">See all</button>`)
        + `<button class="row" data-act="go" data-tab="AV"><span class="row-main"><span class="row-t">Ops & Quality, September 2026</span><span class="row-s num">Submitted 26 Sep · Revision 2 · 13 issues</span></span><span class="row-r"><span class="fg num" style="font-weight:600;font-size:14px">${hotelScore()}</span>${bandTag(hotelScore())}</span></button>`
        + secH("Shortcuts") + [["fileText", "Reports"], ["chart", "Score history"], ["users", "Team members"]].map(([i, l]) => `<button class="row h48" data-act="toast" data-msg="Opens ${l}">${ic(i, "row-ic")}<span class="row-main"><span class="row-t n">${l}</span></span>${ic("chevronRight", "ic-16")}</button>`).join("") + `<div style="height:24px"></div>`;
    this.frame({
      home: !admin, back: admin ? { label: "Home", tab: "AW" } : null, ctx: hotelCtx(hotelName(), admin),
      head: pageHead({ title: admin ? "Hotel dashboard" : "Home", meta: admin ? `<span class="trunc">${esc(CTX.hotel.g)}</span>` : "" }), body, nav: admin ? null : ["manager", "home"],
    });
  }
  menuItems() { return [["sliders", "Edit shortcuts", "toast", "Choose which shortcuts show here"], ["refresh", "Refresh", "toast", "Refreshed"]]; }
  a_openiss(t) { openIssue(ISSUES[+t.dataset.id], this.vp); }
  showLoading() { this.loading = true; this.render(); setTimeout(() => { this.loading = false; this.render(); }, 1400); }
}
class HotelDashLaptop extends LaptopApp {
  constructor(root, o = {}) { super(root, o); this.sel = 0; FX.subs.push(this); this.render(); }
  get viewer() { return CTX.viewer; }
  render() {
    const admin = CTX.viewer === "admin";
    const rows = ISSUES.filter((f) => f.status !== "resolved").sort((a, b) => (isOver(b) - isOver(a)) || (waiting(b) - waiting(a)) || a.due.localeCompare(b.due));
    const s = ISSUES[this.sel], nx = NEXT[s.status];
    this.lframe({
      side: sidebar(admin ? "admin" : "manager", admin ? "hotels" : "home", { hotel: hotelName(), switchable: admin }), home: !admin, back: admin ? { label: "Home", tab: "AW" } : null,
      crumbs: admin ? [["Clients"], [CTX.hotel.g], [hotelName()]] : [[hotelName()], ["Home"]],
      content: `<div class="lsplit"><div class="lbody">${lapHead({ title: admin ? hotelName() : "Home", meta: `Latest audit 26 Sep 2026, Revision 2${admin ? ` · ${esc(CTX.hotel.g)}` : ""}` })}<div class="lpage">
        ${dashCards(true)}
        <div><div class="lsec-h"><h2 class="h2">Needs your attention</h2><span class="cnt-b">${rows.length}</span><span class="grow"></span><button class="btn-text sm" data-act="go" data-tab="E">All issues</button></div>
          <table class="tbl"><thead><tr><th>Status</th><th>Issue</th><th>Title</th><th>Assigned to</th><th>Due</th></tr></thead><tbody>
          ${rows.map((f) => `<tr class="click ${f.id === this.sel ? "sel" : ""}" data-act="sel" data-id="${f.id}">${cell(f, "status")}${cell(f, "iid")}${cell(f, "label")}${cell(f, "who")}<td class="num">${isOver(f) ? `<span class="overdue">${fd(f.due)}</span>` : waiting(f) ? `<span class="overdue">No team response</span>` : fd(f.due)}</td></tr>`).join("")}
          </tbody></table></div>
        <div><div class="lsec-h"><h2 class="h2 grow">Department scores</h2><span class="t3">Ops & Quality, September 2026</span></div>
          <table class="tbl"><thead><tr><th>Department</th><th>Score</th><th>Band</th><th>Change since June</th><th>Open issues</th></tr></thead><tbody>
          ${DEPT_SCORES.map(([d, sc, ch]) => `<tr><td class="fg">${esc(d)}</td><td class="num">${sc}</td><td>${bandTag(sc)}</td><td class="num">${ch > 0 ? "+" + ch : ch}</td><td class="num">${ISSUES.filter((f) => f.dept === d && f.status !== "resolved").length}</td></tr>`).join("")}
          </tbody></table></div></div></div>
      <aside class="insp" aria-label="Selected issue">
        <div class="insp-h" style="padding-left:20px"><div class="grow"><div class="t3 num" style="font-size:12px">${s.iid}</div><div class="h2" style="margin:2px 0 8px">${esc(s.label)}</div><div style="display:flex;gap:8px;align-items:center">${pill(s.status)}<span class="num">${s.status === "resolved" ? "" : isOver(s) ? `<span class="overdue">${dayDiff(TODAY, s.due)} days overdue</span>` : "Due " + fd(s.due)}</span></div></div></div>
        <div class="insp-b grid"><div class="kv"><div class="k">Assigned to</div><div class="v">${esc(s.who)}</div></div><div class="kv"><div class="k">Observation</div><div class="v">${esc(s.obs)}</div></div><div class="kv"><div class="k">Recommendation</div><div class="v">${esc(s.rec)}</div></div><div class="kv"><div class="k">Team response</div><div class="v">${s.resp ? esc(s.resp) : '<span class="t3">No team response yet</span>'}</div></div><button class="btn-text sm" data-act="openfx" data-id="${s.id}" style="justify-self:start">Open issue${ic("chevronRight")}</button></div>
        ${nx ? `<div class="insp-f"><button class="btn btn-primary btn-sm btn-block" data-act="adv" data-id="${s.id}">${nx.l}</button></div>` : ""}
      </aside></div>`,
    });
  }
  menuItems() { return [["sliders", "Edit number cards", "toast", "Choose which number cards show"], ["fileText", "Download summary", "toast", "Downloads the summary PDF"]]; }
  a_sel(t) { this.sel = +t.dataset.id; this.render(); }
  a_openfx(t) { openIssue(ISSUES[+t.dataset.id], this.lap); }
  a_adv(t) { const f = ISSUES[+t.dataset.id]; if (f === FX.f) { fxStatus(NEXT[f.status].to); return; } f.status = NEXT[f.status].to; this.render(); toast(this.lap, `${f.iid} is now ${ST[f.status].l}`); }
}

/* ================= Auditor home: only audits assigned to this auditor ================= */
class AuditorHome extends PhoneApp {
  constructor(root, o = {}) { super(root, { ...o, role: "auditor" }); this.render(); }
  render() {
    this.frame({
      home: true, ctx: markCtx,
      head: pageHead({ title: "Home", meta: "Rohan Iyer · Sightline staff · Audits assigned to you" }),
      body: `<div class="hero"><h2 class="h2">Ops & Quality, October 2026</h2><div class="t3" style="font-size:12px">Harbour View Hotel, Kochi · Started today, 9:30 AM</div>
        <div class="bar" aria-hidden="true"><i style="width:${(7 / 34) * 100}%"></i></div><div class="hero-meta num"><span>7 of 34 done</span><span>Revision 1</span></div>
        <button class="btn btn-primary btn-block" data-act="go" data-tab="A">Continue audit</button></div>`
        + secH("Assigned to you", `<button class="btn-text sm" data-act="toast" data-msg="Opens your audits">See all</button>`)
        + [["Palm Court Inn", "Ops & Quality · Mysuru", "14 Oct"], ["Cedar Ridge Resort", "Food Safety · Munnar", "22 Oct"]].map(([h, s, d]) => `<button class="row" data-act="toast" data-msg="Opens the audit for ${h}, ready to start on the day"><span class="row-main"><span class="row-t">${h}</span><span class="row-s">${s}</span></span><span class="row-r num">${d}</span></button>`).join("")
        + secH("Submitted", `<button class="btn-text sm" data-act="toast" data-msg="Opens your audits">See all</button>`)
        + [["Cedar Ridge Resort", "Submitted 26 Sep", 81, null], ["Harbour View Hotel", "Submitted 26 Sep · Revision 2", 78, "AV"], ["Palm Court Inn", "Submitted 2 Sep", 69, null]].map(([h, s, n, tab]) => `<button class="row" data-act="${tab ? "go" : "toast"}" ${tab ? `data-tab="${tab}"` : ""} data-msg="Opens the audit for ${h}"><span class="row-main"><span class="row-t">${h}</span><span class="row-s num">${s}</span></span><span class="row-r"><span class="fg num" style="font-weight:600;font-size:14px">${n}</span>${bandTag(n)}</span></button>`).join("") + `<div style="height:24px"></div>`,
      nav: ["auditor", "home"],
    });
  }
  menuItems() { return [["calendar", "Add audits to my calendar", "toast", "Downloads a calendar file"], ["refresh", "Refresh", "toast", "Refreshed"]]; }
}

/* ================= Navigation demo with review mode ================= */
class NavDemo extends PhoneApp {
  constructor(root, o = {}) { super(root, { ...o, navDemo: true }); this.role = "admin"; this.review = true; this.viewAs = PEOPLE[1]; this.render(); }
  get navRole() { return this.review && this.role === "admin" ? { "Hotel Manager": "manager", "Department Head": "dept", Staff: "staff", "Group Head": "group", Auditor: "auditor" }[this.viewAs.r] || "manager" : this.role; }
  render() {
    const r = this.navRole;
    const items = SIDE[r].flatMap(([g, its]) => its.map((x) => [g, ...x])).filter(([, k]) => k !== "home");
    this.frame({
      home: true, ctx: r === "admin" || r === "auditor" ? markCtx : hotelCtx("Harbour View Hotel", r === "group"),
      head: pageHead({ title: r === "staff" ? "My issues" : "Home", meta: `${ROLES[r]} · ${ROLE_NOTE[r]}` }),
      body: secH("Workspace shortcuts") + items.map(([g, k, l, i, c]) => `<button class="row h48" data-act="toast" data-msg="Opens ${l}">${ic(i, "row-ic")}<span class="row-main"><span class="row-t n">${l}</span></span>${c != null ? `<span class="cnt-b">${c.toLocaleString("en-IN")}</span>` : ""}<span class="t3" style="font-size:12px">${g || ""}</span></button>`).join("") + `<div style="height:80px"></div>`,
      after: this.review && this.role === "admin" ? `<button class="pillbtn" data-act="review">${ic("eye")}<span>Viewing as ${esc(this.viewAs.n)}</span>${ic("chevronDown")}</button>` : "",
      nav: [r, r === "staff" ? "myissues" : "home"],
    });
    if (this.side) this.side.innerHTML = sidebar(r, r === "staff" ? "issues" : "home", r === "admin" || r === "auditor" ? {} : { hotel: "Harbour View Hotel", switchable: r === "group" });
  }
  a_review() {
    const s = openSheet(this.vp, sheetHead("Review mode") + `<div class="sh-body sh-pad"><p class="fg">You are seeing Sightline as ${esc(this.viewAs.n)}, ${esc(this.viewAs.r)}, ${esc(this.viewAs.h)}.</p><div class="fld" style="margin-top:16px"><span class="fld-l">View as</span><button class="input link-in" data-va><span class="v">${esc(this.viewAs.n)}</span>${ic("chevronsUpDown")}</button><span class="fld-h">Choosing a person opens their dashboard.</span></div></div><div class="sh-foot"><button class="btn btn-secondary btn-block" data-exit>Exit review mode</button></div>`, { label: "Review mode" });
    s.el.addEventListener("click", (e) => {
      if (e.target.closest("[data-exit]")) { s.close(); this.review = false; this.render(); syncNavDemo(this); }
      if (e.target.closest("[data-va]")) pickerSheet(this.vp, { ...peopleOpts("View as", PEOPLE.filter((p) => p.r !== "Admin"), this.viewAs.n, (p) => { this.viewAs = p; s.close(); this.landAs(p); }), recents: [PEOPLE[0], PEOPLE[1]] });
    });
  }
  landAs(p) {
    if (p.r === "Hotel Manager") { CTX.viewer = "manager"; goHotel(HOTELS.find((h) => h.n === p.h) || HOTELS[0], "manager"); return; }
    if (p.r === "Auditor") { showTab("G"); return; }
    this.render(); toast(this.vp, `Now viewing ${p.n}'s dashboard`);
  }
}
function syncNavDemo(d) { document.querySelectorAll("[data-role]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.role === d.role)); const rv = document.querySelector("[data-review]"); if (rv) rv.setAttribute("aria-pressed", d.review); }
