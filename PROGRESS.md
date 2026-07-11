# PROGRESS — PurePastures GHG Activity Data Entry Tool (MVP)

> Claude Code: read this file at the start of every session, before touching
> anything. Update it at every save point. Replace content — do not append.
> History lives in git.

**Session:** 2 — v3.0 CSV import build complete
**Last updated:** 2026-07-11 — by Claude Code, session 2
**Live URL:** pending — Netlify's native integration deploys on push to `main`;
builder confirms in the Netlify dashboard (no MCP visibility, see spec Section 4).

## Current state
Tool matches product-spec.md v3.0 (Tier 1, D2+A1 — session-only, no login,
no backend). `docs/` re-created and `product-spec.md` moved back in (it had
been re-uploaded flat to the repo root, bypassing the earlier structure).
CLAUDE.md was also out of sync at session start — it still governed the old
Tier 3 (Supabase/auth) identity from v1.1 even though the spec had moved to
v3.0 Tier 1. Confirmed with the builder this was a bad upload; the corrected
CLAUDE.md (matching v3.0) was already on `main` by the time work resumed.

Manual entry form (`EntryForm.jsx`): Scope selector removed. Category shows
the full unrestricted list; Subcategory and Source still cascade from it.
Scope is derived the instant a source is picked, via the single derivation
point `deriveHierarchy()` in `src/data/lookups.js`, and shown read-only next
to the source select — never an input.

CSV bulk import (`CsvImport.jsx`, `src/lib/importRows.js`, `parseCsv` in
`src/lib/csv.js`): upload → Column Mapping (assign each header to facility /
source / purchase date / activity value / data quality, or fold into Notes)
→ Value Mapping (each distinct unmatched raw value shown once, applied to
every row sharing it) → rows are split into clean (straight into the session
table) and flagged (Data Review). Reporting period is derived per row by
parsing the mapped date column (`parseFlexibleDate` in `src/lib/periods.js`,
handles DD/MM/YYYY, YYYY-MM-DD, DD-MM-YYYY in the same file) and truncating
to month. Unmapped columns fold into Notes as `Header: value` pairs.

Data Review (`DataReview.jsx`): shows only flagged rows, each with the same
fields as the manual form (facility/category/subcategory/source cascade,
scope re-derived live from source), pre-filled from the failed import row.
Promote re-validates with the same `findEntryIssues()` check used to flag
rows during import — one shared definition of "complete," not duplicated —
and only moves the row to the session table if it now passes. Discard drops
it. Both actions render the section away when no flagged rows remain.

Verified end-to-end with Playwright against the local dev build (browser
automation, not just `npm run build`): manual entry with derived scope; CSV
upload of a 5-row file with mixed date formats and two unmatched values
(a facility and a source) → 3 rows landed clean, 2 flagged (unparseable date,
blank activity value); discarded one flagged row, fixed and promoted the
other; Download CSV produced a file with only the 3 accepted-at-import rows
(headers, values, derived scope/period all correct — excludes anything still
in Data Review, per spec); page reload cleared all state back to zero
entries, confirming no persistence anywhere. `npm run build` also clean (39
modules).
[Rule: this section describes what exists and works right now — never what is planned. Completed checklist items get absorbed here in compressed form.]

## Last session
Session 2: fixed repo layout (`docs/product-spec.md` restored from a flat
re-upload), confirmed the corrected v3.0 CLAUDE.md was in place, then built
the full CSV import path (Column Mapping → Value Mapping → Data Review),
removed the Scope selector from manual entry with scope now derived from
source, and verified the whole flow in a real browser via Playwright,
including CSV export and refresh-clears-state.
[Rule: 3–5 lines maximum. Replace each session — what was built, changed, or fixed.]

## Remaining work
- [ ] Deploy to Netlify — builder confirms the push-triggered build succeeded in the Netlify dashboard (Netlify MCP not active per spec Section 4)
- [ ] Walk spec Section 13 acceptance criteria 11–12 once the live URL is confirmed (criteria 1–10 verified locally this session)
[Rule: completed items leave this list and are absorbed into Current state. This list only shrinks.]

## Build decisions
- Column Mapping's schema-field list adds `purchase_date` alongside the
  facility/source/activity_data_value/data_quality_rating fields spec
  Section 8 names explicitly — Section 9's reporting-period derivation
  requires a mapped date column, so this was a necessary gap-fill, not a
  spec deviation.
- Value Mapping's "already matches exactly" check (spec Section 8) is
  case-insensitive and trims whitespace, not byte-for-byte — this is more
  forgiving of real-world CSV data (e.g. `"Diesel (stationary)"` vs
  `"diesel (stationary)"`) while still only skipping genuine matches.
- Data Review's required-field validation (`findEntryIssues` in
  `src/lib/importRows.js`) is the single source of truth for "is this entry
  complete," reused both to decide which imported rows get flagged and to
  gate the Promote action — avoids two divergent definitions of valid.
- Removed the old Tier 3 "bulk upload scoped to fuel/combustion and
  electricity only" business rule from the build — that rule existed only
  in the stale v1.1 CLAUDE.md and has no counterpart in the confirmed v3.0
  spec, which places no category restriction on CSV import.
- CSV parsing and writing stay dependency-free (`src/lib/csv.js`), matching
  spec Section 11 (no external services).
[Rule: one line per decision made during the build that is not in the spec — prompt structures, field formats, naming choices, library picks. Future sessions depend on these to stay consistent.]

## Known issues
None.
[Rule: bugs, edge cases, and deferred fixes. One line each. Remove when resolved.]

## Notes for next session
None.
[Rule: the builder writes here between sessions. Claude Code reads these aloud at session start, acts on them, then clears this section.]
