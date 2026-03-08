# Frontend Rewrite Plan

This document records the current plan for rewriting `website/` onto a more modern frontend stack without prematurely extracting or rewriting everything at once.

It exists so future agent runs and contributors can use a shared baseline instead of re-deriving the package boundaries and migration order.

## Current State

- The repo is already a monorepo via `pnpm` workspaces.
- `website/` is a legacy SPA built around Webpack, React Router 5, Redux, Redux Persist, and a large `src/` tree with app shell code mixed with reusable domain logic.
- `export/` already duplicates some `website/` types, which is a strong signal that some shared packages should exist.
- `packages/nusmoderator` proves this repo already supports internal and publishable shared packages.

## Non-Goals

- Do not extract packages yet.
- Do not add Turborepo yet.
- Do not package legacy Redux selectors, reducers, or Searchkit-era UI abstractions as long-term shared APIs.
- Do not rewrite the entire frontend in one step.

## Tooling Decision

Turborepo is not required before splitting code out of `website/`.

Why:

- `pnpm-workspace.yaml` already gives local workspace linking.
- The harder problem right now is package boundaries, not task orchestration.
- Adding Turborepo before the package layout is proven would optimize the wrong layer.

When Turborepo may be useful later:

- CI becomes slow or noisy across many packages.
- Build, test, and lint orchestration needs dependency-aware pipelines.
- Cached task execution starts to materially improve iteration speed.

## Working Model

Treat `website/` as two things:

1. An app shell
2. A domain core that should eventually be shared

### App Shell

This should stay app-local during the rewrite:

- routing
- page layout
- feature flags
- browser storage wiring
- app-specific state management
- old Redux actions / reducers / selectors
- Searchkit wrappers and search UI integration
- static and marketing pages

### Domain Core

This is the part worth extracting into standalone packages:

- shared types and types
- data access clients
- timetable logic
- planner logic
- export contract and validation
- possibly UI primitives later, but only after the domain packages are stable

## Proposed Package Boundaries

These are the intended package seams. They should be treated as planning targets, not immediate implementation work.

### `@nusmods/types`

Purpose:

- shared type definitions
- schema validation
- stable cross-package types

Likely source material:

- `website/src/types/modules.ts`
- `website/src/types/timetables.ts`
- `website/src/types/planner.ts`
- `website/src/types/export.ts`
- other cross-runtime types currently imported by both browser and server code

Why first:

- `export/` currently duplicates website types
- other extractions become cleaner once types are centralized

### `@nusmods/api-client`

Purpose:

- typed clients for NUSMods and related APIs
- endpoint construction
- transport helpers that are independent of Redux

Likely source material:

- `website/src/apis/nusmods.js`
- `website/src/apis/mpe.ts`
- `website/src/apis/export.ts`
- optionally weather / nextbus / GitHub feedback clients if they survive the rewrite

What should not move into this package:

- Redux thunk wrappers
- store-aware caching logic
- request status reducer conventions

### `@nusmods/timetable-core`

Purpose:

- pure timetable domain logic
- lesson hydration and arrangement
- clash detection
- color assignment
- serialization helpers
- calendar / ICS helpers

Likely source material:

- `website/src/utils/timetables.ts`
- `website/src/utils/modules.ts`
- `website/src/utils/colors.ts`
- `website/src/utils/ical.ts`
- some related data helpers

Refactors expected before extraction:

- remove React-specific formatting helpers from otherwise pure code
- remove direct `config` access where inputs should be explicit
- remove selector coupling from export helpers

### `@nusmods/planner-core`

Purpose:

- prerequisite evaluation
- planner conflict logic
- planner-specific pure transformations

Likely source material:

- `website/src/utils/planner.ts`
- pure parts currently embedded in `website/src/selectors/planner.ts`

What to avoid:

- do not package Redux selectors as the public interface
- convert them into pure functions over plain inputs first

### `@nusmods/export-contract`

Purpose:

- shared export payload types
- runtime validation for export payloads
- serialization / parsing rules shared by `website` and `export`

Likely source material:

- `website/src/types/export.ts`
- `website/src/utils/export.ts`
- `export/src/data.ts`
- duplicated types in `export/src/types.ts`

Note:

- this can come after `types` and `timetable-core`
- it may end up being merged into `@nusmods/types` if the surface area stays small

