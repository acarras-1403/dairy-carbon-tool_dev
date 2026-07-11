# PurePastures GHG Data Entry Tool (G-1)

## Identity
Role-based tool where four PurePastures Dairy Cooperative roles log raw GHG
activity data by category, via invite-only magic-link login. Tier: 3 — data
persists in Supabase, role/facility-scoped authorization (D3+A3).
Spec version governed: v1.1.
Position: Tool A of 3 in the purepastures-ghg stack — shares the Supabase
project with G-4 (calculation) and G-2 (dashboard), neither built yet; this
tool created the schema and owns it until they exist.

## Session Protocol
Start of every session: pull main → if docs/product-spec.md is newer than
"Spec version governed" above, STOP, tell the builder to re-run the Governor
first → read PROGRESS.md (recreate from GitHub history if missing) → log the
session → act on any "Notes for next session", then clear it.

Save point (after any module, feature, fix, or schema change): update
PROGRESS.md → if the database was touched, update docs/supabase-setup.md too
→ commit and push to main (Netlify auto-deploys) → tell the builder: "Save
point committed: [what changed]." Never end a session without one.

First Session Setup for this iteration (repo just connected — see D-5):
confirm docs/ holds product-spec.md and supabase-setup.md (move if still
flat) → confirm the C-MORE brand skill is at .claude/skills/c-more/SKILL.md
(install if not) → verify Netlify site "purepastures-ghg" is connected to
github.com/acarras-1403/dairy-carbon-tool_dev with auto-deploy from main —
do not recreate the site, it exists from v1.0 → announce, commit, push.

## Commands
`npm install` · `npm run dev` · `npm run build`

## Tech Stack
React · Vite · Tailwind CSS · Netlify · Supabase · Resend (email arm, pending
account creation).
Deployment: GitHub → Netlify, auto-deploys from main (D-5, replaces the v1.0
direct Netlify MCP deploy). Netlify MCP no longer triggers deploys; the site
and its VITE_ env vars already exist from v1.0 — verify, do not recreate.

## Arms
Export — browser only, no server function — CSV, scoped to the requesting
role's permitted rows (Analyst: company-wide).
Email — database-triggered, Supabase Edge Function `monthly-deadline-check` —
fires when the monthly check finds a role/facility missing an entry for the
closed period → sends to the assigned staff.
Scheduled — Supabase pg_cron + pg_net, not a Netlify scheduled function (built
this way in v1.0, locked) — 06:00 UTC on the 1st monthly — checks for missing
entries, triggers Email, logs sends to `entry_deadline_reminder_log`.

## Environment Variables
VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY — Netlify env vars, already set
from v1.0, verify not recreate.
SUPABASE_SERVICE_ROLE_KEY — Edge Function secret, `monthly-deadline-check`
only, never a Netlify env var.
RESEND_API_KEY / RESEND_FROM / APP_URL — Edge Function secrets, pending
(Resend account not yet created — builder pre-task).
Frontend reads only the two VITE_ variables. No value ever appears in code or
any committed file.

## Supabase
Project: "purepastures-ghg" — already exists. URL:
https://uioxedvoaqtijtrvzxzl.supabase.co. Plan: Free.
docs/supabase-setup.md is the schema source of truth — read before any DB
work, never recreate existing tables/policies, update at every save point
that touches the database.

New table this iteration (document in docs/supabase-setup.md after creating):
import_batch_log: import_batch_id, uploaded_by_user_id, file_name, uploaded_at,
row_count_total, row_count_flagged, row_count_duplicate_warned. RLS:
authenticated users read/insert only their own uploads; Analyst reads all;
no update or delete for anyone.

Auth: magic link, invite-only (signups disabled). Roles: plant_ops_manager,
farm_liaison_officer, finance_team, sustainability_analyst — stored in
user_roles.role_name exactly as written.

## Hard Rules
- API keys never in any frontend file or GitHub commit. Edge Function secrets
  for the Edge Function; VITE_ Netlify env vars for the two public values only.
