import type { Integration } from '../types'
import { IntegrationRow } from './IntegrationRow'

export function IntegrationList({
  integrations, onEdit, onDelete,
}: { integrations: Integration[]; onEdit: (i: Integration) => void; onDelete: (i: Integration) => void }) {
  return (
    <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
      {integrations.map((i) => (
        <IntegrationRow key={i.id} integration={i} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  )
}
