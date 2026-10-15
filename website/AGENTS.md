# website/

The nusmods.com SPA: React 18, Redux 4 and React Router 5, bundled by a custom Webpack config (`webpack/`), plus its Vercel serverless functions.

## Commands

```bash
pnpm start             # dev server (optimiser calls go to /api/optimiser/optimise)
pnpm start:local       # dev server pointing optimiser at localhost:8020
pnpm start:optimiser   # run Go optimiser test server on :8020
pnpm test              # vitest unit tests (*.test.ts[x]) with coverage
pnpm test utils/modules        # single file; filter is matched relative to src/
pnpm test:integration  # *.integration.test.ts[x]
pnpm lint              # oxlint + stylelint
pnpm typecheck
pnpm check             # lint + typecheck + test
pnpm build             # production build to dist/
```

CI runs with `TZ=Asia/Singapore`. If a date or time test fails locally, rerun it with that timezone set.

## Where things live

- Source lives directly in `src/`, not `src/js/` as README.md's tree says. Imports resolve from `src/` as the base: `import { x } from 'utils/modules'`, `'actions/timetables'`, `'types/modules'`.

- `src/entry/main.tsx` → `App.tsx`: app bootstrap. `src/entry/export/`: timetable-only build used by the `export/` service (`pnpm start:export`, `webpack.config.timetable-only.js`).
- `src/views/<feature>/`: page components (`timetable`, `modules`, `planner`, `optimiser`, `venues`, `today`, `mpe`, …). Shared UI in `src/views/components`, hooks in `src/views/hooks`.
- `src/actions`, `src/reducers`, `src/selectors`: Redux. Persistence config is in `src/storage/persistReducer.ts`; persisted reducers declare their own `migrate`/version.
- `src/utils/`: pure logic (timetable maths, module helpers, ical). Most unit tests live here; put new non-UI logic here so it can be tested without rendering.
- `src/types/`: shared types (`modules.ts`, `timetables.ts`, `state.ts`, …). `src/types/global.d.ts` declares build-time globals (`NUSMODS_ENV`, `DATA_API_BASE_URL`, `OPTIMISER_API_URL`, …) injected by Webpack's DefinePlugin and Vitest `define`.
- `src/data/`: static JSON (venues, holidays, bus stops, ModReg schedule). `scripts/` has generators for some of these (holidays, bus stops, venue updates).
- `src/config/app-config.json` + `src/config/index.ts`: runtime config. `src/featureFlags.ts`: CPEx toggles.

## Conventions

- Styles use CSS Modules: put `Component.scss` next to `Component.tsx` and start it with `@import '~styles/utils/modules-entry.scss';`. Prefer SCSS variables; use CSS custom properties only for colours that change in dark mode.
- `.svg` imports become React components (SVGR). Append `?url` to get a URL string instead.
- Fetch data through Redux: return `requestAction(key, type, axiosOptions)` from `actions/requests`, and have reducers listen for `TYPE + SUCCESS` (from `types/reducers`). Read request status with the `isSuccess`/`isFailure` selectors.
- Redux state is persisted (redux-persist) and synced across tabs (redux-state-sync).
- Keep the bundle lean: check the size of new dependencies and code-split page-specific ones.

## Serverless functions (`api/`)

- `api/nus/**` are thin route files; logic lives in `src/serverless/` (`handler.ts`, `nus-auth.ts` SAML SSO, `mpe.ts`). `api/optimiser/` is Go; see its own AGENTS.md.
- `api/tsconfig.json` compiles these as **CommonJS** with `baseUrl: ../src`. Anything reachable from `api/` (including `src/config`, `src/types`, `src/serverless`) must be `require()`-able: use `lodash`, not `lodash-es`, and avoid other ESM-only packages there.
- Vercel only bundles `src/serverless/*.xml` and `src/data/*.json` as extra files for functions (`vercel.json`). If a function needs another data file, add it to `includeFiles`.
- On Vercel, `/api/*` paths that don't match a function are rewritten to `https://api.nusmods.com`.

## Testing

- Vitest runs with globals enabled in jsdom. SCSS imports resolve to an identity proxy and SVGs to a mock component (`vitest.config.ts`).
- Use React Testing Library for new component tests. Many existing tests use Enzyme snapshots (`__snapshots__/`).

- Tests sit next to source as `*.test.ts(x)`; integration tests are `*.integration.test.ts(x)`, run separately with `pnpm test:integration`.
- Use `src/test-utils/` for helpers (Redux store setup, fixtures). Module fixtures are in `src/__mocks__/modules/`.
- Run snapshot updates with `pnpm test -u <filter>`, and only when the UI change is intentional.

## Recurring data/config changes

- Semester and AY rollovers follow `MAINTENANCE.md` at the repo root. Typical files: `app-config.json`, `src/data/modreg-schedule.json`, `src/data/holidays.json`, `views/components/notfications/Announcements.tsx` (the directory name really is misspelled).
- Opening or closing a CPEx round touches `src/featureFlags.ts`, `src/views/mpe/constants.ts` (`MPE_SEMESTER`), `src/config/index.ts` and `src/serverless/{mpe,nus-auth}.ts`. See commit `ac18828a` for an example.
- After editing `src/data/venues.json`, the optimiser copy is synced by the pre-commit hook or by `pnpm prepare:optimiser`.

## Gotchas

- `nusmoderator` here is the **published npm 3.0.0**, not `packages/nusmoderator` (4.0.0 in the workspace). Changes to that package don't reach the website until it is published and the dependency is bumped. `nusmods-academic-calendar` _is_ linked from the workspace.
- `pnpm lint:styles --fix` is experimental. If you run it, revert any changes it makes to `themes.scss`.
- The timetable supports 7 days (Sunday was added recently). Don't hard-code 5 or 6 weekdays.
