# Product Spec — PurePastures GHG Activity Data Entry Tool

**Version:** 5.0
**Date:** 2026-07-16
**Author:** Andrea
**Status:** Confirmed

---

## Section 1 — Tool Summary

**Tool name:** PurePastures GHG Activity Data Entry Tool

**What it does:** A tool where anyone with the link logs raw GHG activity data — manually through a form, or in bulk via CSV upload with column/value mapping — and logs annual Facility Reporting Period data (production volume, revenue, country) per facility. Facility Reporting Period entry is now the first step in the tool; Data Entry is the second step. Activity Data entries auto-detect and assign Facility Reporting Period info by matching facility + reporting year, and are blocked from submission if no matching Facility Reporting Period record exists yet for that facility+year. A placeholder navigation tab points toward the future emissions dashboard tool (Tool B). The tool performs no emissions calculation; it captures, normalizes units, maps, validates, and exports what was entered or imported.

**Who uses it:** AI Lab curriculum participants building and testing the tool — not yet deployed for PurePastures Dairy Cooperative's actual staff. Designed so the underlying workflow (facility data once per year, activity data submitted across separate sessions throughout the year) matches how PurePastures staff would actually use it once live.

**Why it exists:** Promotes Tool A from session-only to persisted storage so that Facility Reporting Period data entered in one session is available to validate and enrich Activity Data entries submitted in later, separate sessions — the core requirement a session-only tool cannot satisfy. Also reorders the UI so the one-off annual Facility Reporting Period entry happens before the repeatable Data Entry flow, and establishes the shared Supabase project the future Tool B (EF database + calculation logic + emissions dashboard) will read from.

**Build status:** Iteration. Previous version (v4.0) was a Tier 1 tool (D2+A1 — session-only, no login, no database) with manual entry, CSV bulk import, unit conversion via a placeholder lookup table, and a Facility Reporting Period form added as its own session table. This build (v5.0):
- Promotes Data Model from D2 to D3 — both Activity Data and Facility Reporting Period now persist in Supabase
- Reorders the UI: Facility Reporting Period entry becomes the first step/tab; Data Entry (manual + CSV import) becomes the second step
- Adds auto-detection and assignment of Facility Reporting Period info to Activity Data entries, matched by facility + reporting year
- Adds a blocking validation rule: an Activity Data entry cannot be submitted if no Facility Reporting Period record exists yet for that entry's facility + reporting year — the user is redirected inline to the Facility Reporting Period form for that facility+year rather than shown a dead-end error
- Changes CSV export scope: both exports now include all records ever entered (not just the current session)
- Provisions a new Supabase project (`purepastures`) — explicitly not the tool's earlier v1.0 Supabase project, which is not reused
- Adds GDPR consent framework for the `reviewer` field (personal data — a self-reported name)

**This tool is expected to become the schema-creating tool in a future stack with Tool B** (EF database + calculation logic + emissions dashboard), per the existing Decision Registry (Goal G-3). Tool B's frontend and its own D3 promotion are being built as separate, later iterations — Tool B will join this same `purepastures` Supabase project once it exists, not create its own.

---

## Section 2 — Classification

### Data Model

**Decision:** D3

| Label | What it means | This tool? |
|-------|--------------|-----------|
| D1 — Hardcoded | All data is written into the code by the developer. Users cannot input anything that persists. | No |
| D2 — Session | Data enters the tool during use and disappears when the tab closes. No database. | No |
| D3 — Persisted | Data is written to a database and survives after the session ends. Supabase is required. | Yes |

**Reason:** Facility Reporting Period is entered once per facility per year; Activity Data entries for that same facility+year are submitted across separate sessions spread throughout the year. For an Activity Data entry submitted in, say, March to auto-detect and validate against Facility Reporting Period data entered in January, that January data must still exist after the tab that created it was closed. A session-only tool cannot satisfy this — the requirement itself makes D2 incorrect, not just inconvenient.

**D3 triggers — checked against this tool's actual workflow:**
- [x] Data must be retrievable after the session ends — Facility Reporting Period must outlive the session it was entered in
- [x] Multiple sessions contribute to the same dataset — February, March, April Activity Data entries all reference one January Facility Reporting Period record
- [ ] An audit trail or history is needed — not requested this iteration
- [ ] Data submitted by one person must be visible to another — not applicable, A1, no roles
- [ ] Results must be accessible via a URL after the session ends
- [ ] Files uploaded by users must be stored and retrievable later — CSV import stays session-only processing, no file storage

