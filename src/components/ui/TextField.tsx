export function TextField({
  label, value, onChange, placeholder, type = 'text', error, hint,
}: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; error?: string; hint?: string }) {
  return (
    <label style={{ display: 'block', marginBottom: 12 }}>
      <span style={{ display: 'block', fontSize: 13, color: 'var(--muted)', marginBottom: 4 }}>{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%', padding: '8px 10px', background: 'var(--panel-2)',
          border: `1px solid ${error ? 'var(--red)' : 'var(--border)'}`,
          borderRadius: 'var(--radius)', color: 'var(--text)',
        }}
      />
      {hint && !error && <small style={{ color: 'var(--muted)' }}>{hint}</small>}
      {error && <small style={{ color: 'var(--red)' }}>{error}</small>}
    </label>
  )
}
