import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { expect, test } from 'vitest'
import { StepConnect } from './StepConnect'
import { initDraft, type WizardDraft } from '../draft'

function Harness() {
  const [draft, setDraft] = useState<WizardDraft>(() => initDraft('juniper-mist'))
  return <>
    <StepConnect draft={draft} setDraft={setDraft} />
    <span data-testid="tested">{String(draft.connection.tested)}</span>
  </>
}

test('successful test connection sets tested=true', async () => {
  render(<Harness />)
  await userEvent.type(screen.getByLabelText(/api token/i), 'good-token')
  await userEvent.click(screen.getByRole('button', { name: /test connection/i }))
  expect(await screen.findByText(/connected/i)).toBeInTheDocument()
  expect(screen.getByTestId('tested')).toHaveTextContent('true')
})

test('failing token shows error and leaves tested=false', async () => {
  render(<Harness />)
  await userEvent.type(screen.getByLabelText(/api token/i), 'fail-token')
  await userEvent.click(screen.getByRole('button', { name: /test connection/i }))
  expect(await screen.findByText(/could not connect/i)).toBeInTheDocument()
  expect(screen.getByTestId('tested')).toHaveTextContent('false')
})
