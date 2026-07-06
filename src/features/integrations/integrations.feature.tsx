import type { FeatureManifest } from '../../app/types'
import { IntegrationsPage } from './IntegrationsPage'

export const integrationsFeature: FeatureManifest = {
  id: 'integrations',
  order: 20,
  routes: [
    { path: '/configure', element: <div>Configure</div> },
    { path: '/integrations', element: <IntegrationsPage /> },
  ],
  nav: [
    {
      kind: 'section',
      label: 'Integrate',
      links: [
        { to: '/configure', label: 'Configure' },
        { to: '/integrations', label: 'Integrations' },
      ],
    },
  ],
}
