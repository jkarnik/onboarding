import { render, screen } from '@testing-library/react'
import { ProgressSteps } from './ProgressSteps'

const steps = [
  { key: 'a', label: 'Connect' },
  { key: 'b', label: 'Scope' },
  { key: 'c', label: 'Tags', optional: true },
]

test('marks active step and shows optional badge', () => {
  render(<ProgressSteps steps={steps} activeIndex={1} />)
  expect(screen.getByText('Scope').closest('[data-active="true"]')).not.toBeNull()
  expect(screen.getByText(/optional/i)).toBeInTheDocument()
})
