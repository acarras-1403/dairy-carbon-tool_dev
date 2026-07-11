# Product Spec — PurePastures GHG Activity Data Entry Tool

**Version:** 3.0
**Date:** 2026-07-11
**Author:** Andrea
**Status:** Confirmed

---

## Section 1 — Tool Summary

**Tool name:** PurePastures GHG Activity Data Entry Tool

**What it does:** A single-page tool where anyone with the link logs raw GHG activity data against a fixed list of categories — either one entry at a time through a manual form, or in bulk by uploading a CSV of raw records (e.g. fuel purchase logs) and mapping it into the tool's schema. Nothing is saved on a server — entries exist only in the browser tab, and the user downloads their own entries as a CSV before closing it. The tool performs no calculation; it only captures, maps, and lets the user export what was entered or imported.

**Who uses it:** AI Lab curriculum participants building and testing the tool at an early stage of the course — not yet deployed for PurePastures Dairy Cooperative's actual four-role staff.

**Why it exists:** Validates the data-entry form, the category structure, and — as of this version — a bulk-import path for messy real-world source data (like the raw fuel purchase extract this iteration was built against), without requiring a Supabase account, authentication setup, or any backend, so it fits where the builder currently is in the curriculum.

**Build status:** Iteration. Previous version (v2.0) was a Tier 1 tool with manual entry only, no login, no database, session-only data, all fields including Scope entered by hand. This build (v3.0) adds a bulk CSV import path with column and value mapping plus a Data Review area for flagged rows, and removes Scope as a manually entered form field — it is now derived automatically from the selected source, for both manual and imported entries. See `DECISIONS.md` (D-6 onward) for the reasoning behind each change.

---

## Section 2 — Classification

### Data Model

**Decision:** D2

| Label | What it means | This tool? |
|-------|--------------|-----------|
| D1 — Hardcoded | All data is written into the code by the developer. Users cannot input anything that persists. | No |
| D2 — Session | Data enters the tool during use and disappears when the tab closes. No database. Covers both uploaded files and form inputs. | Yes |
| D3 — Persisted | Data is written to a database and survives after the session ends. Supabase is required. | No |

**Reason:** Bulk CSV import — including the column mapping and value mapping the user configures per upload — is entirely in-browser, in-memory work. Nothing about it needs to be retrievable after the tab closes: mapping is deliberately re-done from scratch on every upload rather than remembered, so this remains a D2 tool exactly as v2.0 was.

**D3 triggers — none apply:**
- [ ] Data must be retrievable after the session ends
- [ ] Multiple sessions contribute to the same dataset
- [ ] An audit trail or history is needed
- [ ] Data submitted by one person must be visible to another
- [ ] Results must be accessible via a URL after the session ends
- [ ] Files uploaded by users must be stored and retrievable later

> Note: CSV upload is now in use, but the file itself is parsed and held only in browser memory for the duration of the session — it is never stored. This does not trigger D3.

---

### Access Model

**Decision:** A1

| Label | What it means | This tool? |
|-------|--------------|-----------|
| A1 — Public | Anyone with the URL can use it. No login, no account required. | Yes |
| A2 — Authentication | Users must log in. | No |
| A3 — Authorization | Users must log in and have different roles. | No |

**Reason:** Unchanged from v2.0 — anyone with the link can open the tool and log entries, manually or via CSV import.

---

### Tier

**Tier:** 1

| Tier | D+A combination | This tool |
|------|----------------|-----------|
| 1 | D1+A1 or D2+A1 | ✅ Matches (D2+A1) |

---

### Standalone or Stack

**This tool is:** Standalone — it does not share a database with any other tool.

---

## Section 3 — Arms

### AI API Arm

**Active:** No

---

### Export Arm

**Active:** Yes

| Detail | Answer |
|--------|--------|
| Format | CSV |
| What is exported | All activity-data entries currently sitting in the main session table — both manually entered and CSV-imported rows that have cleared mapping and, if flagged, been resolved and promoted from Data Review. Rows still sitting unresolved in Data Review are **not** included. Triggered by a "Download CSV" button. This remains the only way data leaves the tool. |
| PDF design intent | Not applicable — CSV only |

---

### Email Arm

**Active:** No — unchanged from v2.0 (D-4).

---

### Scheduled Automation Arm

**Active:** No — unchanged from v2.0 (D-4).

---

## Section 4 — Stack and Deployment

### All Tiers

| Detail | Answer |
|--------|--------|
| Frontend framework | React + Vite + Tailwind |
| Deployment target | Netlify |
| Netlify MCP | Not active — Netlify is connected to the GitHub repo via Netlify's own native integration (not Claude). Every push to `main` auto-deploys; Claude Code does not create the site or trigger deploys itself. |

