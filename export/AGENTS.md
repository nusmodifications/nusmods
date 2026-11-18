# export/

Timetable → PNG/PDF export service. Koa server (`src/index.ts`, `src/app.ts`) locally; on Vercel the entry points are `api/export/image.ts` and `api/export/pdf.ts` (15s max duration), which use `src/render-serverless.ts` and `@sparticuz/chromium`.

## How it works

The website serialises timetable state into a `data` query param. This service validates it (Joi, `src/data.ts`), opens a Puppeteer page with the website's **timetable-only bundle** (`website/src/entry/export/`), injects the state into Redux and screenshots or prints the page. The rendered UI therefore lives in `website/`, not here. Layout bugs in exports are usually fixed in `website/src/entry/export` or the timetable components.

## Local dev

```bash
cp .env.example .env          # ACADEMIC_YEAR=YYYY-YYYY is required; PAGE defaults to production nusmods.com/timetable-only
pnpm --dir ../website start:export   # optional: serve local timetable-only page on :8081, then set PAGE=http://localhost:8081
pnpm dev                       # tsc --watch + nodemon on :3000
pnpm devtools                  # same with a visible browser; PDF export does not work in this mode
```

Example URLs are in `README.md`. `GET /debug` returns the HTML Puppeteer renders.

## Notes

- There are no unit tests; CI only runs `pnpm lint`, `pnpm typecheck` and `pnpm build`. Verify changes manually with the README's example URLs.
- `PAGE` is either a URL (dev, loaded with `goto`) or a local file path (prod, loaded with `setContent`). Behaviour differs, so test the mode you changed.
- `MODULE_DATA` unset means module data is fetched from the NUSMods API. In production, a set path must exist.
- `ExportData` in `src/types.ts` is a hand-copied duplicate of `website/src/types/export.ts`. Change both together, along with the URL builder in `website/src/apis/export.ts`.
