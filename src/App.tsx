import { Routes, Route } from 'react-router-dom'
import { AppShell } from './components/AppShell/AppShell'
import { DashboardPage } from './pages/DashboardPage'
import { IntegrationsPage } from './features/integrations/IntegrationsPage'

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/configure" element={<div>Configure</div>} />
        <Route path="/integrations" element={<IntegrationsPage />} />
      </Routes>
    </AppShell>
  )
}
