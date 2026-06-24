import { render, screen } from '@testing-library/react'
import App from './App'

test('renders the app shell with Integrations nav', () => {
  render(<App />)
  expect(screen.getByText('Integrations')).toBeInTheDocument()
})
