// Small line-art icons (brand doc: "simple line icons in granate or sage,
// no stock imagery"). Pure SVG, inherit currentColor, sized by the caller.
const base = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }

export function IconBuilding(props) {
  return (
    <svg {...base} width="18" height="18" {...props}>
      <rect x="4" y="3" width="16" height="18" rx="1" />
      <path d="M9 8h1M14 8h1M9 12h1M14 12h1M9 16h1M14 16h1" />
    </svg>
  )
}

export function IconDocument(props) {
  return (
    <svg {...base} width="18" height="18" {...props}>
      <path d="M7 3h7l4 4v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
      <path d="M14 3v4h4" />
    </svg>
  )
}

export function IconLeaf(props) {
  return (
    <svg {...base} width="18" height="18" {...props}>
      <path d="M5 19c8 0 14-6 14-14-8 0-14 6-14 14Z" />
      <path d="M5 19c2-5 6-9 11-11" />
    </svg>
  )
}

export function IconCheck(props) {
  return (
    <svg {...base} width="18" height="18" {...props}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

export function IconWarning(props) {
  return (
    <svg {...base} width="18" height="18" {...props}>
      <path d="M12 3 2 20h20L12 3Z" />
      <path d="M12 10v4M12 17h.01" />
    </svg>
  )
}

export function IconClock(props) {
  return (
    <svg {...base} width="18" height="18" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  )
}

export function IconChart(props) {
  return (
    <svg {...base} width="18" height="18" {...props}>
      <path d="M4 20V10M12 20V4M20 20v-7" />
    </svg>
  )
}
