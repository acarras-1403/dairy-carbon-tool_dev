import { useEffect, useState } from 'react'
import EmissionsDashboard from './components/EmissionsDashboard.jsx'
import ActivityDataEntry from './components/ActivityDataEntry.jsx'
import FacilityModal from './components/FacilityModal.jsx'
import ThemeToggle from './components/ThemeToggle.jsx'
import { fetchFacilityReportingPeriods, fetchActivityData } from './lib/supabaseData.js'
import { enrichActivityRow, enrichFacilityRow } from './data/lookups.js'
import { getInitialTheme, applyTheme } from './lib/theme.js'

const TABS = [
  { id: 'dashboard', label: 'Emissions Dashboard' },
  { id: 'entry', label: 'Activity Data Entry' },
]

// Tier 2 (D3+A1, spec v7.0): both tables persist in Supabase and survive a
// closed tab or a separate session — RLS grants anon read+insert only, no
// update/delete anywhere in this frontend. Two top-level tabs only —
// Facility Data and past-entry review live inside Activity Data Entry (a
// modal and a tucked section, respectively), never as their own tabs.
// Emissions Dashboard is listed first in the nav (spec Section 8) but is
// NOT the default landing tab — once any activity_data exists, that tab
// immediately navigates away to Tool B, so defaulting to it would bounce
// every visitor off this tool before they could do anything. Activity Data
// Entry (this tool's actual purpose) is the default; Emissions Dashboard
// still redirects correctly when a visitor clicks it deliberately.
export default function App() {
  const [activeTab, setActiveTab] = useState('entry')
  const [theme, setTheme] = useState(getInitialTheme)

  const [entries, setEntries] = useState([])
  const [facilityEntries, setFacilityEntries] = useState([])
  const [reviewRows, setReviewRows] = useState([])
  const [loadError, setLoadError] = useState('')
  const [dataLoaded, setDataLoaded] = useState(false)

  const [facilityModal, setFacilityModal] = useState({ open: false, blocked: false, prefill: null })

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
    setFacilityModal({ open: false, blocked: false, prefill: null })
  }

  function openFacilityModal(prefill = null) {
    setFacilityModal({ open: true, blocked: false, prefill })
  }

  function handleBlocked(prefill) {
    setFacilityModal({ open: true, blocked: true, prefill })
  }

  function closeFacilityModal() {
    setFacilityModal((m) => ({ ...m, open: false }))
  }

  return (
    <div className="min-h-screen bg-offwhite">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="inline-block h-4 w-4 rounded-sm bg-accent" aria-hidden />
            <span className="text-base font-bold text-accent">PurePastures GHG</span>
          </div>
          <div className="flex items-center gap-2">
            <nav className="flex items-center gap-2 text-sm font-medium">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={
                    activeTab === tab.id
                      ? 'rounded-md bg-accent/10 px-3 py-1.5 text-accent'
                      : 'rounded-md px-3 py-1.5 text-slate transition hover:bg-accent/5 hover:text-ink'
                  }
                >
                  {tab.label}
                </button>
              ))}
            </nav>
            <ThemeToggle theme={theme} onToggle={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-8 px-4 py-8">
        {loadError && (
          <p className="card text-sm text-red-700 dark:text-red-400" role="alert">
            {loadError}
          </p>
        )}

        {activeTab === 'dashboard' && (
          <EmissionsDashboard
            loading={!dataLoaded}
            hasData={entries.length > 0}
            onSwitchToEntry={() => setActiveTab('entry')}
          />
        )}

        {activeTab === 'entry' && (
          <ActivityDataEntry
            entries={entries}
            facilityEntries={facilityEntries}
            reviewRows={reviewRows}
            onAddEntry={addEntry}
            onImportComplete={handleImportComplete}
            onPromoteReviewRow={promoteReviewRow}
            onDiscardReviewRow={discardReviewRow}
            onOpenFacilityModal={openFacilityModal}
            onBlocked={handleBlocked}
          />
        )}
      </main>

      <FacilityModal
        open={facilityModal.open}
        blocked={facilityModal.blocked}
        prefill={facilityModal.prefill}
        facilityEntries={facilityEntries}
        onAdd={addFacilityEntry}
        onClose={closeFacilityModal}
      />
    </div>
  )
}
