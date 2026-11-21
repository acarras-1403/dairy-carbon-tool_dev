# Company's Carbon Footprint

## Identity
Logs GHG activity data and annual facility data for PurePastures Dairy Cooperative facilities, matches it against an emission factor database, calculates emissions with a confidence score, and displays a filterable Scope 1/2/3 dashboard with CSV/PDF export — one tool, anyone with the link can use it. Renamed from "PurePastures GHG Tool" to "Company's Carbon Footprint" this session (user-facing text and this file only — the repo name, Supabase project, and Netlify URL are unchanged).
Tier: 2 — data persists to Supabase, no login required (D3+A1)
Spec version governed: v7.0 (Activity Data Entry half) / v1.5 (Emissions Dashboard half) — the product-spec.md versions these rules were last derived from, before the two tools' codebases were merged into this one repo.
**Formerly two separate tools, two separate repos** — `dairy-carbon-tool_dev` (Activity Data Entry, "Tool A") and `carbon_dashboard_toolb_dev` (Emissions Dashboard, "Tool B"), sharing one Supabase project. Merged into this single codebase per DECISIONS.md **D-22** (a deliberate reversal of **D-12**, which had originally rejected merging them). Tool A's repo is the merged home; Tool B's repo still exists but is no longer the deploy target — see PROGRESS.md for status.

## Session Protocol
At the start of every session:
1. Pull the latest from main before reading anything else.
2. Check docs/product-spec.md: if its version is newer than the "Spec version governed" line in this file, STOP. Tell the builder: "The spec has changed since this CLAUDE.md was written — re-run the Project Governor on the revised spec before building, or these rules may contradict it." Do not build against a stale CLAUDE.md.
3. Read PROGRESS.md in the project root — it is the current state of this build. If it is missing, recreate it with the structure at the end of this section, then continue.
4. Increment the session number and update the date in PROGRESS.md.
5. If "Notes for next session" has content: repeat the notes back to the builder, treat them as this session's priorities, then clear the section.
6. If this is session 1, run First Session Setup below before any build work.

Save point — after completing any module, feature, fix, or schema change:
1. Update PROGRESS.md: current state, remaining work, build decisions, known issues.
2. If the database was touched (any table, policy, bucket, or auth change), update docs/supabase-setup.md in the same save point.
3. Commit and push to main.
4. Tell the builder in one line: "Save point committed: [what changed]."
Do not start the next piece of work before the save point is pushed. Never end a session without one — an ending session is a save point.

First Session Setup (session 1 only — already run; this repo is past session 1):
1. Create docs/ and move product-spec.md into it. Move supabase-setup.md into docs/.
2. Install the brand skill: create .claude/skills/granate-sage/ and place the provided brand file there as SKILL.md (add minimal name/description frontmatter if it has none).
3. Announce what moved, then commit and push before building anything.

PROGRESS.md structure (for the recreate rule): status header (Session / Last updated / Live URL), Current state, Last session (3–5 lines, replace each session), Remaining work (shrinking checklist), Build decisions (one line each), Known issues, Notes for next session.

## Commands
```
npm install
npm run dev
npm run build
```

## Tech Stack
React 19 · Vite 8 · Tailwind CSS v4 (CSS-first config, `@tailwindcss/vite`, no `tailwind.config.js`) · Netlify · Supabase
Deployment: GitHub → Netlify, auto-deploys from main. The builder connects the repo and enters environment variables in the Netlify dashboard (or Claude Code does, when a Netlify MCP connection is available in the session) — confirm both are set before the first deploy after a build.

## Arms
Export — browser only, no server function:
- **Activity Data Entry side:** three CSV downloads — Activity Data (all persisted records), Facility Data (all persisted records), and a blank import template with the corrected header row.
- **Emissions Dashboard side:** CSV — full granular Emissions Results breakdown (every field, including `reviewer`/`evidence_link`, matching everything in the audit-trail panel) plus the run-rate forecast and its per-month inputs, always all persisted records, independent of on-screen filters. PDF — fixed five-section Granate/Sage-branded report (per-facility breakdown, per-year breakdown, year-over-year comparison, facility-vs-facility comparison, run-rate forecast), independent of on-screen filter/expand state.

## Environment Variables
VITE_SUPABASE_URL — Supabase: Project Settings → API → Project URL — Netlify env var
VITE_SUPABASE_ANON_KEY — Supabase: Project Settings → API → anon / public key — Netlify env var

