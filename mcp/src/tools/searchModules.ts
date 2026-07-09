import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { searchModules } from '../data/elastic.js';
import { formatSearchResults } from '../format.js';

/** Build a compact human-readable summary of the filters that were applied. */
function summariseFilters(parts: Array<[string, unknown]>): string | undefined {
  const active = parts
    .filter(([, value]) => value != null && !(Array.isArray(value) && value.length === 0))
    .map(([label, value]) => `${label}: ${Array.isArray(value) ? value.join('/') : String(value)}`);
  return active.length ? active.join(', ') : undefined;
}

export function registerSearchModules(server: McpServer): void {
  server.registerTool(
    'search_modules',
    {
      description:
        'Search NUS modules for the current academic year. Free-text `query` matches module code, ' +
        'title and description; the remaining parameters are faceted filters (combined with AND; ' +
        'multiple values within a filter are OR). Returns a ranked list; use `get_module` for full ' +
        'details of any result.',
      inputSchema: {
        attributes: z
          .array(z.string())
          .optional()
          .describe(
            'Module attribute keys, e.g. "su" (S/U-able), "lab", "fyp", "ism", "urop", "year" (year-long).',
          ),
        departments: z
          .array(z.string())
          .optional()
          .describe('Department names, exact match, e.g. "Computer Science".'),
        faculties: z
          .array(z.string())
          .optional()
          .describe('Faculty names, exact match, e.g. "Computing", "Science".'),
        gradingBasis: z
          .array(z.string())
          .optional()
          .describe('Grading basis descriptions, exact match, e.g. "Graded", "Pass/Fail".'),
        levels: z
          .array(z.number().int())
          .optional()
          .describe(
            'Module levels in thousands, e.g. [1000, 2000] for level-1000 and 2000 modules.',
          ),
        limit: z
          .number()
          .int()
          .min(1)
          .max(50)
          .optional()
          .describe('Maximum number of results to return (default 10, max 50).'),
        maxCredit: z.number().optional().describe('Maximum module credits (units), inclusive.'),
        minCredit: z.number().optional().describe('Minimum module credits (units), inclusive.'),
        noExam: z
          .boolean()
          .optional()
          .describe('If true, only return modules with no exam in any semester.'),
        offset: z
          .number()
          .int()
          .min(0)
          .optional()
          .describe('Number of results to skip, for pagination (default 0).'),
        query: z
          .string()
          .optional()
          .describe(
            'Free-text search over module code, title and description, e.g. "machine learning".',
          ),
        semesters: z
          .array(z.number().int().min(1).max(4))
          .optional()
          .describe(
            'Semesters the module must be offered in: 1, 2, 3 (Special Term I), 4 (Special Term II).',
          ),
      },
      title: 'Search NUS modules',
    },
    async ({
      attributes,
      departments,
      faculties,
      gradingBasis,
      levels,
      limit,
      maxCredit,
      minCredit,
      noExam,
      offset,
      query,
      semesters,
    }) => {
      const { hits, total } = await searchModules({
        attributes,
        departments,
        faculties,
        gradingBasis,
        levels,
        limit: limit ?? 10,
        maxCredit,
        minCredit,
        noExam,
        offset: offset ?? 0,
        query,
        semesters,
      });

      const appliedFilters = summariseFilters([
        ['semesters', semesters],
        ['levels', levels],
        ['faculties', faculties],
        ['departments', departments],
        ['gradingBasis', gradingBasis],
        ['attributes', attributes],
        ['minCredit', minCredit],
        ['maxCredit', maxCredit],
        ['noExam', noExam || undefined],
      ]);

      return {
        content: [
          { text: formatSearchResults(query, total, hits, appliedFilters), type: 'text' as const },
        ],
        structuredContent: {
          results: hits.map((hit) => hit._source),
          total,
        },
      };
    },
  );
}
