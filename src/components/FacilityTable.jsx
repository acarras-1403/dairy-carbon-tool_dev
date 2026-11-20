import { toCsv, downloadCsv } from '../lib/csv.js'

const COLUMNS = [
  { key: 'facility_name', label: 'Facility' },
  { key: 'reporting_year', label: 'Reporting year' },
  { key: 'facility_country', label: 'Country' },
  { key: 'production_volume', label: 'Production volume' },
  { key: 'production_unit', label: 'Production unit' },
  { key: 'annual_revenue', label: 'Annual revenue' },
  { key: 'currency', label: 'Currency' },
]

// Reflects every persisted Facility Data record (spec v7.0 — tucked inside
// the Facility Data modal's "Past facility data entries" Collapsible); no
// edit/delete anywhere here, matching the RLS policies (insert-only, no
// update/delete grant).
export default function FacilityTable({ entries }) {
  function handleDownload() {
    downloadCsv('purepastures-facility-data.csv', toCsv(COLUMNS, entries))
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button className="btn-secondary" disabled={!entries.length} onClick={handleDownload}>
          Download Facility Data CSV
        </button>
      </div>

      {entries.length === 0 ? (
        <p className="text-sm text-slate">No facility reporting period entries yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-slate">
                <th className="py-2 pr-3">Facility</th>
                <th className="py-2 pr-3">Year</th>
                <th className="py-2 pr-3">Country</th>
                <th className="py-2 pr-3 text-right">Production</th>
                <th className="py-2 pr-3 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((row) => (
                <tr key={row.id} className="border-b border-line align-top">
                  <td className="py-2 pr-3">{row.facility_name}</td>
                  <td className="py-2 pr-3">{row.reporting_year}</td>
                  <td className="py-2 pr-3">{row.facility_country}</td>
                  <td className="py-2 pr-3 text-right whitespace-nowrap">
                    {Number(row.production_volume).toLocaleString()} {row.production_unit}
                  </td>
                  <td className="py-2 pr-3 text-right whitespace-nowrap">
                    {Number(row.annual_revenue).toLocaleString()} {row.currency}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
