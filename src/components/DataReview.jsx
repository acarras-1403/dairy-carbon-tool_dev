import { useMemo, useState } from 'react'
import {
  CATEGORIES,
  SUBCATEGORIES,
  SOURCES,
  FACILITIES,
  DATA_QUALITY_OPTIONS,
  deriveHierarchy,
  convertActivityValue,
} from '../data/lookups.js'
import { findEntryIssues } from '../lib/importRows.js'

function ReviewRow({ row, onPromote, onDiscard }) {
  const [form, setForm] = useState({
    reporting_period: row.reporting_period,
    facility_id: row.facility_id,
    category_id: row.category_id,
    subcategory_id: row.subcategory_id,
    source_id: row.source_id,
    activity_data_value_raw: row.activity_data_value_raw,
    data_quality_rating: row.data_quality_rating,
    notes: row.notes,
    evidence_link: row.evidence_link ?? '',
    reviewer: row.reviewer ?? '',
  })
  const [promoteError, setPromoteError] = useState('')

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
  const hierarchy = form.source_id ? deriveHierarchy(form.source_id) : null

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
    setPromoteError('')
  }

  function handlePromote() {
    const value =
      form.activity_data_value_raw === '' ? '' : Number(form.activity_data_value_raw)
    const conversion =
      form.source_id && !Number.isNaN(value) ? convertActivityValue(form.source_id, value) : null
    const candidate = {
      reporting_period: form.reporting_period,
      facility_id: form.facility_id,
      facility_name: FACILITIES.find((f) => f.id === form.facility_id)?.name ?? '',
      scope_id: hierarchy?.scope_id ?? '',
      category_id: form.category_id,
      category_name: hierarchy?.category_name ?? '',
      subcategory_id: form.subcategory_id || null,
      subcategory_name: hierarchy?.subcategory_name ?? '',
      source_id: form.source_id,
      source_name: hierarchy?.source_name ?? '',
      activity_data_value_raw: Number.isNaN(value) ? '' : value,
      activity_data_unit_raw: hierarchy?.unit ?? '',
      activity_data_value_converted: conversion?.value_converted ?? '',
      activity_data_unit_converted: conversion?.unit_converted ?? '',
      data_quality_rating: form.data_quality_rating,
      notes: form.notes,
      evidence_link: form.evidence_link,
      reviewer: form.reviewer,
    }
    const issues = findEntryIssues(candidate)
    if (issues.length > 0) {
      setPromoteError(issues.join('; '))
      return
    }
    onPromote(row.id, { id: row.id, ...candidate })
  }

  return (
    <div className="rounded-md border border-line p-4 space-y-3">
      <p className="text-sm font-medium text-red-700">{row.issues.join('; ')}</p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <label className="label">Reporting period</label>
          <input
            type="text"
            placeholder="YYYY-MM"
            className="field-input"
            value={form.reporting_period}
            onChange={(e) => set('reporting_period', e.target.value)}
          />
        </div>
        <div>
          <label className="label">Facility</label>
          <select
            className="field-input"
            value={form.facility_id}
            onChange={(e) => set('facility_id', e.target.value)}
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
          >
            <option value="">Select category…</option>
            {CATEGORIES.map((c) => (
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
              value={form.activity_data_value_raw}
              onChange={(e) => set('activity_data_value_raw', e.target.value)}
            />
            <span className="whitespace-nowrap rounded-md bg-deepblue/5 px-3 py-2 text-sm text-slate">
              {hierarchy?.unit ?? '—'}
            </span>
          </div>
        </div>
        <div>
          <label className="label">Data quality</label>
          <select
            className="field-input"
            value={form.data_quality_rating}
            onChange={(e) => set('data_quality_rating', e.target.value)}
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
          <label className="label">Evidence link</label>
          <input
            type="text"
            className="field-input"
            value={form.evidence_link}
            onChange={(e) => set('evidence_link', e.target.value)}
          />
        </div>
        <div>
          <label className="label">Reviewer</label>
          <input
            type="text"
            className="field-input"
            value={form.reviewer}
            onChange={(e) => set('reviewer', e.target.value)}
          />
        </div>
        <div className="sm:col-span-3">
          <label className="label">Notes</label>
          <textarea
            className="field-input"
            rows={2}
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
          />
        </div>
      </div>

      {promoteError && <p className="text-sm text-red-600">{promoteError}</p>}

      <div className="flex justify-end gap-2">
        <button className="btn-ghost" onClick={() => onDiscard(row.id)}>
          Discard
        </button>
        <button className="btn-primary" onClick={handlePromote}>
          Promote to session table
        </button>
      </div>
    </div>
  )
}

// Holds only flagged rows from CSV import (spec Section 8) — fix and
// promote to the main table, or discard.
export default function DataReview({ rows, onPromote, onDiscard }) {
  if (rows.length === 0) return null

  return (
    <section className="card space-y-4">
      <h2 className="text-lg font-semibold text-deepblue">
        Data Review — needs attention ({rows.length})
      </h2>
      <p className="text-sm text-slate">
        These rows had an unparseable date or a required field still blank after
        import mapping. Fix and promote them, or discard.
      </p>
      <div className="space-y-3">
        {rows.map((row) => (
          <ReviewRow key={row.id} row={row} onPromote={onPromote} onDiscard={onDiscard} />
        ))}
      </div>
    </section>
  )
}
