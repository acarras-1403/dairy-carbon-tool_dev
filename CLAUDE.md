# PurePastures GHG Activity Data Entry Tool

## Identity
Logs GHG activity data and annual facility data for PurePastures Dairy Cooperative facilities; anyone with the link can use it.
Tier: 2 — data persists to Supabase, no login required (D3+A1)
Spec version governed: v7.0 — the version of docs/product-spec.md these rules were derived from.
Position: Tool 1 of 2 in the purepastures stack — shares the Supabase project with the emissions dashboard tool (live at https://ghgdashboarddev.netlify.app/); this tool created the schema.

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

First Session Setup (session 1 only):
1. Create docs/ and move product-spec.md into it. Move supabase-setup.md into docs/.
2. Install the brand skill: create .claude/skills/c-more/ and place the provided brand file there as SKILL.md (add minimal name/description frontmatter if it has none).
3. Announce what moved, then commit and push before building anything.

PROGRESS.md structure (for the recreate rule): status header (Session / Last updated / Live URL), Current state, Last session (3–5 lines, replace each session), Remaining work (shrinking checklist), Build decisions (one line each), Known issues, Notes for next session.

## Commands
```
npm install
npm run dev
npm run build
```

## Tech Stack
React · Vite · Tailwind CSS · Netlify · Supabase
Deployment: GitHub → Netlify, auto-deploys from main. Netlify MCP is not active — the builder connects the repo and enters environment variables in the Netlify dashboard; remind them before the first deploy.

## Arms
Export — browser only, no server function — three CSV downloads: Activity Data (all persisted records), Facility Data (all persisted records), and a blank import template with the corrected header row.

## Environment Variables
VITE_SUPABASE_URL — Supabase: Project Settings → API → Project URL — Netlify env var
VITE_SUPABASE_ANON_KEY — Supabase: Project Settings → API → anon / public key — Netlify env var

Key storage follows function placement: this tool has no server-side functions, so both variables are Netlify environment variables, browser-exposed by design (VITE_ prefix), protected by RLS rather than secrecy. At session start, confirm both exist before first use. No value ever appears in code or in any file committed to GitHub.

## Supabase
Project: "purepastures" — already exists. Project URL: https://ztkgbowwrlszbbfuhkid.supabase.co
docs/supabase-setup.md is the schema source of truth. Read it before any database work. Never recreate tables or policies that already exist. Update it at every save point that touches the database.
Plan: Free — pauses after ~1 week without traffic. If the live tool shows connection errors after an idle period, restore the project manually in the Supabase dashboard.

Tables this tool uses (no new tables this iteration):
facility_reporting_period: facility, reporting_year, facility_country, production_volume, annual_revenue, created_at — UI label is "Facility Data"; the table and column names do not change.
activity_data: reporting_period, facility, emission_source, activity_data_value_raw, activity_data_unit_raw, activity_data_value_converted, activity_data_unit_converted, data_quality_rating, notes, evidence_link, reviewer, facility_reporting_period_ref, created_at

RLS: facility_reporting_period — anon: select + insert only, no update/delete. activity_data — anon: select + insert only, no update/delete. Neither table has an update or delete policy; both are denied by default.

## Hard Rules
- API keys never in any frontend file or GitHub commit. Storage follows function placement: Netlify env vars for Netlify Functions, Supabase Edge Function secrets for Supabase Edge Functions — Edge Functions cannot read Netlify env vars. Always called through a server-side function.
- Netlify Identity: never. Supabase Auth is the only authentication system in this stack, if one is ever added.
- RLS: never disabled on any table. If a query fails, fix the policy or the query — never disable RLS to work around it.
- GDPR: consent checkbox and the confirmed data statement required on the manual entry form and CSV import's Column Mapping step before any submission including `reviewer`. Personal data: `reviewer` only. Deletion requests → sustainability@purepastures.com. Region already EU (Frankfurt) — compliant.
- Facility Data blocking validation is a hard block, not a warning — an Activity Data entry with no matching Facility Data for its facility+year cannot submit under any path. It opens the Facility Data modal in place, pre-filled with facility+year, with a warning banner — it never redirects to a separate page.
- Activity value's unit is locked and auto-derived from the selected emission source. It is never an independently editable field.
- `data_quality_rating` valid values, per the live database: `measured`, `calculated`, `estimated`, `proxy` — not the three-value list in an earlier spec draft.
- No update or delete capability exists anywhere in the frontend — this matches the RLS policies exactly. Do not add a "Remove" or "Edit" control to either table view or either tucked records section.
- Stack: this tool shares the purepastures Supabase project with the emissions dashboard tool. Per docs/supabase-setup.md, no tables beyond the two listed above currently exist in this project. If the dashboard tool's own tables appear there later, treat them as protected: no schema changes, no RLS changes from this codebase.

## Brand
Brand is governed by the c-more skill at .claude/skills/c-more/SKILL.md. Invoke it for any UI or visual work.
Hard rules that hold even if the skill is not loaded:
- Background: #FAFAFA (light) / #0F1220 (dark) — never white or Tailwind gray defaults
- Accent (identification): #141A32 Deep Blue in light mode, #C0FA00 Lime in dark mode — never Tailwind blue defaults
- Font: Figtree for all text
- Neutrals lead in both themes. A light/dark toggle in the top bar is required, not optional.

## Business Rules
- Two top-level tabs only: Emissions Dashboard (first), Activity Data Entry (second). No separate Facility Data tab/page, no separate Records tabs.
- Emissions Dashboard: no `activity_data` rows → local empty state ("No data available. Please add data in the Activity Data Entry tab.") with a tab-switch button. Rows exist → navigate to https://ghgdashboarddev.netlify.app/. Never render that dashboard's content locally.
- Facility Data is reached only via a button inside Activity Data Entry, or automatically on a blocked submission — a modal, never a page.
- Past entries: collapsed-by-default sections, not tabs — Activity Data's at the bottom of its tab, Facility Data's inside its modal.
- CSV import target fields, exact match: facility, purchase_date, emission_source, activity_data_value, data_quality_rating, notes, evidence_link, reviewer.
- `purchase_id` folds into `notes`, not its own column. Duplicate detection (warn, not block) compares that text + `facility` — accepted limitation, not a bug.
- Value Mapping combines a fuel-type column and an equipment/vehicle-description column when both exist, to resolve stationary vs. mobile `emission_source`.
- Data Review's "no Facility Data match" message points to the Facility Data button — never a page.

Out of scope — do not build:
- Rendering the dashboard's actual content inside this tool; a non-blocking version of the Facility Data validation (explicitly rejected); edit/delete of any record; real `conversion_factor` values; login/user accounts; saved CSV mapping templates; bulk-editing Data Review rows.

## Reference Docs
Read before building the related part:
- docs/product-spec.md — full module specs, UI sections, logic, arm detail
- docs/supabase-setup.md — schema source of truth (exists — read first)
- .claude/skills/c-more/SKILL.md — full brand system
File locations: CLAUDE.md and PROGRESS.md at root only; docs/ holds product-spec.md and supabase-setup.md; brand skill at .claude/skills/c-more/.
PROGRESS.md in the root is read at every session start per the Session Protocol.
