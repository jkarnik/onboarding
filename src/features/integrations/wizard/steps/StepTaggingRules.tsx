import { useMemo, useRef, useState } from 'react'
import type { WizardDraft } from '../draft'
import type { TaggingRule } from '../../types'
import { getAvailableTree } from '../../data/fixtures'
import { TextField } from '../../../../components/ui/TextField'
import { Button } from '../../../../components/ui/Button'
import { RulePreview } from './RulePreview'

const PLACEHOLDER = 'e.g. ^(?<Region>[A-Z]{2})-(?<City>[A-Z]{3})-.*'

export function StepTaggingRules({ draft, setDraft }: { draft: WizardDraft; setDraft: React.Dispatch<React.SetStateAction<WizardDraft>> }) {
  const tree = useMemo(() => getAvailableTree(draft.type), [draft.type])
  const seqRef = useRef(
    draft.taggingRules.reduce((max, r) => {
      const n = Number(r.id.replace(/^rule-/, ''))
      return Number.isFinite(n) && n > max ? n : max
    }, -1) + 1
  )

  const [newPattern, setNewPattern] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editPattern, setEditPattern] = useState('')

  const update = (rules: TaggingRule[]) => setDraft((d) => ({ ...d, taggingRules: rules }))

  const addRule = () => {
    const pattern = newPattern.trim()
    if (!pattern) return
    update([...draft.taggingRules, { id: `rule-${seqRef.current++}`, pattern }])
    setNewPattern('')
  }
  const remove = (id: string) => {
    if (editingId === id) setEditingId(null)
    update(draft.taggingRules.filter((r) => r.id !== id))
  }
  const startEdit = (rule: TaggingRule) => { setEditingId(rule.id); setEditPattern(rule.pattern) }
  const cancelEdit = () => setEditingId(null)
  const saveEdit = () => {
    const pattern = editPattern.trim()
    if (!pattern) return
    update(draft.taggingRules.map((r) => (r.id === editingId ? { ...r, pattern } : r)))
    setEditingId(null)
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginTop: 0 }}>
        <p style={{ color: 'var(--muted)', margin: 0 }}>Optional — define regex patterns to auto-tag your selected sites and devices. Use named capturing groups to extract tags.</p>
        <a href="/regex-hints.html" target="_blank" rel="noopener noreferrer"
          style={{ color: 'var(--blue)', fontSize: 13, whiteSpace: 'nowrap', textDecoration: 'none' }}>
          Regex tagging hints ↗
        </a>
      </div>

      {/* Default single input — type a pattern and add it to the list below. */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', marginTop: 12 }}>
        <div style={{ flex: 1 }}>
          <TextField label="Pattern (regex)" value={newPattern} onChange={setNewPattern} placeholder={PLACEHOLDER} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <Button onClick={addRule} disabled={!newPattern.trim()}>Add rule</Button>
        </div>
      </div>
      {newPattern.trim() && <RulePreview rule={{ id: 'new', pattern: newPattern }} selection={draft.scope} tree={tree} />}

      {/* Added rules */}
      {draft.taggingRules.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0, margin: '18px 0 0' }}>
          {draft.taggingRules.map((rule) => (
            <li key={rule.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 12, marginBottom: 10 }}>
              {editingId === rule.id ? (
                <>
                  <TextField label="Edit pattern" value={editPattern} onChange={setEditPattern} placeholder={PLACEHOLDER} />
                  <RulePreview rule={{ ...rule, pattern: editPattern }} selection={draft.scope} tree={tree} />
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <Button onClick={saveEdit} disabled={!editPattern.trim()}>Save</Button>
                    <Button variant="ghost" onClick={cancelEdit}>Cancel</Button>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <code style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 13, wordBreak: 'break-all', minWidth: 0 }}>{rule.pattern}</code>
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                      <Button variant="ghost" onClick={() => startEdit(rule)}>Edit</Button>
                      <Button variant="ghost" onClick={() => remove(rule.id)}>Delete</Button>
                    </div>
                  </div>
                  <RulePreview rule={rule} selection={draft.scope} tree={tree} />
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
