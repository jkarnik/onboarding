export type IntegrationStatus = 'connected' | 'syncing' | 'error'

export interface TaggingRule {
  id: string
  pattern: string
}

export interface ScopeSelection {
  orgIds: string[]
  siteIds: string[]
  deviceIds: string[]
}

export interface Connection {
  region: string
  orgId?: string
  tokenLast4?: string
}

export interface Integration {
  id: string
  type: string
  name: string
  environmentTag?: string
  status: IntegrationStatus
  connection: Connection
  scope: ScopeSelection
  taggingRules: TaggingRule[]
  scopeSummary: string
  lastSyncedAt: string
}

export interface CatalogEntry {
  type: string
  name: string
  description: string
  available: boolean
}

export interface DeviceNode {
  id: string
  name: string
}

export interface SiteNode {
  id: string
  name: string
  devices: DeviceNode[]
}

export interface OrgNode {
  id: string
  name: string
  sites: SiteNode[]
}
