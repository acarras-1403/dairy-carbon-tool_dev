import { toCsv, downloadCsv } from '../lib/csv.js'

const COLUMNS = [
  { key: 'reporting_period', label: 'Reporting period' },
  { key: 'facility_name', label: 'Facility' },
  { key: 'category_name', label: 'Category' },
  { key: 'subcategory_name', label: 'Subcategory' },
  { key: 'source_name', label: 'Emission source' },
  { key: 'activity_data_value_raw', label: 'Value (raw)' },
  { key: 'activity_data_unit_raw', label: 'Unit (raw)' },
  { key: 'activity_data_value_converted', label: 'Value (converted)' },
  { key: 'activity_data_unit_converted', label: 'Unit (converted)' },
  { key: 'data_quality_rating', label: 'Data quality' },
  { key: 'evidence_link', label: 'Evidence link' },
  { key: 'reviewer', label: 'Reviewer' },
  { key: 'notes', label: 'Notes' },
]

// Reflects every persisted Activity Data record (spec v5.0 — no longer
// session-scoped); no edit/delete anywhere here, matching the RLS policies
// (insert-only, no update/delete grant).
export default function EntryTable({ entries }) {
  function handleDownload() {
    downloadCsv('purepastures-activity-data.csv', toCsv(COLUMNS, entries))
  }

  return (
    <section className="card space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-deepblue">
          Activity data — all records ({entries.length})
        </h2>
        <button className="btn-accent" disabled={!entries.length} onClick={handleDownload}>
          Download Activity Data CSV
        </button>
      </div>

      {entries.length === 0 ? (
        <p className="text-sm text-slate">No activity data entries yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-slate">
                <th className="py-2 pr-3">Period</th>
                <th className="py-2 pr-3">Facility</th>
                <th className="py-2 pr-3">Category</th>
                <th className="py-2 pr-3">Source</th>
                <th className="py-2 pr-3 text-right">Raw value</th>
                <th className="py-2 pr-3">Raw unit</th>
                <th className="py-2 pr-3 text-right">Converted value</th>
                <th className="py-2 pr-3">Converted unit</th>
                <th className="py-2 pr-3">Quality</th>
                <th className="py-2 pr-3">Evidence link</th>
                <th className="py-2 pr-3">Reviewer</th>
                <th className="py-2 pr-3">Notes</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((row) => (
                <tr key={row.id} className="border-b border-line align-top">
                  <td className="py-2 pr-3 whitespace-nowrap">{row.reporting_period}</td>
                  <td className="py-2 pr-3">{row.facility_name}</td>
                  <td className="py-2 pr-3">{row.category_name}</td>
                  <td className="py-2 pr-3">{row.source_name}</td>
                  <td className="py-2 pr-3 text-right">
                    {Number(row.activity_data_value_raw).toLocaleString()}
                  </td>
                  <td className="py-2 pr-3">{row.activity_data_unit_raw}</td>
                  <td className="py-2 pr-3 text-right">
                    {row.activity_data_value_converted === ''
                      ? '—'
                      : Number(row.activity_data_value_converted).toLocaleString()}
                  </td>
                  <td className="py-2 pr-3">{row.activity_data_unit_converted}</td>
                  <td className="py-2 pr-3">{row.data_quality_rating}</td>
                  <td className="py-2 pr-3 max-w-xs truncate text-slate" title={row.evidence_link}>
                    {row.evidence_link}
                  </td>
                  <td className="py-2 pr-3">{row.reviewer}</td>
                  <td className="py-2 pr-3 max-w-xs text-slate">{row.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
