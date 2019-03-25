import { advanceBy } from 'jest-date-mock';
import AuthenticationService from './AuthenticationService';
import { RateLimitError } from './utils/errors';

const TEST_EMAIL = 'test@example.com';

jest.useFakeTimers();

describe(AuthenticationService, () => {
  let authService: AuthenticationService;
  const passcodeLength = 4;
  const duration = 10;
  const tick = duration + 20; // Allow slack

  beforeEach(() => {
    authService = new AuthenticationService({
      verifyTimeout: duration,
      verifyLimit: 1,
      requestLimitResetTimeout: duration,
      requestLimit: 1,
      passcodeLength: passcodeLength,
    });
  });

  describe('request', () => {
    it('should return a new passcode on request', () => {
      const passcode = authService.request(TEST_EMAIL);
      expect(typeof passcode).toBe('string');
    });

    it('should return passcode with length requested', () => {
      const passcode = authService.request(TEST_EMAIL);
      expect(passcode).toHaveLength(passcodeLength);
    });

    it('should throw error when request limit has exceeded', () => {
      expect(() => authService.request(TEST_EMAIL)).not.toThrowError();
      expect(() => authService.request(TEST_EMAIL)).toThrowError(RateLimitError);
    });
  });

  describe('verify', () => {
    it('should verify correct passcode', () => {
      const passcode = authService.request(TEST_EMAIL);
      expect(authService.verify(TEST_EMAIL, passcode)).toBe(true);
    });

    it('should not verify correct passcode twice', () => {
      const passcode = authService.request(TEST_EMAIL);
      expect(authService.verify(TEST_EMAIL, passcode)).toBe(true);
      expect(authService.verify(TEST_EMAIL, passcode)).toBe(false);
    });

    it('should throw error when verify limit has exceeded', () => {
      authService.request(TEST_EMAIL);
      expect(() => authService.verify(TEST_EMAIL, '')).not.toThrowError();
      expect(() => authService.verify(TEST_EMAIL, '')).toThrowError(RateLimitError);
    });

    it('should not throw error when timeout is over', () => {
      authService.request(TEST_EMAIL);
      expect(() => authService.verify(TEST_EMAIL, '')).not.toThrowError();
      expect(() => authService.verify(TEST_EMAIL, '')).toThrowError(RateLimitError);
      advanceBy(tick);
      expect(() => authService.verify(TEST_EMAIL, '')).not.toThrowError();
    });
  });
});
