import { useEffect, useRef, useState } from 'react'
import EntryForm from './components/EntryForm.jsx'
import EntryTable from './components/EntryTable.jsx'
import CsvImport from './components/CsvImport.jsx'
import DataReview from './components/DataReview.jsx'
import FacilityForm from './components/FacilityForm.jsx'
import FacilityTable from './components/FacilityTable.jsx'
import { fetchFacilityReportingPeriods, fetchActivityData } from './lib/supabaseData.js'
import { enrichActivityRow, enrichFacilityRow } from './data/lookups.js'

// Placeholder only — Tool B (the future emissions dashboard) is not yet
// built. Swap this URL once it deploys (spec Section 8, Dashboard Tab).
const DASHBOARD_PLACEHOLDER_URL = 'https://purepastures-dashboard.example.com'

// Tier 2 (D3+A1, spec v5.0): both tables persist in Supabase and survive a
// closed tab or a separate session — RLS grants anon read+insert only, no
// update/delete anywhere in this frontend. Facility Reporting Period is
// Step 1 (must exist before Activity Data can be submitted for that
// facility+year); Data Entry (manual + CSV) is Step 2. Data Review stays
// session-only — a flagged row was never written to Supabase to begin with.
export default function App() {
  const [entries, setEntries] = useState([])
  const [facilityEntries, setFacilityEntries] = useState([])
  const [reviewRows, setReviewRows] = useState([])
  const [loadError, setLoadError] = useState('')
  const [frpPrefill, setFrpPrefill] = useState(null)
  const facilitySectionRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [facilityRows, activityRows] = await Promise.all([
          fetchFacilityReportingPeriods(),
          fetchActivityData(),
        ])
        if (cancelled) return
        setFacilityEntries(facilityRows.map(enrichFacilityRow))
        setEntries(activityRows.map(enrichActivityRow))
      } catch {
        if (!cancelled) {
          setLoadError(
            'Could not load persisted data from Supabase. If this tool has been idle for about a week, the free-tier project may have paused — try again shortly.',
          )
        }
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  function addEntry(row) {
    setEntries((prev) => [enrichActivityRow(row), ...prev])
  }

  function addEntries(rows) {
    if (rows.length) setEntries((prev) => [...rows.map(enrichActivityRow), ...prev])
  }

  function handleImportComplete(insertedClean, flagged) {
    addEntries(insertedClean)
    if (flagged.length) setReviewRows((prev) => [...flagged, ...prev])
  }

  function promoteReviewRow(id, insertedRow) {
    setReviewRows((prev) => prev.filter((r) => r.id !== id))
    addEntry(insertedRow)
  }

  function discardReviewRow(id) {
    setReviewRows((prev) => prev.filter((r) => r.id !== id))
  }

  function addFacilityEntry(row) {
    setFacilityEntries((prev) => [enrichFacilityRow(row), ...prev])
    setFrpPrefill(null)
  }

  function handleBlocked(prefill) {
    setFrpPrefill(prefill)
    facilitySectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="min-h-screen bg-offwhite">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="inline-block h-4 w-4 rounded-sm bg-lime" aria-hidden />
            <span className="text-base font-bold text-deepblue">
              PurePastures GHG — Data Entry
            </span>
          </div>
          <nav className="flex items-center gap-2 text-sm font-medium">
            <span className="rounded-md bg-deepblue/5 px-3 py-1.5 text-deepblue">
              Data Entry
            </span>
            <a
              href={DASHBOARD_PLACEHOLDER_URL}
              target="_blank"
              rel="noreferrer"
              className="rounded-md px-3 py-1.5 text-slate transition hover:bg-deepblue/5 hover:text-deepblue"
            >
              Dashboard ↗
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-10 px-4 py-8">
        <p className="text-sm text-slate">
          Log annual Facility Reporting Period data first, then activity
          data — one at a time or in bulk via CSV. Entries are stored in
          Supabase and persist across sessions.
        </p>

        {loadError && (
          <p className="card text-sm text-red-700" role="alert">
            {loadError}
          </p>
        )}

        <div ref={facilitySectionRef} className="space-y-6">
          <h2 className="text-xl font-bold text-deepblue">
            Step 1 — Facility Reporting Period
          </h2>
          <FacilityForm prefill={frpPrefill} onAdd={addFacilityEntry} />
          <FacilityTable entries={facilityEntries} />
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold text-deepblue">Step 2 — Activity Data</h2>
          <EntryForm
            facilityPeriods={facilityEntries}
            onAdd={addEntry}
            onBlocked={handleBlocked}
          />
          <CsvImport facilityPeriods={facilityEntries} onImportComplete={handleImportComplete} />
          <DataReview
            rows={reviewRows}
            facilityPeriods={facilityEntries}
            onPromote={promoteReviewRow}
            onDiscard={discardReviewRow}
          />
          <EntryTable entries={entries} />
        </div>
      </main>
    </div>
  )
}
