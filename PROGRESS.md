# PROGRESS — PurePastures GHG Activity Data Entry Tool (MVP)

> Claude Code: read this file at the start of every session, before touching
> anything. Update it at every save point. Replace content — do not append.
> History lives in git.

**Session:** 1 — build complete
**Last updated:** 2026-07-10 — by Claude Code, session 1
**Live URL:** pending — Netlify's native integration deploys on push to `main`;
builder confirms in the Netlify dashboard (no MCP visibility, see spec Section 4).

## Current state
Tool is built and passes a local build. First Session Setup done: `docs/`
created (`product-spec.md` moved in), C-MORE brand skill installed at
`.claude/skills/c-more/SKILL.md` (frontmatter added). Repo root holds only
`CLAUDE.md` and `PROGRESS.md`.

Single-page form (`src/App.jsx`) holds all entries in React state — no
routing, no backend, no login. `src/data/lookups.js` hardcodes scope,
category, subcategory, emission source (23 sources, fixed unit each), and
facility lists, carried over from the v1.0 `dim_*` seed content per D-5.
`EntryForm.jsx` does cascading scope→category→subcategory→source selects,
every field required except Notes, unit auto-filled and read-only.
`EntryTable.jsx` renders the running session table with a per-row Remove
button and a Download CSV button (`src/lib/csv.js`, dependency-free writer).
Verified: `npm install` (129 pkgs) + `npm run build` clean (36 modules, Node
22); `vite preview` serves the built `dist/` correctly.

## Last session
Session 1: reset the branch to current `main` (which now carries the v2.0
Tier 1 spec, superseding the Tier 3 build from `main`'s prior history), ran
First Session Setup, then built the full MVP — form, session table, CSV
export — from scratch. No Supabase, auth, or routing code carried forward.

## Remaining work
- [ ] Local test pass — full manual walkthrough (add entry, remove entry,
      refresh-clears-data check, download CSV and open it) before deploy
- [ ] Acceptance criteria pass — walk spec Section 13 end-to-end once deployed
- [ ] Deploy to Netlify — builder confirms the push-triggered build succeeded
      in the Netlify dashboard (Netlify MCP not active per spec Section 4)

## Build decisions
- Hardcoded lookup values reuse the v1.0 `dim_scope` / `dim_category` /
  `dim_subcategory` / `dim_emission_source` / `dim_facility` seed content
  verbatim (names, units, hierarchy) — no changes, per the Open Question in
  spec Section 15 assuming no changes needed unless told otherwise.
  `dim_emission_factor` / `dim_methodology` were NOT carried over — this
  tool performs no calculation, so factors/methodology have no purpose here.
- No React Router: a single page needs no client-side routing.
- CSV export uses a small dependency-free writer (`src/lib/csv.js`) rather
  than a library, matching the "no external services" rule in spec Section 11.
- Entry `id` uses `crypto.randomUUID()` (browser-native) purely as a React
  list key / remove-target — it is never persisted or sent anywhere.

## Known issues
- None currently.

## Notes for next session
None.
