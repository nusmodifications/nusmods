import { authenticate } from '../../../src/serverless/nus-auth';
import {
  createRouteHandler,
  defaultFallback,
  Handler,
  MethodHandlers,
} from '../../../src/serverless/handler';

const errors = {
  noRelayState: 'ERR_NO_RELAY_STATE',
};

const handlePost: Handler = async (req, res) => {
  try {
    const { token, relayState } = await authenticate(req);
    if (!relayState) {
      throw new Error(errors.noRelayState);
    }

    const userURL = new URL(relayState);
    userURL.searchParams.append('token', token);

    res.redirect(301, userURL.toString());
  } catch (err) {
    if (err.message === errors.noRelayState) {
      res.json({
        message: 'Relay state not found in request',
      });
    } else {
      throw err;
    }
  }
};

// eslint-disable-next-line no-unused-vars
const handleError: (error: Error) => Handler = (error) => async (_req, res) => {
  res.status(500).json({
    message: 'An unexpected error occurred.',
    error,
  });
};

const methodHandlers: MethodHandlers = {
  POST: handlePost,
};

export default createRouteHandler(methodHandlers, defaultFallback, handleError);
