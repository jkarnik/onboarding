import { expect, test } from 'vitest'
import { compileRegex, matchTagging } from './tagging'
import { getAvailableTree } from '../data/fixtures'
import { toggleOrg, emptySelection } from './scope'

const tree = getAvailableTree('juniper-mist')

test('compileRegex returns null on invalid pattern', () => {
  expect(compileRegex('(')).toBeNull()
  expect(compileRegex('sdwan_.*')).toBeInstanceOf(RegExp)
})

test('matchTagging matches selected sites and devices by name', () => {
  const sel = toggleOrg(tree, emptySelection(), 'o1', true) // selects o1 sites+devices
  const m = matchTagging({ id: 'r1', pattern: 'sdwan' }, sel, tree)
  expect(m.sites).toEqual(expect.arrayContaining(['sdwan_atlanta', 'sdwan_phoenix']))
  expect(m.devices).toEqual(expect.arrayContaining(['node0.sdwan-atlanta']))
})

test('matchTagging ignores unselected items', () => {
  const sel = emptySelection() // nothing selected
  expect(matchTagging({ id: 'r1', pattern: '.*' }, sel, tree)).toEqual({ sites: [], devices: [] })
})
