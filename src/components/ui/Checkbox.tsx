import { useEffect, useRef } from 'react'

export function Checkbox({
  checked, indeterminate, onChange, label,
}: { checked: boolean; indeterminate?: boolean; onChange: (c: boolean) => void; label?: string }) {
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => { if (ref.current) ref.current.indeterminate = !!indeterminate && !checked }, [indeterminate, checked])
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <input ref={ref} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label && <span>{label}</span>}
    </label>
  )
}
