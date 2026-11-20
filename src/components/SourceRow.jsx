import { useRef, useState } from 'react'
import ConfidenceSwatch from './ConfidenceSwatch.jsx'
import InfoIcon from './InfoIcon.jsx'
import AuditPanel from './AuditPanel.jsx'
import { getFriendlyLabel } from '../lib/labels.js'
import { getEmissionSourceTooltip } from '../lib/tooltips.js'
import { useClickOutside } from '../lib/useClickOutside.js'
import { supabase } from '../lib/supabaseClient.js'

const STATUS_LABEL = {
  pending: 'Pending',
  approved: 'Approved',
  flagged: 'Flagged',
}

const STATUS_PILL_CLASS = {
  pending: 'bg-line text-ink',
  approved: 'bg-success/15 text-success',
  flagged: 'bg-danger/15 text-danger',
}

export default function SourceRow({ result, isPinned, onTogglePin, onClosePin, onStatusChange }) {
  const [updating, setUpdating] = useState(false)
  const cellRef = useRef(null)
  const panelRef = useRef(null)

  useClickOutside([cellRef, panelRef], () => onClosePin(), isPinned)

  const activity = result.activity
  const emissionSource = activity?.emission_source
  const label = emissionSource ? getFriendlyLabel(emissionSource) : '—'

  async function writeStatus(next) {
    setUpdating(true)
    const { error } = await supabase.from('emissions_results').update({ validation_status: next }).eq('id', result.id)
    setUpdating(false)
    if (error) {
      console.error(error)
      return
    }
    onStatusChange(result.id, next)
  }

  return (
    <tr className="border-t border-line">
      <td className="relative px-3 py-2 align-top" ref={cellRef}>
        <button
          type="button"
          onClick={onTogglePin}
          className="text-sm font-medium text-ink text-left hover:underline"
        >
          {label}
        </button>
        {emissionSource && <InfoIcon text={getEmissionSourceTooltip(emissionSource)} />}
        {result.export_blocked && (
          <p className="text-xs text-danger mt-0.5">{result.export_blocked_reason}</p>
        )}
        {isPinned && <AuditPanel result={result} onClose={onClosePin} panelRef={panelRef} />}
      </td>

      <td className="px-3 py-2 align-top text-right">
        <span className="data-face text-sm text-ink">
          {result.result_tco2e != null ? result.result_tco2e.toFixed(3) : '—'}
        </span>
      </td>

      <td className="px-3 py-2 align-top">
        <ConfidenceSwatch score={result.confidence_score} />
      </td>

      <td className="px-3 py-2 align-top">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_PILL_CLASS[result.validation_status]}`}>
            {STATUS_LABEL[result.validation_status]}
          </span>
          <button
            type="button"
            onClick={() => writeStatus('approved')}
            disabled={updating}
            className="text-xs font-semibold px-2 py-1 rounded-full border border-line hover:bg-offwhite disabled:opacity-50"
          >
            Validate
          </button>
          <button
            type="button"
            onClick={() => writeStatus('flagged')}
            disabled={updating}
            className="text-xs font-semibold px-2 py-1 rounded-full border border-line hover:bg-offwhite disabled:opacity-50"
          >
            Reject
          </button>
        </div>
      </td>
    </tr>
  )
}
