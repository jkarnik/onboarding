import { Button } from '../../../../components/ui/Button'

export function WizardSuccess({
  name, scopeSummary, onViewDashboard, onDone,
}: { name: string; scopeSummary: string; onViewDashboard: () => void; onDone: () => void }) {
  return (
    <div data-testid="wizard-success" style={{ textAlign: 'center', padding: 16 }}>
      <div style={{ fontSize: 32, color: 'var(--green)' }}>✓</div>
      <h3>{name} connected</h3>
      <p style={{ color: 'var(--muted)' }}>Now monitoring {scopeSummary}.</p>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16 }}>
        <Button variant="ghost" onClick={onViewDashboard}>View dashboard</Button>
        <Button onClick={onDone}>Done</Button>
      </div>
    </div>
  )
}
