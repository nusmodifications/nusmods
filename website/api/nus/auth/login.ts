import { authenticate } from "../../../src/serverless/nus-auth";
import {
  Router,
  defaultFallback,
  defaultRescue,
  Handler,
  RouteHandlers,
} from "../../../src/serverless/router";

const errors = {
  noRelayState: "ERR_NO_RELAY_STATE",
};

const handlePost: Handler = async (req, res) => {
  try {
    const { token, relayState } = await authenticate(req);
    if (!relayState) {
      throw new Error(errors.noRelayState);
    }

    const userURL = new URL(relayState);
    userURL.searchParams.append("token", token);

    res.redirect(userURL.toString());
  } catch (err) {
    if (err.message === errors.noRelayState) {
      res.json({
        message: "Relay state not found in request",
      });
    } else {
      throw err;
    }
  }
};

const routeHandlers: RouteHandlers = {
  POST: handlePost,
};

export default Router(routeHandlers, defaultFallback, defaultRescue(true));
