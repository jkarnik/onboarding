# Integrations Onboarding Workflow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a UI-only onboarding workflow for connecting and managing network integrations (catalog → multi-step setup wizard → edit/delete), housed in a new "Integrations" tab.

**Architecture:** React + Vite + TypeScript single-page app. A mock service layer (`integrationsStore`) backed by `localStorage` is the single source of truth; canned fixtures provide the catalog and the available orgs→sites→devices tree. No backend — credential validation and scope data are mocked with artificial delays. Deploys as a static SPA on AWS Amplify Hosting.

**Tech Stack:** React 18, Vite, TypeScript, React Router, Vitest + React Testing Library, plain CSS (CSS variables for theming).

## Global Constraints

- **UI-only:** no real API calls, auth, server, or database. All persistence is `localStorage`.
- **Persistence key:** `localStorage` key `onboarding.integrations.v1`.
- **Visual style:** dark dashboard aesthetic — background `#0b0e14`, panel `#11151f`, border `#222838`, text `#e6e9ef`, muted `#8b93a7`, accent green `#16a34a` / amber `#d97706` / red `#dc2626`, primary blue `#3b82f6`.
- **Scope filter is visual-only:** filtering never changes selection.
- **Tagging preview matches only the Step-2 selection**, not the full available set.
- **No sync frequency** anywhere.
- **Node:** 18+. Build output dir: `dist`.
- **Test runner:** `npx vitest run` (single run), `npx vitest` (watch).

## File Structure

**Tooling / root**
- `package.json`, `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts`, `index.html`, `.gitignore`
- `amplify.yml` — Amplify build spec
- `public/_redirects` is not used; SPA rewrite is an Amplify console/`amplify.yml` rule (documented in spec)
- `src/test/setup.ts` — Vitest + Testing Library setup

**App shell**
- `src/main.tsx` — React root + Router
- `src/App.tsx` — routes
- `src/styles/theme.css` — CSS variables + base styles
- `src/components/AppShell/AppShell.tsx` — sidebar + content layout
- `src/components/AppShell/Sidebar.tsx` — nav (Network + Integrate sections)
- `src/pages/DashboardPage.tsx` — lightweight Juniper Mist dashboard stub (route target for "View dashboard")

**Shared UI primitives** (`src/components/ui/`)
- `Button.tsx`, `Modal.tsx`, `StatusPill.tsx`, `ProgressSteps.tsx`, `TextField.tsx`, `Select.tsx`, `Checkbox.tsx`

**Integrations feature** (`src/features/integrations/`)
- `types.ts` — domain types
- `data/fixtures.ts` — catalog definitions + available org/site/device tree
- `data/integrationsStore.ts` — localStorage CRUD + scope-summary derivation
- `logic/scope.ts` — selection cascade + filter (text/regex) helpers
- `logic/tagging.ts` — regex tagging match helper
- `IntegrationsPage.tsx` — populated/empty switch, owns wizard + dialogs
- `components/IntegrationList.tsx`, `components/IntegrationRow.tsx`, `components/EmptyState.tsx`, `components/DeleteDialog.tsx`
- `catalog/CatalogModal.tsx`, `catalog/CatalogCard.tsx`
- `wizard/SetupWizard.tsx` — step orchestration, draft state, validation gating
- `wizard/steps/StepConnect.tsx`, `StepScope.tsx` (uses `ScopeTree.tsx`, `ScopeFilter.tsx`), `StepNameSettings.tsx`, `StepTaggingRules.tsx` (uses `RulePreview.tsx`), `StepReview.tsx`, `WizardSuccess.tsx`

**Tests** live next to source as `*.test.ts`/`*.test.tsx`.

---

### Task 1: Project scaffold + tooling

**Files:**
- Create: `package.json`, `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts`, `index.html`, `.gitignore`, `amplify.yml`, `src/main.tsx`, `src/App.tsx`, `src/styles/theme.css`, `src/test/setup.ts`
- Test: `src/App.test.tsx`

**Interfaces:**
- Consumes: nothing.
- Produces: a running Vite app rendering `<App/>`; Vitest + RTL configured (`render`/`screen` available); `App` exports default React component.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "onboarding",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.4.8",
    "@testing-library/react": "^16.0.0",
    "@testing-library/user-event": "^14.5.2",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "jsdom": "^24.1.1",
    "typescript": "^5.5.4",
    "vite": "^5.4.0",
    "vitest": "^2.0.5"
  }
}
```

- [ ] **Step 2: Create `tsconfig.json` and `tsconfig.node.json`**

`tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

`tsconfig.node.json`:
```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "noEmit": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 3: Create `vite.config.ts`**

```ts
/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
```

- [ ] **Step 4: Create `index.html`, `.gitignore`, `amplify.yml`**

`index.html`:
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Network 360 — Integrations</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

`.gitignore`:
```
node_modules
dist
*.local
.DS_Store
```

`amplify.yml`:
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

- [ ] **Step 5: Create `src/test/setup.ts`**

```ts
import '@testing-library/jest-dom/vitest'
```

- [ ] **Step 6: Create `src/styles/theme.css`** (design tokens + base)

```css
:root {
  --bg: #0b0e14;
  --panel: #11151f;
  --panel-2: #161b27;
  --border: #222838;
  --text: #e6e9ef;
  --muted: #8b93a7;
  --green: #16a34a;
  --amber: #d97706;
  --red: #dc2626;
  --blue: #3b82f6;
  --radius: 8px;
  font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
}
* { box-sizing: border-box; }
html, body, #root { height: 100%; margin: 0; }
body { background: var(--bg); color: var(--text); }
button { font: inherit; cursor: pointer; }
input, select { font: inherit; }
```

- [ ] **Step 7: Write the failing test** in `src/App.test.tsx`

```tsx
import { render, screen } from '@testing-library/react'
import App from './App'

test('renders the app shell with Integrations nav', () => {
  render(<App />)
  expect(screen.getByText('Integrations')).toBeInTheDocument()
})
```

- [ ] **Step 8: Run test to verify it fails**

Run: `npx vitest run src/App.test.tsx`
Expected: FAIL — cannot find `./App`.

- [ ] **Step 9: Create `src/App.tsx` and `src/main.tsx`** (minimal to pass; full routing added in Task 3)

`src/App.tsx`:
```tsx
export default function App() {
  return (
    <div>
      <nav>
        <span>Integrations</span>
      </nav>
    </div>
  )
}
```

`src/main.tsx`:
```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/theme.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 10: Install deps, run test to verify it passes**

Run: `npm install && npx vitest run src/App.test.tsx`
Expected: PASS.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "chore: scaffold Vite + React + TS app with Vitest and Amplify config"
```

---

### Task 2: Shared UI primitives

**Files:**
- Create: `src/components/ui/Button.tsx`, `Modal.tsx`, `StatusPill.tsx`, `ProgressSteps.tsx`, `TextField.tsx`, `Select.tsx`, `Checkbox.tsx`
- Test: `src/components/ui/StatusPill.test.tsx`, `src/components/ui/ProgressSteps.test.tsx`

**Interfaces:**
- Produces:
  - `Button(props: {variant?: 'primary'|'ghost'|'danger'; type?; onClick?; disabled?; children})`
  - `Modal(props: {open: boolean; title: string; onClose: () => void; children; footer?: ReactNode})`
  - `StatusPill(props: {status: 'connected'|'syncing'|'error'})` → renders label "Connected"/"Syncing"/"Error"
  - `ProgressSteps(props: {steps: {key: string; label: string; optional?: boolean}[]; activeIndex: number; onStepClick?: (index: number) => void})`
  - `TextField(props: {label: string; value: string; onChange: (v: string) => void; placeholder?; type?; error?; hint?})`
  - `Select(props: {label: string; value: string; onChange: (v: string) => void; options: {value: string; label: string}[]})`
  - `Checkbox(props: {checked: boolean; indeterminate?: boolean; onChange: (checked: boolean) => void; label?: string})`

- [ ] **Step 1: Write failing tests**

`src/components/ui/StatusPill.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react'
import { StatusPill } from './StatusPill'

test('renders human label for each status', () => {
  const { rerender } = render(<StatusPill status="connected" />)
  expect(screen.getByText('Connected')).toBeInTheDocument()
  rerender(<StatusPill status="error" />)
  expect(screen.getByText('Error')).toBeInTheDocument()
})
```

`src/components/ui/ProgressSteps.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react'
import { ProgressSteps } from './ProgressSteps'

const steps = [
  { key: 'a', label: 'Connect' },
  { key: 'b', label: 'Scope' },
  { key: 'c', label: 'Tags', optional: true },
]

test('marks active step and shows optional badge', () => {
  render(<ProgressSteps steps={steps} activeIndex={1} />)
  expect(screen.getByText('Scope').closest('[data-active="true"]')).not.toBeNull()
  expect(screen.getByText(/optional/i)).toBeInTheDocument()
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/components/ui`
Expected: FAIL — modules not found.

- [ ] **Step 3: Implement `StatusPill.tsx`**

```tsx
const MAP = {
  connected: { label: 'Connected', color: 'var(--green)' },
  syncing: { label: 'Syncing', color: 'var(--muted)' },
  error: { label: 'Error', color: 'var(--red)' },
} as const

export function StatusPill({ status }: { status: keyof typeof MAP }) {
  const { label, color } = MAP[status]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      fontSize: 12, color,
    }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
      {label}
    </span>
  )
}
```

- [ ] **Step 4: Implement `ProgressSteps.tsx`**

```tsx
interface Step { key: string; label: string; optional?: boolean }

export function ProgressSteps({
  steps, activeIndex, onStepClick,
}: { steps: Step[]; activeIndex: number; onStepClick?: (i: number) => void }) {
  return (
    <ol style={{ display: 'flex', gap: 16, listStyle: 'none', padding: 0, margin: 0 }}>
      {steps.map((s, i) => {
        const active = i === activeIndex
        const done = i < activeIndex
        return (
          <li
            key={s.key}
            data-active={active}
            onClick={onStepClick ? () => onStepClick(i) : undefined}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              color: active ? 'var(--text)' : done ? 'var(--green)' : 'var(--muted)',
              cursor: onStepClick ? 'pointer' : 'default',
            }}
          >
            <span style={{
              width: 22, height: 22, borderRadius: '50%',
              border: `1px solid ${active ? 'var(--blue)' : 'var(--border)'}`,
              display: 'grid', placeItems: 'center', fontSize: 12,
            }}>{i + 1}</span>
            <span>{s.label}{s.optional ? ' (optional)' : ''}</span>
          </li>
        )
      })}
    </ol>
  )
}
```

- [ ] **Step 5: Implement `Button.tsx`**

```tsx
import type { ButtonHTMLAttributes, ReactNode } from 'react'

