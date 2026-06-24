import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { expect, test } from 'vitest'
import { StepNameSettings } from './StepNameSettings'
import { initDraft, type WizardDraft } from '../draft'

function Harness() {
  const [draft, setDraft] = useState<WizardDraft>(() => initDraft('juniper-mist'))
  return <>
    <StepNameSettings draft={draft} setDraft={setDraft} />
    <span data-testid="name">{draft.name}</span>
    <span data-testid="tag">{draft.environmentTag}</span>
  </>
}

test('prefills default name and edits name + tag', async () => {
  render(<Harness />)
  expect(screen.getByLabelText(/display name/i)).toHaveValue('Juniper Mist – Global')
  await userEvent.clear(screen.getByLabelText(/display name/i))
  await userEvent.type(screen.getByLabelText(/display name/i), 'My Mist')
  await userEvent.type(screen.getByLabelText(/environment tag/i), 'prod')
  expect(screen.getByTestId('name')).toHaveTextContent('My Mist')
  expect(screen.getByTestId('tag')).toHaveTextContent('prod')
})

test('empty name shows an error hint', async () => {
  render(<Harness />)
  await userEvent.clear(screen.getByLabelText(/display name/i))
  expect(screen.getByText(/name is required/i)).toBeInTheDocument()
})
