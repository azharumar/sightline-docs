/* ================= Capture and audit view (shared by phone and laptop) ================= */
const ORDER = DEPTS.flatMap((d) => { const its = ITEMS.filter((x) => x.dept === d), secs = [...new Set(its.map((x) => x.sec))]; return its.sort((a, b) => secs.indexOf(a.sec) - secs.indexOf(b.sec)); });
const CARRY = {
  "HK-003": { st: "progress", t: "Issue in progress from the September audit", iid: "ISS-1002" },
  "HK-004": { st: "resolved", t: "Issue marked resolved. Check it on this visit.", iid: "ISS-1012", verify: true },
};
const PRE = { "AE-001": 3, "AE-002": 4, "AE-003": 5, "FO-001": 4, "FO-002": 2, "FO-003": 5, "FO-004": 1 };
const REVS0 = [
  { n: 2, state: "Current", head: "Restarted by Meera Nair, Admin", when: "24 Sep 2026, 10:15 AM", why: "Rooms on the second floor were scored against the wrong room list. Restarted so Rooms & Housekeeping could be scored again.", after: "Submitted by Rohan Iyer, 26 Sep 2026, 5:40 PM" },
  { n: 1, state: "Archived", head: "Submitted by Rohan Iyer, Auditor", when: "22 Sep 2026, 6:05 PM", why: "", after: "Archived 24 Sep 2026. Read only." },
];
const CapCore = {
  initCap(o) {
    this.locked = o.mode === "submitted"; this.rev = this.locked ? 2 : 1; this.revs = clone(REVS0);
    this.title = this.locked ? AUD.sep : AUD.oct;
    this.ans = {}; this.raised = {}; this.verify = {}; this.cur = this.locked ? 1 : 2; this.sel = null;
    this.online = !o.offline; this.queue = o.offline ? ["HK-001", "HK-002", "HK-002"] : [];
    if (this.locked) {
      const cur = Object.fromEntries(CUR.map((r) => [r[0], r]));
      ORDER.forEach((x, k) => {
        const a = this.a(x.code); const c = cur[x.code];
        a.score = c ? c[4] : x.code === "WR-002" ? "na" : 3 + (k % 3);
        if (a.score !== "na" && a.score <= 2) a.obs = x.obs;
        if (k % 4 === 0) a.ev.push({ k: "photo", t: "10:" + String(10 + k).padStart(2, "0") });
        if (c && c[5]) { a.name = c[3]; a.role = PEOPLE.find((p) => p.n === c[3]).r; a.team = c[5]; a.reason = c[6]; }
        if (c) { const iss = ISSUES.find((i) => i.code === x.code && i.audit === AUD.sep); this.raised[x.code] = { iid: iss.iid, status: iss.status }; }
      });
    } else {
      Object.entries(PRE).forEach(([c, s]) => { const a = this.a(c); a.score = s; if (s <= 2) a.obs = IT[c].obs; });
      this.raised["FO-004"] = { iid: "ISS-1050", status: "open" };
      (o.extra || []).forEach(([c, s, photos]) => { const a = this.a(c); a.score = s; for (let i = 0; i < photos; i++) a.ev.push({ k: "photo", t: "11:4" + i }); });
    }
  },
  blank(c) { return { score: null, obs: "", ev: [], name: "", role: "", team: "", reason: "", rec: IT[c].rec, more: false }; },
  a(c) { return (this.ans[c] ||= this.blank(c)); },
  items(i = this.cur) { return ORDER.filter((x) => x.dept === DEPTS[i]); },
  done(c) { return this.ans[c] && this.ans[c].score != null; },
  count() { return ITEMS.filter((x) => this.done(x.code)).length; },
  secDone(i) { return this.items(i).filter((x) => this.done(x.code)).length; },
  low(c) { const s = this.ans[c] && this.ans[c].score; return s != null && s !== "na" && s <= 2; },
  state(x) {
    if (!this.done(x.code)) return `<span class="status"><span class="dot dot-ring"></span>Not started</span>`;
    if (this.low(x.code) && !this.a(x.code).obs.trim()) return `<span class="status warn"><span class="dot st-open"></span>Observation needed</span>`;
    return `<span class="status"><span class="dot st-resolved"></span>Done</span>`;
  },
  change(c) { if (!this.online) this.queue.push(c); },
  syncIcon(lap) {
    const n = this.queue.length;
    if (this.online && !n) return "";
    const lbl = !this.online ? `Offline. ${n} ${n === 1 ? "change" : "changes"} waiting` : `${n} ${n === 1 ? "change" : "changes"} uploading`;
    return `<button class="icon-btn ${lap ? "sm" : ""}" data-act="syncinfo" aria-label="${lbl}" title="${lbl}">${ic(this.online ? "uploadCloud" : "cloudOff")}${n ? `<span class="badge num">${n}</span>` : ""}</button>`;
  },
  host() { return this.vp || this.lap; },
  a_syncinfo() {
    const n = this.queue.length, codes = [...new Set(this.queue)];
    const body = `<div class="sh-pad"><p class="fg">${this.online ? `Uploading ${n} ${n === 1 ? "change" : "changes"}.` : `You are offline. ${n} ${n === 1 ? "change is" : "changes are"} saved on this device and upload when there is signal.`}</p>
      <p class="t3" style="margin-top:8px;font-size:12px">Photos upload one by one as soon as there is signal. Submit stays blocked until every change has uploaded.</p></div>
      ${codes.map((c) => `<div class="row h48"><span class="row-main"><span class="row-t n trunc">${esc(IT[c].label)}</span></span><span class="row-r num">${this.queue.filter((q) => q === c).length} waiting</span></div>`).join("")}`;
    if (this.vp) openSheet(this.vp, sheetHead("Waiting to upload", "") + `<div class="sh-body">${body}</div>`, { label: "Waiting to upload" });
    else this.popover(this.lap.querySelector('[data-act="syncinfo"]'), (p) => { p.innerHTML = `<div class="pop-h">Waiting to upload</div>${body}`; }, { w: 340, right: true });
  },
  setOnline(v) {
    if (!v) { this.online = false; this.render(); return; }
    this.online = true; this.render();
    const tick = () => { if (!this.queue.length) { this.render(); return; } this.queue.shift(); this.render(); setTimeout(tick, 500); };
    setTimeout(tick, 500);
  },
  nextOf(c, d) { const i = ORDER.findIndex((x) => x.code === c); return ORDER[i + d] || null; },
  secRows(q = "") {
    q = q.trim().toLowerCase(); let h = "";
    const secs = DEPTS.map((d, i) => ({ d, i })).filter(({ d, i }) => !q || d.toLowerCase().includes(q) || this.items(i).some((x) => x.sec.toLowerCase().includes(q)));
    if (q && secs.length) h += `<div class="lp-grp">Sections</div>`;
    secs.forEach(({ d, i }) => {
      const n = this.items(i).length, a = this.secDone(i);
      const dot = a === n ? "st-resolved" : a ? "dot-half" : "dot-ring";
      h += `<button class="sec-row ${i === this.cur ? "cur" : ""}" data-act="gosec" data-i="${i}" ${i === this.cur ? 'aria-current="true"' : ""}><span class="dot ${dot}"></span><span class="sec-n trunc">${esc(d)}</span><span class="sec-c num">${a} of ${n}</span></button>`;
    });
    if (q) {
      const m = ORDER.filter((x) => (x.label + " " + x.code).toLowerCase().includes(q)).slice(0, 8);
      if (m.length) h += `<div class="lp-grp">Items</div>` + m.map((x) => `<button class="sec-row" data-act="jump" data-code="${x.code}"><span class="dot ${this.done(x.code) ? "st-resolved" : "dot-ring"}"></span><span class="sec-n trunc">${esc(x.label)}</span><span class="sec-c num">${x.code}</span></button>`).join("");
      if (!secs.length && !m.length) h = emptyState("search", `No section or item matches "${esc(q)}"`);
    }
    return h;
  },
  metaHtml() {
    if (this.locked) return `<span class="pill"><span class="dot st-resolved"></span>Submitted</span><span class="lock-line">${ic("lock")}Locked</span><button data-act="revs">Revision ${this.rev}</button><span class="num">78</span>${bandTag(78)}`;
    return `<span class="num">${this.count()} of ${ITEMS.length} done in this audit</span>${this.rev > 1 ? `<span class="sep">·</span><button data-act="revs">Revision ${this.rev}</button>` : ""}`;
  },
  capMenu() {
    return this.locked
      ? [["history", "Revision history", "revs"], ["rotate", "Restart audit", "restart", "", "danger"], ["fileText", "Download report", "toast", "Downloads the PDF report"]]
      : [["listChecks", "Review answers", "review"], ["fileText", "Audit details", "toast", "Opens the audit details"], ["history", "Revision history", "revs"]];
  },
  /* Drawer */
  drawerParts(code, lap) {
    const x = IT[code], a = this.a(code), ro = this.locked, low = this.low(code);
    const sub = `<span class="num">${x.code}</span><span class="sep">·</span><span class="trunc">${esc(x.sec)}</span>${x.crit ? `<span class="sep">·</span><span class="crit">Critical</span>` : ""}`;
    const sop = `<button class="btn-text sm" style="margin-right:4px" data-act="sop" data-code="${code}">SOP</button>`;
    const head = lap
      ? `<div class="insp-h"><button class="icon-btn sm" data-back data-act="pclose" aria-label="Close item">${ic("x")}</button><div class="grow"><div class="sh-title wrap">${esc(x.label)}</div><div class="sh-sub">${sub}</div></div>${sop}</div>`
      : sheetHead(esc(x.label), sub, sop, { wrap: true, back: backBtn("Back to items") });
    const segs = [0, 1, 2, 3, 4, 5].map((v) => `<button class="seg-b ${a.score === v ? "on" : ""}" data-act="score" data-code="${code}" data-v="${v}" aria-pressed="${a.score === v}" aria-label="Score ${v}">${v}</button>`).join("");
    const score = ro ? `<div style="display:flex;align-items:center;gap:8px">${scoreChip(a.score)}<span class="t3" style="font-size:12px">${a.score === "na" ? "Not applicable" : "out of 5"}</span></div>`
      : `<div class="score-row"><div class="seg" role="group" aria-label="Score">${segs}</div><button class="na ${a.score === "na" ? "on" : ""}" data-act="score" data-code="${code}" data-v="na" aria-pressed="${a.score === "na"}">N/A</button></div>`;
    const flag = x.crit && a.score === 0 ? `<p class="note" style="margin-top:8px;color:var(--red-text)"><span class="dot st-redflag" style="margin-top:4px"></span>Raises a red flag. The property score is capped at 50.</p>` : "";
    const carry = CARRY[code] && !ro ? (() => { const c = CARRY[code], v = this.verify[code]; return `<div><div class="fld-l">Issue from the last audit</div><div class="box-row"><span class="dot ${v === "reopened" ? "st-open" : ST[c.st].c}"></span><span class="grow"><span>${v === "confirmed" ? "Confirmed as resolved" : v === "reopened" ? "Reopened" : esc(c.t)}</span><span class="s num">${c.iid}</span></span></div>${c.verify && !v ? `<div style="display:flex;gap:8px;margin-top:8px"><button class="btn btn-secondary grow" data-act="vf" data-v="reopened" data-code="${code}">Reopen issue</button><button class="btn btn-secondary grow" data-act="vf" data-v="confirmed" data-code="${code}">Confirm resolved</button></div>` : ""}</div>`; })() : "";
    const req = low ? `<span class="${a.obs.trim() ? "" : "warn"}">Required</span>` : "";
    const obs = ro ? `<div><div class="fld-l">Observation</div><p class="ro-v">${a.obs ? esc(a.obs) : '<span class="t3">None</span>'}</p></div>`
      : `<label class="fld"><span class="fld-l">Observation ${req}</span><textarea class="input" data-f="obs" rows="3" placeholder="What did you find?">${esc(a.obs)}</textarea>${low ? "" : `<span class="fld-h">Required for a score of 2 or below</span>`}</label>`;
    const photos = a.ev.map((e, i) => [e, i]).filter(([e]) => e.k === "photo"), rest = a.ev.map((e, i) => [e, i]).filter(([e]) => e.k !== "photo");
    const ev = `<div><div class="fld-l">Evidence${a.ev.length ? ` <span class="cnt-b">${a.ev.length}</span>` : ""}</div>
      ${ro ? "" : `<div class="ev-btns"><button class="btn btn-secondary" data-act="ev" data-k="photo">${ic("camera")}Photo</button><button class="btn btn-secondary" data-act="ev" data-k="file">${ic("paperclip")}File</button><button class="btn btn-secondary" data-act="ev" data-k="sample">${ic("listChecks")}Sample</button></div>`}
      ${photos.length ? `<div class="thumbs">${photos.map(([e, i]) => `<div class="thumb">${ic("image")}<span class="num">${e.t}</span>${ro ? "" : `<button class="x" data-act="rm" data-i="${i}" aria-label="Remove photo">${ic("x", "ic-16")}</button>`}</div>`).join("")}</div>` : ""}
      ${rest.length ? `<div style="margin-top:8px">${rest.map(([e, i]) => e.k === "file" ? `<div class="ev-li">${ic("fileText")}<span class="grow trunc">${esc(e.n)}</span><span class="t3 num" style="font-size:12px">${e.s}</span>${ro ? "" : `<button class="icon-btn sm" data-act="rm" data-i="${i}" aria-label="Remove file">${ic("x", "ic-16")}</button>`}</div>` : `<div class="ev-li">${ic("listChecks")}<span class="sml"><input class="input md num" inputmode="numeric" data-sf="c" data-i="${i}" value="${e.c}" aria-label="Number checked" ${ro ? "disabled" : ""}><span class="t3">checked</span><input class="input md num" inputmode="numeric" data-sf="x" data-i="${i}" value="${e.x}" aria-label="Number with exceptions" ${ro ? "disabled" : ""}><span class="t3">exceptions</span></span>${ro ? "" : `<button class="icon-btn sm" data-act="rm" data-i="${i}" aria-label="Remove sample check">${ic("x", "ic-16")}</button>`}</div>`).join("")}</div>` : ""}
      ${ro && !a.ev.length ? `<p class="t3">None</p>` : ""}</div>`;
    const r = this.raised[code];
    const issue = `<div><div class="fld-l">Issue</div>${r ? `<button class="box-row" data-act="openissue" data-iid="${r.iid}"><span class="dot ${ST[r.status].c}"></span><span class="grow"><span>${esc(x.label)}</span><span class="s"><span class="num">${r.iid}</span><span class="sep">·</span>${ST[r.status].l}</span></span>${ic("chevronRight")}</button>`
      : `<button class="btn btn-secondary btn-block" data-act="raise" data-code="${code}">${ic("plus")}Raise issue</button><span class="fld-h">Issues are raised by hand, during or after the audit.</span>`}</div>`;
    const moreFields = ro
      ? `<div class="kv"><div class="k">Responded by</div><div class="v">${a.name ? `${esc(a.name)}, ${esc(a.role)}` : '<span class="t3">None</span>'}</div></div><div class="kv"><div class="k">Team response</div><div class="v">${a.team ? esc(a.team) : '<span class="t3">None</span>'}</div></div><div class="kv"><div class="k">Reason</div><div class="v">${a.reason || '<span class="t3">None</span>'}</div></div><div class="kv"><div class="k">Recommendation</div><div class="v">${esc(a.rec)}</div></div>`
      : `<div class="fld-2"><label class="fld"><span class="fld-l">Responded by</span><input class="input" data-f="name" value="${esc(a.name)}" placeholder="Name"></label><label class="fld"><span class="fld-l">Role</span><input class="input" data-f="role" value="${esc(a.role)}" placeholder="Role"></label></div>
        <label class="fld"><span class="fld-l">Team response</span><textarea class="input" data-f="team" rows="2" placeholder="What the team said">${esc(a.team)}</textarea></label>
        <div class="fld"><span class="fld-l">Reason</span><div class="opt-chips" role="group" aria-label="Reason">${REASONS.map((rr) => `<button class="opt" data-act="reason" data-r="${rr}" aria-pressed="${a.reason === rr}">${rr}</button>`).join("")}</div></div>
        <label class="fld"><span class="fld-l">Recommendation</span><textarea class="input" data-f="rec" rows="3">${esc(a.rec)}</textarea><span class="fld-h">Starts with the default recommendation. Edit it if needed.</span></label>`;
    const body = `<div class="dw">${ro ? `<p class="note">${ic("lock")}Submitted audit, Revision ${this.rev}. Read only. You can still raise an issue.</p>` : ""}
      <div><div class="fld-l">Score</div>${score}${flag}</div>${carry}${obs}${ev}${issue}
      <div><button class="disclose" data-act="more" aria-expanded="${a.more}">Team response and Recommendation${ic("chevronDown")}</button>${a.more ? `<div class="${ro ? "dw" : ""}" style="padding-top:8px">${moreFields}</div>` : ""}</div></div>`;
    const its = this.items(DEPTS.indexOf(x.dept)), k = its.findIndex((i) => i.code === code) + 1;
    const prev = this.nextOf(code, -1), next = this.nextOf(code, 1);
    const nextBtn = next ? `<button class="btn btn-primary ${lap ? "btn-sm" : ""}" data-act="step" data-d="1">Next${ic("chevronRight")}</button>` : this.locked ? `<button class="btn btn-secondary ${lap ? "btn-sm" : ""}" disabled>Next${ic("chevronRight")}</button>` : `<button class="btn btn-primary ${lap ? "btn-sm" : ""}" data-act="review">Review answers</button>`;
    const foot = `<div class="dw-foot"><button class="btn btn-secondary ${lap ? "btn-sm" : ""}" data-act="step" data-d="-1" ${prev ? "" : "disabled"}>${ic("chevronLeft")}Previous</button><span class="pos">Item ${k} of ${its.length}</span>${nextBtn}</div>`;
    return { head, body, foot };
  },
  a_open(t) { this.openItem(t.dataset.code); },
  a_step(t) {
    const n = this.nextOf(this.sel, +t.dataset.d); if (!n) return;
    this.sel = n.code; const di = DEPTS.indexOf(n.dept);
    if (di !== this.cur) { this.cur = di; }
    this.render(); this.drawDrawer(true);
  },
  a_score(t) {
    if (this.locked) return;
    const c = this.sel, v = t.dataset.v === "na" ? "na" : +t.dataset.v; this.a(c).score = v; this.change(c);
    this.render(); this.drawDrawer();
    if (v !== "na" && v <= 2) { const ta = this.host().querySelector('.dwb textarea[data-f="obs"]'); if (ta && !ta.value) ta.focus({ preventScroll: false }); }
  },
  a_ev(t) {
    const a = this.a(this.sel), k = t.dataset.k, n = a.ev.length;
    if (k === "photo") a.ev.push({ k, t: `11:${50 + n}` });
    if (k === "file") a.ev.push({ k, n: ["Housekeeping register.pdf", "Room checklist.xlsx"][n % 2], s: ["240 KB", "88 KB"][n % 2] });
    if (k === "sample") a.ev.push({ k, c: 10, x: 2 });
    this.change(this.sel); this.render(); this.drawDrawer();
  },
  a_rm(t) { this.a(this.sel).ev.splice(+t.dataset.i, 1); this.change(this.sel); this.render(); this.drawDrawer(); },
  a_more() { const a = this.a(this.sel); a.more = !a.more; this.drawDrawer(); },
  a_reason(t) { const a = this.a(this.sel); a.reason = a.reason === t.dataset.r ? "" : t.dataset.r; this.change(this.sel); this.drawDrawer(); },
  a_vf(t) { this.verify[t.dataset.code] = t.dataset.v; this.change(t.dataset.code); this.drawDrawer(); },
  a_openissue(t) { if (t.dataset.iid === ISSUES[0].iid) showTab("F"); else toast(this.host(), `Opens issue ${t.dataset.iid}`); },
  a_review() { this.closeMenu && this.closeMenu(); this.closePop && this.closePop(); toast(this.host(), this.online && !this.queue.length ? "Opens the review page before you submit" : "Submit is blocked until every change has uploaded"); },
  a_gosec(t) { this.cur = +t.dataset.i; if (this.secSheet) { this.secSheet.close(); this.secSheet = null; } this.render(); const sc = this.host().querySelector(".scroll, .cap-main"); if (sc) sc.scrollTop = 0; },
  a_jump(t) { const x = IT[t.dataset.code]; this.cur = DEPTS.indexOf(x.dept); if (this.secSheet) { this.secSheet.close(); this.secSheet = null; } this.render(); this.openItem(x.code); },
  a_nextsec() { const n = this.nextSection(); if (n == null) return; this.cur = n; this.render(); const sc = this.screen.querySelector(".scroll"); if (sc) sc.scrollTop = 0; },
  nextSection() { for (let k = 1; k <= DEPTS.length; k++) { const i = (this.cur + k) % DEPTS.length; if (this.secDone(i) < this.items(i).length) return i; } return null; },
  onInput(e) {
    const t = e.target;
    if (t.dataset.secq != null) { this.lap.querySelector(".seclist").innerHTML = this.secRows(t.value); return; }
    if (!this.sel || !t.closest(".dwb")) return;
    const a = this.a(this.sel);
    if (t.dataset.f) { a[t.dataset.f] = t.value; if (t.dataset.f === "obs" && this.vp) this.render(); }
    if (t.dataset.sf) a.ev[+t.dataset.i][t.dataset.sf] = t.value;
  },
  revBody() {
    return `<div class="sh-pad">${this.revs.map((r) => `<div class="rev"><div class="rev-h">Revision ${r.n}<span class="pill"><span class="dot ${r.state === "Current" ? "st-resolved" : ""}"></span>${r.state}</span>${r.state === "Archived" ? `<span class="grow"></span><button class="btn btn-secondary btn-sm" data-act="toast" data-msg="Opens Revision ${r.n}, read only">${ic("archive")}View</button>` : ""}</div><p>${esc(r.head)}</p><p class="s num">${r.when}</p>${r.why ? `<p><span class="t3">Reason: </span>${esc(r.why)}</p>` : ""}${r.after ? `<p class="s">${esc(r.after)}</p>` : ""}</div>`).join("")}</div>`;
  },
  a_revs(t) {
    this.closeMenu && this.closeMenu();
    if (this.vp) openSheet(this.vp, sheetHead("Revision history", `${this.revs.length} revisions`) + `<div class="sh-body">${this.revBody()}</div>`, { label: "Revision history" });
    else this.popover(t.closest(".pop") ? this.lap.querySelector('[data-act="lmenu"]') : t, (p) => { p.innerHTML = `<div class="pop-h">Revision history</div><div style="max-height:420px;overflow:auto">${this.revBody()}</div>`; }, { w: 400, right: true });
  },
  a_restart() {
    this.closeMenu && this.closeMenu();
    const form = `<div class="sh-pad"><p class="fg">Restarting reopens this audit for capture as Revision ${this.rev + 1}. Revision ${this.rev} is archived and stays viewable.</p>
      <label class="fld" style="margin-top:16px"><span class="fld-l">Reason <span class="warn">Required</span></span><textarea class="input" data-rr rows="3" placeholder="Why does this audit need to be restarted?"></textarea></label></div>`;
    const done = (why) => {
      this.revs.forEach((r) => { r.state = "Archived"; r.after = r.after || "Archived 4 Oct 2026. Read only."; });
      this.revs.unshift({ n: this.rev + 1, state: "Current", head: "Restarted by Meera Nair, Admin", when: "4 Oct 2026, 11:48 AM", why, after: "" });
      this.rev++; this.locked = false; this.render(); toast(this.host(), `Audit restarted as Revision ${this.rev}. Revision ${this.rev - 1} is archived.`);
    };
    const wire = (root, close) => {
      const ta = root.querySelector("[data-rr]"), b = root.querySelector("[data-go]");
      ta.addEventListener("input", () => { b.disabled = !ta.value.trim(); });
      b.addEventListener("click", () => { close(); done(ta.value.trim()); });
    };
    if (this.vp) { const s = openSheet(this.vp, sheetHead("Restart audit", esc(this.title)) + `<div class="sh-body">${form}</div><div class="sh-foot"><button class="btn btn-primary btn-block" data-go disabled>Restart audit</button></div>`, { label: "Restart audit" }); wire(s.el, () => s.close()); }
    else this.popover(this.lap.querySelector('[data-act="lmenu"]'), (p) => { p.innerHTML = `<div class="pop-h">Restart audit</div>${form}<div class="pop-f"><span class="grow"></span><button class="btn btn-primary btn-sm" data-go disabled>Restart audit</button></div>`; wire(p, () => this.closePop()); }, { w: 400, right: true });
  },
  raiseForm(code) {
    const x = IT[code], a = this.a(code);
    return `<label class="fld"><span class="fld-l">Title</span><input class="input" data-rf="t" value="${esc(x.label)}"></label>
      <div class="fld-2" style="margin-top:16px"><div class="fld"><span class="fld-l">Department</span><button class="input link-in" data-rf-link="dept"><span class="v">${esc(x.dept)}</span>${ic("chevronsUpDown")}</button></div><div class="fld"><span class="fld-l">Audit item</span><div class="input link-in" style="background:var(--muted)"><span class="v num">${x.code}</span></div></div></div>
      <label class="fld"><span class="fld-l">Observation</span><textarea class="input" rows="2">${esc(a.obs || x.obs)}</textarea></label>
      <label class="fld"><span class="fld-l">Recommendation</span><textarea class="input" rows="2">${esc(a.rec)}</textarea></label>
      <div class="fld-2" style="margin-top:16px"><div class="fld"><span class="fld-l">Assigned to</span><button class="input link-in" data-rf-link="who"><span class="v" data-who>Latha Krishnan</span>${ic("chevronsUpDown")}</button></div><label class="fld"><span class="fld-l">Due date</span><input class="input" type="date" value="2026-10-18"></label></div>`;
  },
  raised_(code) {
    const id = "ISS-" + (1100 + Object.keys(this.raised).length);
    this.raised[code] = { iid: id, status: "open" }; this.change(code);
    toast(this.host(), `Issue ${id} raised and assigned`);
  },
  a_sop(t) {
    const x = IT[t.dataset.code], body = `<p class="fg">${esc(x.rec)}</p><p class="t3" style="margin-top:12px;font-size:12px">Department: ${esc(x.dept)}</p>`;
    if (this.vp) openSheet(this.vp, sheetHead(`SOP-${x.code}`, `${esc(x.label)} standard`) + `<div class="sh-body sh-pad">${body}</div><div class="sh-foot"><button class="btn btn-secondary btn-block" data-act="toast" data-msg="Opens the full SOP">${ic("external")}Open full SOP</button></div>`, { label: "SOP" });
    else this.popover(t, (p) => { p.innerHTML = `<div class="pop-h">SOP-${x.code}</div><div class="pop-body">${body}</div>`; }, { w: 320, right: true });
  },
};

