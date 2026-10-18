"use strict";
/* ================= Helpers ================= */
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const el = (tag, cls) => { const e = document.createElement(tag); if (cls) e.className = cls; return e; };
const clone = (x) => JSON.parse(JSON.stringify(x));
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const TODAY = "2026-10-04";
function fd(iso, y) { const [Y, M, D] = iso.split("-").map(Number); return `${D} ${MON[M - 1]}${y ? " " + Y : ""}`; }
function dayDiff(a, b) { return Math.round((Date.parse(a) - Date.parse(b)) / 864e5); }
const ini = (n) => n.split(" ").map((w) => w[0]).slice(0, 2).join("");
let Z = 100;

/* Lucide icons (stroke 2, per zarnik-ds readme section 4) */
const I = {
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  chevronRight: '<path d="m9 18 6-6-6-6"/>',
  chevronLeft: '<path d="m15 18-6-6 6-6"/>',
  chevronsUpDown: '<path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  cloud: '<path d="m17 15-5.5 5.5L9 18"/><path d="M5 17.743A7 7 0 1 1 15.71 10h1.79a4.5 4.5 0 0 1 1.5 8.742"/>',
  cloudOff: '<path d="m2 2 20 20"/><path d="M5.782 5.782A7 7 0 0 0 9 19h8.5a4.5 4.5 0 0 0 1.307-.193"/><path d="M21.532 16.5A4.5 4.5 0 0 0 17.5 10h-1.79A7.008 7.008 0 0 0 10 5.07"/>',
  refresh: '<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>',
  camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
  paperclip: '<path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>',
  fileText: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/>',
  listChecks: '<path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  home: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  clipboard: '<rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>',
  wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  library: '<path d="m16 6 4 14"/><path d="M12 6v14"/><path d="M8 8v12"/><path d="M4 4v16"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  settings: '<path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/>',
  menu: '<path d="M4 12h16"/><path d="M4 6h16"/><path d="M4 18h16"/>',
  building: '<rect width="16" height="20" x="4" y="2" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  filter: '<path d="M3 6h18"/><path d="M7 12h10"/><path d="M10 18h4"/>',
  sort: '<path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/>',
  eye: '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>',
  more: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
  send: '<path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/>',
  trendUp: '<path d="M16 7h6v6"/><path d="m22 7-8.5 8.5-5-5L2 17"/>',
  alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  inbox: '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
  calendar: '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
  chart: '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
  bookmark: '<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>',
  columns: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/><path d="M15 3v18"/>',
  layers: '<path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/>',
  grid: '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>',
  external: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  logout: '<path d="m16 17 5-5-5-5"/><path d="M21 12H9"/><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>',
  history: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>',
  image: '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  userPlus: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6"/><path d="M22 11h-6"/>',
  rotate: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
  circleDot: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="1"/>',
  uploadCloud: '<path d="M12 13v8"/><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="m8 17 4-4 4 4"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  briefcase: '<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/>',
  calendarPlus: '<path d="M8 2v4"/><path d="M16 2v4"/><path d="M21 13V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8"/><path d="M3 10h18"/><path d="M16 19h6"/><path d="M19 16v6"/>',
  archive: '<rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/>',
  sliders: '<path d="M10 5H3"/><path d="M12 19H3"/><path d="M14 3v4"/><path d="M16 17v4"/><path d="M21 12h-9"/><path d="M21 19h-5"/><path d="M21 5h-7"/><path d="M8 10v4"/><path d="M8 12H3"/>',
};
const ic = (n, cls = "") => `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[n] || ""}</svg>`;
/* Zarnik Z mark, from zarnik-ds assets/icon.svg */
const MARK = '<svg class="mark" viewBox="0 0 283.5 283.5" aria-hidden="true"><path d="M226.4,16c0.3,0.5,0.5,1,0.8,1.5c17.9,27.4,35.8,54.7,53.7,82c0.7,1,0.8,1.8,0.1,2.9c-17.9,27.3-35.8,54.6-53.7,81.9c-0.3,0.5-0.6,1-1,1.5c-2.5-3.9-5-7.6-7.5-11.4c-15.7-24-31.5-48-47.2-72.1c-0.6-0.9-1.7-1.5-2.8-1.5c-35.9,0-71.9,0-107.8,0.1c-1.2,0-2-0.3-2.7-1.4C40.4,72.3,22.5,45,4.6,17.7c-0.3-0.5-0.6-1.1-1-1.6C77.9,16,152.2,16,226.4,16z"/><path d="M59,271.3c-0.3-0.5-0.5-1-0.8-1.5c-17.9-27.3-35.7-54.6-53.7-81.9c-0.8-1.3-0.8-2.1,0-3.3c17.8-27.1,35.6-54.3,53.4-81.5c0.3-0.5,0.7-1,1.1-1.7c2.3,3.5,4.6,6.9,6.8,10.3c16,24.4,31.9,48.8,47.9,73.2c0.6,0.9,1.7,1.5,2.8,1.5c35.9,0,71.9,0,107.8-0.1c1.2,0,2,0.3,2.7,1.4c17.9,27.4,35.8,54.7,53.7,82.1c0.3,0.5,0.6,1,0.9,1.5L59,271.3L59,271.3z"/></svg>';

