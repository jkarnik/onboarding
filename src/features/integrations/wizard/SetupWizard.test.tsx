import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, expect, test } from 'vitest'
import { SetupWizard } from './SetupWizard'

beforeEach(() => localStorage.clear())

test('Next is disabled on Connect until connection is tested', () => {
  render(<MemoryRouter><SetupWizard type="juniper-mist" onClose={() => {}} onComplete={() => {}} /></MemoryRouter>)
  expect(screen.getByRole('button', { name: /next/i })).toBeDisabled()
})

test('shows the four step labels including optional tagging', () => {
  render(<MemoryRouter><SetupWizard type="juniper-mist" onClose={() => {}} onComplete={() => {}} /></MemoryRouter>)
  expect(screen.getByText('Connect')).toBeInTheDocument()
  expect(screen.getByText('Select scope')).toBeInTheDocument()
  expect(screen.getByText(/tagging \(optional\)/i)).toBeInTheDocument()
  expect(screen.getByText('Review')).toBeInTheDocument()
  expect(screen.queryByText('Name & settings')).not.toBeInTheDocument()
})
