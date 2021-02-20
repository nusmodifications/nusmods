import { createLoginURL } from '../../../src/serverless/nus-auth';
import {
  createRouteHandler,
  defaultFallback,
  defaultRescue,
  Handler,
  MethodHandlers,
} from '../../../src/serverless/handler';

const errors = {
  noReferer: 'ERR_NO_REFERER',
};

const handleGet: Handler = async (req, res) => {
  try {
    if (!req.headers.referer) {
      throw new Error(errors.noReferer);
    }

    const ssoLoginURL = new URL(createLoginURL());
    ssoLoginURL.searchParams.append('RelayState', req.headers.referer);

    res.send(ssoLoginURL.toString());
  } catch (err) {
    if (err.message === errors.noReferer) {
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