---

### Access Model

**Decision:** A1

| Label | What it means | This tool? |
|-------|--------------|-----------|
| A1 — Public | Anyone with the URL can use it. No login, no account required. | Yes |
| A2 — Authentication | Users must log in. | No |
| A3 — Authorization | Users must log in and have different roles. | No |

**Reason:** Unchanged from v4.0 — anyone with the link can open the tool and log entries, manually or via CSV import. Persistence does not require login; RLS is not needed since all data is treated as equally public/writable, matching the tool's existing no-restriction design.

---

### Tier

**Tier:** 2

| Tier | D+A combination | This tool |
|------|----------------|-----------|
| 2 | D3+A1 | ✅ Matches (D3+A1) |

Plain language: this tool now stores data in a database and it survives after someone closes the tab, but there is still no login — anyone with the link can use it the same way as before.

---

### Standalone or Stack

**This tool is:** Part of a stack. This tool is the schema-creating tool — it provisions the `purepastures` Supabase project and owns the Activity Data and Facility Reporting Period tables. The future Tool B (EF database + calculation logic + emissions dashboard) will join this same project as a second, separate tool once it is built.

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
| What is exported | **Download Activity Data CSV** — all Activity Data records ever entered into the database (not session-scoped, since data now persists), excluding rows still unresolved in Data Review. **Download Facility Reporting Period CSV** — all Facility Reporting Period records ever entered. This is a change from v4.0, where exports were session-scoped only. |
| PDF design intent | Not applicable — CSV only |

---

### Email Arm

**Active:** No this iteration.

Deferred and explicitly named, not silently dropped: a notification when an Activity Data entry is blocked for missing Facility Reporting Period data, and a reminder when a facility hasn't logged its annual data yet. See Section 12.

---

### Scheduled Automation Arm

**Active:** No this iteration.

Deferred and explicitly named: an automatic reminder if a facility hasn't submitted its Facility Reporting Period for the current year. See Section 12.

---

## Section 4 — Stack and Deployment

### All Tiers

| Detail | Answer |
|--------|--------|
| Frontend framework | React + Vite + Tailwind |
| Deployment target | Netlify |
| Netlify MCP | Not active — Netlify is connected to the GitHub repo via Netlify's own native integration. Every push to `main` auto-deploys; Claude Code does not create the site or trigger deploys itself. |

**GitHub:** Already done — existing repo, Claude Code has direct access via a GitHub MCP connector. `product-spec.md`, `CLAUDE.md`, `PROGRESS.md`, `DECISIONS.md`, and `C-MORE-brand-style-sheet.md` live at the repo root (spec inside `docs/`, per existing convention).

---

### Supabase project

**Supabase project status:** New — Claude Code will create it at the start of the build session.

**Supabase plan:** Free — pauses after roughly one week of no traffic. Explicitly chosen with the trade-off understood: if the live tool goes untouched for about a week, it will look broken (connection errors) to the next person who opens it — a teacher or reviewer, most plausibly — until someone manually restores the project in the Supabase dashboard. Chosen anyway; on record as a deliberate trade-off, not an oversight.

| Detail | Answer |
|--------|--------|
| Proposed project name | purepastures |
| Confirmed project name | purepastures |

> Claude Code will pause at the start of the session, confirm the project name, and create the Supabase project via MCP before building anything. The project ID will be recorded in `docs/supabase-setup.md` once created.

**Explicit instruction — do not reuse the existing v1.0 Supabase project.** This tool's history includes an earlier Tier 3 build (v1.0 — magic-link auth, four roles, Supabase persistence) referenced in `CLAUDE.md`'s existing Hard Rules. That project is not to be reused for this D3 promotion. This is a brand-new Supabase project, created fresh. Only hardcoded lookup-list values and brand tokens may be ported forward from v1.0 — this rule, already in place, is unchanged and now explicitly extended to cover the Supabase project itself, not just code.

**`docs/supabase-setup.md`:** Created by Claude Code at the end of this build session. Records the project name, project ID, all tables and fields, RLS policies. This is the schema source of truth for Tool B's future build session — Tool B's own Project Governor run will require this file as an input.

---

### Stack

**Stack name / Supabase project name:** purepastures

