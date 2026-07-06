import { vi } from 'vitest'
vi.mock('./registry', () => ({
  allNav: [{ kind: 'link', to: '/solo', label: 'Solo Link' }],
}))
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppNav } from './AppNav'

test('renders a top-level link nav item', () => {
  render(<MemoryRouter><AppNav /></MemoryRouter>)
  expect(screen.getByRole('link', { name: 'Solo Link' })).toBeInTheDocument()
})
