import type { VercelApiHandler } from '@vercel/node';

export default (next: VercelApiHandler): VercelApiHandler => (req, res) => {
  try {
    return next(req, res);
  } catch (err) {
    return res.status(500).json({
      message: 'An unexpected error occurred',
    });
  }
};
