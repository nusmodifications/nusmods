import type { VercelApiHandler } from "@vercel/node";
import { authenticate } from "serverless/nus-auth";
import rescue from "serverless/utils/rescue";
import handleMethodNotFound from "serverless/utils/methodNotFound";

const errors = {
  noRelayState: "ERR_NO_RELAY_STATE",
};

const allowedMethods = {
  POST: "POST",
};

const handlePost: VercelApiHandler = async (req, res) => {
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
      return res.json({
        message: "Relay state not found in request",
      });
    }
    throw err;
  }
};

const handleDefault = handleMethodNotFound(Object.keys(allowedMethods));

const loginHandler: VercelApiHandler = async (req, res) => {
  switch (req.method) {
    case allowedMethods.POST:
      return handlePost(req, res);
    default:
      return handleDefault(req, res);
  }
};

export default rescue(loginHandler);
