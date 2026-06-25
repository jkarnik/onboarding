import { expect, test } from 'vitest'
import { emptySelection, toggleOrg, toggleSite, orgState, siteState, filterTree, selectAll, deselectAll, collectScope } from './scope'
import { getAvailableTree } from '../data/fixtures'

const tree = getAvailableTree('juniper-mist')

test('toggleOrg selects org, all its sites and devices', () => {
  const sel = toggleOrg(tree, emptySelection(), 'o1', true)
  expect(sel.orgIds).toContain('o1')
  expect(sel.siteIds).toEqual(expect.arrayContaining(['s1', 's2']))
  expect(sel.deviceIds).toEqual(expect.arrayContaining(['d1', 'd2', 'd3']))
  expect(orgState(tree, sel, 'o1')).toEqual({ checked: true, indeterminate: false })
})

test('toggling one site of an org makes the org indeterminate', () => {
  const sel = toggleSite(tree, emptySelection(), 'o1', 's1', true)
  expect(orgState(tree, sel, 'o1').indeterminate).toBe(true)
  expect(siteState(tree, sel, 's1').checked).toBe(true)
})

test('filterTree text mode keeps only matching sites/devices, selection untouched', () => {
  const { tree: filtered } = filterTree(tree, 'phoenix', 'text')
  const siteNames = filtered.flatMap((o) => o.sites.map((s) => s.name))
  expect(siteNames).toContain('sdwan_phoenix')
  expect(siteNames).not.toContain('sdwan_atlanta')
})

test('filterTree regex invalid returns error and full tree', () => {
  const res = filterTree(tree, '(', 'regex')
  expect(res.error).toBeTruthy()
  expect(res.tree).toHaveLength(tree.length)
})

test('selectAll on the full tree selects every org, site and device', () => {
  const sel = selectAll(emptySelection(), tree)
  const all = collectScope(tree)
  expect(sel.orgIds.sort()).toEqual(all.orgIds.sort())
  expect(sel.siteIds.sort()).toEqual(all.siteIds.sort())
  expect(sel.deviceIds.sort()).toEqual(all.deviceIds.sort())
})

test('selectAll on a filtered subtree leaves out-of-scope items untouched', () => {
  const { tree: phoenixOnly } = filterTree(tree, 'phoenix', 'text')
  const sel = selectAll(emptySelection(), phoenixOnly)
  // sdwan_phoenix (s2) selected, sdwan_atlanta (s1) not affected
  expect(sel.siteIds).toContain('s2')
  expect(sel.siteIds).not.toContain('s1')
  expect(sel.deviceIds).not.toContain('d1') // atlanta device untouched
})

test('deselectAll removes only the given tree ids', () => {
  const full = selectAll(emptySelection(), tree)
  const { tree: phoenixOnly } = filterTree(tree, 'phoenix', 'text')
  const sel = deselectAll(full, phoenixOnly)
  expect(sel.siteIds).not.toContain('s2') // phoenix removed
  expect(sel.siteIds).toContain('s1') // atlanta kept
})
