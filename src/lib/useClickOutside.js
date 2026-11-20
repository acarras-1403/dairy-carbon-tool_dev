import { useEffect } from 'react'

/** Calls onOutside when a pointer event lands outside every ref in `refs`. */
export function useClickOutside(refs, onOutside, active = true) {
  useEffect(() => {
    if (!active) return
    function handlePointerDown(e) {
      const list = Array.isArray(refs) ? refs : [refs]
      const isInside = list.some((r) => r.current && r.current.contains(e.target))
      if (!isInside) onOutside(e)
    }
    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [refs, onOutside, active])
}
