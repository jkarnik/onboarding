import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Integration } from '../types'
import { ProgressSteps } from '../../../components/ui/ProgressSteps'
import { Button } from '../../../components/ui/Button'
import { Modal } from '../../../components/ui/Modal'
import { createIntegration, updateIntegration, deriveScopeSummary } from '../data/integrationsStore'
import { getAvailableTree } from '../data/fixtures'
import { initDraft, STEP_KEYS, canAdvance, type WizardDraft, type StepKey } from './draft'
import { StepConnect } from './steps/StepConnect'
import { StepScope } from './steps/StepScope'
import { StepNameSettings } from './steps/StepNameSettings'
import { StepTaggingRules } from './steps/StepTaggingRules'
import { StepReview } from './steps/StepReview'
import { WizardSuccess } from './steps/WizardSuccess'

const STEP_META = [
  { key: 'connect', label: 'Connect' },
  { key: 'scope', label: 'Select scope' },
  { key: 'name', label: 'Name & settings' },
  { key: 'tagging', label: 'Tagging', optional: true },
  { key: 'review', label: 'Review' },
]

export function SetupWizard({
  type, editing, onClose, onComplete,
}: { type: string; editing?: Integration; onClose: () => void; onComplete: () => void }) {
  const navigate = useNavigate()
  const [draft, setDraft] = useState<WizardDraft>(() => initDraft(type, editing))
  const [index, setIndex] = useState(editing ? STEP_KEYS.indexOf('review') : 0)
  const [done, setDone] = useState(false)
  const [confirmClose, setConfirmClose] = useState(false)

  const step = STEP_KEYS[index] as StepKey
  const goTo = (key: StepKey) => setIndex(STEP_KEYS.indexOf(key))
  const isLast = step === 'review'

  const submit = () => {
    const payload = {
      type: draft.type, name: draft.name, environmentTag: draft.environmentTag || undefined,
      connection: { region: draft.connection.region, orgId: draft.connection.orgId || undefined, tokenLast4: draft.connection.token.slice(-4) || undefined },
      scope: draft.scope, taggingRules: draft.taggingRules,
    }
    if (editing) updateIntegration(editing.id, payload)
    else createIntegration(payload)
    setDone(true)
  }

  const next = () => {
    if (isLast) { submit(); return }
    setIndex((i) => i + 1)
  }
  const skip = () => setIndex(STEP_KEYS.indexOf('review'))

  if (done) {
    return (
      <Modal open title="Done" onClose={() => { onComplete(); onClose() }}>
        <WizardSuccess
          name={draft.name}
          scopeSummary={deriveScopeSummary(draft.scope, getAvailableTree(draft.type))}
          onViewDashboard={() => { onComplete(); onClose(); navigate('/') }}
          onDone={() => { onComplete(); onClose() }}
        />
      </Modal>
    )
  }

  return (
    <>
      <Modal
        open
        title={editing ? 'Edit integration' : 'Set up integration'}
        onClose={() => setConfirmClose(true)}
        footer={
          <>
            {index > 0 && <Button variant="ghost" onClick={() => setIndex((i) => i - 1)}>Back</Button>}
            {step === 'tagging' && <Button variant="ghost" onClick={skip}>Skip</Button>}
            <Button onClick={next} disabled={!canAdvance(step, draft)}>
              {isLast ? 'Connect integration' : 'Next'}
            </Button>
          </>
        }
      >
        <ProgressSteps steps={STEP_META} activeIndex={index} onStepClick={editing ? (i) => setIndex(i) : undefined} />
        <div style={{ marginTop: 20 }}>
          {/* Step bodies plugged in Tasks 9–13 */}
          {step === 'connect' && <StepConnect draft={draft} setDraft={setDraft} />}
          {step === 'scope' && <StepScope draft={draft} setDraft={setDraft} />}
          {step === 'name' && <StepNameSettings draft={draft} setDraft={setDraft} />}
          {step === 'tagging' && <StepTaggingRules draft={draft} setDraft={setDraft} />}
          {step === 'review' && <StepReview draft={draft} onEditStep={goTo} />}
        </div>
      </Modal>

      {confirmClose && (
        <Modal open title="Discard setup?" onClose={() => setConfirmClose(false)}
          footer={<>
            <Button variant="ghost" onClick={() => setConfirmClose(false)}>Keep editing</Button>
            <Button variant="danger" onClick={onClose}>Discard</Button>
          </>}>
          <p>Your progress will be lost.</p>
        </Modal>
      )}
    </>
  )
}
