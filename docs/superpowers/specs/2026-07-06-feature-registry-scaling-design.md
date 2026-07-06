# Feature Registry for Scaling Product Areas — Design

**Date:** 2026-07-06
**Status:** Approved (design)

## Problem

Adding a new product area today requires hand-editing two unrelated files:
`src/App.tsx` (routes) and `src/components/AppShell/Sidebar.tsx` (nav links).
There is no convention for where an area lives or how it registers itself, so
the app does not scale cleanly as product areas multiply. Areas vary in shape:
some are a single top-level page, others are a titled sidebar section with
several sub-pages.

## Goal

A new product area is added by (1) creating a feature folder that exports a
manifest and (2) adding one line to a central registry. `App.tsx` and
`Sidebar.tsx` become generic renderers that are never edited again. Ordering of
nav entries is explicit. The pattern supports both single-page areas and
section-with-sub-pages areas. Existing Dashboard and Integrations areas are
migrated onto the pattern as proof.

## Non-goals

- No auto-discovery magic (`import.meta.glob`) — registration stays explicit.
- No routing library change — still `react-router-dom` v6.
- No backend, auth, or data-layer changes.
- No visual/styling changes to the sidebar or pages.

## Architecture

Introduce a **feature manifest** contract and a **central registry** that
aggregates manifests. Two generic renderers consume the registry.

```
src/
  app/
    registry.ts            # imports every feature manifest, exports ordered list
    types.ts               # FeatureManifest, NavItem, RouteDef contracts
    AppRoutes.tsx          # renders <Routes> from registry (replaces App.tsx body)
    AppNav.tsx             # renders sidebar nav from registry (replaces Sidebar body)
  features/
    dashboard/
      dashboard.feature.tsx
      DashboardPage.tsx    # moved from src/pages/
    integrations/
      integrations.feature.tsx
      ... (existing files unchanged)
```

`App.tsx` renders `<AppShell><AppRoutes /></AppShell>`. `AppShell` renders
`<AppNav />` in place of the old hardcoded `Sidebar`.

## The manifest contract (`src/app/types.ts`)

```ts
import type { ReactNode } from 'react'

export type RouteDef = {
  path: string          // absolute, e.g. '/integrations'
  element: ReactNode
  index?: boolean       // optional: index route
}

// A single sidebar link.
export type NavLinkItem = {
  kind: 'link'
  to: string
  label: string
  end?: boolean         // exact-match highlight (react-router NavLink `end`)
}

// A titled group of links (a section like "Integrate").
export type NavSection = {
  kind: 'section'
  label: string
  links: Array<{ to: string; label: string; end?: boolean }>
}

export type NavItem = NavLinkItem | NavSection

export type FeatureManifest = {
  id: string            // stable unique key, e.g. 'integrations'
  order: number         // controls position among all features' nav + routes
  routes: RouteDef[]
  nav: NavItem[]        // 0..n nav contributions (a feature may add none)
}
```

Notes:
- A single-page area exports `nav: [{ kind: 'link', ... }]` with one route.
- A section area exports `nav: [{ kind: 'section', links: [...] }]` with one
  route per link.
- `order` is a plain number; the registry sorts by it, so nav order is explicit
  and independent of import order.

## The registry (`src/app/registry.ts`)

```ts
import type { FeatureManifest } from './types'
import { dashboardFeature } from '../features/dashboard/dashboard.feature'
import { integrationsFeature } from '../features/integrations/integrations.feature'

const features: FeatureManifest[] = [
  dashboardFeature,
  integrationsFeature,
]

// Sorted once, exported for both renderers.
export const registeredFeatures = [...features].sort((a, b) => a.order - b.order)
export const allRoutes = registeredFeatures.flatMap((f) => f.routes)
export const allNav = registeredFeatures.flatMap((f) => f.nav)
```

Adding a new area = add its import + one array entry here.

## Renderers

**`AppRoutes.tsx`** maps `allRoutes` to `<Route>` elements:

```tsx
import { Routes, Route } from 'react-router-dom'
import { allRoutes } from './registry'

export function AppRoutes() {
  return (
    <Routes>
      {allRoutes.map((r) => (
        <Route key={r.path} path={r.path} element={r.element} index={r.index} />
      ))}
    </Routes>
  )
}
```

**`AppNav.tsx`** maps `allNav`, preserving the existing sidebar visuals
(the `linkStyle` and `SectionLabel` currently in `Sidebar.tsx` move here
unchanged). A `link` item renders one `NavLink`; a `section` item renders a
`SectionLabel` followed by its links. The `<nav>` wrapper styling is preserved.

## Data flow

1. `main.tsx` → `<BrowserRouter><App /></BrowserRouter>` (unchanged).
2. `App.tsx` → `<AppShell><AppRoutes /></AppShell>`.
3. `AppShell` → renders `<AppNav />` + `<main>`.
4. `AppRoutes` and `AppNav` both read the sorted `registry.ts` exports.
5. Each feature owns its pages and its manifest; nothing outside the feature
   folder knows about its internals.

## Migration of existing areas

- **Dashboard:** move `src/pages/DashboardPage.tsx` →
  `src/features/dashboard/DashboardPage.tsx`; create
  `dashboard.feature.tsx` (`order: 0`, route `/`, nav section "Network" with
  links Summary + Juniper Mist matching current sidebar). Delete empty
  `src/pages/`.
- **Integrations:** create `integrations.feature.tsx` (`order: 20`, route
  `/integrations`, nav section "Integrate" with links Configure + Integrations).
  The existing `/configure` placeholder route moves into this manifest too.
  `IntegrationsPage.tsx` and all sub-files are untouched.
- The current hardcoded sidebar order (Network section, then Integrate section)
  is reproduced exactly via `order` values.

## Error handling & edge cases

- **Duplicate route paths:** `registry.ts` runs a dev-only assertion that
  throws if two routes share a `path`, surfacing conflicts immediately.
- **No catch-all today:** current app has no 404 route; behavior is preserved
  (unmatched paths render nothing). Out of scope to add one.
- **Empty nav:** a feature may register routes with `nav: []` (e.g. a
  detail-only route); renderers handle empty arrays.

## Testing

- `AppNav.test.tsx`: renders within a router, asserts the section labels and
  links from the registry appear in order (replaces `Sidebar.test.tsx`).
- `AppRoutes.test.tsx`: renders at `/integrations` and asserts the Integrations
  page mounts; renders at `/` and asserts Dashboard mounts.
- `registry.test.ts`: asserts `order` sorting is applied and the
  duplicate-path assertion throws on a seeded duplicate.
- Existing `App.test.tsx` updated to match the new composition; all existing
  feature tests remain green (feature internals unchanged).
- Verification: `npm run build` (tsc + vite) and `npm test` both pass.

## How to add a new area (documented outcome)

1. Create `src/features/<area>/` with page component(s).
2. Add `<area>.feature.tsx` exporting a `FeatureManifest`.
3. Add its import + array entry to `src/app/registry.ts`.
4. Pick an `order` value to place it in the sidebar.

No edits to `App.tsx`, `AppShell`, `AppRoutes`, or `AppNav` are ever needed.
