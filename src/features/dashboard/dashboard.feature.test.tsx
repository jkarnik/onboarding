import { dashboardFeature } from './dashboard.feature'

test('dashboard manifest exposes the root route and Network nav section', () => {
  expect(dashboardFeature.id).toBe('dashboard')
  expect(dashboardFeature.routes.map((r) => r.path)).toEqual(['/'])
  const section = dashboardFeature.nav[0]
  expect(section.kind).toBe('section')
  if (section.kind === 'section') {
    expect(section.label).toBe('Network')
    expect(section.links.map((l) => l.label)).toEqual(['Summary', 'Juniper Mist'])
  }
})
