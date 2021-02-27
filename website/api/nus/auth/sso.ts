import { createLoginURL } from '../../../src/serverless/nus-auth';
import {
  createRouteHandler,
  defaultFallback,
  defaultRescue,
  Handler,
  MethodHandlers,
} from '../../../src/serverless/handler';

const errors = {
  noCallbackUrl: 'ERR_NO_REFERER',
};

function getCallbackUrl(callback: string | string[] | undefined) {
  if (typeof callback === 'string') return callback;
  if (Array.isArray(callback) && callback.length > 0) return callback[0];
  throw new Error(errors.noCallbackUrl);
}

const handleGet: Handler = async (req, res) => {
  try {
    const callback = getCallbackUrl(req.query.callback);
    if (!callback) {
      throw new Error(errors.noCallbackUrl);
    }

    res.send(createLoginURL(callback));
  } catch (err) {
    if (err.message === errors.noCallbackUrl) {
      res.json({
        message: 'Request needs a referer',
      });
    } else {
      throw err;
    }
  }
};

const methodHandlers: MethodHandlers = {
  GET: handleGet,
};

export default createRouteHandler(methodHandlers, defaultFallback, defaultRescue(true));
