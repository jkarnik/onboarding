import type { OrgNode, ScopeSelection } from '../types'

export function emptySelection(): ScopeSelection {
  return { orgIds: [], siteIds: [], deviceIds: [] }
}

const add = (arr: string[], ids: string[]) => Array.from(new Set([...arr, ...ids]))
const remove = (arr: string[], ids: string[]) => arr.filter((x) => !ids.includes(x))

function findOrg(tree: OrgNode[], orgId: string) { return tree.find((o) => o.id === orgId) }
function findSite(tree: OrgNode[], siteId: string) {
  for (const o of tree) { const s = o.sites.find((x) => x.id === siteId); if (s) return { org: o, site: s } }
  return undefined
}

export function toggleDevice(tree: OrgNode[], sel: ScopeSelection, _orgId: string, siteId: string, deviceId: string, checked: boolean): ScopeSelection {
  const found = findSite(tree, siteId)
  const deviceIds = checked ? add(sel.deviceIds, [deviceId]) : remove(sel.deviceIds, [deviceId])
  let siteIds = sel.siteIds
  if (found && checked) siteIds = add(siteIds, [siteId])
  return { ...sel, deviceIds, siteIds }
}

export function toggleSite(tree: OrgNode[], sel: ScopeSelection, _orgId: string, siteId: string, checked: boolean): ScopeSelection {
  const found = findSite(tree, siteId)
  const devIds = found ? found.site.devices.map((d) => d.id) : []
  return {
    ...sel,
    siteIds: checked ? add(sel.siteIds, [siteId]) : remove(sel.siteIds, [siteId]),
    deviceIds: checked ? add(sel.deviceIds, devIds) : remove(sel.deviceIds, devIds),
  }
}

export function toggleOrg(tree: OrgNode[], sel: ScopeSelection, orgId: string, checked: boolean): ScopeSelection {
  const org = findOrg(tree, orgId)
  if (!org) return sel
  const siteIds = org.sites.map((s) => s.id)
  const devIds = org.sites.flatMap((s) => s.devices.map((d) => d.id))
  return {
    orgIds: checked ? add(sel.orgIds, [orgId]) : remove(sel.orgIds, [orgId]),
    siteIds: checked ? add(sel.siteIds, siteIds) : remove(sel.siteIds, siteIds),
    deviceIds: checked ? add(sel.deviceIds, devIds) : remove(sel.deviceIds, devIds),
  }
}

export function siteState(tree: OrgNode[], sel: ScopeSelection, siteId: string) {
  const found = findSite(tree, siteId)
  if (!found) return { checked: false, indeterminate: false }
  const devIds = found.site.devices.map((d) => d.id)
  const selected = devIds.filter((d) => sel.deviceIds.includes(d))
  const checked = sel.siteIds.includes(siteId) && (devIds.length === 0 || selected.length === devIds.length)
  const indeterminate = selected.length > 0 && selected.length < devIds.length
  return { checked, indeterminate }
}

export function orgState(tree: OrgNode[], sel: ScopeSelection, orgId: string) {
  const org = findOrg(tree, orgId)
  if (!org) return { checked: false, indeterminate: false }
  const states = org.sites.map((s) => siteState(tree, sel, s.id))
  const all = states.every((s) => s.checked)
  const some = states.some((s) => s.checked || s.indeterminate)
  return { checked: all && org.sites.length > 0, indeterminate: some && !all }
}

export function filterTree(tree: OrgNode[], query: string, mode: 'text' | 'regex'): { tree: OrgNode[]; error?: string } {
  if (!query.trim()) return { tree }
  let test: (name: string) => boolean
  if (mode === 'regex') {
    try { const re = new RegExp(query, 'i'); test = (n) => re.test(n) }
    catch { return { tree, error: 'Invalid regex' } }
  } else {
    const q = query.toLowerCase(); test = (n) => n.toLowerCase().includes(q)
  }
  const filtered = tree
    .map((o) => {
      const sites = o.sites
        .map((s) => ({ ...s, devices: s.devices.filter((d) => test(d.name) || test(s.name)) }))
        .filter((s) => test(s.name) || s.devices.length > 0)
      return { ...o, sites }
    })
    .filter((o) => test(o.name) || o.sites.length > 0)
  return { tree: filtered }
}
