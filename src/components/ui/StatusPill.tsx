const MAP = {
  connected: { label: 'Connected', color: 'var(--green)' },
  syncing: { label: 'Syncing', color: 'var(--muted)' },
  error: { label: 'Error', color: 'var(--red)' },
} as const

export function StatusPill({ status }: { status: keyof typeof MAP }) {
  const { label, color } = MAP[status]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      fontSize: 12, color,
    }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
      {label}
    </span>
  )
}
