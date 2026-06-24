import type { CatalogEntry } from '../types'

export function CatalogCard({ entry, onSelect }: { entry: CatalogEntry; onSelect: (type: string) => void }) {
  return (
    <button
      onClick={() => entry.available && onSelect(entry.type)}
      disabled={!entry.available}
      style={{
        textAlign: 'left', background: 'var(--panel-2)',
        border: '1px solid var(--border)', borderRadius: 'var(--radius)',
        padding: 16, opacity: entry.available ? 1 : 0.55,
        color: 'var(--text)',
      }}
    >
      <div style={{ fontWeight: 600 }}>{entry.name}</div>
      <div style={{ fontSize: 13, color: 'var(--muted)', margin: '6px 0' }}>{entry.description}</div>
      {!entry.available && <span style={{ fontSize: 12, color: 'var(--amber)' }}>Coming soon</span>}
    </button>
  )
}
