import InfoIcon from './InfoIcon.jsx'
import { getScopeTooltip } from '../lib/tooltips.js'
import { buildCategoryColorMap } from '../lib/categoryColors.js'

const SCOPES = ['Scope 1', 'Scope 2', 'Scope 3']

function sumTco2e(rows) {
  return rows.reduce((sum, r) => sum + (r.result_tco2e ?? 0), 0)
}

/**
 * Horizontal stacked bar chart, one bar per Scope (Unclassified not plotted),
 * segmented by Category proportional to its share of the scope total.
 * `results` should already reflect the Facility/Year/Validation-status
 * filters but NOT the Scope filter — the Scope filter instead decides which
 * bars render at all (see Dashboard.jsx). Clicking a bar (or its label) is a
 * real toggle on the shared Scope filter, not a visual-only interaction.
 */
export default function ScopeDiagram({ results, selectedScopes, onToggleScope }) {
  const categoryColorMap = buildCategoryColorMap(results.map((r) => r.category).filter(Boolean))
  const legendCategories = [...categoryColorMap.keys()].sort()

  const visibleScopes = SCOPES.filter((s) => selectedScopes.has(s))

  return (
    <div className="card p-4">
      <div className="space-y-3">
        {visibleScopes.length === 0 && (
          <p className="text-sm text-slate">No scopes selected — use the Scope filter to show a bar.</p>
        )}

        {visibleScopes.map((scope) => {
          const rows = results.filter((r) => r.scope === scope)
          const total = sumTco2e(rows)

          const byCategory = new Map()
          for (const r of rows) {
            const cat = r.category ?? 'Uncategorized'
            byCategory.set(cat, (byCategory.get(cat) ?? 0) + (r.result_tco2e ?? 0))
          }
          const segments = [...byCategory.entries()].sort(([a], [b]) => a.localeCompare(b))

          return (
            <div
              key={scope}
              role="button"
              tabIndex={0}
              onClick={() => onToggleScope(scope)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onToggleScope(scope)
                }
              }}
              className="w-full text-left group/bar cursor-pointer outline-none"
              title={`Click to remove ${scope} from the filter`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="flex items-center gap-1.5 text-sm font-medium text-ink">
                  {scope}
                  <InfoIcon text={getScopeTooltip(scope)} />
                </span>
                <span className="data-face text-sm text-ink">{total.toFixed(3)} tCO2eq</span>
              </div>
              <div className="flex h-4 w-full overflow-hidden rounded-md bg-offwhite ring-1 ring-line gap-[2px]">
                {segments.length === 0 ? (
                  <div className="h-full w-full" />
                ) : (
                  segments.map(([cat, value]) => {
                    const pct = total > 0 ? (value / total) * 100 : 100 / segments.length
                    const slot = categoryColorMap.get(cat) ?? 0
                    return (
                      <div
                        key={cat}
                        className={`h-full cat-slot-${slot} transition-opacity group-hover/bar:opacity-90`}
                        style={{ width: `${pct}%` }}
                      />
                    )
                  })
                )}
              </div>
            </div>
          )
        })}
      </div>

      {legendCategories.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-line pt-3">
          {legendCategories.map((cat) => {
            const slot = categoryColorMap.get(cat)
            return (
              <span key={cat} className="flex items-center gap-1.5 text-xs text-slate">
                <span className={`h-2.5 w-2.5 rounded-sm cat-slot-${slot}`} />
                {cat}
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}
