# Supabase Setup — PurePastures (merged tool)

> Schema source of truth. Update at every save point that touches the
> database. **No schema or RLS changes were made by the Tool A/Tool B merge
> itself (session 5+, DECISIONS.md D-22)** — this file was consolidated
> from two separate `docs/supabase-setup.md` files (one per tool, now one
> codebase) to describe the live database as it already existed.

**Project name:** purepastures
**Project ID:** ztkgbowwrlszbbfuhkid
**Project URL:** https://ztkgbowwrlszbbfuhkid.supabase.co
**Region:** eu-central-1 (Frankfurt)
**Plan:** Free — pauses after ~1 week with no traffic (D-15, deliberate trade-off, not an oversight). If the live tool shows connection errors after an idle period, restore the project manually in the Supabase dashboard.

This project was created fresh for the Activity Data Entry tool's D3
promotion (D-11, D-14) — it does not reuse the tool's earlier v1.0 project.
Two unrelated pre-existing projects were found in this org at build time
(`purepastures-ghg`, `acarras-1403's Project`, both dated 2026-07-04) and
were deliberately left untouched; cleanup of either is out of scope (D-14
limitation).

Both halves of the merged tool read/write this one project. Five tables
total: two created by the Activity Data Entry half (`activity_data`,
`facility_reporting_period`), three by the Emissions Dashboard half
(`ef_table`, `expected_matches`, `emissions_results`). Each half's own
tables are off-limits to the other's schema/RLS changes — see Hard Rules
in CLAUDE.md.

## Tables — Activity Data Entry

### `facility_reporting_period`

One row per facility per reporting year. UI label: "Facility Data".

| Column | Type | Notes |
|---|---|---|
| id | uuid, primary key | `default gen_random_uuid()` |
| facility | text, not null | hardcoded facility id (e.g. `fac_north_plant`) — see `src/data/lookups.js` `FACILITIES` |
| reporting_year | integer, not null | |
| facility_country | text, not null | from `FACILITY_COUNTRIES` lookup |
| production_volume | numeric, not null | unit is the fixed `PRODUCTION_UNIT` constant, not stored per-row |
| annual_revenue | numeric, not null | currency is the fixed `CURRENCY` constant, not stored per-row |
| created_at | timestamptz, not null | `default now()` |

Unique constraint: `(facility, reporting_year)` — matches product-spec.md's "Key fields ... unique together." Enforced at the database, not just application logic.

RLS: anon `SELECT` (all rows), anon `INSERT` (`with check (true)`). No anon `UPDATE`/`DELETE`.

### `activity_data`

One row per logged activity entry.

| Column | Type | Notes |
|---|---|---|
| id | uuid, primary key | `default gen_random_uuid()` |
| reporting_period | text, not null | `'YYYY-MM'` |
| facility | text, not null | hardcoded facility id |
| emission_source | text, not null | hardcoded source id — sole join key to `ef_table`, must match exactly. `category`/`subcategory`/`scope` are **not** stored; derived client-side from this via `deriveHierarchy()` |
| activity_data_value_raw | numeric, not null | |
| activity_data_unit_raw | text, not null | |
| activity_data_value_converted | numeric, not null | placeholder `conversion_factor` (flat 1.0, status 'TBD') — **unreliable**; every `emissions_results.result_tco2e` computed from this is unreliable until replaced with real values in a separate Activity Data Entry session |
| activity_data_unit_converted | text, not null | reconciled against `ef_table.ef_unit` by the calculation engine |
| data_quality_rating | text, not null | one of `measured` / `calculated` / `estimated` / `proxy` |
| notes | text, nullable | |
| evidence_link | text, nullable | |
| reviewer | text, nullable | personal data — GDPR applies |
| facility_reporting_period_ref | uuid, not null | FK → `facility_reporting_period(id)`, auto-assigned at submission by matching `facility` + year extracted from `reporting_period` |
| created_at | timestamptz, not null | `default now()` |

RLS: anon `SELECT` (all rows), anon `INSERT` (`with check (true)`). No anon `UPDATE`/`DELETE`.

Both tables' `INSERT` policies are flagged by the Supabase security advisor as "always true" / unrestricted. **This is intentional, not a gap** — both halves of this tool are A1 (public, no login, no roles), so every anonymous visitor is equally entitled to insert; the flag is expected and accepted.

## Tables — Emissions Dashboard

### `ef_table`

Emission factor reference data. No anon write access — edited only via direct database or CSV edit outside the app (D-7).

| Column | Type | Notes |
|---|---|---|
| ef_id | uuid, PK | `default gen_random_uuid()` |
| scope | text | e.g. `Scope 1`, `Scope 2`, `Scope 3` |
| category | text | e.g. `Stationary Combustion`, `Mobile Combustion` |
| subcategory | text | e.g. `Liquid Fuels`, `Gaseous Fuels` |
| emission_source | text | must match `activity_data.emission_source` exactly |
| emission_basis | text | e.g. `direct_combustion`, `upstream_WTT`, `location_based`, `market_based` |
| country | text | ISO-ish country name, or `"ALL"` fallback |
| calculation_method | text | `activity_based` / `hybrid` / `spend_based` |
| ef_value | numeric | blended CO2e factor |
| ef_unit | text | e.g. `litres`, `kg` — reconciled against `activity_data_unit_converted` |
| reference_year | integer | year underlying source data was measured |
| publication_year | integer | year this factor edition was published |
| quality_level | numeric | 1–5, EF's own quality tier |
| notes | text, nullable | source traceability |

