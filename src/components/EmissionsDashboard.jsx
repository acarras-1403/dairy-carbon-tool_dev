import Dashboard from './Dashboard.jsx'

// Tool A created the schema; Tool B's calculation engine + dashboard now
// live here too (DECISIONS.md D-22 reverses D-12's earlier rejection of
// merging the two). Existence check unchanged: no activity_data rows yet
// -> local empty state; rows exist -> render the real dashboard in place
// (no longer an external redirect).
export default function EmissionsDashboard({ loading, hasData, onSwitchToEntry }) {
  if (loading) return null

  if (!hasData) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="card flex flex-col items-center gap-4 py-16 text-center">
          <p className="text-sm text-slate">
            No data available. Please add data in the Activity Data Entry tab.
          </p>
          <button type="button" className="btn-primary" onClick={onSwitchToEntry}>
            Go to Activity Data Entry
          </button>
        </div>
      </div>
    )
  }

  return <Dashboard />
}
