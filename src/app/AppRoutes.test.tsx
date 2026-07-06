import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppRoutes } from './AppRoutes'

beforeEach(() => localStorage.clear())

test('renders the dashboard at /', () => {
  render(<MemoryRouter initialEntries={['/']}><AppRoutes /></MemoryRouter>)
  expect(screen.getByRole('heading', { name: 'Juniper Mist' })).toBeInTheDocument()
})

test('renders the integrations page at /integrations', () => {
  render(<MemoryRouter initialEntries={['/integrations']}><AppRoutes /></MemoryRouter>)
  expect(screen.getByText(/connect your first integration/i)).toBeInTheDocument()
})
