// Dependency-free CSV reader + writer (spec Section 11 — no external
// services, so no papaparse/csv-parse).

// Handles quoted fields, embedded commas/newlines, and "" escaped quotes.
// Returns { headers, rows } where rows are objects keyed by header.
export function parseCsv(text) {
  const table = []
  let row = []
  let field = ''
  let inQuotes = false
  let i = 0
  const len = text.length

  while (i < len) {
    const char = text[i]
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i += 2
          continue
        }
        inQuotes = false
        i++
        continue
      }
      field += char
      i++
      continue
    }
    if (char === '"') {
      inQuotes = true
      i++
      continue
    }
    if (char === ',') {
      row.push(field)
      field = ''
      i++
      continue
    }
    if (char === '\r') {
      i++
      continue
    }
    if (char === '\n') {
      row.push(field)
      table.push(row)
      row = []
      field = ''
      i++
      continue
    }
    field += char
    i++
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field)
    table.push(row)
  }

  const nonEmpty = table.filter((r) => !(r.length === 1 && r[0].trim() === ''))
  if (nonEmpty.length === 0) return { headers: [], rows: [] }

  const [headerRow, ...dataRows] = nonEmpty
  const headers = headerRow.map((h) => h.trim())
  const rows = dataRows.map((r) => {
    const obj = {}
    headers.forEach((h, idx) => {
      obj[h] = (r[idx] ?? '').trim()
    })
    return obj
  })
  return { headers, rows }
}

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
