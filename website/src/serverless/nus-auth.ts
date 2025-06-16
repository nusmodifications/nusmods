import * as fs from 'fs';
import * as path from 'path';
import * as validator from '@authenio/samlify-node-xmllint';
import _ from 'lodash';
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

// Domains allowed as callback URLs
const allowedDomains = ['nusmods.com', 'nuscourses.com', 'modsn.us', 'localhost'];

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

let SP_FILE_PATH;
let FEDERATION_METADATA_FILE_PATH;
if (process.env.VERCEL_ENV === 'production') {
  SP_FILE_PATH = './sp.xml';
  FEDERATION_METADATA_FILE_PATH = './FederationMetadata.xml';
} else {
  SP_FILE_PATH = './sp-cpex-staging.xml';
  FEDERATION_METADATA_FILE_PATH = './FederationMetadata-cpex-staging.xml';
}

const idp = samlify.IdentityProvider({
  metadata: fs.readFileSync(path.join(__dirname, FEDERATION_METADATA_FILE_PATH)),
  isAssertionEncrypted: true,
});

const sp = samlify.ServiceProvider({
  metadata: fs.readFileSync(path.join(__dirname, SP_FILE_PATH)),
  encPrivateKey: process.env.NUS_EXCHANGE_SP_PRIVATE_KEY?.replace(/\\n/g, '\n'),
});

export const createLoginURL = (relayState = '') => {
  const { context } = sp.createLoginRequest(idp, 'redirect');
  const ssoLoginURL = new URL(context);
  ssoLoginURL.searchParams.append('RelayState', relayState);
  return ssoLoginURL.toString();
};

export const isCallbackUrlValid = (callbackUrl: string): boolean => {
  try {
    const url = new URL(callbackUrl);

    const validMatch = allowedDomains.some(
      (allowedDomain) =>
        url.hostname.endsWith(`.${allowedDomain}`) || url.hostname === allowedDomain,
    );

    if (!validMatch) {
      // eslint-disable-next-line no-console
      console.error('Invalid callback URL given by user:', callbackUrl);
    }

    return validMatch;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Invalid callback URL:', error);
    return false;
  }
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

export const verifyLogin =
  (next: Handler): Handler =>
  async (req, res): Promise<void> => {
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
        errResp.message = 'Invalid authentication, please login again';
        // eslint-disable-next-line no-console
        console.error(err);
      }

      res.status(401).json(errResp);
      return;
    }

    await next(req, res);
  };
