import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import { StepReview } from './StepReview'
import { initDraft } from '../draft'

const draft = { ...initDraft('juniper-mist'), name: 'My Mist', connection: { token: 'abcd1234', region: 'global', tested: true }, scope: { orgIds: ['o1'], siteIds: ['s1'], deviceIds: [] } }

test('shows masked token and lets you jump to a step', async () => {
  const onEditStep = vi.fn()
  render(<StepReview draft={draft} onEditStep={onEditStep} />)
  expect(screen.getByText(/1234/)).toBeInTheDocument()
  expect(screen.queryByText('abcd1234')).not.toBeInTheDocument()
  await userEvent.click(screen.getAllByRole('button', { name: /edit/i })[0])
  expect(onEditStep).toHaveBeenCalled()
})
