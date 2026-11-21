import { useMemo, useState } from 'react'
import {
  CATEGORIES,
  SUBCATEGORIES,
  SOURCES,
  FACILITIES,
  DATA_QUALITY_OPTIONS,
  deriveHierarchy,
  convertActivityValue,
  toActivityDataRow,
} from '../data/lookups.js'
import { recentPeriods, currentPeriod, yearFromPeriod } from '../lib/periods.js'
import { findFacilityMatch } from '../lib/facilityMatch.js'
import { insertActivityData } from '../lib/supabaseData.js'
import { IconCheck } from './icons.jsx'

const blank = {
  reporting_period: currentPeriod(),
  facility_id: '',
  category_id: '',
  subcategory_id: '',
  source_id: '',
  activity_data_value_raw: '',
  data_quality_rating: '',
  notes: '',
  evidence_link: '',
  reviewer: '',
  consent: false,
}

const GDPR_STATEMENT =
  'Your data will be stored securely and used only to track who logged each activity entry for internal accountability purposes. You can request deletion of your name at any time by contacting sustainability@purepastures.com.'

// Every field required except Notes, Evidence link, Reviewer (spec Section
// 8 / Business Rules). Blocked from submitting without a matching Facility
// Data entry for facility + reporting year (D-13, still a hard block in
// v7.0) — a blocked submit navigates to the Reporting Unit page
// (App.jsx), instead of v5.0's inline redirect to a separate step.
export default function EntryForm({ facilityPeriods, onAdd, onBlocked }) {
  const [form, setForm] = useState(blank)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const periods = useMemo(() => recentPeriods(12), [])

  // Full unrestricted category list — Scope is never a manual input, it is
  // derived from the selected source (single derivation point in lookups.js).
  const categories = CATEGORIES
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
  const hierarchy = form.source_id ? deriveHierarchy(form.source_id) : null

  // Per-form progress indicator (in addition to Home's app-wide tracker) —
  // groups this form's own fields into 5 sections so the user always knows
  // what's left, without turning the form into a multi-step wizard.
  const reviewerEntered = form.reviewer.trim().length > 0
  const sections = [
    {
      id: 'facility',
      label: 'Facility & reporting period',
      why: 'Identifies which site and period this entry belongs to.',
      done: Boolean(form.facility_id && form.reporting_period),
    },
    {
      id: 'source',
      label: 'Emission source',
      why: 'Determines the Scope and which emission factor the entry is matched against.',
      done: Boolean(form.category_id && form.source_id),
    },
    {
      id: 'value',
      label: 'Activity value & data quality',
      why: 'The raw amount and how reliable it is — both feed directly into the result and its confidence score.',
      done: Boolean(form.activity_data_value_raw !== '' && form.data_quality_rating),
    },
    {
      id: 'supporting',
      label: 'Supporting info',
      why: 'Evidence link, reviewer and notes are optional — useful for the audit trail, never required.',
      done: true,
    },
    {
      id: 'consent',
      label: 'Consent confirmation',
      why: 'Only required when a reviewer name is entered, since that is personal data.',
      done: !reviewerEntered || form.consent,
    },
  ]
  const sectionsDone = sections.filter((s) => s.done).length

  function set(field, value) {
    setForm((f) => {
      const next = { ...f, [field]: value }
      if (field === 'category_id') {
        next.subcategory_id = ''
        next.source_id = ''
      }
      if (field === 'subcategory_id') next.source_id = ''
      return next
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (
      !form.reporting_period ||
      !form.facility_id ||
      !form.category_id ||
      !form.source_id ||
      !form.activity_data_value_raw ||
      !form.data_quality_rating
    ) {
      setError('Please fill in all required fields.')
      return
    }
    const value = Number(form.activity_data_value_raw)
    if (Number.isNaN(value)) {
      setError('Activity value must be a number.')
      return
    }
    if (form.reviewer.trim() && !form.consent) {
      setError('Please confirm the data statement below to submit a reviewer name.')
      return
    }

    const match = findFacilityMatch(facilityPeriods, form.facility_id, form.reporting_period)
    if (!match) {
      onBlocked({
        facility_id: form.facility_id,
        reporting_year: yearFromPeriod(form.reporting_period),
      })
      setError('No Facility Data on file for this facility and year — add it on the Reporting Unit page that just opened, then submit this entry again.')
      return
    }

    const conversion = convertActivityValue(form.source_id, value)

    const candidate = {
      reporting_period: form.reporting_period,
      facility_id: form.facility_id,
      source_id: form.source_id,
      activity_data_value_raw: value,
      activity_data_unit_raw: selectedSource?.unit ?? '',
      activity_data_value_converted: conversion?.value_converted ?? '',
      activity_data_unit_converted: conversion?.unit_converted ?? '',
      data_quality_rating: form.data_quality_rating,
      notes: form.notes || '',
      evidence_link: form.evidence_link || '',
      reviewer: form.reviewer || '',
      facility_reporting_period_ref: match.id,
    }

    setSubmitting(true)
    try {
      const inserted = await insertActivityData(toActivityDataRow(candidate))
      onAdd(inserted)
      setForm(blank)
    } catch {
      setError('Could not save this entry to the database. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <h2 className="font-serif text-lg font-semibold text-accent">Log activity data</h2>

      <div className="space-y-2 rounded-md border border-line bg-accent/5 p-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-medium text-slate">
            {sectionsDone} of {sections.length} sections ready
          </span>
          <div className="h-1.5 w-28 overflow-hidden rounded-full bg-accent/10">
            <div
              className="h-full bg-accent transition-all"
              style={{ width: `${(sectionsDone / sections.length) * 100}%` }}
            />
          </div>
        </div>
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-5">
          {sections.map((s) => (
            <li key={s.id} className="flex items-start gap-1.5">
              <span
                className={
                  s.done
                    ? 'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-success/15 text-success'
                    : 'mt-0.5 h-4 w-4 shrink-0 rounded-full border border-line'
                }
              >
                {s.done ? <IconCheck width="10" height="10" /> : null}
              </span>
              <span>
                <span className="block text-xs font-medium text-ink">{s.label}</span>
                <span className="block text-[11px] leading-snug text-slate">{s.why}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

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
          {hierarchy && (
            <p className="mt-1 text-xs text-slate">Scope: {hierarchy.scope_name}</p>
          )}
        </div>

        <div>
          <label className="label">Activity value</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="any"
              className="field-input"
              value={form.activity_data_value_raw}
              onChange={(e) => set('activity_data_value_raw', e.target.value)}
              required
            />
            <span className="whitespace-nowrap rounded-md bg-accent/5 px-3 py-2 text-sm text-slate">
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

        <div>
          <label className="label">Evidence link (optional)</label>
          <input
            type="text"
            className="field-input"
            value={form.evidence_link}
            onChange={(e) => set('evidence_link', e.target.value)}
          />
        </div>

        <div>
          <label className="label">Reviewer (optional)</label>
          <input
            type="text"
            className="field-input"
            value={form.reviewer}
            onChange={(e) => set('reviewer', e.target.value)}
          />
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

      <div className="rounded-md border border-line bg-accent/5 p-3">
        <label className="flex items-start gap-2 text-sm text-ink">
          <input
            type="checkbox"
            className="mt-0.5"
            checked={form.consent}
            onChange={(e) => set('consent', e.target.checked)}
          />
          <span>
            {GDPR_STATEMENT} Required only if you enter a Reviewer name above.
          </span>
        </label>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex justify-end">
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Saving…' : 'Add entry'}
        </button>
      </div>
    </form>
  )
}
