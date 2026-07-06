import { integrationsFeature } from './integrations.feature'

test('integrations manifest exposes configure + integrations routes and nav', () => {
  expect(integrationsFeature.id).toBe('integrations')
  expect(integrationsFeature.routes.map((r) => r.path)).toEqual(['/configure', '/integrations'])
  const section = integrationsFeature.nav[0]
  expect(section.kind).toBe('section')
  if (section.kind === 'section') {
    expect(section.label).toBe('Integrate')
    expect(section.links.map((l) => l.label)).toEqual(['Configure', 'Integrations'])
  }
})
