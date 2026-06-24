import { useState } from 'react'
import type { Integration } from './types'
import { listIntegrations, removeIntegration } from './data/integrationsStore'
import { IntegrationList } from './components/IntegrationList'
import { EmptyState } from './components/EmptyState'
import { Button } from '../../components/ui/Button'
import { CatalogModal } from './catalog/CatalogModal'
import { SetupWizard } from './wizard/SetupWizard'

type View =
  | { mode: 'list' }
  | { mode: 'catalog' }
  | { mode: 'wizard'; type: string; editing?: Integration }

export function IntegrationsPage() {
  const [items, setItems] = useState<Integration[]>(() => listIntegrations())
  const [view, setView] = useState<View>({ mode: 'list' })
  const [deleteTarget, setDeleteTarget] = useState<Integration | null>(null)

  const reload = () => setItems(listIntegrations())
  const openCatalog = () => setView({ mode: 'catalog' })

  // Temporary delete confirm (replaced by DeleteDialog in Task 14)
  const confirmDelete = () => {
    if (deleteTarget) { removeIntegration(deleteTarget.id); setDeleteTarget(null); reload() }
  }

  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ margin: 0 }}>Integrations</h1>
        {items.length > 0 && <Button onClick={openCatalog}>+ Add integration</Button>}
      </header>

      {items.length === 0
        ? <EmptyState onBrowse={openCatalog} />
        : <IntegrationList
            integrations={items}
            onEdit={(i) => setView({ mode: 'wizard', type: i.type, editing: i })}
            onDelete={(i) => setDeleteTarget(i)}
          />}

      <CatalogModal
        open={view.mode === 'catalog'}
        onClose={() => setView({ mode: 'list' })}
        onSelect={(type) => setView({ mode: 'wizard', type })}
      />
      {view.mode === 'wizard' && (
        <SetupWizard
          type={view.type}
          editing={view.editing}
          onClose={() => setView({ mode: 'list' })}
          onComplete={reload}
        />
      )}

      {deleteTarget && (
        <div role="dialog" aria-label="Confirm delete">
          <span>Delete {deleteTarget.name}?</span>
          <Button variant="danger" onClick={confirmDelete}>Delete</Button>
          <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
        </div>
      )}
    </div>
  )
}