/* ================= Sample data (src/sample/data.ts) ================= */
const RAW = [["AE-001","Approach road and signage","Arrival & Exterior","Approach",0,"Repair or replace faded signs and add lighting on the approach.","Signboard faded and partly unlit after dark."],["AE-002","Parking and drop-off","Arrival & Exterior","Parking",0,"Mark bays and station a valet during peak check-in.","Bays unmarked and drop-off lane blocked by parked cars."],["AE-003","Entrance and porch","Arrival & Exterior","Entrance",0,"Clean and polish the porch floor each shift.","Porch floor stained and doormat worn."],["FO-001","Desk appearance and staffing","Front Office & Guest Services","Front desk",0,"Keep the desk clear and rotate breaks so it is never empty.","Desk unattended for several minutes with loose papers on it."],["FO-002","Check-in speed and greeting","Front Office & Guest Services","Check-in",0,"Pre-register arrivals and brief the team on the greeting.","Check-in took over ten minutes with no welcome greeting."],["FO-003","ID and payment handling","Front Office & Guest Services","Check-in",0,"Copy ID for every guest and record payment before key issue.","ID copy missing for two of five checked folios."],["FO-004","Check-out and billing accuracy","Front Office & Guest Services","Check-out",0,"Check each folio against charges before presenting the bill.","Two bills carried wrong minibar charges."],["HK-001","Door, lock and safety notice","Rooms & Housekeeping","Guest room entry",1,"Repair faulty locks the same day and display the safety notice in every room.","Lock sticking in one room and no safety notice on the door."],["HK-002","Cleanliness and smell","Rooms & Housekeeping","Guest room",0,"Add a supervisor check before each room is released.","Dust on headboard and a damp smell in two rooms."],["HK-003","Bed and linen","Rooms & Housekeeping","Guest room",0,"Replace stained or worn linen and check each bed after making.","Stained sheets and worn pillow covers found."],["HK-004","Bathroom fittings and grouting","Rooms & Housekeeping","Bathroom",0,"Re-grout blackened joints and descale taps.","Blackened grouting and limescale on taps."],["HK-005","Air conditioning","Rooms & Housekeeping","Guest room",0,"Service filters and log each repair.","Unit noisy and slow to cool in two rooms."],["FB-001","Table setup","Food & Beverage","Restaurant",0,"Use a set-up checklist before each service.","Cutlery spotted and napkins missing on several tables."],["FB-002","Food quality and temperature","Food & Beverage","Restaurant",0,"Probe hot dishes before service and keep a record.","Hot dishes served lukewarm."],["FB-003","Buffet hygiene and labels","Food & Beverage","Buffet",0,"Label every dish with allergens and replace sneeze guards.","Labels missing on four dishes and a cracked sneeze guard."],["KT-001","Food storage and temperature logs","Kitchen & Back of House","Storage",1,"Record temperatures twice a day and escalate any reading above 5 C.","Temperature log blank for three days and cold room above 8 C."],["KT-002","Raw and cooked separation","Kitchen & Back of House","Preparation",0,"Use colour-coded boards and separate shelves.","Raw chicken stored above cooked items."],["KT-003","Pest control","Kitchen & Back of House","Hygiene",1,"Seal gaps and keep the pest control service report on file.","Droppings near the dry store and no recent service report."],["KT-004","Gas safety and hoods","Kitchen & Back of House","Equipment",1,"Test the gas leak alarm monthly and clean hood filters weekly.","Hood filters greasy and gas alarm not tested."],["PA-001","Lobby and lounge","Public Areas & Facilities","Lobby",0,"Add a lobby walk-round every two hours.","Tables cluttered and cushions out of place."],["PA-002","Public restrooms","Public Areas & Facilities","Restrooms",0,"Keep an hourly cleaning sheet on the door.","No soap in one dispenser and a wet floor."],["PA-003","Staircases and emergency routes","Public Areas & Facilities","Routes",0,"Clear stored items from stairs and corridors.","Linen trolley parked on the service stairs."],["WR-001","Pool water and safety","Wellness & Recreation","Pool",1,"Test water twice a day and display depth markers and rules.","Water cloudy and no depth markers at the shallow end."],["WR-002","Gym","Wellness & Recreation","Gym",0,"Repair or remove broken machines and wipe down every shift.","One treadmill out of order and no towels."],["EM-001","Visible defects","Engineering & Maintenance","General upkeep",0,"Log defects found on walk-rounds and close them within a week.","Chipped paint and loose tiles along the corridor."],["EM-002","DG and power backup","Engineering & Maintenance","Power",0,"Run the DG on load weekly and keep the log.","No DG load test recorded in the last month."],["EM-003","Preventive maintenance records","Engineering & Maintenance","Records",0,"Keep a dated schedule and sign off each task.","Schedule out of date and unsigned."],["SF-001","Extinguishers and hoses","Safety, Security & Compliance","Fire safety",1,"Place a charged extinguisher at every point on the fire plan and tag each with its refill date.","Extinguisher missing at the second floor landing."],["SF-002","Smoke detectors and alarms","Safety, Security & Compliance","Fire safety",1,"Test every detector monthly and replace faulty units.","Two detectors did not respond to the test."],["SF-003","Exits and emergency lighting","Safety, Security & Compliance","Emergency routes",1,"Keep exits clear and test emergency lights monthly.","Emergency light dead at the east exit."],["SF-004","CCTV","Safety, Security & Compliance","Security",0,"Keep at least 30 days of footage and check camera coverage weekly.","Two cameras offline at the service entrance."],["SF-005","Licences on display","Safety, Security & Compliance","Compliance",0,"Display every current licence at reception.","Fire licence not displayed."],["SG-001","Uniform and name badges","Staff, Grooming & Service Culture","Grooming",0,"Issue spare badges and check grooming at shift briefing.","Name badges missing on several team members."],["SG-002","Courtesy","Staff, Grooming & Service Culture","Service culture",0,"Coach the team on greeting every guest within the first few steps.","Guests passed without a greeting on two occasions."]];
const ITEMS = RAW.map(([code, label, dept, sec, crit, rec, obs]) => ({ code, label, dept, sec, crit: !!crit, rec, obs }));
const IT = Object.fromEntries(ITEMS.map((i) => [i.code, i]));
const DEPTS = [...new Set(ITEMS.map((i) => i.dept))];
const HOTEL = "Harbour View Hotel";
const REASONS = ["No SOP", "Not trained", "Short of stock", "Equipment not working", "Already reported", "Disagrees"];
const PEOPLE = [
  { n: "Priya Menon", r: "Hotel Manager", h: "Harbour View Hotel" },
  { n: "Latha Krishnan", r: "Department Head", h: "Harbour View Hotel" },
  { n: "Asha Kumari", r: "Staff", h: "Harbour View Hotel" },
  { n: "Rohan Iyer", r: "Auditor", h: "3 hotels" },
  { n: "Meera Nair", r: "Admin", h: "All hotels" },
  { n: "Anil Varghese", r: "Group Head", h: "Lakshmi Hospitality Group" },
  { n: "Kiran Shetty", r: "Hotel Manager", h: "Palm Court Inn" },
  { n: "Dev Pillai", r: "Hotel Manager", h: "Cedar Ridge Resort" },
  { n: "Sunita Rao", r: "Group Head", h: "Northgate Stays" },
];
const TEAM = PEOPLE.slice(0, 3);
const AUD = { oct: "Ops & Quality, October 2026", sep: "Ops & Quality, September 2026", jun: "Ops & Quality, June 2026", mar: "Ops & Quality, March 2026", dec: "Ops & Quality, December 2025" };
const AUDIT_NAMES = [AUD.sep, AUD.jun, AUD.mar, AUD.dec];

