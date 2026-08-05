// CSV bulk-import row processing: turns raw parsed CSV rows into either a
// clean entry (ready for the session table) or a flagged entry (routed to
// Data Review) — spec Section 9 / Business Rules.
import {
  FACILITIES,
  SOURCES,
  DATA_QUALITY_OPTIONS,
  deriveHierarchy,
  findExactMatch,
  findExactStringMatch,
  convertActivityValue,
  resolveSourceFromFuelAndEquipment,
} from '../data/lookups.js'
import { parseFlexibleDate, periodFromParsedDate, yearFromPeriod } from './periods.js'
import { findFacilityMatch } from './facilityMatch.js'

// Target field list re-synced to CLAUDE.md/spec Section 8, v7.0 — activity
// value's unit is always auto-derived/locked from the resolved emission
// source (Hard Rules), so it's never its own mappable column here, unlike
// the pre-v7.0 build.
export const MAPPABLE_FIELDS = [
  { key: 'facility', label: 'Facility' },
  { key: 'source', label: 'Emission source' },
  { key: 'purchase_date', label: 'Purchase date' },
  { key: 'activity_data_value_raw', label: 'Activity value' },
  { key: 'data_quality_rating', label: 'Data quality' },
  { key: 'evidence_link', label: 'Evidence link' },
  { key: 'reviewer', label: 'Reviewer' },
]

const CATEGORICAL_FIELDS = ['facility', 'source', 'data_quality_rating']

function optionsForField(field) {
  if (field === 'facility') return FACILITIES
  if (field === 'source') return SOURCES
  if (field === 'data_quality_rating') return DATA_QUALITY_OPTIONS
  return null
}

// Auto-detects a fuel-type-like and an equipment/vehicle-description-like
// column by header name (Value Mapping, spec Section 8/Business Rules) —
// used to resolve `emission_source` when no single column maps cleanly to
// it. Only considers columns not already claimed by another target field.
function detectAuxiliaryColumns(headers, columnMap) {
  const mapped = new Set(Object.values(columnMap).filter(Boolean))
  const fuelCol = headers.find((h) => !mapped.has(h) && /fuel/i.test(h))
  const equipCol = headers.find((h) => !mapped.has(h) && /(equipment|vehicle)/i.test(h))
  return { fuelCol, equipCol }
}

// Distinct raw values per mapped categorical column that don't already
// exactly match a hardcoded option — Value Mapping shows each once, not
// once per row (spec Section 8).
export function collectUnresolvedValues(rows, columnMap) {
  const unresolved = []
  for (const field of CATEGORICAL_FIELDS) {
    const column = columnMap[field]
    if (!column) continue
    const seen = new Set()
    const options = optionsForField(field)
    for (const row of rows) {
      const raw = (row[column] ?? '').trim()
      if (!raw || seen.has(raw)) continue
      seen.add(raw)
      const matched =
        field === 'data_quality_rating'
          ? findExactStringMatch(options, raw)
          : findExactMatch(options, raw)
      if (!matched) unresolved.push({ field, rawValue: raw })
    }
  }
  return unresolved
}

function resolveValue(field, raw, valueMap) {
  const trimmed = (raw ?? '').trim()
  if (!trimmed) return null
  const options = optionsForField(field)
  const exact =
    field === 'data_quality_rating'
      ? findExactStringMatch(options, trimmed)
      : findExactMatch(options, trimmed)
  if (exact) return field === 'data_quality_rating' ? exact : exact.id
  return valueMap[field]?.[trimmed] ?? null
}

// Required-field check shared by CSV row processing and Data Review's
// promote action — one definition of "complete" for an entry, reused by
// both entry paths rather than duplicated. Activity unit is never checked
// here — it's always auto-derived from a resolved emission source (Hard
// Rules), so an unresolved source is the only unit-adjacent failure, and
// that's already covered by the "Emission source missing" check below.
// `facilityPeriods` adds the Facility Data auto-detect check — a row with
// no matching facility+year record flags here too, rather than importing
// unmatched (spec Section 9).
export function findEntryIssues(entry, facilityPeriods) {
  const issues = []
  if (!entry.reporting_period) issues.push('Reporting period missing or unparseable')
  if (!entry.facility_id) issues.push('Facility missing or unmapped')
  if (!entry.source_id) issues.push('Emission source missing or unmapped')
  if (
    entry.activity_data_value_raw === '' ||
    entry.activity_data_value_raw == null ||
    Number.isNaN(Number(entry.activity_data_value_raw))
  )
    issues.push('Activity value missing or not a number')
  if (!entry.data_quality_rating) issues.push('Data quality rating missing or unmapped')
  if (
    entry.reporting_period &&
    entry.facility_id &&
    !findFacilityMatch(facilityPeriods ?? [], entry.facility_id, entry.reporting_period)
  ) {
    const facilityName = FACILITIES.find((f) => f.id === entry.facility_id)?.name ?? entry.facility_id
    const year = yearFromPeriod(entry.reporting_period)
    issues.push(
      `Add Facility Data for ${facilityName}/${year} using the Facility Data button in Activity Data Entry, then re-promote this row.`,
    )
  }
  return issues
}

