/**
 * Bare color swatch — no dot, no text label, no always-visible number. The
 * 1-5 confidence_score is revealed only on hover. This is a deliberate
 * reversal of v1.0's accessibility-driven design (colored dot + always-visible
 * label) — confirmed explicitly by the builder, logged as D-20 in
 * DECISIONS.md. Colors use the theme's own status tokens (success/warning/
 * danger), never fixed hex, so they stay correctly mapped in both themes.
 */
function bucketClass(score) {
  if (score == null) return 'bg-line'
  if (score >= 4) return 'bg-success'
  if (score >= 2.5) return 'bg-warning'
  return 'bg-danger'
}

export default function ConfidenceSwatch({ score }) {
  return (
    <span className="group/swatch relative inline-flex">
      <span
        className={`h-3.5 w-3.5 rounded-sm ${bucketClass(score)}`}
        role="img"
        aria-label={score != null ? `Confidence score ${score.toFixed(1)} out of 5` : 'No confidence score'}
      />
      <span
        role="tooltip"
        className="data-face pointer-events-none absolute left-1/2 bottom-full z-20 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-lg bg-surface-strong px-2 py-1 text-xs text-on-surface-strong opacity-0 shadow-lg transition-opacity duration-100 group-hover/swatch:opacity-100"
      >
        {score != null ? score.toFixed(1) : 'No score'}
      </span>
    </span>
  )
}
