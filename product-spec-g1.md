# Product Spec — PurePastures GHG Data Entry Tool

**Version:** 1.1
**Date:** 2026-07-10
**Author:** Andrea
**Status:** Confirmed

---

## Section 1 — Tool Summary

**Tool name:** PurePastures GHG Data Entry Tool

**What it does:** A role-based tool where staff log raw GHG activity data (fuel volumes, electricity, headcounts, purchased goods, FLAG farm data, etc.) by category. It performs no calculation — activity data is stored as entered, and a separate tool (G-4) later calculates emissions from it.

**Who uses it:** Four named roles at PurePastures Dairy Cooperative — Plant Ops Manager, Farm Liaison Officer, Finance Team, Sustainability Analyst.

**Why it exists:** Gives each role a scoped, auditable way to log the activity data behind the company's GHG inventory, with full traceability preserved for the calculation and dashboard tools that read from it.

**Build status:** First build. This tool creates the shared Supabase project ("purepastures-ghg") used by the rest of the stack (G-4 calculation tool, G-2 dashboard).

---

## Section 2 — Classification

### Data Model

**Decision:** D3

| Label | This tool? |
|-------|-----------|
| D1 — Hardcoded | No |
| D2 — Session | No |
| D3 — Persisted | Yes |

**Reason:** Multiple roles submit activity data over many months; it must persist, be visible to the Sustainability Analyst for review, and be readable by downstream tools (G-4, G-2).

**D3 triggers — checked:**
- [x] Data must be retrievable after the session ends
- [x] Multiple sessions contribute to the same dataset
- [x] An audit trail or history is needed
- [x] Data submitted by one person must be visible to another (Sustainability Analyst sees all)
- [x] Results must be accessible via a URL after the session ends
- [ ] Files uploaded by users must be stored and retrievable later (not applicable — no file uploads in this tool)

---

### Access Model

**Decision:** A3

| Label | This tool? |
|-------|-----------|
| A1 — Public | No |
| A2 — Authentication | No |
| A3 — Authorization | Yes |

**Reason:** Four distinct roles with different data-entry permissions and different facility scopes — not a single shared view.

---

### Tier

**Tier:** 3

| Tier | D+A combination | This tool |
|------|----------------|-----------|
| 3 | D3+A3 | ✅ Matches |

---

### Standalone or Stack

**This tool is:** Part of a stack — see Section 4. This tool creates the Supabase project shared with G-4 (calculation) and G-2 (dashboard).

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
| What is exported | Activity data records. Sustainability Analyst exports all records company-wide; other roles export only the records they are permitted to see (their own facility/category scope) |
| PDF design intent | Not applicable — CSV only |

---

### Email Arm

**Active:** Yes

| Detail | Answer |
|--------|--------|
| Trigger event | Monthly scheduled check finds a role has not logged expected activity data for the current reporting period |
| Recipient | The staff member(s) assigned to that role/facility combination |
| Email content | States which reporting period is due, and which categories are still missing entries, with a link to the tool |
| File attachment in transit | No |
| Function placement | Triggered by the Scheduled Automation arm below (Supabase Edge Function, database-triggered) |

---

### Scheduled Automation Arm

**Active:** Yes

| Detail | Answer |
|--------|--------|
| Schedule | Monthly — first day of each month |
| What happens automatically | Checks each role/facility combination for missing activity-data entries in the just-closed reporting period; triggers a reminder email for any gaps found |
| Triggers an email | Yes |
| Triggers a database update | Yes — logs each reminder sent to `entry_deadline_reminder_log`, to avoid duplicate sends |

---

## Section 4 — Stack and Deployment

### All Tiers

| Detail | Answer |
|--------|--------|
| Frontend framework | React + Vite + Tailwind |
| Deployment target | Netlify |
| Netlify MCP | Active — Claude Code will create the site, set environment variables, and deploy automatically |