export function buildEntryFromCsvRow(row, columnMap, valueMap, noteColumns, auxiliaryColumns = {}) {
  const facilityRaw = columnMap.facility ? row[columnMap.facility] : ''
  const facilityId = resolveValue('facility', facilityRaw, valueMap)

  const sourceRaw = columnMap.source ? row[columnMap.source] : ''
  let sourceId = resolveValue('source', sourceRaw, valueMap)
  // Falls back to combining a fuel-type column with an equipment/vehicle-
  // description column when the direct mapping didn't resolve (or no
  // column was mapped to Emission source at all) — spec Section 8 Value
  // Mapping / Business Rules.
  if (!sourceId && (auxiliaryColumns.fuelCol || auxiliaryColumns.equipCol)) {
    sourceId = resolveSourceFromFuelAndEquipment(
      auxiliaryColumns.fuelCol ? row[auxiliaryColumns.fuelCol] : '',
      auxiliaryColumns.equipCol ? row[auxiliaryColumns.equipCol] : '',
    )
  }
  const hierarchy = sourceId ? deriveHierarchy(sourceId) : null

  const dateRaw = columnMap.purchase_date ? row[columnMap.purchase_date] : ''
  const parsedDate = parseFlexibleDate(dateRaw)

  const valueRaw = columnMap.activity_data_value_raw ? row[columnMap.activity_data_value_raw] : ''
  const activityValue = valueRaw === '' ? NaN : Number(valueRaw)

  const qualityRaw = columnMap.data_quality_rating ? row[columnMap.data_quality_rating] : ''
  const dataQuality = resolveValue('data_quality_rating', qualityRaw, valueMap)

  const evidenceLink = (columnMap.evidence_link ? row[columnMap.evidence_link] : '').trim()
  const reviewer = (columnMap.reviewer ? row[columnMap.reviewer] : '').trim()

  // Unit is always the mapped source's locked unit — never read from the
  // CSV (Hard Rules: activity value's unit is auto-derived, never editable
  // or independently mapped).
  const conversion = hierarchy ? convertActivityValue(sourceId, activityValue) : null

  const notes = noteColumns
    .map((h) => [h, (row[h] ?? '').trim()])
    .filter(([, v]) => v)
    .map(([h, v]) => `${h}: ${v}`)
    .join('; ')

  return {
    id: crypto.randomUUID(),
    reporting_period: parsedDate ? periodFromParsedDate(parsedDate) : '',
    facility_id: facilityId ?? '',
    facility_name: FACILITIES.find((f) => f.id === facilityId)?.name ?? facilityRaw ?? '',
    scope_id: hierarchy?.scope_id ?? '',
    category_id: hierarchy?.category_id ?? '',
    category_name: hierarchy?.category_name ?? '',
    subcategory_id: hierarchy?.subcategory_id ?? '',
    subcategory_name: hierarchy?.subcategory_name ?? '',
    source_id: sourceId ?? '',
    source_name: hierarchy?.source_name ?? sourceRaw ?? '',
    activity_data_value_raw: Number.isNaN(activityValue) ? '' : activityValue,
    activity_data_unit_raw: hierarchy?.unit ?? '',
    activity_data_value_converted: conversion?.value_converted ?? '',
    activity_data_unit_converted: conversion?.unit_converted ?? '',
    data_quality_rating: dataQuality ?? '',
    notes,
    evidence_link: evidenceLink,
    reviewer,
  }
}

// Splits imported rows into clean (ready to persist) and flagged (Data
// Review). Clean rows carry facility_reporting_period_ref, auto-assigned
// from the matched row (spec Section 9, v5.0) — resolvable here since a
// clean row is guaranteed a match by findEntryIssues above.
export function processImportRows(rows, headers, columnMap, valueMap, facilityPeriods) {
  const mappedColumns = new Set(Object.values(columnMap).filter(Boolean))
  const noteColumns = headers.filter((h) => !mappedColumns.has(h))
  const auxiliaryColumns = detectAuxiliaryColumns(headers, columnMap)

  const clean = []
  const flagged = []

  for (const row of rows) {
    const entry = buildEntryFromCsvRow(row, columnMap, valueMap, noteColumns, auxiliaryColumns)
    const issues = findEntryIssues(entry, facilityPeriods)
    if (issues.length > 0) {
      flagged.push({ ...entry, issues })
    } else {
      const match = findFacilityMatch(facilityPeriods ?? [], entry.facility_id, entry.reporting_period)
      clean.push({ ...entry, facility_reporting_period_ref: match?.id })
    }
  }

  return { clean, flagged }
}
