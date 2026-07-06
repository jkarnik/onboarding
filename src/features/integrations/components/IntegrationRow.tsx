import type { Integration } from '../types'
import { StatusPill } from '../../../components/ui/StatusPill'
import { Button } from '../../../components/ui/Button'
import { VendorIcon } from './VendorIcon'

export function IntegrationRow({
  integration, onEdit, onDelete,
}: { integration: Integration; onEdit: (i: Integration) => void; onDelete: (i: Integration) => void }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto',
      alignItems: 'center', gap: 12, padding: 14,
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        <VendorIcon type={integration.type} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{integration.name}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>{integration.type}</div>
        </div>
      </div>
      <StatusPill status={integration.status} />
      <div style={{ color: 'var(--muted)', fontSize: 13 }}>{integration.scopeSummary}</div>
      <div style={{ color: 'var(--muted)', fontSize: 13 }}>2 min ago</div>
      <div style={{ display: 'flex', gap: 8 }}>
        <Button variant="ghost" onClick={() => onEdit(integration)} aria-label={`Edit ${integration.name}`}>Edit</Button>
        <Button variant="ghost" onClick={() => onDelete(integration)} aria-label={`Delete ${integration.name}`}>Delete</Button>
      </div>
    </div>
  )
}
