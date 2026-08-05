# PROGRESS — PurePastures GHG Activity Data Entry Tool (MVP)

> Claude Code: read this file at the start of every session, before touching
> anything. Update it at every save point. Replace content — do not append.
> History lives in git.

**Session:** 5 — v7.0 build complete
**Last updated:** 2026-08-05 — by Claude Code, session 5
**Live URL:** http://purepastures-ghg.netlify.app — **currently misconfigured, see Known issues.** Its env vars point at the wrong Supabase project; fix that first, then confirm the push-triggered rebuild picked up this session's code.

## Current state

Tool matches product-spec.md v7.0. Navigation is down to two top-level tabs
— **Emissions Dashboard** (first) and **Activity Data Entry** (second) —
replacing v6.0's four-tab layout. Facility Reporting Period ("Facility
Data" in the UI; table/columns unchanged) is no longer a page or step: it's
`FacilityModal.jsx`, opened via a button in Activity Data Entry or
automatically by D-13's blocking validation (still a hard block, only the
redirect target changed — modal, not a page). Both v6.0 Records tabs are
gone; past entries live in collapsed-by-default `Collapsible.jsx` sections
— one at the bottom of Activity Data Entry, one inside the Facility Data
modal.

New components this session: `EmissionsDashboard.jsx` (existence check
against already-fetched `entries` — no data → local empty state with a
tab-switch button; data exists → `window.location.href` to the live Tool B
URL, `https://ghgdashboarddev.netlify.app/`, never rendering its content
locally, per D-12), `ActivityDataEntry.jsx` (assembles intro copy, the
Facility Data button row, bulk import, Data Review, manual entry, and the
tucked past-entries section in the spec's exact order), `FacilityModal.jsx`,
`Collapsible.jsx`, `ThemeToggle.jsx`.

Theming: `src/lib/theme.js` persists light/dark to `localStorage` (falls
back to OS preference) and toggles a `dark` class on `<html>`. Every brand
token (`offwhite`/`surface`/`ink`/`slate`/`line`/`accent`) is a Tailwind
color reading a CSS custom property (`src/index.css`), so the same class
names swap per theme — including the accent **role** swap (Deep Blue
`#141A32` in light, Lime `#C0FA00` in dark) — without `dark:` duplication
everywhere. `--accent` is stored as an RGB triplet (`--accent-rgb`) rather
than a hex string specifically so Tailwind's opacity modifiers
(`bg-accent/5`, `ring-accent/30`) resolve — a plain hex-in-a-variable broke
`@apply` in `index.css` (`tailwind.config.js` uses
`rgb(var(--accent-rgb) / <alpha-value>)`).

Manual entry form (`EntryForm.jsx`) already had Evidence link, Reviewer,
the locked unit indicator, and the GDPR checkbox from session 4 — v7.0 only
changed its blocked-submit path to open the modal (`onBlocked`) instead of
scrolling to a since-removed Step 1 section.

CSV import (`importRows.js`): `MAPPABLE_FIELDS` re-synced to CLAUDE.md's
exact 7 target keys (facility, source, purchase_date, activity value, data
quality, evidence link, reviewer — notes still folds in automatically) by
**removing** the old `activity_data_unit_raw` mappable field, not just
relabeling it — unit is now always derived from the resolved
`emission_source` for CSV rows too, matching the manual-entry lock exactly.
`lookups.js` gained `resolveSourceFromFuelAndEquipment()`: a keyword
heuristic (fuel word + mobile-equipment word) used as an automatic fallback
when no single column maps cleanly to Emission source but the CSV has
separate fuel-type and equipment/vehicle-description columns (auto-detected
by header regex) — satisfies the Value Mapping combine business rule
without adding a third mappable target field. `DataReview.jsx`'s no-match
message now names the facility/year and points at "the Facility Data
button in Activity Data Entry," and gained an "Add Facility Data" action
that opens the modal directly from a flagged row.

`lib/csv.js` gained `templateCsv()` — static header row (exact match:
`facility,purchase_date,emission_source,activity_data_value,data_quality_rating,notes,evidence_link,reviewer`)
plus one example row, wired to a "Download template (.csv)" link in the
bulk import card.

**Verification this session:** the sandbox again blocked outbound HTTPS to
`*.supabase.co` (org egress policy, confirmed via the agent-proxy status
endpoint — same limitation as session 4). No schema or RLS changed this
session, so no live DB round-trip was needed to confirm persistence
mechanics (session 4 already verified insert/select/RLS directly).
Everything that *did* change was verified two ways: (1) unit tests of the
new pure logic — `resolveSourceFromFuelAndEquipment` keyword matching,
`buildEntryFromCsvRow`/`findEntryIssues` with the unit field removed,
`templateCsv()`'s exact header — all passing; (2) a full headless-browser
pass (`npm run build` clean, `npm run dev`) driving: two-tab nav, theme
toggle (confirmed `dark` class + token swap in both screenshots), a blocked
manual submit opening the modal with the exact spec banner text ("No
facility data on file for North Dairy Plant in 2026. Add it below to
continue."), manual modal open (banner correctly absent), both tucked
sections expanding, and the template CSV downloading with the exact header
row. The Dashboard's blocked Supabase fetch does eventually resolve in this
sandbox (~30s, after the browser's own connection retries exhaust) into
the correct state — loadError banner + empty state — confirming the error
path renders correctly; the delay itself is a sandbox artifact, not app
latency.

## Last session

Session 5: rebuilt navigation to two tabs; replaced the Facility Reporting
Period page and both v6.0 Records tabs with a Facility Data modal and two
tucked Collapsible sections; wired D-13's hard block to open the modal
pre-filled instead of redirecting; added the Emissions Dashboard
existence-check/redirect; added the CSV template download; re-synced
Column Mapping's target fields (removed the unit field) and added the
fuel+equipment combine heuristic for Value Mapping; updated Data Review's
no-match message to reference the modal; added the light/dark theme
toggle wired to C-MORE's token pair. **Discovered mid-session:** the live
Netlify site's env vars point at the wrong Supabase project — see Known
issues, this is the priority for next session before anything else.

## Remaining work

- [ ] **Fix the live Netlify site's env vars** (flagged to builder this session, not changed automatically — see Known issues)
- [ ] Once fixed, confirm the push-triggered rebuild deploys this session's code and do one live browser pass end-to-end
- [ ] Walk spec Section 13 acceptance criteria 25–38 (this iteration's new/changed items) against the live deploy — verified locally this session, not yet against production
- [ ] Optional: run a Supabase QA/advisor pass now that Tool B's tables have appeared in the shared project, to confirm this tool's RLS/policies are still exactly as documented (no accidental interaction)

## Build decisions

- CSS custom properties for every brand token, not `dark:` variant
  duplication — one set of class names (`bg-accent`, `text-ink`, …) swaps
  automatically off the `dark` class on `<html>`. `--accent` specifically
  stored as an RGB triplet so Tailwind's `/<alpha-value>` opacity modifiers
  work against it (a plain hex CSS variable fails inside `@apply`).
- `activity_data_unit_raw` removed from CSV `MAPPABLE_FIELDS` entirely
  (not relabeled) — unit is always derived from the resolved
  `emission_source`, for CSV rows exactly like manual entry; the old
  unit-mismatch flagging path in `findEntryIssues`/`unitMatchesSource` was
  deleted as dead code rather than left unreachable.
- Fuel-type + equipment/vehicle-description combine implemented as an
  automatic fallback (header-name regex detection: `/fuel/i`,
  `/(equipment|vehicle)/i`), not a third mappable Column Mapping field —
  keeps the target field list at CLAUDE.md's exact 8 items while still
  satisfying the combine business rule.
- Emissions Dashboard's existence check reads already-fetched client state
  (`entries.length`) rather than issuing a fresh query per tab view —
  matches spec Section 15's open-question assumption ("on load only, not
  live").
- Tab content unmounts on switch (plain conditional render, no
  tab-persistence layer) — not a stated requirement; kept simple over
  preserving in-progress CSV-wizard/form state across a tab switch.

## Known issues

- **New, this session — priority for next session:** the live Netlify site
  (`purepastures-ghg`, site id `7aebb2b1-88cb-4f04-9140-844c5e048381`,
  `http://purepastures-ghg.netlify.app`) has `VITE_SUPABASE_URL`/
  `VITE_SUPABASE_ANON_KEY` set to a **different, older Supabase project** —
  also confusingly named `purepastures-ghg` (id `uioxedvoaqtijtrvzxzl`,
  created 2026-07-04) — instead of the `purepastures` project (id
  `ztkgbowwrlszbbfuhkid`) that `docs/supabase-setup.md` documents as this
  build's actual schema. Confirmed via `list_tables` on both: the
  mis-wired project has a completely different legacy dimensional schema
  (`dim_scope`, `dim_category`, `dim_facility`, …) with **no**
  `activity_data` or `facility_reporting_period` tables at all — so the
  live site cannot load or save data as currently wired, regardless of any
  code in this repo. This was not touched automatically (a production env
  var change on a shared site) — flagged to the builder for confirmation.
  Fix: in the Netlify dashboard (or via Netlify MCP), update both env vars
  on the `purepastures-ghg` site to `https://ztkgbowwrlszbbfuhkid.supabase.co`
  and the `purepastures` project's anon/publishable key.
- The `purepastures` project (the correct one) now also contains three
  tables outside this tool's schema — `ef_table`, `expected_matches`,
  `emissions_results` (1 row) — almost certainly Tool B's own tables
  landing in the shared project for the first time. Per CLAUDE.md Hard
  Rules, left completely untouched; noted here for visibility only.
- This session's sandbox again blocked outbound HTTPS to `*.supabase.co`
  (org egress policy, confirmed via the agent-proxy status endpoint — not
  a code defect, same limitation noted in session 4). See Current state's
  Verification note for how this session's changes were verified instead.
- Two Supabase projects outside this tool's canonical schema remain in the
  org (carried from session 4): `purepastures-ghg` (id
  `uioxedvoaqtijtrvzxzl` — now confirmed as what the live site is
  mis-wired to, see above) and `acarras-1403's Project` (id
  `pcjsoczuzfbniwqxgfji`, INACTIVE). Cleanup remains a builder decision.

## Notes for next session

Fix the Netlify env var mismatch above first (it blocks everything else —
the live site can't function until it points at the right Supabase
project), then do the live acceptance-criteria pass for items 25–38.