**This tool's role in the stack:** Tool A — schema-creating tool, owns Activity Data and Facility Reporting Period tables.

**Other tools in this stack:**

| Tool | Tier | Role in the stack |
|------|------|------------------|
| Tool A (this spec) | Tier 2 | Activity data capture — manual entry, CSV import, Facility Reporting Period. Creates the shared Supabase project. |
| Tool B (future, separate spec) | TBD (Tier 2 or 3) | EF database + calculation logic + emissions dashboard. Reads Activity Data and Facility Reporting Period from this same project. Joins as an existing project — does not create its own. |

> **Build order:** Tool A (this spec) builds first and creates `docs/supabase-setup.md`. Tool B's build session must not start until this build is complete and that file exists. Each tool gets its own spec, its own repo, its own CLAUDE.md, its own PROGRESS.md, and its own Netlify site — the shared Supabase project is the only thing connecting them.

---

## Section 5 — Data Architecture

**What data is collected or stored in this tool:**

**Activity Data table**

| Field name | Plain language label | Data type | Who provides it | Required? |
|-----------|---------------------|-----------|----------------|-----------|
| reporting_period | Reporting period (e.g. 2026-07) | Text/Date | User (manual) / Derived (CSV import) | Yes |
| facility | Facility | Selection, hardcoded list | User (manual) / Mapped (CSV import) | Yes |
| emission_source | Emission source | Selection, hardcoded list | User (manual) / Mapped (CSV import) | Yes |
| activity_data_value_raw | Activity data value, as entered | Number | User (manual) / Mapped column (CSV import) | Yes |
| activity_data_unit_raw | Unit, as entered | Text, auto-filled from source (manual) / mapped (CSV import) | Automatic / Mapped | Yes |
| activity_data_value_converted | Converted value (base unit) | Number, computed | Automatic (computed) | Yes |
| activity_data_unit_converted | Converted unit (base unit) | Text, computed | Automatic (computed) | Yes |
| data_quality_rating | Data quality | Selection (measured / calculated / estimated / proxy) | User (manual) / Mapped (CSV import) | Yes |
| notes | Notes | Text | User (manual) / Auto-filled from unmapped CSV columns | No |
| evidence_link | Evidence link | URL/text | User (manual) / Mapped (CSV import) | No |
| reviewer | Reviewer | Free text, self-reported name — personal data, see Section 7 | User (manual) / Mapped (CSV import) | No |
| facility_reporting_period_ref | Reference to matched Facility Reporting Period row | Reference (facility + reporting_year) | Automatic (auto-detected/assigned at submission) | Yes — submission blocked without a match |

**Facility Reporting Period table**

| Field name | Plain language label | Data type | Who provides it | Required? |
|-----------|---------------------|-----------|----------------|-----------|
| facility | Facility | Selection, hardcoded list | User | Yes |
| reporting_year | Reporting year (YYYY) | Year | User | Yes |
| facility_country | Country | Dropdown/lookup | User | Yes |
| production_volume | Production volume | Number + unit | User | Yes |
| annual_revenue | Annual revenue | Number (currency) | User | Yes |

**Tables needed:**

| Table name | What it stores | Key fields |
|-----------|---------------|-----------|
| activity_data | One row per logged activity entry | facility, emission_source, reporting_period, facility_reporting_period_ref |
| facility_reporting_period | One row per facility per reporting year | facility, reporting_year (unique together) |

**File storage:** No — uploaded CSV files are parsed and processed in browser memory only; not stored.

**Derived or calculated data:** Yes.
- Scope is derived from the selected/mapped `emission_source` (unchanged from v4.0).
- Reporting period is derived for CSV-imported Activity Data rows by truncating the parsed date to its month (unchanged from v4.0).
- `activity_data_value_converted`/`activity_data_unit_converted` are computed via the placeholder conversion table (unchanged from v4.0 — still 1.0/TBD placeholder values).
- **New this iteration:** `facility_reporting_period_ref` is auto-assigned at submission time by matching the entry's `facility` + the year extracted from `reporting_period` against existing `facility_reporting_period` rows. If no match exists, submission is blocked and the user is redirected inline to the Facility Reporting Period form pre-filled with that facility+year.

---

## Section 6 — Access and Permissions

### Not applicable in the traditional RLS sense — Access Model is A1, no login