/* Issues for Harbour View Hotel. Raised by hand from audit items. */
const ISSUES = [];
const CUR = [
  ["FO-004", "open", "2026-09-28", "Latha Krishnan", 1, "Noted. We will sort this out before the next audit.", "Not trained"],
  ["HK-003", "progress", "2026-09-30", "Asha Kumari", 2, "New linen is ordered and arrives this week.", "Short of stock"],
  ["KT-001", "open", "2026-10-02", "Priya Menon", 1, "The chef keeps the log from today.", "No SOP"],
  ["HK-001", "open", "2026-10-10", "Latha Krishnan", 2, "", ""],
  ["FB-002", "progress", "2026-10-12", "Asha Kumari", 2, "Probe thermometer bought.", "Equipment not working"],
  ["SF-003", "open", "2026-10-15", "Priya Menon", 2, "", ""],
  ["EM-002", "progress", "2026-10-18", "Priya Menon", 1, "Vendor visit booked.", "Already reported"],
  ["SG-001", "open", "2026-10-20", "Latha Krishnan", 2, "Spare badges ordered.", "Short of stock"],
  ["FB-003", "open", "2026-10-25", "Asha Kumari", 2, "Labels are being printed.", "No SOP"],
  ["PA-002", "resolved", "2026-09-26", "Asha Kumari", 2, "Cleaning sheet now on the door.", "Not trained"],
  ["AE-001", "resolved", "2026-09-19", "Priya Menon", 1, "New signboard installed.", "Already reported"],
  ["HK-004", "resolved", "2026-09-15", "Asha Kumari", 2, "Bathrooms re-grouted.", "Equipment not working"],
  ["FO-001", "resolved", "2026-09-12", "Latha Krishnan", 2, "Break rota changed.", "Not trained"],
];
CUR.forEach(([code, status, due, who, score, resp, reason]) => {
  const i = IT[code];
  ISSUES.push({ id: ISSUES.length, code, label: i.label, dept: i.dept, status, due, who, score, resp, reason, audit: AUD.sep, obs: i.obs, rec: i.rec, updated: status === "resolved" ? due : "2026-10-02" });
});
[["jun", "2026-07-", 0], ["mar", "2026-04-", 1], ["dec", "2026-01-", 2]].forEach(([k, pre, a]) => {
  ITEMS.forEach((i, ix) => {
    if ((ix * 7 + a * 3) % 3 !== 0) return;
    const day = String(5 + ((ix * 3) % 22)).padStart(2, "0");
    ISSUES.push({ id: ISSUES.length, code: i.code, label: i.label, dept: i.dept, status: "resolved", due: pre + day, who: TEAM[ix % 3].n, score: 1 + (ix % 2), resp: "Done.", reason: REASONS[ix % 6], audit: AUD[k], obs: i.obs, rec: i.rec, updated: pre + day });
  });
});
ISSUES.forEach((x) => { x.iid = `ISS-${String(1001 + x.id)}`; x.by = "Rohan Iyer"; });
const ST = { open: { l: "Open", c: "st-open" }, progress: { l: "In progress", c: "st-progress" }, resolved: { l: "Resolved", c: "st-resolved" }, redflag: { l: "Red flag", c: "st-redflag" } };
const isOver = (f) => f.status !== "resolved" && f.due < TODAY;
const waiting = (f) => f.status !== "resolved" && !f.resp;
function dueText(f) {
  if (f.status === "resolved") return `Resolved ${fd(f.updated)}`;
  const d = dayDiff(TODAY, f.due);
  if (d > 0) return `<span class="overdue">${d} ${d === 1 ? "day" : "days"} overdue</span>`;
  if (d === 0) return "Due today";
  return `Due ${fd(f.due)}`;
}
const stat = (k) => `<span class="status"><span class="dot ${ST[k].c}"></span>${ST[k].l}</span>`;
const pill = (k) => `<span class="pill"><span class="dot ${ST[k].c}"></span>${ST[k].l}</span>`;
const scoreChip = (v) => v === "na" ? `<span class="chip">N/A</span>` : `<span class="chip"><span class="dot d-s${v}"></span>${v}</span>`;
function band(n) { return n >= 90 ? ["Excellent", "b-excellent"] : n >= 75 ? ["Good", "b-good"] : n >= 60 ? ["Needs work", "b-needs"] : ["Poor", "b-poor"]; }
const bandTag = (n) => { const [l, c] = band(n); return `<span class="status"><span class="dot ${c}"></span>${l}</span>`; };
const DEPT_SCORES = [[DEPTS[0], 84, 3], [DEPTS[1], 72, 5], [DEPTS[2], 74, -2], [DEPTS[3], 79, 4], [DEPTS[4], 70, 6], [DEPTS[5], 86, 1], [DEPTS[6], 91, 0], [DEPTS[7], 76, 2], [DEPTS[8], 77, 8], [DEPTS[9], 88, 3]];


