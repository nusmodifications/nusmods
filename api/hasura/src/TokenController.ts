import ExpiringMap from './ExpiringMap';
import crypto from 'crypto';
import base58 from './base58';

const RATE_LIMIT = 20;
const RATE_LIMIT_RESET_TIMEOUT = '5m';
const MAIL_TOKEN_SIZE = 16;

/**
 * The store allows retrieval of tokens while managing expiry,
 * retries and rate limiting. While rate limiting here is applied
 * per email address, care should be taken to limit by IP address
 * as well in the proxy layer, using things like nginx.
 */
class TokenController {
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
   * Request will return a new token until the number of tries
   * in user defined argument `` has been exceeded.
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
   * `verify` will check that a token for a given email address
   * is valid until the number of tries in user defined argument
   * `` has been exceeded.
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

export default TokenController;
