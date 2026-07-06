import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppNav } from './AppNav'

test('renders section labels and links from the registry', () => {
  render(<MemoryRouter><AppNav /></MemoryRouter>)
  expect(screen.getByText('Network')).toBeInTheDocument()
  expect(screen.getByText('Integrate')).toBeInTheDocument()
  expect(screen.getByText('Juniper Mist')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Integrations' })).toBeInTheDocument()
})
