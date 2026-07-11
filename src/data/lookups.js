// Hardcoded lookup lists (spec Section 5, D-5). Carried over from the v1.0
// dim_scope / dim_category / dim_subcategory / dim_emission_source / dim_facility
// tables, flattened into static config — no database, no in-app admin. Editing
// these values requires a code change and redeploy.

export const SCOPES = [
  { id: 'scope_1', name: 'Scope 1 — Direct emissions' },
  { id: 'scope_2', name: 'Scope 2 — Purchased energy' },
  { id: 'scope_3', name: 'Scope 3 — Value chain' },
]

export const CATEGORIES = [
  { id: 'cat_stationary_combustion', scopeId: 'scope_1', name: 'Stationary Combustion' },
  { id: 'cat_mobile_combustion', scopeId: 'scope_1', name: 'Mobile Combustion' },
  { id: 'cat_refrigerants', scopeId: 'scope_1', name: 'Refrigerants & Fugitive' },
  { id: 'cat_enteric_fermentation', scopeId: 'scope_1', name: 'Enteric Fermentation (FLAG)' },
  { id: 'cat_manure_management', scopeId: 'scope_1', name: 'Manure Management (FLAG)' },
  { id: 'cat_electricity', scopeId: 'scope_2', name: 'Purchased Electricity' },
  { id: 'cat_purchased_goods', scopeId: 'scope_3', name: 'Purchased Goods & Services' },
  { id: 'cat_packaging', scopeId: 'scope_3', name: 'Packaging' },
  { id: 'cat_waste', scopeId: 'scope_3', name: 'Waste' },
  { id: 'cat_feed_production', scopeId: 'scope_3', name: 'Feed Production (FLAG)' },
  { id: 'cat_land_use_change', scopeId: 'scope_3', name: 'Land Use Change (FLAG)' },
]

export const SUBCATEGORIES = [
  { id: 'sub_stationary', categoryId: 'cat_stationary_combustion', name: 'On-site fuel combustion' },
  { id: 'sub_mobile', categoryId: 'cat_mobile_combustion', name: 'Fleet & mobile equipment' },
  { id: 'sub_refrigerant', categoryId: 'cat_refrigerants', name: 'Refrigerant top-ups' },
  { id: 'sub_enteric', categoryId: 'cat_enteric_fermentation', name: 'Livestock enteric methane' },
  { id: 'sub_manure', categoryId: 'cat_manure_management', name: 'Manure storage & handling' },
  { id: 'sub_grid_electricity', categoryId: 'cat_electricity', name: 'Grid electricity' },
  { id: 'sub_purchased_goods', categoryId: 'cat_purchased_goods', name: 'Inputs & raw materials' },
  { id: 'sub_packaging', categoryId: 'cat_packaging', name: 'Primary & secondary packaging' },
  { id: 'sub_waste', categoryId: 'cat_waste', name: 'Operational waste' },
  { id: 'sub_feed', categoryId: 'cat_feed_production', name: 'Purchased & grown feed' },
  { id: 'sub_land', categoryId: 'cat_land_use_change', name: 'Land management' },
]

