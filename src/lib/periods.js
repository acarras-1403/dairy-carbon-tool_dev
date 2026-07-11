// Reporting-period helper. Periods are 'YYYY-MM'.

export function currentPeriod(now = new Date()) {
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`
}

// The current period plus the previous `count` months, newest first.
export function recentPeriods(count = 12, now = new Date()) {
  const out = []
  for (let i = 0; i < count; i++) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1))
    out.push(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`)
  }
  return out
}

function isValidCalendarDate(year, month, day) {
  if (month < 1 || month > 12) return false
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate()
  return day >= 1 && day <= daysInMonth
}

// Accepts DD/MM/YYYY, YYYY-MM-DD, DD-MM-YYYY (spec Section 9 — mixed
// formats within one uploaded file). Returns { year, month } or null if the
// raw value doesn't match any recognized format or isn't a real date —
// callers flag the row to Data Review rather than guessing.
export function parseFlexibleDate(raw) {
  const s = String(raw ?? '').trim()
  if (!s) return null

  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (m) {
    const [, y, mo, d] = m.map(Number)
    return isValidCalendarDate(y, mo, d) ? { year: y, month: mo } : null
  }

  m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (m) {
    const [, d, mo, y] = m.map(Number)
    return isValidCalendarDate(y, mo, d) ? { year: y, month: mo } : null
  }

  m = s.match(/^(\d{2})-(\d{2})-(\d{4})$/)
  if (m) {
    const [, d, mo, y] = m.map(Number)
    return isValidCalendarDate(y, mo, d) ? { year: y, month: mo } : null
  }

  return null
}

// Truncates a parsed { year, month } to its reporting period (spec Section 9).
export function periodFromParsedDate({ year, month }) {
  return `${year}-${String(month).padStart(2, '0')}`
}
