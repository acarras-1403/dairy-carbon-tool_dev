# PROGRESS — PurePastures GHG Tool

> Claude Code: read this file at the start of every session, before touching
> anything. Update it at every save point. Replace content — do not append.
> History lives in git.

**Session:** 6 — Tool A/Tool B merge, Phases 1–4 of 4 complete
**Last updated:** 2026-11-20 — by Claude Code, session 6
**Live URL:** https://calm-croquembouche-76181c.netlify.app/ — not yet redeployed with this session's work; still serving the pre-merge v7.0 build as of this save point. See Remaining work.

## Current state

This tool is now the merged home for what were two separate tools/repos:
**Activity Data Entry** (this repo, "Tool A") and **Emissions Dashboard**
("Tool B", `carbon_dashboard_toolb_dev`) — merged per `DECISIONS.md`
**D-22**, a deliberate reversal of **D-12**'s earlier rejection of exactly
this. Both halves already shared the `purepastures` Supabase project; no
schema or RLS changed this session — this was a frontend/build-level merge
plus a full rebrand.

Four phases, each its own commit/save point on `claude/tool-build-njvj7x`:

**Phase 1 — stack upgrade.** React 18→19, Vite 5→8, Tailwind v3→v4
(CSS-first `@theme` config via `@tailwindcss/vite`, `tailwind.config.js`
and `postcss.config.js` both deleted). Pure tooling migration — verified
zero visual/behavioral change before moving on.

**Phase 2 — brand replacement.** Swapped the placeholder "C-MORE" brand
(Deep Blue/Lime, Figtree — never an official file, just a stand-in) for
Andrea Carrascosa's real, accessibility-checked personal brand system —
Granate `#7A1F2B` (the only action colour) / Sage `#8A9A7B` (decorative
only), Source Serif 4 (headings) + Source Sans 3 (body) self-hosted via
`@fontsource`, 7px radius everywhere, dark mode via a `data-theme="dark"`
attribute on `<html>` (was a `.dark` class). New skill at
`.claude/skills/granate-sage/` replaces `.claude/skills/c-more/`, with the
full source brand doc alongside it as `SOURCE-brand-system.md`.

