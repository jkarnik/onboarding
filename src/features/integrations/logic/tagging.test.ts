import { expect, test } from 'vitest'
import { compileRegex, matchTagging } from './tagging'
import { getAvailableTree } from '../data/fixtures'
import { toggleOrg, emptySelection } from './scope'

const tree = getAvailableTree('juniper-mist')

test('compileRegex returns null on invalid pattern', () => {
  expect(compileRegex('(')).toBeNull()
  expect(compileRegex('sdwan_.*')).toBeInstanceOf(RegExp)
})

test('matchTagging only considers selected items and respects target', () => {
  const sel = toggleOrg(tree, emptySelection(), 'o1', true) // selects o1 sites+devices
  const rule = { id: 'r1', pattern: 'sdwan', target: 'sites' as const, tag: 'wan' }
  const m = matchTagging(rule, sel, tree)
  expect(m.sites).toEqual(expect.arrayContaining(['sdwan_atlanta', 'sdwan_phoenix']))
  expect(m.devices).toHaveLength(0)
})

test('matchTagging ignores unselected items', () => {
  const sel = emptySelection() // nothing selected
  const rule = { id: 'r1', pattern: '.*', target: 'both' as const, tag: 'all' }
  expect(matchTagging(rule, sel, tree)).toEqual({ sites: [], devices: [] })
})
