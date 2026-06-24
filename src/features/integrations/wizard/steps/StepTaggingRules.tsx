import { useMemo, useRef } from 'react'
import type { WizardDraft } from '../draft'
import type { TaggingRule } from '../../types'
import { getAvailableTree } from '../../data/fixtures'
import { TextField } from '../../../../components/ui/TextField'
import { Select } from '../../../../components/ui/Select'
import { Button } from '../../../../components/ui/Button'
import { RulePreview } from './RulePreview'

const TARGETS = [
  { value: 'sites', label: 'Sites' },
  { value: 'devices', label: 'Devices' },
  { value: 'both', label: 'Both' },
]

export function StepTaggingRules({ draft, setDraft }: { draft: WizardDraft; setDraft: React.Dispatch<React.SetStateAction<WizardDraft>> }) {
  const tree = useMemo(() => getAvailableTree(draft.type), [draft.type])
  const seqRef = useRef(
    draft.taggingRules.reduce((max, r) => {
      const n = Number(r.id.replace(/^rule-/, ''))
      return Number.isFinite(n) && n > max ? n : max
    }, -1) + 1
  )

  const update = (rules: TaggingRule[]) => setDraft((d) => ({ ...d, taggingRules: rules }))
  const addRule = () => { const id = `rule-${seqRef.current++}`; update([...draft.taggingRules, { id, pattern: '', target: 'sites', tag: '' }]) }
  const patch = (id: string, p: Partial<TaggingRule>) => update(draft.taggingRules.map((r) => r.id === id ? { ...r, ...p } : r))
  const remove = (id: string) => update(draft.taggingRules.filter((r) => r.id !== id))

  return (
    <div>
      <p style={{ color: 'var(--muted)', marginTop: 0 }}>Optional — define regex rules to auto-tag your selected sites and devices.</p>
      {draft.taggingRules.map((rule) => (
        <div key={rule.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 12, marginBottom: 10 }}>
          <TextField label="Pattern (regex)" value={rule.pattern} onChange={(v) => patch(rule.id, { pattern: v })} placeholder="e.g. sdwan_.*" />
          <Select label="Target" value={rule.target} onChange={(v) => patch(rule.id, { target: v as TaggingRule['target'] })} options={TARGETS} />
          <TextField label="Tag" value={rule.tag} onChange={(v) => patch(rule.id, { tag: v })} placeholder="e.g. wan-edge" />
          <RulePreview rule={rule} selection={draft.scope} tree={tree} />
          <div style={{ marginTop: 8 }}><Button variant="ghost" onClick={() => remove(rule.id)}>Remove</Button></div>
        </div>
      ))}
      <Button variant="ghost" onClick={addRule}>+ Add rule</Button>
    </div>
  )
}
