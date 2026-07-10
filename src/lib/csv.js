// Minimal CSV writer — the only thing this session-only tool needs (no
// bulk-upload parsing in Tier 1).

function escapeCell(value) {
  const v = value == null ? '' : String(value)
  if (/[",\n\r]/.test(v)) return '"' + v.replace(/"/g, '""') + '"'
  return v
}

export function toCsv(columns, records) {
  const header = columns.map((c) => escapeCell(c.label ?? c.key)).join(',')
  const lines = records.map((rec) =>
    columns.map((c) => escapeCell(rec[c.key])).join(','),
  )
  return [header, ...lines].join('\n')
}

export function downloadCsv(filename, csvText) {
  const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
