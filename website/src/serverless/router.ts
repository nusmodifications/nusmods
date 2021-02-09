import type { VercelRequest, VercelResponse } from "@vercel/node";

export type Request = VercelRequest;
export type Response = VercelResponse;
export type Handler = (
  req: VercelRequest,
  res: VercelResponse
) => Promise<void>;

export type RouteHandlers = {
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

export const Router = (
  routeHandlers: RouteHandlers,
  fallback: (routeHandlers: RouteHandlers) => Handler,
  rescue: (err: Error) => Handler
): Handler => async (req: Request, res: Response): Promise<void> => {
  try {
    const handler = getHandlerByMethod(routeHandlers, req.method);
    if (handler === undefined) {
      await fallback(routeHandlers)(req, res);
      return;
    }
    await handler(req, res);
  } catch (err) {
    return rescue(err)(req, res);
  }
};

export const defaultFallback = (routeHandlers: RouteHandlers) => async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const allowedMethods = Object.entries(routeHandlers).reduce(
      (acc, [method, handler]) =>
        handler !== undefined
          ? acc === ""
            ? method
            : `${acc}, ${method}`
          : acc,
      ""
    );
    res.setHeader("Allow", allowedMethods);
    res.status(405).json({
      message: "Method not allowed",
    });
  } catch (err) {
    throw err;
  }
};

export const defaultRescue = (enableLogging: boolean) => (err: Error) => async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (enableLogging) {
      console.error(err);
    }
    res.status(500).json({
      message: "An unexpected error occurred",
    });
  } catch (err) {
    throw err;
  }
};

const getHandlerByMethod = (
  routeHandlers: RouteHandlers,
  methodName: string = ""
): Handler | undefined => {
  const entry = Object.entries(routeHandlers).find(
    ([method, _]) => method === methodName
  );
  return entry !== undefined ? entry[1] : undefined;
};
