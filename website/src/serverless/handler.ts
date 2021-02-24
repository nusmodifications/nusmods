import type { VercelRequest, VercelResponse } from '@vercel/node';

export type Request = VercelRequest;
export type Response = VercelResponse;
export type Handler = (req: VercelRequest, res: VercelResponse) => void | Promise<void>;

export type MethodHandlers = {
  GET?: Handler;
  HEAD?: Handler;
  POST?: Handler;
  PUT?: Handler;
  DELETE?: Handler;
  CONNECT?: Handler;
  OPTIONS?: Handler;
  TRACE?: Handler;
  PATCH?: Handler;
};

const handleOptions: Handler = (_req, res) => {
  res.send(200);
};

export const createRouteHandler = (
  methodHandlers: MethodHandlers,
  fallback: (mh: MethodHandlers) => Handler,
  rescue: (err: Error) => Handler,
): Handler => async (req: Request, res: Response): Promise<void> => {
  try {
    const handler = getHandlerByMethod(
      {
        // HACK: Just insert an OPTIONS handler here to enable CORS for all our
        // serverless functions.
        OPTIONS: handleOptions,
        ...methodHandlers,
      },
      req.method,
    );
    if (handler === undefined) {
      await fallback(methodHandlers)(req, res);
      return;
    }
    await handler(req, res);
  } catch (err) {
    rescue(err)(req, res);
  }
};

export const defaultFallback = (methodHandlers: MethodHandlers) => async (
  req: Request,
  res: Response,
): Promise<void> => {
  const allowedMethods = Object.entries(methodHandlers).reduce((acc, [method, handler]) => {
    if (handler !== undefined) {
      if (acc === '') return method;
      return `${acc}, ${method}`;
    }
    return acc;
  }, '');
  res.setHeader('Allow', allowedMethods);
  res.status(405).json({
    message: 'Method not allowed',
  });
};

export const defaultRescue = (enableLogging: boolean) => (err: Error) => async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (enableLogging) {
    // eslint-disable-next-line no-console
    console.error(err);
  }
  res.status(500).json({
    message: 'An unexpected error occurred',
  });
};

const getHandlerByMethod = (
  methodHandlers: MethodHandlers,
  methodName = '',
): Handler | undefined => {
  const entry = Object.entries(methodHandlers).find(([method]) => method === methodName);
  return entry !== undefined ? entry[1] : undefined;
};
