# scrapers/cpex-scraper/

Scrapes the module list for NUS's Course Planning Exercise (CPEx/MPE) into `scrapers/data/cpexModules.json`, plus a timestamped archive copy. The website's MPE page (`website/src/views/mpe`) uses this data.

## Commands

```bash
pnpm test                       # vitest, scraper.ts takes injectable fs/logger so tests don't touch disk
pnpm lint && pnpm typecheck
pnpm dev                        # build + run; needs env.json (baseUrl, acadApiKey, acadAppKey, courseApiKey) in this folder
```

## Notes

- `ACADEMIC_YEAR` is hard-coded in `src/index.ts` and must be updated for each CPEx round.
- `threshold` (in `src/index.ts`) stops the scraper overwriting `cpexModules.json` if fewer modules come back than expected. The archive file is always written.
- Turning CPEx on or off in the website is a separate change in `website/` (feature flags, `MPE_SEMESTER`). See `website/AGENTS.md`.
