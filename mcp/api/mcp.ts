import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleMcpRequest } from '../src/handler.js';

/**
 * Vercel serverless entrypoint for the MCP endpoint.
 *
 * Exposed publicly at https://mcp.nusmods.com/mcp (see vercel.json rewrites).
 * Vercel parses the JSON request body into `req.body` for us.
 */
export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  await handleMcpRequest(req, res, req.body);
}
