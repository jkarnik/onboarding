import type { Integration, ScopeSelection, TaggingRule } from '../types'
import { collectScope } from '../logic/scope'
import { getAvailableTree } from '../data/fixtures'

export interface WizardDraft {
  type: string
  connection: { token: string; region: string; tested: boolean }
  scope: ScopeSelection
  name: string
  taggingRules: TaggingRule[]
}

const DEFAULT_NAME: Record<string, string> = {
  'juniper-mist': 'Juniper Mist – Global',
  'cisco-meraki': 'Cisco Meraki',
  'palo-alto': 'Palo Alto',
}

export function initDraft(type: string, editing?: Integration): WizardDraft {
  if (editing) {
    return {
      type: editing.type,
      connection: { token: '', region: editing.connection.region, tested: true },
      scope: editing.scope,
      name: editing.name,
      taggingRules: editing.taggingRules,
    }
  }
  return {
    type,
    connection: { token: '', region: 'global', tested: false },
    // Everything is preselected by default; users narrow down from there.
    scope: collectScope(getAvailableTree(type)),
    name: DEFAULT_NAME[type] ?? '',
    taggingRules: [],
  }
}

export const STEP_KEYS = ['connect', 'scope', 'tagging', 'review'] as const
export type StepKey = typeof STEP_KEYS[number]

export function canAdvance(step: StepKey, draft: WizardDraft): boolean {
  switch (step) {
    case 'connect': return draft.connection.tested && draft.name.trim().length > 0
    case 'scope': return draft.scope.siteIds.length > 0 || draft.scope.deviceIds.length > 0
    case 'tagging': return true
    case 'review': return true
  }
}
