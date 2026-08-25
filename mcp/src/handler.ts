import type { IncomingMessage, ServerResponse } from 'node:http';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createServer } from './server.js';

function sendJsonRpcError(
  res: ServerResponse,
  status: number,
  code: number,
  message: string,
): void {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: { code, message }, id: null, jsonrpc: '2.0' }));
}

/**
 * Handle a single MCP HTTP request using a stateless Streamable HTTP transport.
 *
 * Stateless mode (no session id) suits serverless: each request gets a fresh
 * server + transport, and `enableJsonResponse` returns a single JSON body
 * instead of an SSE stream, which serverless functions handle cleanly.
 *
 * `body` is the parsed JSON request body (Vercel parses it for us; the local dev
 * server parses it manually).
 */
export async function handleMcpRequest(
  req: IncomingMessage,
  res: ServerResponse,
  body: unknown,
): Promise<void> {
  if (req.method !== 'POST') {
    sendJsonRpcError(
      res,
      405,
      -32_000,
      'Method not allowed. Use POST for the stateless MCP endpoint.',
    );
    return;
  }

  const server = createServer();
  const transport = new StreamableHTTPServerTransport({
    enableJsonResponse: true,
    sessionIdGenerator: undefined,
  });

  res.on('close', () => {
    transport.close();
    server.close();
  });

  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, body);
  } catch (error) {
    console.error('MCP request handling failed', error);
    if (!res.headersSent) {
      sendJsonRpcError(res, 500, -32_603, 'Internal server error.');
    }
  }
}
