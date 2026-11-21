const SECTIONS = [
  { id: 'home', label: 'Home' },
  { id: 'facility', label: 'Reporting Unit' },
  { id: 'entry', label: 'Activity Data Entry' },
  { id: 'results', label: 'Results' },
]

// Lateral nav, persistent across the whole app — replaces the old top tab
// bar. Horizontal strip on narrow screens, vertical sidebar from the `sm`
// breakpoint up.
export default function Sidebar({ activeSection, onNavigate }) {
  return (
    <nav
      className="flex shrink-0 gap-1 overflow-x-auto border-b border-line p-2 sm:w-56 sm:flex-col sm:overflow-visible sm:border-b-0 sm:border-r sm:p-4"
      aria-label="Main"
    >
      {SECTIONS.map((section) => (
        <button
          key={section.id}
          type="button"
          onClick={() => onNavigate(section.id)}
          aria-current={activeSection === section.id ? 'page' : undefined}
          className={
            activeSection === section.id
              ? 'shrink-0 rounded-md bg-accent/10 px-3 py-2 text-left text-sm font-medium text-accent'
              : 'shrink-0 rounded-md px-3 py-2 text-left text-sm font-medium text-slate transition hover:bg-accent/5 hover:text-ink'
          }
        >
          {section.label}
        </button>
      ))}
    </nav>
  )
}
