import { useEffect } from 'react'

// This tool created the schema and never renders Tool B's dashboard
// content itself (D-12) — this is a data-existence check plus a
// conditional redirect, nothing more (spec v7.0 Section 8/9).
const DASHBOARD_URL = 'https://ghgdashboarddev.netlify.app/'

export default function EmissionsDashboard({ loading, hasData, onSwitchToEntry }) {
  useEffect(() => {
    if (!loading && hasData) {
      window.location.href = DASHBOARD_URL
    }
  }, [loading, hasData])

  if (loading || hasData) return null

  return (
    <div className="card flex flex-col items-center gap-4 py-16 text-center">
      <p className="text-sm text-slate">
        No data available. Please add data in the Activity Data Entry tab.
      </p>
      <button type="button" className="btn-primary" onClick={onSwitchToEntry}>
        Go to Activity Data Entry
      </button>
    </div>
  )
}
