import { useState } from 'react'
import EntryForm from './components/EntryForm.jsx'
import EntryTable from './components/EntryTable.jsx'
import CsvImport from './components/CsvImport.jsx'
import DataReview from './components/DataReview.jsx'

// Tier 1 (D2+A1): all state is in-memory for this tab only. No login, no
// database — refreshing or closing the tab clears everything not exported,
// including anything still sitting unresolved in Data Review.
export default function App() {
  const [entries, setEntries] = useState([])
  const [reviewRows, setReviewRows] = useState([])

  function addEntry(entry) {
    setEntries((prev) => [entry, ...prev])
  }

  function removeEntry(id) {
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }

  function handleImportComplete(clean, flagged) {
    if (clean.length) setEntries((prev) => [...clean, ...prev])
    if (flagged.length) setReviewRows((prev) => [...flagged, ...prev])
  }

  function promoteReviewRow(id, finalEntry) {
    setReviewRows((prev) => prev.filter((r) => r.id !== id))
    setEntries((prev) => [finalEntry, ...prev])
  }

  function discardReviewRow(id) {
    setReviewRows((prev) => prev.filter((r) => r.id !== id))
  }

  return (
    <div className="min-h-screen bg-offwhite">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-4xl items-center gap-2 px-4 py-3">
          <span className="inline-block h-4 w-4 rounded-sm bg-lime" aria-hidden />
          <span className="text-base font-bold text-deepblue">
            PurePastures GHG — Data Entry
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-8 px-4 py-8">
        <p className="text-sm text-slate">
          Log raw GHG activity data below, one at a time or in bulk via CSV.
          Nothing is saved on a server — download your entries as CSV before
          closing this tab.
        </p>
        <EntryForm onAdd={addEntry} />
        <CsvImport onImportComplete={handleImportComplete} />
        <DataReview rows={reviewRows} onPromote={promoteReviewRow} onDiscard={discardReviewRow} />
        <EntryTable entries={entries} onRemove={removeEntry} />
      </main>
    </div>
  )
}
