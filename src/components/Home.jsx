import { useEffect, useMemo, useState } from 'react'
import StatTile from './StatTile.jsx'
import ScopePieChart from './ScopePieChart.jsx'
import { IconLeaf, IconDocument, IconBuilding, IconCheck, IconWarning } from './icons.jsx'
import { deriveHierarchy } from '../data/lookups.js'
import { currentYear } from '../lib/periods.js'
import { fetchDashboardData } from '../lib/dataFetch.js'

const SCOPE_META = [
  { key: 'Scope 1', color: 'var(--scope-1)' },
  { key: 'Scope 2', color: 'var(--scope-2)' },
  { key: 'Scope 3', color: 'var(--scope-3)' },
]

function shortScope(sourceId) {
  const name = deriveHierarchy(sourceId)?.scope_name ?? ''
  return name.match(/^Scope \d/)?.[0] ?? null
}

// Landing page (D-25-style IA change) — an at-a-glance view of the whole
// GHG-inventory workflow, not a detail view. Detail (per-row audit trail,
// filters, export) stays on Results; this page only answers "where do
// things stand and what's next."
export default function Home({ entries, facilityEntries, onNavigate }) {
  const [resultsData, setResultsData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetchDashboardData()
      .then((d) => {
        if (!cancelled) setResultsData(d)
      })
      .catch(() => {
        if (!cancelled) setResultsData({ results: [] })
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const year = currentYear()

  const hasReportingUnit = useMemo(
    () => facilityEntries.some((f) => Number(f.reporting_year) === year),
    [facilityEntries, year],
  )

  const scopeHasEntries = useMemo(() => {
    const present = new Set()
    for (const e of entries) {
      const s = shortScope(e.source_id)
      if (s) present.add(s)
    }
    return present
  }, [entries])

  const results = resultsData?.results ?? []
  const hasResults = results.length > 0

  const scopeTotals = useMemo(() => {
    const totals = new Map(SCOPE_META.map((s) => [s.key, 0]))
    for (const r of results) {
      if (r.result_tco2e == null || !totals.has(r.scope)) continue
      totals.set(r.scope, totals.get(r.scope) + r.result_tco2e)
    }
    return totals
  }, [results])

  const totalTco2e = [...scopeTotals.values()].reduce((a, b) => a + b, 0)
  const pendingCount = results.filter((r) => r.validation_status === 'pending').length
  const facilitiesOnFile = new Set(facilityEntries.filter((f) => Number(f.reporting_year) === year).map((f) => f.facility_id)).size

  const checklist = [
    {
      id: 'facility',
      label: `Reporting Unit on file for ${year}`,
      why: "Facility data (production volume, country) is what lets the tool pick the right emission factor and calculate intensity.",
      done: hasReportingUnit,
      goTo: 'facility',
    },
    {
      id: 'scope1',
      label: 'Scope 1 activity data entered',
      why: 'Direct emissions from fuel burned on-site or in company vehicles.',
      done: scopeHasEntries.has('Scope 1'),
      goTo: 'entry',
    },
    {
      id: 'scope2',
      label: 'Scope 2 activity data entered',
      why: 'Emissions from purchased electricity and other energy.',
      done: scopeHasEntries.has('Scope 2'),
      goTo: 'entry',
    },
    {
      id: 'scope3',
      label: 'Scope 3 activity data entered',
      why: 'Everything else in the value chain — packaging, waste, purchased goods, feed.',
      done: scopeHasEntries.has('Scope 3'),
      goTo: 'entry',
    },
    {
      id: 'results',
      label: 'Results calculated',
      why: 'Run Recalculate on the Results page to match activity data against emission factors.',
      done: hasResults,
      goTo: 'results',
    },
  ]
  const doneCount = checklist.filter((c) => c.done).length

  const missingScopes = SCOPE_META.filter((s) => !scopeHasEntries.has(s.key))

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="space-y-2">
        <h1 className="font-serif text-xl font-bold text-accent">Home</h1>
        <p className="text-sm text-slate">
          Where your GHG inventory stands right now, and what's left to do.
        </p>
      </div>

      <div className="card space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-serif text-lg font-semibold text-ink">
            {doneCount} of {checklist.length} complete
          </h2>
          <div className="h-2 w-32 overflow-hidden rounded-full bg-accent/10">
            <div
              className="h-full bg-accent transition-all"
              style={{ width: `${(doneCount / checklist.length) * 100}%` }}
            />
          </div>
        </div>
        <ul className="space-y-3">
          {checklist.map((item) => (
            <li key={item.id} className="flex items-start gap-3">
              <span
                className={
                  item.done
                    ? 'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/15 text-success'
                    : 'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/10 text-slate'
                }
              >
                {item.done ? <IconCheck width="12" height="12" /> : null}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink">{item.label}</p>
                <p className="text-xs text-slate">{item.why}</p>
              </div>
              {!item.done && (
                <button type="button" className="btn-ghost shrink-0 text-xs" onClick={() => onNavigate(item.goTo)}>
                  Go
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile icon={<IconLeaf />} value={loading ? '—' : totalTco2e.toFixed(1)} label="Total tCO2eq" />
        <StatTile icon={<IconDocument />} value={entries.length} label="Activity data entries" />
        <StatTile icon={<IconBuilding />} value={facilitiesOnFile} label="Facilities on file this year" />
        <StatTile icon={<IconWarning />} value={loading ? '—' : pendingCount} label="Pending validation" />
      </div>

      <div className="card space-y-4">
        <h2 className="font-serif text-lg font-semibold text-ink">Emissions by scope</h2>
        {loading ? (
          <p className="text-sm text-slate">Loading…</p>
        ) : totalTco2e > 0 ? (
          <ScopePieChart data={SCOPE_META.map((s) => ({ scope: s.key, value: scopeTotals.get(s.key) ?? 0, color: s.color }))} />
        ) : (
          <p className="text-sm text-slate">
            No calculated results yet. Add activity data and run Recalculate on the Results page.
          </p>
        )}

        {missingScopes.length > 0 && (
          <div className="space-y-2 border-t border-line pt-4">
            {missingScopes.map((s) => (
              <p key={s.key} className="flex items-center justify-between gap-3 text-sm text-slate">
                <span>No {s.key} activity data yet.</span>
                <button type="button" className="btn-ghost shrink-0 text-xs" onClick={() => onNavigate('entry')}>
                  Add activity data
                </button>
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
