import { Fragment } from 'react'
import SourceRow from './SourceRow.jsx'
import InfoIcon from './InfoIcon.jsx'
import { getScopeTooltip, getCategoryTooltip } from '../lib/tooltips.js'

const SCOPE_ORDER = ['Scope 1', 'Scope 2', 'Scope 3', 'Unclassified']

function sumTco2e(rows) {
  return rows.reduce((sum, r) => sum + (r.result_tco2e ?? 0), 0)
}

/**
 * Full-bleed inventory table (no max-width wrapper). Scope is a collapsible
 * section header — the heading itself is the toggle, no separate chevron
 * button. Category is a shaded sub-header row spanning the table width,
 * independently collapsible from its Scope. Each emission_source is a table
 * row: Emission Source / Emissions (tCO2eq) / Confidence / Validation.
 */
export default function InventoryTable({
  results,
  selectedScopes,
  expandedScopes,
  expandedCategories,
  onToggleScope,
  onToggleCategory,
  onStatusChange,
  pinnedRowId,
  onTogglePin,
}) {
  const visibleScopes = SCOPE_ORDER.filter((s) => s === 'Unclassified' || selectedScopes.has(s))

  const byScope = new Map(visibleScopes.map((s) => [s, []]))
  for (const r of results) {
    const scopeKey = r.scope ?? 'Unclassified'
    if (!byScope.has(scopeKey)) continue
    byScope.get(scopeKey).push(r)
  }

  return (
    <div className="w-full space-y-3">
      {visibleScopes.map((scope) => {
        const rows = byScope.get(scope) || []
        const isOpen = expandedScopes.has(scope)
        const isUnclassified = scope === 'Unclassified'

        const byCategory = new Map()
        for (const r of rows) {
          const catKey = r.category ?? 'no EF found'
          if (!byCategory.has(catKey)) byCategory.set(catKey, [])
          byCategory.get(catKey).push(r)
        }

        return (
          <div key={scope} className="border border-line">
            <div
              role="button"
              tabIndex={0}
              onClick={() => onToggleScope(scope)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onToggleScope(scope)
                }
              }}
              className="w-full flex items-center justify-between px-4 py-3 bg-surface-strong text-on-surface-strong cursor-pointer outline-none"
            >
              <span className="font-semibold flex items-center gap-1.5">
                {isUnclassified ? 'Unclassified — no EF found' : scope}
                {!isUnclassified && <InfoIcon text={getScopeTooltip(scope)} />}
              </span>
              <span className="data-face text-sm flex items-center gap-3">
                {rows.length > 0 ? `${sumTco2e(rows).toFixed(3)} tCO2eq` : 'No results'}
                <span aria-hidden="true">{isOpen ? '▾' : '▸'}</span>
              </span>
            </div>

            {isOpen && rows.length > 0 && (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-t border-line text-left text-xs uppercase tracking-wide text-slate">
                    <th className="px-3 py-2 font-medium">Emission Source</th>
                    <th className="px-3 py-2 font-medium text-right">Emissions (tCO2eq)</th>
                    <th className="px-3 py-2 font-medium">Confidence</th>
                    <th className="px-3 py-2 font-medium">Validation</th>
                  </tr>
                </thead>
                <tbody>
                  {[...byCategory.entries()].map(([category, catRows]) => {
                    const categoryKey = `${scope}::${category}`
                    const catOpen = expandedCategories.has(categoryKey)
                    return (
                      <Fragment key={categoryKey}>
                        <tr className="border-t border-line">
                          <td colSpan={4} className="p-0">
                            <div
                              role="button"
                              tabIndex={0}
                              onClick={() => onToggleCategory(categoryKey)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault()
                                  onToggleCategory(categoryKey)
                                }
                              }}
                              className="w-full flex items-center justify-between px-3 py-2 bg-offwhite text-ink cursor-pointer outline-none"
                            >
                              <span className="text-sm font-medium flex items-center gap-1.5">
                                {category}
                                {category !== 'no EF found' && <InfoIcon text={getCategoryTooltip(category)} />}
                              </span>
                              <span className="data-face text-xs text-slate flex items-center gap-2">
                                {sumTco2e(catRows).toFixed(3)} tCO2eq
                                <span aria-hidden="true">{catOpen ? '▾' : '▸'}</span>
                              </span>
                            </div>
                          </td>
                        </tr>
                        {catOpen &&
                          catRows.map((r) => (
                            <SourceRow
                              key={r.id}
                              result={r}
                              isPinned={pinnedRowId === r.id}
                              onTogglePin={() => onTogglePin(pinnedRowId === r.id ? null : r.id)}
                              onClosePin={() => onTogglePin(null)}
                              onStatusChange={onStatusChange}
                            />
                          ))}
                      </Fragment>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        )
      })}
    </div>
  )
}
