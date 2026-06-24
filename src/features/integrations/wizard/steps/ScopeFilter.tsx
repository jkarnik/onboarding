export function ScopeFilter({
  query, mode, onQuery, onMode, error,
}: { query: string; mode: 'text' | 'regex'; onQuery: (v: string) => void; onMode: (m: 'text' | 'regex') => void; error?: string }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={query}
          placeholder="Filter sites and devices"
          onChange={(e) => onQuery(e.target.value)}
          style={{ flex: 1, padding: '8px 10px', background: 'var(--panel-2)', border: `1px solid ${error ? 'var(--red)' : 'var(--border)'}`, borderRadius: 'var(--radius)', color: 'var(--text)' }}
        />
        {(['text', 'regex'] as const).map((m) => (
          <button key={m} onClick={() => onMode(m)}
            style={{ padding: '0 12px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: mode === m ? 'var(--panel-2)' : 'transparent', color: mode === m ? 'var(--text)' : 'var(--muted)' }}>
            {m === 'text' ? 'Text' : 'Regex'}
          </button>
        ))}
      </div>
      {error && <small style={{ color: 'var(--red)' }}>{error}</small>}
    </div>
  )
}
