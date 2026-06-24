interface Step { key: string; label: string; optional?: boolean }

export function ProgressSteps({
  steps, activeIndex, onStepClick,
}: { steps: Step[]; activeIndex: number; onStepClick?: (i: number) => void }) {
  return (
    <ol style={{ display: 'flex', gap: 16, listStyle: 'none', padding: 0, margin: 0 }}>
      {steps.map((s, i) => {
        const active = i === activeIndex
        const done = i < activeIndex
        return (
          <li
            key={s.key}
            data-active={active}
            onClick={onStepClick ? () => onStepClick(i) : undefined}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              color: active ? 'var(--text)' : done ? 'var(--green)' : 'var(--muted)',
              cursor: onStepClick ? 'pointer' : 'default',
            }}
          >
            <span style={{
              width: 22, height: 22, borderRadius: '50%',
              border: `1px solid ${active ? 'var(--blue)' : 'var(--border)'}`,
              display: 'grid', placeItems: 'center', fontSize: 12,
            }}>{i + 1}</span>
            <span>{s.label}{s.optional ? ' (optional)' : ''}</span>
          </li>
        )
      })}
    </ol>
  )
}