class CapturePhone extends PhoneApp {
  constructor(root, o = {}) {
    super(root, { ...o, role: "auditor" }); this.initCap(o); this.render();
    if (o.openSections) this.openSections(true);
    if (o.openItem) this.openItem(o.openItem, true);
  }
  render() {
    const i = this.cur, its = this.items(i), sd = this.secDone(i);
    let body = "", last = null;
    its.forEach((x) => {
      if (x.sec !== last) { body += secH(esc(x.sec)); last = x.sec; }
      body += `<button class="row ${this.done(x.code) ? "done" : ""} ${this.sel === x.code ? "sel" : ""}" data-act="open" data-code="${x.code}"><span class="row-main"><span class="row-t">${esc(x.label)}</span><span class="row-s">${this.state(x)}${x.crit ? `<span class="sep">·</span><span class="crit">Critical</span>` : ""}</span></span>${ic("chevronRight", "ic-16")}</button>`;
    });
    body += `<p class="list-end num">${this.locked ? "Submitted audits are locked. Open an item to read it." : sd < its.length ? `${its.length - sd} of ${its.length} not started in this section` : "Every item in this section is done."}</p>`;
    const next = !this.locked && sd === its.length ? this.nextSection() : null;
    this.frame({
      close: !this.locked, back: this.locked ? { label: "Audits" } : null,
      ctx: `<span class="ctx-t trunc" title="${esc(this.title)}">${esc(this.title)}</span>`, actions: this.syncIcon(),
      progress: this.locked ? null : this.count() / ITEMS.length,
      head: pageHead({ title: DEPTS[i], titleAct: "sections", titleLabel: `Sections. Current: ${DEPTS[i]}`, count: `${sd} of ${its.length}`, meta: this.metaHtml() }),
      body, keep: true,
      footer: !this.locked && sd === its.length ? (next != null ? `<button class="btn btn-primary btn-block" data-act="nextsec">Next section: ${esc(DEPTS[next])}${ic("chevronRight")}</button>` : `<button class="btn btn-primary btn-block" data-act="review">Review answers</button>`) : "",
    });
  }
  menuItems() { return this.capMenu(); }
  a_close() { if (this.o.onClose) this.o.onClose(); else toast(this.vp, "Closes the audit. Answers stay saved on this device."); }
  a_search() { this.openSections(false, true); }
  a_sections() { this.openSections(false); }
  openSections(instant, focus) {
    const s = openSheet(this.vp, sheetHead("Sections", `<span class="num">${this.count()} of ${ITEMS.length} done</span>`) + `<div class="sh-search"><label class="search">${ic("search")}<input class="input" type="search" placeholder="Search sections and items" aria-label="Search sections and items"></label></div><div class="sh-body seclist"></div>`, { full: true, instant, label: "Sections", onClose: () => { this.secSheet = null; } });
    this.secSheet = s;
    const box = s.el.querySelector(".seclist"), inp = s.el.querySelector("input");
    inp.addEventListener("input", () => { box.innerHTML = this.secRows(inp.value); });
    box.innerHTML = this.secRows();
    if (focus) setTimeout(() => inp.focus({ preventScroll: true }), 280);
  }
  openItem(code, instant) {
    this.sel = code; this.render();
    this.drawer = openSheet(this.vp, `<div class="dwh"></div><div class="sh-body sh-pad dwb"></div><div class="sh-foot dwf"></div>`, { full: true, instant, label: IT[code].label, onClose: () => { this.drawer = null; this.sel = null; this.render(); } });
    this.drawDrawer(true);
  }
  drawDrawer(top) {
    if (!this.drawer || !this.sel) return;
    const p = this.drawerParts(this.sel), el2 = this.drawer.el, b = el2.querySelector(".dwb"), keep = b.scrollTop;
    el2.querySelector(".dwh").innerHTML = p.head; b.innerHTML = p.body; el2.querySelector(".dwf").innerHTML = p.foot;
    b.scrollTop = top ? 0 : keep;
  }
  a_raise(t) {
    const code = t.dataset.code;
    const s = openSheet(this.vp, sheetHead("Raise issue", `<span class="num">${code}</span> · ${esc(IT[code].label)}`) + `<div class="sh-body sh-pad">${this.raiseForm(code)}</div><div class="sh-foot"><button class="btn btn-primary btn-block" data-rgo>Raise issue</button></div>`, { full: true, label: "Raise issue" });
    s.el.addEventListener("click", (e) => {
      const l = e.target.closest("[data-rf-link]");
      if (l && l.dataset.rfLink === "who") pickerSheet(this.vp, peopleOpts("Assigned to", TEAM, "Latha Krishnan", (p) => { s.el.querySelector("[data-who]").textContent = p.n; }));
      if (l && l.dataset.rfLink === "dept") pickerSheet(this.vp, deptOpts(IT[code].dept, () => {}));
      if (e.target.closest("[data-rgo]")) { s.close(); this.raised_(code); this.drawDrawer(); }
    });
  }
}

