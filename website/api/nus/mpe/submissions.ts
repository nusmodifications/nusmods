import { User, verifyLogin } from '../../../src/serverless/nus-auth';
import { getSubmissionById, createSubmission } from '../../../src/serverless/mpe';
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
    const submission = await getSubmissionById(user.accountName);
    res.json(submission);
  } catch (err) {
    if (err.response.status === 404) {
      res.status(404).json({
        message: 'No MPE preferences are found for requesting user',
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
  GET: verifyLogin(handleGet),
  POST: verifyLogin(handlePost),
  PUT: verifyLogin(handlePost),
};

export default createRouteHandler(methodHandlers, defaultFallback, defaultRescue(true));