There are no user roles, so RLS policies are uniform: anyone (anonymous/public) can read and write to both tables. This is a deliberate continuation of A1's existing no-restriction design, now expressed as a database policy rather than a session-state absence of restriction.

**RLS rules — who can read and write what:**

| Table | User type | Can read | Can insert | Can update | Can delete |
|-------|----------|----------|------------|------------|------------|
| activity_data | Unauthenticated (anon) | All rows | Yes | No | No |
| facility_reporting_period | Unauthenticated (anon) | All rows | Yes | No | No |

> No update/delete from the frontend this iteration — matches v4.0's existing behavior (session table had no edit-in-place either, only remove-before-export). Claude Code builds these RLS policies via Supabase MCP.

---

## Section 7 — GDPR

**GDPR outcome:** Applies — personal data is collected through the Activity Data form's `reviewer` field.

**Personal data collected:**
- `reviewer` — free-text, self-reported name

`evidence_link` is confirmed non-personal — it stays a document/evidence reference (e.g. invoice, meter reading) and does not contain or point to identifying information.

**Consent checkpoint on the form:** Yes — a checkbox and data statement must appear before submission on the manual entry form and be represented appropriately in the CSV import flow (Column Mapping/Value Mapping screens note that mapping the `reviewer` column carries the same consent implication).

**Data statement text shown to users at the point of collection:**
> "Your data will be stored securely and used only to track who logged each activity entry for internal accountability purposes. You can request deletion of your name at any time by contacting sustainability@purepastures.com."

**Deletion mechanism:**
A person requests deletion of their name by emailing sustainability@purepastures.com. Since there is no login/account system (A1), deletion is a manual data-edit request processed directly against the `reviewer` field in Supabase — there is no self-service deletion flow in this iteration.

---

## Section 8 — Screen and UI Structure

### Facility Reporting Period Form (Step 1 — first screen)

- **Purpose:** Let anyone log one Facility Reporting Period entry — annual, per-facility data, entered before any Activity Data for that facility+year can be submitted.
- **What is visible:** Facility (dropdown), reporting year, facility country (dropdown/lookup), production volume (number + unit), annual revenue (number + currency).
- **User actions:** Fill out and submit an entry; proceed to Data Entry.
- **What happens next:** New entry is written to Supabase. The user proceeds to Data Entry (Step 2). If arriving here via a blocked-entry redirect from Data Entry, the facility and year are pre-filled from the entry that triggered the redirect.

### Data Entry (Step 2 — manual form)

- **Purpose:** Let anyone log one Activity Data entry manually.
- **What is visible:** Reporting period, facility (dropdown), category/subcategory/source (cascading dropdowns, navigation only — only `emission_source` is stored), activity data value (raw), unit (auto-filled and locked from source), data quality rating, notes (optional), evidence link (optional), reviewer (optional) with GDPR consent checkbox and data statement.
- **User actions:** Fill out and submit an entry.
- **What happens next:** The tool auto-detects a matching Facility Reporting Period record by facility + reporting year. If found: `activity_data_value_converted`/`unit_converted` compute automatically, the entry writes to Supabase and appears in the session view. If not found: submission is blocked, and the user is redirected inline to the Facility Reporting Period form (Step 1), pre-filled with the facility and year from the blocked entry.

### CSV Import (Step 2 — bulk path)

- **Purpose:** Let the user upload a CSV of raw Activity Data records in bulk.
- **What is visible:** Unchanged from v4.0 — file upload control, explanation of the Column Mapping → Value Mapping → Data Review flow.
- **User actions:** Select and upload a CSV file.
- **What happens next:** Parsed in-browser, moves to Column Mapping.

### Column Mapping

- **Purpose:** Assign raw CSV columns to schema fields.
- **What is visible:** Unchanged from v4.0 — column headers, dropdown to schema field or "fold into notes"/"ignore," including evidence_link and reviewer as mappable columns.
- **User actions:** Assign each column, proceed to Value Mapping.
- **What happens next:** Unchanged from v4.0 scanning behavior.

### Value Mapping

- **Purpose:** Map raw values onto hardcoded lookup options.
- **What is visible:** Unchanged from v4.0.
- **User actions:** Map each distinct raw value once.
- **What happens next:** For each row, the tool derives scope, reporting_period, and computes converted value/unit as in v4.0, then additionally checks for a matching Facility Reporting Period by facility + reporting year. Rows with no match are flagged to Data Review (new reason, alongside unparseable date / unrecognized unit / blank required field) rather than blocking the whole import.