const STYLES = {
  primary: { background: 'var(--blue)', color: '#fff', border: '1px solid var(--blue)' },
  ghost: { background: 'transparent', color: 'var(--text)', border: '1px solid var(--border)' },
  danger: { background: 'var(--red)', color: '#fff', border: '1px solid var(--red)' },
} as const

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof STYLES
  children: ReactNode
}

export function Button({ variant = 'primary', children, disabled, ...rest }: Props) {
  return (
    <button
      {...rest}
      disabled={disabled}
      style={{
        ...STYLES[variant],
        padding: '8px 14px', borderRadius: 'var(--radius)',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {children}
    </button>
  )
}
```

- [ ] **Step 6: Implement `Modal.tsx`**

```tsx
import type { ReactNode } from 'react'

export function Modal({
  open, title, onClose, children, footer,
}: { open: boolean; title: string; onClose: () => void; children: ReactNode; footer?: ReactNode }) {
  if (!open) return null
  return (
    <div
      role="dialog"
      aria-label={title}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
        display: 'grid', placeItems: 'center', zIndex: 50,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--panel)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', width: 'min(720px, 92vw)',
          maxHeight: '88vh', display: 'flex', flexDirection: 'column',
        }}
      >
        <header style={{ padding: 16, borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
          <strong>{title}</strong>
          <button aria-label="Close" onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--muted)' }}>✕</button>
        </header>
        <div style={{ padding: 16, overflow: 'auto' }}>{children}</div>
        {footer && <footer style={{ padding: 16, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>{footer}</footer>}
      </div>
    </div>
  )
}
```

- [ ] **Step 7: Implement `TextField.tsx`, `Select.tsx`, `Checkbox.tsx`**

`TextField.tsx`:
```tsx
export function TextField({
  label, value, onChange, placeholder, type = 'text', error, hint,
}: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; error?: string; hint?: string }) {
  return (
    <label style={{ display: 'block', marginBottom: 12 }}>
      <span style={{ display: 'block', fontSize: 13, color: 'var(--muted)', marginBottom: 4 }}>{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%', padding: '8px 10px', background: 'var(--panel-2)',
          border: `1px solid ${error ? 'var(--red)' : 'var(--border)'}`,
          borderRadius: 'var(--radius)', color: 'var(--text)',
        }}
      />
      {hint && !error && <small style={{ color: 'var(--muted)' }}>{hint}</small>}
      {error && <small style={{ color: 'var(--red)' }}>{error}</small>}
    </label>
  )
}
```

`Select.tsx`:
```tsx
export function Select({
  label, value, onChange, options,
}: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <label style={{ display: 'block', marginBottom: 12 }}>
      <span style={{ display: 'block', fontSize: 13, color: 'var(--muted)', marginBottom: 4 }}>{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: '100%', padding: '8px 10px', background: 'var(--panel-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text)' }}
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  )
}
```

`Checkbox.tsx`:
```tsx
import { useEffect, useRef } from 'react'

export function Checkbox({
  checked, indeterminate, onChange, label,
}: { checked: boolean; indeterminate?: boolean; onChange: (c: boolean) => void; label?: string }) {
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => { if (ref.current) ref.current.indeterminate = !!indeterminate && !checked }, [indeterminate, checked])
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <input ref={ref} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label && <span>{label}</span>}
    </label>
  )
}
```

- [ ] **Step 8: Run tests to verify they pass**

Run: `npx vitest run src/components/ui`
Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add src/components/ui
git commit -m "feat: add shared UI primitives"
```

---

### Task 3: App shell, sidebar, routing, dashboard stub

**Files:**
- Create: `src/components/AppShell/Sidebar.tsx`, `src/components/AppShell/AppShell.tsx`, `src/pages/DashboardPage.tsx`
- Modify: `src/App.tsx`, `src/main.tsx`
- Test: `src/App.test.tsx` (update), `src/components/AppShell/Sidebar.test.tsx`

**Interfaces:**
- Consumes: nothing new.
- Produces: routes `/` (DashboardPage) and `/integrations` (placeholder until Task 5). `Sidebar` renders Network section (Summary, Juniper Mist) and Integrate section (Configure, **Integrations**). Nav uses React Router `NavLink`.

- [ ] **Step 1: Update `src/main.tsx` to wrap in Router**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './styles/theme.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
```

- [ ] **Step 2: Write failing tests**

Update `src/App.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from './App'

test('shows the Integrations nav link', () => {
  render(<MemoryRouter><App /></MemoryRouter>)
  expect(screen.getByRole('link', { name: 'Integrations' })).toBeInTheDocument()
})

test('navigates to the integrations route', () => {
  render(<MemoryRouter initialEntries={['/integrations']}><App /></MemoryRouter>)
  expect(screen.getByTestId('integrations-route')).toBeInTheDocument()
})
```

`src/components/AppShell/Sidebar.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Sidebar } from './Sidebar'

