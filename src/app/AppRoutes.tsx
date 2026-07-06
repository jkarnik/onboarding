import { Routes, Route } from 'react-router-dom'
import { allRoutes } from './registry'

export function AppRoutes() {
  return (
    <Routes>
      {allRoutes.map((r) => (
        <Route key={r.path} path={r.path} element={r.element} index={r.index} />
      ))}
    </Routes>
  )
}
