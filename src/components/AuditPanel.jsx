export default function AuditPanel({ result, onClose, panelRef }) {
  const activity = result.activity

  return (
    <div
      ref={panelRef}
      className="card absolute left-0 top-full z-30 mt-1 w-80 max-w-[90vw] p-3 text-sm space-y-1.5 shadow-lg"
    >
      <div className="flex items-center justify-between">
        <p className="font-semibold text-ink">Audit trail</p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="text-slate hover:text-ink h-5 w-5 flex items-center justify-center rounded"
        >
          ×
        </button>
      </div>

      <p>
        <span className="text-slate">Activity value: </span>
        <span className="data-face">
          {activity?.activity_data_value_raw} {activity?.activity_data_unit_raw}
        </span>
        {activity && activity.activity_data_unit_raw !== activity.activity_data_unit_converted && (
          <span className="text-slate">
            {' '}
            (converted: <span className="data-face">
              {activity.activity_data_value_converted} {activity.activity_data_unit_converted}
            </span>)
          </span>
        )}
      </p>

      {result.ef && (
        <p>
          <span className="text-slate">EF value: </span>
          <span className="data-face">
            {result.ef.ef_value} {result.ef.ef_unit}
          </span>
        </p>
      )}

      <p>
        <span className="text-slate">Data quality rating: </span>
        {activity?.data_quality_rating ?? '—'}
      </p>

      {result.ef && (
        <p>
          <span className="text-slate">EF quality level: </span>
          <span className="data-face">{result.ef.quality_level}</span>
        </p>
      )}

      <p>
        <span className="text-slate">Reviewer: </span>
        {activity?.reviewer || '—'}
      </p>

      <p>
        <span className="text-slate">Evidence link: </span>
        {activity?.evidence_link ? (
          <a href={activity.evidence_link} target="_blank" rel="noreferrer" className="text-accent underline break-all">
            {activity.evidence_link}
          </a>
        ) : (
          '—'
        )}
      </p>
    </div>
  )
}
