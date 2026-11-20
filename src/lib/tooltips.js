/**
 * Static info-tooltip dictionaries (product-spec.md Section 8, exact confirmed
 * wording, used verbatim). Unmapped values fall back to a generic line rather
 * than an error — see getTooltip.
 */
export const SCOPE_TOOLTIPS = {
  'Scope 1':
    'Direct greenhouse gas emissions from sources owned or controlled by PurePastures — primarily fuel burned on-site, in fixed equipment or vehicles.',
  'Scope 2':
    'Indirect emissions from purchased energy, such as grid electricity, consumed at PurePastures facilities.',
  'Scope 3':
    "All other indirect emissions in PurePastures' value chain that aren't captured in Scope 1 or 2 — for example, emissions from producing and transporting a fuel before it's burned on-site.",
}

export const CATEGORY_TOOLTIPS = {
  'Stationary Combustion':
    'Emissions from burning fuel in fixed, on-site equipment — boilers, heaters, or backup generators — as opposed to vehicles.',
  'Mobile Combustion':
    'Emissions from burning fuel in vehicles or mobile machinery — tractors, delivery trucks, forklifts.',
  'Fuel- and Energy-Related Activities (WTT)':
    'Upstream "Well-to-Tank" emissions from extracting, refining, and transporting a fuel before it reaches PurePastures and is burned — distinct from the emissions released when it\'s actually combusted.',
}

export const EMISSION_SOURCE_TOOLTIPS = {
  src_diesel_stationary:
    'Diesel fuel burned in fixed on-site equipment, such as a generator or boiler used for heating or power.',
  src_diesel_mobile: 'Diesel fuel burned in vehicles or mobile equipment, such as tractors or delivery trucks.',
  src_lpg_stationary: 'LPG (liquefied petroleum gas) burned in fixed on-site equipment, typically for heating.',
}

const FALLBACK = 'No description yet.'

export function getScopeTooltip(scope) {
  return SCOPE_TOOLTIPS[scope] ?? FALLBACK
}

export function getCategoryTooltip(category) {
  return CATEGORY_TOOLTIPS[category] ?? FALLBACK
}

export function getEmissionSourceTooltip(emissionSource) {
  return EMISSION_SOURCE_TOOLTIPS[emissionSource] ?? FALLBACK
}
