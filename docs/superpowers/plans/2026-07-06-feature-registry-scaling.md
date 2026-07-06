# Feature Registry Scaling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace hardcoded routes/nav with a feature-manifest registry so new product areas are added by creating a folder + one registry line.

**Architecture:** Each feature exports a `FeatureManifest` (`{ id, order, routes, nav }`). A central `src/app/registry.ts` aggregates and sorts them. Generic `AppRoutes` and `AppNav` renderers consume the registry. Dashboard and Integrations are migrated onto the pattern.

**Tech Stack:** React 18, TypeScript 5 (strict), react-router-dom v6, Vitest + Testing Library, Vite.

## Global Constraints

- TypeScript `strict` + `noUnusedLocals` + `noUnusedParameters` are on — no unused locals/params.
- Router is react-router-dom v6; do not add routing libraries.
- No visual/styling changes — preserve existing sidebar look and order exactly.
- Tests use Vitest globals (`test`/`expect`/`beforeEach`) + Testing Library; wrap router-dependent components in `MemoryRouter`.
- Verification for the whole plan: `npm run build` and `npm test` both pass.
- Commit after each task.

---

## File Structure

- Create: `src/app/types.ts` — manifest contract (types only)
- Create: `src/app/registry.ts` — aggregates + sorts manifests, duplicate-path assertion
- Create: `src/app/AppRoutes.tsx` — renders `<Routes>` from registry
- Create: `src/app/AppNav.tsx` — renders sidebar nav from registry (owns link styling)
- Create: `src/features/dashboard/DashboardPage.tsx` — moved from `src/pages/`
- Create: `src/features/dashboard/dashboard.feature.tsx` — dashboard manifest
- Create: `src/features/integrations/integrations.feature.tsx` — integrations manifest
- Modify: `src/App.tsx` — render `<AppShell><AppRoutes /></AppShell>`
- Modify: `src/components/AppShell/AppShell.tsx` — render `<AppNav />` instead of `<Sidebar />`
- Modify: `src/App.test.tsx` — match new composition
- Delete: `src/pages/DashboardPage.tsx`, `src/components/AppShell/Sidebar.tsx`, `src/components/AppShell/Sidebar.test.tsx`

---

### Task 1: Manifest contract types

**Files:**
- Create: `src/app/types.ts`

**Interfaces:**
- Produces: `RouteDef`, `NavLinkItem`, `NavSection`, `NavItem`, `FeatureManifest` (all exported types).

- [ ] **Step 1: Write the type contract**

```ts
// src/app/types.ts
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
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc -b`
Expected: no errors (types-only file, no consumers yet).

- [ ] **Step 3: Commit**

```bash
git add src/app/types.ts
git commit -m "feat: add feature manifest type contract"
```

---

### Task 2: Dashboard feature module

**Files:**
- Create: `src/features/dashboard/DashboardPage.tsx` (content moved verbatim from `src/pages/DashboardPage.tsx`)
- Create: `src/features/dashboard/dashboard.feature.tsx`
- Create: `src/features/dashboard/dashboard.feature.test.tsx`
- Modify: `src/App.tsx` (update DashboardPage import path)
- Delete: `src/pages/DashboardPage.tsx`

**Interfaces:**
- Consumes: `FeatureManifest` from `src/app/types.ts`.
- Produces: `dashboardFeature: FeatureManifest` (`id: 'dashboard'`, `order: 0`, route `{ path: '/', element: <DashboardPage /> }`, nav one "Network" section with links Summary (`to: '/'`, `end: true`) and Juniper Mist (`to: '/'`)).

- [ ] **Step 1: Move the page component**

Move the file `src/pages/DashboardPage.tsx` to `src/features/dashboard/DashboardPage.tsx` with identical contents (exports `DashboardPage`). Then delete `src/pages/DashboardPage.tsx` and the now-empty `src/pages/` directory.

- [ ] **Step 2: Update the stale import in App.tsx**

In `src/App.tsx` change:
```tsx
import { DashboardPage } from './pages/DashboardPage'
```
to:
```tsx
import { DashboardPage } from './features/dashboard/DashboardPage'
```

- [ ] **Step 3: Write the failing manifest test**

```tsx
// src/features/dashboard/dashboard.feature.test.tsx
import { dashboardFeature } from './dashboard.feature'

test('dashboard manifest exposes the root route and Network nav section', () => {
  expect(dashboardFeature.id).toBe('dashboard')
  expect(dashboardFeature.routes.map((r) => r.path)).toEqual(['/'])
  const section = dashboardFeature.nav[0]
  expect(section.kind).toBe('section')
  if (section.kind === 'section') {
    expect(section.label).toBe('Network')
    expect(section.links.map((l) => l.label)).toEqual(['Summary', 'Juniper Mist'])
  }
})
```

