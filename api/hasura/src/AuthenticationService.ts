import ExpiringMap from './utils/ExpiringMap';
import crypto from 'crypto';
import base58 from './utils/base58';

const RATE_LIMIT = 20;
const RATE_LIMIT_RESET_TIMEOUT = '5m';
const MAIL_TOKEN_SIZE = 16;

/**
 * Authentication is the process of ascertaining that
 * somebody really is who they claim to be.
 *
 * AuthenticationService gives a token which should be sent to the
 * user through a transport which only they have access to,
 * such as email or sms, in order to verify their identify.
 * This flow is known as "passwordless", and care must taken to prevent
 * brute force attacks through rate limiting and short token lifetimes.
 *
 * This service allows retrieval of tokens while managing expiry,
 * retries and rate limiting. While rate limiting here is applied
 * per email address, care should be taken to limit by IP address
 * as well in the proxy layer, using things like nginx.
 *
 * Passwordless FAQ: https://auth0.com/docs/connections/passwordless/faq
 * Passwordless flow diagram: https://auth0.com/docs/connections/passwordless/spa-email-link
 * Authentication definition: https://stackoverflow.com/a/6556548
 */
class AuthenticationService {
  private tokenMap: ExpiringMap<string, { token: string; verifyTimes: number }>;
  private requestRateLimitMap: ExpiringMap<string, number>;
  private requestLimit: number;
  private verifyLimit: number;

  constructor(
    tokenTimeout: string,
    requestLimit: number = RATE_LIMIT,
    requestLimitResetTimeout: string = RATE_LIMIT_RESET_TIMEOUT,
    verifyLimit: number = RATE_LIMIT,
  ) {
    this.tokenMap = new ExpiringMap(tokenTimeout);
    this.requestRateLimitMap = new ExpiringMap(requestLimitResetTimeout);
    this.requestLimit = requestLimit;
    this.verifyLimit = verifyLimit;
  }

  /**
   * Returns a new token until the number of tries
   * in user defined argument `requestLimit` has been exceeded.
   *
   * @param email user email address
   */
  request(email: string): string | null {
    const requestTries = this.requestRateLimitMap.get(email) || 0;
    if (requestTries > this.requestLimit) {
      return null;
    }
    this.requestRateLimitMap.set(email, requestTries + 1);

    const buf = crypto.randomBytes(MAIL_TOKEN_SIZE);
    const token = base58.encode(buf);
    this.tokenMap.set(email, { token, verifyTimes: 0 });
    return token;
  }

  /**
   * Checks that a token for a given email address is valid
   * until the number of tries in user defined argument
   * `verifyLimit` has been exceeded.
   *
   * @param email user email address
   * @param token mail token as keyed in by the user
   */
  verify(email: string, token: string): boolean | null {
    const verifyData = this.tokenMap.get(email);

    if (!verifyData) {
      return false;
    }

    const { token: correctToken, verifyTimes } = verifyData;
    const isVerified = correctToken === token;
    if (!isVerified && verifyTimes > this.verifyLimit) {
      this.tokenMap.set(email, { token: correctToken, verifyTimes: verifyTimes + 1 });
      return null;
    }

    return isVerified;
  }

  cleanup() {
    this.tokenMap.cleanup();
    this.requestRateLimitMap.cleanup();
  }
}

export default AuthenticationService;
