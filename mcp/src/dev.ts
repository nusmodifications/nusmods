import http from 'node:http';
import { handleMcpRequest } from './handler.js';

/**
 * Local development server. Mirrors what the Vercel function does in production,
 * so you can point MCP Inspector / a client at http://localhost:PORT/mcp.
 *
 * Run with `pnpm dev`.
 */
const port = Number(process.env.PORT) || 3000;

const server = http.createServer((req, res) => {
  const url = req.url ?? '';

  if (url === '/' || url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ service: 'nusmods-mcp', status: 'ok' }));
    return;
  }

  if (url !== '/mcp') {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
    return;
  }

  const chunks: Array<Buffer> = [];
  req.on('data', (chunk) => chunks.push(chunk as Buffer));
  req.on('end', () => {
    let body: unknown;
    const raw = Buffer.concat(chunks).toString('utf8');
    if (raw) {
      try {
        body = JSON.parse(raw);
      } catch {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            error: { code: -32_700, message: 'Parse error' },
            id: null,
            jsonrpc: '2.0',
          }),
        );
        return;
      }
    }
    void handleMcpRequest(req, res, body);
  });
});

server.listen(port, () => {
  console.log(`NUSMods MCP dev server listening on http://localhost:${port}/mcp`);
});
