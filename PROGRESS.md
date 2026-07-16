# PROGRESS — PurePastures GHG Activity Data Entry Tool (MVP)

> Claude Code: read this file at the start of every session, before touching
> anything. Update it at every save point. Replace content — do not append.
> History lives in git.

**Session:** 4 — v5.0 build complete
**Last updated:** 2026-07-16 — by Claude Code, session 4
**Live URL:** pending — Netlify's native integration deploys on push to `main`;
builder confirms in the Netlify dashboard (no MCP visibility, see spec Section 4).

## Current state
Tool matches product-spec.md v5.0 (Tier 2, D3+A1 — persisted, no login).
Promoted both tables from session-only (D2) to Supabase (D3), reversing
D-9's earlier deferral (D-11).

A brand-new Supabase project `purepastures` (id `ztkgbowwrlszbbfuhkid`,
region eu-central-1/Frankfurt, Free plan) was created via Supabase MCP —
explicitly not reusing either pre-existing project already in the org
(`purepastures-ghg`, `acarras-1403's Project`, both dated 2026-07-04, one
almost certainly the prohibited v1.0 project; see Known issues). Schema
(`activity_data`, `facility_reporting_period`) and RLS (anon read+insert
only, no update/delete) built via `apply_migration`; confirmed correct with
the security advisor and by executing SQL as the `anon` role directly
(select/insert succeed, update/delete silently affect 0 rows). Full detail
in `docs/supabase-setup.md` (new this session — schema source of truth).

`product-spec.md` had drifted back to the repo root a third time (same
failure mode as sessions 2 and 3) — moved back to `docs/product-spec.md`.

App rebuilt around persistence: `src/lib/supabaseClient.js` (client),
`src/lib/supabaseData.js` (fetch/insert for both tables), `src/lib/
facilityMatch.js` (single derivation point for the Facility Reporting
Period auto-detect check, same pattern as `deriveHierarchy`). `App.jsx`
fetches both tables on mount, reordered to Facility Reporting Period
(Step 1) above Data Entry (Step 2), and threads a `frpPrefill` state from a
blocked Activity Data submission down to `FacilityForm`.

`EntryForm.jsx`: after computing the raw→converted conversion as before,
checks for a matching Facility Reporting Period (facility + year from
`reporting_period`). No match blocks submission, calls back to `App.jsx` to
pre-fill Step 1 and scroll it into view (verified: scrollY moves from the
Step 2 form to the Step 1 section). Match found inserts directly into
Supabase. Added the GDPR checkbox + exact data statement text (spec Section
7) — blocks submit only when Reviewer is filled in and the box is
unchecked (verified both the blocked and pass-through paths).

`FacilityForm.jsx`: accepts the `frpPrefill` values, inserts into Supabase,
surfaces a friendly message on the new `UNIQUE(facility, reporting_year)`
constraint violation (Postgres `23505`) rather than a raw DB error.

CSV import (`importRows.js`, `CsvImport.jsx`, `DataReview.jsx`):
`findEntryIssues` gained the same Facility Reporting Period check, flagging
unmatched rows to Data Review with the spec's exact wording ("No Facility
Reporting Period on file for this facility and year.") — verified
alongside the existing unit-mismatch and unparseable-date flags in one
three-row test file (one flagged for FRP only, one for both unit mismatch
and FRP, one for date only — confirms the FRP check doesn't double-fire
when the row is already unusable for other reasons). Clean rows now bulk-
insert to Supabase; Data Review promote inserts a single row on success.
CsvImport also gained a GDPR notice + checkbox on the Column Mapping step,
shown only once the Reviewer column is mapped, gating both "Continue" and
"Finish import" (verified).

`EntryTable.jsx`/`FacilityTable.jsx`: dropped the "Remove" button entirely
— there is no update/delete RLS grant anywhere in this build, so a
client-only remove would misrepresent what's actually persisted. Both now
read "all records" and pull from state fetched from Supabase; CSV exports
(spec Section 3/Business Rules) now cover everything ever persisted, with
Activity Data excluding Data Review rows automatically (they were never
inserted to begin with).

`toActivityDataRow`/`toFacilityReportingPeriodRow`/`enrichActivityRow`/
`enrichFacilityRow` (new, `lookups.js`) are the single conversion points
between the DB's minimal official columns and the richer in-memory shape
the UI displays — category/subcategory/scope and the fixed production
unit/currency are never stored, only re-derived at read time.

