import { useEffect, useMemo, useState } from 'react'
import FilterBar from './FilterBar.jsx'
import ScopeDiagram from './ScopeDiagram.jsx'
import InventoryTable from './InventoryTable.jsx'
import ForecastPanel from './ForecastPanel.jsx'
import { fetchDashboardData } from '../lib/dataFetch.js'
import { recalculate } from '../lib/calculationEngine.js'
import { computeForecast } from '../lib/forecast.js'
import { downloadCsv } from '../lib/csvExport.js'
import { downloadPdf } from '../lib/pdfExport.js'

const SCOPE_ORDER = ['Scope 1', 'Scope 2', 'Scope 3', 'Unclassified']
const ALL_SCOPES = new Set(['Scope 1', 'Scope 2', 'Scope 3'])
const ALL_VALIDATION = new Set(['pending', 'approved', 'flagged'])

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [recalcState, setRecalcState] = useState('idle') // idle | running | done | error
  const [recalcMessage, setRecalcMessage] = useState('')

  const [facility, setFacility] = useState('')
  const [year, setYear] = useState('')
  const [selectedScopes, setSelectedScopes] = useState(ALL_SCOPES)
  const [selectedValidation, setSelectedValidation] = useState(ALL_VALIDATION)

  const [expandedScopes, setExpandedScopes] = useState(new Set(SCOPE_ORDER))
  const [expandedCategories, setExpandedCategories] = useState(new Set())
  const [pinnedRowId, setPinnedRowId] = useState(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const fresh = await fetchDashboardData()
      setData(fresh)
      // Expand all categories by default once data is known.
      const allCategoryKeys = new Set()
      for (const r of fresh.results) {
        const scopeKey = r.scope ?? 'Unclassified'
        const catKey = r.category ?? 'no EF found'
        allCategoryKeys.add(`${scopeKey}::${catKey}`)
      }
      setExpandedCategories(allCategoryKeys)
    } catch (e) {
      setError(e.message || String(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const facilities = useMemo(() => {
    if (!data) return []
    return [...new Set(data.activityRows.map((a) => a.facility))].sort()
  }, [data])

  const years = useMemo(() => {
    if (!data) return []
    return [...new Set(data.activityRows.map((a) => a.reporting_period.slice(0, 4)))].sort()
  }, [data])

  // Facility / Year / Validation status narrow this set together — Scope is
  // applied separately by the diagram and the table so both can render only
  // the scopes currently selected while sharing this identical base.
  const filteredResults = useMemo(() => {
    if (!data) return []
    return data.results.filter((r) => {
      if (!r.activity) return false
      if (facility && r.activity.facility !== facility) return false
      if (year && r.activity.reporting_period.slice(0, 4) !== year) return false
      if (!selectedValidation.has(r.validation_status)) return false
      return true
    })
  }, [data, facility, year, selectedValidation])

  const forecast = useMemo(() => {
    if (!data) return null
    return computeForecast(data.activityRows, data.results, new Date().getFullYear())
  }, [data])

  function toggleScope(scope) {
    setSelectedScopes((prev) => {
      const next = new Set(prev)
      if (next.has(scope)) next.delete(scope)
      else next.add(scope)
      return next
    })
  }

  function toggleExpandedScope(scope) {
    setExpandedScopes((prev) => {
      const next = new Set(prev)
      if (next.has(scope)) next.delete(scope)
      else next.add(scope)
      return next
    })
  }

  function toggleCategory(key) {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function onStatusChange(resultId, newStatus) {
    setData((prev) => ({
      ...prev,
      results: prev.results.map((r) => (r.id === resultId ? { ...r, validation_status: newStatus } : r)),
    }))
  }

  async function handleRecalculate() {
    setRecalcState('running')
    setRecalcMessage('')
    try {
      const { inserted, updated } = await recalculate()
      await load()
      setRecalcState('done')
      setRecalcMessage(`Recalculated: ${inserted} new row(s), ${updated} updated.`)
    } catch (e) {
      setRecalcState('error')
      setRecalcMessage(e.message || String(e))
    }
  }

  async function handleCsv() {
    const fresh = await fetchDashboardData()
    const forecastForCsv = computeForecast(fresh.activityRows, fresh.results, new Date().getFullYear())
    downloadCsv(fresh.results, forecastForCsv)
  }

  async function handlePdf() {
    const fresh = await fetchDashboardData()
    await downloadPdf(fresh)
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl">
        <p className="card text-sm text-slate">Loading…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl">
        <p className="card text-sm text-danger" role="alert">
          Error loading data: {error}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="card flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate">
            Recalculate after new or changed Activity Data, or export the
            current results.
          </p>
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              type="button"
              onClick={handleRecalculate}
              disabled={recalcState === 'running'}
              className="btn-primary border border-accent"
            >
              {recalcState === 'running' ? 'Recalculating…' : 'Recalculate'}
            </button>
            <button type="button" onClick={handleCsv} className="btn-secondary">
              Download CSV
            </button>
            <button type="button" onClick={handlePdf} className="btn-secondary">
              Download PDF
            </button>
          </div>
        </div>

        {recalcMessage && (
          <p className={recalcState === 'error' ? 'text-danger text-sm' : 'text-slate text-sm'}>{recalcMessage}</p>
        )}

        <div className="card p-4 text-xs text-slate">
          Calculated figures rely on Tool A's activity_data_value_converted, which
          currently uses a placeholder conversion_factor (flat 1.0, status 'TBD').
          These results are not final until Tool A supplies real conversion values.
        </div>

        <div className="card p-4 text-sm text-ink space-y-1.5">
          <h2 className="font-serif font-semibold">About this dashboard</h2>
          <p>
            This page shows PurePastures' calculated greenhouse gas emissions, built from activity data already
            recorded and matched against the emission factor database. Results are broken down by Scope 1, 2, and 3.
          </p>
          <p className="text-slate">
            The diagram below gives a quick scope-level view — click a bar to filter by scope. The inventory table
            underneath it breaks results down to the level of a single activity, with data quality, validation
            status, and a full audit trail available for every number.
          </p>
        </div>

        <FilterBar
          facilities={facilities}
          years={years}
          facility={facility}
          year={year}
          onFacilityChange={setFacility}
          onYearChange={setYear}
          selectedScopes={selectedScopes}
          onScopeChange={setSelectedScopes}
          selectedValidation={selectedValidation}
          onValidationChange={setSelectedValidation}
        />

        <ScopeDiagram results={filteredResults} selectedScopes={selectedScopes} onToggleScope={toggleScope} />

        <ForecastPanel forecast={forecast} />
      </div>

      {/* Full-bleed — no max-width wrapper (brand hard rule: the inventory
          table never narrows to the page's usual content width). */}
      <InventoryTable
        results={filteredResults}
        selectedScopes={selectedScopes}
        expandedScopes={expandedScopes}
        expandedCategories={expandedCategories}
        onToggleScope={toggleExpandedScope}
        onToggleCategory={toggleCategory}
        onStatusChange={onStatusChange}
        pinnedRowId={pinnedRowId}
        onTogglePin={setPinnedRowId}
      />
    </div>
  )
}