### Data Review

- **Purpose:** Hold rows that failed automatic processing during CSV import.
- **What is visible:** Flagged rows, each showing what's wrong — unparseable date, missing required field, unrecognized raw unit, or **no matching Facility Reporting Period for that facility+year** — alongside editable fields matching the manual entry form.
- **User actions:** Fix a flagged row and promote it (which may include navigating to add the missing Facility Reporting Period record), or discard it.
- **What happens next:** Promoted rows write to Supabase.

### Dashboard Tab

- **Purpose:** Navigation placeholder pointing toward the future emissions dashboard tool (Tool B).
- **What is visible:** Unchanged from v4.0 — nav item, styled consistently.
- **User actions:** Click the tab.
- **What happens next:** Unchanged — navigates to a placeholder URL, to be swapped once Tool B deploys.

### Data Table + Export

- **Purpose:** Show Activity Data entries and Facility Reporting Period entries, and let the user export each.
- **What is visible:** Activity Data table with "Download Activity Data CSV" button; Facility Reporting Period table with "Download Facility Reporting Period CSV" button. Both now reflect all persisted records, not just the current session's additions.
- **User actions:** Download either table as its own CSV.
- **What happens next:** Data persists in Supabase; refreshing or closing the tab no longer clears submitted entries. In-progress, unsubmitted form entries are still lost on refresh/close (no draft-saving — confirmed explicitly out of scope this iteration).

---

## Section 9 — Logic and Calculations

**What is calculated or derived:** No emissions calculation of any kind. Four things are derived or validated automatically:

1. **Scope derivation** — unchanged from v4.0.
2. **Reporting period derivation (CSV import only)** — unchanged from v4.0.
3. **Unit conversion** — unchanged from v4.0. Placeholder `conversion_factor` lookup table, every value 1.0/TBD. Manual entries always resolve to factor 1.0 since the unit is locked to source. CSV rows with an unrecognized raw unit flag to Data Review.
4. **Facility Reporting Period auto-detect and blocking validation (new this iteration):**
   - **Inputs:** the entry's `facility` and the year extracted from its `reporting_period`.
   - **Rule:** query `facility_reporting_period` for a row matching that facility + year.
   - **If a match exists:** set `facility_reporting_period_ref` to that row automatically; the entry may be submitted.
   - **If no match exists:** submission is blocked. Manual entry: user is redirected inline to the Facility Reporting Period form, pre-filled with the facility and year. CSV import: the row is flagged to Data Review with the specific reason "No Facility Reporting Period on file for this facility and year" rather than silently importing unmatched.

**Edge cases:** An Activity Data entry for a facility+year with no Facility Reporting Period record cannot be submitted under any path (manual or CSV) — this is a hard block, not a warning. An unrecognized raw unit on CSV import still routes to Data Review as in v4.0. Manual entries cannot produce the unit edge case, since unit stays locked to source.

---

## Section 10 — Brand and Visual Direction

**Brand reference:** Brand skill file — `C-MORE-brand-style-sheet.md`, unchanged from v4.0, already installed at `.claude/skills/c-more/`.

