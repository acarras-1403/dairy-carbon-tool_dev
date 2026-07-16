# Supabase Setup — PurePastures GHG Data Entry Tool

> Schema source of truth from the moment this file exists (CLAUDE.md). Update
> at every save point that touches the database.

**Project name:** purepastures
**Project ID:** ztkgbowwrlszbbfuhkid
**Project URL:** https://ztkgbowwrlszbbfuhkid.supabase.co
**Region:** eu-central-1 (Frankfurt)
**Plan:** Free — pauses after ~1 week with no traffic (D-15, deliberate trade-off, not an oversight). If the live tool shows connection errors after an idle period, restore the project manually in the Supabase dashboard.

This is a brand-new project created for the v5.0 D3 promotion (D-11, D-14) — it does not reuse the tool's earlier v1.0 project. Two unrelated pre-existing projects were found in this org at build time (`purepastures-ghg`, `acarras-1403's Project`, both dated 2026-07-04) and were deliberately left untouched; one is likely the prohibited v1.0 project, but cleanup of either is out of scope for this build (D-14 limitation).

## Tables

### `facility_reporting_period`

One row per facility per reporting year.

| Column | Type | Notes |
|---|---|---|
| id | uuid, primary key | `default gen_random_uuid()` |
| facility | text, not null | hardcoded facility id (e.g. `fac_north_plant`) — see `src/data/lookups.js` `FACILITIES` |
| reporting_year | integer, not null | |
| facility_country | text, not null | from `FACILITY_COUNTRIES` lookup |
| production_volume | numeric, not null | unit is the fixed `PRODUCTION_UNIT` constant, not stored per-row |
| annual_revenue | numeric, not null | currency is the fixed `CURRENCY` constant, not stored per-row |
| created_at | timestamptz, not null | `default now()` |

Unique constraint: `(facility, reporting_year)` — matches spec Section 5's "Key fields ... unique together." Enforced at the database, not just application logic.

### `activity_data`

One row per logged activity entry.

| Column | Type | Notes |
|---|---|---|
| id | uuid, primary key | `default gen_random_uuid()` |
| reporting_period | text, not null | `'YYYY-MM'` |
| facility | text, not null | hardcoded facility id |
| emission_source | text, not null | hardcoded source id — `category`/`subcategory`/`scope` are **not** stored; derived client-side from this via `deriveHierarchy()` |
| activity_data_value_raw | numeric, not null | |
| activity_data_unit_raw | text, not null | |
| activity_data_value_converted | numeric, not null | placeholder conversion factor (1.0/TBD) — not accurate, do not use downstream |
| activity_data_unit_converted | text, not null | |
| data_quality_rating | text, not null | one of `measured` / `calculated` / `estimated` / `proxy` |
| notes | text, nullable | |
| evidence_link | text, nullable | |
| reviewer | text, nullable | personal data — GDPR applies, see Section 7 of the spec |
| facility_reporting_period_ref | uuid, not null | FK → `facility_reporting_period(id)`, auto-assigned at submission by matching `facility` + year extracted from `reporting_period` |
| created_at | timestamptz, not null | `default now()` |

## RLS Policies

Both tables: RLS enabled. `anon` role granted `SELECT` (`using (true)`) and `INSERT` (`with check (true)`) only — no `UPDATE`/`DELETE` policy exists on either table, so both are denied by default under RLS. Explicit `GRANT SELECT, INSERT` issued to `anon` on both tables.

The Supabase security advisor flags both `INSERT` policies as "always true" / unrestricted. **This is intentional, not a gap** — the tool is A1 (public, no login, no roles), so every anonymous visitor is equally entitled to insert; the flag is expected and accepted, not a fix-it item.

## Notes for future sessions

- Every `activity_data_value_converted` is computed via a placeholder `conversion_factor` (always `1.0`, `status: 'TBD'`) — see `CONVERSION_FACTORS` in `src/data/lookups.js`. Do not treat this column as accurate.
- No update/delete capability exists anywhere in the frontend — matches the RLS policies exactly (nothing to bypass).
- Tool B (future EF database + calculation logic + dashboard) will join this same project as a second tool. It reads `activity_data` and `facility_reporting_period` as they exist here; any schema change here should be treated as a breaking change for Tool B's own build.

**Last updated:** 2026-07-16 — by Claude Code, session 4 (v5.0 build).
