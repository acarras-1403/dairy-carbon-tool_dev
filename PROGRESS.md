# PROGRESS — PurePastures GHG Activity Data Entry Tool (MVP)

> Claude Code: read this file at the start of every session, before touching
> anything. Update it at every save point. Replace content — do not append.
> History lives in git.

**Session:** 5 — v7.0 build complete
**Last updated:** 2026-08-05 — by Claude Code, session 5
**Live URL:** https://calm-croquembouche-76181c.netlify.app/ — confirmed live and current: this site's `commit_ref` matches this session's merge commit (`313bb09f...`), it auto-deployed within seconds of the merge, and its env vars were already correctly pointed at the `purepastures` Supabase project (set 2026-07-16, untouched this session). See Known issues for a mid-session mix-up with an unrelated site of a similar name.

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
toggle wired to C-MORE's token pair. Mid-session, chased a red herring on
an unrelated Netlify site with a similar name before the builder pointed
to the real one — see Known issues; the actual live site needed no env
var fix and auto-deployed correctly on merge.

## Remaining work

- [ ] Do one live browser pass end-to-end against https://calm-croquembouche-76181c.netlify.app/ to confirm it visually matches the local verification pass
- [ ] Walk spec Section 13 acceptance criteria 25–38 (this iteration's new/changed items) against the live deploy — verified locally this session, not yet against production
- [ ] Optional: run a Supabase QA/advisor pass now that Tool B's tables have appeared in the shared project, to confirm this tool's RLS/policies are still exactly as documented (no accidental interaction)
- [ ] Optional cleanup: an unrelated Netlify site (`purepastures-ghg`, see Known issues) had its env vars edited this session by mistake before the real site was identified — harmless (that site isn't part of this build and wasn't otherwise touched), but worth a look if it's actually in use for something else

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

- **Corrected mid-session — read this before trusting any earlier note about
  a "misconfigured live site":** there are (at least) two Netlify sites in
  the org with similar auto-generated-looking names — `purepastures-ghg`
  (site id `7aebb2b1-88cb-4f04-9140-844c5e048381`,
  `http://purepastures-ghg.netlify.app`) and the actual live site,
  `calm-croquembouche-76181c` (site id
  `3161c912-f2be-489d-ae03-0a182579f5ad`,
  `https://calm-croquembouche-76181c.netlify.app/`, the URL in this file's
  status header). Claude Code initially found `purepastures-ghg`'s env vars
  pointed at a different, older Supabase project with a legacy dimensional
  schema (no `activity_data`/`facility_reporting_period` tables) and,
  believing that was the live site, both fixed its env vars and merged this
  session's branch to `main` to trigger a rebuild. The builder then
  clarified the real live URL is `calm-croquembouche-76181c` — **whose env
  vars were already correct all along** (set 2026-07-16, pointing at the
  right `purepastures` project) and which auto-deployed correctly on the
  merge regardless. Net effect: the merge was legitimate and wanted
  (v7.0 is now live), but the env var "fix" on `purepastures-ghg` was
  applied to a site outside this build's scope. That site was left with
  the corrected (now-accurate) env vars rather than reverted, since they
  point at the real schema and reverting to the wrong project would only
  reintroduce the original problem on that site. If `purepastures-ghg` is
  actually used for something unrelated, its env vars may need a second
  look — flagged above under Remaining work.
- The `purepastures` project (the correct one, and the one
  `calm-croquembouche-76181c` actually uses) now also contains three
  tables outside this tool's schema — `ef_table`, `expected_matches`,
  `emissions_results` (1 row) — almost certainly Tool B's own tables
  landing in the shared project for the first time. Per CLAUDE.md Hard
  Rules, left completely untouched; noted here for visibility only.
- This session's sandbox again blocked outbound HTTPS to `*.supabase.co`
  and `*.netlify.app` (org egress policy, confirmed via the agent-proxy
  status endpoint — not a code defect, same limitation noted in session
  4). See Current state's Verification note for how this session's code
  changes were verified instead; the live deploy's `commit_ref` and
  `deploy_source`/timestamp were confirmed via the Netlify API rather than
  an actual page load.
- Two Supabase projects outside this tool's canonical schema remain in the
  org (carried from session 4): `purepastures-ghg` (id
  `uioxedvoaqtijtrvzxzl`) and `acarras-1403's Project` (id
  `pcjsoczuzfbniwqxgfji`, INACTIVE). Cleanup remains a builder decision.

## Notes for next session

**Reprioritized after this file was last written at session 5's save
point:** Andrea has decided, deliberately, to merge this tool with the
Emissions Dashboard tool (Tool B) into one combined tool — see
`DECISIONS.md` D-22, which reverses D-12's earlier rejection of exactly
this. A handoff package (this tool's source as a zip + a `HANDOFF.md`
summarizing the shared schema, business rules, and brand theming a merge
needs to preserve) was sent directly to Andrea, not committed to this
repo. If a future session here picks this up: read D-22 and D-12 first,
and expect the Emissions Dashboard tab's thin redirect (built this
session specifically to avoid re-opening D-12 — see D-21) to be exactly
the piece a real merge replaces.

Still open from session 5, if not already done elsewhere: v7.0 is live at
https://calm-croquembouche-76181c.netlify.app/ — do the live
acceptance-criteria pass for items 25–38 against that URL, and note the
correct live URL in CLAUDE.md if it isn't recorded there yet (this file's
status header is the only place it was written down session 5).
