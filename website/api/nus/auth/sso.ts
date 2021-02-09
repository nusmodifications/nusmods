import { createLoginURL } from "../../../src/serverless/nus-auth";
import {
  Router,
  defaultFallback,
  defaultRescue,
  Handler,
  RouteHandlers,
} from "../../../src/serverless/router";

const errors = {
  noOrigin: "ERR_NO_ORIGIN",
};

const handleGet: Handler = async (req, res) => {
  try {
    if (!req.headers.origin) {
      throw new Error(errors.noOrigin);
    }

    const ssoLoginURL = new URL(createLoginURL());
    ssoLoginURL.searchParams.append(
      "RelayState",
      req.headers.referer || req.headers.origin
    );

    res.redirect(ssoLoginURL.toString());
  } catch (err) {
    if (err.message === errors.noOrigin) {
      res.json({
        message: "Request needs an origin",
      });
    } else {
      throw err;
    }
  }
};

const routeHandlers: RouteHandlers = {
  POST: handleGet,
};

export default Router(routeHandlers, defaultFallback, defaultRescue(true));
