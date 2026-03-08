# Frontend Rewrite Plan

This document records the current plan for rewriting `website/` onto a more modern frontend stack without prematurely extracting or rewriting everything at once.

It exists so future agent runs and contributors can use a shared baseline instead of re-deriving the package boundaries and migration order.

Use the task lists below to track progress as the rewrite plan turns into implementation work.

## Status snapshot

- [x] `@nusmods/types` exists in `packages/types`.
- [x] `website/` depends on `@nusmods/types` via the workspace and local path aliases.
- [x] Several `website/src/types/*` modules are now compatibility re-exports from `@nusmods/types`.
- [x] `export/src/types.ts` now consumes shared export-facing types from `@nusmods/types`.
- [ ] Export runtime validation and parsing logic still live only in `export/`.
- [ ] `@nusmods/api-client`, `@nusmods/timetable-core`, `@nusmods/planner-core`, `@nusmods/export-contract`, and `@nusmods/timetable-ui` do not exist yet.

## Current state

- The repo is already a monorepo via `pnpm` workspaces.
- `website/` is a legacy SPA built around Webpack, React Router 5, Redux, Redux Persist, and a large `src/` tree with app shell code mixed with reusable domain logic.
- `@nusmods/types` has already been extracted and wired into `website/` as a workspace package.
- `website/src/types/apps.ts`, `contributor.ts`, `export.ts`, `facultyEmail.ts`, `modules.ts`, `mpe.ts`, `timetables.ts`, and `venues.ts` are already thin re-export shims.
- `export/` now reads shared export-facing types from `@nusmods/types`, but its validation and parsing rules are still app-local.
- `packages/nusmoderator` proves this repo already supports internal and publishable shared packages.

## Non-goals

- Do not restart the package extraction effort from scratch.
- Do not add Turborepo yet.
- Do not package legacy Redux selectors, reducers, or Searchkit-era UI abstractions as long-term shared APIs.
- Do not rewrite the entire frontend in one step.

## Tooling decision

Turborepo is not required before splitting code out of `website/`.

Why:

- `pnpm-workspace.yaml` already gives local workspace linking.
- The harder problem right now is package boundaries, not task orchestration.
- Adding Turborepo before the package layout is proven would optimize the wrong layer.

When Turborepo may be useful later:

- CI becomes slow or noisy across many packages.
- Build, test, and lint orchestration needs dependency-aware pipelines.
- Cached task execution starts to materially improve iteration speed.

## Working model

Treat `website/` as two things:

1. An app shell
2. A domain core that should eventually be shared

### App shell

This should stay app-local during the rewrite:

- Routing
- Page layout
- Feature flags
- Browser storage wiring
- App-specific state management
- Old Redux actions / reducers / selectors
- Searchkit wrappers and search UI integration
- Static and marketing pages

### Domain core

This is the part worth extracting into standalone packages:

- Shared type definitions
- Data access clients
- Timetable logic
- Planner logic
- Export contract and validation
- Possibly UI primitives later, but only after the domain packages are stable

## Proposed package boundaries

These are the intended package seams. They should be treated as planning targets, not immediate implementation work.

### `@nusmods/types`

Status:

- Initial package extraction is already done.
- `website/` is already consuming this package.
- `export/` is now also consuming shared export-facing types from this package.
- The remaining work is to finish migrating any shared types and contracts that still live only in app-local code.

Purpose:

- Shared type definitions
- Schema validation
- Stable cross-package types

Likely source material:

- `website/src/types/modules.ts`
- `website/src/types/timetables.ts`
- `website/src/types/planner.ts`
- `website/src/types/export.ts`
- Other cross-runtime types currently imported by both browser and server code

Why first:

- `export/` currently duplicates website types
- Other extractions become cleaner once types are centralized

Remaining work:

- [x] Move `website/src/types/export.ts` into a shared package boundary or merge it into the existing types package if that stays small.
- [x] Remove the duplicated export-related types from `export/src/types.ts`.
- [ ] Decide whether compatibility re-export shims in `website/src/types/*` stay temporarily or get removed as imports are migrated.

### `@nusmods/api-client`

