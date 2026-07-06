import type { OrgNode, ScopeSelection, TaggingRule } from '../types'

export function compileRegex(pattern: string): RegExp | null {
  try { return new RegExp(pattern, 'i') } catch { return null }
}

export function matchTagging(rule: TaggingRule, sel: ScopeSelection, tree: OrgNode[]): { sites: string[]; devices: string[] } {
  const re = compileRegex(rule.pattern)
  if (!re || !rule.pattern) return { sites: [], devices: [] }
  const sites: string[] = []
  const devices: string[] = []
  for (const org of tree) {
    for (const site of org.sites) {
      if (sel.siteIds.includes(site.id) && re.test(site.name)) sites.push(site.name)
      for (const dev of site.devices) {
        if (sel.deviceIds.includes(dev.id) && re.test(dev.name)) devices.push(dev.name)
      }
    }
  }
  return { sites, devices }
}
