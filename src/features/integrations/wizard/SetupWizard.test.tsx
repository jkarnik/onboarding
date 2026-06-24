import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, test, vi } from 'vitest'
import { SetupWizard } from './SetupWizard'

beforeEach(() => localStorage.clear())

test('Next is disabled on Connect until connection is tested', () => {
  render(<SetupWizard type="juniper-mist" onClose={() => {}} onComplete={() => {}} />)
  expect(screen.getByRole('button', { name: /next/i })).toBeDisabled()
})

test('shows the five step labels including optional tagging', () => {
  render(<SetupWizard type="juniper-mist" onClose={() => {}} onComplete={() => {}} />)
  expect(screen.getByText('Connect')).toBeInTheDocument()
  expect(screen.getByText(/tagging \(optional\)/i)).toBeInTheDocument()
  expect(screen.getByText('Review')).toBeInTheDocument()
})
