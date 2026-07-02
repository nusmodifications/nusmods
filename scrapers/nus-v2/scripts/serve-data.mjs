// Serves the scraped data directory over HTTP with CORS, for local website
// development (set DATA_API_BASE_URL=http://localhost:1234 when starting the
// website).
//
// The website requests `${DATA_API_BASE_URL}/v2/<acad-year>/...`, but the
// scraper writes those files directly under data/<acad-year>/... (no v2/
// directory). This server bridges the two by stripping the leading `/v2`
// segment, so the files can stay exactly where `pnpm build && pnpm scrape
// combine` leaves them — no copying or restructuring required.

import http from 'node:http';
import { createReadStream, promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_ROOT = path.resolve(__dirname, '..', 'data');
const PORT = Number(process.env.PORT) || Number(process.argv[2]) || 1234;

const CONTENT_TYPES = {
  '.json': 'application/json; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.yaml': 'text/yaml; charset=utf-8',
  '.yml': 'text/yaml; charset=utf-8',
};

const server = http.createServer(async (req, res) => {
  // Allow the local website dev server (a different origin) to fetch the data.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') {
    res.writeHead(204).end();
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  } catch {
    res.writeHead(400).end('Bad request');
    return;
  }

  // Map `/v2/<acad-year>/...` onto `data/<acad-year>/...`.
  const relative = pathname.replace(/^\/v2(\/|$)/, '/').replace(/^\/+/, '');
  const filePath = path.resolve(DATA_ROOT, relative);

  // Guard against path traversal outside the data root.
  if (filePath !== DATA_ROOT && !filePath.startsWith(DATA_ROOT + path.sep)) {
    res.writeHead(403).end('Forbidden');
    return;
  }

  try {
    const stat = await fs.stat(filePath);
    if (stat.isDirectory()) {
      res.writeHead(404).end(`Not a file: /${relative}`);
      return;
    }
    res.writeHead(200, {
      'Content-Type': CONTENT_TYPES[path.extname(filePath)] ?? 'application/octet-stream',
      'Content-Length': stat.size,
    });
    createReadStream(filePath).pipe(res);
  } catch {
    res.writeHead(404).end(`Not found: /${relative}`);
  }
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Set PORT=<port> or pass a port argument.`);
  } else {
    console.error(error);
  }
  process.exitCode = 1;
});

server.listen(PORT, () => {
  console.log(`Serving ${DATA_ROOT}`);
  console.log(`  -> http://localhost:${PORT}/v2/<acad-year>/... (CORS enabled)`);
  console.log(`Start the website with DATA_API_BASE_URL=http://localhost:${PORT}`);
});
