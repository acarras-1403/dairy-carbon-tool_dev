# Product Spec — PurePastures GHG Activity Data Entry Tool

**Version:** 7.0
**Date:** 2026-08-05
**Author:** Andrea
**Status:** Confirmed

---

## Section 1 — Tool Summary

**Tool name:** PurePastures GHG Activity Data Entry Tool

**What it does:** A tool where anyone with the link logs raw GHG activity data — manually or via bulk CSV — and, separately, logs annual Facility Data (production volume, revenue, country) per facility. Facility Data is no longer its own page or step; it's a modal reachable from inside the single Activity Data Entry tab, opened either manually or automatically when an Activity Data entry has no matching Facility Data for its facility+year — in which case submission is still blocked (unchanged from D-13) until it's added, right there in the modal. Two top-level tabs: **Emissions Dashboard** (first) and **Activity Data Entry** (second). Past entries — both activity data and facility data — live in collapsed, tucked-away sections rather than separate tabs or inline tables. The tool performs no emissions calculation itself; it captures, normalizes units, maps, validates, and exports what was entered or imported.

**Who uses it:** AI Lab curriculum participants building and testing the tool — not yet deployed for PurePastures Dairy Cooperative's actual staff.

**Why it exists:** Consolidates everything the user does — enter activity data, add facility data when prompted, review past entries — into one tab, since all of this tool's own functions live in one place in the menu bar. The Emissions Dashboard tab is reserved for the actual dashboard (Tool B, a separate tool); this build only wires up what happens when there's nothing there yet to show.

