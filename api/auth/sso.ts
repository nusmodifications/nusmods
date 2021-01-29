import type { VercelApiHandler } from '@vercel/node';
import { createLoginURL } from '../../auth';
import rescue from '../../utils/rescue';
import handleMethodNotFound from '../../utils/methodNotFound';

const errors = {
  noOrigin: 'ERR_NO_ORIGIN',
};

const allowedMethods = {
  GET: 'GET',
};

const handleGet: VercelApiHandler = async (req, res) => {
  try {
    if (!req.headers.origin) {
      throw new Error(errors.noOrigin);
    }

    const ssoLoginURL = new URL(createLoginURL());
    ssoLoginURL.searchParams.append('RelayState', req.headers.referer || req.headers.origin);

    res.redirect(ssoLoginURL.toString());
  } catch (err) {
    if (err.message === errors.noOrigin) {
      return res.json({
        message: 'Request needs an origin',
      });
    }
    throw err;
  }
};

const handleDefault = handleMethodNotFound(Object.keys(allowedMethods));

const ssoHandler: VercelApiHandler = (req, res) => {
  switch (req.method) {
    case allowedMethods.GET:
      return handleGet(req, res);
    default:
      return handleDefault(req, res);
  }
};

export default rescue(ssoHandler);
