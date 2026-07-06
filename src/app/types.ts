import type { ReactNode } from 'react'

export type RouteDef = {
  path: string
  element: ReactNode
  index?: boolean
}

export type NavLinkItem = {
  kind: 'link'
  to: string
  label: string
  end?: boolean
}

export type NavSection = {
  kind: 'section'
  label: string
  links: Array<{ to: string; label: string; end?: boolean }>
}

export type NavItem = NavLinkItem | NavSection

export type FeatureManifest = {
  id: string
  order: number
  routes: RouteDef[]
  nav: NavItem[]
}
