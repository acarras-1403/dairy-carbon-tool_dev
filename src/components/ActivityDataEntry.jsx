import { useMemo } from 'react'
import EntryForm from './EntryForm.jsx'
import EntryTable from './EntryTable.jsx'
import CsvImport from './CsvImport.jsx'
import DataReview from './DataReview.jsx'
import Collapsible from './Collapsible.jsx'
import StatTile from './StatTile.jsx'
import { IconDocument, IconLeaf, IconClock, IconWarning } from './icons.jsx'
import { currentPeriod } from '../lib/periods.js'

// Single page for everything related to logging activity data (spec v7.0
// Section 8) — intro copy, bulk import, manual entry, and a tucked
// past-entries section, top to bottom in the order the spec lists them.
// Facility Reporting Period is its own sidebar page now (Reporting Unit);
// this page keeps only a small inline link to it, since a blocked submit
// already navigates there automatically.
export default function ActivityDataEntry({
  entries,
  facilityEntries,
  reviewRows,
  onAddEntry,
  onImportComplete,
  onPromoteReviewRow,
  onDiscardReviewRow,
  onGoToReportingUnit,
  onBlocked,
}) {
  const thisPeriod = currentPeriod()
  const thisMonthCount = useMemo(
    () => entries.filter((e) => e.reporting_period === thisPeriod).length,
    [entries, thisPeriod],
  )
  const lastEntryDate = entries[0]?.reporting_period ?? null

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="space-y-2">
        <h1 className="font-serif text-xl font-bold text-accent">Activity Data Entry</h1>
        <p className="text-sm text-slate">
          Log raw GHG activity data — manually or via bulk CSV. Activity data
          is what the tool converts and, later, uses to calculate emissions;
          each entry needs a matching{' '}
          <button type="button" className="font-medium text-accent underline" onClick={() => onGoToReportingUnit()}>
            Reporting Unit
          </button>{' '}
          record for its facility and year before it can be saved.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile icon={<IconDocument />} value={entries.length} label="Total entries" />
        <StatTile icon={<IconLeaf />} value={thisMonthCount} label={`Entries this month (${thisPeriod})`} />
        <StatTile icon={<IconWarning />} value={reviewRows.length} label="Needs review" />
        <StatTile icon={<IconClock />} value={lastEntryDate ?? '—'} label="Last entry logged" />
      </div>

      <CsvImport facilityPeriods={facilityEntries} onImportComplete={onImportComplete} />

      <DataReview
        rows={reviewRows}
        facilityPeriods={facilityEntries}
        onPromote={onPromoteReviewRow}
        onDiscard={onDiscardReviewRow}
        onGoToReportingUnit={onGoToReportingUnit}
      />

      <EntryForm facilityPeriods={facilityEntries} onAdd={onAddEntry} onBlocked={onBlocked} />

      <Collapsible title="Past activity data entries" count={entries.length}>
        <EntryTable entries={entries} />
      </Collapsible>
    </div>
  )
}
