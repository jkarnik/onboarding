import type { CatalogEntry, OrgNode } from '../types'

export const CATALOG: CatalogEntry[] = [
  { type: 'juniper-mist', name: 'Juniper Mist', description: 'Wireless, wired, and WAN assurance.', available: true },
  { type: 'cisco-meraki', name: 'Cisco Meraki', description: 'Cloud-managed networking.', available: true },
  { type: 'palo-alto', name: 'Palo Alto', description: 'Next-gen firewall telemetry.', available: true },
  { type: 'aws-cloudwatch', name: 'AWS CloudWatch', description: 'Cloud metrics and logs.', available: false },
  { type: 'datadog', name: 'Datadog', description: 'Observability platform.', available: false },
  { type: 'fortinet', name: 'Fortinet', description: 'FortiGate security fabric.', available: false },
]

const TREES: Record<string, OrgNode[]> = {
  'juniper-mist': [
    { id: 'o1', name: 'Live Demo Org', sites: [
      { id: 's1', name: 'sdwan_atlanta', devices: [
        { id: 'd1', name: 'node0.sdwan-atlanta' },
        { id: 'd2', name: 'LD_CUP_SRX_11' },
      ] },
      { id: 's2', name: 'sdwan_phoenix', devices: [
        { id: 'd3', name: 'Wan-Edge-Rogue-DHCP-server' },
      ] },
    ] },
    { id: 'o2', name: 'Findlay ATP Demo', sites: [
      { id: 's3', name: 'findlay-atp-demo', devices: [
        { id: 'd4', name: 'atp-demo-gw' },
        { id: 'd5', name: 'atp-demo-sw' },
      ] },
    ] },
  ],
  'cisco-meraki': [
    { id: 'o1', name: 'Meraki Org', sites: [
      { id: 's1', name: 'hq-network', devices: [{ id: 'd1', name: 'MX68-hq' }] },
    ] },
  ],
  'palo-alto': [
    { id: 'o1', name: 'Panorama', sites: [
      { id: 's1', name: 'dc-east', devices: [{ id: 'd1', name: 'PA-3220' }] },
    ] },
  ],
}

export function getAvailableTree(type: string): OrgNode[] {
  return TREES[type] ?? []
}
