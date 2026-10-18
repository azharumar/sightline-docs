---
title: "07. Scoring"
sidebar:
  order: 7
---

Scores are calculated on the server at submit (and again only when an Administrator corrects a submitted revision), from database rows, never from client numbers. They are never averaged across audit templates. The review screen shows a preview from the same engine through `submit-check`; there is no separate browser implementation.

## 1. Rules

| Rule | Detail |
|---|---|
| Scale 0 to 5 | 0 critical fail · 1 poor · 2 below standard · 3 acceptable · 4 good · 5 excellent |
| Yes / No | Stored as 5 (Yes) and 0 (No) |
| N/A | Left out of every calculation |
| Item weight | Decimal above 0, default 1, frozen on the result |
| Sub-section weight | High 3, Medium 2, Low 1, frozen on the audit sub-section |
| Sub-section score | sum(score × weight) / sum(5 × weight) × 100 over applicable items |
| Section score | Weighted average of that Section's sub-section scores, by sub-section weight |
| Audit score | Weighted average of all sub-section scores, by sub-section weight |
| Empty sub-section | No applicable items: no score, left out of Section and audit scores |
| Empty audit | No applicable items at all: "No score"; can still be submitted |
| Red flag | A critical result scored 0 (including No). Each one counts |
| Cap | Any red flag: audit score = min(raw audit score, 50). Sub-section and Section scores are not capped |
| Rounding | `Decimal`, `ROUND_HALF_UP`, 2 places. Sub-section scores rounded first; Section and audit scores from the rounded sub-section scores, then rounded; the cap applies to the rounded raw score |
| Bands | Excellent 90.00 and above; Good 75.00 to 89.99; Needs work 60.00 to 74.99; Poor below 60.00 |
| Change from last audit | This score minus the previous released audit of the same template at the same hotel (by `audit_date`, then `submitted_at`); null if none. Same for each Section and sub-section, matched by `section_id` and master `sub_section_id` |
| Failure | A result scored 2 or below, or No |
| Correction | Recalculates only the corrected revision, with the same rules; earlier saved scores of other revisions never change |
| No hotel score | No hotel score, hotel group score, cross-template average or ranking exists anywhere |

Ops & Quality starting sub-section weights come from their Section: High for Rooms & Housekeeping, Kitchen & Back of House, Safety, Security & Compliance; Medium for Food & Beverage, Front Office & Guest Services, Engineering & Maintenance; Low for Arrival & Exterior, Public Areas & Facilities, Wellness & Recreation, Staff, Grooming & Service Culture.

## 2. Reference implementation

`sightline/scoring/engine.py`, pure Python with no Frappe imports, so it is unit tested without a site.

```python
from dataclasses import dataclass
from decimal import Decimal, ROUND_HALF_UP
from typing import Iterable

HUNDRED, FIVE, CAP, Q = Decimal(100), Decimal(5), Decimal(50), Decimal("0.01")

def r2(x: Decimal) -> Decimal:
    return x.quantize(Q, rounding=ROUND_HALF_UP)

@dataclass(frozen=True)
class ResultIn:
    sub_section_id: str
    score: int | None
    is_na: bool
    weight: Decimal
    is_critical: bool

@dataclass(frozen=True)
class SubSectionIn:
    id: str
    section_id: str
    weight: int

@dataclass(frozen=True)
class Scores:
    sub_sections: dict[str, Decimal | None]
    sections: dict[str, Decimal]
    raw: Decimal | None
    audit: Decimal | None
    red_flags: int

def applicable(r: ResultIn) -> bool:
    return not r.is_na and r.score is not None

def sub_section_score(results: Iterable[ResultIn]) -> Decimal | None:
    rows = [r for r in results if applicable(r)]
    if not rows:
        return None
    num = sum((Decimal(r.score) * r.weight for r in rows), Decimal(0))
    den = sum((FIVE * r.weight for r in rows), Decimal(0))
    return r2(num / den * HUNDRED)

def weighted(pairs: list[tuple[Decimal, int]]) -> Decimal | None:
    if not pairs:
        return None
    return r2(sum((s * w for s, w in pairs), Decimal(0)) / sum((Decimal(w) for _, w in pairs), Decimal(0)))

def score_revision(subs: list[SubSectionIn], results: list[ResultIn]) -> Scores:
    by_sub = {s.id: sub_section_score([r for r in results if r.sub_section_id == s.id]) for s in subs}
    scored = [(s, by_sub[s.id]) for s in subs if by_sub[s.id] is not None]
    sections = {
        sid: weighted([(v, s.weight) for s, v in scored if s.section_id == sid])
        for sid in {s.section_id for s, _ in scored}
    }
    raw = weighted([(v, s.weight) for s, v in scored])
    red_flags = sum(1 for r in results if r.is_critical and not r.is_na and r.score == 0)
    audit = None if raw is None else (min(raw, CAP) if red_flags else raw)
    return Scores(by_sub, sections, raw, audit, red_flags)

def band(score: Decimal) -> str:
    return "excellent" if score >= 90 else "good" if score >= 75 else "needs_work" if score >= 60 else "poor"
```

