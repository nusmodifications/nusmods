import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerGetModule } from './tools/getModule.js';
import { registerSearchModules } from './tools/searchModules.js';

/**
 * Build a fresh MCP server instance with all tools registered.
 *
 * A new instance is created per request in the stateless HTTP transport, so this
 * must stay cheap (tool registration only; no I/O).
 */
export function createServer(): McpServer {
  const server = new McpServer(
    { name: 'nusmods', version: '0.1.0' },
    {
      instructions:
        'Access to NUS (National University of Singapore) course/module data from NUSMods. ' +
        'Use `search_modules` to find modules by keyword, then `get_module` for the full details ' +
        'of a specific module code.',
    },
  );

  registerSearchModules(server);
  registerGetModule(server);

  return server;
}
