import type { FeatureManifest, RouteDef, NavItem } from './types'
import { dashboardFeature } from '../features/dashboard/dashboard.feature'
import { integrationsFeature } from '../features/integrations/integrations.feature'

const features: FeatureManifest[] = [dashboardFeature, integrationsFeature]

export function assertNoDuplicateRoutes(list: FeatureManifest[]): void {
  const seen = new Set<string>()
  for (const f of list) {
    for (const r of f.routes) {
      if (seen.has(r.path)) throw new Error(`Duplicate route path: ${r.path}`)
      seen.add(r.path)
    }
  }
}

assertNoDuplicateRoutes(features)

export const registeredFeatures: FeatureManifest[] = [...features].sort((a, b) => a.order - b.order)
export const allRoutes: RouteDef[] = registeredFeatures.flatMap((f) => f.routes)
export const allNav: NavItem[] = registeredFeatures.flatMap((f) => f.nav)
