import { useEffect, useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import Home from './components/Home.jsx'
import ReportingUnit from './components/ReportingUnit.jsx'
import EmissionsDashboard from './components/EmissionsDashboard.jsx'
import ActivityDataEntry from './components/ActivityDataEntry.jsx'
import ThemeToggle from './components/ThemeToggle.jsx'
import { fetchFacilityReportingPeriods, fetchActivityData } from './lib/supabaseData.js'
import { enrichActivityRow, enrichFacilityRow } from './data/lookups.js'
import { getInitialTheme, applyTheme } from './lib/theme.js'

// Tier 2 (D3+A1, spec v7.0): both tables persist in Supabase and survive a
// closed tab or a separate session — RLS grants anon read+insert only, no
// update/delete anywhere in this frontend. Sidebar IA (replaces the old
// two top tabs): Home is the default landing section — it's a progress
// view, not a workflow step, so it's always safe to land on regardless of
// whether any data exists yet.
export default function App() {
  const [activeSection, setActiveSection] = useState('home')
  const [theme, setTheme] = useState(getInitialTheme)

  const [entries, setEntries] = useState([])
  const [facilityEntries, setFacilityEntries] = useState([])
  const [reviewRows, setReviewRows] = useState([])
  const [loadError, setLoadError] = useState('')
  const [dataLoaded, setDataLoaded] = useState(false)

  // Reporting Unit's blocked-submit banner + prefill — a page can't be
  // "open" the way a modal was, so this just tracks whether the visit was
  // triggered by a hard block, and with what facility+year.
  const [facilityPrefill, setFacilityPrefill] = useState({ blocked: false, prefill: null })

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

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
      } finally {
        if (!cancelled) setDataLoaded(true)
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
    setFacilityPrefill({ blocked: false, prefill: null })
  }

  function goToReportingUnit(prefill = null) {
    setFacilityPrefill({ blocked: false, prefill })
    setActiveSection('facility')
  }

  function handleBlocked(prefill) {
    setFacilityPrefill({ blocked: true, prefill })
    setActiveSection('facility')
  }

  return (
    <div className="flex min-h-screen flex-col bg-offwhite">
      <header className="border-b border-line bg-surface">
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="inline-block h-4 w-4 rounded-sm bg-accent" aria-hidden />
            <span className="font-serif text-base font-bold text-accent">Company's Carbon Footprint</span>
          </div>
          <ThemeToggle theme={theme} onToggle={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))} />
        </div>
      </header>

      <div className="flex flex-1 flex-col sm:flex-row">
        <Sidebar activeSection={activeSection} onNavigate={setActiveSection} />

        <main className="flex-1 space-y-8 px-4 py-8">
          {loadError && (
            <p className="card mx-auto max-w-4xl text-sm text-danger" role="alert">
              {loadError}
            </p>
          )}

          {activeSection === 'home' && (
            <Home entries={entries} facilityEntries={facilityEntries} onNavigate={setActiveSection} />
          )}

          {activeSection === 'facility' && (
            <ReportingUnit
              blocked={facilityPrefill.blocked}
              prefill={facilityPrefill.prefill}
              facilityEntries={facilityEntries}
              onAdd={addFacilityEntry}
            />
          )}

          {activeSection === 'entry' && (
            <ActivityDataEntry
              entries={entries}
              facilityEntries={facilityEntries}
              reviewRows={reviewRows}
              onAddEntry={addEntry}
              onImportComplete={handleImportComplete}
              onPromoteReviewRow={promoteReviewRow}
              onDiscardReviewRow={discardReviewRow}
              onGoToReportingUnit={goToReportingUnit}
              onBlocked={handleBlocked}
            />
          )}

          {activeSection === 'results' && (
            <EmissionsDashboard
              loading={!dataLoaded}
              hasData={entries.length > 0}
              onSwitchToEntry={() => setActiveSection('entry')}
            />
          )}
        </main>
      </div>
    </div>
  )
}