- [ ] **Step 4: Run test to verify it fails**

Run: `npm test -- dashboard.feature`
Expected: FAIL — cannot find module `./dashboard.feature`.

- [ ] **Step 5: Write the manifest**

```tsx
// src/features/dashboard/dashboard.feature.tsx
import type { FeatureManifest } from '../../app/types'
import { DashboardPage } from './DashboardPage'

export const dashboardFeature: FeatureManifest = {
  id: 'dashboard',
  order: 0,
  routes: [{ path: '/', element: <DashboardPage /> }],
  nav: [
    {
      kind: 'section',
      label: 'Network',
      links: [
        { to: '/', label: 'Summary', end: true },
        { to: '/', label: 'Juniper Mist' },
      ],
    },
  ],
}
```

- [ ] **Step 6: Run test + build to verify green**

Run: `npm test -- dashboard.feature && npx tsc -b`
Expected: test PASS; tsc no errors.

- [ ] **Step 7: Commit**

```bash
git add src/features/dashboard src/App.tsx
git commit -m "feat: add dashboard feature module and manifest"
```

---

### Task 3: Integrations feature manifest

**Files:**
- Create: `src/features/integrations/integrations.feature.tsx`
- Create: `src/features/integrations/integrations.feature.test.tsx`

**Interfaces:**
- Consumes: `FeatureManifest` from `src/app/types.ts`; `IntegrationsPage` from `./IntegrationsPage`.
- Produces: `integrationsFeature: FeatureManifest` (`id: 'integrations'`, `order: 20`, routes `/configure` (placeholder element) and `/integrations` (`<IntegrationsPage />`), nav one "Integrate" section with links Configure (`to: '/configure'`) and Integrations (`to: '/integrations'`)).

- [ ] **Step 1: Write the failing manifest test**

```tsx
// src/features/integrations/integrations.feature.test.tsx
import { integrationsFeature } from './integrations.feature'

test('integrations manifest exposes configure + integrations routes and nav', () => {
  expect(integrationsFeature.id).toBe('integrations')
  expect(integrationsFeature.routes.map((r) => r.path)).toEqual(['/configure', '/integrations'])
  const section = integrationsFeature.nav[0]
  expect(section.kind).toBe('section')
  if (section.kind === 'section') {
    expect(section.label).toBe('Integrate')
    expect(section.links.map((l) => l.label)).toEqual(['Configure', 'Integrations'])
  }
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- integrations.feature`
Expected: FAIL — cannot find module `./integrations.feature`.

- [ ] **Step 3: Write the manifest**

```tsx
// src/features/integrations/integrations.feature.tsx
import type { FeatureManifest } from '../../app/types'
import { IntegrationsPage } from './IntegrationsPage'

export const integrationsFeature: FeatureManifest = {
  id: 'integrations',
  order: 20,
  routes: [
    { path: '/configure', element: <div>Configure</div> },
    { path: '/integrations', element: <IntegrationsPage /> },
  ],
  nav: [
    {
      kind: 'section',
      label: 'Integrate',
      links: [
        { to: '/configure', label: 'Configure' },
        { to: '/integrations', label: 'Integrations' },
      ],
    },
  ],
}
```

- [ ] **Step 4: Run test + build to verify green**

Run: `npm test -- integrations.feature && npx tsc -b`
Expected: test PASS; tsc no errors.

- [ ] **Step 5: Commit**

```bash
git add src/features/integrations/integrations.feature.tsx src/features/integrations/integrations.feature.test.tsx
git commit -m "feat: add integrations feature manifest"
```

---

### Task 4: Central registry

**Files:**
- Create: `src/app/registry.ts`
- Create: `src/app/registry.test.ts`

**Interfaces:**
- Consumes: `dashboardFeature`, `integrationsFeature`, `FeatureManifest`.
- Produces: `registeredFeatures: FeatureManifest[]` (sorted by `order`), `allRoutes: RouteDef[]`, `allNav: NavItem[]`, and `assertNoDuplicateRoutes(features): void` (throws on duplicate `path`).

- [ ] **Step 1: Write the failing registry test**

