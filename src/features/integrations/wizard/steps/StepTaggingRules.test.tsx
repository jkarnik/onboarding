import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { expect, test } from 'vitest'
import { StepTaggingRules } from './StepTaggingRules'
import { initDraft, type WizardDraft } from '../draft'
import { toggleOrg, emptySelection } from '../../logic/scope'
import { getAvailableTree } from '../../data/fixtures'

function Harness() {
  const tree = getAvailableTree('juniper-mist')
  const [draft, setDraft] = useState<WizardDraft>(() => ({ ...initDraft('juniper-mist'), scope: toggleOrg(tree, emptySelection(), 'o1', true) }))
  return <>
    <StepTaggingRules draft={draft} setDraft={setDraft} />
    <span data-testid="rules">{draft.taggingRules.length}</span>
  </>
}

test('add a rule and see matching selected sites in preview', async () => {
  render(<Harness />)
  await userEvent.click(screen.getByRole('button', { name: /add rule/i }))
  expect(screen.getByTestId('rules')).toHaveTextContent('1')
  await userEvent.type(screen.getByLabelText(/pattern/i), 'sdwan')
  // preview lists matching selected sites/devices
  expect(await screen.findByText(/sdwan_atlanta/)).toBeInTheDocument()
  expect(screen.getByText(/sdwan_phoenix/)).toBeInTheDocument()
})

test('remove a rule', async () => {
  render(<Harness />)
  await userEvent.click(screen.getByRole('button', { name: /add rule/i }))
  await userEvent.click(screen.getByRole('button', { name: /remove/i }))
  expect(screen.getByTestId('rules')).toHaveTextContent('0')
})
