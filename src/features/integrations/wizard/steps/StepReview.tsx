import type { WizardDraft, StepKey } from '../draft'
import { deriveScopeSummary } from '../../data/integrationsStore'
import { getAvailableTree } from '../../data/fixtures'

function Row({ label, children, onEdit }: { label: string; children: React.ReactNode; onEdit: () => void }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
      <div><div style={{ fontSize: 12, color: 'var(--muted)' }}>{label}</div><div>{children}</div></div>
      <button onClick={onEdit} style={{ background: 'none', border: 'none', color: 'var(--blue)' }}>Edit</button>
    </div>
  )
}

export function StepReview({ draft, onEditStep }: { draft: WizardDraft; onEditStep: (key: StepKey) => void }) {
  const summary = deriveScopeSummary(draft.scope, getAvailableTree(draft.type))
  const masked = draft.connection.token ? `••••${draft.connection.token.slice(-4)}` : '— (unchanged)'
  return (
    <div>
      <Row label="Connection name" onEdit={() => onEditStep('connect')}>{draft.name}</Row>
      <Row label="Connection" onEdit={() => onEditStep('connect')}>Token {masked} · {draft.connection.region.toUpperCase()}</Row>
      <Row label="Scope" onEdit={() => onEditStep('scope')}>{summary}</Row>
      <Row label="Tagging rules" onEdit={() => onEditStep('tagging')}>
        {draft.taggingRules.length ? draft.taggingRules.map((r) => `${r.tag} (/${r.pattern}/)`).join(', ') : 'None'}
      </Row>
    </div>
  )
}