```ts
// src/app/registry.test.ts
import { registeredFeatures, allRoutes, assertNoDuplicateRoutes } from './registry'
import type { FeatureManifest } from './types'

test('features are sorted by order', () => {
  const orders = registeredFeatures.map((f) => f.order)
  expect(orders).toEqual([...orders].sort((a, b) => a - b))
})

test('allRoutes includes root and integrations paths', () => {
  const paths = allRoutes.map((r) => r.path)
  expect(paths).toContain('/')
  expect(paths).toContain('/integrations')
})

test('assertNoDuplicateRoutes throws on duplicate path', () => {
  const dup: FeatureManifest[] = [
    { id: 'a', order: 0, routes: [{ path: '/x', element: null }], nav: [] },
    { id: 'b', order: 1, routes: [{ path: '/x', element: null }], nav: [] },
  ]
  expect(() => assertNoDuplicateRoutes(dup)).toThrow(/duplicate route/i)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/app/registry`
Expected: FAIL — cannot find module `./registry`.

- [ ] **Step 3: Write the registry**

```ts
// src/app/registry.ts
import type { FeatureManifest, RouteDef, NavItem } from './types'
import { dashboardFeature } from '../features/dashboard/dashboard.feature'
import { integrationsFeature } from '../features/integrations/integrations.feature'

const features: FeatureManifest[] = [dashboardFeature, integrationsFeature]

export function assertNoDuplicateRoutes(list: FeatureManifest[]): void {
  const seen = new Set<string>()
  for (const f of list) {
    for (const r of f.routes) {
      if (seen.has(r.path)) throw new Error(`Duplicate route path: ${r.path}`)
      seen.add(r.path)
    }
  }
}

assertNoDuplicateRoutes(features)

export const registeredFeatures: FeatureManifest[] = [...features].sort((a, b) => a.order - b.order)
export const allRoutes: RouteDef[] = registeredFeatures.flatMap((f) => f.routes)
export const allNav: NavItem[] = registeredFeatures.flatMap((f) => f.nav)
```

- [ ] **Step 4: Run test + build to verify green**

Run: `npm test -- src/app/registry && npx tsc -b`
Expected: tests PASS; tsc no errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/registry.ts src/app/registry.test.ts
git commit -m "feat: add feature registry with duplicate-route guard"
```

---

### Task 5: AppRoutes renderer

**Files:**
- Create: `src/app/AppRoutes.tsx`
- Create: `src/app/AppRoutes.test.tsx`

**Interfaces:**
- Consumes: `allRoutes` from `./registry`.
- Produces: `AppRoutes` component (renders `<Routes>` from `allRoutes`).

- [ ] **Step 1: Write the failing test**

```tsx
// src/app/AppRoutes.test.tsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppRoutes } from './AppRoutes'

beforeEach(() => localStorage.clear())

test('renders the dashboard at /', () => {
  render(<MemoryRouter initialEntries={['/']}><AppRoutes /></MemoryRouter>)
  expect(screen.getByRole('heading', { name: 'Juniper Mist' })).toBeInTheDocument()
})

