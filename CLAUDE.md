# PurePastures GHG Activity Data Entry Tool

## Identity
A single-page tool where anyone with the link logs raw GHG activity data — manually through a form, or in bulk via CSV upload with column/value mapping — plus annual Facility Reporting Period data per facility, now entered first. Data persists in Supabase; no login required.
Tier: 2 — public tool, no login, data persists in a database and survives closed tabs and separate sessions (D3+A1)
Spec version governed: v5.0 — the version of docs/product-spec.md these rules were derived from.
Position: Tool 1 of 2 in the purepastures stack — shares the Supabase project with the future Tool B (EF database + calculation logic + emissions dashboard); this tool creates the schema.

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

First Session Setup (session 1 only — already complete for this project from prior iterations; kept here for the recreate rule):
1. Create docs/ and move product-spec.md into it.
2. Install the brand skill: create .claude/skills/c-more/ and place the provided C-MORE-brand-style-sheet.md there as SKILL.md.
3. Announce what moved, then commit and push before building anything.

PROGRESS.md structure (for the recreate rule): status header (Session / Last updated / Live URL), Current state, Last session, Remaining work, Build decisions, Known issues, Notes for next session.

## Commands
```
npm install
npm run dev
npm run build
```

## Tech Stack
React · Vite · Tailwind CSS · Netlify · Supabase
Deployment: GitHub → Netlify, auto-deploys from main. Netlify MCP is not active — the repo is already connected via Netlify's native integration; environment variables are entered manually in the Netlify dashboard before the first deploy of this iteration's changes.

## Arms
Export — browser only, no server function — two separate CSV downloads: all Activity Data records ever entered into the database (unresolved Data Review rows excluded), and all Facility Reporting Period records ever entered. Both now pull all persisted records, not session-scoped.

## Environment Variables
VITE_SUPABASE_URL — Supabase: Project Settings → API → Project URL — Netlify env var
VITE_SUPABASE_ANON_KEY — Supabase: Project Settings → API → anon / public key — Netlify env var

Key storage follows function placement: this tool has no server-side functions, so both variables are read directly by the frontend via Vite's VITE_ prefix. No value ever appears in code or in any file committed to GitHub.

## Supabase
Project: "purepastures" — does not exist yet. At the start of the next build session, confirm this name with the builder, then create the project via Supabase MCP before building anything. Region: EU (Frankfurt) — GDPR applies (see Hard Rules). Plan: Free — pauses after ~1 week without traffic; this trade-off was chosen deliberately (Decision Registry D-15) and is not an oversight — flag to the builder if the live tool shows connection errors after an idle period.

Build this schema — authoritative until docs/supabase-setup.md exists:
activity_data: reporting_period, facility, emission_source, activity_data_value_raw, activity_data_unit_raw, activity_data_value_converted, activity_data_unit_converted, data_quality_rating, notes, evidence_link, reviewer, facility_reporting_period_ref (FK to facility_reporting_period), created_at
facility_reporting_period: facility, reporting_year, facility_country, production_volume, annual_revenue, created_at

RLS — build these policies, never skip:
activity_data: anon — read all rows, insert allowed. No update, no delete.
facility_reporting_period: anon — read all rows, insert allowed. No update, no delete.

After setup, write docs/supabase-setup.md and update it at every save point that touches the database. It must contain: project name, project ID, project URL, plan, every table with field names and types, RLS policies per table, notes for future sessions, and a last-updated line with date and session number. From the moment it exists, that file is the schema source of truth.

## Hard Rules
- API keys never in any frontend file or GitHub commit. This tool uses only the Supabase anon key (public by design, protected by RLS) — no server-side secret exists in this build.
- Netlify Identity: never. Supabase Auth is the only authentication system in this stack — not that this tool uses auth (A1, no login), but no other auth mechanism may be introduced.
- RLS: never disabled on any table. If a query fails, fix the policy or the query — never disable RLS to work around it.
- This tool has an earlier Tier 3 build (v1.0 — magic-link auth, four roles, its own Supabase project) in this project's history. Do not reuse that project, its client code, RLS policies, or auth guards for this D3 promotion. This is a brand-new Supabase project (`purepastures`), created fresh. Only hardcoded lookup-list values and Tailwind/brand tokens may be ported forward from v1.0.
- Do not add a database, login, or role restriction beyond what's specified here — this is a D3+A1 tool by design; see Out of scope below.
- CSV column mapping and value mapping stay session-only. Do not add any mechanism that remembers a mapping across uploads or sessions.
- Scope is never a user-facing input on the manual entry form or anywhere in CSV import. It is derived exactly once, from the selected/mapped source, reused by both entry paths.
- The `emission_source → conversion_factor` lookup table is placeholder data — every factor starts at 1.0, marked TBD. Do not treat computed `activity_data_value_converted` output as accurate, and do not wire it into any downstream calculation or export claim of correctness.
- GDPR: consent checkbox and the confirmed data statement required on the manual entry form and represented in the CSV import flow before any `reviewer` value is submitted. Personal data collected: `reviewer` (self-reported name). Deletion requests go to sustainability@purepastures.com.
- Facility Reporting Period must exist for a given facility+reporting_year before any Activity Data entry for that facility+year can be submitted — this is a hard block enforced in application logic (manual entry and CSV import both), not a soft warning. On block, redirect inline to the Facility Reporting Period form pre-filled with that facility+year; do not show a dead-end error.