Key storage follows function placement: this tool has no server-side functions, so both variables are Netlify environment variables, browser-exposed by design (VITE_ prefix), protected by RLS rather than secrecy. At session start, confirm both exist before first use. No value ever appears in code or in any file committed to GitHub.

## Supabase
Project: "purepastures" — already exists. Project URL: https://ztkgbowwrlszbbfuhkid.supabase.co
docs/supabase-setup.md is the schema source of truth — now documents all five tables across both halves of the merged tool. Read it before any database work. Never recreate tables or policies that already exist. Update it at every save point that touches the database.
Plan: Free — pauses after ~1 week without traffic. If the live tool shows connection errors after an idle period, restore the project manually in the Supabase dashboard.

Tables (no schema changes from the merge itself):
- `facility_reporting_period`, `activity_data` — created by the Activity Data Entry half. RLS: anon select + insert only, no update/delete.
- `ef_table`, `expected_matches` — created by the Emissions Dashboard half. RLS: anon select only, no write policies — edited only outside the app.
- `emissions_results` — created by the Emissions Dashboard half. RLS: anon select + insert (calculation engine) + **update, table-level, all columns** (accepted risk, not restricted to `validation_status` alone), no delete.

## Hard Rules
- API keys never in any frontend file or GitHub commit. This tool has no server-side functions — both Supabase variables are Netlify env vars only.
- Netlify Identity: never. Supabase Auth is the only authentication system in this stack, if one is ever added.
- RLS: never disabled on any table. If a query fails, fix the policy or the query — never disable RLS to work around it.
- GDPR: consent checkbox and the confirmed data statement required on the manual entry form and CSV import's Column Mapping step before any submission including `reviewer`. Personal data: `reviewer` only. Deletion requests → sustainability@purepastures.com. Region already EU (Frankfurt) — compliant.
- Facility Data blocking validation is a hard block, not a warning — an Activity Data entry with no matching Facility Data for its facility+year cannot submit under any path. It navigates to the Reporting Unit page, pre-filled with facility+year, with a warning banner.
- Activity value's unit is locked and auto-derived from the selected emission source. It is never an independently editable field, in the manual form or in CSV import.
- `data_quality_rating` valid values, per the live database: `measured`, `calculated`, `estimated`, `proxy`.
- No update or delete capability exists in the Activity Data Entry half of the UI — matches its two tables' RLS exactly. Do not add a "Remove" or "Edit" control to either table view or either tucked records section. The Emissions Dashboard's Validate/Reject controls on `emissions_results.validation_status` are the one deliberate exception (matches that table's own RLS).
- Each half's tables are off-limits to the other's schema/RLS changes: never alter `activity_data`/`facility_reporting_period` from Emissions Dashboard work, never alter `ef_table`/`expected_matches`/`emissions_results` from Activity Data Entry work.
- Do not build an in-app editing UI for `ef_table` or `expected_matches` — both are edit-only outside the app (direct DB or CSV edit).
- The calculation engine (`src/lib/calculationEngine.js`) fires only on the manual "Recalculate" button — never automatically on `activity_data` insert, never automatically on dashboard load.
- `activity_data_value_converted` is currently computed from a placeholder `conversion_factor` (flat 1.0, status 'TBD') — every `result_tco2e` the calculation engine produces is unreliable until that placeholder is replaced with real values. Do not present calculated figures as final; known limitation, not a bug to chase.
- **Confidence indicator is a deliberate accessibility reversal, not an oversight** (D-20): a bare color swatch (theme status tokens — success/warning/danger — not fixed hex), number on hover only. No non-color fallback exists; known, accepted limitation.
- **"Reject" is a UI label over the existing `flagged` `validation_status` value** — not a new schema state. Do not add a fourth value or alter the column.
- **Diagram clicks are a real filter, not a visual toggle** — clicking a scope's bar must hide/show that scope's entire section in the inventory table, and keep the Scope filter dropdown's checkboxes in sync.
- **The audit-trail panel must be click-to-pin, not CSS `:hover`-only** — a hover-only panel makes its evidence link unreachable. Click opens and pins it; click elsewhere or an explicit close control closes it.
- No visible "C-MORE" or "Tool A"/"Tool B" branding text anywhere in the UI — the product is presented to end users as PurePastures only.

## Brand
Brand is governed by the granate-sage skill at .claude/skills/granate-sage/SKILL.md. Invoke it for any UI or visual work. Replaces the retired placeholder "C-MORE" brand (never an official file, just a stand-in — see DECISIONS.md).
Hard rules that hold even if the skill is not loaded:
- Background: #F7F5F2 (light) / #1E1013 maroon-tinted (dark) — never white, never a neutral/near-black, never Tailwind gray defaults. Dark mode is a dark red, not an inverted neutral (confirmed D-25).
- Accent/action (identification): #7A1F2B Granate in light mode, #D4717F (lightened Granate) in dark mode — the only action colour, never a second filled-button colour, never Tailwind blue defaults
- Sage #8A9A7B is decorative only (lines, icons, section backgrounds) — never text, never a button fill
- Font: Source Serif 4 (600, headings) + Source Sans 3 (400/600, body), both self-hosted via @fontsource — never a Google Fonts CDN link. **Data face** — monospace, tabular-figures (`.data-face`, `--font-data`) — for the Emissions column and any other numeric table values.
- One radius everywhere: 7px
- Neutrals lead in both themes. A light/dark toggle in the top bar is required, not optional — applies via `data-theme="dark"` on `<html>`, not a class.
- Collapsible sections: the heading itself is the toggle — no separate chevron button, except where an existing pattern (e.g. the tucked past-entries sections) already shipped with one.
- Full-bleed layout for the Results inventory table specifically — no centered max-width wrapper on it, even though the rest of each section's content stays at the usual constrained width (full-bleed is relative to the content area beside the persistent sidebar, not the viewport).
- Confidence swatches and validation-status pills use the theme's own status tokens (success/warning/danger), never fixed hex, so they stay correctly mapped in both themes.

## Business Rules

### Navigation
- A persistent lateral (sidebar) nav, not top tabs (D-25 reverses the earlier two-tab IA) — four destinations: **Home** (new, default landing page), **Reporting Unit** (its own full page, promoted from a modal), **Activity Data Entry**, **Results** (renamed from "Emissions Dashboard" — same content/logic, one combined section covering both the inventory table/scope diagram and the audit trail).
- Home is the default landing section — unlike the old default-tab bug, Home is a progress view with no redirect-on-data-existing behavior, so it's always safe to land on.
- Reporting Unit is reached via the sidebar, or automatically on a blocked Activity Data submission (navigates there, pre-filled, with a warning banner) — a page, never a modal.
- Past entries: collapsed-by-default sections, not tabs — Activity Data's at the bottom of its page, Facility Data's on the Reporting Unit page.

### Home
- App-wide completion tracker, 5 items tied to the real GHG-inventory workflow (Reporting Unit on file for the current year; Scope 1/2/3 activity data entered; Results calculated), each with a one-line "why this matters" note and a ✓/missing marker, each linking to the section that resolves it.
- Scope 1/2/3 pie chart (a different chart type from Results' stacked bar, by design) summing `result_tco2e` per scope from `emissions_results`; missing-activity-data callouts when a scope has no entries, with a jump-link to Activity Data Entry.
- KPI/stat tiles (icon + number): total tCO2e, activity data entry count, facilities on file for the current year, pending-validation count.

### Activity Data Entry
- CSV import target fields, exact match: facility, purchase_date, emission_source, activity_data_value, data_quality_rating, notes, evidence_link, reviewer.
- `purchase_id` folds into `notes`, not its own column. Duplicate detection (warn, not block) compares that text + `facility` — accepted limitation, not a bug.
- Value Mapping combines a fuel-type column and an equipment/vehicle-description column when both exist, to resolve stationary vs. mobile `emission_source`.
- Data Review's "no Facility Data match" message points to the Reporting Unit page (sidebar item), replacing the old modal-button language.
- KPI/stat tile row at the top (same shared tile component as Home); no more Facility Data button-row card — just a small inline link, since the sidebar item is always present and a blocked submit already navigates there.
- The manual entry form (`EntryForm.jsx`) has its own per-form progress indicator — its required fields grouped into 5 sections, each with a one-line "why this matters" note and a ✓/missing marker, showing "X of 5 sections ready." This is in addition to Home's app-wide tracker, not instead of it — both exist (D-25). Stays a single-page form, not a multi-step wizard.

### Results
- No `activity_data` rows → local empty state ("No data available. Please add data in Activity Data Entry.") with a switch-section button. Rows exist → render the real dashboard **in place, in this tool** (D-22 reverses the earlier redirect-to-external-site behavior; D-12's "never render the dashboard's content locally" no longer applies).
- Match Step: filter `ef_table` rows by exact `emission_source`, then `facility_country` (fallback `"ALL"`), then most recent `publication_year` ≤ the activity's reporting year.
- Fan-out Rule: every EF row surviving the Match Step produces its own Emissions Result row — never collapsed to one result per `emission_source`.
- No-Match: zero matches → stub row, `result_tco2e = null`, `export_blocked = true`, no scope, appears only in the Unclassified bucket, reason = Cause B. Not a hard entry-time gate (that would be an Activity Data Entry change, not this half's scope).
- Partial-Match: some but not all `expected_matches`-declared `emission_basis` entries satisfied → real rows for what matched, stub rows (`export_blocked = true`) nested under the matched scope/category for what didn't.
- Unit Reconciliation: if `activity_data_unit_converted` doesn't reconcile with the matched EF row's `ef_unit`, treat as no match — `export_blocked = true`, Cause A.
- `result_tco2e = (activity_data_value_converted × ef_value) / 1000`.
- `confidence_score = round(√(data_quality_rating_score × ef_quality_level), 1)` — geometric mean, 1–5 scale.
- Run-rate forecast = (Σ `result_tco2e` across months with ≥1 entry, `export_blocked` rows counted as 0) / (count of months with ≥1 entry) × 12 — equal-weighted; months with no entries excluded from the denominator, not counted as zero.
- Shared filter bar: Scope (multi-select, all selected by default), Facility (dropdown), Reporting year (dropdown), Validation status (multi-select, all three selected by default). All four drive the diagram and the inventory table together.
- Diagram: stacked bar chart, one bar per Scope (1/2/3 — Unclassified not plotted), segmented by Category proportional to that category's share of the scope total, with a legend. Clicking a scope's bar toggles that scope in the shared Scope filter.
- Inventory: a table, not cards — Scope and Category both independently collapsible (nothing collapsed by default), Scope as a full section header, Category as a shaded sub-header row spanning the table width. Each `emission_source` is a row: Emission Source (friendly label) / Emissions (tCO2eq) / Confidence / Validation.
- Friendly labels: static frontend dictionary (`src/lib/labels.js`) mapping raw `emission_source` values to display labels. Any unmapped value falls back to the raw value as-is.
- Info tooltips: a small info icon next to every Scope, Category, and emission_source label, revealing an explanation on hover (`src/lib/tooltips.js`).
- Validation column: a status pill (Pending / Approved / Flagged) plus Validate/Reject buttons, writing `approved`/`flagged` directly. Single row at a time, no bulk action, no confirmation step.
- Audit-trail panel: click an emission_source label to pin its panel open. Content: activity value + unit, EF value + unit, both quality scores, reviewer, evidence link (a real clickable `<a>`, opens in a new tab).

Out of scope — do not build:
- A non-blocking version of the Facility Data validation (explicitly rejected); edit/delete of any Activity Data Entry record; real `conversion_factor` values; login/user accounts; saved CSV mapping templates; bulk-editing Data Review rows.
- Emission Factor Library toggle (versioned factor sets); editable/dynamic `ef_table` frontend; new `emission_source` creation procedure; any update/delete path for `export_blocked` rows; automatic recalculation of historical rows once real conversion factors land; column-restricted (function-based) write access to `emissions_results`; role-gating on the `reviewer` field; bulk validation_status changes; new filter dimensions beyond Scope/Facility/Year/Validation status; a `display_label` database column on `ef_table` (static frontend dictionary instead); a fourth `validation_status` value for "Reject"; a cross-tool `?theme=` URL parameter (now moot — one app, one theme state); rebuilding the calculation engine's No-Match handling as a hard entry-time gate.

## Reference Docs
Read before building the related part:
- docs/product-spec.md — Activity Data Entry's full module specs, UI sections, logic, arm detail (v7.0). The Emissions Dashboard half's own original product-spec.md (v1.5) and DECISIONS.md remain in its source repo (`carbon_dashboard_toolb_dev`), not duplicated here — this file's Business Rules section above is the distilled, operative version for ongoing work in this merged codebase.
- docs/supabase-setup.md — schema source of truth, all five tables (exists — read first)
- .claude/skills/granate-sage/SKILL.md — full brand system
File locations: CLAUDE.md and PROGRESS.md at root only; docs/ holds product-spec.md and supabase-setup.md; brand skill at .claude/skills/granate-sage/.
PROGRESS.md in the root is read at every session start per the Session Protocol.
