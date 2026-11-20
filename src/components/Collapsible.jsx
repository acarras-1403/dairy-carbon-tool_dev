import { useState } from 'react'

// Collapsed-by-default disclosure (spec v7.0 Section 8) — replaces v6.0's
// separate Records tabs. Used for "Past activity data entries" at the
// bottom of Activity Data Entry and "Past facility data entries" inside the
// Facility Data modal. Purely presentational: children render only what the
// caller passes, this just owns the expand/collapse state.
export default function Collapsible({ title, count, children }) {
  const [open, setOpen] = useState(false)

  return (
    <section className="card space-y-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-left"
        aria-expanded={open}
      >
        <h2 className="font-serif text-lg font-semibold text-accent">
          {title}
          {typeof count === 'number' ? ` (${count})` : ''}
        </h2>
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`shrink-0 text-slate transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && <div className="space-y-4">{children}</div>}
    </section>
  )
}
