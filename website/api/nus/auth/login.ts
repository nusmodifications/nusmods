import { authenticate, isCallbackUrlValid } from '../../../src/serverless/nus-auth';
import {
  createRouteHandler,
  defaultFallback,
  defaultRescue,
  Handler,
  MethodHandlers,
} from '../../../src/serverless/handler';

const errors = {
  noRelayState: 'ERR_NO_RELAY_STATE',
  invalidRelayState: 'ERR_INVALID_RELAY_STATE',
};

const handlePost: Handler = async (req, res) => {
  try {
    const { token, relayState } = await authenticate(req);
    if (!relayState) {
      throw new Error(errors.noRelayState);
    }

    if (!isCallbackUrlValid(relayState)) {
      throw new Error(errors.invalidRelayState);
    }
    const userURL = new URL(relayState);
    userURL.searchParams.append('token', token);

    res.redirect(301, userURL.toString());
  } catch (err) {
    if (err.message === errors.noRelayState) {
      res.json({
        message: 'Relay state not found in request',
      });
    } else if (err.message === errors.invalidRelayState) {
      res.json({
        message: 'Invalid relay state given. URL must be from a valid domain.',
      });
    } else {
      throw err;
    }
  }
};

const methodHandlers: MethodHandlers = {
  POST: handlePost,
};

export default createRouteHandler(methodHandlers, defaultFallback, defaultRescue(true));
