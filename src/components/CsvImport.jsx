import { useState } from 'react'
import { parseCsv } from '../lib/csv.js'
import { FACILITIES, SOURCES, DATA_QUALITY_OPTIONS } from '../data/lookups.js'
import {
  MAPPABLE_FIELDS,
  collectUnresolvedValues,
  processImportRows,
} from '../lib/importRows.js'

function optionsForField(field) {
  if (field === 'facility') return FACILITIES.map((f) => ({ value: f.id, label: f.name }))
  if (field === 'source') return SOURCES.map((s) => ({ value: s.id, label: s.name }))
  if (field === 'data_quality_rating')
    return DATA_QUALITY_OPTIONS.map((q) => ({ value: q, label: q }))
  return []
}

// Column Mapping → Value Mapping → Data Review sorting, in one wizard
// (spec Section 8). Each upload starts from scratch — nothing about a
// mapping is remembered across files (Hard Rules).
export default function CsvImport({ onImportComplete }) {
  const [step, setStep] = useState('upload')
  const [fileName, setFileName] = useState('')
  const [error, setError] = useState('')
  const [headers, setHeaders] = useState([])
  const [rows, setRows] = useState([])
  const [columnMap, setColumnMap] = useState({})
  const [unresolved, setUnresolved] = useState([])
  const [valueChoices, setValueChoices] = useState({})
  const [summary, setSummary] = useState(null)

  function reset() {
    setStep('upload')
    setFileName('')
    setError('')
    setHeaders([])
    setRows([])
    setColumnMap({})
    setUnresolved([])
    setValueChoices({})
    setSummary(null)
  }

  function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    const reader = new FileReader()
    reader.onload = () => {
      const { headers: h, rows: r } = parseCsv(String(reader.result))
      if (h.length === 0 || r.length === 0) {
        setError('That file has no rows to import.')
        return
      }
      setFileName(file.name)
      setHeaders(h)
      setRows(r)
      setColumnMap({})
      setStep('columnMapping')
    }
    reader.onerror = () => setError('Could not read that file.')
    reader.readAsText(file)
    e.target.value = ''
  }

  function assignColumn(header, field) {
    setColumnMap((prev) => {
      const next = { ...prev }
      // A schema field maps to exactly one column — clear any previous claim.
      if (field) {
        for (const key of Object.keys(next)) {
          if (next[key] === header) delete next[key]
        }
        next[field] = header
      } else {
        for (const key of Object.keys(next)) {
          if (next[key] === header) delete next[key]
        }
      }
      return next
    })
  }

  function proceedFromColumnMapping() {
    const found = collectUnresolvedValues(rows, columnMap)
    setUnresolved(found)
    setValueChoices({})
    if (found.length === 0) {
      finishImport(columnMap, {})
    } else {
      setStep('valueMapping')
    }
  }

  function setValueChoice(field, rawValue, resolvedId) {
    setValueChoices((prev) => ({
      ...prev,
      [field]: { ...prev[field], [rawValue]: resolvedId },
    }))
  }

  function finishImport(finalColumnMap, finalValueMap) {
    const { clean, flagged } = processImportRows(rows, headers, finalColumnMap, finalValueMap)

    onImportComplete(clean, flagged)
    setSummary({
      total: rows.length,
      clean: clean.length,
      flagged: flagged.length,
    })
    setStep('summary')
  }

  function submitValueMapping() {
    setStep('processing')
    finishImport(columnMap, valueChoices)
  }

  return (
    <section className="card space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-deepblue">Bulk CSV import</h2>
        <p className="text-sm text-slate">
          Upload raw records, map columns and values, and flagged rows land in
          Data Review below.
        </p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {step === 'upload' && (
        <div>
          <label className="label">CSV file</label>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={handleFile}
            className="block w-full text-sm text-ink file:mr-3 file:rounded-md file:border-0 file:bg-deepblue file:px-3 file:py-2 file:text-sm file:font-semibold file:text-offwhite hover:file:bg-deepblue/90"
          />
        </div>
      )}

      {step === 'columnMapping' && (
        <div className="space-y-4">
          <p className="text-sm text-slate">
            <span className="font-medium text-ink">{fileName}</span> — {rows.length} row
            {rows.length === 1 ? '' : 's'}. Assign each column, or leave it to fold into Notes.
          </p>
          <div className="space-y-2">
            {headers.map((header) => {
              const assignedField = MAPPABLE_FIELDS.find((f) => columnMap[f.key] === header)?.key ?? ''
              return (
                <div key={header} className="flex items-center gap-3">
                  <span className="w-48 shrink-0 truncate text-sm font-medium text-ink" title={header}>
                    {header}
                  </span>
                  <select
                    className="field-input"
                    value={assignedField}
                    onChange={(e) => assignColumn(header, e.target.value)}
                  >
                    <option value="">Fold into Notes</option>
                    {MAPPABLE_FIELDS.map((f) => (
                      <option
                        key={f.key}
                        value={f.key}
                        disabled={columnMap[f.key] && columnMap[f.key] !== header}
                      >
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>
              )
            })}
          </div>
          <div className="flex justify-end gap-2">
            <button className="btn-ghost" onClick={reset}>
              Cancel
            </button>
            <button className="btn-primary" onClick={proceedFromColumnMapping}>
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 'valueMapping' && (
        <div className="space-y-4">
          <p className="text-sm text-slate">
            {unresolved.length} distinct value{unresolved.length === 1 ? '' : 's'} didn't match a
            known option. Map each once — it applies to every row with that value.
          </p>
          <div className="space-y-2">
            {unresolved.map(({ field, rawValue }) => (
              <div key={`${field}:${rawValue}`} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-xs uppercase tracking-wide text-slate">
                  {MAPPABLE_FIELDS.find((f) => f.key === field)?.label ?? field}
                </span>
                <span className="w-48 shrink-0 truncate text-sm font-medium text-ink" title={rawValue}>
                  {rawValue}
                </span>
                <select
                  className="field-input"
                  value={valueChoices[field]?.[rawValue] ?? ''}
                  onChange={(e) => setValueChoice(field, rawValue, e.target.value)}
                >
                  <option value="">Leave unmapped (flags row)</option>
                  {optionsForField(field).map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <button className="btn-ghost" onClick={reset}>
              Cancel
            </button>
            <button className="btn-primary" onClick={submitValueMapping}>
              Finish import
            </button>
          </div>
        </div>
      )}

      {step === 'summary' && summary && (
        <div className="space-y-3">
          <p className="text-sm text-ink">
            Imported <span className="font-semibold">{summary.total}</span> row
            {summary.total === 1 ? '' : 's'} from <span className="font-medium">{fileName}</span>:{' '}
            <span className="font-semibold text-deepblue">{summary.clean}</span> added to the
            session table, <span className="font-semibold text-deepblue">{summary.flagged}</span>{' '}
            sent to Data Review.
          </p>
          <button className="btn-ghost" onClick={reset}>
            Import another CSV
          </button>
        </div>
      )}
    </section>
  )
}
