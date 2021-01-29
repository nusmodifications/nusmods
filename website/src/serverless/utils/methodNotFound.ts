import type { VercelApiHandler } from '@vercel/node';

export default (allowedMethods: string[]): VercelApiHandler => async (req, res) => {
  const allowHeaderValue = Object.keys(allowedMethods).reduce((acc, method) => `${acc}, ${method}`);
  res.setHeader('Allow', allowHeaderValue);
  res.status(405).json({
    message: 'Method not allowed',
  });
};
