import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from './App'

beforeEach(() => localStorage.clear())

test('shows the Integrations nav link', () => {
  render(<MemoryRouter><App /></MemoryRouter>)
  expect(screen.getByRole('link', { name: 'Integrations' })).toBeInTheDocument()
})

test('navigates to the integrations route', () => {
  render(<MemoryRouter initialEntries={['/integrations']}><App /></MemoryRouter>)
  expect(screen.getByText(/connect your first integration/i)).toBeInTheDocument()
})