**GitHub:** Already done — existing repo, Claude Code has direct access via a GitHub MCP connector. `product-spec.md`, `CLAUDE.md`, `PROGRESS.md`, `DECISIONS.md`, and `C-MORE-brand-style-sheet.md` live at the repo root.

**Supabase project:** Not applicable — this is a Tier 1 tool. No database, no Supabase account, no MCP database setup required.

---

## Section 5 — Data Architecture

### Not applicable — Data Model is D2, not D3

No database tables are created. All data structures below exist only as in-memory state in the browser during the session.

**In-session data shape (unchanged field list from v2.0 — for Claude Code's reference, not a database schema):**

| Field name | Plain language label | Data type | Who provides it | Required? |
|-----------|---------------------|-----------|----------------|-----------|
| reporting_period | Reporting period (e.g. 2026-07) | Text/Date | User (manual) / Derived (CSV import — see Section 9) | Yes |
| facility | Facility | Selection, from a hardcoded list | User (manual) / Mapped (CSV import) | Yes |
| scope, category, subcategory, source | GHG scope / category / subcategory / emission source | Selection, from a hardcoded list | **Scope no longer directly selected — derived automatically from source, for both manual and CSV-imported entries (see Section 9).** Category/subcategory/source: User (manual) / Mapped (CSV import) | Yes |
| activity_data_value | Activity data value | Number | User (manual) / Mapped column (CSV import) | Yes |
| activity_data_unit | Unit | Text, auto-filled from the selected source's hardcoded entry | Automatic | Yes |
| data_quality_rating | Data quality | Selection (measured / calculated / estimated / proxy) | User (manual) / Mapped (CSV import) | Yes |
| notes | Notes | Text | User (manual) / Auto-filled from unmapped CSV columns (CSV import) | No |

**Hardcoded lookup lists:** unchanged from v2.0 (D-5) — scope, category, subcategory, emission source, facility, and unit values remain static arrays written into source code. CSV import maps raw values onto these same lists; it does not add to or edit them. There is still no in-app admin view for changing lookup values.

**File storage:** No — uploaded CSV files are parsed and processed in browser memory only; the raw file itself is never written to disk or stored anywhere after processing.

**Derived or calculated data:** Scope is now derived (not raw input) — see Section 9. Reporting period is derived for CSV-imported rows only (see Section 9). No emissions calculation of any kind is performed.

---

## Section 6 — Access and Permissions

### Not applicable — Access Model is A1, no login, no RLS

Unchanged from v2.0. Anyone with the link can view and use the full tool — manual entry and CSV import, all categories, all facilities, no restriction.

---

## Section 7 — GDPR

**GDPR outcome:** Not applicable — no personal data (name, email, or any identifiable information) is collected through this tool's form or CSV import. Uploaded CSV files may contain business records (invoice numbers, supplier names, equipment descriptions) but no personal data about individuals, and none of that content is stored past the session.

---

## Section 8 — Screen and UI Structure

### Data Entry Form

- **Purpose:** Let anyone log one activity-data entry manually during their session.
- **What is visible:** A form with: reporting period, facility (dropdown, hardcoded list), category/subcategory/source (cascading dropdowns, hardcoded list, full unrestricted set — **Scope selector removed**, it is now derived silently the moment a source is chosen), activity data value, unit (auto-filled from the selected source), data quality rating (dropdown), notes (optional text).
- **User actions:** Fill out and submit an entry (adds it to the session table).
- **What happens next:** New entry appears immediately in the on-page session table.

### CSV Import

- **Purpose:** Let the user upload a CSV of raw records and bring it into the tool's schema in bulk instead of typing each row manually.
- **What is visible:** A file upload control and a short explanation of the three-step import flow (map columns, map values, review flagged rows).
- **User actions:** Select and upload a CSV file.
- **What happens next:** The tool parses the file in-browser and moves to Column Mapping.

### Column Mapping

- **Purpose:** Let the user tell the tool which raw CSV column corresponds to which schema field.
- **What is visible:** A list of the uploaded file's column headers, each with a dropdown to assign it to a schema field (facility, source, activity_data_value, data_quality_rating) or mark it as "fold into notes" / "ignore." Any column left unassigned defaults to folding into notes.
- **User actions:** Assign each column, then proceed to Value Mapping.
- **What happens next:** The tool scans the mapped columns for distinct raw values that don't already exactly match a hardcoded option.

### Value Mapping

- **Purpose:** Let the user map the raw values found in mapped columns onto the tool's hardcoded lookup options.
- **What is visible:** A list of every **distinct** unmapped raw value found (e.g. each unique facility code, each unique fuel type, each unique data-quality string), shown once regardless of how many rows contain it, each with a dropdown to the matching hardcoded option. Values that already match a hardcoded option exactly are skipped and not shown here.
- **User actions:** Map each distinct raw value once.
- **What happens next:** The mapping is applied to every row sharing that raw value within this upload. The tool then derives scope/category/subcategory from each row's mapped source, derives reporting_period by truncating each row's parsed purchase date to its month, and sorts rows: rows that parse and map cleanly go straight into the main session table; rows with an unparseable date or a required field still blank after mapping are auto-flagged into Data Review.

### Data Review

- **Purpose:** Hold only the rows that failed automatic processing during CSV import, so the user can fix and accept them individually.
- **What is visible:** A table of flagged rows only (not the full imported batch), each showing what's wrong (unparseable date, missing/blank required field) alongside editable fields matching the manual entry form.
- **User actions:** Fix a flagged row and promote it to the main session table, or discard it.
- **What happens next:** Promoted rows appear in the main session table alongside manually entered and cleanly-imported rows.

### Session Table + Export

- **Purpose:** Show every accepted entry (manual or imported) and let the user export them.
- **What is visible:** A running table of all accepted entries, with a "Download CSV" button.
- **User actions:** Remove an entry from the table before export; download all current entries as CSV.
- **What happens next:** Refreshing or closing the tab clears everything not yet exported — including anything still sitting unresolved in Data Review.

---

## Section 9 — Logic and Calculations

**What is calculated or derived:** No emissions calculation of any kind (unchanged from v2.0). Two things are now derived automatically rather than typed in:

1. **Scope derivation** — Inputs: the selected/mapped emission source. Rule: each hardcoded source is already linked to a fixed subcategory → category → scope in the existing lookup structure; scope is read off that same structure the instant a source is set, for both manual entries and CSV-imported rows. There is exactly one derivation point, reused by both entry paths. Edge case: a raw CSV value that hasn't been mapped to a hardcoded source yet cannot derive a scope — that row cannot be mapped or accepted until its source value mapping is resolved.

2. **Reporting period derivation (CSV import only)** — Inputs: the raw file's date column, once mapped. Rule: parse the date (the tool must accept the mixed formats seen in real source data, e.g. `DD/MM/YYYY`, `YYYY-MM-DD`, `DD-MM-YYYY`) and truncate to its calendar month (e.g. `15/01/2026` → `2026-01`). Edge case: a date that cannot be parsed under any recognized format flags the row for Data Review rather than guessing a period; manual entries are unaffected and continue to have reporting_period typed in directly.

---

## Section 10 — Brand and Visual Direction

**Brand reference:** Brand skill file — `C-MORE-brand-style-sheet.md`, unchanged from v2.0, already installed at `.claude/skills/c-more/`.

**Visual feel:** Neutrals leading, Deep Blue (#141A32) for identification, Lime (#C0FA00) sparingly for accent, Figtree typography, Off White (#FAFAFA) backgrounds — unchanged. The new Column Mapping, Value Mapping, and Data Review views should use the same card/input/button styling as the existing form rather than introducing new visual patterns.

---

## Section 11 — API and Credentials

No external services. No API keys, no credentials, no environment variables beyond what Netlify itself requires for deployment. Unchanged from v2.0 — CSV import is entirely client-side.

---

## Section 12 — Out of Scope — Phase 2

| Deferred feature | Reason it is deferred |
|-----------------|----------------------|
| Login / user accounts (A2 or A3) | Removed to eliminate Supabase account and OAuth setup friction at this stage of the curriculum (D-1) |
| Persisted storage (D3, Supabase) | Not needed to validate the form and category structure; deferred until a real inventory needs to be collected (D-2) |
| Role-based category/facility restriction | Depends on login existing first; deferred along with D-1 (D-3) |
| Monthly missing-entry reminder (Email + Scheduled Automation arms) | Depends on auth (who's missing) and persistence (what's been submitted); deferred along with D-1 and D-2 (D-4) |
| Editable lookup tables (spreadsheet- or database-backed categories) | Would reintroduce an external credential, contradicting the goal of this iteration; deferred along with D-2 (D-5) |
| Any calculation of emissions | Out of scope for this tool by original design — belongs to a separate calculation tool |
| Any results/dashboard display | Out of scope for this tool by original design — belongs to a separate dashboard tool |
| Column/value mapping remembered across sessions | Confirmed this iteration — every upload starts mapping from scratch; remembering mappings would require persistence and move this tool to D3 |
| CSV files beyond a few hundred rows | Confirmed this iteration — not needed to validate the import flow against the current sample data |
| Bulk-editing multiple Data Review rows at once | Confirmed this iteration — rows are fixed and promoted one at a time |
| Sanity-range validation on numeric values (e.g. implausible litres) | Confirmed this iteration — the tool does not judge whether a value is plausible, only whether it's present and correctly typed |

---

## Section 13 — Acceptance Criteria

| # | What to verify | Expected result | Done? |
|---|---------------|-----------------|-------|
| 1 | Form loads with no login | Tool is reachable directly at the Netlify URL, no auth gate | [ ] |
| 2 | All category/facility dropdowns show the full hardcoded list, Scope selector is absent from the manual form | No restriction by role or facility; Scope does not appear as an input anywhere on the manual entry form | [ ] |
| 3 | Submitting a manual entry adds it to the on-page session table with a correctly derived Scope | New row appears immediately with all entered fields, and scope matches the hardcoded source→scope mapping | [ ] |
| 4 | Uploading a CSV proceeds through Column Mapping, then Value Mapping, showing each distinct raw value only once | Column Mapping screen lists file headers; Value Mapping screen lists each unique unmapped value exactly once, not once per row | [ ] |
| 5 | A value mapped once in Value Mapping is applied to every row sharing that raw value | All matching rows reflect the mapping without being remapped individually | [ ] |
| 6 | Rows with an unparseable date or a blank/unmapped required field are routed to Data Review, not the main table | Data Review shows only flagged rows; clean rows appear directly in the main session table | [ ] |
| 7 | Reporting period is correctly derived for CSV-imported rows across mixed date formats | A row with `15/01/2026`, `2026-02-04`, and `14-03-2026` in the source file each resolve to the correct year-month | [ ] |
| 8 | Fixing and promoting a Data Review row moves it into the main session table | Row disappears from Data Review and appears in the main table with all fields complete | [ ] |
| 9 | Refreshing the page clears all entries, including anything in Data Review and any in-progress mapping | Confirms no persistence exists anywhere | [ ] |
| 10 | Download CSV produces a correct file containing only accepted entries | CSV contains all main-table entries with correct headers and values; unresolved Data Review rows are excluded | [ ] |
| 11 | Tool deploys and is accessible | Live Netlify URL loads correctly, no login gate, on desktop and mobile | [ ] |
| 12 | Netlify build succeeds after Claude Code pushes to `main` | Checked manually by the builder in the Netlify dashboard — Claude Code has no visibility into Netlify (MCP not active) and cannot confirm this itself. | [ ] |

---

## Section 14 — Build Path

**This tool's tier:** Tier 1

### Pre-build steps

- [x] Tool Architect skill — interview complete, this spec written and confirmed
- [ ] Project Governor skill — CLAUDE.md and PROGRESS.md updated from this spec
- [x] GitHub repo already exists; Claude Code has direct access via a GitHub MCP connector
- [ ] product-spec.md, CLAUDE.md, PROGRESS.md, DECISIONS.md updated in the GitHub repo root
- [x] C-MORE-brand-style-sheet.md already in the GitHub repo root
- [x] Netlify connected to the GitHub repo — confirmed, via Netlify's native integration; push to `main` auto-deploys

### Tier 1 — build session

- [ ] Open Claude Code in the project folder
- [ ] Claude Code reads product-spec.md, CLAUDE.md, PROGRESS.md, and DECISIONS.md
- [ ] Claude Code builds CSV Import: Column Mapping → Value Mapping → automatic derivation and sorting → Data Review
- [ ] Claude Code removes the Scope selector from the manual entry form and wires scope derivation from source, reused by both entry paths
- [ ] Test locally before deploying, including the mixed-date-format and unmapped-value edge cases
- [ ] Claude Code commits and pushes to `main` via its GitHub access — Netlify's native integration deploys automatically. No environment variables are needed (Section 11 — no external services).

---

## Section 15 — Open Questions

| Question | Who answers it | Blocking? |
|----------|---------------|-----------|
| When this MVP is validated, does it get promoted back toward the original Tier 3 spec (v1.0), or does the curriculum move to a fresh design? | Andrea | No — can be resolved after this build ships |
| Should CSV import eventually support remembering mappings across sessions, once the curriculum reaches persistence? | Andrea | No — explicitly deferred this iteration, revisit only if the tool moves toward D3 |

---

## Section 16 — Tool Version History

| Version | Date | What changed in the tool |
|---------|------|--------------------------|
| v1.0 | 2026-07-05 | Initial build — Tier 3, magic-link login, four roles, Supabase persistence, monthly email reminders |
| v2.0 | 2026-07-10 | MVP downgrade to Tier 1 — login removed, persistence removed, role restriction removed, Email and Scheduled Automation arms removed, lookup tables hardcoded |
| v3.0 | 2026-07-11 | Added CSV bulk import (Column Mapping → Value Mapping → Data Review); removed Scope as a manually entered field, now derived from source for both manual and imported entries. Tier remains 1 (D2+A1) — mapping is session-only, does not persist across uploads or sessions |

---

*This spec is written for Claude Code. It assumes zero prior context.*
