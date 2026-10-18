import { chromium } from "/home/user/sightline/node_modules/.pnpm/playwright-core@1.63.0/node_modules/playwright-core/index.mjs";
const dir = "/tmp/claude-0/-home-user-sightline/00d12798-8726-5a58-8066-937f541e86e3/scratchpad/ux-redesign/";
const url = "file://" + dir + "index.html";
const out = dir + "shots/";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const fails = [], M = { screens: 0, phoneScreens: 0, backOk: 0, homes: 0, sheets: 0, laps: 0, maxPhoneFont: 0, cardsChecked: 0, cardHeights: new Set(), tabs: 0 };
const TABS = ["A","B","C","AV","D","AW","E","F","G","H","HS","S","BA","SH","VS"];
const audit = (page, tag, phoneW) => page.evaluate(([tag, phoneW]) => {
  const r = { f: [], phones: 0, back: 0, homes: 0, sheets: 0, laps: 0, maxFont: 0, sw: document.documentElement.scrollWidth };
  const P = document.querySelector(".panel.on");
  P.querySelectorAll(".phone").forEach((ph) => {
    const sc = ph.querySelector(".vp > .screen"); r.phones++;
    if (sc.dataset.home === "true") r.homes++;
    else if (sc.querySelector(".app-top [data-back]")) r.back++;
    else r.f.push(`${tag}: phone #${ph.id} has no back control`);
    ph.querySelectorAll(".sheet").forEach((s) => { r.sheets++; if (!s.querySelector("[data-back]")) r.f.push(`${tag}: sheet "${s.getAttribute("aria-label")}" in #${ph.id} has no back`); });
  });
  P.querySelectorAll(".lap").forEach((l) => {
    r.laps++;
    if (!l.querySelector(".ltop .crumbs")) r.f.push(`${tag}: laptop without breadcrumbs`);
    if (l.dataset.home !== "true" && !l.querySelector(".ltop [data-back]")) r.f.push(`${tag}: laptop #${l.parentElement.id} has no back`);
  });
  if (phoneW) {
    const els = [...P.querySelectorAll(".phone *"), ...document.querySelectorAll(".page-head *, .tabs *"), ...[...P.querySelectorAll("*")].filter((e) => !e.closest(".lap-wrap") && !e.closest(".phone"))];
    for (const e of els) { if (e.closest(".lap-wrap")) continue; if (!e.getClientRects().length) continue; const fs = parseFloat(getComputedStyle(e).fontSize); if (e.textContent.trim() || e.tagName === "INPUT") { if (fs > r.maxFont) r.maxFont = fs; if (fs > 18.01) r.f.push(`${tag}: font ${fs}px on ${e.tagName}.${e.className} "${e.textContent.trim().slice(0, 30)}"`); } }
  }
  const txt = P.innerText + " " + [...P.querySelectorAll("[aria-label],[title],[placeholder],[data-msg],[alt]")].map((e) => ["aria-label", "title", "placeholder", "data-msg", "alt"].map((a) => e.getAttribute(a) || "").join(" ")).join(" ");
  if (/synced|syncing/i.test(txt)) r.f.push(`${tag}: sync text found`);
  const m = txt.match(/.{0,20}fix.{0,20}/i); if (m) r.f.push(`${tag}: "fix" found: ${m[0]}`);
  if (/\b(accept|decline|declined|draft)\b/i.test(txt)) r.f.push(`${tag}: accept/decline/draft wording found: ${txt.match(/.{0,20}\b(accept|decline|declined|draft)\b.{0,20}/i)[0]}`);
  return r;
}, [tag, phoneW]);
const cards = (page, tag) => page.evaluate((tag) => {
  const r = { f: [], n: 0, h: [] };
  document.querySelectorAll(".panel.on .ncards").forEach((g) => {
    const cs = [...g.querySelectorAll(":scope > .ncard")]; const hs = new Set(cs.map((c) => Math.round(c.getBoundingClientRect().height * 10) / 10));
    if (hs.size > 1) r.f.push(`${tag}: card heights differ ${[...hs]}`);
    cs.forEach((c) => {
      r.n++; const cr = c.getBoundingClientRect(); r.h.push(Math.round(c.offsetHeight));
      c.querySelectorAll("*").forEach((d) => { const dr = d.getBoundingClientRect(); if (dr.height && (dr.bottom > cr.bottom + 0.5 || dr.top < cr.top - 0.5)) r.f.push(`${tag}: clipped ${d.className} in "${c.title}"`); });
      ["nc-k", "nc-s"].forEach((k) => { const e = c.querySelector("." + k); if (!e) return; if (e.offsetHeight > 19) r.f.push(`${tag}: ${k} wraps in "${c.title}"`); if (e.scrollWidth > e.clientWidth + 1 && !c.title.includes(e.textContent.trim().slice(0, 20)) && k === "nc-k") r.f.push(`${tag}: truncated label without title`); });
      const v = c.querySelector(".nc-v"); if (!getComputedStyle(v).fontVariantNumeric.includes("tabular")) r.f.push(`${tag}: value not tabular`);
      if (v.scrollWidth > v.clientWidth + 1) r.f.push(`${tag}: value clipped`);
    });
  });
  return r;
}, tag);
const errs = [];
for (const [name, w, scheme] of [["p390", 390, "light"], ["p390dark", 390, "dark"], ["l1280", 1280, "light"]]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 }, colorScheme: scheme });
  p.on("pageerror", (e) => errs.push(`${name}: ${e.message}`));
  await p.goto(url + "#A"); await p.waitForTimeout(400);
  for (const t of TABS) {
    await p.click(`.tab[data-tab="${t}"]`); await p.waitForTimeout(550);
    const r = await audit(p, `${name} ${t}`, w < 500);
    fails.push(...r.f); M.tabs++; M.phoneScreens += r.phones; M.backOk += r.back; M.homes += r.homes; M.sheets += r.sheets; M.laps += r.laps; M.maxPhoneFont = Math.max(M.maxPhoneFont, r.maxFont);
    if (r.sw > w) fails.push(`${name} ${t}: horizontal scroll ${r.sw}`);
    if (t === "D" || t === "AW") for (const long of [false, true]) {
      if (long) { await p.click(`.panel.on [data-demo="long"]`); await p.waitForTimeout(250); }
      const c = await cards(p, `${name} ${t} long=${long}`); fails.push(...c.f); M.cardsChecked += c.n; c.h.forEach((h) => M.cardHeights.add(h));
      if (long) { await p.screenshot({ path: `${out}${name}-${t}-long.png`, fullPage: true }); await p.click(`.panel.on [data-demo="long"]`); await p.waitForTimeout(200); }
    }
    await p.screenshot({ path: `${out}${name}-${t}.png`, fullPage: true });
  }
  await p.close();
}
// Flows
const p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
p.on("pageerror", (e) => errs.push(`flow: ${e.message}`));
const F = async (name, fn) => { try { await fn(); } catch (e) { fails.push(`flow ${name}: ${e.message.split("\n")[0]}`); } };
await p.goto(url + "#A"); await p.waitForTimeout(400);
const shot = async (sel, n) => p.screenshot({ path: out + n + ".png", clip: await (await p.$(sel)).boundingBox() });
await F("drawer", async () => {
  await p.click('#ph-A [data-act="open"][data-code="HK-001"]'); await p.waitForTimeout(400);
  if (!(await p.$('#ph-A .sheet [data-back]'))) throw new Error("drawer back missing");
  await p.click('#ph-A .sheet [data-act="score"][data-v="4"]'); await p.waitForTimeout(100);
  await p.click('#ph-A .sheet [data-act="step"][data-d="1"]'); await p.waitForTimeout(200);
  const t = await p.textContent('#ph-A .sheet .sh-title'); if (!/Cleanliness/.test(t)) throw new Error("Next did not move: " + t);
  await p.click('#ph-A .sheet [data-act="score"][data-v="1"]'); await p.waitForTimeout(150);
  await shot("#ph-A", "f-drawer-low");
  await p.click('#ph-A .sheet [data-act="raise"]'); await p.waitForTimeout(350);
  await shot("#ph-A", "f-raise");
  await p.click('#ph-A .sheet [data-rgo]'); await p.waitForTimeout(350);
  if (!(await p.$('#ph-A .sheet [data-act="openissue"]'))) throw new Error("raised issue not shown");
  await p.click('#ph-A .sheet [data-act="step"][data-d="-1"]'); await p.waitForTimeout(200);
  await p.click('#ph-A .sheet .sh-head [data-back]'); await p.waitForTimeout(400);
  const st = await p.textContent('#ph-A [data-code="HK-002"] .row-s'); if (!/Observation needed/.test(st)) throw new Error("state not Observation needed: " + st);
  await shot("#ph-A", "f-list");
});
await F("sync", async () => {
  if (await p.$('#ph-A [data-act="syncinfo"]')) throw new Error("sync icon shown while online and synced");
  await p.click('[data-demo="offline"]'); await p.waitForTimeout(150);
  await p.click('#ph-A [data-act="open"][data-code="HK-003"]'); await p.waitForTimeout(350);
  await p.click('#ph-A .sheet [data-act="score"][data-v="5"]'); await p.click('#ph-A .sheet [data-act="ev"][data-k="photo"]'); await p.waitForTimeout(100);
  await p.click('#ph-A .sheet .sh-head [data-back]'); await p.waitForTimeout(350);
  const bd = await p.textContent('#ph-A [data-act="syncinfo"] .badge'); if (bd.trim() !== "2") throw new Error("badge " + bd);
  await p.click('#ph-A [data-act="syncinfo"]'); await p.waitForTimeout(350); await shot("#ph-A", "f-sync"); await p.click('#ph-A .sheet [data-back]'); await p.waitForTimeout(300);
  await p.click('[data-demo="online"]'); await p.waitForTimeout(1800);
  if (await p.$('#ph-A [data-act="syncinfo"]')) throw new Error("sync icon still shown after upload");
});
await F("laptop keys", async () => {
  await p.click('#lap-A [data-code="HK-001"]'); await p.waitForTimeout(150);
  await p.keyboard.press("5"); await p.keyboard.press("j"); await p.waitForTimeout(150);
  const t = await p.textContent('#lap-A .cap-panel .sh-title'); if (!/Cleanliness/.test(t)) throw new Error("j did not move: " + t);
  await shot("#lap-A", "f-lap-capture");
});
await F("restart", async () => {
  await p.click('.tab[data-tab="AV"]'); await p.waitForTimeout(400);
  await p.click('#ph-AV [data-act="open"][data-code="FO-004"]').catch(async () => { await p.click('#ph-AV [data-act="sections"]'); });
  await p.waitForTimeout(400); await shot("#ph-AV", "f-av-drawer");
  if (await p.$('#ph-AV .sheet .seg')) throw new Error("read-only drawer shows score control");
  await p.click('#ph-AV .sheet .sh-head [data-back]'); await p.waitForTimeout(350);
  await p.click('#ph-AV [data-act="revs"]'); await p.waitForTimeout(350); await shot("#ph-AV", "f-av-revs"); await p.click('#ph-AV .sheet [data-back]'); await p.waitForTimeout(300);
  await p.click('#ph-AV [data-act="menu"]'); await p.waitForTimeout(300);
  await p.click('#ph-AV .sheet [data-act="restart"]'); await p.waitForTimeout(350);
  await p.fill('#ph-AV [data-rr]', "Wrong room list used for floor 2"); await p.click('#ph-AV [data-go]'); await p.waitForTimeout(400);
  const meta = await p.textContent('#ph-AV .ph-meta'); if (!/Revision 3/.test(meta)) throw new Error("no Revision 3: " + meta);
});
await F("admin assign and cancel", async () => {
  await p.click('.tab[data-tab="AW"]'); await p.waitForTimeout(400);
  await p.click('#ph-AW2 [data-act="sched"]'); await p.waitForTimeout(350); await shot("#ph-AW2", "f-assign");
  await p.click('#ph-AW2 .sheet [data-cancel]'); await p.waitForTimeout(350);
  await p.fill('#ph-AW2 [data-cr]', "Hotel closed for renovation"); await p.click('#ph-AW2 [data-cgo]'); await p.waitForTimeout(400);
  await p.click('#lap-AW tr[data-act="sel"]:nth-child(2)'); await p.waitForTimeout(200);
  await p.click('#lap-AW .insp [data-sfl="who"]'); await p.waitForTimeout(300); await p.click('#lap-AW .pop [data-pick="Divya Shenoy"]'); await p.waitForTimeout(200);
  await p.click('#lap-AW [data-act="assign"]'); await p.waitForTimeout(300);
  await p.fill('#lap-AW2 [data-cq]', "Coastline"); await p.waitForTimeout(200); await shot("#lap-AW2", "f-hotels");
});
await F("new issue", async () => {
  await p.click('.tab[data-tab="E"]'); await p.waitForTimeout(500);
  await p.click('#ph-E [data-act="newissue"]'); await p.waitForTimeout(350); await p.fill('#ph-E [data-ni="t"]', "Replace lobby doormat"); await shot("#ph-E", "f-newissue");
  await p.click('#ph-E [data-nigo]'); await p.waitForTimeout(300);
});
await F("switch hotel lands on dashboard", async () => {
  await p.click('.tab[data-tab="HS"]'); await p.waitForTimeout(400); await shot("#ph-HS", "f-switcher");
  await p.fill('#ph-HS .sheet input', "coastline hotels"); await p.waitForTimeout(200);
  const name = (await p.textContent('#ph-HS .sheet .lp-row .lp-t')).trim();
  await p.click('#ph-HS .sheet .lp-row'); await p.waitForTimeout(500);
  const on = await p.getAttribute('.tab[data-tab="D"]', "aria-selected"); const ctx = await p.textContent('#ph-D .app-top');
  if (on !== "true" || !ctx.includes(name)) throw new Error(`did not land on ${name} dashboard`);
  if (!(await p.$('#ph-D .app-top [data-back]'))) throw new Error("admin on hotel dashboard has no back");
  await shot("#ph-D", "f-landed");
});
await F("view as lands on dashboard", async () => {
  await p.click('.tab[data-tab="H"]'); await p.waitForTimeout(300);
  await p.click('#ph-H .pillbtn'); await p.waitForTimeout(300); await p.click('#ph-H .sheet [data-va]'); await p.waitForTimeout(300);
  await p.click('#ph-H .sheet [data-pick="Priya Menon"]'); await p.waitForTimeout(500);
  if ((await p.getAttribute('.tab[data-tab="D"]', "aria-selected")) !== "true") throw new Error("view as did not land on dashboard");
});
await F("search", async () => {
  await p.click('.tab[data-tab="S"]'); await p.waitForTimeout(600); await p.keyboard.type("coastline"); await p.waitForTimeout(200); await shot("#lap-S", "f-search"); await p.keyboard.press("Escape");
});
await b.close();
console.log(JSON.stringify({ ...M, cardHeights: [...M.cardHeights] }));
console.log(fails.length ? "FAILS:\n" + [...new Set(fails)].join("\n") : "no fails");
console.log(errs.length ? "ERRORS:\n" + errs.join("\n") : "no js errors");
