---
title: "Part 3: Marketing website"
sidebar:
  order: 3
---

:::note
Imported from blueprint revision R2 (old repository `azharumar/sightline`, 2026-10-05). This is the starting specification for `azharumar/sightline-web` (Astro on Netlify). It is not yet reviewed against the app decisions of 2026-10-18 (for example, the app no longer compares hotels); the web epic starts by reconciling it. This page is now the only copy: edit it here.
:::

## Site structure

**Core**

- `/` Home
- `/how-we-audit/` process, scoring method, confidentiality
- `/dashboard/` The Sightline Dashboard
- `/sample-report/` blurred preview pages
- `/request-a-call/` the only lead form

**Audits and plans**

- `/audits/` hub, grouped by category
- `/audits/{audit-name}/` one page per audit, e.g. `/audits/housekeeping-audit/`
- `/plans/` hub
- `/plans/{plan-name}/` Annual 360 Health Check, Sightline Care, Sightline Controls, Sightline Complete, Sightline Recovery

**Departments**

- `/departments/{department}/` one hub per department, e.g. `/departments/housekeeping/`

**Who it is for**

- `/for/hotel-owners/`
- `/for/hotel-groups/`
- `/for/investors-and-buyers/`
- `/for/new-hotels/`

**Trust**

- `/about/`
- `/team/azhar-umar/`
- `/team/vijayalakshmi-pv/`
- `/insights/` and `/insights/{article}/`
- `/faq/`
- `/service-area/`

**Utility**

- `/privacy/`, `/terms/`
- `/sitemap.xml`, `/robots.txt`, `/llms.txt`

## Audit pages

Every audit page follows the same order, with plain headings.

1. **Page title + one plain line** saying what the audit does; this line is written to be quoted by AI tools
2. **Request a call**
3. **What we check:** grouped by area
4. **How the audit works:** Request a call → Discovery call → Audit → Report → Follow-up
5. **How long it takes:** days by property size, in words
6. **What you receive:** scores, photos and notes, issue list, PDF, dashboard access, comparison at the next audit
7. **The Sightline dashboard:** short block with a link to `/dashboard/`
8. **Who does the audit:** Azhar and Vijayalakshmi with credentials
9. **Sample report:** shown on the discovery call
10. **Questions owners ask**
11. **Request a call**

## Plan pages

1. **Page title + one plain line** on what the plan gives the hotel
2. **Request a call**
3. **What is included across the year:** e.g. Q1 Annual 360 Health Check → Q2 Ops & Quality → Q3 Ops & Quality → Q4 Ops & Quality
4. **What you receive**
5. **The Sightline dashboard:** sample score trend
6. **Who does the audit**
7. **Questions owners ask**
8. **Request a call**

## Department hub pages

A department hub lists every audit that checks that department, with department-only audits first.

- **Page title:** e.g. Housekeeping audits
- **Audits only for this department**
- **Audits that include this department:** grouped, e.g. Daily operations, What guests see, Costs and buying, Rooms and building, Team and leadership, New or changing hotels
- **Plans that include this department**
- **Which audit to choose:** problem → audit, e.g. Linen keeps going missing → Laundry & Linen Audit + Inventory & Stores Audit
- **Who does the audit**
- **Questions owners ask**
- **Request a call**
- Each audit listed with one line on what it checks in that department
- Built from the site's own department list, matching Part 1

**Hubs:** Housekeeping, Front Office, Food & Beverage, Kitchen, Engineering & Maintenance, Finance & Accounts, Purchase & Stores, Human Resources, Sales & Revenue, Security, Spa & Recreation

## Sightline Dashboard page

- **Title:** The Sightline Dashboard
- **Covers:** scores, findings with photos, issue list, assigning issues, score history, PDF reports, multi-hotel view for groups
- **Screenshots:** a demo hotel with made-up data, never a real client
- **Linked from:** home, every audit page, every plan page, How we audit

## Team pages

- One page each for Azhar Umar and Vijayalakshmi PV
- Credentials as in Part 1
- Linked to LinkedIn
- Person structured data on each page

## Insights

- Written only from what was seen in real audits, anonymised
- One article per finding or pattern
- Each article names its author and shows a last-updated date

## Page layout

- Static pages, near-zero scripts
- One button label everywhere: Request a call
- Request a call at the top and the bottom of every audit, plan and hub page
- Mobile-first

## Copy rules

- Plain, literal headings and labels: say exactly what the section or action is
- No eyebrows
- No em dashes
- No metaphors, slogans, clever headlines or headings that need the paragraph to explain them
- Short sentences, typed not scripted
- No promises the founders cannot keep, e.g. a fixed call-back time
- Test: reading only the headings, a visitor knows what is sold and how to buy it

## SEO

- Static HTML, readable without JavaScript
- Fast pages, optimised images
- Hub and spoke links: every audit links to its hub, its departments and related audits
- Structured data: Organization, Person, Service, FAQ, Article, Breadcrumb
- Sitemap and canonical tag on every page
- Content stored as Markdown files in the repo

## GEO

GEO means being found and quoted by ChatGPT, Perplexity, Gemini and Claude.

- First sentence of every page is a quotable definition
- Questions as headings in FAQ sections, e.g. "How long does a hotel audit take?"
- Named experts with credentials on every audit and plan page
- One description used everywhere: "Zarnik Sightline is a hotel audit service from Kochi, led by Azhar Umar and Vijayalakshmi PV."
- AI crawlers allowed in robots.txt, plus an llms.txt listing key pages
- Original findings from audits in Insights
- Outside mentions: Google Business Profile, LinkedIn page, hospitality publications

## E-E-A-T content pillars

**Experience**

- **Field findings:** patterns seen across audits, e.g. kitchen failures most common in Kerala hotels
- **Before and after:** score changes with photos; client named only with permission

**Expertise**

- **How we audit:** scoring, weighting, why one critical item outweighs a clean lobby
- **Owner's view:** what an owner should ask their GM each month

**Authority**

- **Kerala know-how:** monsoon damage, waterproofing, FSSAI checks, seasonal staffing
- Workshops run, talks given, mentions in hospitality publications

**Trust**

- How we audit, including confidentiality rules
- Sample report preview
- Company details: Zarnik Enterprise Services, Kochi address, phone

## Request a call form

- One form, on `/request-a-call/`
- **Fields:** name, phone, email, hotel name, rooms, location, what you need
- **Hidden field:** the page the visitor came from
- **Service:** Web3Forms, sending to audits@zarnik.com, spam protection on
- **Lead list:** each lead added to the Google Sheet
- **Between intakes:** same form, message changes to "Join the waitlist for the next intake"

## Hosting

- Astro static site
- Netlify
- Address: sightline.zarnik.com
