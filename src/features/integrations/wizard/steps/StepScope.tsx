import { useMemo, useState } from 'react'
import type { WizardDraft } from '../draft'
import { getAvailableTree } from '../../data/fixtures'
import { filterTree, toggleOrg, toggleSite, toggleDevice } from '../../logic/scope'
import { ScopeFilter } from './ScopeFilter'
import { ScopeTree } from './ScopeTree'

export function StepScope({ draft, setDraft }: { draft: WizardDraft; setDraft: React.Dispatch<React.SetStateAction<WizardDraft>> }) {
  const fullTree = useMemo(() => getAvailableTree(draft.type), [draft.type])
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState<'text' | 'regex'>('text')

  const { tree: shownTree, error } = filterTree(fullTree, query, mode)

  return (
    <div>
      <ScopeFilter query={query} mode={mode} onQuery={setQuery} onMode={setMode} error={error} />
      <ScopeTree
        tree={shownTree}
        fullTree={fullTree}
        selection={draft.scope}
        onToggleOrg={(orgId, c) => setDraft((d) => ({ ...d, scope: toggleOrg(fullTree, d.scope, orgId, c) }))}
        onToggleSite={(orgId, siteId, c) => setDraft((d) => ({ ...d, scope: toggleSite(fullTree, d.scope, orgId, siteId, c) }))}
        onToggleDevice={(orgId, siteId, deviceId, c) => setDraft((d) => ({ ...d, scope: toggleDevice(fullTree, d.scope, orgId, siteId, deviceId, c) }))}
      />
    </div>
  )
}
