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
  failedSamlLogin: 'ERR_FAILED_STATUS',
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

    res.json({ redirect: createLoginURL(callback) });
  } catch (err) {
    if (err.message === errors.noCallbackUrl) {
      res.status(422).json({
        error: 'Request needs a referer',
      });
    } else {
      res.status(500).json({
        message:
          'An unexpected error occurred. Please clear your browser cache and ensure you follow the login instructions on the NUS login page.',
      });
    }
  }
};

const methodHandlers: MethodHandlers = {
  GET: handleGet,
};

export default createRouteHandler(methodHandlers, defaultFallback, defaultRescue(true));
