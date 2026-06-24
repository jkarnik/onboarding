import { useMemo, useState } from 'react'
import type { WizardDraft } from '../draft'
import { getAvailableTree } from '../../data/fixtures'
import { filterTree, toggleOrg, toggleSite, toggleDevice, selectAll, deselectAll } from '../../logic/scope'
import { Button } from '../../../../components/ui/Button'
import { ScopeFilter } from './ScopeFilter'
import { ScopeTree } from './ScopeTree'

export function StepScope({ draft, setDraft }: { draft: WizardDraft; setDraft: React.Dispatch<React.SetStateAction<WizardDraft>> }) {
  const fullTree = useMemo(() => getAvailableTree(draft.type), [draft.type])
  const allSiteIds = useMemo(() => fullTree.flatMap((o) => o.sites.map((s) => s.id)), [fullTree])
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState<'text' | 'regex'>('text')

  // Default: orgs expanded, sites collapsed (devices hidden).
  const [expandedOrgs, setExpandedOrgs] = useState<Set<string>>(() => new Set(fullTree.map((o) => o.id)))
  const [expandedSites, setExpandedSites] = useState<Set<string>>(() => new Set())

  const { tree: shownTree, error } = filterTree(fullTree, query, mode)

  const allExpanded = allSiteIds.length > 0 && allSiteIds.every((id) => expandedSites.has(id))

  const toggleExpandAll = () => {
    setExpandedOrgs(new Set(fullTree.map((o) => o.id)))
    setExpandedSites(allExpanded ? new Set() : new Set(allSiteIds))
  }

  const toggleSetMember = (setter: React.Dispatch<React.SetStateAction<Set<string>>>, id: string) =>
    setter((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  return (
    <div>
      <ScopeFilter query={query} mode={mode} onQuery={setQuery} onMode={setMode} error={error} />
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <Button variant="ghost" onClick={toggleExpandAll}>{allExpanded ? 'Collapse to sites' : 'Expand all'}</Button>
        <Button variant="ghost" onClick={() => setDraft((d) => ({ ...d, scope: selectAll(d.scope, shownTree) }))}>Select all</Button>
        <Button variant="ghost" onClick={() => setDraft((d) => ({ ...d, scope: deselectAll(d.scope, shownTree) }))}>Deselect all</Button>
      </div>
      <ScopeTree
        tree={shownTree}
        fullTree={fullTree}
        selection={draft.scope}
        expandedOrgs={expandedOrgs}
        expandedSites={expandedSites}
        onToggleOrgExpand={(orgId) => toggleSetMember(setExpandedOrgs, orgId)}
        onToggleSiteExpand={(siteId) => toggleSetMember(setExpandedSites, siteId)}
        onToggleOrg={(orgId, c) => setDraft((d) => ({ ...d, scope: toggleOrg(fullTree, d.scope, orgId, c) }))}
        onToggleSite={(orgId, siteId, c) => setDraft((d) => ({ ...d, scope: toggleSite(fullTree, d.scope, orgId, siteId, c) }))}
        onToggleDevice={(orgId, siteId, deviceId, c) => setDraft((d) => ({ ...d, scope: toggleDevice(fullTree, d.scope, orgId, siteId, deviceId, c) }))}
      />
    </div>
  )
}
