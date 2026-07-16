# PROGRESS — PurePastures GHG Activity Data Entry Tool (MVP)

> Claude Code: read this file at the start of every session, before touching
> anything. Update it at every save point. Replace content — do not append.
> History lives in git.

**Session:** 3 — v4.0 build complete
**Last updated:** 2026-07-15 — by Claude Code, session 3
**Live URL:** pending — Netlify's native integration deploys on push to `main`;
builder confirms in the Netlify dashboard (no MCP visibility, see spec Section 4).

## Current state
Tool matches product-spec.md v4.0 (Tier 1, D2+A1 — session-only, no login,
no backend). `docs/` re-created and `product-spec.md` moved back in again
(v4.0 had been re-uploaded flat to the repo root, same failure mode as
session 2's v3.0 upload — see Known issues).

Activity Data schema split (`src/data/lookups.js`, `EntryForm.jsx`,
`DataReview.jsx`, `importRows.js`): `activity_data_value`/`unit` split into
`_raw` (user-entered/mapped) and `_converted` (computed) pairs. New optional
`evidence_link` and `reviewer` fields on manual entry, CSV import (as
mappable columns), and Data Review. Conversion is computed by
`convertActivityValue()` against `CONVERSION_FACTORS`, a hardcoded
`emission_source → { factor, base_unit, status }` table — every factor is a
placeholder `1.0`/`TBD`, `base_unit` equals the source's existing display
unit. One derivation point, reused by manual entry, CSV import, and Data
Review promote — not duplicated per entry path (same pattern as
`deriveHierarchy`).

CSV import's unit fallback (spec Section 9): a new `activity_data_unit_raw`
mappable column is checked against the mapped source's expected unit via
`unitMatchesSource()`. A mismatch (e.g. "gallons" against a source expecting
"litres") flags the row to Data Review with "Unrecognized unit for the
mapped emission source" instead of guessing a conversion — same fallback
pattern as an unparseable date, both live in the shared `findEntryIssues()`.
Promoting a Data Review row re-locks the unit to the selected source (same
as manual entry), which is what resolves a unit-mismatch flag on promote —
the review form's unit was never a free-typed field to begin with.

Facility Reporting Period (`FacilityForm.jsx`, `FacilityTable.jsx`, new):
its own session table, never merged into Activity Data or its export
(Hard Rules). Fields: facility, reporting year (dropdown, current year back
6), facility country (hardcoded `FACILITY_COUNTRIES` list), production
volume (fixed unit `litres (milk)`), annual revenue (fixed currency `EUR`)
— all required. No FX conversion, matching spec Section 12's explicit
out-of-scope.

Dashboard nav tab (`App.jsx`): header now has a small nav — "Data Entry"
(current, non-interactive) and "Dashboard ↗" as a real `<a href>` to a
placeholder `example.com` subdomain, `target="_blank"`. Marked with a code
comment that it must be swapped once Tool B deploys.

Two independent CSV exports: `EntryTable.jsx` → "Download Activity Data
CSV" (`purepastures-activity-data.csv`, now includes raw/converted columns
plus evidence_link/reviewer); `FacilityTable.jsx` → "Download Facility
Reporting Period CSV" (`purepastures-facility-reporting-period.csv`).

Verified end-to-end with Playwright against the local dev build (not just
`npm run build`): manual entry with raw value 150 litres → converted 150
litres at factor 1.0, evidence_link/reviewer captured; CSV import of a
3-row file — 1 clean, 1 flagged for a "gallons" vs "litres" unit mismatch,
1 flagged for an unparseable date, zero guessed conversions; Facility
Reporting Period entry added to its own table; both CSV downloads
triggered and their file contents inspected — confirmed separate files with
correct, distinct columns; page reload cleared both session tables and
Data Review back to zero. `npm run build` clean (41 modules). No console
errors during any of the above. A project `verify` skill
(`.claude/skills/verify/SKILL.md`) was written this session so the next
build skips this cold start.

## Last session
Session 3: fixed the repo layout again (`docs/product-spec.md` restored
from a second flat re-upload), then built every v4.0 addition — Activity
Data raw/converted schema split with evidence_link/reviewer, the placeholder
conversion_factor lookup and its Data Review unit-mismatch fallback, the
Facility Reporting Period form/table, the placeholder Dashboard nav tab, and
the two-way CSV export split — and verified the full flow in a real browser
via Playwright.
[Rule: 3–5 lines maximum. Replace each session — what was built, changed, or fixed.]

