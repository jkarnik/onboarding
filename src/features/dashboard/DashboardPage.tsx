export function DashboardPage() {
  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Juniper Mist</h1>
      <p style={{ color: 'var(--muted)' }}>Live Demo Organization — dashboard overview.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {['Infrastructure Alerts', 'Security Alerts', 'AI Alerts'].map((t) => (
          <div key={t} style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 16 }}>
            <strong>{t}</strong>
            <div style={{ color: 'var(--muted)', marginTop: 8 }}>0 Critical · 0 Warning</div>
          </div>
        ))}
      </div>
    </div>
  )
}