**Build status:** Iteration. Previous version (v6.0) applied brand v2, added intro copy to both steps, and split records into separate tabs. This build (v7.0) restructures the navigation and entry flow entirely:
- Navigation reduced to two tabs: **Emissions Dashboard** (renamed from "Dashboard", now first) and **Activity Data Entry** (renamed from "Data Entry", now second)
- **Facility Reporting Period is no longer a separate step, page, or tab.** Renamed "Facility Data" in the UI (the underlying `facility_reporting_period` table name is unchanged — no migration needed, this is a label change only) and rebuilt as a modal, opened via a button inside Activity Data Entry, or automatically when D-13's blocking validation has no match to auto-assign
- **Both Records tabs from v6.0 are removed.** Past Activity Data entries are a collapsed/tucked section at the bottom of Activity Data Entry; past Facility Data entries are a collapsed/tucked section inside the Facility Data modal. Neither is a top-level nav item.
- D-13's blocking validation is confirmed unchanged in substance — an entry with no matching Facility Data still cannot submit — but the redirect target changes: instead of navigating to a separate page, it opens the Facility Data modal in place, pre-filled with facility+year, with a warning banner explaining why
- CSV import's "no Facility Data match" message (Data Review) is updated to point at opening Facility Data from the Activity Data Entry tab, since the page it used to point to no longer exists
- Emissions Dashboard tab: **new logic.** On load, checks whether any `activity_data` rows exist. If none, shows "No data available. Please add data in the Activity Data Entry tab." with a button back to that tab — rendered entirely within this tool. If data exists, navigates out to the live Tool B URL as before. **This tool does not render Tool B's actual dashboard content** — D-12 (rejecting the Tool A/Tool B frontend merge) still holds; this is a data-existence check and a conditional redirect, nothing more
- Manual entry form gains: Evidence link and Reviewer (both existed in schema, were missing from the visible form), and a locked unit indicator next to Activity value that updates based on the selected emission source (previously no unit was shown anywhere on this form)
- GDPR consent checkbox and data statement now visibly present under Reviewer on the manual form, matching the requirement already in Section 7 (previously specified but not reflected in the form's field list)
- Bulk import gains a working "Download template (.csv)" link — a clean file with the corrected header row (Section 8) plus one example row, so a user can build a compliant CSV from scratch instead of only reconciling an existing export
- A light/dark theme toggle in the top bar, per C-MORE v2's theme pair, is now an explicit UI requirement rather than an implied consequence of the brand file

**This tool is expected to remain the schema-creating tool in a stack with Tool B.** No schema or stack relationship changes this iteration.

---

## Section 2 — Classification

*Unchanged from v6.0 — D3, A1, Tier 2, part of a stack.*

> **Open item carried forward:** authentication migration (A1 → A2/A3) remains unresolved — see Section 15. The tucked-away records sections (replacing v6.0's Records tabs) will still need rework once auth lands, for the same reason the tabs would have — "whose records" is not a meaningful question under A1 but becomes one under A2/A3.

---

## Section 3 — Arms

*Unchanged from v6.0, except Export arm gains a new item.*

### Export Arm
**Active:** Yes

| Detail | Answer |
|--------|--------|
| Format | CSV — three items: two data exports, one blank template |
| What is exported | **Download Activity Data CSV** — all Activity Data records. **Download Facility Data CSV** — all Facility Data records (available inside the Facility Data modal's tucked section). **Download template (.csv)** *(new v7.0)* — a static file, not a data export: header row `facility, purchase_date, emission_source, activity_data_value, data_quality_rating, notes, evidence_link, reviewer`, plus one example row, for building a compliant bulk-import CSV from scratch. |
| PDF design intent | Not applicable — CSV only |

---

## Section 4 — Stack and Deployment

*Unchanged from v6.0.*

---

## Section 5 — Data Architecture

*Unchanged from v6.0 — same fields, same tables.* One clarification this iteration: the `facility_reporting_period` table's UI-facing label is now "Facility Data" (see Section 8). **The table name itself does not change** — renaming the live table would be unnecessary churn for a label-only request; Claude Code must not rename the table, column names, or any RLS policy tied to it.

**Activity Data table** — `reporting_period`, `facility`, `emission_source`, `activity_data_value_raw`, `activity_data_unit_raw`, `activity_data_value_converted`, `activity_data_unit_converted`, `data_quality_rating`, `notes`, `evidence_link`, `reviewer`, `facility_reporting_period_ref`.

**Facility Reporting Period table** (UI label: "Facility Data") — `facility`, `reporting_year`, `facility_country`, `production_volume`, `annual_revenue`.

**Derived or calculated data — new this iteration:** the Emissions Dashboard tab's empty-state check is a simple existence query against `activity_data` (does at least one row exist) — not a calculation, no new table or field required.

---

## Section 6 — Access and Permissions

*Unchanged from v6.0.* RLS: anonymous read/insert on both tables, no update/delete.

---

## Section 7 — GDPR

*Unchanged from v6.0.* GDPR applies via the `reviewer` field. Consent checkbox and data statement are required wherever `reviewer` is shown — now explicitly reflected in Section 8's field list for the manual entry form, which had omitted it from the visible spec since v4.0 despite the requirement being adopted.

---

## Section 8 — Screen and UI Structure

Top-level navigation: **Emissions Dashboard** · **Activity Data Entry**

### Emissions Dashboard *(renamed and restructured, v7.0)*

- **Purpose:** Entry point to the live emissions dashboard (Tool B), with a graceful state when there's nothing to show yet.
- **What is visible:** On load, the tool checks whether any `activity_data` rows exist.
  - **No data:** centered message — "No data available. Please add data in the Activity Data Entry tab." — with a button that switches to the Activity Data Entry tab.
  - **Data exists:** navigates to `https://ghgdashboarddev.netlify.app/` (the live Tool B deployment).
- **User actions:** If empty, click through to Activity Data Entry. If data exists, land on Tool B.
- **What happens next:** This tool never renders Tool B's dashboard content itself — only checks for data and redirects. Preserves the separation from D-12.

### Activity Data Entry *(renamed and restructured, v7.0)*

- **Purpose:** Single tab for everything related to logging activity data — the introduction, the Facility Data entry point, bulk import, manual entry, and past entries.
- **What is visible, top to bottom:**
  1. Introductory description — what activity data is and why it's collected.
  2. A row noting that facility data is entered separately, once per year per facility, with a **"Facility Data"** button that opens the modal (see below).
  3. Bulk import card: file upload control, and a **"Download template (.csv)"** link that downloads the file described in Section 3.
  4. Manual entry form: facility (dropdown), reporting period, emission source (cascading dropdown, navigation only — only `emission_source` is stored), activity value with a locked unit indicator next to it (auto-set from the selected emission source, not separately editable), data quality rating, evidence link (optional), reviewer (optional) — with the GDPR consent checkbox and data statement directly beneath it — and notes (optional).
  5. A tucked, collapsed-by-default section at the bottom: "Past activity data entries" — expands to a table of all persisted Activity Data records plus a "Download Activity Data CSV" button.
- **User actions:** Read the description; open Facility Data if needed; upload a CSV or fill out and submit the manual form; expand the tucked section to review or export past entries.
- **What happens next:**
  - Manual submit: D-13's auto-detect runs. Match found → submits normally. No match → **submission is blocked**, and the Facility Data modal opens automatically, pre-filled with the entry's facility and year, showing the warning banner described below.
  - CSV: proceeds to Column Mapping.

### Facility Data (modal) *(replaces the Facility Reporting Period page and its Records tab, v7.0)*

- **Purpose:** Let anyone log one Facility Data entry — annual, per-facility — from inside Activity Data Entry, without leaving that tab.
- **Trigger:** Opened manually via the "Facility Data" button, or automatically when a submitted Activity Data entry has no matching Facility Data for its facility+year.
- **What is visible:**
  - A short explanation: this data is what lets the tool calculate intensity, choose the correct emission factor for the year and location, and support setting reduction targets later.
  - **If opened via the auto-block trigger:** a warning banner — "No facility data on file for [facility] in [year]. Add it below to continue." — with facility and year pre-filled in the form below.
  - Form: facility (dropdown), reporting year, facility country, production volume, annual revenue.
  - A tucked, collapsed-by-default section inside the modal: "Past facility data entries" — expands to a table of all persisted Facility Data records plus a "Download Facility Data CSV" button.
- **User actions:** Fill out and save an entry; expand the tucked section to review or export past entries; close the modal.
- **What happens next:** Entry writes to Supabase. If opened via the auto-block trigger, closing the modal after saving returns the user to their pending Activity Data entry, which can now be resubmitted and will match.

### CSV Import (bulk path)

*Mechanically unchanged from v6.0* — file upload → Column Mapping → Value Mapping → Data Review, all within Activity Data Entry rather than a separate step.

### Column Mapping

*Unchanged from v6.0.* Target field list: `facility`, `purchase_date`, `emission_source`, `activity_data_value_raw`, `data_quality_rating`, `notes` (fold `purchase_id` in here), `evidence_link`, `reviewer`.

### Value Mapping

*Unchanged from v6.0* — combines fuel-type and equipment-description columns to resolve `emission_source`; checks Facility Data match, blank quality rating, and `notes`-based duplicate detection.

### Data Review

- **Purpose:** Hold rows that failed automatic processing during CSV import.
- **What is visible:** Flagged rows with what's wrong — unparseable date, missing required field, unrecognized `emission_source`, blank `data_quality_rating`, duplicate (via `notes` text), or **no matching Facility Data** — this last message updated to say "Add Facility Data for [facility]/[year] using the Facility Data button in Activity Data Entry, then re-promote this row," since there's no separate page to point to anymore.
- **User actions:** Fix a flagged row and promote it (opening Facility Data from here if needed), or discard it.
- **What happens next:** Promoted rows write to Supabase.

---

## Section 9 — Logic and Calculations

**What is calculated or derived:** No emissions calculation. Scope derivation, reporting period derivation, unit conversion (placeholder `conversion_factor`) — all unchanged from v6.0.

**Facility Data auto-detect and blocking validation — confirmed unchanged in substance, changed in presentation (v7.0):**
- **Rule:** unchanged — query `facility_reporting_period` for a row matching the entry's facility + year extracted from `reporting_period`.
- **If a match exists:** unchanged — auto-assign, entry submits.
- **If no match exists:** **still a hard block** (explicitly reconfirmed this session — entries are not allowed through with a soft warning). What changes: instead of redirecting to a separate Facility Reporting Period page, the Facility Data modal opens in place, pre-filled with facility+year, showing the warning banner from Section 8.

**Emissions Dashboard data-existence check (new, v7.0):** on tab load, a simple query checks whether `activity_data` has at least one row. This is existence-only — no aggregation, no calculation. Drives the empty-state vs. redirect-to-Tool-B branch in Section 8.

**Edge cases:** Unchanged from v6.0.

---

## Section 10 — Brand and Visual Direction

**Brand reference:** `C-MORE-brand-style-sheet.md` v2 — unchanged from v6.0.

**New explicit requirement this iteration:** a light/dark theme toggle in the top bar, switching between v2's light and dark token sets (Deep Blue `#141A32` identification in light mode; Lime `#C0FA00` identification in dark mode). This was an implied capability of the brand file in v6.0; it's now a required, visible control, not left to Claude Code's discretion whether to surface it.

---

## Section 11 — API and Credentials

*Unchanged.*

---

## Section 12 — Out of Scope — Phase 2

*Carried forward from v6.0, plus:*

| Deferred feature | Reason it is deferred |
|-----------------|----------------------|
| Rendering Tool B's actual dashboard content inside this tool | Explicitly out — D-12 already rejected merging the two frontends; the Emissions Dashboard tab only checks for data existence and redirects |
| Soft (non-blocking) facility-data warning | Considered and explicitly rejected this session — stays a hard block, per D-13 |
| Edit/delete of Facility Data or Activity Data from the tucked sections | Not requested — same no-update/delete RLS as prior iterations |

---

## Section 13 — Acceptance Criteria

*Items 1–17, 21, 22, 24 (baseline persistence, GDPR, RLS, CSV field sync, brand tokens) carried forward from v6.0 and re-verified against the new structure. New or materially changed this iteration:*

| # | What to verify | Expected result | Done? |
|---|---------------|-----------------|-------|
| 25 | Navigation shows exactly two tabs | "Emissions Dashboard" (first), "Activity Data Entry" (second) — no separate Facility Data or Records tabs | [ ] |
| 26 | Emissions Dashboard shows the empty state when no activity data exists | Message reads "No data available. Please add data in the Activity Data Entry tab."; button switches tabs correctly | [ ] |
| 27 | Emissions Dashboard redirects to the live Tool B URL once data exists | Navigates to `https://ghgdashboarddev.netlify.app/`, does not render dashboard content locally | [ ] |
| 28 | Facility Data opens as a modal from the button inside Activity Data Entry | Modal opens in place; underlying tab remains Activity Data Entry | [ ] |
| 29 | Facility Data modal opens automatically on a blocked entry, pre-filled | Submitting an entry with no matching facility+year opens the modal with the warning banner, facility and year pre-filled | [ ] |
| 30 | Blocked entry still cannot submit without Facility Data | Confirmed hard block — no soft-warning bypass exists | [ ] |
| 31 | Resubmitting after saving Facility Data in the modal succeeds | Closing the modal after save returns to the pending entry, which now matches and submits | [ ] |
| 32 | Past Activity Data entries are a tucked/collapsed section, not a tab | Collapsed by default at the bottom of Activity Data Entry; expands on click; CSV download works | [ ] |
| 33 | Past Facility Data entries are a tucked/collapsed section inside the modal | Collapsed by default inside Facility Data; expands on click; CSV download works | [ ] |
| 34 | Manual entry form includes Evidence link, Reviewer, and a locked unit indicator | All three visible; unit indicator updates when emission source changes and is not independently editable | [ ] |
| 35 | GDPR consent checkbox appears under Reviewer | Checkbox and data statement text render as specified in Section 7 | [ ] |
| 36 | "Download template (.csv)" produces a working file | Downloads a CSV with the exact header row from Section 3 plus one example row | [ ] |
| 37 | Light/dark theme toggle works in the top bar | Switching persists visually across the whole page, using v2's light/dark token sets correctly (accent role swap included) | [ ] |
| 38 | CSV import's no-match message references the modal, not a page | Data Review's "no Facility Data" message tells the user to use the Facility Data button, not a page that no longer exists | [ ] |

---

## Section 14 — Build Path

**This tool's tier:** Tier 2

### Pre-build steps

- [x] Tool Architect skill — interview complete, this spec written and confirmed
- [ ] Project Governor skill — CLAUDE.md and PROGRESS.md updated from this spec
- [x] GitHub repo already exists; Claude Code has direct access via GitHub MCP connector
- [ ] product-spec.md, CLAUDE.md, PROGRESS.md, DECISIONS.md updated in the GitHub repo root
- [x] C-MORE-brand-style-sheet.md v2 confirmed at the repo root
- [x] Netlify connected to the GitHub repo
- [x] Confirm no credentials need creating outside Supabase

### Tier 2 — build session

- [ ] Open Claude Code in the project folder
- [ ] Claude Code reads product-spec.md, CLAUDE.md, PROGRESS.md, and DECISIONS.md
- [ ] Claude Code connects to the existing `purepastures` Supabase project — **no schema changes this iteration**, confirm via `docs/supabase-setup.md` that no migration is needed
- [ ] Claude Code rebuilds navigation down to two tabs: Emissions Dashboard, Activity Data Entry
- [ ] Claude Code builds the Emissions Dashboard existence check and empty-state/redirect branch
- [ ] Claude Code removes the Facility Reporting Period page and both v6.0 Records tabs entirely
- [ ] Claude Code builds the Facility Data modal, including the tucked past-entries section inside it
- [ ] Claude Code wires D-13's blocking validation to open the modal (pre-filled, with warning banner) instead of redirecting
- [ ] Claude Code adds Evidence link, Reviewer, GDPR consent checkbox, and the locked unit indicator to the manual entry form
- [ ] Claude Code adds the tucked past-entries section to the bottom of Activity Data Entry
- [ ] Claude Code adds the "Download template (.csv)" link per Section 3
- [ ] Claude Code updates Data Review's no-match message to reference the modal
- [ ] Claude Code adds the light/dark theme toggle to the top bar, wired to v2's token sets
- [ ] Test locally before deploying, including: the blocked-entry modal flow end to end, both tucked sections, the dashboard empty state, template download, and theme toggle
- [ ] Claude Code commits and pushes to `main`
- [ ] Optional post-build: run Supabase QA skill to confirm no unintended schema changes

---

## Section 15 — Open Questions

| Question | Who answers it | Blocking? |
|----------|---------------|-----------|
| DECISIONS.md is missing D-16 through D-19. Backfill owed. | Andrea | No — deferred (see D-20) |
| Tool B's dashboard needs to display `evidence_link` and `reviewer` per entry — both already readable under current RLS. Carry into Tool B's own interview. | Andrea | No |
| Where will real `conversion_factor` values come from, and when? | Andrea | No — carried forward, unresolved |
| Auth migration (A1 → A2/A3) — the tucked records sections (and the Facility Data modal) will need rework once resolved. | Andrea | No — growing retroactive-ownership risk |
| Should the Emissions Dashboard tab's empty-state check re-run live, or only on tab load/refresh? Not specified this session — assumed on load only. | Andrea | No — assumption stated, correct if wrong |

---

## Section 16 — Tool Version History

| Version | Date | What changed in the tool |
|---------|------|--------------------------|
| v1.0–v5.0 | 2026-07-05 – 2026-07-16 | See prior entries — initial build through D3 promotion and Step 1/Step 2 ordering. |
| v6.0 | 2026-08-05 | Brand v2 applied. Intro copy added to both steps. Records split into separate tabs. CSV target field list re-synced. Dashboard tab linked to live Tool B URL. |
| v7.0 | 2026-08-05 | Navigation reduced to two tabs (Emissions Dashboard first, Activity Data Entry second). Facility Reporting Period removed as a page/step, rebuilt as a "Facility Data" modal inside Activity Data Entry (table name unchanged, UI label only). Both v6.0 Records tabs removed in favor of tucked/collapsed sections — one at the bottom of Activity Data Entry, one inside the Facility Data modal. D-13's hard block reconfirmed unchanged; redirect target changed from a page to the modal. Emissions Dashboard gains a data-existence check driving an empty state or a redirect to Tool B — explicitly does not render Tool B's content itself (D-12 preserved). Manual entry form gains Evidence link, Reviewer, GDPR consent checkbox, and a locked unit indicator. Bulk import gains a working CSV template download. Light/dark theme toggle added as an explicit requirement. |

---

*This spec is written for Claude Code. It assumes zero prior context.*
