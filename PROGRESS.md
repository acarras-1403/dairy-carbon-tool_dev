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

## Remaining work
- [ ] Confirm the push-triggered Netlify build succeeds (builder checks dashboard)
- [ ] Walk spec Section 13 acceptance criteria 14–16 (deploy-dependent) once the live URL is confirmed — criteria 1–13 verified session 4 (12 via direct SQL role-switching against live RLS, not the Supabase dashboard UI)
- [ ] Decide whether to clean up the two unrelated pre-existing Supabase projects found in the org session 4 (`purepastures-ghg`, `acarras-1403's Project`) — left untouched, not part of that build (D-14 limitation)
- [ ] (v7 revision) Reduce navigation to two tabs: Emissions Dashboard (first), Activity Data Entry (second) — spec Section 8
- [ ] (v7 revision) Remove the Facility Reporting Period page and both v6.0 Records tabs entirely
- [ ] (v7 revision) Build the Emissions Dashboard data-existence check: empty state if no `activity_data` rows exist, else redirect to https://ghgdashboarddev.netlify.app/ — never render that dashboard's content locally
- [ ] (v7 revision) Build the Facility Data modal — manual trigger button plus automatic trigger on a blocked entry, pre-filled with facility+year and a warning banner
- [ ] (v7 revision) Build the tucked "past facility data entries" section inside the Facility Data modal, with CSV download
- [ ] (v7 revision) Rewire the Facility Data blocking validation (D-13, still a hard block) to open the modal instead of redirecting to a page
- [ ] (v7 revision) Add intro/description text to Activity Data Entry; position the Facility Data button and bulk import card per spec Section 8's exact order
- [ ] (v7 revision) Build the tucked "past activity data entries" section at the bottom of Activity Data Entry, with CSV download
- [ ] (v7 revision) Add Evidence link, Reviewer, the GDPR consent checkbox + data statement, and the locked unit indicator to the manual entry form
- [ ] (v7 revision) Re-sync Column Mapping's target field list to: facility, purchase_date, emission_source, activity_data_value, data_quality_rating, notes, evidence_link, reviewer
- [ ] (v7 revision) Update Value Mapping's emission-source resolution to combine fuel-type and equipment-description columns where both exist
- [ ] (v7 revision) Update Data Review's "no Facility Data match" message to point at the modal, not a page
- [ ] (v7 revision) Add the "Download template (.csv)" link under bulk import — header row plus one example row
- [ ] (v7 revision) Add the light/dark theme toggle to the top bar, wired to C-MORE v2's light/dark token sets
- [ ] (v7 revision) Confirm C-MORE brand style sheet v2 is installed at .claude/skills/c-more/ and rebuild affected components against its tokens
- [ ] (v7 revision) Local test pass: blocked-entry modal flow end to end, both tucked sections, dashboard empty state, template download, theme toggle
- [ ] (v7 revision) Acceptance criteria pass — verify every criterion in spec Section 13 (items 1–38)
- [ ] (v7 revision) Redeploy and confirm live

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

## Known issues
- **Resolved this session, after deploy:** the first live deploy showed
  "Could not load persisted data from Supabase" with zero network requests
  and no console output. Root cause: `VITE_SUPABASE_ANON_KEY`, as entered
  in the Netlify dashboard, had its `--` (double hyphen, inside the JWT
  signature) silently converted to a single dash by macOS/browser smart-
  punctuation on paste — an invalid header value that made the browser's
  `fetch()` throw synchronously ("String contains non ISO-8859-1 code
  point") before any request left the page, silently caught by the app's
  error handling. Fixed by rewriting the env var via the Netlify API
  directly (bypassing the browser text field entirely) rather than
  re-pasting. Confirmed live afterward: Facility Reporting Period submit →
  reload → still present.
- This build session's sandbox blocked outbound HTTPS to `*.supabase.co`
  and even `*.netlify.app` directly from the browser/Node (org egress
  policy, confirmed via the agent-proxy status endpoint — not a code
  defect). DB-layer testing used the Supabase MCP connection instead; live
  diagnosis of the anon-key issue above was done collaboratively with the
  builder's own browser DevTools.
- Two Supabase projects unrelated to this build already existed in the org
  before this session (`purepastures-ghg`, `acarras-1403's Project`, both
  dated 2026-07-04) — neither was touched; cleanup is a builder decision,
  not made here (D-14).
- Spec revised to v7.0 on 2026-08-05 — CLAUDE.md regenerated by Project
  Governor. DECISIONS.md is missing D-16 through D-19 (backfill owed,
  see D-20's stub entry) — not a build blocker, noted for continuity.

## Notes for next session
None.
