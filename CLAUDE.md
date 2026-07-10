# PurePastures GHG Activity Data Entry Tool (MVP)

## Identity
A single-page form where anyone with the link logs raw GHG activity data against a fixed set of categories, session-only, exported as CSV.
Tier: 1 — public form, no login, data lives only in the browser tab for the session and disappears on refresh (D2+A1)
Spec version governed: v2.0 — the version of docs/product-spec.md these rules were derived from.
Position: Standalone

## Session Protocol
At the start of every session:
1. Pull the latest from main before reading anything else.
2. Check docs/product-spec.md: if its version is newer than the "Spec version governed" line in this file, STOP and tell the builder to re-run the Project Governor first. Do not build against a stale CLAUDE.md.
3. Read PROGRESS.md in the project root. If missing, recreate it with the structure below, then continue.
4. Increment the session number and update the date in PROGRESS.md.
5. If "Notes for next session" has content: repeat it back to the builder, treat it as this session's priorities, then clear the section.
6. If this is session 1, run First Session Setup before any build work.

Save point — after completing any module, feature, or fix:
1. Update PROGRESS.md: current state, remaining work, build decisions, known issues.
2. Commit and push to main.
3. Tell the builder in one line: "Save point committed: [what changed]."
Never end a session without a save point pushed.

First Session Setup (session 1 only): create docs/ and move product-spec.md into it; install the brand skill at .claude/skills/c-more/SKILL.md from the provided brand file (add minimal frontmatter, since the source has none); announce what moved, then commit and push before building anything.

PROGRESS.md structure (recreate rule): status header (Session / Last updated / Live URL), Current state, Last session, Remaining work, Build decisions, Known issues, Notes for next session.

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
Export — browser only, no server function — CSV of all current session entries, triggered by a "Download CSV" button.

## Hard Rules
- No frontend file or GitHub commit ever contains an API key, credential, or secret. This tool has none today (spec Section 11) — if a future arm introduces one, it is always called through a server-side function, never inline.
- A more advanced, previously-built version of this tool (v1.0, Tier 3 — Supabase persistence, magic-link auth, four roles) exists in this project's history. Do not reuse its Supabase client, auth guards, role-conditional rendering, or any RLS-dependent query — that logic is exactly what D-1 through D-5 removed. Only hardcoded lookup-list values and Tailwind/brand tokens may be ported forward, and only if lifted without touching Supabase- or auth-related code.
- Do not add a database, login, or role restriction of any kind — this is a D2+A1 tool by design; see Out of scope below.

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
- No calculation — activity data is captured exactly as entered and exported as-is.
- Scope, category, subcategory, emission source, facility, and unit values are hardcoded static arrays — no in-app admin, no database. Changing them requires a code edit and redeploy. Unit auto-fills from the selected source and is not user-editable.
- Every field is required except Notes. Closing or refreshing the tab clears all unexported entries — no persistence anywhere, by design.
- All categories, facilities, and sources are visible to every visitor — no role or facility restriction.

Out of scope — do not build: login/accounts (A2/A3), persisted storage or a Supabase project (D3), role-based restriction, monthly missing-entry reminder (email/scheduled automation), editable/database-backed lookup tables, emissions calculation, results/dashboard display, file uploads.

## Reference Docs
- docs/product-spec.md — full module specs, UI sections, logic, arm detail
- .claude/skills/c-more/SKILL.md — full brand system
PROGRESS.md in the root is read at every session start per the Session Protocol.
