import type { OrgNode, ScopeSelection } from '../../types'
import { Checkbox } from '../../../../components/ui/Checkbox'
import { orgState, siteState } from '../../logic/scope'

interface Props {
  tree: OrgNode[]
  fullTree: OrgNode[]
  selection: ScopeSelection
  expandedOrgs: Set<string>
  expandedSites: Set<string>
  onToggleOrgExpand: (orgId: string) => void
  onToggleSiteExpand: (siteId: string) => void
  onToggleOrg: (orgId: string, checked: boolean) => void
  onToggleSite: (orgId: string, siteId: string, checked: boolean) => void
  onToggleDevice: (orgId: string, siteId: string, deviceId: string, checked: boolean) => void
}

function Chevron({ expanded, label, onClick }: { expanded: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={`${expanded ? 'Collapse' : 'Expand'} ${label}`}
      onClick={onClick}
      style={{
        background: 'none', border: 'none', color: 'var(--muted)',
        width: 18, padding: 0, marginRight: 2, lineHeight: 1,
      }}
    >
      {expanded ? '▾' : '▸'}
    </button>
  )
}

export function ScopeTree({
  tree, fullTree, selection, expandedOrgs, expandedSites,
  onToggleOrgExpand, onToggleSiteExpand, onToggleOrg, onToggleSite, onToggleDevice,
}: Props) {
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', maxHeight: 320, overflow: 'auto' }}>
      {tree.map((org) => {
        const os = orgState(fullTree, selection, org.id)
        const orgOpen = expandedOrgs.has(org.id)
        return (
          <div key={org.id} style={{ padding: 10, borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Chevron expanded={orgOpen} label={org.name} onClick={() => onToggleOrgExpand(org.id)} />
              <Checkbox checked={os.checked} indeterminate={os.indeterminate} label={org.name}
                onChange={(c) => onToggleOrg(org.id, c)} />
            </div>
            {orgOpen && (
              <div style={{ paddingLeft: 22, marginTop: 6 }}>
                {org.sites.map((site) => {
                  const ss = siteState(fullTree, selection, site.id)
                  const siteOpen = expandedSites.has(site.id)
                  const hasDevices = site.devices.length > 0
                  return (
                    <div key={site.id} style={{ marginBottom: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {hasDevices
                          ? <Chevron expanded={siteOpen} label={site.name} onClick={() => onToggleSiteExpand(site.id)} />
                          : <span style={{ display: 'inline-block', width: 18, marginRight: 2 }} />}
                        <Checkbox checked={ss.checked} indeterminate={ss.indeterminate} label={site.name}
                          onChange={(c) => onToggleSite(org.id, site.id, c)} />
                      </div>
                      {siteOpen && (
                        <div style={{ paddingLeft: 40 }}>
                          {site.devices.map((dev) => (
                            <div key={dev.id}>
                              <Checkbox checked={selection.deviceIds.includes(dev.id)} label={dev.name}
                                onChange={(c) => onToggleDevice(org.id, site.id, dev.id, c)} />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
