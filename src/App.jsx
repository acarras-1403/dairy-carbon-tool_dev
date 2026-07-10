import { useState } from 'react'
import EntryForm from './components/EntryForm.jsx'
import EntryTable from './components/EntryTable.jsx'

// Tier 1 (D2+A1): all state is in-memory for this tab only. No login, no
// database — refreshing or closing the tab clears everything not exported.
export default function App() {
  const [entries, setEntries] = useState([])

  function addEntry(entry) {
    setEntries((prev) => [entry, ...prev])
  }

  function removeEntry(id) {
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }

  return (
    <div className="min-h-screen bg-offwhite">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-4xl items-center gap-2 px-4 py-3">
          <span className="inline-block h-4 w-4 rounded-sm bg-lime" aria-hidden />
          <span className="text-base font-bold text-deepblue">
            PurePastures GHG — Data Entry (MVP)
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-8 px-4 py-8">
        <p className="text-sm text-slate">
          Log raw GHG activity data below. Nothing is saved on a server —
          download your entries as CSV before closing this tab.
        </p>
        <EntryForm onAdd={addEntry} />
        <EntryTable entries={entries} onRemove={removeEntry} />
      </main>
    </div>
  )
}
