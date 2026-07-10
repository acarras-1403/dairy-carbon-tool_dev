# Product Spec — PurePastures GHG Activity Data Entry Tool (MVP)

**Version:** 2.0
**Date:** 2026-07-10
**Author:** Andrea
**Status:** Confirmed

---

## Section 1 — Tool Summary

**Tool name:** PurePastures GHG Activity Data Entry Tool (MVP)

**What it does:** A single-page form where anyone with the link logs raw GHG activity data (fuel volumes, electricity, headcounts, purchased goods, FLAG farm data, etc.) against a fixed list of categories. Nothing is saved on a server — entries exist only in the browser tab, and the user downloads their own entries as a CSV before closing it. The tool performs no calculation; it only captures and lets the user export what was typed in.

**Who uses it:** AI Lab curriculum participants building and testing the tool at an early stage of the course — not yet deployed for PurePastures Dairy Cooperative's actual four-role staff.

**Why it exists:** Validates the data-entry form and category structure — the core interaction of the eventual GHG inventory tool — without requiring a Supabase account, authentication setup, or any backend, so it fits where the builder currently is in the curriculum.

**Build status:** Iteration. Previous version (v1.0) was a Tier 3 tool with magic-link login, four role-scoped permissions, Supabase persistence, and monthly email reminders. This build strips all of that down to a Tier 1 tool: no login, no database, session-only data, one unrestricted form. See `DECISIONS.md` (D-1 through D-5) for the reasoning behind each removal.

---

## Section 2 — Classification

### Data Model

**Decision:** D2

| Label | What it means | This tool? |
|-------|--------------|-----------|
| D1 — Hardcoded | All data is written into the code by the developer. Users cannot input anything that persists. | No |
| D2 — Session | Data enters the tool during use and disappears when the tab closes. No database. | Yes |
| D3 — Persisted | Data is written to a database and survives after the session ends. Supabase is required. | No |

**Reason:** Per D-2 in `DECISIONS.md`, this build deliberately does not need data to survive past the browser session — it exists to validate the form and category structure, not to collect a real inventory yet.

**D3 triggers — none apply:**
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

**Reason:** Per D-1 in `DECISIONS.md`, login was removed specifically to eliminate Supabase account and OAuth setup friction at this stage of the curriculum. Anyone with the link can open the form and log entries.

---

### Tier

**Tier:** 1

| Tier | D+A combination | This tool |
|------|----------------|-----------|
| 1 | D1+A1 or D2+A1 | ✅ Matches (D2+A1) |

---

### Standalone or Stack

