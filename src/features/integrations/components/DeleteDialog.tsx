import type { Integration } from '../types'
import { Modal } from '../../../components/ui/Modal'
import { Button } from '../../../components/ui/Button'

export function DeleteDialog({
  integration, onCancel, onConfirm,
}: { integration: Integration; onCancel: () => void; onConfirm: () => void }) {
  return (
    <Modal
      open
      title="Delete integration"
      onClose={onCancel}
      footer={<>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button variant="danger" onClick={onConfirm}>Delete</Button>
      </>}
    >
      <p>Delete <strong>{integration.name}</strong>? This removes the integration and its tagging rules. This can't be undone.</p>
    </Modal>
  )
}