> **Corrected post-v1.0 build (see D-4, no version bump — build mechanics, not tool behavior):** This environment does not have a Supabase MCP. Database schema, RLS, auth config, and seed data are created via the **Supabase Management API** (`https://api.supabase.com`), authenticated with a **personal access token (PAT)** the builder generates and provides to Claude Code at the start of the session. The PAT is used transiently to authenticate API calls and must not be written to any file, committed, or stored outside the session — confirm this with Claude Code if unsure.
>
> **No GitHub repo is used or required.** Netlify MCP deploys directly from the local project folder to Netlify's build system — there is no intermediate git repo, and `gh` CLI / git identity are not assumed to exist in this environment. `product-spec.md`, `CLAUDE.md`, `PROGRESS.md`, `DECISIONS.md`, and the brand style sheet live in the local project folder, not a repo root.
>
> **Stack handoff without a shared repo:** Because there's no GitHub repo connecting the stack's tools, `docs/supabase-setup.md` (created by G-1's build) is a **local file only** — it does not automatically become visible to G-4's or G-2's build sessions. The builder must manually copy `docs/supabase-setup.md` into each subsequent tool's project folder before that tool's build session starts. This applies to G-4 and G-2's own specs as well — write them assuming this manual carry-forward step, not automatic discovery via a repo.

---

### Supabase project — Tier 3

**Supabase project status:** Created during the v1.0 build — project `purepastures-ghg`, ref `uioxedvoaqtijtrvzxzl`. ~~Claude Code will create it at the start of the build session, via Supabase MCP, after a one-time browser-based login/authorization from the builder~~ *(corrected — see D-4: created via Supabase Management API + PAT, not MCP/OAuth. This section is retained for G-4/G-2, whose specs should describe connecting to this existing project rather than creating a new one.)*

**Supabase plan:** Free — acceptable given expected regular (at least monthly, likely more frequent) data-entry activity across four roles.

| Detail | Answer |
|--------|--------|
| Proposed project name | purepastures-ghg |
| Confirmed project name | purepastures-ghg |

> Recorded here for the historical record: the project name `purepastures-ghg` was confirmed and the project created via the Supabase Management API + PAT (not MCP, see correction above). The project ref is `uioxedvoaqtijtrvzxzl`, recorded in `docs/supabase-setup.md` — see the Section 4 note on manually carrying that file forward to G-4/G-2.

---

### Stack

**Stack name / Supabase project name:** purepastures-ghg

**This tool's role in the stack:** Tool A — creates the Supabase schema; role-based activity data entry

**Other tools in this stack:**

| Tool | Tier | Role in the stack |
|------|------|------------------|
| PurePastures GHG Data Entry Tool (G-1, this spec) | 3 | Tool A — creates the schema; activity data entry |
| G-4 (calculation tool) | Not yet specced | Tool B — reads activity data, writes calculated emissions to fact_emissions |
| PurePastures Emissions Dashboard (G-2) | 3 | Tool C — read-only display, drill-down, export, email reminders |

> **Build order:** G-1 builds first and creates the Supabase project and `docs/supabase-setup.md`. G-4 builds second, reading `docs/supabase-setup.md` and adding the `fact_emissions` table it needs. G-2 builds last, reading the same file, and must not start until G-4 has populated `fact_emissions` at least once.

---

## Section 5 — Data Architecture

### Data Model is D3

**What data is collected or stored in this tool:**

| Field name | Plain language label | Data type | Who provides it | Required? |
|-----------|---------------------|-----------|----------------|-----------|
| reporting_period | Reporting period (e.g. 2026-07) | Text/Date | Automatic (selected by user from current/past periods) | Yes |
| reporting_unit_id | Reporting unit | Selection | Automatic (restricted to the user's assigned facility, where applicable) | Yes |
| facility_id | Facility | Selection | Automatic (restricted to the user's assigned facility, where applicable) | Yes |
| category_id, subcategory_id, source_id | GHG category / subcategory / emission source | Selection from lookup tables | User (restricted to their role's permitted categories) | Yes |
| activity_data_value | Activity data value | Number | User | Yes |
| activity_data_unit | Unit | Text (auto-filled from the selected source) | Automatic | Yes |
| data_quality_rating | Data quality | Selection (measured / calculated / estimated / proxy) | User | Yes |
| notes | Notes | Text | User | No |
| entered_by_user_id | Entered by | Automatic (auth.uid()) | Automatic | Yes |
| requires_review, flag_reason | Review flag | Boolean + text | Sustainability Analyst (or automatic rule, e.g. missing value, unparseable date, out-of-scope value on bulk import — see D-2) | No |
| import_batch_id | Import batch (null if manually entered) | UUID, nullable FK to import_batch_log | Automatic, set only on bulk-uploaded rows | No |
| login email | Staff login email | Text (Supabase Auth) | Staff member, at invite/signup | Yes |

**Tables needed:**

| Table name | What it stores | Key fields |
|-----------|---------------|-----------|
| dim_scope | Scope 1/2/3 lookup | scope_id, scope_name |
| dim_category | GHG Protocol category lookup | category_id, scope_id, category_name |
| dim_subcategory | Category-specific grouping labels | subcategory_id, category_id, subcategory_name |
| dim_emission_source | Emission sources with FLAG/out-of-scope/traceability attributes | source_id, flag_inventory_flag, flag_subtype, out_of_scope_type, lifecycle_traceability_scenario |
| dim_emission_factor | Emission factors per source (used later by G-4) | emission_factor_id, source_id, factor_value, factor_unit, database_source, version |
| dim_methodology | Calculation methodology and unit conversion per source (used later by G-4) | method_id, source_id, formula, unit_conversion_factor, amortization_period_years |
| dim_reporting_unit | Reporting units (islands/plants) | reporting_unit_id, reporting_unit_name |
| dim_facility | Facilities | facility_id, reporting_unit_id, facility_name |
| dim_activity_data | One row per logged activity-data entry | activity_id, reporting_period, source_id, activity_data_value, activity_data_unit, entered_by_user_id, data_quality_rating, requires_review, import_batch_id |
| user_roles | Maps each authenticated user to a role and facility scope | user_id, role_name, assigned_facility_id (null for company-wide roles) |
| entry_deadline_reminder_log | One row per reminder email sent, to prevent duplicate sends | id, user_id, reporting_period, sent_at |
| import_batch_log | One row per bulk CSV upload (added v1.1, see D-1) | import_batch_id, uploaded_by_user_id, file_name, uploaded_at, row_count_total, row_count_flagged, row_count_duplicate_warned |

**File storage:** No

**Derived or calculated data:** No — this tool stores only raw activity data. `dim_emission_factor` and `dim_methodology` are lookup/reference tables (needed later by G-4), not calculated from this tool's data.

---

## Section 6 — Access and Permissions

### Access Model is A3

**Auth configuration:**

| Detail | Answer |
|--------|--------|
| Authentication method | Magic link |
| Signup model | Invite-only — builder invites specific staff via Supabase dashboard, and assigns their role/facility in `user_roles` at invite time |

> **Privacy note:** User accounts store email addresses. For this internal tool, this falls under the organization's existing privacy framework rather than a consent flow.

**RLS rules:**

| Table | User type | Can read | Can insert | Can update | Can delete |
|-------|----------|----------|------------|------------|------------|
| dim_* lookup tables (scope, category, subcategory, emission_source, emission_factor, methodology, reporting_unit, facility) | Unauthenticated | No | No | No | No |
| dim_* lookup tables | Authenticated (any role) | All rows | No | No | No |
| dim_activity_data | Unauthenticated | No | No | No | No |
| dim_activity_data | Plant Ops Manager | Own facility, combustion/electricity/refrigerant/waste categories only | Yes (same scope) | Yes (own entries, same scope) | No |
| dim_activity_data | Farm Liaison Officer | Own facility, FLAG farm categories only | Yes (same scope) | Yes (own entries, same scope) | No |
| dim_activity_data | Finance Team | All facilities, purchased goods/packaging categories only | Yes (same scope) | Yes (own entries, same scope) | No |
| dim_activity_data | Sustainability Analyst | All rows, all facilities, all categories | Yes | Yes (any row) | Yes |
| user_roles | Authenticated (any role) | Own row only | No | No | No |
| user_roles | Sustainability Analyst | All rows | No (managed via Supabase dashboard at invite time) | No | No |
| entry_deadline_reminder_log | Authenticated (any role) | No | No | No | No |
| entry_deadline_reminder_log | Sustainability Analyst | All rows | No | No | No |
| entry_deadline_reminder_log | Service role (Edge Function) | All rows | Yes | No | No |
| import_batch_log | Authenticated (any role) | Own uploads only | Yes (on bulk upload) | No | No |
| import_batch_log | Sustainability Analyst | All rows | No | No | No |

> **Bulk-upload insert note (v1.1, see D-1/D-2):** Bulk-uploaded rows insert through the same RLS policies as manual entries — a role cannot insert `dim_activity_data` rows outside its own `facility_id`/`category_id` scope regardless of upload method. Rows that fail row-level validation (unparseable date, missing required field) or whose values fall outside the uploader's permitted scope are still inserted, but with `requires_review = true`, so they land in the existing Review Queue rather than being silently dropped or blocking the rest of the file. Validity flagging is enforced by application logic at insert time, not by a database constraint — see D-2's Limitation for what this does and doesn't guarantee.

---

## Section 7 — GDPR

**GDPR outcome:** Applies.

**Personal data collected:** Staff login email addresses (via Supabase Auth, at invite/signup)

**Consent checkpoint on the form:** Not a public form — invite-only, but the statement below is provided to each invited staff member regardless.

**Data statement:**
> Your login email is used only to authenticate you and send data-entry reminders for this inventory. You can request deletion at any time by contacting andrea@andrea.com.

**Deletion mechanism:** Requests go to andrea@andrea.com. Until an automated process exists, account removal and any associated data cleanup are handled manually.

---

## Section 8 — Screen and UI Structure

### Login (Magic Link)

- **Purpose:** Authenticate invited staff.
- **What is visible:** Email input, "Send magic link" button.
- **User actions:** Enter email, request link.
- **What happens next:** User clicks the emailed link and is redirected into the tool, landing on the Data Entry view appropriate to their role.

### Data Entry

- **Purpose:** Log a new activity-data record, and review past entries.
- **What is visible:** A form to log a new entry (period, category/subcategory/source restricted to the role's permitted set, facility pre-filled/locked for facility-scoped roles, value, unit auto-filled, data quality rating, notes). Below it, a history table of the user's own past entries for the current and prior periods.
- **User actions:** Submit a new entry, edit their own past entries, export their own data as CSV.
- **What happens next:** New entry appears in the history table and becomes visible to the Sustainability Analyst.

### Bulk Upload (v1.1, see D-1)

- **Purpose:** Let staff import raw activity data from a CSV export (e.g. supplier fuel invoices) instead of typing each row manually.
- **Category scope for v1.1:** Fuel/combustion and electricity categories only. FLAG farm data and purchased goods remain manual-entry-only until a future iteration extends column mapping to those category shapes (deferred, see Section 12).
- **Access:** All four roles, each restricted to their existing facility/category permissions (same scope as manual Data Entry) — a Plant Ops Manager's bulk upload is still confined to their facility's combustion/electricity categories, etc.
- **What is visible:** A CSV file picker. After upload, a column-mapping screen auto-suggests a match between each raw column and a tool field (date, site/facility reference, fuel type/source, quantity, unit, data-quality rating, supplier, notes), which the user reviews and can adjust before confirming. After confirmation, an import summary: rows imported cleanly, rows flagged for review (with reason), rows warned as possible duplicates.
- **User actions:** Upload a CSV, adjust the suggested column mapping, confirm import, review the import summary, choose to proceed past a duplicate warning or cancel that row.
- **What happens next:** Clean rows appear immediately in the user's Data Entry history table, same as a manual entry. Flagged rows (unparseable date, missing required value, out-of-scope facility/category, or unresolved unit) go to the Sustainability Analyst's Review Queue with `requires_review = true` and a `flag_reason`. Duplicate-warned rows the user chose to import anyway are inserted normally but noted in the import summary and `import_batch_log` for traceability.
- **Validation and normalization applied on import (not emissions calculation — see Section 9):**
  - Date parsing accepts multiple common formats (e.g. `DD/MM/YYYY`, `YYYY-MM-DD`, `DD-MM-YYYY`) and normalizes to a single stored format; a row whose date cannot be parsed is flagged, not dropped.
  - Blank `data_quality_rating` values are flagged for review rather than defaulted silently — data quality is a required field per Section 5 and must not be guessed.
  - Unit conversion: if the raw file's unit differs from the tool's canonical unit for that emission source (e.g. gallons vs. litres), the value is converted at import time to the canonical unit; the conversion factor and source unit are recorded in `notes` for traceability.
  - Duplicate check: rows matching an existing `purchase_id` + `site_reference` combination already in `dim_activity_data` are flagged in the import summary as possible duplicates before the user confirms (see D-3).

---

### Review Queue (Sustainability Analyst only)

- **Purpose:** See and resolve all flagged records, across every role and facility.
- **What is visible:** A table of all `dim_activity_data` rows where `requires_review` is true, with role/facility/category context and the flag reason.
- **User actions:** Edit any record, mark a flag as resolved, export the full company-wide dataset as CSV.
- **What happens next:** Resolved records drop off the queue.

---

## Section 9 — Logic and Calculations

No emissions calculation is performed by this tool — that remains G-4's job by design (see D-9 referenced in Section 12).

**v1.1 addition (see D-1):** Bulk CSV upload performs unit *normalization*, not emissions calculation — e.g. converting a raw file's gallons to the tool's canonical litres for that emission source, using a fixed conversion factor. This is data-entry-time normalization of activity data into a consistent unit, the same category of transformation a person would do by hand when manually typing a value into the form. It does not compute co2e, does not apply an emission factor, and does not touch `dim_emission_factor` or `dim_methodology` — those remain exclusively G-4's inputs. Activity data, once normalized to its canonical unit, is still stored exactly as entered otherwise.

---

## Section 10 — Brand and Visual Direction

**Brand reference:** Brand skill file — `C-MORE-brand-style-sheet.md`, uploaded flat to the repo root; Claude Code installs it to `.claude/skills/` in First Session Setup.

**Visual feel:** Same as G-2 — neutrals leading, Deep Blue (#141A32) for identification, Lime (#C0FA00) sparingly for accent, Figtree typography, Off White (#FAFAFA) backgrounds.

---

## Section 11 — API and Credentials

| Service | What it does in this tool | Key required | Where key is stored |
|---------|--------------------------|-------------|-------------------|
| Supabase | Database, Auth | Anon/publishable key (`sb_publishable_…`) for the frontend; Management API personal access token (`sbp_…`) for build-time schema/RLS/seed work | Anon key → Netlify build env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`). PAT → used transiently during the build session only, never written to a file |
| Resend | Email arm (monthly deadline reminders) | API key | Supabase Edge Function secret (database-triggered) |

**Credentials readiness:**

| Credential | Status | Where to get it |
|-----------|--------|----------------|
| Supabase account | Done (v1.0 build) | supabase.com |
| Supabase anon/publishable key | Created (v1.0 build) | Supabase dashboard → Project Settings → API |
| Supabase Management API PAT | Generated per-session by the builder, not stored | Supabase dashboard → Account → Access Tokens |
| Resend API key | Needs creating | Resend dashboard |

> Both the Supabase account and Resend account are pre-build tasks the builder must complete — the Email arm will not function until the Resend key exists. The Management API PAT is generated fresh by the builder at the start of each build session that needs schema-level access (G-4, and G-2 if it needs migrations) and is not reused from G-1's session.

---

## Section 12 — Out of Scope — Phase 2

| Deferred feature | Reason it is deferred |
|-----------------|----------------------|
| Any calculation of emissions | Belongs to G-4, a separate tool by design (see D-9) |
| Any results/dashboard display | Belongs to G-2 |
| In-app role/facility assignment UI | Roles assigned manually via Supabase dashboard at invite time — simpler than building an admin UI for a four-role tool |
| AI features | Not needed for first build |
| Bulk upload for FLAG farm data and purchased goods categories | Deferred — different field shapes than fuel/combustion and electricity, no sample data available yet to validate a mapping design against (see D-1) |
| Excel (.xlsx) upload support | Deferred — v1.1 bulk upload is CSV-only |
| Saved per-source column-mapping templates | Deferred — v1.1 requires confirming the auto-suggested mapping on every upload; templates would skip that step for recurring sources but add state to manage |

---

## Section 13 — Acceptance Criteria

| # | What to verify | Expected result | Done? |
|---|---------------|-----------------|-------|
| 1 | Login screen sends a working magic link | Staff member receives email, clicking it logs them in | [ ] |
| 2 | Plant Ops Manager sees only their facility's combustion/electricity/refrigerant/waste categories | Restricted category list and facility lock confirmed in the form | [ ] |
| 3 | Farm Liaison Officer sees only their facility's FLAG categories | Restricted category list confirmed | [ ] |
| 4 | Finance Team sees purchased goods/packaging company-wide | No facility restriction, correct category list | [ ] |
| 5 | Sustainability Analyst sees and can edit all data | Review Queue shows all flagged records across roles/facilities | [ ] |
| 6 | New activity-data entry saves correctly | Row appears in dim_activity_data with entered_by_user_id set | [ ] |
| 7 | CSV export respects role scope | Non-Analyst roles' export contains only their permitted data | [ ] |
| 8 | Monthly deadline check runs | Scheduled job identifies missing entries per role/facility for the closed period | [ ] |
| 9 | Reminder email sends, no duplicates | Email received once per gap per period; second run doesn't re-send | [ ] |
| 10 | RLS enforced | A Plant Ops Manager's client cannot read another facility's rows even via direct query | [ ] |
| 11 | Tool deploys and is accessible | Live Netlify URL loads correctly, login-gated | [ ] |
| 12 | Bulk CSV upload scoped correctly | Only fuel/combustion and electricity categories are offered for bulk upload; FLAG farm data and purchased goods show manual entry only | [ ] |
| 13 | Column auto-mapping suggests correctly, user can adjust | Uploading `purepasturesrawfuelextract.csv`-shaped data suggests a sensible mapping; user can remap any column before confirming | [ ] |
| 14 | Multi-format date parsing | Rows with `DD/MM/YYYY`, `YYYY-MM-DD`, and `DD-MM-YYYY` dates in the same file all parse correctly | [ ] |
| 15 | Blank data-quality rows flagged, not defaulted | A row with no `data_quality_raw` value is inserted with `requires_review = true`, not silently defaulted | [ ] |
| 16 | Out-of-scope rows flagged, not dropped or blocking | A row outside the uploader's facility/category scope still imports with `requires_review = true`; the rest of the file still imports | [ ] |
| 17 | Unit conversion applied and traceable | A raw value in a non-canonical unit is converted correctly, with the original unit and conversion factor recorded in `notes` | [ ] |
| 18 | Duplicate warning, not blocking | Re-uploading a file with a `purchase_id` + `site_reference` combination already in `dim_activity_data` warns the user but allows them to proceed | [ ] |
| 19 | Import audit trail | Each bulk upload creates one `import_batch_log` row with accurate `row_count_total`, `row_count_flagged`, `row_count_duplicate_warned` | [ ] |
| 20 | RLS holds on bulk insert | A role cannot bulk-import rows outside its own facility/category scope even by editing the mapped values before confirming | [ ] |

---

## Section 14 — Build Path

**This tool's tier:** Tier 3

### Pre-build steps

- [x] Tool Architect skill — interview complete, this spec written and confirmed
- [x] Builder creates a Supabase account
- [ ] Builder creates a Resend account (not yet done)
- [x] Project Governor skill — CLAUDE.md and PROGRESS.md produced from this spec
- [x] Builder generates a Supabase Management API personal access token (PAT) to provide at the start of the build session — *(corrected, see D-4: no GitHub repo step; no Supabase MCP/OAuth step)*

> **No GitHub repo step.** This environment deploys directly from the local project folder to Netlify via Netlify MCP — there is no git repo in the path. `product-spec.md`, `CLAUDE.md`, `PROGRESS.md`, `DECISIONS.md`, and the brand style sheet stay in the local project folder.

### Tier 3 — build session (corrected, see D-4)

- [x] Open Claude Code in the project folder
- [x] Claude Code runs First Session Setup: creates docs/, moves reference files, installs the C-MORE brand skill
- [x] Claude Code reads product-spec.md, CLAUDE.md, and PROGRESS.md
- [x] Builder provides a Supabase Management API PAT when prompted by Claude Code (transient use only — never written to a file; generate a fresh one per session)
- [x] Claude Code proposes the project name "purepastures-ghg", waits for confirmation, creates it via the Supabase Management API
- [x] Claude Code builds all tables, RLS policies, and Auth configuration via the Supabase Management API
- [x] Claude Code creates docs/supabase-setup.md (local file — builder must manually copy this into G-4's and G-2's project folders before those build sessions start)
- [x] Claude Code builds the frontend (Login, Data Entry, Review Queue)
- [ ] Bulk Upload screen (v1.1 addition — not yet built, see D-1/D-2/D-3)
- [x] Test locally before deploying
- [x] Claude Code sets environment variables and deploys automatically (Netlify MCP active)
- [ ] Optional post-build: run Supabase QA skill to verify schema, RLS, and auth configuration

---

## Section 15 — Open Questions

| Question | Who answers it | Blocking? |
|----------|---------------|-----------|
| Resend account does not yet exist | Andrea | No — build can proceed without it; Email arm won't function until it's added |
| G-4's own spec has not been written | Andrea | Yes — must resolve before G-4's build, not before G-1's |
| Exact list of invited staff emails and their role/facility assignments | Andrea | No — can be provided at invite time, after the build |
| `docs/supabase-setup.md` must be manually copied into G-4's project folder before G-4's build session (no shared repo, see D-4) | Andrea | Yes — must resolve before G-4's build session starts |
| Bulk Upload screen (v1.1, D-1/D-2/D-3) has not yet been built against the live project | Andrea | No — can be a follow-up build session against the existing Supabase project |

---

## Section 16 — Tool Version History

| Version | Date | What changed in the tool |
|---------|------|--------------------------|
| v1.0 | 2026-07-05 | Initial build |
| v1.1 | 2026-07-10 | Added bulk CSV upload for fuel/combustion and electricity categories, with auto-suggested column mapping, multi-format date parsing, import-time unit normalization, Review Queue routing for flagged rows, and non-blocking duplicate warnings. See D-1, D-2, D-3 in DECISIONS.md. |

> **Note (no version bump):** Sections 4, 11, 14, and 15 were corrected on 2026-07-10 to reflect the actual v1.0 build environment (Supabase Management API + PAT instead of MCP/OAuth; no GitHub repo; direct local-to-Netlify deploy). This is a documentation correction, not a change in tool behavior — see D-4 in DECISIONS.md.

---

*This spec is written for Claude Code. It assumes zero prior context.*
