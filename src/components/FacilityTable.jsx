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

// Reflects every persisted Facility Reporting Period record (spec v5.0 —
// no longer session-scoped); no edit/delete anywhere here, matching the RLS
// policies (insert-only, no update/delete grant).
export default function FacilityTable({ entries }) {
  function handleDownload() {
    downloadCsv('purepastures-facility-reporting-period.csv', toCsv(COLUMNS, entries))
  }

  return (
    <section className="card space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-deepblue">
          Facility reporting period — all records ({entries.length})
        </h2>
        <button className="btn-accent" disabled={!entries.length} onClick={handleDownload}>
          Download Facility Reporting Period CSV
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
    </section>
  )
}