RLS: anon `SELECT` only. No insert/update/delete policies exist.

Seeded (4 rows as of Tool B session 1), sourced from `DEFRA_factorsbyCategory_2025` in `Emission Factors database 2025_reduced (1).xlsx`:

| emission_source | scope | category | subcategory | emission_basis | ef_value | ef_unit |
|---|---|---|---|---|---|---|
| src_diesel_stationary | Scope 1 | Stationary Combustion | Liquid Fuels | direct_combustion | 2.57082 | litres |
| src_diesel_stationary | Scope 3 | Fuel- and Energy-Related Activities (WTT) | Liquid Fuels | upstream_WTT | 0.61101 | litres |
| src_diesel_mobile | Scope 1 | Mobile Combustion | Liquid Fuels | direct_combustion | 2.57082 | litres |
| src_lpg_stationary | Scope 1 | Stationary Combustion | Gaseous Fuels | direct_combustion | 2.93936095 | kg |

Grid Electricity (location-based/market-based Scope 2) is **not** seeded — no current `activity_data` uses it, and sourcing correct country-specific grid + residual-mix factors is deferred.

### `expected_matches`

Declares which `emission_source` values are multi-linkage (expected to fan out into more than one `emissions_results` row). Absence of rows for a source = expected single match.

| Column | Type | Notes |
|---|---|---|
| emission_source | text | must match `ef_table` / `activity_data` exactly |
| expected_emission_basis | text | e.g. `direct_combustion`, `upstream_WTT` |

RLS: anon `SELECT` only. No insert/update/delete policies exist.

Seeded (2 rows) — `src_diesel_stationary` expects both `direct_combustion` and `upstream_WTT`. The other two seeded emission sources have no rows here, so they're expected single-match.

### `emissions_results`

Calculated by the client-side calculation engine (manual "Recalculate" button only — never auto-fires on `activity_data` insert or dashboard load, D-17).

| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | `default gen_random_uuid()` |
| activity_data_ref | uuid, FK → `activity_data.id` | not unique — one activity row can produce many result rows (fan-out) |
| ef_ref | uuid, FK → `ef_table.ef_id`, nullable | null for zero-match stub rows |
| scope | text, nullable | null for Unclassified stubs |
| category | text, nullable | |
| subcategory | text, nullable | |
| result_tco2e | numeric, nullable | `(activity_data_value_converted × ef_value) / 1000`; null for stub/blocked rows |
| confidence_score | numeric, nullable | `round(√(data_quality_rating_score × ef_quality_level), 1)` — see mapping below |
| validation_status | text | `pending` / `approved` / `flagged`, default `'pending'`. "Reject" in the UI is a label over `flagged`, not a fourth value |
| export_blocked | boolean, not null | |
| export_blocked_reason | text, nullable | Cause A (Activity Data side — unit mismatch, fix in Activity Data Entry) or Cause B (EF table gap, no in-app fix) |
| created_at | timestamptz | `default now()` |

RLS: anon `SELECT` (all rows), anon `INSERT` (calculation engine writes), anon `UPDATE` — **table-level, all columns**, accepted risk, not restricted to `validation_status` alone (see CLAUDE.md Hard Rules). No `DELETE`.

## data_quality_rating → score mapping

Used by `confidence_score`'s formula (higher = better, consistent with `ef_table.quality_level`'s own 5=best/1=worst convention):

| data_quality_rating | Score |
|---|---|
| measured | 5 |
| calculated | 4 |
| estimated | 2 |
| proxy | 1 |

## Notes for future sessions

- Every `activity_data_value_converted` is computed via a placeholder `conversion_factor` (always `1.0`, `status: 'TBD'`) — see `CONVERSION_FACTORS` in `src/data/lookups.js`. Every `emissions_results.result_tco2e` downstream of it is unreliable until this is replaced with real values.
- No update/delete capability exists anywhere in the Activity Data Entry UI, matching its tables' RLS exactly. `emissions_results` does have an anon UPDATE policy (used by the dashboard's Validate/Reject controls) — this is the one deliberate exception, not an oversight.
- `ef_table`/`expected_matches` are edit-only outside the app (direct DB or CSV edit) — do not build an in-app editing UI for either (D-7, D-8).
- The two tools' schemas were reconciled onto one file this session (previously split: Tool A's own `docs/supabase-setup.md`, Tool B's own reconstructed-via-MCP version). No live schema or RLS changed — this is a documentation merge only, consolidating two sources of truth into the one this merged tool now needs.

**Last updated:** 2026-11-20 — by Claude Code, Tool A/Tool B merge (Phase 4) — documentation consolidation only, no schema/RLS changes.