**This tool is:** Standalone — it does not share a database with any other tool. It is no longer "Tool A" in the original G-1/G-4/G-2 stack; that role is deferred until a future, persisted iteration of this tool.

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
| What is exported | All activity-data entries currently held in the browser session (the user's own in-progress list), triggered by a "Download CSV" button. This is the only way data leaves the tool — there is no server-side copy. |
| PDF design intent | Not applicable — CSV only |

---

### Email Arm

**Active:** No

> Dropped per D-4 in `DECISIONS.md`. The original monthly "missing entry" reminder required knowing who was supposed to submit (auth) and checking a persisted record for gaps (database) — neither exists in this build.

---

### Scheduled Automation Arm

**Active:** No

> Dropped per D-4 in `DECISIONS.md`, for the same reason as the Email arm above — no persisted record exists to check against.

---

## Section 4 — Stack and Deployment

### All Tiers

| Detail | Answer |
|--------|--------|
| Frontend framework | React + Vite + Tailwind |
| Deployment target | Netlify |
| Netlify MCP | Not active — Netlify is connected to the GitHub repo via Netlify's own native integration (not Claude). Every push to `main` auto-deploys; Claude Code does not create the site or trigger deploys itself. |

**GitHub:** Already done — the builder has an existing GitHub repo for this project, and Claude Code has direct repo access via a GitHub MCP connector (can read, commit, and push to it directly rather than the builder pushing manually). `product-spec.md`, `CLAUDE.md`, `PROGRESS.md`, `DECISIONS.md`, and `C-MORE-brand-style-sheet.md` should be uploaded to the repo root — either by the builder or by Claude Code itself via its GitHub access, before the build session's work begins.

**Supabase project:** Not applicable — this is a Tier 1 tool. No database, no Supabase account, no MCP database setup required.

---

## Section 5 — Data Architecture

### Not applicable — Data Model is D2, not D3

No database tables are created. All data structures below exist only as in-memory state in the browser during the session.

**In-session data shape (for Claude Code's reference — not a database schema):**

| Field name | Plain language label | Data type | Who provides it | Required? |
|-----------|---------------------|-----------|----------------|-----------|
| reporting_period | Reporting period (e.g. 2026-07) | Text/Date | User | Yes |
| facility | Facility | Selection, from a hardcoded list | User | Yes |
| scope, category, subcategory, source | GHG scope / category / subcategory / emission source | Selection, from a hardcoded list (all categories, no role restriction) | User | Yes |
| activity_data_value | Activity data value | Number | User | Yes |
| activity_data_unit | Unit | Text, auto-filled from the selected source's hardcoded entry | Automatic | Yes |
| data_quality_rating | Data quality | Selection (measured / calculated / estimated / proxy) | User | Yes |
| notes | Notes | Text | User | No |

**Hardcoded lookup lists (per D-5 in `DECISIONS.md`):** scope, category, subcategory, emission source, facility, and unit values are written directly into the app's source code as static arrays — carried over from v1.0's `dim_scope`, `dim_category`, `dim_subcategory`, `dim_emission_source`, and `dim_facility` tables, flattened into config rather than database rows. Changing any of these values requires editing the code and redeploying; there is no in-app admin view for this.

**File storage:** No

**Derived or calculated data:** No — this tool stores only raw, self-reported activity data for the duration of the session.

---

## Section 6 — Access and Permissions

### Not applicable — Access Model is A1, no login, no RLS

Anyone with the link can view and fill out the full form — all categories, all facilities, no restriction. There is no way to distinguish one user's entries from another's beyond what they type into the (optional) notes field.

---

## Section 7 — GDPR

**GDPR outcome:** Not applicable — no personal data (name, email, or any identifiable information) is collected through this tool's form. There is no login and no field asking for a submitter's identity.

---

## Section 8 — Screen and UI Structure

### Data Entry Form

- **Purpose:** Let anyone log one or more activity-data entries during their session and export them before leaving.
- **What is visible:** A form with: reporting period, facility (dropdown, hardcoded list), scope/category/subcategory/source (cascading dropdowns, hardcoded list, full unrestricted set), activity data value, unit (auto-filled from the selected source), data quality rating (dropdown), notes (optional text). Below the form, a running table of entries added so far in this session, with a "Download CSV" button.
- **User actions:** Fill out and submit an entry (adds it to the session table, does not persist anywhere), remove an entry from the session table before export, download all current session entries as CSV.
- **What happens next:** New entries appear immediately in the on-page table. Refreshing or closing the tab clears everything not yet exported.

---

## Section 9 — Logic and Calculations

Not applicable — this tool performs no calculation. Activity data is captured exactly as entered and exported as-is.

---

## Section 10 — Brand and Visual Direction

**Brand reference:** Brand skill file — `C-MORE-brand-style-sheet.md`, uploaded flat to the repo root; Claude Code installs it to `.claude/skills/` in First Session Setup.

**Visual feel:** Neutrals leading, Deep Blue (#141A32) for identification, Lime (#C0FA00) sparingly for accent, Figtree typography, Off White (#FAFAFA) backgrounds — unchanged from v1.0.

---

## Section 11 — API and Credentials

No external services. No API keys, no credentials, no environment variables beyond what Netlify itself requires for deployment.

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
| File uploads | Not needed — all entry is manual, typed values |

---

## Section 13 — Acceptance Criteria

| # | What to verify | Expected result | Done? |
|---|---------------|-----------------|-------|
| 1 | Form loads with no login | Tool is reachable directly at the Netlify URL, no auth gate | [ ] |
| 2 | All category/facility dropdowns show the full hardcoded list | No restriction by role or facility — every option visible to every visitor | [ ] |
| 3 | Submitting an entry adds it to the on-page session table | New row appears immediately with all entered fields | [ ] |
| 4 | Refreshing the page clears all entries | Confirms no persistence exists anywhere | [ ] |
| 5 | Download CSV produces a correct file | CSV contains all current session entries with correct headers and values | [ ] |
| 6 | Tool deploys and is accessible | Live Netlify URL loads correctly, no login gate, on desktop and mobile | [ ] |
| 7 | Netlify build succeeds after Claude Code pushes to `main` | Checked manually by the builder in the Netlify dashboard — Claude Code has no visibility into Netlify (MCP not active) and cannot confirm this itself. A failed build (wrong publish directory, missing build command, dependency issue) will not be caught or reported by Claude Code. | [ ] |

---

## Section 14 — Build Path

**This tool's tier:** Tier 1

### Pre-build steps

- [x] Tool Architect skill — interview complete, this spec written and confirmed
- [ ] Project Governor skill — CLAUDE.md and PROGRESS.md produced from this spec
- [x] GitHub repo created by the builder — already exists; Claude Code has direct access via a GitHub MCP connector
- [ ] product-spec.md, CLAUDE.md, PROGRESS.md, DECISIONS.md uploaded to the GitHub repo root (Claude Code can do this itself via its GitHub access, or the builder can upload manually)
- [ ] C-MORE-brand-style-sheet.md uploaded to the GitHub repo root
- [x] Netlify connected to the GitHub repo — confirmed, via Netlify's native integration (not MCP); push to `main` auto-deploys

### Tier 1 — build session

- [ ] Open Claude Code in the project folder
- [ ] Claude Code runs First Session Setup: creates docs/, moves reference files, installs the C-MORE brand skill
- [ ] Claude Code reads product-spec.md, CLAUDE.md, PROGRESS.md, and DECISIONS.md
- [ ] Claude Code builds the tool (single-page form, session state, CSV export)
- [ ] Test locally before deploying
- [ ] Claude Code commits and pushes to `main` via its GitHub access — Netlify's native integration detects the push and deploys automatically. No environment variables are needed for this Tier 1 build (Section 11 — no external services).

---

## Section 15 — Open Questions

| Question | Who answers it | Blocking? |
|----------|---------------|-----------|
| When this MVP is validated, does it get promoted back toward the original Tier 3 spec (v1.0), or does the curriculum move to a fresh design? | Andrea | No — can be resolved after this build ships |
| Exact hardcoded category/subcategory/source/facility list content — v1.0's `dim_*` table contents can be reused as the starting hardcoded list; confirm no changes are needed before Claude Code writes them into code | Andrea | No — can be confirmed during the build session |

---

## Section 16 — Tool Version History

| Version | Date | What changed in the tool |
|---------|------|--------------------------|
| v1.0 | 2026-07-05 | Initial build — Tier 3, magic-link login, four roles, Supabase persistence, monthly email reminders |
| v2.0 | 2026-07-10 | MVP downgrade to Tier 1 — login removed, persistence removed, role restriction removed, Email and Scheduled Automation arms removed, lookup tables hardcoded. See D-1 through D-5 in `DECISIONS.md` |

---

*This spec is written for Claude Code. It assumes zero prior context.*
