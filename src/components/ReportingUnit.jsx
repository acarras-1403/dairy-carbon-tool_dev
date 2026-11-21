import { FACILITIES } from '../data/lookups.js'
import FacilityForm from './FacilityForm.jsx'
import FacilityTable from './FacilityTable.jsx'
import Collapsible from './Collapsible.jsx'

// Reporting Unit page (promoted from the Facility Data modal — sidebar IA
// change). `FacilityForm`/`FacilityTable`/`Collapsible` are reused
// unchanged; only the surrounding chrome moved from a dialog to a page.
// Reached via the sidebar, or automatically (with `blocked`/`prefill` set)
// when Activity Data Entry's hard block fires — App.jsx owns that
// navigation, this component only renders what it's given.
export default function ReportingUnit({ blocked, prefill, facilityEntries, onAdd }) {
  const facilityName = FACILITIES.find((f) => f.id === prefill?.facility_id)?.name

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="space-y-2">
        <h1 className="font-serif text-xl font-bold text-accent">Reporting Unit</h1>
        <p className="text-sm text-slate">
          Facility data — production volume, annual revenue, country — entered
          once per year per facility. This is what lets the tool calculate
          intensity, choose the correct emission factor for the year and
          location, and support setting reduction targets later.
        </p>
      </div>

      {blocked && (
        <p className="card bg-surfaceAlt text-sm font-medium text-ink" role="alert">
          No facility data on file for {facilityName ?? 'this facility'} in{' '}
          {prefill?.reporting_year ?? 'this year'}. Add it below, then go back to Activity Data Entry to submit that entry again.
        </p>
      )}

      <FacilityForm prefill={prefill} onAdd={onAdd} />

      <Collapsible title="Past facility data entries" count={facilityEntries.length}>
        <FacilityTable entries={facilityEntries} />
      </Collapsible>
    </div>
  )
}
