import { registeredFeatures, allRoutes, assertNoDuplicateRoutes } from './registry'
import type { FeatureManifest } from './types'

test('features are registered in ascending order (dashboard before integrations)', () => {
  expect(registeredFeatures.map((f) => f.id)).toEqual(['dashboard', 'integrations'])
})

test('allRoutes includes root and integrations paths', () => {
  const paths = allRoutes.map((r) => r.path)
  expect(paths).toContain('/')
  expect(paths).toContain('/integrations')
})

test('assertNoDuplicateRoutes throws on duplicate path', () => {
  const dup: FeatureManifest[] = [
    { id: 'a', order: 0, routes: [{ path: '/x', element: null }], nav: [] },
    { id: 'b', order: 1, routes: [{ path: '/x', element: null }], nav: [] },
  ]
  expect(() => assertNoDuplicateRoutes(dup)).toThrow(/duplicate route/i)
})
