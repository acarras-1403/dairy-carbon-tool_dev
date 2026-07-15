# PurePastures GHG Activity Data Entry Tool

## Identity
A single-page tool where anyone with the link logs raw GHG activity data against a fixed set of categories — one entry at a time through a manual form, or in bulk via CSV upload with column/value mapping — plus annual Facility Reporting Period data per facility, with a placeholder nav tab toward the future emissions dashboard tool. Session-only, exported as CSV.
Tier: 1 — public tool, no login, data lives only in the browser tab for the session and disappears on refresh (D2+A1)
Spec version governed: v4.0 — the version of docs/product-spec.md these rules were derived from.
Position: Standalone

## Session Protocol
At the start of every session:
1. Pull the latest from main before reading anything else.
2. Check docs/product-spec.md: if its version is newer than the "Spec version governed" line in this file, STOP. Tell the builder: "The spec has changed since this CLAUDE.md was written — re-run the Project Governor on the revised spec before building, or these rules may contradict it." Do not build against a stale CLAUDE.md.
3. Read PROGRESS.md in the project root — it is the current state of this build. If it is missing, recreate it with the structure at the end of this section, then continue.
4. Increment the session number and update the date in PROGRESS.md.
5. If "Notes for next session" has content: repeat the notes back to the builder, treat them as this session's priorities, then clear the section.
6. If this is session 1, run First Session Setup below before any build work.

Save point — after completing any module, feature, or fix:
1. Update PROGRESS.md: current state, remaining work, build decisions, known issues.
2. Commit and push to main.
3. Tell the builder in one line: "Save point committed: [what changed]."
Do not start the next piece of work before the save point is pushed. Never end a session without one — an ending session is a save point.

First Session Setup (session 1 only — already complete for this project; kept here for the recreate rule):
1. Create docs/ and move product-spec.md into it.
2. Install the brand skill: create .claude/skills/c-more/ and place the provided C-MORE-brand-style-sheet.md there as SKILL.md (add minimal name/description frontmatter, since the source has none).
3. Announce what moved, then commit and push before building anything.

PROGRESS.md structure (for the recreate rule): status header (Session / Last updated / Live URL), Current state, Last session, Remaining work, Build decisions, Known issues, Notes for next session.

## Commands
```
npm install
npm run dev
npm run build
```

## Tech Stack
React · Vite · Tailwind CSS · Netlify
Deployment: GitHub → Netlify, auto-deploys from main. Netlify MCP is not active — the repo is already connected via Netlify's native integration; no env variables apply since this tool uses none.

## Arms
Export — browser only, no server function — two separate CSV downloads: all Activity Data entries currently in the main session table (unresolved Data Review rows excluded until fixed and promoted), and all Facility Reporting Period entries currently in its own session table.

## Hard Rules
- No frontend file or GitHub commit ever contains an API key, credential, or secret. This tool has none today — if a future arm introduces one, it is always called through a server-side function, never inline.
- A more advanced, previously-built version of this tool (v1.0, Tier 3 — Supabase persistence, magic-link auth, four roles) exists in this project's history. Do not reuse its Supabase client, auth guards, role-conditional rendering, or any RLS-dependent query. Only hardcoded lookup-list values and Tailwind/brand tokens may be ported forward.
- Do not add a database, login, or role restriction of any kind — this is a D2+A1 tool by design; see Out of scope below.
- CSV column mapping and value mapping are session-only. Do not add any mechanism — local storage, a hidden file, or otherwise — that remembers a mapping across uploads or sessions. If a mapping needs to persist, that is a tier change and goes back to the Tool Architect first.
- Scope is never a user-facing input on the manual entry form or anywhere in CSV import. It is derived exactly once, from the selected/mapped source, and that single derivation point is reused by both entry paths — do not duplicate the derivation logic.
- The `emission_source → conversion_factor` lookup table is placeholder data — every factor starts at 1.0, marked TBD. Do not treat computed `activity_data_value_converted` output as accurate, and do not wire it into any downstream calculation or export claim of correctness. Swapping in real factors is a data edit to the lookup table, not a logic change.
- Facility Reporting Period is a separate session table from Activity Data — one row per facility per reporting year, never merged into the Activity Data rows or its export.

## Project Structure
```
/                     ← root: CLAUDE.md, PROGRESS.md only
/src/components
/docs                 ← product-spec.md
/.claude/skills/c-more/   ← brand skill
```

## Brand
Brand is governed by the c-more skill at .claude/skills/c-more/SKILL.md (installed in First Session Setup). Invoke it for any UI or visual work.
Hard rules that hold even if the skill is not loaded:
- Background #FAFAFA (Off White), never white or Tailwind gray defaults. Accent #C0FA00 (Lime), sparingly only, never a large fill. #141A32 (Deep Blue) for headers and primary buttons.
- Font: Figtree for all text. Cards: white, 1px #E6E7EC border, soft shadow, ~14px radius. Inputs: white, #E6E7EC border, focus ring in Deep Blue.

## Business Rules
- No emissions calculation of any kind. `activity_data_value_converted = activity_data_value_raw × conversion_factor`, looked up per `emission_source`; `activity_data_unit_converted` is the fixed base unit for that source in the same table. Manual entries always resolve to factor 1.0 since the unit field is locked to the source.
- CSV import: if the mapped raw unit doesn't match the expected unit for the mapped source, flag the row to Data Review rather than computing a guessed conversion — same fallback pattern as an unparseable date.
- Scope, category, subcategory, emission source, facility, and unit values are hardcoded static arrays — no in-app admin, no database. Changing them requires a code edit and redeploy. Unit auto-fills from the selected source and is not user-editable.
- Activity Data: every field required except notes, evidence_link, reviewer. Facility Reporting Period: every field required (facility, reporting_year, facility_country, production_volume, annual_revenue).
- Closing or refreshing the tab clears all unexported entries in both session tables, any in-progress mapping, and any Data Review rows — no persistence anywhere, by design.
- CSV import: Column Mapping assigns raw columns to schema fields, including evidence_link and reviewer as optional mappable columns (unmapped columns fold into Notes by default). Value Mapping shows each distinct raw value once, not once per row; a mapping applies to every row sharing that value within the same upload; values that already match a hardcoded option exactly are skipped.
- Rows with an unparseable date, a required field still blank, or an unrecognized raw unit go to Data Review — not the main table. Data Review holds only flagged rows.
- Reporting period is derived for CSV rows by truncating the parsed purchase date to its month; manual entries keep typing it in directly.
- The Dashboard nav tab is an active link to a placeholder URL only — it does not render any dashboard content itself. The URL must be swapped once the future emissions dashboard tool (Tool B) deploys.
- All categories, facilities, and sources are visible to every visitor — no role or facility restriction.

Out of scope — do not build: login/accounts (A2/A3), persisted storage or a Supabase project (D3), role-based restriction, monthly missing-entry reminder (email/scheduled automation), editable/database-backed lookup tables, real conversion factor values (placeholder 1.0/TBD only), emissions calculation, dashboard functionality itself (the tab is a placeholder link only), remembering CSV mappings across sessions, CSV files beyond a few hundred rows, bulk-editing multiple Data Review rows at once, sanity-range validation on numeric values, multi-currency FX conversion, client-agnostic tool/lookup generalization, new emission_source creation procedure.

## Reference Docs
- docs/product-spec.md — full module specs, UI sections, logic, arm detail
- .claude/skills/c-more/SKILL.md — full brand system
PROGRESS.md in the root is read at every session start per the Session Protocol.
