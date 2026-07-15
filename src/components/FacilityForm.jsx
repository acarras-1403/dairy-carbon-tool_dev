import { useMemo, useState } from 'react'
import { FACILITIES, FACILITY_COUNTRIES, PRODUCTION_UNIT, CURRENCY } from '../data/lookups.js'
import { recentYears, currentYear } from '../lib/periods.js'

const blank = {
  facility_id: '',
  reporting_year: currentYear(),
  facility_country: '',
  production_volume: '',
  annual_revenue: '',
}

// Facility Reporting Period — separate session table from Activity Data,
// one row per facility per reporting year (spec Section 5, Hard Rules).
// Every field is required (Business Rules).
export default function FacilityForm({ onAdd }) {
  const [form, setForm] = useState(blank)
  const [error, setError] = useState('')

  const years = useMemo(() => recentYears(6), [])

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (
      !form.facility_id ||
      !form.reporting_year ||
      !form.facility_country ||
      form.production_volume === '' ||
      form.annual_revenue === ''
    ) {
      setError('Please fill in all required fields.')
      return
    }
    const production = Number(form.production_volume)
    const revenue = Number(form.annual_revenue)
    if (Number.isNaN(production) || Number.isNaN(revenue)) {
      setError('Production volume and annual revenue must be numbers.')
      return
    }

    onAdd({
      id: crypto.randomUUID(),
      facility_id: form.facility_id,
      facility_name: FACILITIES.find((f) => f.id === form.facility_id)?.name ?? form.facility_id,
      reporting_year: Number(form.reporting_year),
      facility_country: form.facility_country,
      production_volume: production,
      production_unit: PRODUCTION_UNIT,
      annual_revenue: revenue,
      currency: CURRENCY,
    })
    setForm(blank)
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <h2 className="text-lg font-semibold text-deepblue">Log facility reporting period</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Facility</label>
          <select
            className="field-input"
            value={form.facility_id}
            onChange={(e) => set('facility_id', e.target.value)}
            required
          >
            <option value="">Select facility…</option>
            {FACILITIES.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Reporting year</label>
          <select
            className="field-input"
            value={form.reporting_year}
            onChange={(e) => set('reporting_year', e.target.value)}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Facility country</label>
          <select
            className="field-input"
            value={form.facility_country}
            onChange={(e) => set('facility_country', e.target.value)}
            required
          >
            <option value="">Select country…</option>
            {FACILITY_COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Production volume</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="any"
              className="field-input"
              value={form.production_volume}
              onChange={(e) => set('production_volume', e.target.value)}
              required
            />
            <span className="whitespace-nowrap rounded-md bg-deepblue/5 px-3 py-2 text-sm text-slate">
              {PRODUCTION_UNIT}
            </span>
          </div>
        </div>

        <div>
          <label className="label">Annual revenue</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="any"
              className="field-input"
              value={form.annual_revenue}
              onChange={(e) => set('annual_revenue', e.target.value)}
              required
            />
            <span className="whitespace-nowrap rounded-md bg-deepblue/5 px-3 py-2 text-sm text-slate">
              {CURRENCY}
            </span>
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end">
        <button type="submit" className="btn-primary">
          Add entry
        </button>
      </div>
    </form>
  )
}
