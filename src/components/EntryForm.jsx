import { useMemo, useState } from 'react'
import {
  SCOPES,
  CATEGORIES,
  SUBCATEGORIES,
  SOURCES,
  FACILITIES,
  DATA_QUALITY_OPTIONS,
} from '../data/lookups.js'
import { recentPeriods, currentPeriod } from '../lib/periods.js'

const blank = {
  reporting_period: currentPeriod(),
  facility_id: '',
  scope_id: '',
  category_id: '',
  subcategory_id: '',
  source_id: '',
  activity_data_value: '',
  data_quality_rating: '',
  notes: '',
}

// Every field required except Notes (spec Section 8 / Business Rules).
export default function EntryForm({ onAdd }) {
  const [form, setForm] = useState(blank)
  const [error, setError] = useState('')

  const periods = useMemo(() => recentPeriods(12), [])

  const categories = useMemo(
    () => CATEGORIES.filter((c) => !form.scope_id || c.scopeId === form.scope_id),
    [form.scope_id],
  )
  const subcategories = useMemo(
    () => SUBCATEGORIES.filter((s) => s.categoryId === form.category_id),
    [form.category_id],
  )
  const sources = useMemo(
    () =>
      SOURCES.filter(
        (s) =>
          s.categoryId === form.category_id &&
          (!form.subcategory_id || s.subcategoryId === form.subcategory_id),
      ),
    [form.category_id, form.subcategory_id],
  )
  const selectedSource = SOURCES.find((s) => s.id === form.source_id)

  function set(field, value) {
    setForm((f) => {
      const next = { ...f, [field]: value }
      if (field === 'scope_id') {
        next.category_id = ''
        next.subcategory_id = ''
        next.source_id = ''
      }
      if (field === 'category_id') {
        next.subcategory_id = ''
        next.source_id = ''
      }
      if (field === 'subcategory_id') next.source_id = ''
      return next
    })
  }

  function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (
      !form.reporting_period ||
      !form.facility_id ||
      !form.category_id ||
      !form.source_id ||
      !form.activity_data_value ||
      !form.data_quality_rating
    ) {
      setError('Please fill in all required fields.')
      return
    }
    const value = Number(form.activity_data_value)
    if (Number.isNaN(value)) {
      setError('Activity value must be a number.')
      return
    }

    onAdd({
      id: crypto.randomUUID(),
      reporting_period: form.reporting_period,
      facility_id: form.facility_id,
      facility_name: FACILITIES.find((f) => f.id === form.facility_id)?.name ?? form.facility_id,
      scope_id: form.scope_id,
      category_id: form.category_id,
      category_name: CATEGORIES.find((c) => c.id === form.category_id)?.name ?? form.category_id,
      subcategory_id: form.subcategory_id || null,
      subcategory_name:
        SUBCATEGORIES.find((s) => s.id === form.subcategory_id)?.name ?? '',
      source_id: form.source_id,
      source_name: selectedSource?.name ?? form.source_id,
      activity_data_value: value,
      activity_data_unit: selectedSource?.unit ?? '',
      data_quality_rating: form.data_quality_rating,
      notes: form.notes || '',
    })
    setForm(blank)
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <h2 className="text-lg font-semibold text-deepblue">Log activity data</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Reporting period</label>
          <select
            className="field-input"
            value={form.reporting_period}
            onChange={(e) => set('reporting_period', e.target.value)}
          >
            {periods.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

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
          <label className="label">Scope</label>
          <select
            className="field-input"
            value={form.scope_id}
            onChange={(e) => set('scope_id', e.target.value)}
          >
            <option value="">All scopes</option>
            {SCOPES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Category</label>
          <select
            className="field-input"
            value={form.category_id}
            onChange={(e) => set('category_id', e.target.value)}
            required
          >
            <option value="">Select category…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Subcategory</label>
          <select
            className="field-input"
            value={form.subcategory_id}
            onChange={(e) => set('subcategory_id', e.target.value)}
            disabled={!form.category_id}
          >
            <option value="">Select subcategory…</option>
            {subcategories.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Emission source</label>
          <select
            className="field-input"
            value={form.source_id}
            onChange={(e) => set('source_id', e.target.value)}
            disabled={!form.category_id}
            required
          >
            <option value="">Select source…</option>
            {sources.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Activity value</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="any"
              className="field-input"
              value={form.activity_data_value}
              onChange={(e) => set('activity_data_value', e.target.value)}
              required
            />
            <span className="whitespace-nowrap rounded-md bg-deepblue/5 px-3 py-2 text-sm text-slate">
              {selectedSource?.unit ?? '—'}
            </span>
          </div>
        </div>

        <div>
          <label className="label">Data quality</label>
          <select
            className="field-input"
            value={form.data_quality_rating}
            onChange={(e) => set('data_quality_rating', e.target.value)}
            required
          >
            <option value="">Select…</option>
            {DATA_QUALITY_OPTIONS.map((q) => (
              <option key={q} value={q}>
                {q}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="label">Notes (optional)</label>
          <textarea
            className="field-input"
            rows={2}
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
          />
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
