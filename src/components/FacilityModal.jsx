import { FACILITIES } from '../data/lookups.js'
import FacilityForm from './FacilityForm.jsx'
import FacilityTable from './FacilityTable.jsx'
import Collapsible from './Collapsible.jsx'

// Facility Data modal (spec v7.0 Section 8) — replaces the old Facility
// Reporting Period page/step and its Records tab. Opened manually via the
// button in Activity Data Entry, or automatically when D-13's blocking
// validation finds no match; `prefill` carries the facility+year in either
// case, `blocked` decides whether the warning banner shows.
export default function FacilityModal({ open, blocked, prefill, facilityEntries, onAdd, onClose }) {
  if (!open) return null

  const facilityName = FACILITIES.find((f) => f.id === prefill?.facility_id)?.name

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 px-4 py-8"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Facility Data"
        className="card w-full max-w-2xl space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-xl font-bold text-accent">Facility Data</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-slate transition hover:bg-accent/10 hover:text-ink"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <p className="text-sm text-slate">
          This data is what lets the tool calculate intensity, choose the
          correct emission factor for the year and location, and support
          setting reduction targets later.
        </p>

        {blocked && (
          <p className="rounded-md bg-lime/20 px-3 py-2 text-sm font-medium text-ink" role="alert">
            No facility data on file for {facilityName ?? 'this facility'} in{' '}
            {prefill?.reporting_year ?? 'this year'}. Add it below to continue.
          </p>
        )}

        <FacilityForm prefill={prefill} onAdd={onAdd} />

        <Collapsible title="Past facility data entries" count={facilityEntries.length}>
          <FacilityTable entries={facilityEntries} />
        </Collapsible>
      </div>
    </div>
  )
}
