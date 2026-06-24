import { beforeEach, expect, test } from 'vitest'
import { createIntegration, listIntegrations, getIntegration, updateIntegration, removeIntegration, deriveScopeSummary } from './integrationsStore'
import { getAvailableTree } from './fixtures'

beforeEach(() => localStorage.clear())

const draft = {
  type: 'juniper-mist', name: 'Live Demo Org', environmentTag: 'prod',
  connection: { region: 'global', tokenLast4: '1234' },
  scope: { orgIds: ['o1'], siteIds: ['s1', 's2'], deviceIds: [] },
  taggingRules: [],
}

test('create assigns id, status, derived summary; list returns it', () => {
  const created = createIntegration(draft)
  expect(created.id).toMatch(/^int-/)
  expect(created.status).toBe('connected')
  expect(created.scopeSummary).toContain('site')
  expect(listIntegrations()).toHaveLength(1)
})

test('get / update / remove round-trip', () => {
  const created = createIntegration(draft)
  expect(getIntegration(created.id)?.name).toBe('Live Demo Org')
  updateIntegration(created.id, { name: 'Renamed' })
  expect(getIntegration(created.id)?.name).toBe('Renamed')
  removeIntegration(created.id)
  expect(listIntegrations()).toHaveLength(0)
})

test('deriveScopeSummary counts orgs and sites', () => {
  const tree = getAvailableTree('juniper-mist')
  const summary = deriveScopeSummary({ orgIds: [tree[0].id], siteIds: [tree[0].sites[0].id], deviceIds: [] }, tree)
  expect(summary).toMatch(/1 org/)
  expect(summary).toMatch(/1 site/)
})

test('persists across store reloads via localStorage', () => {
  createIntegration(draft)
  expect(localStorage.getItem('onboarding.integrations.v1')).not.toBeNull()
})

test('C1 regression: ids stay unique after delete+recreate', () => {
  const a = createIntegration(draft)
  createIntegration(draft)
  removeIntegration(a.id)
  createIntegration(draft)
  const ids = listIntegrations().map((i) => i.id)
  expect(new Set(ids).size).toBe(ids.length)
})
