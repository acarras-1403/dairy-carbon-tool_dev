# PROGRESS — Company's Carbon Footprint

> Claude Code: read this file at the start of every session, before touching
> anything. Update it at every save point. Replace content — do not append.
> History lives in git.

**Session:** 6 — Tool A/Tool B merge (Phases 1–4) + sidebar/Home redesign (D-25), both complete
**Last updated:** 2026-11-21 — by Claude Code, session 6
**Live URL:** https://calm-croquembouche-76181c.netlify.app/ — not yet redeployed with this session's work; still serving the pre-merge v7.0 build as of this save point. See Remaining work.

## Current state

This tool is the merged home for what were two separate tools/repos —
**Activity Data Entry** (this repo, "Tool A") and **Emissions Dashboard**
("Tool B", `carbon_dashboard_toolb_dev`), merged per `DECISIONS.md` **D-22**
— now renamed **"Company's Carbon Footprint"** in user-facing text (repo
name, Supabase project, Netlify URL, `package.json` unchanged) and
rebuilt around a sidebar information architecture instead of the merge's
original two top tabs (**D-25**). No schema or RLS changed this session.

**Merge, Phases 1–4** (first half of this session — unchanged since last
save point): stack upgrade (React 19/Vite 8/Tailwind v4), Granate/Sage
brand replacement, porting Tool B's calculation engine/dashboard
components into this repo, docs reconciliation. See git history for the
phase-by-phase detail (each was its own commit on
`claude/tool-build-njvj7x`).

**Redesign (D-25)** — four-destination sidebar nav replaces the two top
tabs entirely:

