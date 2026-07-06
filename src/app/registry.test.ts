import { registeredFeatures, allRoutes, assertNoDuplicateRoutes } from './registry'
import type { FeatureManifest } from './types'

test('features are sorted by order', () => {
  const orders = registeredFeatures.map((f) => f.order)
  expect(orders).toEqual([...orders].sort((a, b) => a - b))
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
