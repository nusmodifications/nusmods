import { createLoginURL } from '../../auth';
import rescue from '../../utils/rescue';
import handleMethodNotFound from '../../utils/methodNotFound';

const errors = {
  noOrigin: 'ERR_NO_ORIGIN',
};

const allowedMethods = {
  GET: 'GET',
};

const ssoHandler = async (req, res) => {
  try {
    switch (req.method) {
      case allowedMethods.GET:
        await handleGet(req, res);
        break;
      default:
        await handleDefault(req, res);
        break;
    }
  } catch (err) {
    throw err;
  }
};

const handleGet = async (req, res) => {
  try {
    if (!req.headers.origin) {
      throw new Error(errors.noOrigin);
    }

    const ssoLoginURL = new URL(createLoginURL());
    ssoLoginURL.searchParams.append('RelayState', req.headers.origin);

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

const handleDefault = handleMethodNotFound(allowedMethods);

export default rescue(ssoHandler);
