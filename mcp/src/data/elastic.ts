import config from '../config.js';
import type { ElasticSearchResponse, ElasticSearchResult } from '../types/elasticSearch.js';
import type { ModuleInformation } from '../types/modules.js';

export type ModuleHit = ElasticSearchResult<ModuleInformation>;

/** An opaque ElasticSearch query DSL clause. */
type EsClause = Record<string, unknown>;

/**
 * Faceted filters, mirroring the website's Course Finder sidebar
 * (`website/src/views/modules/ModuleFinderSidebar.tsx`). Different categories
 * are combined with AND; multiple values within a category are combined with OR.
 */
export interface SearchFilters {
  // Attribute keys, e.g. "su", "lab", "fyp" (`moduleAttributes.keyword`).
  attributes?: Array<string>;
  // Department names, exact match (`department.keyword`).
  departments?: Array<string>;
  // Faculty names, exact match (`faculty.keyword`).
  faculties?: Array<string>;
  // Grading basis descriptions, exact match (`gradingBasisDescription.keyword`).
  gradingBasis?: Array<string>;
  // Module levels in thousands, e.g. 1000, 2000 (`moduleCode.level`).
  levels?: Array<number>;
  // Maximum module credits, inclusive (`moduleCredit`).
  maxCredit?: number;
  // Minimum module credits, inclusive (`moduleCredit`).
  minCredit?: number;
  // Only modules with no exam in any semester.
  noExam?: boolean;
  // Semesters offered, 1-4 (nested `semesterData.semester`).
  semesters?: Array<number>;
}

export interface SearchParams extends SearchFilters {
  limit: number;
  offset: number;
  query?: string;
}

export interface SearchResult {
  hits: Array<ModuleHit>;
  total: number;
}

const HIGHLIGHT = {
  fields: { description: {}, moduleCode: {}, title: {} },
  post_tags: ['</mark>'],
  pre_tags: ['<mark>'],
};

/** Normalise a level to the thousand form the index uses (2 -> 2000, 2000 -> 2000). */
function normaliseLevel(level: number): string {
  return String(level < 1000 ? level * 1000 : level);
}

function buildFilters(filters: SearchFilters): Array<EsClause> {
  const clauses: Array<EsClause> = [];

  if (filters.semesters?.length) {
    clauses.push({
      nested: {
        path: 'semesterData',
        query: { terms: { 'semesterData.semester': filters.semesters } },
      },
    });
  }
  if (filters.levels?.length) {
    clauses.push({ terms: { 'moduleCode.level': filters.levels.map(normaliseLevel) } });
  }
  if (filters.faculties?.length) {
    clauses.push({ terms: { 'faculty.keyword': filters.faculties } });
  }
  if (filters.departments?.length) {
    clauses.push({ terms: { 'department.keyword': filters.departments } });
  }
  if (filters.gradingBasis?.length) {
    clauses.push({ terms: { 'gradingBasisDescription.keyword': filters.gradingBasis } });
  }
  if (filters.attributes?.length) {
    clauses.push({ terms: { 'moduleAttributes.keyword': filters.attributes } });
  }
  if (filters.minCredit != null || filters.maxCredit != null) {
    const range: Record<string, number> = {};
    if (filters.minCredit != null) {
      range.gte = filters.minCredit;
    }
    if (filters.maxCredit != null) {
      range.lte = filters.maxCredit;
    }
    clauses.push({ range: { moduleCredit: range } });
  }
  if (filters.noExam) {
    clauses.push({
      bool: {
        must_not: {
          nested: {
            path: 'semesterData',
            query: { exists: { field: 'semesterData.examDate' } },
          },
        },
      },
    });
  }

  return clauses;
}

/**
 * Query the public NUSMods `modules_v2` ElasticSearch index — the same cluster
 * the website's Course Finder hits directly from the browser.
 *
 * Only covers the current academic year (the index is not year-partitioned).
 */
export async function searchModules({
  limit,
  offset,
  query,
  ...filters
}: SearchParams): Promise<SearchResult> {
  const url = `${config.elasticsearchBaseUrl}/${config.elasticsearchIndex}/_search?track_total_hits=true`;

  const must: EsClause =
    query && query.trim()
      ? {
          multi_match: {
            fields: ['moduleCode^3', 'title^2', 'description'],
            query: query.trim(),
            type: 'cross_fields',
          },
        }
      : { match_all: {} };

  const esQuery = { bool: { filter: buildFilters(filters), must: [must] } };

  const response = await fetch(url, {
    body: JSON.stringify({ from: offset, highlight: HIGHLIGHT, query: esQuery, size: limit }),
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