class CaptureLaptop extends LaptopApp {
  constructor(root, o = {}) { super(root, { ...o, role: "auditor" }); this.initCap(o); this.sel = o.sel || "HK-001"; this.pview = "item"; this.render(); }
  render() {
    const i = this.cur, its = this.items(i), sd = this.secDone(i);
    let rows = "", last = null;
    its.forEach((x) => {
      if (x.sec !== last) { if (last) rows += `</tbody></table>`; rows += `<div class="lsec-h" style="margin-top:${last ? 24 : 8}px"><h2 class="h2">${esc(x.sec)}</h2></div><table class="tbl"><tbody>`; last = x.sec; }
      rows += `<tr class="click ${this.sel === x.code ? "sel" : ""}" data-act="open" data-code="${x.code}"><td style="width:200px">${this.state(x)}</td><td class="fg">${esc(x.label)}</td><td style="width:90px">${x.crit ? '<span class="crit">Critical</span>' : ""}</td></tr>`;
    });
    rows += `</tbody></table>`;
    const head = lapHead({
      title: this.title,
      status: this.locked ? `<span class="pill"><span class="dot st-resolved"></span>Submitted</span>` : `<span class="pill"><span class="dot st-progress"></span>In progress</span>`,
      meta: `${esc(hotelName())}<span class="sep">·</span>Rohan Iyer<span class="sep">·</span>${this.locked ? `<span class="lock-line">${ic("lock")}Locked</span><span class="sep">·</span><button data-act="revs">Revision ${this.rev}</button><span class="sep">·</span><span class="num">78</span>${bandTag(78)}` : `<span class="num">${this.count()} of ${ITEMS.length} done</span>${this.rev > 1 ? `<span class="sep">·</span><button data-act="revs">Revision ${this.rev}</button>` : ""}`}`,
      primary: this.locked ? null : { label: "Review answers", act: "review" },
    });
    const panel = this.sel ? `<aside class="insp cap-panel" aria-label="Item">${this.panelHtml()}</aside>` : "";
    this.lframe({
      close: !this.locked, back: this.locked ? { label: "Audits" } : null,
      crumbs: [[hotelName()], ["Audits"], [this.title]], actions: this.syncIcon(true),
      progress: this.locked ? null : this.count() / ITEMS.length,
      content: `<div class="capgrid ${this.sel ? "" : "nopanel"}"><aside class="cap-secs" aria-label="Sections"><label class="search">${ic("search")}<input class="input md" type="search" placeholder="Search sections and items" data-secq aria-label="Search sections and items"></label><div class="seclist">${this.secRows()}</div></aside>
        <div class="lbody cap-main">${head}<div style="padding:0 24px 24px"><div class="lsec-h"><h2 class="h2 grow">${esc(DEPTS[i])}</h2><span class="t3 num">${sd} of ${its.length} done</span></div>${rows}</div></div>${panel}</div>`,
    });
  }
  panelHtml() {
    if (this.pview === "raise") return `<div class="insp-h"><button class="icon-btn sm" data-back data-act="pitem" aria-label="Back to item">${ic("chevronLeft")}</button><div class="grow"><div class="sh-title">Raise issue</div><div class="sh-sub"><span class="num">${this.sel}</span> · ${esc(IT[this.sel].label)}</div></div></div><div class="insp-b dwb">${this.raiseForm(this.sel)}</div><div class="insp-f"><button class="btn btn-secondary btn-sm" data-act="pitem">Cancel</button><span class="grow"></span><button class="btn btn-primary btn-sm" data-act="rgo">Raise issue</button></div>`;
    const p = this.drawerParts(this.sel, true);
    return `${p.head}<div class="insp-b dwb">${p.body}</div><div class="insp-f">${p.foot}${this.locked ? "" : `<p class="keys">Keys: <span class="kbd">0</span> to <span class="kbd">5</span> score, <span class="kbd">N</span> N/A, <span class="kbd">J</span> next, <span class="kbd">K</span> previous</p>`}</div>`;
  }
  menuItems() { return this.capMenu(); }
  drawDrawer(top) { const pn = this.lap.querySelector(".cap-panel"); if (!pn) { this.render(); return; } const b = pn.querySelector(".dwb"), keep = b ? b.scrollTop : 0; pn.innerHTML = this.panelHtml(); const b2 = pn.querySelector(".dwb"); if (b2) b2.scrollTop = top ? 0 : keep; }
  openItem(code) { this.sel = code; this.pview = "item"; this.render(); }
  a_pclose() { this.sel = null; this.render(); }
  a_pitem() { this.pview = "item"; this.drawDrawer(true); }
  a_raise() { this.pview = "raise"; this.drawDrawer(true); }
  a_rgo() { this.pview = "item"; this.raised_(this.sel); this.drawDrawer(); }
  a_close() { toast(this.lap, "Closes the audit. Answers stay saved."); }
  key(e) {
    if (!this.sel || this.pview !== "item" || /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return;
    const k = e.key.toLowerCase();
    if (!this.locked && /^[0-5]$/.test(k)) { this.a_score({ dataset: { v: k } }); e.preventDefault(); }
    else if (!this.locked && k === "n") { this.a_score({ dataset: { v: "na" } }); e.preventDefault(); }
    else if (k === "j" || k === "arrowdown") { this.a_step({ dataset: { d: "1" } }); e.preventDefault(); }
    else if (k === "k" || k === "arrowup") { this.a_step({ dataset: { d: "-1" } }); e.preventDefault(); }
  }
}
Object.assign(CapturePhone.prototype, CapCore);
Object.assign(CaptureLaptop.prototype, CapCore);
CapturePhone.prototype.menuItems = function () { return this.capMenu(); };
CaptureLaptop.prototype.menuItems = function () { return this.capMenu(); };
