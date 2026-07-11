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
} from '../data/lookups.js'
import { parseFlexibleDate, periodFromParsedDate } from './periods.js'

export const MAPPABLE_FIELDS = [
  { key: 'facility', label: 'Facility' },
  { key: 'source', label: 'Emission source' },
  { key: 'purchase_date', label: 'Purchase date' },
  { key: 'activity_data_value', label: 'Activity value' },
  { key: 'data_quality_rating', label: 'Data quality' },
]

const CATEGORICAL_FIELDS = ['facility', 'source', 'data_quality_rating']

function optionsForField(field) {
  if (field === 'facility') return FACILITIES
  if (field === 'source') return SOURCES
  if (field === 'data_quality_rating') return DATA_QUALITY_OPTIONS
  return null
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
// both entry paths rather than duplicated.
export function findEntryIssues(entry) {
  const issues = []
  if (!entry.reporting_period) issues.push('Reporting period missing or unparseable')
  if (!entry.facility_id) issues.push('Facility missing or unmapped')
  if (!entry.source_id) issues.push('Emission source missing or unmapped')
  if (
    entry.activity_data_value === '' ||
    entry.activity_data_value == null ||
    Number.isNaN(Number(entry.activity_data_value))
  )
    issues.push('Activity value missing or not a number')
  if (!entry.data_quality_rating) issues.push('Data quality rating missing or unmapped')
  return issues
}

export function buildEntryFromCsvRow(row, columnMap, valueMap, noteColumns) {
  const facilityRaw = columnMap.facility ? row[columnMap.facility] : ''
  const facilityId = resolveValue('facility', facilityRaw, valueMap)

  const sourceRaw = columnMap.source ? row[columnMap.source] : ''
  const sourceId = resolveValue('source', sourceRaw, valueMap)
  const hierarchy = sourceId ? deriveHierarchy(sourceId) : null

  const dateRaw = columnMap.purchase_date ? row[columnMap.purchase_date] : ''
  const parsedDate = parseFlexibleDate(dateRaw)

  const valueRaw = columnMap.activity_data_value ? row[columnMap.activity_data_value] : ''
  const activityValue = valueRaw === '' ? NaN : Number(valueRaw)

  const qualityRaw = columnMap.data_quality_rating ? row[columnMap.data_quality_rating] : ''
  const dataQuality = resolveValue('data_quality_rating', qualityRaw, valueMap)

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
    activity_data_value: Number.isNaN(activityValue) ? '' : activityValue,
    activity_data_unit: hierarchy?.unit ?? '',
    data_quality_rating: dataQuality ?? '',
    notes,
  }
}

// Splits imported rows into clean (ready for the main table) and flagged
// (Data Review).
export function processImportRows(rows, headers, columnMap, valueMap) {
  const mappedColumns = new Set(Object.values(columnMap).filter(Boolean))
  const noteColumns = headers.filter((h) => !mappedColumns.has(h))

  const clean = []
  const flagged = []

  for (const row of rows) {
    const entry = buildEntryFromCsvRow(row, columnMap, valueMap, noteColumns)
    const issues = findEntryIssues(entry)
    if (issues.length > 0) {
      flagged.push({ ...entry, issues })
    } else {
      clean.push(entry)
    }
  }

  return { clean, flagged }
}
