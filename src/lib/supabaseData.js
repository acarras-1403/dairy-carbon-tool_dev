import { supabase } from './supabaseClient.js'

// Persistence layer (spec v5.0 D3 promotion) — both tables read/write only
// the official schema columns (docs/supabase-setup.md). Category/subcategory/
// scope and the fixed production unit/currency are never stored; they're
// re-derived client-side from `emission_source`/`facility` at read time.

export async function fetchFacilityReportingPeriods() {
  const { data, error } = await supabase
    .from('facility_reporting_period')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function insertFacilityReportingPeriod(row) {
  const { data, error } = await supabase
    .from('facility_reporting_period')
    .insert(row)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function fetchActivityData() {
  const { data, error } = await supabase
    .from('activity_data')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function insertActivityData(row) {
  const { data, error } = await supabase
    .from('activity_data')
    .insert(row)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function insertActivityDataRows(rows) {
  if (rows.length === 0) return []
  const { data, error } = await supabase.from('activity_data').insert(rows).select()
  if (error) throw error
  return data
}
