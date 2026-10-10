# AGENTS.md

NUSMods is the timetable builder and course catalogue for NUS. It's a pnpm monorepo (Node 22, pnpm 10.30.3). Read the AGENTS.md for the folder you're changing before you start.

| Area                                                     | Path                                    | Details                                                   |
| -------------------------------------------------------- | --------------------------------------- | --------------------------------------------------------- |
| Website SPA, serverless API, website conventions         | `website/`                              | [website/AGENTS.md](website/AGENTS.md)                    |
| Timetable optimiser (Go, beam search)                    | `website/api/optimiser/`                | [optimiser AGENTS.md](website/api/optimiser/AGENTS.md)    |
| Timetable PNG/PDF export (Koa + Puppeteer)               | `export/`                               | [export/AGENTS.md](export/AGENTS.md)                      |
| NUS data scraper → api.nusmods.com v2                    | `scrapers/nus-v2/`                      | [nus-v2 AGENTS.md](scrapers/nus-v2/AGENTS.md)             |
| CPEx module scraper                                      | `scrapers/cpex-scraper/`                | [cpex AGENTS.md](scrapers/cpex-scraper/AGENTS.md)         |
| `nusmoderator` npm lib (published, not workspace-linked) | `packages/nusmoderator/`                | [nusmoderator AGENTS.md](packages/nusmoderator/AGENTS.md) |
| Academic calendar JSON (workspace-linked)                | `packages/nusmods-academic-calendar/`   | —                                                         |
| Browser support config                                   | `packages/browserslist-config-nusmods/` | —                                                         |

## Repo-wide

- Run `pnpm install` once at the root, then run scripts from inside each package. `pnpm check` runs that package's lint, typecheck and tests; CircleCI (`.circleci/config.yml`) runs those checks for each package separately.
- `pnpm format` / `pnpm format:check` at the root runs oxfmt (print width 100, single quotes, trailing commas). The husky pre-commit hook formats staged files and syncs `website/src/data/venues.json` into the optimiser.
- The tools are **Vitest**, **oxlint** and **oxfmt**. READMEs and ARCHITECTURE.md still say Jest and ESLint, so ignore that.
- Semester and academic-year rollover steps are in `MAINTENANCE.md`.
- Branch from `master` (trunk-based). Commit messages use Conventional Commits, e.g. `feat(timetable): …`, `fix(scraper): …`, `chore(deps): …`. The PR template has Context / Implementation / Other Information sections.
