# Product Spec — PurePastures GHG Activity Data Entry Tool

**Version:** 4.0
**Date:** 2026-07-14
**Author:** Andrea
**Status:** Confirmed

---

## Section 1 — Tool Summary

**Tool name:** PurePastures GHG Activity Data Entry Tool

**What it does:** A single-page tool where anyone with the link logs raw GHG activity data against a fixed list of categories — manually through a form, or in bulk via CSV upload with column/value mapping — and now also logs annual Facility Reporting Period data (production volume, revenue, country) per facility. A placeholder navigation tab points toward the future emissions dashboard tool. The tool performs no emissions calculation; it captures, normalizes units, maps, and exports what was entered or imported.

**Who uses it:** AI Lab curriculum participants building and testing the tool at an early stage of the course — not yet deployed for PurePastures Dairy Cooperative's actual four-role staff.

**Why it exists:** Validates the expanded Activity Data schema (raw/converted value and unit split, evidence_link, reviewer) and the new Facility Reporting Period capture ahead of the eventual D3/Supabase promotion, and establishes navigation toward the future emissions dashboard tool — without provisioning a database this iteration.

**Build status:** Iteration. Previous version (v3.0) was a Tier 1 tool (D2+A1 — session-only, no login, no database) with manual entry, CSV bulk import (Column Mapping → Value Mapping → Data Review), and scope derived automatically from source. This build (v4.0):
- Splits `activity_data_value`/`activity_data_unit` into raw (user-entered) and converted (computed) pairs
- Adds `evidence_link` and `reviewer` fields to Activity Data
- Adds unit conversion logic via a hardcoded, placeholder `emission_source → conversion_factor` table
- Adds a new Facility Reporting Period entry form and session table
- Adds a placeholder navigation tab linking to the future emissions dashboard tool (Tool B)
- Adds a second CSV export for Facility Reporting Period data

**The D3/Supabase promotion originally scoped under Decision Registry Goal G-2 is explicitly deferred to a future iteration.** This build stays D2+A1, Tier 1. See `DECISIONS.md` — this deferral should be logged there as its own entry before the next iteration begins.

---

## Section 2 — Classification

### Data Model

**Decision:** D2

| Label | What it means | This tool? |
|-------|--------------|-----------|
| D1 — Hardcoded | All data is written into the code by the developer. Users cannot input anything that persists. | No |
| D2 — Session | Data enters the tool during use and disappears when the tab closes. No database. Covers both uploaded files and form inputs. | Yes |
| D3 — Persisted | Data is written to a database and survives after the session ends. Supabase is required. | No |

**Reason:** This iteration deliberately stays session-only. The D3/Supabase promotion called for in Decision Registry Goal G-2 is explicitly deferred to a future iteration — nothing captured here needs to be retrievable after the tab closes yet.

