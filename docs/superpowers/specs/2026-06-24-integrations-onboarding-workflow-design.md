# Integrations Onboarding Workflow — Design

**Date:** 2026-06-24
**Status:** Approved design (pending spec review)
**Repo:** `onboarding` (UI-only prototype)

## Overview

A UI-only onboarding workflow for connecting and managing third-party
network integrations (e.g. Juniper Mist) inside the existing
network-monitoring dashboard. Covers first-time setup, adding additional
integrations, editing, and deleting. There is **no backend** — all behavior
(credential validation, available scope, persistence) is mocked client-side.

## Goals

- Let a user connect their first integration from an empty state.
- Let a user add more integrations from a catalog.
- Let a user edit and delete existing integrations.
- Feel real enough for a product demo (fake validation delays, canned data,
  persistence across refresh).

## Non-Goals

- No real API calls, authentication, or data sync.
- No server, database, or build-time secrets.
- No changes to the existing dashboard panels themselves.

## Placement & Navigation

A new **"Integrations"** tab is added to the left sidebar in the "Integrate"
section, under the Juniper Mist area. Selecting it opens the **Integrations
List Page**, which is the home base for the entire workflow. The catalog,
wizard, edit, and delete flows all launch from this page.

## Tech & Architecture

- **Stack:** React + Vite + TypeScript.
- **Styling:** Matches the existing dark dashboard aesthetic (dark slate
  background, subtle card borders, green/amber/red status accents). A small
  set of shared UI primitives (Button, Modal, StatusPill, etc.).
- **State:** Local React state within the integrations feature; the list of
  connected integrations is the single source of truth.
- **Persistence:** Connected integrations are saved to `localStorage` so the
  demo survives page refreshes. A mock service layer wraps reads/writes so the
  UI is agnostic to where data lives (swap for a real API later).
- **Mocking:** Credential validation and "available scope" (orgs → sites →
  devices) are served from canned fixtures with artificial delays.

## Surface 1 — Integrations List Page

The landing surface of the Integrations tab. Doubles as the management hub and
the first-time onboarding launchpad (no separate first-run screen).

**Populated state:**
- Header: title "Integrations" + primary **"+ Add integration"** button.
- One row per connected integration showing:
  - Logo + user-given name (e.g. "Live Demo Org")
  - Type (e.g. "Juniper Mist")
  - Status pill: green **Connected**, grey **Syncing**, red **Error** (mocked)
  - Scope summary (e.g. "3 orgs · 12 sites")
  - Last synced (relative time, e.g. "2 min ago")
  - **Edit** and **Delete** actions at the end of the row
- Rows are informational; all actions live in Edit/Delete (no clickable detail
  view — kept out of scope).

**Empty (first-time) state:**
- Replaces the list area with a centered empty state: headline "Connect your
  first integration," one line of context, and a prominent **"Browse catalog"**
  / "+ Add integration" button. This is the first-time onboarding entry point.

**Transitions:**
- Finish wizard → new row appears at top with a brief "Connected" highlight.
- Edit → row updates in place.
- Delete (confirmed) → row removed; if last one, page falls back to empty state.

## Surface 2 — Integration Catalog

Opens from "+ Add integration" (modal or page). A gallery of integration cards.

- A few types are **real** and clickable into their setup wizard (Juniper Mist
  plus 2–3 others).
- Remaining types render greyed-out with a **"Coming soon"** label and are not
  clickable.
- Each card shows logo, name, and a one-line description.

## Surface 3 — Setup Wizard

Launches when a real integration is picked from the catalog. A modal/full-page
flow with a step progress indicator. The **same component** powers first-time
setup, "add another," and Edit (pre-filled). State lives in the wizard until the
final "Connect integration," then is written to the integrations store.

**Step 1 — Connect**
Connection credentials for the chosen type. For Juniper Mist: **API token**,
**Region/cloud** (Global / EU / APAC), optional **Org ID**. A **"Test
connection"** button runs mocked validation (1–2s spinner → success check, or a
sample error to demo failure handling). Cannot advance until "connected."

**Step 2 — Select scope**
A three-level nested checklist: **Orgs → Sites → Devices**. Expand an org to see
its sites; expand a site to see its devices. Selecting a parent selects its
children. A **text filter box** at the top does **visual filtering only** — it
narrows which rows are shown (matching typed text against site/device names) but
never changes selection. Clearing the filter restores the full tree with
selections intact. Selections here drive the list-page scope summary and the
Step 4 tagging preview.

