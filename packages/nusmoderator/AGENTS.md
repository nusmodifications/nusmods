# packages/nusmoderator/

Small library published to npm as `nusmoderator`, with academic year, semester and week helpers (`src/academicCalendar.ts`). It is built with microbundle.

## Commands

```bash
pnpm test && pnpm lint && pnpm typecheck
pnpm build     # microbundle → dist/
pnpm docs      # regenerate the API section of README.md from JSDoc
```

## Notes

- **Not workspace-linked.** `website` and `scrapers/nus-v2` depend on the published `nusmoderator@3.0.0`, while this package is at 4.0.0. Edits here have no effect on them until the package is published and their dependency is bumped.
- `pnpm lint` runs `documentation lint`, so exported functions need valid JSDoc. The README's API section is generated from it, so don't edit that section by hand; run `pnpm docs`.
- This is a public API, so treat signature changes as breaking (semver).
