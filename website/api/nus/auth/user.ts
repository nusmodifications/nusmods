import { authenticate } from '../../../src/serverless/nus-auth';
import {
  createRouteHandler,
  defaultFallback,
  defaultRescue,
  Handler,
  MethodHandlers,
} from '../../../src/serverless/handler';

const handleGet: Handler = async (req, res) => {
    const { user } = await authenticate(req);
    res.json(user);
};

const methodHandlers: MethodHandlers = {
  GET: handleGet,
};

export default createRouteHandler(methodHandlers, defaultFallback, defaultRescue(true));
