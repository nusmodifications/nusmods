# scrapers/nus-v2/

Produces the api.nusmods.com v2 JSON from internal NUS APIs. Running it for real needs private credentials in `env.json` (gitignored, copy from `env.example.json`), which only core devs have. Without them, work through the unit tests.

## Commands

```bash
pnpm test                     # vitest, config and fs-extra are globally mocked
pnpm lint && pnpm typecheck
pnpm dev <task> | pnpm bunyan # build + run a CLI task (needs env.json); `pnpm dev help` lists tasks
pnpm antlr4ts                 # regenerate the requisite parser after editing NusMods.g4
```

## Structure

- `src/index.ts`: yargs CLI that maps commands to tasks.
- `src/tasks/`: pipeline steps, each extending `BaseTask`. `DataPipeline.ts` runs everything (`all`). Test fixtures live in `src/tasks/fixtures/`.
- `src/services/nus-api.ts`: NUS API client (mocked in `services/__mocks__`). `services/io/` handles persistence: filesystem JSON (`fs.ts`) plus Elasticsearch (`elastic.ts`). Outside production, Elasticsearch is skipped if `elasticConfig` isn't set. With `NODE_ENV=production` it is always used (`tasks/BaseTask.ts`), and a missing `elasticConfig` throws.
- `src/services/requisite-tree/`: prerequisite string → tree parser. `antlr4/*.ts`, `*.interp` and `*.tokens` are **generated** from `NusMods.g4`. Edit the grammar, never the generated files.
- `src/config.ts`: reads `env.json` at import time. `academicYear` here is part of the yearly rollover (see root `MAINTENANCE.md`).
- Output goes to the shared `scrapers/data/` directory, which `cpex-scraper` also writes to.

## Testing gotchas

- `scripts/vitest-setup.ts` mocks `src/config.ts` (via `src/__mocks__/config.ts`) and stubs `fs-extra` for every test. To check what gets written, assert on the mocked `fs-extra` calls; tests never write real files.
- Requisite parser tests use snapshots (`requisite-tree/__snapshots__`). Review snapshot diffs carefully because they encode parsing semantics.

## Conventions

- Logging uses Bunyan: put variables in the first argument and keep the message string constant per error type, e.g. `logger.warn({ moduleCode }, 'Invalid module')`. That keeps errors easy to search.
- Special Term (sem 3/4) data may come from the previous AY during the rollover window. See `specialTermAcademicYear` in `config.ts` and `nusmods-academic-calendar`.