- **Home** (`src/components/Home.jsx`, new) — default landing page. An
  app-wide completion tracker ("X of 5 complete": Reporting Unit on file
  for the current year, Scope 1/2/3 activity data entered, Results
  calculated), each item linking to the section that resolves it; a Scope
  1/2/3 pie chart (`ScopePieChart.jsx`, new — pure CSS conic-gradient, a
  different chart type from Results' stacked bar by design) summing
  `result_tco2e` per scope via the existing `fetchDashboardData()`;
  missing-activity-data callouts per scope; four KPI tiles (total tCO2e,
  activity data entries, facilities on file this year, pending
  validation).
- **Reporting Unit** (`src/components/ReportingUnit.jsx`, new) — Facility
  Data promoted from a modal to its own full page. Reuses `FacilityForm`/
  `FacilityTable`/`Collapsible` unchanged. `FacilityModal.jsx` deleted. A
  blocked Activity Data submit now navigates here (`App.jsx`'s
  `activeSection` → `'facility'`, carrying the same prefill/blocked state
  the modal used to take) instead of opening a dialog.
- **Activity Data Entry** — structurally the same (`CsvImport`,
  `DataReview`, `EntryForm`, tucked `EntryTable`), plus: a KPI tile row
  (total entries, entries this month, needs-review count, last entry
  logged — reuses the same `StatTile` component as Home); the old
  Facility-Data button-row card dropped in favor of one small inline link
  in the intro paragraph; `EntryForm.jsx` gained its own **per-form**
  progress indicator (5 sections — facility/period, emission source,
  activity value & quality, supporting info, consent — each with a
  one-line "why this matters" note and a ✓/missing marker, "X of 5
  sections ready"). This is in addition to Home's app-wide tracker, not
  instead of it (confirmed explicitly — see DECISIONS.md D-25). Still a
  single-page form.
- **Results** (renamed from "Emissions Dashboard") — `Dashboard.jsx` and
  `EmissionsDashboard.jsx`'s existence-check wrapper are unchanged
  internally; only UI copy and the sidebar label changed. Still one
  combined section (scope diagram + inventory table + click-to-pin audit
  trail) — not split into separate "Inventory Results" and "Audit Trail"
  destinations.

**Dark mode (D-25):** replaced the near-black palette from Phase 2/D-24
with a maroon-tinted one — `--bg: #1E1013`, `--surface: #2B171B`,
`--surface-alt: #3A1F24`, `--border: #4D2A30`, `--surface-strong:
#150A0C`. `ink`/`slate`/`accent`/`success`/`warning`/`danger` values
unchanged, re-verified against the new bg with the brand doc's own
contrast script (all comfortably ≥7:1). Light mode untouched. New
`--scope-1/2/3` tokens added for Home's pie chart (slots 0/2/4 of the
existing categorical scale — kept separate from `.cat-slot-0..4` so
retuning categories later can't silently change the pie chart).

**Shared new components:** `Sidebar.jsx` (responsive lateral nav, 4
destinations), `StatTile.jsx` (icon + number + label KPI card, used by
both Home and Activity Data Entry), `icons.jsx` (small inline line-art
SVGs — building, document, leaf, check, warning, clock, chart).

`App.jsx` rewritten: `activeTab` (`'dashboard'|'entry'`) → `activeSection`
(`'home'|'facility'|'entry'|'results'`); the `facilityModal` open/close
state replaced with a simpler `facilityPrefill` ({blocked, prefill}) since
Reporting Unit is always-present now, not a dismissable overlay; header
keeps just the brand mark/wordmark + theme toggle, sidebar takes the nav.
`onOpenFacilityModal` renamed to `onGoToReportingUnit` across
`ActivityDataEntry.jsx`/`DataReview.jsx`/`App.jsx` for accuracy now that
there's no modal.

**Verification:** `npm run build` clean after the redesign. Full
Playwright pass (route interception standing in for the sandbox's blocked
Supabase network, canned `activity_data`/`facility_reporting_period`/
`ef_table`/`emissions_results` rows): all four sidebar destinations
render correctly; Home's completion tracker, KPI tiles and pie chart
reflect the mocked data correctly in both themes; the blocked-submit flow
was driven end-to-end (filled the manual form for a facility/year with no
Reporting Unit record, submitted, confirmed it navigated to Reporting
Unit with the correct pre-fill and warning banner); Activity Data Entry's
new KPI row and per-form progress indicator (5/5 ready after filling the
form) confirmed; Results page confirmed unchanged behavior in both
themes; no console/page errors in any pass. Screenshots not committed
(verification artifacts only).

## Last session

Session 6 (this save point): after the four-phase merge (see git history),
the builder asked for a broader redesign in the same session — product
rename, sidebar IA replacing the two top tabs, Facility Data promoted to
a full page, a new Home page (completion tracker + Scope 1/2/3 pie chart +
KPIs), dual progress indicators (app-wide on Home, per-form on Activity
Data Entry), and a maroon (not near-black) dark mode. Clarified via two
rounds of `AskUserQuestion` (confirmed: new name "Company's Carbon
Footprint"; Facility Data → full page with navigate-on-block; Results as
one combined section, not two; both progress indicators, not either/or;
"Reporting Unit" without "Information"). Implemented, verified, logged as
DECISIONS.md D-25. Not yet merged to `main` or redeployed.

## Remaining work

- [ ] Merge `claude/tool-build-njvj7x` to `main` and confirm auto-deploy to https://calm-croquembouche-76181c.netlify.app/ (or wherever the builder wants it to live — confirm this hasn't changed)
- [ ] Live acceptance pass against real Supabase data once deployed — all verification this session (merge + redesign) used mocked network responses (sandbox blocks `*.supabase.co`), not a live round-trip
- [ ] Decide `--color-serious` (`#ec835a`, the forecast panel's suppressed-months banner) — kept as-is from Tool B pending builder sign-off
- [ ] Confirm the derived `success`/`warning`/`danger` token values (DECISIONS.md D-24) visually, now that they're live in the merged + redesigned UI — contrast-checked but not yet explicitly approved by the builder
- [ ] Decide the fate of Tool B's now-redundant standalone repo (`carbon_dashboard_toolb_dev`) and its own Netlify site — deferred until the merge is confirmed working
- [ ] Bundle-size warning from `npm run build` (one chunk >500kB, driven by jsPDF/html2canvas) — not addressed, flagged for a future pass (code-splitting the PDF export path)
- [ ] Carried from session 5: walk spec Section 13 acceptance criteria 25–38 against the live deploy once it's redeployed
- [ ] CLAUDE.md's Business Rules section was rewritten for the new sidebar IA this session — docs/product-spec.md (v7.0, Activity Data Entry half) was NOT updated to match, since it's the original Tool A spec and this IA change came from direct builder request this session, not a spec revision; flag this gap if a future session needs the full spec to reflect the current nav

## Build decisions

- Merge home is this repo (`dairy-carbon-tool_dev`), not Tool B's — confirmed by the builder (see D-22/D-23 for the merge-specific reasoning).
- Product renamed to "Company's Carbon Footprint" in user-facing text and CLAUDE.md's Identity/H1 only — repo name, Supabase project, Netlify URL, `package.json` `name`, and historical PROGRESS.md/DECISIONS.md log text all left untouched. "PurePastures Dairy Cooperative" stays as the client name in descriptive copy (Results' "About this dashboard," tooltips.js) — only the tool's own product name changed.
- Sidebar nav (persistent, 4 destinations) replaces the two top tabs entirely — confirmed by the builder, inspired by their LCA-Studio build.
- Facility Data is a full page now, not a modal — a blocked submit navigates instead of opening a dialog. Confirmed explicitly (not assumed) via `AskUserQuestion`.
- "Reporting Unit" (not "Reporting Unit Information") — builder's direct correction mid-session.
- Results stays one sidebar section covering both the inventory/diagram and the audit trail — confirmed explicitly, not split into two.
- Both an app-wide (Home) and a per-form (Activity Data Entry) progress indicator exist — the builder's first approval message was actually a correction, not pure sign-off: "also include this in the Per form too." Logged so a future session doesn't collapse these back into one.
- Dark mode is maroon-tinted (`#1E1013` family), not near-black — explicit, repeated builder instruction ("don't use black... use like a dark red"). Light mode untouched; `ink`/`slate`/`accent`/status tokens unchanged and re-verified for contrast against the new bg.
- Scope 1/2/3 pie-chart colors (`--scope-1/2/3`) are their own tokens, not reused from `.cat-slot-0..4` directly — deliberate, so future category-palette retuning can't silently change Home's chart.
- `onOpenFacilityModal` renamed to `onGoToReportingUnit` throughout — the modal concept no longer exists, so the old name would have been misleading.
- `StatTile`/`icons.jsx` are shared, not duplicated per page — Home and Activity Data Entry both use the same KPI tile component and icon set.

## Known issues

- Not yet deployed — `main` and the live site still reflect the pre-merge, pre-redesign v7.0 build. This save point is on `claude/tool-build-njvj7x` only.
- The `success`/`warning`/`danger` palette is a confident proposal, not a builder-confirmed addition to the brand system (carried from D-24, unaffected by this session's redesign).
- Carried from session 5, still true: this session's sandbox again blocked outbound HTTPS to `*.supabase.co`/`*.netlify.app` (org egress policy) — all verification used mocked network responses instead of a live round-trip.
- Carried from session 5: two Supabase projects outside this tool's canonical schema remain in the org (`purepastures-ghg`, id `uioxedvoaqtijtrvzxzl`; `acarras-1403's Project`, id `pcjsoczuzfbniwqxgfji`, INACTIVE). Cleanup remains a builder decision.
- Home's "Scope N activity data entered" checklist items read Scope off `src/data/lookups.js`'s own category→scope hierarchy (Tool A's entry-time classification), while Results' scope totals read `scope` off the matched `ef_table` row (Tool B's classification, via `emissions_results`). These are two different scope-assignment paths that happen to agree for the current fixed `SOURCES`/`ef_table` data, but aren't structurally guaranteed to — a future session changing either lookup table should double check they still line up.

## Notes for next session

Merge `claude/tool-build-njvj7x` to `main` once the builder confirms, and
redeploy. Then do a live pass: confirm Home's completion tracker and pie
chart render correctly against real data (not mocked), confirm the
Reporting Unit blocked-submit flow end-to-end live, confirm the derived
status-color palette reads correctly in practice, and revisit the
deferred Tool B repo/site-retirement decision.
