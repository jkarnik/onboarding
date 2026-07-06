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

test('typing a pattern and clicking Add appends it to the list with a preview', async () => {
  render(<Harness />)
  // Add rule is disabled until the default input has a pattern.
  expect(screen.getByRole('button', { name: /add rule/i })).toBeDisabled()
  await userEvent.type(screen.getByLabelText('Pattern (regex)'), 'sdwan')
  await userEvent.click(screen.getByRole('button', { name: /add rule/i }))
  expect(screen.getByTestId('rules')).toHaveTextContent('1')
  // input clears after adding; the list row shows matching selected sites/devices
  expect(screen.getByLabelText('Pattern (regex)')).toHaveValue('')
  expect(await screen.findByText(/sdwan_atlanta/)).toBeInTheDocument()
  expect(screen.getByText(/sdwan_phoenix/)).toBeInTheDocument()
})

test('edit an existing rule pattern', async () => {
  render(<Harness />)
  await userEvent.type(screen.getByLabelText('Pattern (regex)'), 'sdwan')
  await userEvent.click(screen.getByRole('button', { name: /add rule/i }))
  await userEvent.click(screen.getByRole('button', { name: /edit/i }))
  await userEvent.clear(screen.getByLabelText('Edit pattern'))
  await userEvent.type(screen.getByLabelText('Edit pattern'), 'findlay')
  await userEvent.click(screen.getByRole('button', { name: /save/i }))
  expect(screen.getByTestId('rules')).toHaveTextContent('1')
  expect(screen.getByText('findlay')).toBeInTheDocument()
  expect(screen.queryByText('sdwan')).not.toBeInTheDocument()
})

test('delete a rule', async () => {
  render(<Harness />)
  await userEvent.type(screen.getByLabelText('Pattern (regex)'), 'sdwan')
  await userEvent.click(screen.getByRole('button', { name: /add rule/i }))
  expect(screen.getByTestId('rules')).toHaveTextContent('1')
  await userEvent.click(screen.getByRole('button', { name: /delete/i }))
  expect(screen.getByTestId('rules')).toHaveTextContent('0')
})