## Remaining work
- [ ] Deploy to Netlify — builder confirms the push-triggered build succeeded in the Netlify dashboard (Netlify MCP not active per spec Section 4)
- [ ] Walk spec Section 13 acceptance criteria 11–12 once the live URL is confirmed (criteria 1–10 verified locally this session)
- [ ] Log the D3/Supabase promotion deferral (Decision Registry Goal G-2) as its own DECISIONS.md entry — spec Section 1/14 calls for this before the *next* iteration begins, not blocking this one — **superseded, see Known issues**
- [ ] Confirm Supabase project name "purepastures" with the builder, then create it via Supabase MCP — explicitly not the v1.0 project (v5.0 revision)
- [ ] Build `activity_data` and `facility_reporting_period` tables and RLS policies via Supabase MCP, then write docs/supabase-setup.md (v5.0 revision)
- [ ] Reorder the UI: Facility Reporting Period becomes Step 1, Data Entry becomes Step 2 (v5.0 revision)
- [ ] Build Facility Reporting Period auto-detect/assign logic on Activity Data submission, matched by facility + reporting year (v5.0 revision)
- [ ] Build the blocking validation + inline redirect to the Facility Reporting Period form when no match exists (v5.0 revision)
- [ ] Update CSV import's Value Mapping step to flag rows with no matching Facility Reporting Period to Data Review, with the specific reason stated (v5.0 revision)
- [ ] Update both CSV exports to pull all persisted records ever entered, not session-scoped (v5.0 revision)
- [ ] Add the GDPR consent checkbox and confirmed data statement to the manual entry form and CSV import flow, covering the `reviewer` field (v5.0 revision)
- [ ] Local test pass: cross-session persistence (facility data entered in one session matched in a later session), the blocked-entry redirect, and the no-match CSV import flag (v5.0 revision)
- [ ] Acceptance criteria pass — verify spec Section 13 criteria 1–16 before deploy (v5.0 revision)
- [ ] Deploy v5.0 changes to Netlify — builder confirms the push-triggered build succeeded in the dashboard (v5.0 revision)
[Rule: completed items leave this list and are absorbed into Current state. This list only shrinks.]

## Build decisions
- Column Mapping's schema-field list keeps the `purchase_date` gap-fill
  from v3.0 (spec Section 8 doesn't name it explicitly, but Section 9's
  reporting-period derivation still requires a mapped date column).
- `activity_data_unit_raw` is checked directly against the source's
  expected unit (`unitMatchesSource`), not run through Value Mapping —
  Section 9 describes a pass/fail check against "the expected unit for the
  mapped source," not a value the uploader picks from a list, so it doesn't
  belong in `collectUnresolvedValues`'s categorical-field flow.
- Facility country list, production unit, and currency are new hardcoded
  lookups in `lookups.js` (`FACILITY_COUNTRIES`, `PRODUCTION_UNIT`,
  `CURRENCY`) — spec Section 5 specifies the field shapes but not concrete
  values; picked a small plausible country list and single-currency EUR
  given Section 12 explicitly excludes multi-currency FX.
- Dashboard placeholder URL uses the reserved `example.com` domain rather
  than a real-looking address, so it's unambiguous that it's a stand-in
  pending Tool B.
- `CONVERSION_FACTORS`' `base_unit` is set equal to each source's existing
  `unit` field rather than a new value — with every factor at placeholder
  1.0 there's no real base unit yet to differ from the display unit.
[Rule: one line per decision made during the build that is not in the spec — prompt structures, field formats, naming choices, library picks. Future sessions depend on these to stay consistent.]

## Known issues
- product-spec.md has now been re-uploaded flat to the repo root twice
  (sessions 2 and 3), overwriting the `docs/` structure both times. Worth
  flagging to the builder as a recurring upload habit to break, not a
  one-off.
- Spec revised to v5.0 on 2026-07-16 — CLAUDE.md regenerated by Project
  Governor. This reverses D-9's D2 deferral (see DECISIONS.md D-11) —
  the "Remaining work" item above about logging the D3 deferral as its
  own DECISIONS.md entry is now superseded by D-11 through D-15, which
  the builder has already drafted; it should be removed once integrated,
  not acted on as originally worded.
[Rule: bugs, edge cases, and deferred fixes. One line each. Remove when resolved.]

## Notes for next session
None.
[Rule: the builder writes here between sessions. Claude Code reads these aloud at session start, acts on them, then clears this section.]