## 3. Test cases with known answers

Parametrised tests read `sightline/scoring/tests/cases.json` (run with plain pytest, no site needed). Item weight 1 unless stated; C marks a critical item.

| Case | Setup | Expected |
|---|---|---|
| 1 | A (Rooms & Housekeeping, weight 3): 5, 4, 3 → 80.00. B (Kitchen & Back of House, weight 1): 2, N/A, 4 (weight 2) → 10/15 = 66.67 | Sections 80.00 and 66.67; audit (240 + 66.67) / 4 = 76.6675 → **76.67**, Good |
| 2 | C (weight 2): No (C), 5, 5, 5 → 75.00. D (weight 2): 5, 5 → 100.00 | Raw **87.50**, 1 red flag, audit **50.00**, Poor |
| 3 | E (weight 1): 0 (C), 1, 2, 3 → 30.00. F (weight 1): 3, 3 → 60.00 | Raw **45.00**, audit **45.00** (cap never raises) |
| 4 | G (weight 3): N/A, N/A. H (weight 1): 4, 4 → 80.00 | G no score; G's Section no score; audit **80.00** |
| 5 | Every result N/A | No sub-section, Section or audit score; 0 red flags |
| 6 | I (weight 2): 5 (weight 3), 0 (weight 1, not critical) | 15/20 → **75.00**, no red flag |
| 7 | S1 (Rooms, weight 3): 5,5,4,4,4,5,5,4,5,4 → 90.00. S2 (Rooms, weight 1): 4, 3 → 70.00. S3 (Food & Beverage, weight 2): 3, 3 → 60.00 | Rooms **85.00**, F&B **60.00**, audit 460 / 6 → **76.67** (not the 72.50 average of Sections) |
| 8 | Non-critical No; critical scored 1; critical N/A | No red flag in any |
| 9 | J (weight 1): 5, 5, 0 → 66.67. K (weight 2): 5, 0, 0 → 33.33 | Audit 133.33 / 3 → **44.44** |
| 10 | L (weight 1): 0 (C), 0 (C), 5, 5 → 50.00. M (weight 1): 5 → 100.00 | Raw 75.00, **2** red flags, audit **50.00** |
| 11 | Case 1 submitted, then Admin corrects B's 2 to 4 | B (4 + 8) / 15 = 80.00; audit (240 + 80) / 4 = **80.00**, Good; Revision 1's other saved values unchanged |

Band boundaries: 100.00 and 90.00 Excellent; 89.99 and 75.00 Good; 74.99 and 60.00 Needs work; 59.99 and 0.00 Poor.

Property tests (hypothesis): every score in 0 to 100; marking an item N/A never changes other sub-sections; adding a 5 never lowers its sub-section, adding a 0 never raises it; any red flag keeps the audit at or below 50; scaling all item weights in a sub-section by one factor changes nothing.

## 4. Where scores are read

- Lists, dashboards and emails: `audits.score`, `has_red_flag`, `red_flag_count` (copied from the released revision).
- Print formats and history: revisions, sub-sections, `audit_section_scores`.
- "Latest audit score per audit template at a hotel": `DISTINCT ON (hotel_id, audit_template_id)` over released standard audits ordered by `audit_date desc`.
