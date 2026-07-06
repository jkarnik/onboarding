import type { FeatureManifest } from '../../app/types'
import { DashboardPage } from './DashboardPage'

export const dashboardFeature: FeatureManifest = {
  id: 'dashboard',
  order: 0,
  routes: [{ path: '/', element: <DashboardPage /> }],
  nav: [
    {
      kind: 'section',
      label: 'Network',
      links: [
        { to: '/', label: 'Summary', end: true },
        { to: '/', label: 'Juniper Mist' },
      ],
    },
  ],
}
