import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { searchModules } from '../data/elastic.js';
import { formatSearchResults } from '../format.js';

export function registerSearchModules(server: McpServer): void {
  server.registerTool(
    'search_modules',
    {
      description:
        'Search NUS modules for the current academic year by keyword (matches module code, title ' +
        'and description). Returns a ranked list of matching modules; use `get_module` for full ' +
        'details of any result. (Faceted filters such as semester, faculty and module level are ' +
        'planned.)',
      inputSchema: {
        limit: z
          .number()
          .int()
          .min(1)
          .max(50)
          .optional()
          .describe('Maximum number of results to return (default 10, max 50).'),
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
      },
      title: 'Search NUS modules',
    },
    async ({ limit, offset, query }) => {
      const { hits, total } = await searchModules({
        limit: limit ?? 10,
        offset: offset ?? 0,
        query,
      });
      return {
        content: [{ text: formatSearchResults(query, total, hits), type: 'text' as const }],
        structuredContent: {
          results: hits.map((hit) => hit._source),
          total,
        },
      };
    },
  );
}
