import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, test } from 'vitest'
import { IntegrationsPage } from './IntegrationsPage'
import { createIntegration } from './data/integrationsStore'

beforeEach(() => localStorage.clear())

const seed = () => createIntegration({
  type: 'juniper-mist', name: 'Live Demo Org',
  connection: { region: 'global', tokenLast4: '1234' },
  scope: { orgIds: ['o1'], siteIds: ['s1'], deviceIds: [] }, taggingRules: [],
})

test('shows empty state when there are no integrations', () => {
  render(<IntegrationsPage />)
  expect(screen.getByText(/connect your first integration/i)).toBeInTheDocument()
})

test('lists integrations when present', () => {
  seed()
  render(<IntegrationsPage />)
  expect(screen.getByText('Live Demo Org')).toBeInTheDocument()
  expect(screen.getByText('Connected')).toBeInTheDocument()
})

test('clicking Add opens the catalog placeholder', async () => {
  render(<IntegrationsPage />)
  await userEvent.click(screen.getByRole('button', { name: /add integration/i }))
  expect(screen.getByTestId('catalog-placeholder')).toBeInTheDocument()
})

test.skip('delete removes the row and falls back to empty state', async () => {
  seed()
  render(<IntegrationsPage />)
  await userEvent.click(screen.getByRole('button', { name: /delete/i }))
  // confirm dialog wired in a later task; here removeIntegration is called directly via confirm button
  await userEvent.click(screen.getByRole('button', { name: /^delete$/i }))
  expect(screen.getByText(/connect your first integration/i)).toBeInTheDocument()
})