test('renders the integrations page at /integrations', () => {
  render(<MemoryRouter initialEntries={['/integrations']}><AppRoutes /></MemoryRouter>)
  expect(screen.getByText(/connect your first integration/i)).toBeInTheDocument()
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/app/AppRoutes`
Expected: FAIL — cannot find module `./AppRoutes`.

- [ ] **Step 3: Write the renderer**

```tsx
// src/app/AppRoutes.tsx
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

- [ ] **Step 4: Run test + build to verify green**

Run: `npm test -- src/app/AppRoutes && npx tsc -b`
Expected: tests PASS; tsc no errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/AppRoutes.tsx src/app/AppRoutes.test.tsx
git commit -m "feat: add registry-driven AppRoutes renderer"
```

---

### Task 6: AppNav renderer

**Files:**
- Create: `src/app/AppNav.tsx`
- Create: `src/app/AppNav.test.tsx`

**Interfaces:**
- Consumes: `allNav` from `./registry`; `NavLink` from react-router-dom.
- Produces: `AppNav` component. Renders a `<nav>` wrapper; for each `NavItem`: a `link` renders one `NavLink`; a `section` renders a section label followed by its `NavLink`s. Styling (`linkStyle`, section label) moved verbatim from the old `Sidebar.tsx`.

- [ ] **Step 1: Write the failing test**

```tsx
// src/app/AppNav.test.tsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppNav } from './AppNav'

test('renders section labels and links from the registry', () => {
  render(<MemoryRouter><AppNav /></MemoryRouter>)
  expect(screen.getByText('Network')).toBeInTheDocument()
  expect(screen.getByText('Integrate')).toBeInTheDocument()
  expect(screen.getByText('Juniper Mist')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Integrations' })).toBeInTheDocument()
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/app/AppNav`
Expected: FAIL — cannot find module `./AppNav`.

- [ ] **Step 3: Write the renderer**

```tsx
// src/app/AppNav.tsx
import { NavLink } from 'react-router-dom'
import { allNav } from './registry'

const linkStyle = ({ isActive }: { isActive: boolean }) => ({
  display: 'block', padding: '8px 12px', borderRadius: 6,
  color: isActive ? 'var(--text)' : 'var(--muted)',
  background: isActive ? 'var(--panel-2)' : 'transparent',
  textDecoration: 'none', fontSize: 14,
})

function SectionLabel({ children }: { children: string }) {
  return <div style={{ fontSize: 11, letterSpacing: 1, color: 'var(--muted)', textTransform: 'uppercase', margin: '16px 0 6px' }}>{children}</div>
}

export function AppNav() {
  return (
    <nav style={{ width: 240, padding: 16, borderRight: '1px solid var(--border)', height: '100%' }}>
      {allNav.map((item, i) => {
        if (item.kind === 'link') {
          return <NavLink key={i} to={item.to} style={linkStyle} end={item.end}>{item.label}</NavLink>
        }
        return (
          <div key={i}>
            <SectionLabel>{item.label}</SectionLabel>
            {item.links.map((l, j) => (
              <NavLink key={j} to={l.to} style={linkStyle} end={l.end}>{l.label}</NavLink>
            ))}
          </div>
        )
      })}
    </nav>
  )
}
```

- [ ] **Step 4: Run test + build to verify green**

Run: `npm test -- src/app/AppNav && npx tsc -b`
Expected: tests PASS; tsc no errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/AppNav.tsx src/app/AppNav.test.tsx
git commit -m "feat: add registry-driven AppNav renderer"
```

---

### Task 7: Wire renderers in and remove hardcoded shell

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/AppShell/AppShell.tsx`
- Modify: `src/App.test.tsx`
- Delete: `src/components/AppShell/Sidebar.tsx`
- Delete: `src/components/AppShell/Sidebar.test.tsx`

**Interfaces:**
- Consumes: `AppRoutes` from `src/app/AppRoutes`, `AppNav` from `src/app/AppNav`.

- [ ] **Step 1: Replace App.tsx body with AppRoutes**

```tsx
// src/App.tsx
import { AppShell } from './components/AppShell/AppShell'
import { AppRoutes } from './app/AppRoutes'

export default function App() {
  return (
    <AppShell>
      <AppRoutes />
    </AppShell>
  )
}
```

- [ ] **Step 2: Point AppShell at AppNav**

In `src/components/AppShell/AppShell.tsx` replace the `Sidebar` import and usage with `AppNav`:
```tsx
import type { ReactNode } from 'react'
import { AppNav } from '../../app/AppNav'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <AppNav />
      <main style={{ flex: 1, overflow: 'auto', padding: 24 }}>{children}</main>
    </div>
  )
}
```

- [ ] **Step 3: Delete the old Sidebar and its test**

```bash
git rm src/components/AppShell/Sidebar.tsx src/components/AppShell/Sidebar.test.tsx
```

- [ ] **Step 4: Update App.test.tsx (unchanged assertions still valid)**

Confirm `src/App.test.tsx` still reads as below (no change needed — App still renders the Integrations link and route through the registry). If it differs, set it to:
```tsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from './App'

beforeEach(() => localStorage.clear())

test('shows the Integrations nav link', () => {
  render(<MemoryRouter><App /></MemoryRouter>)
  expect(screen.getByRole('link', { name: 'Integrations' })).toBeInTheDocument()
})

test('navigates to the integrations route', () => {
  render(<MemoryRouter initialEntries={['/integrations']}><App /></MemoryRouter>)
  expect(screen.getByText(/connect your first integration/i)).toBeInTheDocument()
})
```

- [ ] **Step 5: Full verification**

Run: `npm run build && npm test`
Expected: build succeeds (tsc + vite); all tests PASS with no reference to the deleted Sidebar.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor: render routes and nav from the feature registry"
```

---

## Self-Review Notes

- **Spec coverage:** manifest contract (Task 1), registry + duplicate guard (Task 4), AppRoutes (Task 5), AppNav preserving styling (Task 6), dashboard migration (Task 2), integrations migration incl. `/configure` (Task 3), wiring + Sidebar removal (Task 7), testing per spec, `npm run build`/`npm test` verification (Task 7). All spec sections mapped.
- **Type consistency:** `FeatureManifest`/`RouteDef`/`NavItem` names used identically across tasks; exports `registeredFeatures`/`allRoutes`/`allNav`/`assertNoDuplicateRoutes` referenced consistently.
- **Placeholder scan:** the `/configure` route intentionally renders `<div>Configure</div>` to preserve current behavior verbatim (not a plan placeholder).
