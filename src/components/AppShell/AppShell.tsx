import type { ReactNode } from 'react'
import { AppNav } from '../../app/AppNav'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <AppNav />
      <main style={{ flex: 1, overflow: 'auto', padding: 24 }}>{children}</main>
    </div>
  )
}
