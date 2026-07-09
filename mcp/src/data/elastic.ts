import config from '../config.js';
import type { ElasticSearchResponse, ElasticSearchResult } from '../types/elasticSearch.js';
import type { ModuleInformation } from '../types/modules.js';

export type ModuleHit = ElasticSearchResult<ModuleInformation>;

export interface SearchParams {
  limit: number;
  offset: number;
  query?: string;
}

export interface SearchResult {
  hits: Array<ModuleHit>;
  total: number;
}

/**
 * Query the public NUSMods `modules_v2` ElasticSearch index — the same cluster
 * the website's Course Finder hits directly from the browser.
 *
 * Only covers the current academic year (the index is not year-partitioned).
 *
 * TODO(M4): add faceted filters (semester, faculty, department, module level,
 * credits, attributes) and highlight snippets.
 */
export async function searchModules({ limit, offset, query }: SearchParams): Promise<SearchResult> {
  const url = `${config.elasticsearchBaseUrl}/${config.elasticsearchIndex}/_search?track_total_hits=true`;

  const esQuery =
    query && query.trim()
      ? {
          multi_match: {
            fields: ['moduleCode^3', 'title^2', 'description'],
            query: query.trim(),
            type: 'cross_fields',
          },
        }
      : { match_all: {} };

  const response = await fetch(url, {
    body: JSON.stringify({ from: offset, query: esQuery, size: limit }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error(`ElasticSearch query failed (${response.status} ${response.statusText}).`);
  }

  const json = (await response.json()) as ElasticSearchResponse<ModuleInformation>;
  const total = typeof json.hits.total === 'number' ? json.hits.total : json.hits.total.value;

  return { hits: json.hits.hits, total };
}
