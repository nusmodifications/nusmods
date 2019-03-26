import crypto from 'crypto';
import base58 from './utils/base58';
import ExpiringMap from './utils/ExpiringMap';
import { RateLimitError } from './utils/errors';

/**
 * @typedef {Object} PasscodeConfig
 * @property {number} passcodeLength - number of characters in the passcode
 * @property {number} verifyTimeout - miliseconds since first verify to reset limit
 * @property {number} verifyLimit - number of times (inclusive) before rate limit is reached
 * @property {number} requestLimitResetTimeout -  miliseconds since first request to reset limit
 * @property {number} requestLimit - number of times (inclusive) before rate limit is reached
 */
type PasscodeConfig = {
  passcodeLength: number;
  verifyTimeout: number;
  verifyLimit: number;
  requestLimitResetTimeout: number;
  requestLimit: number;
};

/**
 * Authentication is the process of ascertaining that
 * somebody really is who they claim to be.
 *
 * AuthenticationService gives a passcode which should be sent to the
 * user through a transport which only they have access to,
 * such as email or sms, in order to verify their identify.
 * This flow is known as "passwordless", and care must taken to prevent
 * brute force attacks through rate limiting and short passcode lifetimes.
 *
 * This service allows retrieval of passcodes while managing expiry,
 * retries and rate limiting. While rate limiting here is applied
 * per email address, care should be taken to limit by IP address
 * as well in the proxy layer, using things like nginx.
 *
 * Passwordless FAQ: https://auth0.com/docs/connections/passwordless/faq
 * Passwordless flow diagram: https://auth0.com/docs/connections/passwordless/spa-email-link
 * Authentication definition: https://stackoverflow.com/a/6556548
 */
class AuthenticationService {
  private readonly passcodeMap: ExpiringMap<string, { passcode: string; verifyTimes: number }>;
  private readonly passcodeLength: number;
  private readonly passcodeBytes: number;
  private readonly requestRateLimitMap: ExpiringMap<string, number>;
  private readonly requestLimit: number;
  private readonly verifyLimit: number;

  /**
   * Constructs a service that allows retrieval of passcodes while managing expiry,
   * retries and rate limiting.
   *
   * @param {PasscodeConfig} passcodeConfig
   */
  constructor(passcodeConfig: PasscodeConfig) {
    this.passcodeMap = new ExpiringMap(passcodeConfig.verifyTimeout);
    this.passcodeLength = passcodeConfig.passcodeLength;
    this.passcodeBytes = AuthenticationService.getEncodingBytesLength(this.passcodeLength);
    this.verifyLimit = passcodeConfig.verifyLimit;
    this.requestRateLimitMap = new ExpiringMap(passcodeConfig.requestLimitResetTimeout);
    this.requestLimit = passcodeConfig.requestLimit;
  }

  /**
   * Base58 encodes 5.858 bits per character on average, so we need to calculate
   * the minimum number of bytes (8 bits) for the buffer, in order to generate
   * an encoded string that has at least the required length.
   *
   * @param length length of encoded string
   */
  private static getEncodingBytesLength(length: number) {
    const encodingFactor = 8 / 5.858;
    return Math.ceil(length * encodingFactor);
  }

  /**
   * Returns a new passcode until the number of tries
   * in user defined argument `requestLimit` has been exceeded.
   *
   * @param email user email address
   */
  request(email: string): string {
    const requestTimes = this.requestRateLimitMap.get(email) || 0;
    if (requestTimes >= this.requestLimit) {
      throw new RateLimitError();
    }
    this.requestRateLimitMap.set(email, requestTimes + 1);
    const buf = crypto.randomBytes(this.passcodeBytes);
    const passcode = base58.encode(buf).slice(0, this.passcodeLength);
    this.passcodeMap.set(email, { passcode, verifyTimes: 0 });
    return passcode;
  }

  /**
   * Checks that a passcode for a given email address is valid
   * until the number of tries in user defined argument
   * `verifyLimit` has been exceeded.
   *
   * @param email user email address
   * @param passcode mail passcode as keyed in by the user
   */
  verify(email: string, passcode: string): boolean {
    const verifyData = this.passcodeMap.get(email);

    if (!verifyData) {
      return false;
    }

    const { passcode: correctPasscode, verifyTimes } = verifyData;
    const isVerified = correctPasscode === passcode;
    if (isVerified) {
      this.passcodeMap.delete(email);
    } else if (verifyTimes >= this.verifyLimit) {
      throw new RateLimitError();
    } else {
      this.passcodeMap.set(email, { passcode: correctPasscode, verifyTimes: verifyTimes + 1 });
    }

    return isVerified;
  }

  cleanup() {
    this.passcodeMap.cleanup();
    this.requestRateLimitMap.cleanup();
  }
}

export default AuthenticationService;
