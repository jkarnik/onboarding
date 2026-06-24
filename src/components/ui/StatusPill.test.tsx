import { render, screen } from '@testing-library/react'
import { StatusPill } from './StatusPill'

test('renders human label for each status', () => {
  const { rerender } = render(<StatusPill status="connected" />)
  expect(screen.getByText('Connected')).toBeInTheDocument()
  rerender(<StatusPill status="error" />)
  expect(screen.getByText('Error')).toBeInTheDocument()
})