- Netlify Identity: never. Supabase Auth is the only authentication system.
- RLS: never disabled on any table. Fix the policy or the query instead.
- Service role key required only for `monthly-deadline-check`'s writes to
  `entry_deadline_reminder_log`. Stored as `SUPABASE_SERVICE_ROLE_KEY` in that
  function's secrets — never in code or the frontend.
- GDPR applies. Personal data: staff login email only. Statement given to each
  invited staff member (invite-only, not a public checkbox): "Your login email
  is used only to authenticate you and send data-entry reminders for this
  inventory. You can request deletion at any time by contacting
  andrea@andrea.com." Deletion requests handled manually at that address.
- Activity data is stored exactly as entered, except bulk-upload unit
  normalization at import time (see Business Rules) — never touch
  `dim_emission_factor` or `dim_methodology`, which are G-4's PLACEHOLDER
  tables to populate, not this tool's.

## Project Structure
```
/                     ← CLAUDE.md, PROGRESS.md
/src/context          ← AuthContext.jsx
/src/hooks            ← useReferenceData.js
/src/components       ← EntryForm.jsx, ActivityTable.jsx, BulkUpload.jsx (new)
/src/lib              ← queries.js, constants.js, csv.js
/supabase/migrations  ← numbered, never edit an applied one
/supabase/functions/monthly-deadline-check
/docs                 ← product-spec.md, supabase-setup.md
/.claude/skills/c-more/
```
Conventions: facility-scoped roles are plant_ops_manager and
farm_liaison_officer, company-wide (assigned_facility_id = null) are
finance_team and sustainability_analyst. Lookup tables use readable text PKs
(cat_*, src_*, fac_*); dim_activity_data.activity_id and
import_batch_log.import_batch_id are uuid. Category→role permissions live in
role_category_access (Analyst omitted = unrestricted). Reporting period
format is YYYY-MM. Non-positive activity_data_value auto-flags
requires_review = true on insert (`auto_flag_activity` trigger).

## Brand
Governed by the C-MORE skill at .claude/skills/c-more/SKILL.md (installed in
First Session Setup). Invoke it for any UI or visual work. Hard rules even if
the skill isn't loaded: background #FAFAFA (Off White, never white/Tailwind
gray) · identity #141A32 (Deep Blue) · accent #C0FA00 (Lime, sparingly, never
a large fill) · font Figtree throughout.

## Business Rules
- No emissions calculation is performed by this tool — that is G-4's job.
- Bulk CSV upload is scoped to fuel/combustion and electricity only; FLAG
  farm data and purchased goods stay manual-entry-only.
- Date parsing accepts DD/MM/YYYY, YYYY-MM-DD, DD-MM-YYYY in one file;
  unparseable dates flag, never drop. Blank data_quality_rating flags for
  review, never defaults.
- Import-time unit conversion (e.g. gallons → litres) is normalization, not
  calculation: fixed factor, original unit + factor in `notes`. Never touch
  dim_emission_factor or dim_methodology.
- Duplicate check (purchase_id + site_reference) warns, never blocks —
  uploader chooses to proceed or cancel that row.
- Out-of-scope bulk rows still insert with requires_review = true (app-logic
  enforced, not a DB constraint); RLS still restricts insert scope.
- Each bulk upload writes one import_batch_log row with accurate
  row_count_total, row_count_flagged, row_count_duplicate_warned.

Out of scope — do not build: emissions calculation (G-4); results/dashboard
display (G-2); in-app role/facility assignment UI (assigned via Supabase
dashboard at invite time); AI features; bulk upload for FLAG farm data or
purchased goods; Excel (.xlsx) upload — CSV only; saved column-mapping
templates.

## Reference Docs
docs/product-spec.md — full module specs, UI, logic, arm detail.
docs/supabase-setup.md — schema source of truth, read first, update at every
save point touching the database. .claude/skills/c-more/SKILL.md — brand
system. PROGRESS.md — read every session start per Session Protocol.
