import * as validator from '@authenio/samlify-node-xmllint';
import type { VercelApiHandler, VercelRequest } from '@vercel/node';
import * as fs from 'fs';
import _ from 'lodash';
import * as samlify from 'samlify';
import type { ESamlHttpRequest } from 'samlify/types/src/entity';

const samlifyErrors = {
  assertionExpired: 'ERR_SUBJECT_UNCONFIRMED',
  invalidAssertion: 'ERR_EXCEPTION_VALIDATE_XML',
};

const errors = {
  noTokenSupplied: 'ERR_NO_TOKEN_SUPPLIED',
};

export type User = {
  accountName: string;
  upn: string;
  email: string;
};
const samlRespAttributes: { [key in keyof User]: string } = {
  accountName: 'http://schemas.nus.edu.sg/ws/2015/07/identity/claims/SamAccountName',
  upn: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn',
  email: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
};

samlify.setSchemaValidator(validator);

const idp = samlify.IdentityProvider({
  metadata: `${
    process.env.NUS_EXCHANGE_URL || 'https://vafs.nus.edu.sg'
  }/federationmetadata/2007-06/federationmetadata.xml`,
});

const sp = samlify.ServiceProvider({
  metadata: fs.readFileSync(auth.spMetaData), // TODO: Import XML file
  signingCert: process.env.NUS_EXCHANGE_SP_CERT,
});

export const createLoginURL = () => {
  const { context } = sp.createLoginRequest(idp, 'redirect');
  return context;
};

export const authenticate = async (req: VercelRequest) => {
  const tokenProvided = req.headers.authorization || req.body?.SAMLResponse;
  if (!tokenProvided) {
    throw new Error(errors.noTokenSupplied);
  }

  const requestToProcess: ESamlHttpRequest = {
    body: {
      SAMLResponse: req.body?.SAMLResponse ?? req.headers.authorization,
    },
  };

  const {
    // samlContent,
    extract: { attributes },
  } = await sp.parseLoginResponse(idp, 'post', requestToProcess);

  const user: User = _.mapValues(
    samlRespAttributes,
    (samlAttributeKey) => attributes[samlAttributeKey],
  );

  const relayState = req.body?.RelayState ?? null;

  const loginData = {
    token: requestToProcess.body.SAMLResponse,
    relayState,
    user,
  };
  return loginData;
};

export const verifyLogin = (next: VercelApiHandler): VercelApiHandler => async (req, res) => {
  try {
    const { user } = await authenticate(req);
    // TODO: Augment VercelApiHandler's request with a user object, or find
    // another way to provide the user object.
    // eslint-disable-next-line no-param-reassign, @typescript-eslint/no-explicit-any
    (req as any).user = user;
  } catch (err) {
    const errResp = {
      message: '',
    };

    if (err === samlifyErrors.assertionExpired) {
      errResp.message = 'Token has expired, please login again';
    } else if (err === samlifyErrors.invalidAssertion) {
      errResp.message = 'Invalid token supplied';
    } else if (err.message === errors.noTokenSupplied) {
      errResp.message = 'No token is supplied';
    } else {
      throw err;
    }

    return res.status(401).json(errResp);
  }

  return next(req, res);
};
