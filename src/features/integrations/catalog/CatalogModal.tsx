import { CATALOG } from '../data/fixtures'
import { CatalogCard } from './CatalogCard'
import { Modal } from '../../../components/ui/Modal'

export function CatalogModal({
  open, onClose, onSelect,
}: { open: boolean; onClose: () => void; onSelect: (type: string) => void }) {
  return (
    <Modal open={open} title="Add an integration" onClose={onClose}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        {CATALOG.map((entry) => (
          <CatalogCard key={entry.type} entry={entry} onSelect={onSelect} />
        ))}
      </div>
    </Modal>
  )
}
