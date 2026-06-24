import type { Integration } from '../types'
import { StatusPill } from '../../../components/ui/StatusPill'
import { Button } from '../../../components/ui/Button'

export function IntegrationRow({
  integration, onEdit, onDelete,
}: { integration: Integration; onEdit: (i: Integration) => void; onDelete: (i: Integration) => void }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto',
      alignItems: 'center', gap: 12, padding: 14,
      borderBottom: '1px solid var(--border)',
    }}>
      <div>
        <div style={{ fontWeight: 600 }}>{integration.name}</div>
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>{integration.type}</div>
      </div>
      <StatusPill status={integration.status} />
      <div style={{ color: 'var(--muted)', fontSize: 13 }}>{integration.scopeSummary}</div>
      <div style={{ color: 'var(--muted)', fontSize: 13 }}>2 min ago</div>
      <div style={{ display: 'flex', gap: 8 }}>
        <Button variant="ghost" onClick={() => onEdit(integration)}>Edit</Button>
        <Button variant="ghost" onClick={() => onDelete(integration)}>Delete</Button>
      </div>
    </div>
  )
}
