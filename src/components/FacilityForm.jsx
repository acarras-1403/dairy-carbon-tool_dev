import { useEffect, useMemo, useState } from 'react'
import {
  FACILITIES,
  FACILITY_COUNTRIES,
  PRODUCTION_UNIT,
  CURRENCY,
  toFacilityReportingPeriodRow,
} from '../data/lookups.js'
import { recentYears, currentYear } from '../lib/periods.js'
import { insertFacilityReportingPeriod } from '../lib/supabaseData.js'

const blank = {
  facility_id: '',
  reporting_year: currentYear(),
  facility_country: '',
  production_volume: '',
  annual_revenue: '',
}

// Facility Reporting Period — Step 1 (spec v5.0), persisted in Supabase, one
// row per facility per reporting year (unique constraint at the database).
// Every field is required (Business Rules). Pre-filled when arriving here
// via a blocked Activity Data entry's inline redirect (App.jsx).
export default function FacilityForm({ prefill, onAdd }) {
  const [form, setForm] = useState(blank)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const years = useMemo(() => recentYears(6), [])

  useEffect(() => {
    if (!prefill) return
    setForm((f) => ({
      ...f,
      facility_id: prefill.facility_id || f.facility_id,
      reporting_year: prefill.reporting_year ?? f.reporting_year,
    }))
  }, [prefill])

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
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

    const candidate = {
      facility_id: form.facility_id,
      reporting_year: Number(form.reporting_year),
      facility_country: form.facility_country,
      production_volume: production,
      annual_revenue: revenue,
    }

    setSubmitting(true)
    try {
      const inserted = await insertFacilityReportingPeriod(toFacilityReportingPeriodRow(candidate))
      onAdd(inserted)
      setForm(blank)
    } catch (err) {
      setError(
        err?.code === '23505'
          ? 'A Facility Reporting Period already exists for this facility and year.'
          : 'Could not save this entry to the database. Please try again.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <h2 className="text-lg font-semibold text-deepblue">Log facility reporting period</h2>
      {prefill && (
        <p className="rounded-md bg-lime/20 px-3 py-2 text-sm text-deepblue">
          No Facility Reporting Period was on file for the facility and year
          on your Step 2 entry — fields below are pre-filled. Submit this
          first, then resubmit your activity data entry.
        </p>
      )}

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
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Saving…' : 'Add entry'}
        </button>
      </div>
    </form>
  )
}
