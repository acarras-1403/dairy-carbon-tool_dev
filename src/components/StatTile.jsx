// Shared KPI tile (icon + number + label) — used on Home and Activity Data
// Entry. `icon` is a small inline SVG node; keep icons simple line-art per
// the brand doc (granate or sage, no stock imagery).
export default function StatTile({ icon, value, label }) {
  return (
    <div className="card flex items-center gap-3 p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent/10 text-accent">
        {icon}
      </div>
      <div>
        <p className="data-face text-xl font-semibold leading-none text-ink">{value}</p>
        <p className="mt-1 text-xs text-slate">{label}</p>
      </div>
    </div>
  )
}
