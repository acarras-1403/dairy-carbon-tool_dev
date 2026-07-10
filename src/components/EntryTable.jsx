import { toCsv, downloadCsv } from '../lib/csv.js'

const COLUMNS = [
  { key: 'reporting_period', label: 'Reporting period' },
  { key: 'facility_name', label: 'Facility' },
  { key: 'category_name', label: 'Category' },
  { key: 'subcategory_name', label: 'Subcategory' },
  { key: 'source_name', label: 'Emission source' },
  { key: 'activity_data_value', label: 'Value' },
  { key: 'activity_data_unit', label: 'Unit' },
  { key: 'data_quality_rating', label: 'Data quality' },
  { key: 'notes', label: 'Notes' },
]

export default function EntryTable({ entries, onRemove }) {
  function handleDownload() {
    downloadCsv('purepastures-activity-data.csv', toCsv(COLUMNS, entries))
  }

  return (
    <section className="card space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-deepblue">
          Session entries ({entries.length})
        </h2>
        <button className="btn-accent" disabled={!entries.length} onClick={handleDownload}>
          Download CSV
        </button>
      </div>

      {entries.length === 0 ? (
        <p className="text-sm text-slate">
          No entries yet this session. Add one above — entries are not saved
          anywhere and disappear if you refresh or close this tab.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-slate">
                <th className="py-2 pr-3">Period</th>
                <th className="py-2 pr-3">Facility</th>
                <th className="py-2 pr-3">Category</th>
                <th className="py-2 pr-3">Source</th>
                <th className="py-2 pr-3 text-right">Value</th>
                <th className="py-2 pr-3">Unit</th>
                <th className="py-2 pr-3">Quality</th>
                <th className="py-2 pr-3">Notes</th>
                <th className="py-2 pr-3"></th>
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
                    {Number(row.activity_data_value).toLocaleString()}
                  </td>
                  <td className="py-2 pr-3">{row.activity_data_unit}</td>
                  <td className="py-2 pr-3">{row.data_quality_rating}</td>
                  <td className="py-2 pr-3 max-w-xs text-slate">{row.notes}</td>
                  <td className="py-2 pr-3">
                    <button className="btn-ghost px-2 py-1" onClick={() => onRemove(row.id)}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
