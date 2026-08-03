import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import config from '../config.js';
import { fetchModule, ModuleNotFoundError } from '../data/nusmodsApi.js';
import { formatModuleSummary } from '../format.js';

export function registerGetModule(server: McpServer): void {
  server.registerTool(
    'get_module',
    {
      description:
        'Fetch complete details for a single NUS module by its module code: title, description, ' +
        'module credits, faculty/department, workload, prerequisites/corequisites/preclusions, ' +
        'exam dates, and the full timetable for each semester it is offered.',
      inputSchema: {
        acadYear: z
          .string()
          .optional()
          .describe(
            'Academic year in "YYYY/YYYY" form, e.g. "2024/2025". Defaults to the current academic year.',
          ),
        moduleCode: z
          .string()
          .describe('The module code, e.g. "CS2030S" or "GEA1000". Case-insensitive.'),
      },
      title: 'Get NUS module details',
    },
    async ({ acadYear, moduleCode }) => {
      const year = acadYear || config.academicYear;
      try {
        const module = await fetchModule(moduleCode, year);
        return {
          content: [{ text: formatModuleSummary(module), type: 'text' as const }],
          structuredContent: module as unknown as Record<string, unknown>,
        };
      } catch (error) {
        if (error instanceof ModuleNotFoundError) {
          return {
            content: [{ text: error.message, type: 'text' as const }],
            isError: true,
          };
        }
        throw error;
      }
    },
  );
}
