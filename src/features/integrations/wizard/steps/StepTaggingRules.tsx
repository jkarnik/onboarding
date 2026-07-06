import { useMemo, useRef } from 'react'
import type { WizardDraft } from '../draft'
import type { TaggingRule } from '../../types'
import { getAvailableTree } from '../../data/fixtures'
import { TextField } from '../../../../components/ui/TextField'
import { Button } from '../../../../components/ui/Button'
import { RulePreview } from './RulePreview'

export function StepTaggingRules({ draft, setDraft }: { draft: WizardDraft; setDraft: React.Dispatch<React.SetStateAction<WizardDraft>> }) {
  const tree = useMemo(() => getAvailableTree(draft.type), [draft.type])
  const seqRef = useRef(
    draft.taggingRules.reduce((max, r) => {
      const n = Number(r.id.replace(/^rule-/, ''))
      return Number.isFinite(n) && n > max ? n : max
    }, -1) + 1
  )

  const update = (rules: TaggingRule[]) => setDraft((d) => ({ ...d, taggingRules: rules }))
  const addRule = () => { const id = `rule-${seqRef.current++}`; update([...draft.taggingRules, { id, pattern: '' }]) }
  const patch = (id: string, p: Partial<TaggingRule>) => update(draft.taggingRules.map((r) => r.id === id ? { ...r, ...p } : r))
  const remove = (id: string) => update(draft.taggingRules.filter((r) => r.id !== id))

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginTop: 0 }}>
        <p style={{ color: 'var(--muted)', margin: 0 }}>Optional — define regex patterns to auto-tag your selected sites and devices. Use named capturing groups to extract tags.</p>
        <a href="/regex-hints.html" target="_blank" rel="noopener noreferrer"
          style={{ color: 'var(--blue)', fontSize: 13, whiteSpace: 'nowrap', textDecoration: 'none' }}>
          Regex tagging hints ↗
        </a>
      </div>
      {draft.taggingRules.map((rule) => (
        <div key={rule.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 12, marginBottom: 10, marginTop: 10 }}>
          <TextField label="Pattern (regex)" value={rule.pattern} onChange={(v) => patch(rule.id, { pattern: v })} placeholder="e.g. ^(?<Region>[A-Z]{2})-(?<City>[A-Z]{3})-.*" />
          <RulePreview rule={rule} selection={draft.scope} tree={tree} />
          <div style={{ marginTop: 8 }}><Button variant="ghost" onClick={() => remove(rule.id)}>Remove</Button></div>
        </div>
      ))}
      <Button variant="ghost" onClick={addRule}>+ Add rule</Button>
    </div>
  )
}
