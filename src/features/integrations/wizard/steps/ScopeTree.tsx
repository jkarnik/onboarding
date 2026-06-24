import type { OrgNode, ScopeSelection } from '../../types'
import { Checkbox } from '../../../../components/ui/Checkbox'
import { orgState, siteState } from '../../logic/scope'

interface Props {
  tree: OrgNode[]
  fullTree: OrgNode[]
  selection: ScopeSelection
  onToggleOrg: (orgId: string, checked: boolean) => void
  onToggleSite: (orgId: string, siteId: string, checked: boolean) => void
  onToggleDevice: (orgId: string, siteId: string, deviceId: string, checked: boolean) => void
}

export function ScopeTree({ tree, fullTree, selection, onToggleOrg, onToggleSite, onToggleDevice }: Props) {
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', maxHeight: 320, overflow: 'auto' }}>
      {tree.map((org) => {
        const os = orgState(fullTree, selection, org.id)
        return (
          <div key={org.id} style={{ padding: 10, borderBottom: '1px solid var(--border)' }}>
            <Checkbox checked={os.checked} indeterminate={os.indeterminate} label={org.name}
              onChange={(c) => onToggleOrg(org.id, c)} />
            <div style={{ paddingLeft: 22, marginTop: 6 }}>
              {org.sites.map((site) => {
                const ss = siteState(fullTree, selection, site.id)
                return (
                  <div key={site.id} style={{ marginBottom: 4 }}>
                    <Checkbox checked={ss.checked} indeterminate={ss.indeterminate} label={site.name}
                      onChange={(c) => onToggleSite(org.id, site.id, c)} />
                    <div style={{ paddingLeft: 22 }}>
                      {site.devices.map((dev) => (
                        <div key={dev.id}>
                          <Checkbox checked={selection.deviceIds.includes(dev.id)} label={dev.name}
                            onChange={(c) => onToggleDevice(org.id, site.id, dev.id, c)} />
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