**Step 3 — Name & settings**
A **display name** (pre-filled with a sensible default, e.g. "Juniper Mist –
Global") and an **optional environment tag**. No sync frequency.

**Step 4 (optional) — Tagging rules**
Define **regex-based tagging rules** for sites/devices. Each rule is a row:
- a **regex pattern**
- a **target**: sites / devices / both
- a **tag** applied when a name matches

Users can add and remove multiple rules. A **live preview** shows which of the
**Step 2 selected** sites/devices match each rule (evaluated against the canned
names of the current selection — updates if the selection changes). This step is
**skippable**: a "Skip" link sits alongside Next, and the progress indicator
marks it optional.

**Step 5 — Review**
Read-only summary of all choices (type, masked token, region, selected scope,
name, tag, tagging rules). Each section has an "Edit" link that jumps back to
that step. Primary button: **"Connect integration."**

**Success state**
Confirmation screen: ✓ "<Type> connected," a scope line ("Now monitoring 3 orgs
· 12 sites"), and **"View dashboard"** / **"Done"** buttons. "Done" returns to
the list with the new row highlighted.

**Wizard mechanics:** Back/Next navigation, per-step validation gating, and
close-mid-flow shows a "discard setup?" confirm.

## Surface 4 — Edit & Delete

**Edit** — from a row's Edit button, reopens the same wizard **pre-filled** with
the integration's saved values (connection, scope tree with prior selections,
name/tag, tagging rules). Opens on the **Review step** so everything is visible
at a glance; the user can jump to any step to change it. Saving writes back to
the existing integration (updates the row in place) rather than creating a new
one.

**Delete** — from the row's Delete/trash action, opens a **confirmation dialog**
("Delete *<name>*? This removes the integration and its tagging rules. This
can't be undone.") with Cancel / Delete. Confirming removes the row; if it was
the last one, the page falls back to the empty state.

## Data Model & Mock Persistence

```ts
type IntegrationStatus = 'connected' | 'syncing' | 'error'

interface TaggingRule {
  id: string
  pattern: string                 // regex source
  target: 'sites' | 'devices' | 'both'
  tag: string
}

interface ScopeSelection {
  orgIds: string[]
  siteIds: string[]
  deviceIds: string[]
}

interface Integration {
  id: string
  type: string                    // e.g. 'juniper-mist'
  name: string                    // user-given display name
  environmentTag?: string
  status: IntegrationStatus
  connection: {                   // masked/partial for display
    region: string
    orgId?: string
    tokenLast4?: string
  }
  scope: ScopeSelection
  taggingRules: TaggingRule[]
  scopeSummary: string            // derived, e.g. "3 orgs · 12 sites"
  lastSyncedAt: string            // ISO; rendered relative
}
```

- A mock service module (`integrationsStore`) exposes `list()`, `get(id)`,
  `create(draft)`, `update(id, draft)`, `remove(id)` backed by `localStorage`.
- Canned fixtures provide the catalog definitions and the available
  orgs/sites/devices tree per integration type.
- `lastSyncedAt` / status are seeded and can be left static for the demo.

## Component Breakdown

- `IntegrationsPage` — routing + populated/empty state switch.
- `IntegrationList` / `IntegrationRow` — rows with status pill + actions.
- `EmptyState` — first-time prompt.
- `CatalogModal` / `CatalogCard` — gallery, real vs. coming-soon.
- `SetupWizard` — step orchestration, validation gating, draft state.
  - `StepConnect`, `StepScope` (with `ScopeTree` + `ScopeFilter`),
    `StepNameSettings`, `StepTaggingRules` (with `RulePreview`), `StepReview`,
    `WizardSuccess`.
- `DeleteDialog` — confirmation.
- Shared primitives: `Button`, `Modal`, `StatusPill`, `ProgressSteps`,
  `TextField`, `Select`, `Checkbox`.
- `integrationsStore` + fixtures — mock data/persistence layer.

## Open Questions / Resolved Decisions

- **Resolved:** Catalog has a few real integration types; the rest are
  "coming soon."
- **Resolved:** Multi-step wizard (Connect → Scope → Name → Tagging(optional) →
  Review → Success).
- **Resolved:** Scope is Orgs → Sites → Devices; filter is visual-only.
- **Resolved:** No sync frequency.
- **Resolved:** Tagging preview matches against the Step 2 selection only.
- **Resolved:** Edit opens the wizard on the Review step, pre-filled.
- **Resolved:** Placement is a new "Integrations" tab under Juniper Mist.
