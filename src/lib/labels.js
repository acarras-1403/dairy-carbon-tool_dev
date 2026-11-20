/**
 * Static emission_source -> friendly display label dictionary (product-spec.md
 * Section 8). Covers every emission_source currently in ef_table. Any value
 * with no entry here falls back to the raw value as-is (see getFriendlyLabel).
 */
export const EMISSION_SOURCE_LABELS = {
  src_diesel_stationary: 'Diesel - Stationary Combustion',
  src_diesel_mobile: 'Diesel - Mobile Combustion',
  src_lpg_stationary: 'LPG - Stationary Combustion',
}

export function getFriendlyLabel(emissionSource) {
  return EMISSION_SOURCE_LABELS[emissionSource] ?? emissionSource
}
