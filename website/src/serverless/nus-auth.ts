import * as validator from '@authenio/samlify-node-xmllint';
import _ from 'lodash';
import * as fs from 'fs';
import * as path from 'path';
import * as samlify from 'samlify';
import type { ESamlHttpRequest } from 'samlify/types/src/entity';
import type { Handler, Request } from './handler';

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
  accountName: 'http://schemas.nus.edu.sg/ws/2015/07/identity/claims/samaccountname',
  upn: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn',
  email: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
};

samlify.setSchemaValidator(validator);

const idp = samlify.IdentityProvider({
  metadata: fs.readFileSync(path.join(__dirname, './FederationMetadata.xml')),
  isAssertionEncrypted: true,
});

const sp = samlify.ServiceProvider({
  metadata: fs.readFileSync(path.join(__dirname, './sp.xml')),
  encPrivateKey: process.env.NUS_EXCHANGE_SP_PRIVATE_KEY,
});

export const createLoginURL = (relayState = '') => {
  const { context } = sp.createLoginRequest(idp, 'redirect');
  const ssoLoginURL = new URL(context);
  ssoLoginURL.searchParams.append('RelayState', relayState);
  return ssoLoginURL.toString();
};

export const authenticate = async (req: Request) => {
  const tokenProvided = req.headers.authorization || (req.body && req.body.SAMLResponse);
  if (!tokenProvided) {
    throw new Error(errors.noTokenSupplied);
  }

  let requestToProcess: ESamlHttpRequest = req;
  if (req.headers.authorization) {
    requestToProcess = {
      body: {
        SAMLResponse: req.headers.authorization,
      },
    };
  }

  const {
    extract: { attributes },
  } = await sp.parseLoginResponse(idp, 'post', requestToProcess);

  const user: User = _.mapValues(
    samlRespAttributes,
    (samlAttributeKey) => attributes[samlAttributeKey],
  );

  let relayState = null;
  if (req.body && req.body.RelayState) {
    relayState = req.body.RelayState;
  }

  const loginData = {
    token: requestToProcess.body.SAMLResponse,
    relayState,
    user,
  };

  return loginData;
};

export const verifyLogin = (next: Handler): Handler => async (req, res): Promise<void> => {
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

    res.status(401).json(errResp);
    return;
  }

  await next(req, res);
};
