// Scope 1/2/3 pie chart (Home) — a genuinely different chart type from the
// Results page's stacked bar, by design (same data, different lens). Pure
// CSS conic-gradient, no imagery. Never color-only: every slice is also
// named and valued in the legend list beside it.
export default function ScopePieChart({ data }) {
  const total = data.reduce((sum, d) => sum + d.value, 0)

  let cumulative = 0
  const stops = data
    .filter((d) => d.value > 0)
    .map((d) => {
      const pct = (d.value / total) * 100
      const start = cumulative
      cumulative += pct
      return `${d.color} ${start}% ${cumulative}%`
    })

  const pieStyle =
    total > 0 ? { background: `conic-gradient(${stops.join(', ')})` } : { background: 'var(--border)' }

  return (
    <div className="flex flex-wrap items-center gap-6">
      <div className="h-36 w-36 shrink-0 rounded-full" style={pieStyle} aria-hidden="true" />
      <ul className="space-y-2">
        {data.map((d) => {
          const pct = total > 0 ? ((d.value / total) * 100).toFixed(0) : '0'
          return (
            <li key={d.scope} className="flex items-center gap-2 text-sm">
              <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: d.color }} aria-hidden="true" />
              <span className="font-medium text-ink">{d.scope}</span>
              <span className="data-face text-slate">
                {d.value.toFixed(2)} tCO2eq ({pct}%)
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
