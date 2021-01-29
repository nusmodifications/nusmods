import type { VercelApiHandler } from '@vercel/node';
import { getSubmissionById, createSubmission } from '../mpe';
import { User, verifyLogin } from '../auth';
import rescue from '../utils/rescue';
import handleMethodNotFound from '../utils/methodNotFound';

const allowedMethods = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
};

const handleGet: VercelApiHandler = async (req, res) => {
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

const handlePost: VercelApiHandler = async (req, res) => {
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

const handleDefault = handleMethodNotFound(Object.keys(allowedMethods));

const submissionHandler: VercelApiHandler = (req, res) => {
  switch (req.method) {
    case allowedMethods.GET:
      return handleGet(req, res);
    case allowedMethods.POST:
    case allowedMethods.PUT:
      return handlePost(req, res);
    default:
      return handleDefault(req, res);
  }
};

export default rescue(verifyLogin(submissionHandler));
