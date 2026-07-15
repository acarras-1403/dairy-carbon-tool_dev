---
name: verify
description: Verify PurePastures GHG Data Entry Tool changes by driving the app in a real browser.
---

Cold-start recipe for this repo (React + Vite, single page, no backend, no test suite).

## Build & run
```
npm install
npm run build          # sanity check, catches import/syntax errors fast
npm run dev -- --port 5183
```

## Drive it (Playwright)
Playwright is not a project dependency but is installed globally at
`/opt/node22/lib/node_modules/playwright`. Chromium is pre-installed at
`/opt/pw-browsers/chromium`. ESM `import 'playwright'` fails even with
`NODE_PATH` set — import the file directly instead:

```js
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
```

Write throwaway scripts to the scratchpad dir and `node <script>.mjs` them.

## Flows worth driving
- Manual entry (`EntryForm`): fill facility → category → source (cascades
  subcategory/source options, derives scope), activity value, data quality,
  optional evidence_link/reviewer/notes. Submitting computes
  activity_data_value_converted/unit_converted via the placeholder
  conversion table (factor 1.0) — verify raw and converted appear in the
  Activity Data table.
- CSV import: Column Mapping → (Value Mapping if any raw value doesn't
  exactly match a lookup) → rows split into clean (session table) vs
  flagged (Data Review). Test at least one row with a mismatched unit
  (e.g. "gallons" against a source expecting "litres") — this must flag
  to Data Review with "Unrecognized unit for the mapped emission source",
  never compute a guessed conversion. Also test an unparseable date.
- Data Review: promoting a flagged row re-locks the unit to the selected
  source (same as manual entry) — this is what resolves a unit-mismatch
  flag, since the review form's unit field isn't user-typed.
- Facility Reporting Period (`FacilityForm`/`FacilityTable`): separate
  form and session table from Activity Data — never merged.
- Two independent CSV exports: "Download Activity Data CSV" and "Download
  Facility Reporting Period CSV" — trigger both via
  `page.waitForEvent('download')` and read the downloaded file content to
  confirm they're separate files with the right columns.
- Refresh clears all state in both tables and Data Review (no persistence
  — this is the whole point of the tool's D2 tier).
- Dashboard nav tab: confirm it's a real `<a href>` to the placeholder URL
  (`target="_blank"`), not a dead link — but don't expect it to resolve,
  it's an intentional placeholder until Tool B ships.

## Gotchas
- `npm run build` alone won't catch runtime issues like a stale field name
  used in one component but renamed in another (e.g. the v3→v4
  `activity_data_value` → `activity_data_value_raw` rename touched five
  files) — always drive the actual form submit, not just the build.
- Selects/inputs aren't labelled with `htmlFor`/`id`, so target them by
  position within their `<form>`/`<section>` locator (`.nth(n)`) rather
  than by label text.
