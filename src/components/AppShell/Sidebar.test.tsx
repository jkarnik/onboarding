import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Sidebar } from './Sidebar'

test('renders Network and Integrate sections', () => {
  render(<MemoryRouter><Sidebar /></MemoryRouter>)
  expect(screen.getByText('Juniper Mist')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Integrations' })).toBeInTheDocument()
})
