import { User, verifyLogin } from '../../../src/serverless/nus-auth';
import {
  createSubmission,
  featureFlagEnablerMiddleware,
  getSubmissionById,
} from '../../../src/serverless/mpe';
import type { MpeSubmission } from '../../../src/types/mpe';
import {
  createRouteHandler,
  defaultFallback,
  defaultRescue,
  Handler,
  MethodHandlers,
} from '../../../src/serverless/handler';

const handleGet: Handler = async (req, res) => {
  try {
    const user = (req as any).user as User;
    const existingSubmission = await getSubmissionById(user.accountName);
    delete existingSubmission.nusExchangeId;
    existingSubmission.preferences = existingSubmission.preferences.map((p) => ({
      moduleCode: p.moduleCode,
      moduleType: p.moduleType,
    }));
    res.json(existingSubmission);
  } catch (err) {
    if (err.response.status === 404) {
      res.json(<MpeSubmission>{
        intendedMCs: 0,
        preferences: [],
      });
    } else {
      throw err;
    }
  }
};

const handlePost: Handler = async (req, res) => {
  // TODO: Identify error type in the catch block and throw relevant error.
  // eslint-disable-next-line no-useless-catch
  try {
    const user = (req as any).user as User;
    await createSubmission(user.accountName, req.body);
    res.json({
      message: 'Your MPE preferences are successfully recorded',
    });
  } catch (err) {
    throw err;
  }
};

const methodHandlers: MethodHandlers = {
  GET: featureFlagEnablerMiddleware(verifyLogin(handleGet)),
  POST: featureFlagEnablerMiddleware(verifyLogin(handlePost)),
  PUT: featureFlagEnablerMiddleware(verifyLogin(handlePost)),
};

export default createRouteHandler(methodHandlers, defaultFallback, defaultRescue(true));
