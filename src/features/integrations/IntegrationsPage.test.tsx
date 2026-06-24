import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, test } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { IntegrationsPage } from './IntegrationsPage'
import { createIntegration } from './data/integrationsStore'

beforeEach(() => localStorage.clear())

const seed = () => createIntegration({
  type: 'juniper-mist', name: 'Live Demo Org',
  connection: { region: 'global', tokenLast4: '1234' },
  scope: { orgIds: ['o1'], siteIds: ['s1'], deviceIds: [] }, taggingRules: [],
})

const renderPage = () => render(<MemoryRouter><IntegrationsPage /></MemoryRouter>)

test('shows empty state when there are no integrations', () => {
  renderPage()
  expect(screen.getByText(/connect your first integration/i)).toBeInTheDocument()
})

test('lists integrations when present', () => {
  seed()
  renderPage()
  expect(screen.getByText('Live Demo Org')).toBeInTheDocument()
  expect(screen.getByText('Connected')).toBeInTheDocument()
})

test('clicking Add opens the catalog modal', async () => {
  renderPage()
  await userEvent.click(screen.getByRole('button', { name: /add integration/i }))
  expect(screen.getByText('Add an integration')).toBeInTheDocument()
})

test('delete asks for confirmation, then removes and shows empty state', async () => {
  seed()
  renderPage()
  await userEvent.click(screen.getByRole('button', { name: /delete/i }))
  expect(screen.getByText(/this can.?t be undone/i)).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: /^delete$/i }))
  expect(screen.getByText(/connect your first integration/i)).toBeInTheDocument()
})

test('edit opens the wizard on the Review step prefilled', async () => {
  seed()
  renderPage()
  await userEvent.click(screen.getByRole('button', { name: /edit/i }))
  expect(screen.getByText('Edit integration')).toBeInTheDocument()
  expect(screen.getByText(/Live Demo Org/)).toBeInTheDocument() // shown in review summary
})
