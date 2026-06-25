import { expect, test } from 'vitest'
import { initDraft } from './draft'
import { collectScope } from '../logic/scope'
import { getAvailableTree } from '../data/fixtures'
import type { Integration } from '../types'

test('new draft preselects every org, site and device by default', () => {
  const draft = initDraft('juniper-mist')
  const all = collectScope(getAvailableTree('juniper-mist'))
  expect(draft.scope.orgIds.sort()).toEqual(all.orgIds.sort())
  expect(draft.scope.siteIds.sort()).toEqual(all.siteIds.sort())
  expect(draft.scope.deviceIds.sort()).toEqual(all.deviceIds.sort())
})

test('editing draft preserves the saved scope instead of preselecting all', () => {
  const editing: Integration = {
    id: 'int-1', type: 'juniper-mist', name: 'Saved',
    status: 'connected', connection: { region: 'global' },
    scope: { orgIds: ['o1'], siteIds: ['s1'], deviceIds: ['d1'] },
    taggingRules: [], scopeSummary: '1 org · 1 site', lastSyncedAt: '2026-06-24T00:00:00.000Z',
  }
  const draft = initDraft('juniper-mist', editing)
  expect(draft.scope).toEqual({ orgIds: ['o1'], siteIds: ['s1'], deviceIds: ['d1'] })
})