**Phase 3 — port Tool B in.** Copied Tool B's `src/lib/` (calculation
engine, EF matching, forecast, CSV/PDF export, labels, tooltips) and
`src/components/` (Dashboard, FilterBar, ScopeDiagram, InventoryTable,
SourceRow, ForecastPanel, AuditPanel, ConfidenceSwatch,
MultiSelectDropdown, InfoIcon) into this repo. `EmissionsDashboard.jsx` now
mounts the real `Dashboard` component on data existing, instead of
redirecting to Tool B's separately-deployed site. `Dashboard.jsx` was
adapted for embedding — dropped its own duplicate header/ThemeToggle/
full-page chrome (this app's `App.jsx` already supplies all of that);
Recalculate/CSV/PDF buttons moved into a button-row card matching this
tool's existing pattern. The brand's full-bleed requirement is preserved
for the inventory table specifically: `App.jsx`'s `<main>` lost its
page-wide `max-w-4xl`, pushed down instead into `ActivityDataEntry`,
`Dashboard`'s own constrained section, and the `loadError` banner
individually, so `InventoryTable` alone can run edge-to-edge.

Every ported component's token classes were renamed onto this tool's
existing names (`bg-bg`→`bg-offwhite`, `text-primary`/`accent-primary`→
`text-accent`/`accent-accent`); a pre-existing dead class
(`text-deep-blue`, unmapped in either tool) was fixed to `text-accent`.
New tokens added: `bg-surface-strong`/`text-on-surface-strong` (a
theme-invariant dark "chip" for tooltips and table sub-headers),
`font-data`/`.data-face` (monospace, tabular figures), `.cat-slot-0..4`
(the brand's 5-step categorical scale — up from Tool B's original 3
slots). `.btn-accent` (this tool's name) and `.btn-secondary` (Tool B's
name) — the same bordered/outlined button role in both — consolidated to
one name, `.btn-secondary`. `pdfExport.js`'s hardcoded RGB triplets
(PDFs can't read CSS variables) updated from Deep Blue/Ink/Off White/Line
to Granate/Ink/Off White/Line. Added `jspdf`, `jspdf-autotable`,
`papaparse` dependencies. Also swept the remaining `dark:text-red-*`
error-message spots across this tool's own forms onto the new `text-danger`
token, now that one exists.

**Phase 4 — docs.** This file, `CLAUDE.md`, and `docs/supabase-setup.md`
reconciled into single merged versions describing the whole tool (see
each file's own history for what changed). `DECISIONS.md` gained two new
entries (stack upgrade, brand replacement) alongside D-22's merge
decision from earlier this session.

**Verification:** each phase got its own `npm run build` + headless-browser
pass before the next started. Phase 3's dashboard rendering (scope diagram,
full-bleed inventory table, confidence swatches, validation pills,
click-to-pin audit panel) was verified with Playwright route interception
standing in for the sandbox's blocked Supabase network — canned
`activity_data`/`facility_reporting_period`/`ef_table`/`emissions_results`
rows, confirmed correct in both themes. Activity Data Entry / Facility Data
modal re-confirmed with no regressions despite `App.jsx`'s layout changes.

## Last session

Session 6: executed the four-phase merge plan approved at the start of
this session (stack upgrade → rebrand → port Tool B → docs), building on
session 5's D-22 decision log entry. All four phases committed and pushed
to `claude/tool-build-njvj7x`; not yet merged to `main` or redeployed —
see Remaining work.

## Remaining work

- [ ] Merge `claude/tool-build-njvj7x` to `main` and confirm the merged tool auto-deploys to https://calm-croquembouche-76181c.netlify.app/ (or wherever the builder wants the merged tool to live going forward — confirm this hasn't changed)
- [ ] Live acceptance pass against the real Supabase data once deployed — this session's dashboard verification used mocked network responses (sandbox blocks `*.supabase.co`), not a live round-trip
- [ ] Decide `--color-serious` (`#ec835a`, the forecast panel's suppressed-months banner) — kept as-is from Tool B pending builder sign-off, per the plan; fold into `warning` or keep as its own one-off
- [ ] Confirm the derived `success`/`warning`/`danger` token values (DECISIONS.md) visually, now that they're live in the merged UI — they were contrast-checked but not yet explicitly approved by the builder
- [ ] Decide the fate of Tool B's now-redundant standalone repo (`carbon_dashboard_toolb_dev`) and its own Netlify site — builder asked to defer this until the merge is confirmed working (this session's plan, Phase 5)
- [ ] Bundle-size warning from `npm run build` (one chunk >500kB, driven by jsPDF/html2canvas) — not addressed this session, flagged for a future pass if it matters (code-splitting the PDF export path)
- [ ] Carried from session 5: walk spec Section 13 acceptance criteria 25–38 against the live deploy once it's redeployed with this session's work

## Build decisions

- Merge home is this repo (`dairy-carbon-tool_dev`), not Tool B's — confirmed by the builder. Tool A's components had zero inline hex (clean mechanical rebrand) and a far smaller surface than Tool B's; upgrading Tool A's stack to match Tool B's newer one was judged lower-risk than backporting Tool B's React 19/Tailwind v4-specific code down to Tool A's older stack.
- CSS custom properties for every brand token, not `dark:` variant
  duplication — carried forward from the pre-merge build, now pointing at
  Granate/Sage values instead of Deep Blue/Lime. `--accent-rgb` (and the
  new `--success-rgb`/`--warning-rgb`/`--danger-rgb`) stored as RGB triplets
  so Tailwind's opacity modifiers resolve.
- Dark mode switched from a `.dark` class to a `data-theme="dark"`
  attribute on `<html>` — matches the uploaded brand doc's own convention,
  not a pre-existing requirement from either tool.
- Secondary text tiers (brand doc's `text-muted` vs `text-meta`) collapsed
  to one (`slate`) — confirmed by the builder; neither tool ever had two.
- Corner radius: adopted the brand's 7px everywhere, replacing the
  pre-merge 14px `card` radius — confirmed by the builder as a deliberate,
  visible change.
- success/warning/danger tokens derived (not in the brand doc) and
  contrast-checked with the doc's own luminance script — builder asked for
  proposed values rather than supplying them; see DECISIONS.md for exact
  hex/ratios. Treat as provisional until explicitly approved.
- `.cat-slot` categorical palette expanded from Tool B's original 3 slots
  to 5, matching the brand doc's full categorical scale rather than
  preserving Tool B's narrower pre-existing choice.
- Tool B's own `theme.js`/`ThemeToggle.jsx`/`supabaseClient.js` were not
  ported — Tool A's versions (already updated for the new brand) serve
  both halves of the merged app from one copy each.

## Known issues

- Not yet deployed — `main` and the live site still reflect the pre-merge
  v7.0 build. This save point is on `claude/tool-build-njvj7x` only.
- The `success`/`warning`/`danger` palette is a confident proposal, not a
  builder-confirmed addition to the brand system (unlike everything else
  in `.claude/skills/granate-sage/SKILL.md`, which comes from the approved
  source file). Flag this if the builder asks about it.
- Carried from session 5, still true: this session's sandbox again blocked
  outbound HTTPS to `*.supabase.co`/`*.netlify.app` (org egress policy) —
  dashboard verification used mocked network responses instead of a live
  round-trip (see Current state).
- Carried from session 5: two Supabase projects outside this tool's
  canonical schema remain in the org (`purepastures-ghg`, id
  `uioxedvoaqtijtrvzxzl`; `acarras-1403's Project`, id
  `pcjsoczuzfbniwqxgfji`, INACTIVE). Cleanup remains a builder decision.

## Notes for next session

Merge `claude/tool-build-njvj7x` to `main` once the builder confirms, and
redeploy. Then do a live pass: confirm the dashboard renders correctly
against real data (not mocked), confirm the derived status-color palette
reads correctly in practice, and revisit the deferred Tool B
repo/site-retirement decision.
