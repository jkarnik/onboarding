import type { Integration, OrgNode, ScopeSelection } from '../types'

const KEY = 'onboarding.integrations.v1'
const SEQ_KEY = 'onboarding.integrations.seq.v1'
const FIXED_SYNC = '2026-06-24T00:00:00.000Z'

function nextSeq(): number {
  const current = Number(localStorage.getItem(SEQ_KEY) ?? '0')
  const next = current + 1
  localStorage.setItem(SEQ_KEY, String(next))
  return next
}

function read(): Integration[] {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') } catch { return [] }
}
function write(items: Integration[]) { localStorage.setItem(KEY, JSON.stringify(items)) }

export function deriveScopeSummary(scope: ScopeSelection, _tree: OrgNode[]): string {
  const orgs = scope.orgIds.length
  const sites = scope.siteIds.length
  const parts = [`${orgs} org${orgs === 1 ? '' : 's'}`, `${sites} site${sites === 1 ? '' : 's'}`]
  return parts.join(' · ')
}

export function listIntegrations(): Integration[] { return read() }
export function getIntegration(id: string): Integration | undefined { return read().find((i) => i.id === id) }

export function createIntegration(
  draft: Omit<Integration, 'id' | 'lastSyncedAt' | 'scopeSummary' | 'status'>,
): Integration {
  const items = read()
  const tree: OrgNode[] = []
  const created: Integration = {
    ...draft,
    id: `int-${nextSeq()}`,
    status: 'connected',
    lastSyncedAt: FIXED_SYNC,
    scopeSummary: deriveScopeSummary(draft.scope, tree),
  }
  write([created, ...items])
  return created
}

export function updateIntegration(id: string, patch: Partial<Integration>): Integration {
  const items = read()
  const idx = items.findIndex((i) => i.id === id)
  if (idx === -1) throw new Error(`integration ${id} not found`)
  const next: Integration = { ...items[idx], ...patch }
  if (patch.scope) next.scopeSummary = deriveScopeSummary(next.scope, [])
  items[idx] = next
  write(items)
  return next
}

export function removeIntegration(id: string): void {
  write(read().filter((i) => i.id !== id))
}