### `@nusmods/timetable-ui` (Optional, Later)

Purpose:

- reusable timetable presentation primitives
- renderer components shared between the new frontend and export rendering

Likely source material:

- presentational parts of the timetable UI
- only after container logic is separated from view logic

Why later:

- current timetable UI is still entangled with Redux actions and app behavior
- packaging the current container layer would preserve legacy assumptions

## Areas That Should Not Become Shared Packages

These are implementation details of the old frontend and should generally remain local to `website/` or be rewritten outright in the new app:

- `website/src/actions`
- `website/src/reducers`
- most of `website/src/selectors`
- `website/src/storage`
- Searchkit integration and wrapper components
- React Router specific components
- app bootstrapping and webpack entrypoints

## Migration Phases

### Phase 1: Boundary Hardening

Goal:

- confirm package boundaries before moving files

Tasks:

- inventory dependencies of candidate package files
- identify which imports are pure domain logic vs app shell concerns
- list config and React leaks that need to be inverted

Exit criteria:

- package candidates have stable intended public APIs
- no extraction has started yet

### Phase 2: Contract-First Preparation

Goal:

- define shared types that both old and new runtimes can consume

Tasks:

- centralize shared types
- add runtime validation where data crosses process boundaries
- remove duplicated cross-runtime type definitions

Exit criteria:

- `export/` no longer needs to maintain duplicated website types

### Phase 3: Core Logic Decoupling

Goal:

- make timetable and planner logic independent of React and Redux

Tasks:

- convert selector-embedded logic into plain functions
- replace direct config reads with explicit parameters where appropriate
- isolate domain logic from store shape assumptions

Exit criteria:

- timetable and planner tests can run without importing React or Redux

### Phase 4: Data Access Split

Goal:

- separate transport and endpoint logic from state management

Tasks:

- expose typed client functions from a shared package
- keep app-specific caching and async orchestration in the consuming app

Exit criteria:

- the new frontend can call shared API clients without importing old Redux action code

### Phase 5: Export Boundary Cleanup

Goal:

- share one export contract across browser and server rendering

Tasks:

- unify export payload shape and validation
- decide whether export shares contract only or also timetable UI primitives

Exit criteria:

- export payload parsing and serialization are defined once

### Phase 6: New Frontend Spike

Goal:

- prove the new frontend can consume the extracted packages

Recommended scope:

- module page or timetable page

Tasks:

- build one vertical slice using the new stack
- validate routing, data fetching, rendering strategy, and package ergonomics

Exit criteria:

- at least one meaningful page works against shared packages without reaching into `website/src/*`

## Recommended Extraction Order

1. `@nusmods/types`
2. `@nusmods/api-client`
3. `@nusmods/timetable-core`
4. `@nusmods/planner-core`
5. `@nusmods/export-contract`
6. new frontend shell
7. `@nusmods/timetable-ui` if still justified

## Validation Checkpoints

Use these checkpoints to decide whether the migration is moving in the right direction:

- shared packages do not import React, Redux, React Router, or Searchkit unless explicitly intended
- `export/` stops duplicating shared types
- the new frontend can consume shared packages without importing from `website/src/*`
- the legacy app continues to run during the migration
- public package APIs are smaller and simpler than the old internal module graph

## Risks

### Packaging the Wrong Abstractions

Risk:

- selectors, reducers, or Searchkit wrappers become de facto long-term APIs

Mitigation:

- only package plain types, core logic, and transport clients

### Preserving Legacy Store Shape

Risk:

- the new frontend is forced to mirror the old Redux state model

Mitigation:

- convert reusable logic to plain functions over explicit inputs

### Moving UI Too Early

Risk:

- large React component trees get extracted before their dependencies are stabilized

Mitigation:

- package types and domain logic first
- defer shared UI until a real cross-runtime need remains after refactoring

## Recommended First Deliverable

Before any extraction work starts, produce a dependency matrix for the first package candidates:

- `@nusmods/types`
- `@nusmods/api-client`
- `@nusmods/timetable-core`

That matrix should list:

- candidate source files
- current imports that create coupling
- required refactors before extraction
- intended public API for each package

## Status

Current decision:

- Plan first
- Do not extract yet
- Do not add Turborepo yet