**D3 triggers — none apply (by deliberate deferral, not because they don't eventually apply):**
- [ ] Data must be retrievable after the session ends
- [ ] Multiple sessions contribute to the same dataset
- [ ] An audit trail or history is needed
- [ ] Data submitted by one person must be visible to another
- [ ] Results must be accessible via a URL after the session ends
- [ ] Files uploaded by users must be stored and retrievable later

---

### Access Model

**Decision:** A1

| Label | What it means | This tool? |
|-------|--------------|-----------|
| A1 — Public | Anyone with the URL can use it. No login, no account required. | Yes |
| A2 — Authentication | Users must log in. | No |
| A3 — Authorization | Users must log in and have different roles. | No |

**Reason:** Unchanged from v3.0 — anyone with the link can open the tool and log entries, manually or via CSV import.

---

### Tier

**Tier:** 1

| Tier | D+A combination | This tool |
|------|----------------|-----------|
| 1 | D1+A1 or D2+A1 | ✅ Matches (D2+A1) |

---

### Standalone or Stack

**This tool is:** Standalone this iteration — no Supabase project exists yet, so there is no shared database.

> Note for the future: once the D3 promotion happens, per the existing Decision Registry (Goal G-2), this tool is expected to become the schema-creating tool in a two-tool stack with the future Tool B (EF database + calculation logic + emissions dashboard), sharing one Supabase project. That project will be named after the client/organizational context (e.g. "purepastures"), not after this tool, when it is created.

---

## Section 3 — Arms

### AI API Arm

**Active:** No

---

### Export Arm

**Active:** Yes

| Detail | Answer |
|--------|--------|
| Format | CSV — two separate downloads |
| What is exported (1) | **Download Activity Data CSV** — all Activity Data entries currently in the main session table (manually entered and CSV-imported rows that cleared mapping and, if flagged, were resolved and promoted from Data Review). Rows still unresolved in Data Review are excluded — unchanged rule from v3.0. |
| What is exported (2) | **Download Facility Reporting Period CSV** — all Facility Reporting Period entries currently in the session table. Kept as a separate file rather than merged into the Activity Data export, since the two are different grains of data (many rows per session vs. one row per facility per year) and a single flat file can't cleanly represent both. |
| PDF design intent | Not applicable — CSV only |

---

### Email Arm

**Active:** No — unchanged from v3.0.

---

### Scheduled Automation Arm

**Active:** No — unchanged from v3.0.

---

## Section 4 — Stack and Deployment

### All Tiers

| Detail | Answer |
|--------|--------|
| Frontend framework | React + Vite + Tailwind |
| Deployment target | Netlify |
| Netlify MCP | Not active — Netlify is connected to the GitHub repo via Netlify's own native integration. Every push to `main` auto-deploys; Claude Code does not create the site or trigger deploys itself. |

**GitHub:** Already done — existing repo, Claude Code has direct access via a GitHub MCP connector. `product-spec.md`, `CLAUDE.md`, `PROGRESS.md`, `DECISIONS.md`, and `C-MORE-brand-style-sheet.md` live at the repo root.

**Supabase project:** Not applicable this iteration — Data Model is D2, no database, no Supabase account, no MCP database setup required.

---

## Section 5 — Data Architecture

### Not applicable — Data Model is D2, not D3

No database tables are created. All data structures below exist only as in-memory state in the browser during the session.

**Activity Data — in-session shape:**

| Field name | Plain language label | Data type | Who provides it | Displayed in frontend | Required? |
|-----------|---------------------|-----------|----------------|----------------------|-----------|
| reporting_period | Reporting period (e.g. 2026-07) | Text/Date | User (manual) / Derived (CSV import) | Yes | Yes |
| facility | Facility | Selection, hardcoded list | User (manual) / Mapped (CSV import) | Yes | Yes |
| scope, category, subcategory | GHG scope / category / subcategory | Cascading dropdown, hardcoded — navigation only, not stored | User (manual) / Mapped (CSV import) | Yes | Yes |
| emission_source | Emission source | Selection, hardcoded list | User (manual) / Mapped (CSV import) — **the only one of the four cascade values actually stored** | Yes | Yes |
| activity_data_value_raw | Activity data value, as entered | Number | User (manual) / Mapped column (CSV import) | Yes | Yes |
| activity_data_unit_raw | Unit, as entered | Text, auto-filled from source (manual) / mapped (CSV import) | Automatic / Mapped | Yes | Yes |
| activity_data_value_converted | Converted value (base unit) | Number, **computed** — see Section 9 | Automatic (computed) | No | Yes |
| activity_data_unit_converted | Converted unit (base unit) | Text, **computed** — see Section 9 | Automatic (computed) | No | Yes |
| data_quality_rating | Data quality | Selection (measured / calculated / estimated / proxy) | User (manual) / Mapped (CSV import) | Yes | Yes |
| notes | Notes | Text | User (manual) / Auto-filled from unmapped CSV columns | Yes | No |
| evidence_link | Evidence link | URL/text | User (manual) / Mapped (CSV import) | Yes | No |
| reviewer | Reviewer | Free text, self-reported — no login to verify identity | User (manual) / Mapped (CSV import) | Yes | No |

**Facility Reporting Period — in-session shape (new this iteration):**

| Field name | Plain language label | Data type | Who provides it | Required? |
|-----------|---------------------|-----------|----------------|-----------|
| facility | Facility | Selection, hardcoded list | User | Yes |
| reporting_year | Reporting year (YYYY) | Year | User | Yes |
| facility_country | Country | Dropdown/lookup | User | Yes |
| production_volume | Production volume | Number + unit | User | Yes |
| annual_revenue | Annual revenue | Number (currency) | User | Yes |

**Hardcoded lookup lists:** Unchanged from v3.0 — scope, category, subcategory, emission source, facility, and unit values remain static arrays written into source code. **New this iteration:** a hardcoded `emission_source → conversion_factor` lookup table (see Section 9) — every factor starts as a placeholder value; there is still no in-app admin view for changing any lookup values.

**File storage:** No — uploaded CSV files are parsed and processed in browser memory only.

**Derived or calculated data:** Scope is derived (unchanged). Reporting period is derived for CSV-imported Activity Data rows only (unchanged). `activity_data_value_converted`/`activity_data_unit_converted` are now computed via the conversion table (new — see Section 9). No emissions calculation of any kind is performed.

---

## Section 6 — Access and Permissions

### Not applicable — Access Model is A1, no login, no RLS

Unchanged from v3.0. Anyone with the link can view and use the full tool — manual entry, CSV import, and Facility Reporting Period entry — all categories, all facilities, no restriction.

---

## Section 7 — GDPR

**GDPR outcome:** Not applicable this iteration — Data Model is D2, not D3, so this section is not mandatory per framework rules.

**Note for the future:** `reviewer` and `evidence_link` are free-text, self-reported fields that could contain a person's name. Nothing persists past the session this iteration, so no storage obligation exists yet — but this must be revisited explicitly when the D3 promotion happens, since persisting these fields in a database would trigger the full GDPR section.

---

## Section 8 — Screen and UI Structure

### Data Entry Form

- **Purpose:** Let anyone log one Activity Data entry manually during their session.
- **What is visible:** reporting period, facility (dropdown), category/subcategory/source (cascading dropdowns, full unrestricted set — Scope selector absent, derived silently on source selection), activity data value (raw), unit (auto-filled and locked from the selected source), data quality rating, notes (optional), evidence link (optional), reviewer (optional).
- **User actions:** Fill out and submit an entry.
- **What happens next:** `activity_data_value_converted`/`activity_data_unit_converted` are computed automatically (Section 9) and the entry appears in the session table.

### CSV Import

- **Purpose:** Let the user upload a CSV of raw Activity Data records and bring it into the tool's schema in bulk.
- **What is visible:** Unchanged from v3.0 — file upload control, explanation of the Column Mapping → Value Mapping → Data Review flow.
- **User actions:** Select and upload a CSV file.
- **What happens next:** Parsed in-browser, moves to Column Mapping.

### Column Mapping

- **Purpose:** Assign raw CSV columns to schema fields.
- **What is visible:** Column headers, each with a dropdown to a schema field (facility, source, activity_data_value_raw, activity_data_unit_raw, data_quality_rating, evidence_link, reviewer) or "fold into notes" / "ignore." Unassigned columns default to folding into notes.
- **User actions:** Assign each column, proceed to Value Mapping.
- **What happens next:** The tool scans mapped columns for distinct raw values not already matching a hardcoded option, and for raw units not recognized against the mapped source's expected unit.

### Value Mapping

- **Purpose:** Map raw values onto hardcoded lookup options.
- **What is visible:** Each distinct unmapped raw value, shown once, with a dropdown to the matching hardcoded option. Exact matches are skipped.
- **User actions:** Map each distinct raw value once.
- **What happens next:** Mapping applies to every row sharing that value. The tool derives scope/category/subcategory from mapped source, derives reporting_period from the parsed date, and computes activity_data_value_converted/unit_converted (Section 9). Rows that parse and map cleanly (including a recognized unit for conversion) go to the session table; rows with an unparseable date, a required field still blank, or an unrecognized raw unit are flagged into Data Review.

### Data Review

- **Purpose:** Hold only the rows that failed automatic processing during CSV import.
- **What is visible:** Flagged rows only, each showing what's wrong (unparseable date, missing required field, or unrecognized raw unit for conversion) alongside editable fields matching the manual entry form.
- **User actions:** Fix a flagged row and promote it, or discard it.
- **What happens next:** Promoted rows appear in the main session table.

### Facility Reporting Period Form *(new)*

- **Purpose:** Let anyone log one Facility Reporting Period entry — annual, per-facility data used later for intensity calculations by the future emissions dashboard tool.
- **What is visible:** Facility (dropdown), reporting year, facility country (dropdown/lookup), production volume (number + unit), annual revenue (number + currency).
- **User actions:** Fill out and submit an entry.
- **What happens next:** New entry appears in a separate Facility Reporting Period session table.

### Dashboard Tab *(new)*

- **Purpose:** Navigation placeholder pointing toward the future emissions dashboard tool (Tool B), which is not yet built.
- **What is visible:** A nav item, styled consistently with the rest of the tool.
- **User actions:** Click the tab.
- **What happens next:** Navigates to a placeholder URL. This URL must be updated once Tool B is deployed — track this as an open item, not a one-time build task.

### Session Table + Export

- **Purpose:** Show every accepted Activity Data entry and every Facility Reporting Period entry, and let the user export each.
- **What is visible:** Activity Data session table with a "Download Activity Data CSV" button; Facility Reporting Period session table with a separate "Download Facility Reporting Period CSV" button.
- **User actions:** Remove an entry before export; download either table as its own CSV.
- **What happens next:** Refreshing or closing the tab clears everything not yet exported, in both tables, including anything still in Data Review.

---

## Section 9 — Logic and Calculations

**What is calculated or derived:** No emissions calculation of any kind. Three things are derived automatically:

1. **Scope derivation** — Unchanged from v3.0. One derivation point, reused by both entry paths, reading scope off the source's fixed lookup structure.

2. **Reporting period derivation (CSV import only)** — Unchanged from v3.0. Parses mixed date formats, truncates to calendar month. Unparseable dates flag the row to Data Review.

3. **Unit conversion (new this iteration)** — Inputs: `activity_data_value_raw`, `activity_data_unit_raw`, `emission_source`. Rule: a hardcoded lookup table maps each `emission_source` to a `conversion_factor`. `activity_data_value_converted = activity_data_value_raw × conversion_factor`; `activity_data_unit_converted` is the fixed base unit associated with that source in the same lookup table.
   - **Manual entry:** the unit field is auto-filled and locked to the selected source (unchanged v3.0 rule), so the raw unit always matches the expected unit — the factor is applied but has no practical effect beyond confirming the value carries through (in practice, converted = raw × 1.0 for every manually-typed entry unless a source's expected base unit genuinely differs from its display unit).
   - **CSV import:** the mapped raw unit is checked against the expected unit for the mapped source. If it doesn't match a recognized unit for that source, the row is flagged to Data Review — same fallback pattern as an unparseable date, rather than guessing a conversion.
   - **Placeholder data (important limitation):** every `conversion_factor` in the hardcoded table starts at a placeholder value (1.0, marked TBD in the lookup table itself). The computation and Data Review fallback are fully built and functional now; the real, source-specific factor values are not yet supplied and will be swapped in later as a data edit to the lookup table, not a logic change.

**Edge cases:** An unrecognized raw unit on CSV import routes the row to Data Review rather than computing a wrong converted value. Manual entries cannot produce this edge case, since the unit is locked to the source.

---

## Section 10 — Brand and Visual Direction

**Brand reference:** Brand skill file — `C-MORE-brand-style-sheet.md`, unchanged from v3.0, already installed at `.claude/skills/c-more/`.

**Visual feel:** Unchanged — neutrals leading, Deep Blue (#141A32) for identification, Lime (#C0FA00) sparingly for accent, Figtree typography, Off White (#FAFAFA) backgrounds. The new Facility Reporting Period form and the dashboard nav tab use the same card/input/button styling as the existing views — no new visual patterns.

---

## Section 11 — API and Credentials

No external services. No API keys, no credentials, no environment variables beyond what Netlify itself requires for deployment. Unchanged from v3.0.

---

## Section 12 — Out of Scope — Phase 2

| Deferred feature | Reason it is deferred |
|-----------------|----------------------|
| D3/Supabase promotion | Explicitly deferred this iteration — needs its own Decision Registry entry logged before the next iteration begins |
| New emission_source creation procedure | Already deferred (D-8) — no new emission sources are being added this iteration |
| Editable/dynamic EF frontend | Already deferred (D-7) — belongs to the future Tool B |
| Dashboard functionality itself (charts, calculations, results) | Placeholder link only this iteration — real functionality belongs to the future Tool B |
| Multi-currency FX conversion | Out of scope — the conversion table handles unit conversion only, not currency exchange |
| Real conversion factor values | Placeholder (1.0/TBD) only this iteration — real values to be supplied by the builder later as a data update to the lookup table |
| Client-agnostic tool/lookup generalization | Considered and rejected this iteration — the tool remains PurePastures-specific |
| Login / user accounts (A2/A3) | Unchanged from v2.0/v3.0 |
| Role-based category/facility restriction | Unchanged from v2.0/v3.0 |
| Monthly missing-entry reminder | Unchanged from v2.0/v3.0 |
| Column/value mapping remembered across sessions | Unchanged from v3.0 |
| CSV files beyond a few hundred rows | Unchanged from v3.0 |
| Bulk-editing multiple Data Review rows at once | Unchanged from v3.0 |
| Sanity-range validation on numeric values | Unchanged from v3.0 |

---

## Section 13 — Acceptance Criteria

| # | What to verify | Expected result | Done? |
|---|---------------|-----------------|-------|
| 1 | Form loads with no login | Tool is reachable directly at the Netlify URL, no auth gate | [ ] |
| 2 | Manual entry form shows raw fields, no converted fields, no Scope selector | Only activity_data_value_raw/unit_raw are user-facing; converted fields computed silently | [ ] |
| 3 | Submitting a manual entry computes a converted value/unit | activity_data_value_converted and unit_converted are set correctly using the placeholder conversion table | [ ] |
| 4 | CSV import flags rows with an unrecognized raw unit to Data Review | Row does not enter the main table with a guessed conversion; appears in Data Review with the unit issue identified | [ ] |
| 5 | CSV import proceeds through Column Mapping (including evidence_link/reviewer as mappable columns), then Value Mapping | Both screens function as in v3.0, with the two new optional fields available to map | [ ] |
| 6 | Reporting period and scope derivation still work for CSV-imported rows | Matches v3.0 behavior exactly, unaffected by the schema changes | [ ] |
| 7 | Facility Reporting Period form accepts an entry | New row appears in a separate Facility Reporting Period session table | [ ] |
| 8 | Dashboard tab is present and links to a placeholder URL | Tab renders, styled consistently, navigates to the placeholder URL | [ ] |
| 9 | Two separate CSV downloads work independently | "Download Activity Data CSV" and "Download Facility Reporting Period CSV" each produce a correct, separate file | [ ] |
| 10 | Refreshing the page clears all entries in both session tables, including Data Review | Confirms no persistence exists anywhere | [ ] |
| 11 | Tool deploys and is accessible | Live Netlify URL loads correctly, no login gate, on desktop and mobile | [ ] |
| 12 | Netlify build succeeds after Claude Code pushes to `main` | Checked manually by the builder in the Netlify dashboard — Claude Code has no visibility into Netlify | [ ] |

---

## Section 14 — Build Path

**This tool's tier:** Tier 1

### Pre-build steps

- [x] Tool Architect skill — interview complete, this spec written and confirmed
- [ ] Project Governor skill — CLAUDE.md and PROGRESS.md updated from this spec
- [x] GitHub repo already exists; Claude Code has direct access via a GitHub MCP connector
- [ ] product-spec.md, CLAUDE.md, PROGRESS.md, DECISIONS.md updated in the GitHub repo root — **including a new DECISIONS.md entry logging the D3-promotion deferral before this build starts**
- [x] C-MORE-brand-style-sheet.md already in the GitHub repo root
- [x] Netlify connected to the GitHub repo — confirmed, via Netlify's native integration

### Tier 1 — build session

- [ ] Open Claude Code in the project folder
- [ ] Claude Code reads product-spec.md, CLAUDE.md, PROGRESS.md, and DECISIONS.md
- [ ] Claude Code builds the schema split (raw/converted, evidence_link, reviewer) into Activity Data
- [ ] Claude Code builds the hardcoded conversion_factor lookup table with placeholder (1.0/TBD) values, and the conversion computation + Data Review fallback for unrecognized units
- [ ] Claude Code builds the Facility Reporting Period form and session table
- [ ] Claude Code builds the placeholder Dashboard nav tab
- [ ] Claude Code splits the export into two separate CSV downloads
- [ ] Test locally before deploying, including the unrecognized-unit edge case
- [ ] Claude Code commits and pushes to `main` — Netlify's native integration deploys automatically

---

## Section 15 — Open Questions

| Question | Who answers it | Blocking? |
|----------|---------------|-----------|
| When the D3/Supabase promotion happens, does this tool become the schema-creating tool in the G-2 stack (per the build-order rule), given it now defines both Activity Data and Facility Reporting Period? | Andrea | No — resolve before that future build begins |
| Where will the real conversion_factor values come from, and when will they replace the placeholders? | Andrea | No — can be resolved as a future data update, non-blocking for this build |
| When this MVP is validated, does it get promoted back toward the original Tier 3 spec (v1.0), or does the curriculum move to a fresh design? | Andrea | No — carried forward from v3.0, still unresolved |
| Should CSV import eventually support remembering mappings across sessions, once the curriculum reaches persistence? | Andrea | No — explicitly deferred, revisit only at D3 |

---

## Section 16 — Tool Version History

| Version | Date | What changed in the tool |
|---------|------|--------------------------|
| v1.0 | 2026-07-05 | Initial build — Tier 3, magic-link login, four roles, Supabase persistence, monthly email reminders |
| v2.0 | 2026-07-10 | MVP downgrade to Tier 1 — login removed, persistence removed, role restriction removed, Email and Scheduled Automation arms removed, lookup tables hardcoded |
| v3.0 | 2026-07-11 | Added CSV bulk import (Column Mapping → Value Mapping → Data Review); removed Scope as a manually entered field, now derived from source. Tier remains 1 (D2+A1) |
| v4.0 | 2026-07-14 | Split activity_data_value/unit into raw/converted pairs; added evidence_link and reviewer fields; added unit conversion logic via a placeholder hardcoded conversion_factor table; added Facility Reporting Period entry form and CSV export; added placeholder Dashboard nav tab. Tier remains 1 (D2+A1) — D3/Supabase promotion (Decision Registry G-2) explicitly deferred to a future iteration |

---

*This spec is written for Claude Code. It assumes zero prior context.*
