import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import { CatalogModal } from './CatalogModal'

test('selecting a real integration fires onSelect with its type', async () => {
  const onSelect = vi.fn()
  render(<CatalogModal open onClose={() => {}} onSelect={onSelect} />)
  await userEvent.click(screen.getByRole('button', { name: /juniper mist/i }))
  expect(onSelect).toHaveBeenCalledWith('juniper-mist')
})

test('coming-soon integrations are disabled', () => {
  render(<CatalogModal open onClose={() => {}} onSelect={() => {}} />)
  expect(screen.getByRole('button', { name: /datadog/i })).toBeDisabled()
  expect(screen.getAllByText(/coming soon/i).length).toBeGreaterThan(0)
})