**Visual feel:** Unchanged — neutrals leading, Deep Blue (#141A32) for identification, Lime (#C0FA00) sparingly for accent, Figtree typography, Off White (#FAFAFA) backgrounds. The new blocked-entry redirect state and the reordered step-1/step-2 navigation use the same card/input/button styling as existing views — no new visual patterns.

---

## Section 11 — API and Credentials

| Service | What it does in this tool | Key required | Where key is stored |
|---------|--------------------------|-------------|-------------------|
| Supabase | Database (Activity Data, Facility Reporting Period tables) | Anon key (public, browser-safe) + Service role key (server-side only, if any server-side function is added later) | Netlify environment variables |

No other external services. No AI API, no email service, this iteration.

**Credentials readiness:**

| Credential | Status | Where to get it |
|-----------|--------|----------------|
| Supabase anon key | Created by Claude Code with the project | Supabase dashboard → Project Settings → API |
| Supabase service role key | Created by Claude Code with the project | Supabase dashboard → Project Settings → API |

---

## Section 12 — Out of Scope — Phase 2

| Deferred feature | Reason it is deferred |
|-----------------|----------------------|
| Email arm — blocked-entry notification | Not requested this iteration; named explicitly so it doesn't slip in unrequested |
| Email arm — missing-facility-data reminder | Not requested this iteration; named explicitly |
| Scheduled Automation — annual reminder if a facility hasn't logged its year | Not requested this iteration; named explicitly |
| Draft-saving for in-progress, unsubmitted entries | Explicitly confirmed out — closing the tab mid-entry still loses that entry, same as before |
| Tool B (EF database + calculation logic + emissions dashboard) | Separate spec, separate build, separate iteration — joins this same `purepastures` Supabase project once built |
| Real conversion_factor values | Still placeholder (1.0/TBD) — unchanged from v4.0, not part of this iteration's scope |
| Reusing the tool's v1.0 Supabase project | Considered and explicitly rejected — new project created instead |
| New emission_source creation procedure | Already deferred (D-8, prior iteration) |
| Editable/dynamic EF frontend | Already deferred (D-7, prior iteration) — belongs to future Tool B |
| Login / user accounts (A2/A3) | Unchanged from prior iterations |
| Role-based category/facility restriction | Unchanged from prior iterations |
| Multi-currency FX conversion | Unchanged from prior iterations |
| Column/value mapping remembered across sessions | Unchanged from prior iterations |
| CSV files beyond a few hundred rows | Unchanged from prior iterations |
| Bulk-editing multiple Data Review rows at once | Unchanged from prior iterations |
| Sanity-range validation on numeric values | Unchanged from prior iterations |
| Edit/delete of persisted records from the frontend | Not requested this iteration — no update/delete RLS policy granted |

---

## Section 13 — Acceptance Criteria

| # | What to verify | Expected result | Done? |
|---|---------------|-----------------|-------|
| 1 | Tool loads with no login | Reachable directly at the Netlify URL, no auth gate | [ ] |
| 2 | Facility Reporting Period form is the first step | New visitor sees Facility Reporting Period before Data Entry | [ ] |
| 3 | Facility Reporting Period entry persists in Supabase | Row appears in `facility_reporting_period` table after submit; still present after page reload | [ ] |
| 4 | Activity Data entry with a matching Facility Reporting Period submits successfully | `facility_reporting_period_ref` is correctly auto-assigned; row persists in `activity_data` | [ ] |
| 5 | Activity Data entry with NO matching Facility Reporting Period is blocked | Submission is prevented; user is redirected inline to Facility Reporting Period form, pre-filled with facility + year | [ ] |
| 6 | Data persists across separate sessions | Facility Reporting Period entered in one session is available to auto-match against an Activity Data entry submitted in a later, separate session (new tab/reload) | [ ] |
| 7 | CSV import flags rows with no matching Facility Reporting Period to Data Review | Row does not silently import; appears in Data Review with the specific reason stated | [ ] |
| 8 | CSV import flags rows with an unrecognized raw unit to Data Review | Unchanged from v4.0 — verified still working | [ ] |
| 9 | Reporting period, scope derivation, and unit conversion still work as in v4.0 | Unaffected by the D3 promotion | [ ] |
| 10 | GDPR consent checkbox blocks submission when reviewer is filled in without consent | Form cannot submit; data statement is shown | [ ] |
| 11 | Both CSV exports include all persisted records, not just the current session | Downloaded files contain records created in earlier sessions | [ ] |
| 12 | RLS policies allow anonymous read/insert, block update/delete | Verified via Supabase dashboard or QA skill | [ ] |
| 13 | Dashboard tab is present and links to a placeholder URL | Unchanged from v4.0 | [ ] |
| 14 | Tool deploys and is accessible | Live Netlify URL loads correctly, no login gate, on desktop and mobile | [ ] |
| 15 | Netlify build succeeds after Claude Code pushes to `main` | Checked manually by the builder in the Netlify dashboard | [ ] |
| 16 | Supabase project is confirmed as new, not the v1.0 project | `docs/supabase-setup.md` records a fresh project ID, distinct from any prior project | [ ] |

---

## Section 14 — Build Path

**This tool's tier:** Tier 2

### Pre-build steps

- [x] Tool Architect skill — interview complete, this spec written and confirmed
- [ ] Project Governor skill — CLAUDE.md and PROGRESS.md updated from this spec
- [x] GitHub repo already exists; Claude Code has direct access via a GitHub MCP connector
- [ ] product-spec.md, CLAUDE.md, PROGRESS.md, DECISIONS.md updated in the GitHub repo root — **including a new DECISIONS.md entry logging the reversal of D-9's D3 deferral before this build starts**
- [x] C-MORE-brand-style-sheet.md already in the GitHub repo root
- [x] Netlify connected to the GitHub repo — confirmed, via Netlify's native integration
- [ ] Confirm no credentials need creating outside Supabase (Claude Code creates Supabase keys itself)

### Tier 2 — build session

- [ ] Open Claude Code in the project folder
- [ ] Claude Code reads product-spec.md, CLAUDE.md, PROGRESS.md, and DECISIONS.md
- [ ] Claude Code proposes the confirmed project name (`purepastures`), waits for confirmation, then creates the project via Supabase MCP — explicitly not the v1.0 project
- [ ] Claude Code builds `activity_data` and `facility_reporting_period` tables and RLS policies via Supabase MCP
- [ ] Claude Code creates `docs/supabase-setup.md`
- [ ] Claude Code reorders the UI: Facility Reporting Period as Step 1, Data Entry as Step 2
- [ ] Claude Code builds the auto-detect/assign logic and the blocking validation + inline redirect
- [ ] Claude Code updates CSV export to pull all persisted records
- [ ] Claude Code adds the GDPR consent checkbox and data statement to the manual entry form and CSV import flow
- [ ] Test locally before deploying, including: cross-session persistence, the blocked-entry redirect, and the no-match CSV import flag
- [ ] Claude Code commits and pushes to `main` — Netlify's native integration deploys automatically
- [ ] Add Supabase environment variables in the Netlify dashboard (Netlify MCP not active)
- [ ] Optional post-build: run Supabase QA skill to verify schema and RLS policies

---

## Section 15 — Open Questions

| Question | Who answers it | Blocking? |
|----------|---------------|-----------|
| When Tool B is built, does it need read-only or read/write access to `activity_data` and `facility_reporting_period`? | Andrea | No — resolve during Tool B's own Tool Architect interview |
| Where will the real conversion_factor values come from, and when will they replace the placeholders? | Andrea | No — carried forward from v4.0, still unresolved |
| Should Facility Reporting Period or Activity Data ever support edit/delete from the frontend, now that data persists? | Andrea | No — explicitly out of scope this iteration |
| Should CSV import eventually support remembering mappings across sessions, now that D3 exists? | Andrea | No — not requested this iteration |

---

## Section 16 — Tool Version History

| Version | Date | What changed in the tool |
|---------|------|--------------------------|
| v1.0 | 2026-07-05 | Initial build — Tier 3, magic-link login, four roles, Supabase persistence, monthly email reminders |
| v2.0 | 2026-07-10 | MVP downgrade to Tier 1 — login removed, persistence removed, role restriction removed, Email and Scheduled Automation arms removed, lookup tables hardcoded |
| v3.0 | 2026-07-11 | Added CSV bulk import (Column Mapping → Value Mapping → Data Review); Scope now derived from source rather than manually entered. Tier remains 1 (D2+A1) |
| v4.0 | 2026-07-14 | Split activity_data_value/unit into raw/converted pairs; added evidence_link and reviewer fields; added unit conversion logic via a placeholder hardcoded conversion_factor table; added Facility Reporting Period entry form and CSV export; added placeholder Dashboard nav tab. Tier remains 1 (D2+A1) — D3/Supabase promotion (Decision Registry G-3) explicitly deferred (D-9) |
| v5.0 | 2026-07-16 | Promoted Data Model D2 → D3 (Tier 1 → Tier 2) — reverses D-9's deferral. Reordered UI: Facility Reporting Period is now Step 1, Data Entry is Step 2. Added auto-detect/assign of Facility Reporting Period to Activity Data by facility + reporting year, with a hard blocking validation and inline redirect when no match exists. CSV exports now cover all persisted records, not session-scoped. Added GDPR consent framework for the `reviewer` field. New Supabase project (`purepastures`) provisioned — explicitly not v1.0's project. Supabase plan: Free (idle-pause trade-off accepted deliberately). This tool becomes the schema-creating tool for a future stack with Tool B. |

---

*This spec is written for Claude Code. It assumes zero prior context.*
