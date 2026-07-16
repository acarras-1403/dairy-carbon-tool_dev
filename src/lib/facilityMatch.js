import { yearFromPeriod } from './periods.js'

// Single derivation point for the Facility Reporting Period auto-detect
// check (spec Section 9, v5.0) — reused by manual entry, CSV import, and
// Data Review promote alike, same pattern as deriveHierarchy/
// convertActivityValue in lookups.js. Matches on facility + the year
// extracted from reporting_period; returns the matching row or null.
export function findFacilityMatch(facilityPeriods, facilityId, reportingPeriod) {
  const year = yearFromPeriod(reportingPeriod)
  if (!facilityId || year == null) return null
  return (
    facilityPeriods.find((f) => f.facility === facilityId && f.reporting_year === year) ?? null
  )
}
