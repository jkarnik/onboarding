import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { expect, test } from 'vitest'
import { StepScope } from './StepScope'
import { initDraft, type WizardDraft } from '../draft'

function Harness() {
  const [draft, setDraft] = useState<WizardDraft>(() => initDraft('juniper-mist'))
  return <>
    <StepScope draft={draft} setDraft={setDraft} />
    <span data-testid="sites">{draft.scope.siteIds.join(',')}</span>
  </>
}

test('selecting an org selects its sites', async () => {
  render(<Harness />)
  await userEvent.click(screen.getByLabelText('Live Demo Org'))
  expect(screen.getByTestId('sites').textContent).toMatch(/s1/)
  expect(screen.getByTestId('sites').textContent).toMatch(/s2/)
})

test('text filter hides non-matching sites but keeps selection', async () => {
  render(<Harness />)
  await userEvent.click(screen.getByLabelText('Live Demo Org')) // select all
  await userEvent.type(screen.getByPlaceholderText(/filter/i), 'phoenix')
  expect(screen.queryByLabelText('sdwan_atlanta')).not.toBeInTheDocument()
  expect(screen.getByTestId('sites').textContent).toMatch(/s1/) // still selected
})

test('invalid regex shows inline error', async () => {
  render(<Harness />)
  await userEvent.click(screen.getByRole('button', { name: /regex/i }))
  await userEvent.type(screen.getByPlaceholderText(/filter/i), '(')
  expect(screen.getByText(/invalid regex/i)).toBeInTheDocument()
})
