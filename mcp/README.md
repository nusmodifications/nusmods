# NUSMods MCP Server

A [Model Context Protocol](https://modelcontextprotocol.io/) server that exposes
NUSMods module data to LLM clients (Claude Desktop, Cursor, etc.).

Deployed at **`https://mcp.nusmods.com/mcp`** (Streamable HTTP transport).

## Tools

- **`search_modules`** — keyword search + faceted filters for the current academic year.
- **`get_module`** — full details for one module code: info, requisites, exam dates, timetable.

`search_modules` supports free-text `query` (module code / title / description,
returned with `<mark>`→`**` highlight snippets) plus these filters — combined
with AND, multiple values within a filter OR'd: `semesters`, `levels`,
`faculties`, `departments`, `gradingBasis`, `attributes`, `minCredit`/`maxCredit`,
and `noExam`.

Data comes entirely from existing public NUSMods infrastructure — no database:

- Module details: the v2 JSON API (`https://api.nusmods.com/v2/{AY}/modules/{CODE}.json`)
- Search: the public `modules_v2` ElasticSearch index (the same one the website's
  Course Finder queries)

## Architecture

- **Transport:** Streamable HTTP, **stateless** (`sessionIdGenerator: undefined`,
  `enableJsonResponse: true`) — a fresh server + transport per request, which
  suits serverless.
- **Hosting:** Vercel serverless function (`api/mcp.ts`), mirroring `/export`.
  Rate limiting is handled upstream by Cloudflare.
- **SDK:** `@modelcontextprotocol/sdk` with `zod` input schemas.

```text
mcp/
├── api/
│   ├── mcp.ts          # Vercel entrypoint for /mcp
│   └── health.ts       # Health check for /
├── src/
│   ├── server.ts       # builds the McpServer, registers tools
│   ├── handler.ts      # per-request stateless transport wiring
│   ├── dev.ts          # local HTTP dev server
│   ├── config.ts
│   ├── format.ts       # human-readable text output
│   ├── data/           # nusmodsApi (v2 JSON) · elastic (search) · cache
│   ├── tools/          # getModule · searchModules
│   └── types/          # vendored module + ES types
└── vercel.json
```

## Development

From the repo root (`pnpm install` once for the whole workspace), then:

```sh
cd mcp
cp .env.example .env      # optional; defaults are baked in
pnpm dev                  # http://localhost:3000/mcp
```

Inspect it with the MCP Inspector:

```sh
npx @modelcontextprotocol/inspector
# then connect to http://localhost:3000/mcp (Streamable HTTP)
```

Checks:

```sh
pnpm typecheck
pnpm lint
pnpm test        # vitest (unit tests, no network)
pnpm test:watch
pnpm check       # lint + typecheck + test
```

## Deployment

Vercel project bound to `mcp.nusmods.com`. `vercel.json` rewrites `/mcp` to the
function and `/` to the health check. Environment variables (all optional, see
`.env.example`) let you override the academic year and upstream URLs.

## Maintenance

The academic year in `src/config.ts` must be bumped once a year — this is
tracked in the repo-root [MAINTENANCE.md](../MAINTENANCE.md) checklist alongside
the website's `app-config.json` update.

## Roadmap

- ES fallback to `moduleInformation.json` when the search cluster is unavailable.
- Later: venues, faculty/department listing, academic-calendar tools, and MCP
  **resources** (e.g. `nusmods://{ay}/module/{code}`).