/* ===== Clients own hotels. 200 clients, 1,046 hotels (3 from the sample data, the rest generated to test scale). ===== */
const CLIENTS = ["Lakshmi Hospitality Group", "Northgate Stays"];
(() => {
  const A = ["Coastline", "Western Ghats", "Malabar", "Konkan", "Deccan", "Spice Coast", "Nilgiri", "Cauvery", "Periyar", "Vembanad", "Sahyadri", "Tranquil", "Heritage", "Monsoon", "Lotus", "Banyan", "Coral", "Palmyra", "Indigo", "Kodagu"];
  const B = ["Hotels", "Resorts", "Hospitality", "Stays", "Hotels and Resorts", "Inns", "Group", "Retreats", "Suites", "Residences"];
  for (let i = 0; CLIENTS.length < 200; i++) { const n = `${A[i % 20]} ${B[Math.floor(i / 20) % 10]}`; if (!CLIENTS.includes(n)) CLIENTS.push(n); }
})();
const HOTELS = [
  { n: "Harbour View Hotel", c: "HVH", city: "Kochi", g: CLIENTS[0] },
  { n: "Palm Court Inn", c: "PCI", city: "Mysuru", g: CLIENTS[0] },
  { n: "Cedar Ridge Resort", c: "CRR", city: "Munnar", g: CLIENTS[1] },
];
(() => {
  const PRE = ["Lotus", "Coral", "Silver Oak", "Bayview", "Marigold", "Spice Route", "Lagoon", "Hilltop", "Riverside", "Temple View", "Sandalwood", "Monsoon", "Banyan", "Jasmine", "Peacock", "Teak", "Tamarind", "Backwater", "Cardamom", "Seashell"];
  const SUF = ["Hotel", "Inn", "Resort", "Residency", "Suites"];
  const CITIES = ["Kochi", "Mysuru", "Munnar", "Kozhikode", "Thrissur", "Alappuzha", "Kollam", "Mangaluru", "Udupi", "Coimbatore", "Madurai", "Ooty", "Kannur", "Wayanad", "Thiruvananthapuram", "Hubballi", "Kumarakom", "Varkala"];
  const seen = new Set(HOTELS.map((h) => h.n));
  for (let i = 0; HOTELS.length < 1046; i++) {
    const p = PRE[i % 20], s = SUF[Math.floor(i / 20) % 5], city = CITIES[(i * 7 + Math.floor(i / 100)) % 18];
    const n = `${p} ${s} ${city}`;
    if (seen.has(n)) continue; seen.add(n);
    const k = HOTELS.length - 3, g = CLIENTS[2 + ((k * 13) % 198)];
    HOTELS.push({ n, c: (p.split(" ").map((w) => w[0]).join("") + s[0] + city[0]).toUpperCase() + String(i).padStart(4, "0"), city, g });
  }
})();
const HOTELS_BY_CLIENT = [...HOTELS].sort((a, b) => a.g.localeCompare(b.g) || a.n.localeCompare(b.n));
const LONG_HOTEL = { n: "The Grand Harbour View Heritage Hotel and Convention Centre, Fort Kochi", c: "GHV", city: "Kochi", g: CLIENTS[0] };
const hotelCount = (g) => HOTELS.filter((h) => h.g === g).length;