## Project Structure
```
/                     ← root: CLAUDE.md, PROGRESS.md only
/src/components
/src/lib              ← Supabase client, utilities
/docs                 ← product-spec.md, supabase-setup.md
/.claude/skills/c-more/   ← brand skill
```

## Brand
Brand is governed by the c-more skill at .claude/skills/c-more/SKILL.md (already installed). Invoke it for any UI or visual work.
Hard rules that hold even if the skill is not loaded:
- Background #FAFAFA (Off White), never white or Tailwind gray defaults. Accent #C0FA00 (Lime), sparingly only, never a large fill. #141A32 (Deep Blue) for headers and primary buttons.
- Font: Figtree for all text. Cards: white, 1px #E6E7EC border, soft shadow, ~14px radius. Inputs: white, #E6E7EC border, focus ring in Deep Blue.

## Business Rules
- No emissions calculation of any kind. `activity_data_value_converted = activity_data_value_raw × conversion_factor`, looked up per `emission_source`; `activity_data_unit_converted` is the fixed base unit for that source in the same table. Manual entries always resolve to factor 1.0 since the unit field is locked to the source.
- CSV import: if the mapped raw unit doesn't match the expected unit for the mapped source, flag the row to Data Review rather than computing a guessed conversion.
- Facility Reporting Period auto-detect: at submission, `facility_reporting_period_ref` is auto-assigned by matching the entry's `facility` + the year extracted from `reporting_period` against existing `facility_reporting_period` rows. If no match: manual entry is blocked and redirected inline to the Facility Reporting Period form, pre-filled; CSV rows are flagged to Data Review with the specific reason "No Facility Reporting Period on file for this facility and year."
- Scope, category, subcategory, emission source, facility, and unit values are hardcoded static arrays — no in-app admin, no database-editable lookups. Changing them requires a code edit and redeploy. Unit auto-fills from the selected source and is not user-editable.
- Activity Data: every field required except notes, evidence_link, reviewer. Facility Reporting Period: every field required (facility, reporting_year, facility_country, production_volume, annual_revenue).
- CSV import: Column Mapping assigns raw columns to schema fields, including evidence_link and reviewer as optional mappable columns (unmapped columns fold into Notes by default). Value Mapping shows each distinct raw value once, not once per row.
- Rows with an unparseable date, a required field still blank, an unrecognized raw unit, or no matching Facility Reporting Period go to Data Review — not the main table.
- Reporting period is derived for CSV rows by truncating the parsed purchase date to its month; manual entries keep typing it in directly.
- The Dashboard nav tab is an active link to a placeholder URL only — it does not render any dashboard content itself. The URL must be swapped once Tool B deploys.
- Both CSV exports now pull all persisted records ever entered, not session-scoped. Activity Data export excludes rows still unresolved in Data Review.
- No update/delete of persisted records from the frontend this iteration — no RLS policy grants it.
- No draft-saving — closing or refreshing the tab mid-entry (before submit) still loses that in-progress entry.

Out of scope — do not build:
- Email arm (blocked-entry notification, missing-facility-data reminder)
- Scheduled Automation (annual reminder if a facility hasn't logged its year)
- Tool B (EF database + calculation logic + emissions dashboard) — separate spec, separate build, joins this same purepastures Supabase project once built
- Real conversion_factor values — still placeholder (1.0/TBD)
- Reusing the tool's v1.0 Supabase project — considered and rejected (D-14)
- New emission_source creation procedure
- Editable/dynamic EF frontend
- Login / user accounts (A2/A3)
- Role-based category/facility restriction
- Multi-currency FX conversion
- Column/value mapping remembered across sessions
- CSV files beyond a few hundred rows
- Bulk-editing multiple Data Review rows at once
- Sanity-range validation on numeric values
- Edit/delete of persisted records from the frontend

## Reference Docs
- docs/product-spec.md — full module specs, UI sections, logic, arm detail
- docs/supabase-setup.md — schema source of truth (created in the next build session)
- .claude/skills/c-more/SKILL.md — full brand system
PROGRESS.md in the root is read at every session start per the Session Protocol.
