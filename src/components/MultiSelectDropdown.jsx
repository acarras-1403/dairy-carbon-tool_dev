import { useRef, useState } from 'react'
import { useClickOutside } from '../lib/useClickOutside.js'

export default function MultiSelectDropdown({ label, options, selected, onChange }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  useClickOutside(rootRef, () => setOpen(false), open)

  const allSelected = selected.size === options.length
  const summary = allSelected ? `All ${label.toLowerCase()}` : selected.size === 0 ? 'None selected' : `${selected.size} selected`

  function toggle(value) {
    const next = new Set(selected)
    if (next.has(value)) next.delete(value)
    else next.add(value)
    onChange(next)
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="field-input text-sm flex items-center gap-2 whitespace-nowrap"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="text-slate">{label}:</span>
        <span className="font-medium">{summary}</span>
        <span className="text-slate text-xs">{open ? '▾' : '▸'}</span>
      </button>

      {open && (
        <div
          role="listbox"
          className="card absolute left-0 top-full z-20 mt-1 min-w-full w-max p-2 shadow-lg"
        >
          {options.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-ink hover:bg-offwhite cursor-pointer whitespace-nowrap"
            >
              <input
                type="checkbox"
                checked={selected.has(opt.value)}
                onChange={() => toggle(opt.value)}
                className="h-4 w-4 rounded border-line accent-accent"
              />
              {opt.label}
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