/* Auditors: Sightline staff or freelance. Templates are global masters. */
const AUDITORS = [
  { n: "Rohan Iyer", r: "Auditor", h: "Sightline staff", open: 3 },
  { n: "Nikhil Rao", r: "Auditor", h: "Sightline staff", open: 5 },
  { n: "Fathima Beevi", r: "Auditor", h: "Sightline staff", open: 2 },
  { n: "Arjun Menon", r: "Auditor", h: "Freelance", open: 1 },
  { n: "Divya Shenoy", r: "Auditor", h: "Freelance", open: 4 },
  { n: "Suresh Pai", r: "Auditor", h: "Freelance", open: 0 },
];
const TEMPLATES = [["Ops & Quality", 34], ["Food Safety", 48], ["Rooms Quick Check", 18], ["Fire and Life Safety", 26], ["Brand Standards", 120], ["Spa and Wellness", 22]];
const SCHED = [];
(() => {
  const picks = [0, 1, 2, 17, 44, 103, 260, 391, 512, 640, 777, 905, 1001, 333, 58, 721, 860, 150, 470, 999, 12, 610];
  picks.forEach((hi, k) => {
    const h = HOTELS[hi], t = TEMPLATES[k % 6][0];
    const date = k % 5 === 4 ? null : `2026-10-${String(6 + ((k * 3) % 24)).padStart(2, "0")}`;
    const who = date && k % 3 !== 1 ? AUDITORS[k % 6].n : null;
    SCHED.push({ id: k, h: h.n, g: h.g, city: h.city, t, date, who, state: !date ? "To schedule" : !who ? "Not assigned" : "Scheduled" });
  });
})();
const SCHED_ST = { "To schedule": "st-open", "Not assigned": "st-open", Scheduled: "st-progress", Cancelled: "" };
const AUDITS = [
  { t: AUD.oct, s: "Harbour View Hotel · In progress · 7 of 34", go: "A" },
  { t: AUD.sep, s: "Harbour View Hotel · Submitted · Revision 2 · 78 Good", go: "AV" },
  { t: AUD.jun, s: "Harbour View Hotel · Submitted · 74 Needs work" },
  { t: "Food Safety, September 2026", s: "Cedar Ridge Resort · Submitted · 81 Good" },
  { t: "Ops & Quality, September 2026", s: "Palm Court Inn · Submitted · 69 Needs work" },
];
