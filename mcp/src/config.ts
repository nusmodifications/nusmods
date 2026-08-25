/**
 * Runtime configuration for the NUSMods MCP server.
 *
 * Defaults mirror `website/src/config/app-config.json` so the server tracks the
 * same academic year and upstreams as the website. Everything is overridable via
 * environment variables (see `.env.example`).
 */
const config = {
  // Academic year in "YYYY/YYYY" form, e.g. "2026/2027".
  academicYear: process.env.NUSMODS_ACAD_YEAR || '2026/2027',

  // Public NUSMods v2 JSON API, hosted on the CDN.
  apiBaseUrl: process.env.NUSMODS_API_BASE_URL || 'https://api.nusmods.com',

  // Public ElasticSearch cluster that powers module search.
  elasticsearchBaseUrl:
    process.env.NUSMODS_ES_BASE_URL || 'https://nusmods-search.es.ap-southeast-1.aws.found.io:9243',

  // ElasticSearch index name for modules (current academic year only).
  elasticsearchIndex: 'modules_v2',

  // In-memory cache TTL for static JSON responses (1 hour). Module JSON is
  // static CDN content, so a generous TTL is safe.
  cacheTtlMs: 60 * 60 * 1000,
} as const;

export default config;

/** Convert an academic year to the URL segment form ("2026/2027" -> "2026-2027"). */
export function toUrlAcadYear(acadYear: string): string {
  return acadYear.replace('/', '-');
}
