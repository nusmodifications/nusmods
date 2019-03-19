import ExpiringMap from './utils/ExpiringMap';
import crypto from 'crypto';
import base58 from './utils/base58';

const PASSCODE_SIZE = 16;

type PasscodeConfig = {
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
  private readonly requestRateLimitMap: ExpiringMap<string, number>;
  private readonly requestLimit: number;
  private readonly verifyLimit: number;

  constructor(passcodeConfig: PasscodeConfig) {
    this.passcodeMap = new ExpiringMap(passcodeConfig.verifyTimeout);
    this.verifyLimit = passcodeConfig.verifyLimit;
    this.requestRateLimitMap = new ExpiringMap(passcodeConfig.requestLimitResetTimeout);
    this.requestLimit = passcodeConfig.requestLimit;
  }

  /**
   * Returns a new passcode until the number of tries
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

    const buf = crypto.randomBytes(PASSCODE_SIZE);
    const passcode = base58.encode(buf);
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
  verify(email: string, passcode: string): boolean | null {
    const verifyData = this.passcodeMap.get(email);

    if (!verifyData) {
      return false;
    }

    const { passcode: correctPasscode, verifyTimes } = verifyData;
    const isVerified = correctPasscode === passcode;
    if (!isVerified && verifyTimes > this.verifyLimit) {
      this.passcodeMap.set(email, { passcode: correctPasscode, verifyTimes: verifyTimes + 1 });
      return null;
    }

    return isVerified;
  }

  cleanup() {
    this.passcodeMap.cleanup();
    this.requestRateLimitMap.cleanup();
  }
}

export default AuthenticationService;
