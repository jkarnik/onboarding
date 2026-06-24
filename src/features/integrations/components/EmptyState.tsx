import { Button } from '../../../components/ui/Button'

export function EmptyState({ onBrowse }: { onBrowse: () => void }) {
  return (
    <div style={{ textAlign: 'center', padding: '80px 16px', color: 'var(--muted)' }}>
      <h2 style={{ color: 'var(--text)', marginBottom: 8 }}>Connect your first integration</h2>
      <p style={{ maxWidth: 420, margin: '0 auto 20px' }}>
        Bring your network data into Network 360. Pick an integration to get started.
      </p>
      <Button onClick={onBrowse}>+ Add integration</Button>
    </div>
  )
}