// activity unit is fixed per source — auto-filled, not user-editable.
export const SOURCES = [
  { id: 'src_diesel_stationary', subcategoryId: 'sub_stationary', categoryId: 'cat_stationary_combustion', name: 'Diesel (stationary)', unit: 'litres' },
  { id: 'src_natural_gas', subcategoryId: 'sub_stationary', categoryId: 'cat_stationary_combustion', name: 'Natural gas', unit: 'm3' },
  { id: 'src_lpg_stationary', subcategoryId: 'sub_stationary', categoryId: 'cat_stationary_combustion', name: 'LPG (stationary)', unit: 'kg' },
  { id: 'src_heating_oil', subcategoryId: 'sub_stationary', categoryId: 'cat_stationary_combustion', name: 'Heating oil / gasoil', unit: 'litres' },
  { id: 'src_hfo', subcategoryId: 'sub_stationary', categoryId: 'cat_stationary_combustion', name: 'Heavy fuel oil', unit: 'litres' },
  { id: 'src_diesel_mobile', subcategoryId: 'sub_mobile', categoryId: 'cat_mobile_combustion', name: 'Diesel (vehicles)', unit: 'litres' },
  { id: 'src_gasoline', subcategoryId: 'sub_mobile', categoryId: 'cat_mobile_combustion', name: 'Gasoline / petrol', unit: 'litres' },
  { id: 'src_lpg_forklift', subcategoryId: 'sub_mobile', categoryId: 'cat_mobile_combustion', name: 'LPG (forklift)', unit: 'kg' },
  { id: 'src_grid_electricity', subcategoryId: 'sub_grid_electricity', categoryId: 'cat_electricity', name: 'Grid electricity', unit: 'kWh' },
  { id: 'src_r404a', subcategoryId: 'sub_refrigerant', categoryId: 'cat_refrigerants', name: 'Refrigerant R-404A', unit: 'kg' },
  { id: 'src_r134a', subcategoryId: 'sub_refrigerant', categoryId: 'cat_refrigerants', name: 'Refrigerant R-134a', unit: 'kg' },
  { id: 'src_dairy_cattle_enteric', subcategoryId: 'sub_enteric', categoryId: 'cat_enteric_fermentation', name: 'Dairy cattle (enteric)', unit: 'head' },
  { id: 'src_slurry', subcategoryId: 'sub_manure', categoryId: 'cat_manure_management', name: 'Slurry storage', unit: 'm3' },
  { id: 'src_manure_solid', subcategoryId: 'sub_manure', categoryId: 'cat_manure_management', name: 'Solid manure', unit: 'tonnes' },
  { id: 'src_raw_milk', subcategoryId: 'sub_purchased_goods', categoryId: 'cat_purchased_goods', name: 'Raw milk purchased', unit: 'litres' },
  { id: 'src_cleaning_chem', subcategoryId: 'sub_purchased_goods', categoryId: 'cat_purchased_goods', name: 'Cleaning chemicals', unit: 'kg' },
  { id: 'src_hdpe', subcategoryId: 'sub_packaging', categoryId: 'cat_packaging', name: 'HDPE bottles', unit: 'kg' },
  { id: 'src_cardboard', subcategoryId: 'sub_packaging', categoryId: 'cat_packaging', name: 'Cardboard', unit: 'kg' },
  { id: 'src_landfill', subcategoryId: 'sub_waste', categoryId: 'cat_waste', name: 'Landfilled waste', unit: 'kg' },
  { id: 'src_wastewater', subcategoryId: 'sub_waste', categoryId: 'cat_waste', name: 'Wastewater treated', unit: 'm3' },
  { id: 'src_feed_concentrate', subcategoryId: 'sub_feed', categoryId: 'cat_feed_production', name: 'Feed concentrate', unit: 'tonnes' },
  { id: 'src_forage', subcategoryId: 'sub_feed', categoryId: 'cat_feed_production', name: 'Forage', unit: 'tonnes' },
  { id: 'src_pasture_land', subcategoryId: 'sub_land', categoryId: 'cat_land_use_change', name: 'Pasture land managed', unit: 'ha' },
]

export const FACILITIES = [
  { id: 'fac_north_plant', name: 'North Dairy Plant' },
  { id: 'fac_north_farm', name: 'North Farm Cluster' },
  { id: 'fac_south_plant', name: 'South Dairy Plant' },
  { id: 'fac_south_farm', name: 'South Farm Cluster' },
]

export const DATA_QUALITY_OPTIONS = ['measured', 'calculated', 'estimated', 'proxy']

// Single derivation point for scope/category/subcategory, reused by the
// manual entry form and CSV import alike (spec Section 9 — one derivation
// point, not duplicated per entry path). Scope is never stored or selected
// directly; it is read off the source's fixed place in the hierarchy.
export function deriveHierarchy(sourceId) {
  const source = SOURCES.find((s) => s.id === sourceId)
  if (!source) return null
  const category = CATEGORIES.find((c) => c.id === source.categoryId) ?? null
  const subcategory = SUBCATEGORIES.find((s) => s.id === source.subcategoryId) ?? null
  const scope = SCOPES.find((s) => s.id === category?.scopeId) ?? null
  return {
    scope_id: scope?.id ?? null,
    scope_name: scope?.name ?? '',
    category_id: source.categoryId,
    category_name: category?.name ?? '',
    subcategory_id: source.subcategoryId ?? null,
    subcategory_name: subcategory?.name ?? '',
    source_id: source.id,
    source_name: source.name,
    unit: source.unit,
  }
}

// Case-insensitive, trimmed exact match against a lookup list's `name` (or
// `id`) — used to auto-resolve CSV raw values that already match a
// hardcoded option, so Value Mapping only shows genuinely unmapped values.
export function findExactMatch(list, rawValue) {
  const needle = String(rawValue ?? '').trim().toLowerCase()
  if (!needle) return null
  return (
    list.find(
      (item) =>
        item.name.trim().toLowerCase() === needle || item.id.trim().toLowerCase() === needle,
    ) ?? null
  )
}

// Same idea for plain-string option lists (DATA_QUALITY_OPTIONS) — returns
// the canonical string, not an object.
export function findExactStringMatch(list, rawValue) {
  const needle = String(rawValue ?? '').trim().toLowerCase()
  if (!needle) return null
  return list.find((item) => item.trim().toLowerCase() === needle) ?? null
}