test('renders Network and Integrate sections', () => {
  render(<MemoryRouter><Sidebar /></MemoryRouter>)
  expect(screen.getByText('Juniper Mist')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Integrations' })).toBeInTheDocument()
})
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npx vitest run src/App.test.tsx src/components/AppShell`
Expected: FAIL — `integrations-route` testid and `Sidebar` missing.

- [ ] **Step 4: Implement `Sidebar.tsx`**

```tsx
import { NavLink } from 'react-router-dom'

const linkStyle = ({ isActive }: { isActive: boolean }) => ({
  display: 'block', padding: '8px 12px', borderRadius: 6,
  color: isActive ? 'var(--text)' : 'var(--muted)',
  background: isActive ? 'var(--panel-2)' : 'transparent',
  textDecoration: 'none', fontSize: 14,
})

function SectionLabel({ children }: { children: string }) {
  return <div style={{ fontSize: 11, letterSpacing: 1, color: 'var(--muted)', textTransform: 'uppercase', margin: '16px 0 6px' }}>{children}</div>
}

export function Sidebar() {
  return (
    <nav style={{ width: 240, padding: 16, borderRight: '1px solid var(--border)', height: '100%' }}>
      <SectionLabel>Network</SectionLabel>
      <NavLink to="/" style={linkStyle} end>Summary</NavLink>
      <NavLink to="/" style={linkStyle}>Juniper Mist</NavLink>
      <SectionLabel>Integrate</SectionLabel>
      <NavLink to="/configure" style={linkStyle}>Configure</NavLink>
      <NavLink to="/integrations" style={linkStyle}>Integrations</NavLink>
    </nav>
  )
}
```

- [ ] **Step 5: Implement `AppShell.tsx`**

```tsx
import type { ReactNode } from 'react'
import { Sidebar } from './Sidebar'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <Sidebar />
      <main style={{ flex: 1, overflow: 'auto', padding: 24 }}>{children}</main>
    </div>
  )
}
```

- [ ] **Step 6: Implement `DashboardPage.tsx`** (lightweight stub; route target for "View dashboard")

```tsx
export function DashboardPage() {
  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Juniper Mist</h1>
      <p style={{ color: 'var(--muted)' }}>Live Demo Organization — dashboard overview.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {['Infrastructure Alerts', 'Security Alerts', 'AI Alerts'].map((t) => (
          <div key={t} style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 16 }}>
            <strong>{t}</strong>
            <div style={{ color: 'var(--muted)', marginTop: 8 }}>0 Critical · 0 Warning</div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 7: Implement `src/App.tsx` with routes**

```tsx
import { Routes, Route } from 'react-router-dom'
import { AppShell } from './components/AppShell/AppShell'
import { DashboardPage } from './pages/DashboardPage'

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/configure" element={<div>Configure</div>} />
        <Route path="/integrations" element={<div data-testid="integrations-route">Integrations</div>} />
      </Routes>
    </AppShell>
  )
}
```

- [ ] **Step 8: Run tests to verify they pass**

Run: `npx vitest run src/App.test.tsx src/components/AppShell`
Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add src/App.tsx src/main.tsx src/components/AppShell src/pages
git commit -m "feat: add app shell, sidebar nav, routing, dashboard stub"
```

---

### Task 4: Domain types, fixtures, and localStorage store

**Files:**
- Create: `src/features/integrations/types.ts`, `src/features/integrations/data/fixtures.ts`, `src/features/integrations/data/integrationsStore.ts`
- Test: `src/features/integrations/data/integrationsStore.test.ts`

**Interfaces:**
- Produces (types.ts):
```ts
export type IntegrationStatus = 'connected' | 'syncing' | 'error'
export interface TaggingRule { id: string; pattern: string; target: 'sites' | 'devices' | 'both'; tag: string }
export interface ScopeSelection { orgIds: string[]; siteIds: string[]; deviceIds: string[] }
export interface Connection { region: string; orgId?: string; tokenLast4?: string }
export interface Integration {
  id: string; type: string; name: string; environmentTag?: string
  status: IntegrationStatus; connection: Connection
  scope: ScopeSelection; taggingRules: TaggingRule[]
  scopeSummary: string; lastSyncedAt: string
}
export interface CatalogEntry { type: string; name: string; description: string; available: boolean }
export interface DeviceNode { id: string; name: string }
export interface SiteNode { id: string; name: string; devices: DeviceNode[] }
export interface OrgNode { id: string; name: string; sites: SiteNode[] }
```
- Produces (integrationsStore.ts): `listIntegrations(): Integration[]`, `getIntegration(id): Integration | undefined`, `createIntegration(draft: Omit<Integration,'id'|'lastSyncedAt'|'scopeSummary'|'status'>): Integration`, `updateIntegration(id, draft: Partial<Integration>): Integration`, `removeIntegration(id): void`, `deriveScopeSummary(scope, tree): string`. The store assigns `id` (`'int-' + counter`), `status: 'connected'`, `lastSyncedAt` (fixed ISO `'2026-06-24T00:00:00.000Z'` for deterministic tests), and derives `scopeSummary`.
- Produces (fixtures.ts): `CATALOG: CatalogEntry[]` (Juniper Mist + 2 more real, ≥3 coming-soon), `getAvailableTree(type: string): OrgNode[]`.

- [ ] **Step 1: Write failing test** `integrationsStore.test.ts`

```ts
import { beforeEach, expect, test } from 'vitest'
import { createIntegration, listIntegrations, getIntegration, updateIntegration, removeIntegration, deriveScopeSummary } from './integrationsStore'
import { getAvailableTree } from './fixtures'

beforeEach(() => localStorage.clear())

const draft = {
  type: 'juniper-mist', name: 'Live Demo Org', environmentTag: 'prod',
  connection: { region: 'global', tokenLast4: '1234' },
  scope: { orgIds: ['o1'], siteIds: ['s1', 's2'], deviceIds: [] },
  taggingRules: [],
}

test('create assigns id, status, derived summary; list returns it', () => {
  const created = createIntegration(draft)
  expect(created.id).toMatch(/^int-/)
  expect(created.status).toBe('connected')
  expect(created.scopeSummary).toContain('site')
  expect(listIntegrations()).toHaveLength(1)
})

test('get / update / remove round-trip', () => {
  const created = createIntegration(draft)
  expect(getIntegration(created.id)?.name).toBe('Live Demo Org')
  updateIntegration(created.id, { name: 'Renamed' })
  expect(getIntegration(created.id)?.name).toBe('Renamed')
  removeIntegration(created.id)
  expect(listIntegrations()).toHaveLength(0)
})

test('deriveScopeSummary counts orgs and sites', () => {
  const tree = getAvailableTree('juniper-mist')
  const summary = deriveScopeSummary({ orgIds: [tree[0].id], siteIds: [tree[0].sites[0].id], deviceIds: [] }, tree)
  expect(summary).toMatch(/1 org/)
  expect(summary).toMatch(/1 site/)
})

test('persists across store reloads via localStorage', () => {
  createIntegration(draft)
  expect(localStorage.getItem('onboarding.integrations.v1')).not.toBeNull()
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/integrations/data`
Expected: FAIL — modules not found.

- [ ] **Step 3: Implement `types.ts`** (exact content from the Interfaces block above).

- [ ] **Step 4: Implement `fixtures.ts`**

```ts
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
```

- [ ] **Step 5: Implement `integrationsStore.ts`**

```ts
import type { Integration, OrgNode, ScopeSelection } from '../types'

const KEY = 'onboarding.integrations.v1'
const FIXED_SYNC = '2026-06-24T00:00:00.000Z'

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
    id: `int-${items.length + 1}-${items.reduce((n, i) => n + i.id.length, 1)}`,
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
```

> Note: `id` generation avoids `Date.now()`/`Math.random()` (deterministic for tests). `deriveScopeSummary` counts selected orgs/sites; the `tree` param is reserved for future device counts and currently unused.

- [ ] **Step 6: Run test to verify it passes**

Run: `npx vitest run src/features/integrations/data`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/features/integrations/types.ts src/features/integrations/data
git commit -m "feat: add integrations domain types, fixtures, and localStorage store"
```

---

### Task 5: Scope selection, visual filter, and tagging logic

**Files:**
- Create: `src/features/integrations/logic/scope.ts`, `src/features/integrations/logic/tagging.ts`
- Test: `src/features/integrations/logic/scope.test.ts`, `src/features/integrations/logic/tagging.test.ts`

**Interfaces:**
- Produces (scope.ts):
  - `emptySelection(): ScopeSelection`
  - `toggleDevice(tree, sel, orgId, siteId, deviceId, checked): ScopeSelection`
  - `toggleSite(tree, sel, orgId, siteId, checked): ScopeSelection` — cascades to its devices
  - `toggleOrg(tree, sel, orgId, checked): ScopeSelection` — cascades to all sites + devices
  - `siteState(tree, sel, siteId): { checked: boolean; indeterminate: boolean }`
  - `orgState(tree, sel, orgId): { checked: boolean; indeterminate: boolean }`
  - `filterTree(tree, query, mode: 'text' | 'regex'): { tree: OrgNode[]; error?: string }` — returns orgs/sites kept when any descendant (site or device) name matches; `error` set for invalid regex (returns original tree unfiltered).
- Produces (tagging.ts):
  - `compileRegex(pattern: string): RegExp | null`
  - `matchTagging(rule: TaggingRule, sel: ScopeSelection, tree: OrgNode[]): { sites: string[]; devices: string[] }` — names among the **selected** sites/devices whose name matches `rule.pattern`, limited by `rule.target`.

- [ ] **Step 1: Write failing tests** `scope.test.ts`

```ts
import { expect, test } from 'vitest'
import { emptySelection, toggleOrg, toggleSite, orgState, siteState, filterTree } from './scope'
import { getAvailableTree } from '../data/fixtures'

const tree = getAvailableTree('juniper-mist')

test('toggleOrg selects org, all its sites and devices', () => {
  const sel = toggleOrg(tree, emptySelection(), 'o1', true)
  expect(sel.orgIds).toContain('o1')
  expect(sel.siteIds).toEqual(expect.arrayContaining(['s1', 's2']))
  expect(sel.deviceIds).toEqual(expect.arrayContaining(['d1', 'd2', 'd3']))
  expect(orgState(tree, sel, 'o1')).toEqual({ checked: true, indeterminate: false })
})

test('toggling one site of an org makes the org indeterminate', () => {
  const sel = toggleSite(tree, emptySelection(), 'o1', 's1', true)
  expect(orgState(tree, sel, 'o1').indeterminate).toBe(true)
  expect(siteState(tree, sel, 's1').checked).toBe(true)
})

test('filterTree text mode keeps only matching sites/devices, selection untouched', () => {
  const { tree: filtered } = filterTree(tree, 'phoenix', 'text')
  const siteNames = filtered.flatMap((o) => o.sites.map((s) => s.name))
  expect(siteNames).toContain('sdwan_phoenix')
  expect(siteNames).not.toContain('sdwan_atlanta')
})

test('filterTree regex invalid returns error and full tree', () => {
  const res = filterTree(tree, '(', 'regex')
  expect(res.error).toBeTruthy()
  expect(res.tree).toHaveLength(tree.length)
})
```

`tagging.test.ts`:
```ts
import { expect, test } from 'vitest'
import { compileRegex, matchTagging } from './tagging'
import { getAvailableTree } from '../data/fixtures'
import { toggleOrg, emptySelection } from './scope'

const tree = getAvailableTree('juniper-mist')

test('compileRegex returns null on invalid pattern', () => {
  expect(compileRegex('(')).toBeNull()
  expect(compileRegex('sdwan_.*')).toBeInstanceOf(RegExp)
})

test('matchTagging only considers selected items and respects target', () => {
  const sel = toggleOrg(tree, emptySelection(), 'o1', true) // selects o1 sites+devices
  const rule = { id: 'r1', pattern: 'sdwan', target: 'sites' as const, tag: 'wan' }
  const m = matchTagging(rule, sel, tree)
  expect(m.sites).toEqual(expect.arrayContaining(['sdwan_atlanta', 'sdwan_phoenix']))
  expect(m.devices).toHaveLength(0)
})

test('matchTagging ignores unselected items', () => {
  const sel = emptySelection() // nothing selected
  const rule = { id: 'r1', pattern: '.*', target: 'both' as const, tag: 'all' }
  expect(matchTagging(rule, sel, tree)).toEqual({ sites: [], devices: [] })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/features/integrations/logic`
Expected: FAIL — modules not found.

- [ ] **Step 3: Implement `scope.ts`**

```ts
import type { OrgNode, ScopeSelection } from '../types'

export function emptySelection(): ScopeSelection {
  return { orgIds: [], siteIds: [], deviceIds: [] }
}

const add = (arr: string[], ids: string[]) => Array.from(new Set([...arr, ...ids]))
const remove = (arr: string[], ids: string[]) => arr.filter((x) => !ids.includes(x))

function findOrg(tree: OrgNode[], orgId: string) { return tree.find((o) => o.id === orgId) }
function findSite(tree: OrgNode[], siteId: string) {
  for (const o of tree) { const s = o.sites.find((x) => x.id === siteId); if (s) return { org: o, site: s } }
  return undefined
}

export function toggleDevice(tree: OrgNode[], sel: ScopeSelection, _orgId: string, siteId: string, deviceId: string, checked: boolean): ScopeSelection {
  const found = findSite(tree, siteId)
  const deviceIds = checked ? add(sel.deviceIds, [deviceId]) : remove(sel.deviceIds, [deviceId])
  let siteIds = sel.siteIds
  if (found && checked) siteIds = add(siteIds, [siteId])
  return { ...sel, deviceIds, siteIds }
}

export function toggleSite(tree: OrgNode[], sel: ScopeSelection, _orgId: string, siteId: string, checked: boolean): ScopeSelection {
  const found = findSite(tree, siteId)
  const devIds = found ? found.site.devices.map((d) => d.id) : []
  return {
    ...sel,
    siteIds: checked ? add(sel.siteIds, [siteId]) : remove(sel.siteIds, [siteId]),
    deviceIds: checked ? add(sel.deviceIds, devIds) : remove(sel.deviceIds, devIds),
  }
}

export function toggleOrg(tree: OrgNode[], sel: ScopeSelection, orgId: string, checked: boolean): ScopeSelection {
  const org = findOrg(tree, orgId)
  if (!org) return sel
  const siteIds = org.sites.map((s) => s.id)
  const devIds = org.sites.flatMap((s) => s.devices.map((d) => d.id))
  return {
    orgIds: checked ? add(sel.orgIds, [orgId]) : remove(sel.orgIds, [orgId]),
    siteIds: checked ? add(sel.siteIds, siteIds) : remove(sel.siteIds, siteIds),
    deviceIds: checked ? add(sel.deviceIds, devIds) : remove(sel.deviceIds, devIds),
  }
}

export function siteState(tree: OrgNode[], sel: ScopeSelection, siteId: string) {
  const found = findSite(tree, siteId)
  if (!found) return { checked: false, indeterminate: false }
  const devIds = found.site.devices.map((d) => d.id)
  const selected = devIds.filter((d) => sel.deviceIds.includes(d))
  const checked = sel.siteIds.includes(siteId) && (devIds.length === 0 || selected.length === devIds.length)
  const indeterminate = selected.length > 0 && selected.length < devIds.length
  return { checked, indeterminate }
}

export function orgState(tree: OrgNode[], sel: ScopeSelection, orgId: string) {
  const org = findOrg(tree, orgId)
  if (!org) return { checked: false, indeterminate: false }
  const states = org.sites.map((s) => siteState(tree, sel, s.id))
  const all = states.every((s) => s.checked)
  const some = states.some((s) => s.checked || s.indeterminate)
  return { checked: all && org.sites.length > 0, indeterminate: some && !all }
}

export function filterTree(tree: OrgNode[], query: string, mode: 'text' | 'regex'): { tree: OrgNode[]; error?: string } {
  if (!query.trim()) return { tree }
  let test: (name: string) => boolean
  if (mode === 'regex') {
    try { const re = new RegExp(query, 'i'); test = (n) => re.test(n) }
    catch { return { tree, error: 'Invalid regex' } }
  } else {
    const q = query.toLowerCase(); test = (n) => n.toLowerCase().includes(q)
  }
  const filtered = tree
    .map((o) => {
      const sites = o.sites
        .map((s) => ({ ...s, devices: s.devices.filter((d) => test(d.name) || test(s.name)) }))
        .filter((s) => test(s.name) || s.devices.length > 0)
      return { ...o, sites }
    })
    .filter((o) => test(o.name) || o.sites.length > 0)
  return { tree: filtered }
}
```

- [ ] **Step 4: Implement `tagging.ts`**

```ts
import type { OrgNode, ScopeSelection, TaggingRule } from '../types'

export function compileRegex(pattern: string): RegExp | null {
  try { return new RegExp(pattern, 'i') } catch { return null }
}

export function matchTagging(rule: TaggingRule, sel: ScopeSelection, tree: OrgNode[]): { sites: string[]; devices: string[] } {
  const re = compileRegex(rule.pattern)
  if (!re || !rule.pattern) return { sites: [], devices: [] }
  const sites: string[] = []
  const devices: string[] = []
  for (const org of tree) {
    for (const site of org.sites) {
      if ((rule.target === 'sites' || rule.target === 'both') && sel.siteIds.includes(site.id) && re.test(site.name)) {
        sites.push(site.name)
      }
      if (rule.target === 'devices' || rule.target === 'both') {
        for (const dev of site.devices) {
          if (sel.deviceIds.includes(dev.id) && re.test(dev.name)) devices.push(dev.name)
        }
      }
    }
  }
  return { sites, devices }
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run src/features/integrations/logic`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/features/integrations/logic
git commit -m "feat: add scope selection, visual filter, and tagging logic"
```

---

### Task 6: Integrations list page (populated + empty states)

**Files:**
- Create: `src/features/integrations/components/EmptyState.tsx`, `src/features/integrations/components/IntegrationRow.tsx`, `src/features/integrations/components/IntegrationList.tsx`, `src/features/integrations/IntegrationsPage.tsx`
- Modify: `src/App.tsx` (route `/integrations` → `<IntegrationsPage/>`)
- Test: `src/features/integrations/IntegrationsPage.test.tsx`

**Interfaces:**
- Consumes: `listIntegrations`, `removeIntegration` (store); `Integration` type.
- Produces: `IntegrationsPage` (default-less named export) owns orchestration state:
  `type View = { mode: 'list' } | { mode: 'catalog' } | { mode: 'wizard'; type: string; editing?: Integration }` and `deleteTarget: Integration | null`.
  In this task only `list`/empty render; `catalog` and `wizard` render a placeholder `<div data-testid="catalog-placeholder"/>` to be replaced in Tasks 7–8. Exposes handlers `openCatalog()`, `requestDelete(i)`, `confirmDelete()` and a `reload()` that re-reads the store.
  - `EmptyState({ onBrowse })`
  - `IntegrationRow({ integration, onEdit, onDelete })`
  - `IntegrationList({ integrations, onEdit, onDelete })`

- [ ] **Step 1: Write failing test** `IntegrationsPage.test.tsx`

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, test } from 'vitest'
import { IntegrationsPage } from './IntegrationsPage'
import { createIntegration } from './data/integrationsStore'

beforeEach(() => localStorage.clear())

const seed = () => createIntegration({
  type: 'juniper-mist', name: 'Live Demo Org',
  connection: { region: 'global', tokenLast4: '1234' },
  scope: { orgIds: ['o1'], siteIds: ['s1'], deviceIds: [] }, taggingRules: [],
})

test('shows empty state when there are no integrations', () => {
  render(<IntegrationsPage />)
  expect(screen.getByText(/connect your first integration/i)).toBeInTheDocument()
})

test('lists integrations when present', () => {
  seed()
  render(<IntegrationsPage />)
  expect(screen.getByText('Live Demo Org')).toBeInTheDocument()
  expect(screen.getByText('Connected')).toBeInTheDocument()
})

test('clicking Add opens the catalog placeholder', async () => {
  render(<IntegrationsPage />)
  await userEvent.click(screen.getByRole('button', { name: /add integration/i }))
  expect(screen.getByTestId('catalog-placeholder')).toBeInTheDocument()
})

test('delete removes the row and falls back to empty state', async () => {
  seed()
  render(<IntegrationsPage />)
  await userEvent.click(screen.getByRole('button', { name: /delete/i }))
  // confirm dialog wired in a later task; here removeIntegration is called directly via confirm button
  await userEvent.click(screen.getByRole('button', { name: /^delete$/i }))
  expect(screen.getByText(/connect your first integration/i)).toBeInTheDocument()
})
```

> The fourth test depends on the DeleteDialog from Task 14. Mark it `test.skip` until Task 14, then unskip. Note this in the commit message.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/integrations/IntegrationsPage.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `EmptyState.tsx`**

```tsx
import { Button } from '../../../components/ui/Button'

export function EmptyState({ onBrowse }: { onBrowse: () => void }) {
  return (
    <div style={{ textAlign: 'center', padding: '80px 16px', color: 'var(--muted)' }}>
      <h2 style={{ color: 'var(--text)', marginBottom: 8 }}>Connect your first integration</h2>
      <p style={{ maxWidth: 420, margin: '0 auto 20px' }}>
        Bring your network data into Network 360. Pick an integration to get started.
      </p>
      <Button onClick={onBrowse}>+ Add integration</Button>
    </div>
  )
}
```

- [ ] **Step 4: Implement `IntegrationRow.tsx`**

```tsx
import type { Integration } from '../types'
import { StatusPill } from '../../../components/ui/StatusPill'
import { Button } from '../../../components/ui/Button'

export function IntegrationRow({
  integration, onEdit, onDelete,
}: { integration: Integration; onEdit: (i: Integration) => void; onDelete: (i: Integration) => void }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto',
      alignItems: 'center', gap: 12, padding: 14,
      borderBottom: '1px solid var(--border)',
    }}>
      <div>
        <div style={{ fontWeight: 600 }}>{integration.name}</div>
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>{integration.type}</div>
      </div>
      <StatusPill status={integration.status} />
      <div style={{ color: 'var(--muted)', fontSize: 13 }}>{integration.scopeSummary}</div>
      <div style={{ color: 'var(--muted)', fontSize: 13 }}>2 min ago</div>
      <div style={{ display: 'flex', gap: 8 }}>
        <Button variant="ghost" onClick={() => onEdit(integration)}>Edit</Button>
        <Button variant="ghost" onClick={() => onDelete(integration)}>Delete</Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Implement `IntegrationList.tsx`**

```tsx
import type { Integration } from '../types'
import { IntegrationRow } from './IntegrationRow'

export function IntegrationList({
  integrations, onEdit, onDelete,
}: { integrations: Integration[]; onEdit: (i: Integration) => void; onDelete: (i: Integration) => void }) {
  return (
    <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
      {integrations.map((i) => (
        <IntegrationRow key={i.id} integration={i} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  )
}
```

- [ ] **Step 6: Implement `IntegrationsPage.tsx`** (orchestration; catalog/wizard placeholders for now)

```tsx
import { useState } from 'react'
import type { Integration } from './types'
import { listIntegrations, removeIntegration } from './data/integrationsStore'
import { IntegrationList } from './components/IntegrationList'
import { EmptyState } from './components/EmptyState'
import { Button } from '../../components/ui/Button'

type View =
  | { mode: 'list' }
  | { mode: 'catalog' }
  | { mode: 'wizard'; type: string; editing?: Integration }

export function IntegrationsPage() {
  const [items, setItems] = useState<Integration[]>(() => listIntegrations())
  const [view, setView] = useState<View>({ mode: 'list' })
  const [deleteTarget, setDeleteTarget] = useState<Integration | null>(null)

  const reload = () => setItems(listIntegrations())
  const openCatalog = () => setView({ mode: 'catalog' })

  // Temporary delete confirm (replaced by DeleteDialog in Task 14)
  const confirmDelete = () => {
    if (deleteTarget) { removeIntegration(deleteTarget.id); setDeleteTarget(null); reload() }
  }

  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ margin: 0 }}>Integrations</h1>
        <Button onClick={openCatalog}>+ Add integration</Button>
      </header>

      {items.length === 0
        ? <EmptyState onBrowse={openCatalog} />
        : <IntegrationList
            integrations={items}
            onEdit={(i) => setView({ mode: 'wizard', type: i.type, editing: i })}
            onDelete={(i) => setDeleteTarget(i)}
          />}

      {view.mode === 'catalog' && <div data-testid="catalog-placeholder" />}
      {view.mode === 'wizard' && <div data-testid="wizard-placeholder" />}

      {deleteTarget && (
        <div role="dialog" aria-label="Confirm delete">
          <span>Delete {deleteTarget.name}?</span>
          <Button variant="danger" onClick={confirmDelete}>Delete</Button>
          <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 7: Wire the route** — in `src/App.tsx` replace the `/integrations` element:

```tsx
import { IntegrationsPage } from './features/integrations/IntegrationsPage'
// ...
<Route path="/integrations" element={<IntegrationsPage />} />
```

- [ ] **Step 8: Run tests to verify they pass** (with the 4th test still skipped)

Run: `npx vitest run src/features/integrations/IntegrationsPage.test.tsx`
Expected: PASS (3 pass, 1 skipped).

- [ ] **Step 9: Commit**

```bash
git add src/features/integrations src/App.tsx
git commit -m "feat: add integrations list page with empty state (delete test skipped until Task 14)"
```

---

### Task 7: Integration catalog modal

**Files:**
- Create: `src/features/integrations/catalog/CatalogCard.tsx`, `src/features/integrations/catalog/CatalogModal.tsx`
- Modify: `src/features/integrations/IntegrationsPage.tsx` (replace catalog placeholder)
- Test: `src/features/integrations/catalog/CatalogModal.test.tsx`

**Interfaces:**
- Consumes: `CATALOG` (fixtures), `Modal`, `Button`.
- Produces:
  - `CatalogCard({ entry, onSelect })` — disabled + "Coming soon" when `!entry.available`.
  - `CatalogModal({ open, onClose, onSelect })` — `onSelect(type: string)` fires only for available entries.

- [ ] **Step 1: Write failing test** `CatalogModal.test.tsx`

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import { CatalogModal } from './CatalogModal'

test('selecting a real integration fires onSelect with its type', async () => {
  const onSelect = vi.fn()
  render(<CatalogModal open onClose={() => {}} onSelect={onSelect} />)
  await userEvent.click(screen.getByRole('button', { name: /juniper mist/i }))
  expect(onSelect).toHaveBeenCalledWith('juniper-mist')
})

test('coming-soon integrations are disabled', () => {
  render(<CatalogModal open onClose={() => {}} onSelect={() => {}} />)
  expect(screen.getByRole('button', { name: /datadog/i })).toBeDisabled()
  expect(screen.getAllByText(/coming soon/i).length).toBeGreaterThan(0)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/integrations/catalog`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `CatalogCard.tsx`**

```tsx
import type { CatalogEntry } from '../types'

export function CatalogCard({ entry, onSelect }: { entry: CatalogEntry; onSelect: (type: string) => void }) {
  return (
    <button
      onClick={() => entry.available && onSelect(entry.type)}
      disabled={!entry.available}
      style={{
        textAlign: 'left', background: 'var(--panel-2)',
        border: '1px solid var(--border)', borderRadius: 'var(--radius)',
        padding: 16, opacity: entry.available ? 1 : 0.55,
        color: 'var(--text)',
      }}
    >
      <div style={{ fontWeight: 600 }}>{entry.name}</div>
      <div style={{ fontSize: 13, color: 'var(--muted)', margin: '6px 0' }}>{entry.description}</div>
      {!entry.available && <span style={{ fontSize: 12, color: 'var(--amber)' }}>Coming soon</span>}
    </button>
  )
}
```

- [ ] **Step 4: Implement `CatalogModal.tsx`**

```tsx
import { CATALOG } from '../data/fixtures'
import { CatalogCard } from './CatalogCard'
import { Modal } from '../../../components/ui/Modal'

export function CatalogModal({
  open, onClose, onSelect,
}: { open: boolean; onClose: () => void; onSelect: (type: string) => void }) {
  return (
    <Modal open={open} title="Add an integration" onClose={onClose}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        {CATALOG.map((entry) => (
          <CatalogCard key={entry.type} entry={entry} onSelect={onSelect} />
        ))}
      </div>
    </Modal>
  )
}
```

- [ ] **Step 5: Wire into `IntegrationsPage.tsx`** — replace the catalog placeholder line:

```tsx
import { CatalogModal } from './catalog/CatalogModal'
// ...
<CatalogModal
  open={view.mode === 'catalog'}
  onClose={() => setView({ mode: 'list' })}
  onSelect={(type) => setView({ mode: 'wizard', type })}
/>
```

> Remove the `data-testid="catalog-placeholder"` div. Update `IntegrationsPage.test.tsx` test 3 to assert `screen.getByText('Add an integration')` is shown instead of the placeholder.

- [ ] **Step 6: Run tests to verify they pass**

Run: `npx vitest run src/features/integrations/catalog src/features/integrations/IntegrationsPage.test.tsx`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/features/integrations/catalog src/features/integrations/IntegrationsPage.tsx src/features/integrations/IntegrationsPage.test.tsx
git commit -m "feat: add integration catalog modal with coming-soon entries"
```

---

### Task 8: Wizard shell — draft state, steps, navigation, gating

**Files:**
- Create: `src/features/integrations/wizard/draft.ts`, `src/features/integrations/wizard/SetupWizard.tsx`
- Modify: `src/features/integrations/IntegrationsPage.tsx` (replace wizard placeholder)
- Test: `src/features/integrations/wizard/SetupWizard.test.tsx`

**Interfaces:**
- Produces (draft.ts):
```ts
export interface WizardDraft {
  type: string
  connection: { token: string; region: string; orgId: string; tested: boolean }
  scope: ScopeSelection
  name: string
  environmentTag: string
  taggingRules: TaggingRule[]
}
export function initDraft(type: string, editing?: Integration): WizardDraft
export const STEP_KEYS = ['connect', 'scope', 'name', 'tagging', 'review'] as const
export type StepKey = typeof STEP_KEYS[number]
export function canAdvance(step: StepKey, draft: WizardDraft): boolean
```
  - `canAdvance`: `connect` → `draft.connection.tested === true`; `scope` → `draft.scope.siteIds.length > 0 || draft.scope.deviceIds.length > 0`; `name` → `draft.name.trim().length > 0`; `tagging` → always true (optional); `review` → true.
- Produces (SetupWizard.tsx): `SetupWizard({ type, editing?, onClose, onComplete })`. Renders `ProgressSteps`, a per-step body (placeholders here, real bodies in Tasks 9–13), Back / Next / Skip(only on `tagging`) buttons, and a discard confirm when closing mid-flow. Each step body receives `{ draft, setDraft }`. `tagging` step shows a "Skip" action that jumps to `review`. On final submit (`review` → "Connect integration") it calls `createIntegration`/`updateIntegration` then shows the success screen (success body added in Task 13; here a placeholder).
- Consumes: `ProgressSteps`, `Button`, `Modal`.

- [ ] **Step 1: Write failing test** `SetupWizard.test.tsx`

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, test, vi } from 'vitest'
import { SetupWizard } from './SetupWizard'

beforeEach(() => localStorage.clear())

test('Next is disabled on Connect until connection is tested', () => {
  render(<SetupWizard type="juniper-mist" onClose={() => {}} onComplete={() => {}} />)
  expect(screen.getByRole('button', { name: /next/i })).toBeDisabled()
})

test('shows the five step labels including optional tagging', () => {
  render(<SetupWizard type="juniper-mist" onClose={() => {}} onComplete={() => {}} />)
  expect(screen.getByText('Connect')).toBeInTheDocument()
  expect(screen.getByText(/tagging \(optional\)/i)).toBeInTheDocument()
  expect(screen.getByText('Review')).toBeInTheDocument()
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/integrations/wizard/SetupWizard.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `draft.ts`**

```ts
import type { Integration, ScopeSelection, TaggingRule } from '../types'
import { emptySelection } from '../logic/scope'

export interface WizardDraft {
  type: string
  connection: { token: string; region: string; orgId: string; tested: boolean }
  scope: ScopeSelection
  name: string
  environmentTag: string
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
      connection: { token: '', region: editing.connection.region, orgId: editing.connection.orgId ?? '', tested: true },
      scope: editing.scope,
      name: editing.name,
      environmentTag: editing.environmentTag ?? '',
      taggingRules: editing.taggingRules,
    }
  }
  return {
    type,
    connection: { token: '', region: 'global', orgId: '', tested: false },
    scope: emptySelection(),
    name: DEFAULT_NAME[type] ?? '',
    environmentTag: '',
    taggingRules: [],
  }
}

export const STEP_KEYS = ['connect', 'scope', 'name', 'tagging', 'review'] as const
export type StepKey = typeof STEP_KEYS[number]

export function canAdvance(step: StepKey, draft: WizardDraft): boolean {
  switch (step) {
    case 'connect': return draft.connection.tested
    case 'scope': return draft.scope.siteIds.length > 0 || draft.scope.deviceIds.length > 0
    case 'name': return draft.name.trim().length > 0
    case 'tagging': return true
    case 'review': return true
  }
}
```

- [ ] **Step 4: Implement `SetupWizard.tsx`** (placeholders for step bodies + success)

```tsx
import { useState } from 'react'
import type { Integration } from '../types'
import { ProgressSteps } from '../../../components/ui/ProgressSteps'
import { Button } from '../../../components/ui/Button'
import { Modal } from '../../../components/ui/Modal'
import { createIntegration, updateIntegration } from '../data/integrationsStore'
import { initDraft, STEP_KEYS, canAdvance, type WizardDraft, type StepKey } from './draft'

const STEP_META = [
  { key: 'connect', label: 'Connect' },
  { key: 'scope', label: 'Select scope' },
  { key: 'name', label: 'Name & settings' },
  { key: 'tagging', label: 'Tagging', optional: true },
  { key: 'review', label: 'Review' },
]

export function SetupWizard({
  type, editing, onClose, onComplete,
}: { type: string; editing?: Integration; onClose: () => void; onComplete: () => void }) {
  const [draft, setDraft] = useState<WizardDraft>(() => initDraft(type, editing))
  const [index, setIndex] = useState(editing ? STEP_KEYS.indexOf('review') : 0)
  const [done, setDone] = useState(false)
  const [confirmClose, setConfirmClose] = useState(false)

  const step = STEP_KEYS[index] as StepKey
  const isLast = step === 'review'

  const submit = () => {
    const payload = {
      type: draft.type, name: draft.name, environmentTag: draft.environmentTag || undefined,
      connection: { region: draft.connection.region, orgId: draft.connection.orgId || undefined, tokenLast4: draft.connection.token.slice(-4) || undefined },
      scope: draft.scope, taggingRules: draft.taggingRules,
    }
    if (editing) updateIntegration(editing.id, payload)
    else createIntegration(payload)
    setDone(true)
  }

  const next = () => {
    if (isLast) { submit(); return }
    setIndex((i) => i + 1)
  }
  const skip = () => setIndex(STEP_KEYS.indexOf('review'))

  if (done) {
    return (
      <Modal open title="Done" onClose={() => { onComplete(); onClose() }}>
        <div data-testid="wizard-success">
          <p>✓ Integration connected.</p>
          <Button onClick={() => { onComplete(); onClose() }}>Done</Button>
        </div>
      </Modal>
    )
  }

  return (
    <>
      <Modal
        open
        title={editing ? 'Edit integration' : 'Set up integration'}
        onClose={() => setConfirmClose(true)}
        footer={
          <>
            {index > 0 && <Button variant="ghost" onClick={() => setIndex((i) => i - 1)}>Back</Button>}
            {step === 'tagging' && <Button variant="ghost" onClick={skip}>Skip</Button>}
            <Button onClick={next} disabled={!canAdvance(step, draft)}>
              {isLast ? 'Connect integration' : 'Next'}
            </Button>
          </>
        }
      >
        <ProgressSteps steps={STEP_META} activeIndex={index} onStepClick={editing ? (i) => setIndex(i) : undefined} />
        <div style={{ marginTop: 20 }}>
          {/* Step bodies plugged in Tasks 9–13 */}
          {step === 'connect' && <div data-testid="body-connect" />}
          {step === 'scope' && <div data-testid="body-scope" />}
          {step === 'name' && <div data-testid="body-name" />}
          {step === 'tagging' && <div data-testid="body-tagging" />}
          {step === 'review' && <div data-testid="body-review" />}
        </div>
      </Modal>

      {confirmClose && (
        <Modal open title="Discard setup?" onClose={() => setConfirmClose(false)}
          footer={<>
            <Button variant="ghost" onClick={() => setConfirmClose(false)}>Keep editing</Button>
            <Button variant="danger" onClick={onClose}>Discard</Button>
          </>}>
          <p>Your progress will be lost.</p>
        </Modal>
      )}
    </>
  )
}
```

- [ ] **Step 5: Wire into `IntegrationsPage.tsx`** — replace the wizard placeholder:

```tsx
import { SetupWizard } from './wizard/SetupWizard'
// ...
{view.mode === 'wizard' && (
  <SetupWizard
    type={view.type}
    editing={view.editing}
    onClose={() => setView({ mode: 'list' })}
    onComplete={reload}
  />
)}
```

> Remove the `wizard-placeholder` div.

- [ ] **Step 6: Run tests to verify they pass**

Run: `npx vitest run src/features/integrations/wizard/SetupWizard.test.tsx`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/features/integrations/wizard src/features/integrations/IntegrationsPage.tsx
git commit -m "feat: add setup wizard shell with step navigation and validation gating"
```

---

### Task 9: Wizard Step 1 — Connect (mocked validation)

**Files:**
- Create: `src/features/integrations/wizard/steps/StepConnect.tsx`, `src/features/integrations/wizard/steps/mockValidate.ts`
- Modify: `src/features/integrations/wizard/SetupWizard.tsx` (render `<StepConnect>` for `connect`; pass `draft`/`setDraft`)
- Test: `src/features/integrations/wizard/steps/StepConnect.test.tsx`

**Interfaces:**
- Produces:
  - `mockValidate(token: string): Promise<{ ok: boolean; error?: string }>` — rejects empty, fails if token includes `'fail'`, else ok; resolves after ~500ms.
  - `StepConnect({ draft, setDraft })` where `setDraft: React.Dispatch<React.SetStateAction<WizardDraft>>`. Fields: API token (TextField, `type="password"`), Region (Select: Global/EU/APAC), optional Org ID. A "Test connection" button (disabled when token empty) runs `mockValidate`, shows spinner text, and on success sets `connection.tested=true` + a success line; on failure shows error and keeps `tested=false`. Changing the token resets `tested` to false.
- Consumes: `TextField`, `Select`, `Button`, `WizardDraft`.

- [ ] **Step 1: Write failing test** `StepConnect.test.tsx`

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { expect, test } from 'vitest'
import { StepConnect } from './StepConnect'
import { initDraft, type WizardDraft } from '../draft'

function Harness() {
  const [draft, setDraft] = useState<WizardDraft>(() => initDraft('juniper-mist'))
  return <>
    <StepConnect draft={draft} setDraft={setDraft} />
    <span data-testid="tested">{String(draft.connection.tested)}</span>
  </>
}

test('successful test connection sets tested=true', async () => {
  render(<Harness />)
  await userEvent.type(screen.getByLabelText(/api token/i), 'good-token')
  await userEvent.click(screen.getByRole('button', { name: /test connection/i }))
  expect(await screen.findByText(/connected/i)).toBeInTheDocument()
  expect(screen.getByTestId('tested')).toHaveTextContent('true')
})

test('failing token shows error and leaves tested=false', async () => {
  render(<Harness />)
  await userEvent.type(screen.getByLabelText(/api token/i), 'fail-token')
  await userEvent.click(screen.getByRole('button', { name: /test connection/i }))
  expect(await screen.findByText(/could not connect/i)).toBeInTheDocument()
  expect(screen.getByTestId('tested')).toHaveTextContent('false')
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/integrations/wizard/steps/StepConnect.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `mockValidate.ts`**

```ts
export function mockValidate(token: string): Promise<{ ok: boolean; error?: string }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (!token) resolve({ ok: false, error: 'Enter an API token.' })
      else if (token.includes('fail')) resolve({ ok: false, error: 'Could not connect. Check your token and region.' })
      else resolve({ ok: true })
    }, 500)
  })
}
```

- [ ] **Step 4: Implement `StepConnect.tsx`**

```tsx
import { useState } from 'react'
import type { WizardDraft } from '../draft'
import { mockValidate } from './mockValidate'
import { TextField } from '../../../../components/ui/TextField'
import { Select } from '../../../../components/ui/Select'
import { Button } from '../../../../components/ui/Button'

const REGIONS = [
  { value: 'global', label: 'Global' },
  { value: 'eu', label: 'EU' },
  { value: 'apac', label: 'APAC' },
]

export function StepConnect({ draft, setDraft }: { draft: WizardDraft; setDraft: React.Dispatch<React.SetStateAction<WizardDraft>> }) {
  const [testing, setTesting] = useState(false)
  const [error, setError] = useState<string>()

  const setConn = (patch: Partial<WizardDraft['connection']>) =>
    setDraft((d) => ({ ...d, connection: { ...d.connection, ...patch } }))

  const test = async () => {
    setTesting(true); setError(undefined)
    const res = await mockValidate(draft.connection.token)
    setTesting(false)
    if (res.ok) setConn({ tested: true })
    else { setConn({ tested: false }); setError(res.error) }
  }

  return (
    <div>
      <TextField label="API token" type="password" value={draft.connection.token}
        onChange={(v) => { setConn({ token: v, tested: false }); setError(undefined) }} placeholder="Paste your Mist API token" />
      <Select label="Region / cloud" value={draft.connection.region} onChange={(v) => setConn({ region: v, tested: false })} options={REGIONS} />
      <TextField label="Org ID (optional)" value={draft.connection.orgId} onChange={(v) => setConn({ orgId: v })} placeholder="e.g. 0000-aaaa" />
      <Button variant="ghost" disabled={!draft.connection.token || testing} onClick={test}>
        {testing ? 'Testing…' : 'Test connection'}
      </Button>
      {draft.connection.tested && !error && <p style={{ color: 'var(--green)' }}>✓ Connected</p>}
      {error && <p style={{ color: 'var(--red)' }}>{error}</p>}
    </div>
  )
}
```

- [ ] **Step 5: Render in `SetupWizard.tsx`** — replace `{step === 'connect' && <div data-testid="body-connect" />}` with:

```tsx
{step === 'connect' && <StepConnect draft={draft} setDraft={setDraft} />}
```
Add `import { StepConnect } from './steps/StepConnect'` at top.

- [ ] **Step 6: Run tests to verify they pass**

Run: `npx vitest run src/features/integrations/wizard/steps/StepConnect.test.tsx`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/features/integrations/wizard
git commit -m "feat: add wizard Connect step with mocked credential validation"
```

---

### Task 10: Wizard Step 2 — Select scope (tree + visual filter)

**Files:**
- Create: `src/features/integrations/wizard/steps/ScopeFilter.tsx`, `src/features/integrations/wizard/steps/ScopeTree.tsx`, `src/features/integrations/wizard/steps/StepScope.tsx`
- Modify: `src/features/integrations/wizard/SetupWizard.tsx` (render `<StepScope>` for `scope`)
- Test: `src/features/integrations/wizard/steps/StepScope.test.tsx`

**Interfaces:**
- Consumes: `getAvailableTree`, scope logic (`toggleOrg`/`toggleSite`/`toggleDevice`/`orgState`/`siteState`/`filterTree`), `Checkbox`.
- Produces:
  - `ScopeFilter({ query, mode, onQuery, onMode, error })` — text input + a Text/Regex toggle; shows `error` inline.
  - `ScopeTree({ tree, selection, onToggleOrg, onToggleSite, onToggleDevice })` — nested checkboxes; orgs and sites use indeterminate state from `orgState`/`siteState`.
  - `StepScope({ draft, setDraft })` — loads the full tree from `getAvailableTree(draft.type)`, holds local `query`/`mode` state, renders the **filtered** tree for display but always toggles against the **full** tree so selection is unaffected by filtering.

- [ ] **Step 1: Write failing test** `StepScope.test.tsx`

```tsx
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { expect, test } from 'vitest'
import { StepScope } from './StepScope'
import { initDraft, type WizardDraft } from '../draft'

function Harness() {
  const [draft, setDraft] = useState<WizardDraft>(() => initDraft('juniper-mist'))
  return <>
    <StepScope draft={draft} setDraft={setDraft} />
    <span data-testid="sites">{draft.scope.siteIds.join(',')}</span>
  </>
}

test('selecting an org selects its sites', async () => {
  render(<Harness />)
  await userEvent.click(screen.getByLabelText('Live Demo Org'))
  expect(screen.getByTestId('sites').textContent).toMatch(/s1/)
  expect(screen.getByTestId('sites').textContent).toMatch(/s2/)
})

test('text filter hides non-matching sites but keeps selection', async () => {
  render(<Harness />)
  await userEvent.click(screen.getByLabelText('Live Demo Org')) // select all
  await userEvent.type(screen.getByPlaceholderText(/filter/i), 'phoenix')
  expect(screen.queryByLabelText('sdwan_atlanta')).not.toBeInTheDocument()
  expect(screen.getByTestId('sites').textContent).toMatch(/s1/) // still selected
})

test('invalid regex shows inline error', async () => {
  render(<Harness />)
  await userEvent.click(screen.getByRole('button', { name: /regex/i }))
  await userEvent.type(screen.getByPlaceholderText(/filter/i), '(')
  expect(screen.getByText(/invalid regex/i)).toBeInTheDocument()
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/integrations/wizard/steps/StepScope.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `ScopeFilter.tsx`**

```tsx
export function ScopeFilter({
  query, mode, onQuery, onMode, error,
}: { query: string; mode: 'text' | 'regex'; onQuery: (v: string) => void; onMode: (m: 'text' | 'regex') => void; error?: string }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={query}
          placeholder="Filter sites and devices"
          onChange={(e) => onQuery(e.target.value)}
          style={{ flex: 1, padding: '8px 10px', background: 'var(--panel-2)', border: `1px solid ${error ? 'var(--red)' : 'var(--border)'}`, borderRadius: 'var(--radius)', color: 'var(--text)' }}
        />
        {(['text', 'regex'] as const).map((m) => (
          <button key={m} onClick={() => onMode(m)}
            style={{ padding: '0 12px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: mode === m ? 'var(--panel-2)' : 'transparent', color: mode === m ? 'var(--text)' : 'var(--muted)' }}>
            {m === 'text' ? 'Text' : 'Regex'}
          </button>
        ))}
      </div>
      {error && <small style={{ color: 'var(--red)' }}>{error}</small>}
    </div>
  )
}
```

- [ ] **Step 4: Implement `ScopeTree.tsx`**

```tsx
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
```

- [ ] **Step 5: Implement `StepScope.tsx`**

```tsx
import { useMemo, useState } from 'react'
import type { WizardDraft } from '../draft'
import { getAvailableTree } from '../../data/fixtures'
import { filterTree, toggleOrg, toggleSite, toggleDevice } from '../../logic/scope'
import { ScopeFilter } from './ScopeFilter'
import { ScopeTree } from './ScopeTree'

export function StepScope({ draft, setDraft }: { draft: WizardDraft; setDraft: React.Dispatch<React.SetStateAction<WizardDraft>> }) {
  const fullTree = useMemo(() => getAvailableTree(draft.type), [draft.type])
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState<'text' | 'regex'>('text')

  const { tree: shownTree, error } = filterTree(fullTree, query, mode)

  return (
    <div>
      <ScopeFilter query={query} mode={mode} onQuery={setQuery} onMode={setMode} error={error} />
      <ScopeTree
        tree={shownTree}
        fullTree={fullTree}
        selection={draft.scope}
        onToggleOrg={(orgId, c) => setDraft((d) => ({ ...d, scope: toggleOrg(fullTree, d.scope, orgId, c) }))}
        onToggleSite={(orgId, siteId, c) => setDraft((d) => ({ ...d, scope: toggleSite(fullTree, d.scope, orgId, siteId, c) }))}
        onToggleDevice={(orgId, siteId, deviceId, c) => setDraft((d) => ({ ...d, scope: toggleDevice(fullTree, d.scope, orgId, siteId, deviceId, c) }))}
      />
    </div>
  )
}
```

- [ ] **Step 6: Render in `SetupWizard.tsx`** — replace the `body-scope` placeholder with `{step === 'scope' && <StepScope draft={draft} setDraft={setDraft} />}` and add the import.

- [ ] **Step 7: Run tests to verify they pass**

Run: `npx vitest run src/features/integrations/wizard/steps/StepScope.test.tsx`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/features/integrations/wizard
git commit -m "feat: add wizard Scope step with nested tree and text/regex visual filter"
```

---

### Task 11: Wizard Step 3 — Name & settings

**Files:**
- Create: `src/features/integrations/wizard/steps/StepNameSettings.tsx`
- Modify: `src/features/integrations/wizard/SetupWizard.tsx` (render `<StepNameSettings>` for `name`)
- Test: `src/features/integrations/wizard/steps/StepNameSettings.test.tsx`

**Interfaces:**
- Produces: `StepNameSettings({ draft, setDraft })` — a **Display name** TextField (shows an error hint when empty) and an optional **Environment tag** TextField. No sync frequency.
- Consumes: `TextField`, `WizardDraft`.

- [ ] **Step 1: Write failing test** `StepNameSettings.test.tsx`

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { expect, test } from 'vitest'
import { StepNameSettings } from './StepNameSettings'
import { initDraft, type WizardDraft } from '../draft'

function Harness() {
  const [draft, setDraft] = useState<WizardDraft>(() => initDraft('juniper-mist'))
  return <>
    <StepNameSettings draft={draft} setDraft={setDraft} />
    <span data-testid="name">{draft.name}</span>
    <span data-testid="tag">{draft.environmentTag}</span>
  </>
}

test('prefills default name and edits name + tag', async () => {
  render(<Harness />)
  expect(screen.getByLabelText(/display name/i)).toHaveValue('Juniper Mist – Global')
  await userEvent.clear(screen.getByLabelText(/display name/i))
  await userEvent.type(screen.getByLabelText(/display name/i), 'My Mist')
  await userEvent.type(screen.getByLabelText(/environment tag/i), 'prod')
  expect(screen.getByTestId('name')).toHaveTextContent('My Mist')
  expect(screen.getByTestId('tag')).toHaveTextContent('prod')
})

test('empty name shows an error hint', async () => {
  render(<Harness />)
  await userEvent.clear(screen.getByLabelText(/display name/i))
  expect(screen.getByText(/name is required/i)).toBeInTheDocument()
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/integrations/wizard/steps/StepNameSettings.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `StepNameSettings.tsx`**

```tsx
import type { WizardDraft } from '../draft'
import { TextField } from '../../../../components/ui/TextField'

export function StepNameSettings({ draft, setDraft }: { draft: WizardDraft; setDraft: React.Dispatch<React.SetStateAction<WizardDraft>> }) {
  return (
    <div>
      <TextField
        label="Display name"
        value={draft.name}
        onChange={(v) => setDraft((d) => ({ ...d, name: v }))}
        error={draft.name.trim() ? undefined : 'Name is required'}
      />
      <TextField
        label="Environment tag (optional)"
        value={draft.environmentTag}
        onChange={(v) => setDraft((d) => ({ ...d, environmentTag: v }))}
        placeholder="e.g. prod, lab"
      />
    </div>
  )
}
```

- [ ] **Step 4: Render in `SetupWizard.tsx`** — replace the `body-name` placeholder with `{step === 'name' && <StepNameSettings draft={draft} setDraft={setDraft} />}` and add the import.

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run src/features/integrations/wizard/steps/StepNameSettings.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/features/integrations/wizard
git commit -m "feat: add wizard Name & settings step"
```

---

### Task 12: Wizard Step 4 (optional) — Tagging rules + live preview

**Files:**
- Create: `src/features/integrations/wizard/steps/RulePreview.tsx`, `src/features/integrations/wizard/steps/StepTaggingRules.tsx`
- Modify: `src/features/integrations/wizard/SetupWizard.tsx` (render `<StepTaggingRules>` for `tagging`)
- Test: `src/features/integrations/wizard/steps/StepTaggingRules.test.tsx`

**Interfaces:**
- Consumes: `matchTagging` (tagging logic), `getAvailableTree`, `WizardDraft`, `TaggingRule`, `TextField`, `Select`, `Button`.
- Produces:
  - `RulePreview({ rule, selection, tree })` — renders the count + names of selected sites/devices matching the rule (via `matchTagging`).
  - `StepTaggingRules({ draft, setDraft })` — list of rule rows (pattern TextField, target Select [sites/devices/both], tag TextField, Remove button), an "Add rule" button, and a `RulePreview` under each rule. New rule id is index-based (`'rule-' + draft.taggingRules.length`), deterministic. Empty list is valid (step is optional).

- [ ] **Step 1: Write failing test** `StepTaggingRules.test.tsx`

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { expect, test } from 'vitest'
import { StepTaggingRules } from './StepTaggingRules'
import { initDraft, type WizardDraft } from '../draft'
import { toggleOrg, emptySelection } from '../../logic/scope'
import { getAvailableTree } from '../../data/fixtures'

function Harness() {
  const tree = getAvailableTree('juniper-mist')
  const [draft, setDraft] = useState<WizardDraft>(() => ({ ...initDraft('juniper-mist'), scope: toggleOrg(tree, emptySelection(), 'o1', true) }))
  return <>
    <StepTaggingRules draft={draft} setDraft={setDraft} />
    <span data-testid="rules">{draft.taggingRules.length}</span>
  </>
}

test('add a rule and see matching selected sites in preview', async () => {
  render(<Harness />)
  await userEvent.click(screen.getByRole('button', { name: /add rule/i }))
  expect(screen.getByTestId('rules')).toHaveTextContent('1')
  await userEvent.type(screen.getByLabelText(/pattern/i), 'sdwan')
  // target defaults to sites; preview lists matching selected sites
  expect(await screen.findByText(/sdwan_atlanta/)).toBeInTheDocument()
  expect(screen.getByText(/sdwan_phoenix/)).toBeInTheDocument()
})

test('remove a rule', async () => {
  render(<Harness />)
  await userEvent.click(screen.getByRole('button', { name: /add rule/i }))
  await userEvent.click(screen.getByRole('button', { name: /remove/i }))
  expect(screen.getByTestId('rules')).toHaveTextContent('0')
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/integrations/wizard/steps/StepTaggingRules.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `RulePreview.tsx`**

```tsx
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
```

- [ ] **Step 4: Implement `StepTaggingRules.tsx`**

```tsx
import { useMemo } from 'react'
import type { WizardDraft } from '../draft'
import type { TaggingRule } from '../../types'
import { getAvailableTree } from '../../data/fixtures'
import { TextField } from '../../../../components/ui/TextField'
import { Select } from '../../../../components/ui/Select'
import { Button } from '../../../../components/ui/Button'
import { RulePreview } from './RulePreview'

const TARGETS = [
  { value: 'sites', label: 'Sites' },
  { value: 'devices', label: 'Devices' },
  { value: 'both', label: 'Both' },
]

export function StepTaggingRules({ draft, setDraft }: { draft: WizardDraft; setDraft: React.Dispatch<React.SetStateAction<WizardDraft>> }) {
  const tree = useMemo(() => getAvailableTree(draft.type), [draft.type])

  const update = (rules: TaggingRule[]) => setDraft((d) => ({ ...d, taggingRules: rules }))
  const addRule = () => update([...draft.taggingRules, { id: `rule-${draft.taggingRules.length}`, pattern: '', target: 'sites', tag: '' }])
  const patch = (id: string, p: Partial<TaggingRule>) => update(draft.taggingRules.map((r) => r.id === id ? { ...r, ...p } : r))
  const remove = (id: string) => update(draft.taggingRules.filter((r) => r.id !== id))

  return (
    <div>
      <p style={{ color: 'var(--muted)', marginTop: 0 }}>Optional — define regex rules to auto-tag your selected sites and devices.</p>
      {draft.taggingRules.map((rule) => (
        <div key={rule.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 12, marginBottom: 10 }}>
          <TextField label="Pattern (regex)" value={rule.pattern} onChange={(v) => patch(rule.id, { pattern: v })} placeholder="e.g. sdwan_.*" />
          <Select label="Target" value={rule.target} onChange={(v) => patch(rule.id, { target: v as TaggingRule['target'] })} options={TARGETS} />
          <TextField label="Tag" value={rule.tag} onChange={(v) => patch(rule.id, { tag: v })} placeholder="e.g. wan-edge" />
          <RulePreview rule={rule} selection={draft.scope} tree={tree} />
          <div style={{ marginTop: 8 }}><Button variant="ghost" onClick={() => remove(rule.id)}>Remove</Button></div>
        </div>
      ))}
      <Button variant="ghost" onClick={addRule}>+ Add rule</Button>
    </div>
  )
}
```

- [ ] **Step 5: Render in `SetupWizard.tsx`** — replace the `body-tagging` placeholder with `{step === 'tagging' && <StepTaggingRules draft={draft} setDraft={setDraft} />}` and add the import.

- [ ] **Step 6: Run tests to verify they pass**

Run: `npx vitest run src/features/integrations/wizard/steps/StepTaggingRules.test.tsx`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/features/integrations/wizard
git commit -m "feat: add optional tagging-rules step with live regex match preview"
```

---

### Task 13: Wizard Step 5 — Review + Success screen

**Files:**
- Create: `src/features/integrations/wizard/steps/StepReview.tsx`, `src/features/integrations/wizard/steps/WizardSuccess.tsx`
- Modify: `src/features/integrations/wizard/SetupWizard.tsx` (render `<StepReview>` for `review`; replace inline success with `<WizardSuccess>`; add `goTo`)
- Test: `src/features/integrations/wizard/steps/StepReview.test.tsx`

**Interfaces:**
- Consumes: `WizardDraft`, `deriveScopeSummary`, `getAvailableTree`, `useNavigate` (react-router), `Button`.
- Produces:
  - `StepReview({ draft, onEditStep })` where `onEditStep: (key: StepKey) => void` — read-only summary sections (Connection [masked token = `••••` + last 4], Scope [summary string], Name & tag, Tagging rules count/list) each with an "Edit" link calling `onEditStep('connect'|'scope'|'name'|'tagging')`.
  - `WizardSuccess({ name, scopeSummary, onViewDashboard, onDone })` — ✓ message, scope line, "View dashboard" + "Done" buttons.
- `SetupWizard` adds `goTo(key: StepKey) => setIndex(STEP_KEYS.indexOf(key))`, passes it to `StepReview`, and renders `WizardSuccess` in the `done` branch (View dashboard → `navigate('/')` then close; Done → `onComplete()` + close).

- [ ] **Step 1: Write failing test** `StepReview.test.tsx`

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import { StepReview } from './StepReview'
import { initDraft } from '../draft'

const draft = { ...initDraft('juniper-mist'), name: 'My Mist', connection: { token: 'abcd1234', region: 'global', orgId: '', tested: true }, scope: { orgIds: ['o1'], siteIds: ['s1'], deviceIds: [] } }

test('shows masked token and lets you jump to a step', async () => {
  const onEditStep = vi.fn()
  render(<StepReview draft={draft} onEditStep={onEditStep} />)
  expect(screen.getByText(/1234/)).toBeInTheDocument()
  expect(screen.queryByText('abcd1234')).not.toBeInTheDocument()
  await userEvent.click(screen.getAllByRole('button', { name: /edit/i })[0])
  expect(onEditStep).toHaveBeenCalled()
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/integrations/wizard/steps/StepReview.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `StepReview.tsx`**

```tsx
import type { WizardDraft, StepKey } from '../draft'
import { deriveScopeSummary } from '../../data/integrationsStore'
import { getAvailableTree } from '../../data/fixtures'

function Row({ label, children, onEdit }: { label: string; children: React.ReactNode; onEdit: () => void }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
      <div><div style={{ fontSize: 12, color: 'var(--muted)' }}>{label}</div><div>{children}</div></div>
      <button onClick={onEdit} style={{ background: 'none', border: 'none', color: 'var(--blue)' }}>Edit</button>
    </div>
  )
}

export function StepReview({ draft, onEditStep }: { draft: WizardDraft; onEditStep: (key: StepKey) => void }) {
  const summary = deriveScopeSummary(draft.scope, getAvailableTree(draft.type))
  const masked = draft.connection.token ? `••••${draft.connection.token.slice(-4)}` : '— (unchanged)'
  return (
    <div>
      <Row label="Connection" onEdit={() => onEditStep('connect')}>Token {masked} · {draft.connection.region.toUpperCase()}</Row>
      <Row label="Scope" onEdit={() => onEditStep('scope')}>{summary}</Row>
      <Row label="Name & tag" onEdit={() => onEditStep('name')}>{draft.name}{draft.environmentTag ? ` · ${draft.environmentTag}` : ''}</Row>
      <Row label="Tagging rules" onEdit={() => onEditStep('tagging')}>
        {draft.taggingRules.length ? draft.taggingRules.map((r) => `${r.tag} (/${r.pattern}/)`).join(', ') : 'None'}
      </Row>
    </div>
  )
}
```

- [ ] **Step 4: Implement `WizardSuccess.tsx`**

```tsx
import { Button } from '../../../../components/ui/Button'

export function WizardSuccess({
  name, scopeSummary, onViewDashboard, onDone,
}: { name: string; scopeSummary: string; onViewDashboard: () => void; onDone: () => void }) {
  return (
    <div data-testid="wizard-success" style={{ textAlign: 'center', padding: 16 }}>
      <div style={{ fontSize: 32, color: 'var(--green)' }}>✓</div>
      <h3>{name} connected</h3>
      <p style={{ color: 'var(--muted)' }}>Now monitoring {scopeSummary}.</p>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16 }}>
        <Button variant="ghost" onClick={onViewDashboard}>View dashboard</Button>
        <Button onClick={onDone}>Done</Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Update `SetupWizard.tsx`**

Add imports:
```tsx
import { useNavigate } from 'react-router-dom'
import { StepReview } from './steps/StepReview'
import { WizardSuccess } from './steps/WizardSuccess'
import { deriveScopeSummary } from '../data/integrationsStore'
import { getAvailableTree } from '../data/fixtures'
```
Add inside the component: `const navigate = useNavigate()` and `const goTo = (key: StepKey) => setIndex(STEP_KEYS.indexOf(key))`.
Replace the `done` branch body with:
```tsx
if (done) {
  return (
    <Modal open title="Done" onClose={() => { onComplete(); onClose() }}>
      <WizardSuccess
        name={draft.name}
        scopeSummary={deriveScopeSummary(draft.scope, getAvailableTree(draft.type))}
        onViewDashboard={() => { onComplete(); onClose(); navigate('/') }}
        onDone={() => { onComplete(); onClose() }}
      />
    </Modal>
  )
}
```
Replace the `body-review` placeholder with `{step === 'review' && <StepReview draft={draft} onEditStep={goTo} />}`.

> `SetupWizard.test.tsx` renders without a Router. Wrap its renders in `<MemoryRouter>` now that the wizard calls `useNavigate()`. Update the two existing tests accordingly.

- [ ] **Step 6: Run tests to verify they pass**

Run: `npx vitest run src/features/integrations/wizard`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/features/integrations/wizard
git commit -m "feat: add wizard Review step and success screen"
```

---

### Task 14: Delete dialog, edit wiring, and full-flow test

**Files:**
- Create: `src/features/integrations/components/DeleteDialog.tsx`
- Modify: `src/features/integrations/IntegrationsPage.tsx` (use `DeleteDialog`; ensure route render is wrapped by Router in tests)
- Test: `src/features/integrations/IntegrationsPage.test.tsx` (unskip delete test, add edit test)

**Interfaces:**
- Consumes: `Modal`, `Button`, `Integration`.
- Produces: `DeleteDialog({ integration, onCancel, onConfirm })` — confirmation copy naming the integration; Cancel / Delete (danger) buttons.

- [ ] **Step 1: Write/again-enable failing tests** in `IntegrationsPage.test.tsx`

Wrap the page renders in `<MemoryRouter>` (the wizard uses `useNavigate`). Unskip the delete test and add:
```tsx
import { MemoryRouter } from 'react-router-dom'

const renderPage = () => render(<MemoryRouter><IntegrationsPage /></MemoryRouter>)

test('delete asks for confirmation, then removes and shows empty state', async () => {
  seed()
  renderPage()
  await userEvent.click(screen.getByRole('button', { name: /delete/i }))
  expect(screen.getByText(/this can.?t be undone/i)).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: /^delete$/i }))
  expect(screen.getByText(/connect your first integration/i)).toBeInTheDocument()
})

test('edit opens the wizard on the Review step prefilled', async () => {
  seed()
  renderPage()
  await userEvent.click(screen.getByRole('button', { name: /edit/i }))
  expect(screen.getByText('Edit integration')).toBeInTheDocument()
  expect(screen.getByText(/Live Demo Org/)).toBeInTheDocument() // shown in review summary
})
```
(Replace earlier `render(<IntegrationsPage />)` calls with `renderPage()`.)

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/features/integrations/IntegrationsPage.test.tsx`
Expected: FAIL — no confirmation copy / DeleteDialog missing.

- [ ] **Step 3: Implement `DeleteDialog.tsx`**

```tsx
import type { Integration } from '../types'
import { Modal } from '../../../components/ui/Modal'
import { Button } from '../../../components/ui/Button'

export function DeleteDialog({
  integration, onCancel, onConfirm,
}: { integration: Integration; onCancel: () => void; onConfirm: () => void }) {
  return (
    <Modal
      open
      title="Delete integration"
      onClose={onCancel}
      footer={<>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button variant="danger" onClick={onConfirm}>Delete</Button>
      </>}
    >
      <p>Delete <strong>{integration.name}</strong>? This removes the integration and its tagging rules. This can't be undone.</p>
    </Modal>
  )
}
```

- [ ] **Step 4: Wire `DeleteDialog` into `IntegrationsPage.tsx`** — replace the temporary inline delete `<div role="dialog">…</div>` with:

```tsx
import { DeleteDialog } from './components/DeleteDialog'
// ...
{deleteTarget && (
  <DeleteDialog
    integration={deleteTarget}
    onCancel={() => setDeleteTarget(null)}
    onConfirm={confirmDelete}
  />
)}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run src/features/integrations`
Expected: PASS (all tests, none skipped).

- [ ] **Step 6: Full suite + typecheck + build**

Run: `npx vitest run && npm run build`
Expected: all tests PASS; `tsc` clean; Vite emits `dist/`.

- [ ] **Step 7: Commit**

```bash
git add src/features/integrations
git commit -m "feat: add delete confirmation dialog and edit wiring; enable full integrations tests"
```

---

## Self-Review

**Spec coverage:**
- New "Integrations" tab under Juniper Mist → Task 3 (sidebar) + Task 6 (route).
- List page populated/empty, status pill, scope summary, edit/delete actions → Tasks 6, 14.
- Catalog with real + coming-soon → Task 7.
- Multi-step wizard Connect→Scope→Name→Tagging(optional)→Review→Success → Tasks 8–13.
- Scope Orgs→Sites→Devices + text/regex visual-only filter → Tasks 5, 10.
- Tagging rules with preview against Step-2 selection → Tasks 5, 12.
- No sync frequency → Task 11 (omitted by design).
- Edit prefilled on Review; Delete with confirm + empty-state fallback → Tasks 8, 13, 14.
- localStorage persistence + mock validation/data → Tasks 4, 9.
- AWS Amplify deploy (`amplify.yml`) → Task 1; SPA rewrite is an Amplify console rule (documented in spec, not a repo file).

**Placeholder scan:** No "TBD"/"implement later". Intra-plan placeholders (`body-*` testids, temporary inline delete dialog) are explicitly created and later replaced within named tasks.

**Type consistency:** `WizardDraft`, `ScopeSelection`, `TaggingRule`, `Integration`, `StepKey` used consistently. Store signatures (`createIntegration`/`updateIntegration`/`removeIntegration`/`deriveScopeSummary`) match across Tasks 4, 6, 8, 13, 14. Scope helper names (`toggleOrg`/`toggleSite`/`toggleDevice`/`orgState`/`siteState`/`filterTree`) match across Tasks 5, 10, 12.

**Determinism:** No `Date.now()`/`Math.random()` in source — ids are index-derived; `lastSyncedAt` is a fixed ISO string; "2 min ago" is a static label.