Status:

- Not started.
- `website/src/apis/nusmods.js` is still the legacy app-local API client and still reads config directly.

Purpose:

- Typed clients for NUSMods and related APIs
- Endpoint construction
- Transport helpers that are independent of Redux

Likely source material:

- `website/src/apis/nusmods.js`
- `website/src/apis/mpe.ts`
- `website/src/apis/export.ts`
- Optionally weather / nextbus / GitHub feedback clients if they survive the rewrite

What should not move into this package:

- Redux thunk wrappers
- Store-aware caching logic
- Request status reducer conventions

### `@nusmods/timetable-core`

Status:

- Not started.

Purpose:

- Pure timetable domain logic
- Lesson hydration and arrangement
- Clash detection
- Color assignment
- Serialization helpers
- Calendar / ICS helpers

Likely source material:

- `website/src/utils/timetables.ts`
- `website/src/utils/modules.ts`
- `website/src/utils/colors.ts`
- `website/src/utils/ical.ts`
- Some related data helpers

Refactors expected before extraction:

- Remove React-specific formatting helpers from otherwise pure code
- Remove direct `config` access where inputs should be explicit
- Remove selector coupling from export helpers

### `@nusmods/planner-core`

Status:

- Not started.

Purpose:

- Prerequisite evaluation
- Planner conflict logic
- Planner-specific pure transformations

Likely source material:

- `website/src/utils/planner.ts`
- Pure parts currently embedded in `website/src/selectors/planner.ts`

What to avoid:

- Do not package Redux selectors as the public interface
- Convert them into pure functions over plain inputs first

### `@nusmods/export-contract`

Status:

- Partially started through `@nusmods/types`.
- Shared export payload types now live in `@nusmods/types`, but validation and serialization rules are still split across app-local code.

Purpose:

- Shared export payload types
- Runtime validation for export payloads
- Serialization / parsing rules shared by `website` and `export`

Likely source material:

- `website/src/types/export.ts`
- `website/src/utils/export.ts`
- `export/src/data.ts`
- Shared export-facing types in `packages/types/src/export.ts`

Note:

- This can come after `types` and `timetable-core`
- It may end up being merged into `@nusmods/types` if the surface area stays small

### `@nusmods/timetable-ui` (Optional, Later)

Status:

- Not started.

Purpose:

- Reusable timetable presentation primitives
- Renderer components shared between the new frontend and export rendering

Likely source material:

- Presentational parts of the timetable UI
- Only after container logic is separated from view logic

Why later:

- Current timetable UI is still entangled with Redux actions and app behavior
- Packaging the current container layer would preserve legacy assumptions

## Areas that should not become shared packages

These are implementation details of the old frontend and should generally remain local to `website/` or be rewritten outright in the new app:

- `website/src/actions`
- `website/src/reducers`
- Most of `website/src/selectors`
- `website/src/storage`
- Searchkit integration and wrapper components
- React Router specific components
- App bootstrapping and webpack entrypoints

## Migration phases

### Phase 1: Boundary hardening

Status:

- Largely complete for the initial extraction wave.
- The repo now has a clear split between app-shell concerns and shared type definitions, and that was enough to extract `@nusmods/types`.
- Remaining boundary work is now package-specific follow-up for `api-client`, `timetable-core`, and `export-contract`, not first-pass discovery.

Goal:

Confirm package boundaries before moving files.

Tasks:

- [x] Inventory the initial candidate files for shared type extraction.
- [x] Identify which imports are pure domain logic vs app shell concerns at a high level.
- [x] Document the first-pass boundaries between app shell and shared domain code.
- [ ] Do the same package-specific dependency and boundary review for `@nusmods/api-client`, `@nusmods/timetable-core`, and `@nusmods/export-contract`.

Exit criteria:

- [x] The initial extraction boundaries are documented.
- [x] `@nusmods/types` has a stable initial public surface.
- [ ] The remaining package candidates have stable intended public APIs before extraction starts.

### Phase 2: Contract-first preparation

Status:

- In progress.
- `@nusmods/types` exists and is already consumed by `website/`.
- `export/` now also consumes shared export-facing types from `@nusmods/types`.
- Contract centralization is only partially complete because runtime validation and parsing rules have not been introduced as a shared contract layer.

Goal:

Define shared types that both old and new runtimes can consume.

Tasks:

- [x] Extract shared type definitions into `@nusmods/types`.
- [x] Wire `website/` to consume shared types via the workspace package and compatibility re-export shims.
- [x] Move the initial export-related shared types into a single shared contract boundary.
- [ ] Add runtime validation where data crosses process boundaries.
- [x] Remove the remaining duplicated cross-runtime type definitions from `export/`.

Exit criteria:

- [x] Shared cross-runtime types are defined in one place.
- [x] `export/` no longer needs to maintain duplicated website types.

### Phase 3: Core logic decoupling

Status:

- Not started.

Goal:

Make timetable and planner logic independent of React and Redux.

Tasks:

- [ ] Convert selector-embedded logic into plain functions.
- [ ] Replace direct config reads with explicit parameters where appropriate.
- [ ] Isolate domain logic from store shape assumptions.

Exit criteria:

- [ ] Timetable and planner tests can run without importing React or Redux.

### Phase 4: Data access split

Status:

- Not started.

Goal:

Separate transport and endpoint logic from state management.

Tasks:

- [ ] Expose typed client functions from a shared package.
- [ ] Keep app-specific caching and async orchestration in the consuming app.

Exit criteria:

- [ ] The new frontend can call shared API clients without importing old Redux action code.

### Phase 5: Export boundary cleanup

Status:

- Partially complete.
- Shared export payload types are centralized, but validation and serialization logic are still not shared.

Goal:

Share one export contract across browser and server rendering.

Tasks:

- [ ] Unify export payload validation and parsing rules.
- [ ] Decide whether export shares contract only or also timetable UI primitives.

Exit criteria:

- [ ] Export payload parsing and serialization are defined once.

### Phase 6: New frontend spike

Status:

- Not started.

Goal:

Prove the new frontend can consume the extracted packages.

Recommended scope:

- [ ] Module page or timetable page.

Tasks:

- [ ] Build one vertical slice using the new stack.
- [ ] Validate routing, data fetching, rendering strategy, and package ergonomics.

Exit criteria:

- [ ] At least one meaningful page works against shared packages without reaching into `website/src/*`.

## Recommended extraction order

- [x] `@nusmods/types`
- [ ] `@nusmods/api-client`
- [ ] `@nusmods/timetable-core`
- [ ] `@nusmods/planner-core`
- [ ] `@nusmods/export-contract`
- [ ] New frontend shell
- [ ] `@nusmods/timetable-ui` if still justified

## Validation checkpoints

Use these checkpoints to decide whether the migration is moving in the right direction:

- [ ] Shared packages do not import React, Redux, React Router, or Searchkit unless explicitly intended.
- [x] `export/` stops duplicating shared types.
- [ ] The new frontend can consume shared packages without importing from `website/src/*`.
- [ ] The legacy app continues to run during the migration.
- [ ] Public package APIs are smaller and simpler than the old internal module graph.

## Risks

### Packaging the wrong abstractions

Risk:

- Selectors, reducers, or Searchkit wrappers become de facto long-term APIs

Mitigation:

- Only package plain types, core logic, and transport clients

### Preserving legacy store shape

Risk:

- The new frontend is forced to mirror the old Redux state model

Mitigation:

- Convert reusable logic to plain functions over explicit inputs

### Moving UI too early

Risk:

- Large React component trees get extracted before their dependencies are stabilized

Mitigation:

- Package types and domain logic first
- Defer shared UI until a real cross-runtime need remains after refactoring

## Recommended next deliverable

Because `@nusmods/types` already exists, the next concrete planning deliverable should be a dependency matrix for the next extraction candidates:

- [ ] `@nusmods/api-client`
- [ ] `@nusmods/timetable-core`
- [ ] `@nusmods/export-contract`

That matrix should list:

- [ ] Candidate source files.
- [ ] Current imports that create coupling.
- [ ] Required refactors before extraction.
- [ ] Intended public API for each package.
