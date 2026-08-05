import EntryForm from './EntryForm.jsx'
import EntryTable from './EntryTable.jsx'
import CsvImport from './CsvImport.jsx'
import DataReview from './DataReview.jsx'
import Collapsible from './Collapsible.jsx'

// Single tab for everything related to logging activity data (spec v7.0
// Section 8) — intro copy, the Facility Data entry point, bulk import,
// manual entry, and a tucked past-entries section, top to bottom in the
// order the spec lists them. Facility Reporting Period is no longer its
// own step/page; it's reached only through the "Facility Data" button
// below or automatically on a blocked submit (App.jsx owns the modal).
export default function ActivityDataEntry({
  entries,
  facilityEntries,
  reviewRows,
  onAddEntry,
  onImportComplete,
  onPromoteReviewRow,
  onDiscardReviewRow,
  onOpenFacilityModal,
  onBlocked,
}) {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-xl font-bold text-accent">Activity Data Entry</h1>
        <p className="text-sm text-slate">
          Log raw GHG activity data — manually or via bulk CSV. Activity data
          is what the tool converts and, later, uses to calculate emissions;
          each entry needs a matching Facility Data record for its facility
          and year before it can be saved.
        </p>
      </div>

      <div className="card flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate">
          Facility data (production volume, revenue, country) is entered
          separately, once per year per facility.
        </p>
        <button type="button" className="btn-primary shrink-0" onClick={() => onOpenFacilityModal()}>
          Facility Data
        </button>
      </div>

      <CsvImport facilityPeriods={facilityEntries} onImportComplete={onImportComplete} />

      <DataReview
        rows={reviewRows}
        facilityPeriods={facilityEntries}
        onPromote={onPromoteReviewRow}
        onDiscard={onDiscardReviewRow}
        onOpenFacilityModal={onOpenFacilityModal}
      />

      <EntryForm facilityPeriods={facilityEntries} onAdd={onAddEntry} onBlocked={onBlocked} />

      <Collapsible title="Past activity data entries" count={entries.length}>
        <EntryTable entries={entries} />
      </Collapsible>
    </div>
  )
}
