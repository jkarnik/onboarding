import { Routes, Route } from 'react-router-dom'
import { AppShell } from './components/AppShell/AppShell'
import { DashboardPage } from './pages/DashboardPage'

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/configure" element={<div>Configure</div>} />
        <Route path="/integrations" element={<div data-testid="integrations-route">Integrations</div>} />
      </Routes>
    </AppShell>
  )
}
