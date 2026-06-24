import type { OrgNode, ScopeSelection, TaggingRule } from '../../types'
import { matchTagging } from '../../logic/tagging'

export function RulePreview({ rule, selection, tree }: { rule: TaggingRule; selection: ScopeSelection; tree: OrgNode[] }) {
  const { sites, devices } = matchTagging(rule, selection, tree)
  const names = [...sites, ...devices]
  return (
    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
      {rule.pattern
        ? names.length
          ? <>Matches {names.length} selected item(s): {names.join(', ')}</>
          : <>No selected sites/devices match.</>
        : <>Enter a pattern to preview matches.</>}
    </div>
  )
}
