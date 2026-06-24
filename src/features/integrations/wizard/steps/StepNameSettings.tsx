import type { WizardDraft } from '../draft'
import { TextField } from '../../../../components/ui/TextField'

export function StepNameSettings({ draft, setDraft }: { draft: WizardDraft; setDraft: React.Dispatch<React.SetStateAction<WizardDraft>> }) {
  return (
    <div>
      <TextField
        label="Display name"
        value={draft.name}
        onChange={(v) => setDraft((d) => ({ ...d, name: v }))}
        error={draft.name.trim() ? undefined : 'Name is required'}
      />
      <TextField
        label="Environment tag (optional)"
        value={draft.environmentTag}
        onChange={(v) => setDraft((d) => ({ ...d, environmentTag: v }))}
        placeholder="e.g. prod, lab"
      />
    </div>
  )
}
