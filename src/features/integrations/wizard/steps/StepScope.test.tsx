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
    <span data-testid="devices">{draft.scope.deviceIds.join(',')}</span>
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

test('default view is collapsed at site level: sites shown, devices hidden', () => {
  render(<Harness />)
  expect(screen.getByLabelText('sdwan_atlanta')).toBeInTheDocument()
  expect(screen.queryByLabelText('node0.sdwan-atlanta')).not.toBeInTheDocument()
})

test('Expand all reveals devices; Collapse to sites hides them again', async () => {
  render(<Harness />)
  await userEvent.click(screen.getByRole('button', { name: 'Expand all' }))
  expect(screen.getByLabelText('node0.sdwan-atlanta')).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: 'Collapse to sites' }))
  expect(screen.queryByLabelText('node0.sdwan-atlanta')).not.toBeInTheDocument()
})

test('a single site can be expanded to reveal its devices', async () => {
  render(<Harness />)
  await userEvent.click(screen.getByRole('button', { name: 'Expand sdwan_atlanta' }))
  expect(screen.getByLabelText('node0.sdwan-atlanta')).toBeInTheDocument()
  // other sites stay collapsed
  expect(screen.queryByLabelText('Wan-Edge-Rogue-DHCP-server')).not.toBeInTheDocument()
})

test('Select all selects everything shown, cascading to collapsed (hidden) devices', async () => {
  render(<Harness />)
  await userEvent.click(screen.getByRole('button', { name: 'Select all' }))
  // hidden device under a collapsed site is selected via cascade
  expect(screen.getByTestId('devices').textContent).toMatch(/d1/)
  expect(screen.getByTestId('sites').textContent).toMatch(/s1/)
  expect(screen.getByTestId('sites').textContent).toMatch(/s3/)
})

test('Select all respects the filter: out-of-scope items are not affected', async () => {
  render(<Harness />)
  await userEvent.type(screen.getByPlaceholderText(/filter/i), 'phoenix')
  await userEvent.click(screen.getByRole('button', { name: 'Select all' }))
  expect(screen.getByTestId('sites').textContent).toMatch(/s2/) // phoenix selected
  expect(screen.getByTestId('sites').textContent).not.toMatch(/s1/) // atlanta untouched
  expect(screen.getByTestId('devices').textContent).not.toMatch(/d1/) // atlanta device untouched
})

test('Deselect all clears the shown selection', async () => {
  render(<Harness />)
  await userEvent.click(screen.getByRole('button', { name: 'Select all' }))
  expect(screen.getByTestId('sites').textContent).not.toBe('')
  await userEvent.click(screen.getByRole('button', { name: 'Deselect all' }))
  expect(screen.getByTestId('sites').textContent).toBe('')
  expect(screen.getByTestId('devices').textContent).toBe('')
})
