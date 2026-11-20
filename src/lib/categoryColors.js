/**
 * Categorical color slots from brand-system.md's 5-step categorical scale
 * (granate -> sage, strictly increasing lightness so the set survives
 * greyscale/print/CVD). Category -> slot assignment is alphabetical for
 * stability across renders and across scopes (same category, same color
 * everywhere). Actual light/dark hex per slot lives in index.css
 * (.cat-slot-N). "Beyond five categories, cycle" per the brand doc.
 */
const SLOT_COUNT = 5

export function buildCategoryColorMap(categories) {
  const sorted = [...new Set(categories)].sort()
  const map = new Map()
  sorted.forEach((cat, i) => {
    map.set(cat, i % SLOT_COUNT)
  })
  return map
}
