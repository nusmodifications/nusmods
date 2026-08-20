import type { VercelRequest, VercelResponse } from '@vercel/node';

/** Lightweight health check, served at https://mcp.nusmods.com/. */
export default function handler(req: VercelRequest, res: VercelResponse): void {
  res.status(200).json({ method: req.method, service: 'nusmods-mcp', status: 'ok' });
}