**Verification note:** this build session's sandbox blocked direct HTTPS
egress to `*.supabase.co` from the browser/Node (organization egress
policy — confirmed via the agent-proxy status endpoint, not a bug). Client-
side logic (all the gating/blocking above, which runs before any network
call) was verified in a real headless-browser pass. Persistence itself —
insert, RLS enforcement, the unique constraint — was verified directly
against the live database via the Supabase MCP connection (which isn't
subject to the same sandbox restriction) rather than through an actual
browser round-trip. `npm run build` is clean. **Recommend one live
browser pass against the deployed Netlify URL** to confirm the full
insert → reload → still-there loop end-to-end once env vars are set.

## Last session
Session 4: promoted both tables to Supabase (new `purepastures` project,
schema + RLS via MCP, `docs/supabase-setup.md` written), reordered the UI
to Facility Reporting Period (Step 1) / Data Entry (Step 2), built the
auto-detect/blocking-validation + inline redirect linking Activity Data to
Facility Reporting Period (manual entry, CSV import, and Data Review
promote all share one check), widened both CSV exports to all persisted
records, and added the GDPR consent framework for the `reviewer` field on
both entry paths.
[Rule: 3–5 lines maximum. Replace each session — what was built, changed, or fixed.]

## Remaining work
- [ ] Add `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` in the Netlify dashboard (Netlify MCP not active, spec Section 4) — values are in `.env.example`'s companion `.env.local` (gitignored, not committed)
- [ ] Confirm the push-triggered Netlify build succeeds (builder checks dashboard)
- [ ] One live browser pass against the deployed URL: submit a Facility Reporting Period entry, reload, confirm it's still there; submit a matching Activity Data entry; confirm both CSV exports download all persisted records
- [ ] Walk spec Section 13 acceptance criteria 14–16 (deploy-dependent) once the live URL is confirmed — criteria 1–13 verified this session (12 via direct SQL role-switching against live RLS, not the Supabase dashboard UI)
- [ ] Decide whether to clean up the two unrelated pre-existing Supabase projects found in the org this session (`purepastures-ghg`, `acarras-1403's Project`) — left untouched, not part of this build (D-14 limitation)
[Rule: completed items leave this list and are absorbed into Current state. This list only shrinks.]

## Build decisions
- `category`/`subcategory`/`scope` and Facility Reporting Period's
  `production_unit`/`currency` are not persisted columns — CLAUDE.md's
  authoritative schema lists neither, so they stay purely client-derived
  from `emission_source`/`facility` (via the existing `deriveHierarchy` and
  the fixed `PRODUCTION_UNIT`/`CURRENCY` constants) at read time, avoiding
  schema drift from the documented source of truth.
- Added a database-level `UNIQUE(facility, reporting_year)` constraint on
  `facility_reporting_period` — spec Section 5 names this as the table's
  "key fields ... unique together"; enforcing it in Postgres (not just
  app logic) closes the same class of gap D-2/D-13 already flagged for
  other application-logic-only validations in this project's history.
- Dropped the "Remove" button from both `EntryTable` and `FacilityTable` —
  neither table's RLS policy grants update or delete, so a client-only
  remove (leaving the row in Supabase) would visually lie about what's
  actually persisted. Not called for explicitly in spec Section 8, but
  follows directly from the Hard Rule already in place.
- New Supabase project created fresh (`purepastures`, eu-central-1) rather
  than reusing either pre-existing project already present in the org —
  confirmed with the builder this session given neither existing project
  was named `purepastures` and one is likely the prohibited v1.0 project.
- GDPR consent checkbox blocks submission only when `reviewer` actually has
  a value (manual form) or the Reviewer column is actually mapped (CSV
  import) — consent is moot, and the checkbox non-blocking, when no name
  is being collected at all.
[Rule: one line per decision made during the build that is not in the spec — prompt structures, field formats, naming choices, library picks. Future sessions depend on these to stay consistent.]

## Known issues
- This build session's sandbox blocked outbound HTTPS to `*.supabase.co`
  directly from the browser/Node (org egress policy, confirmed via the
  agent-proxy status endpoint — not a code defect). Full live-browser
  persistence testing (the actual insert → reload → still-there loop
  through the deployed app) has not been done yet — only DB-layer
  verification via the Supabase MCP connection and browser verification of
  the pre-network client-side logic. See "Remaining work."
- Two Supabase projects unrelated to this build already existed in the org
  before this session (`purepastures-ghg`, `acarras-1403's Project`, both
  dated 2026-07-04) — neither was touched; cleanup is a builder decision,
  not made here (D-14).
[Rule: bugs, edge cases, and deferred fixes. One line each. Remove when resolved.]

## Notes for next session
None.
[Rule: the builder writes here between sessions. Claude Code reads these aloud at session start, acts on them, then clears this section.]
