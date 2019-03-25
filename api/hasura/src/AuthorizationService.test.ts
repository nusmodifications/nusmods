import AuthorizationService from './AuthorizationService';
import Database from './Database';
import { InvalidTokenError, TokenExpiredError } from './utils/errors';

const TEST_EMAIL = 'test@example.com';

jest.useFakeTimers();
jest.mock('./Database');

describe(AuthorizationService, () => {
  let authService: AuthorizationService;
  let db: any;
  const userAgent = 'test user agent';

  beforeEach(() => {
    db = new Database({ connectionString: '', maxConnections: 1 });
    authService = new AuthorizationService(
      db,
      {
        nameSpace: 'namespace',
        secretKey: 'secret',
        secretAlgorithm: 'HS256',
        lifeTime: 100,
      },
      {
        secretKey: 'secret',
        secretAlgorithm: 'HS256',
        lifeTime: 100,
      },
    );
  });

  describe('createTokens', () => {
    it('should return valid tokens', async () => {
      expect.assertions(3);
      const tokens = await authService.createTokens(TEST_EMAIL, userAgent);
      expect(typeof tokens.accessToken).toBe('string');
      expect(typeof tokens.refreshToken).toBe('string');
      expect(tokens.refreshTokenExpiryTime).toBeInstanceOf(Date);
    });
  });

  describe('decodeRefreshToken', () => {
    it('should decode valid tokens', async () => {
      expect.assertions(1);
      db.createSession.mockResolvedValue('test');
      const tokens = await authService.createTokens(TEST_EMAIL, userAgent);
      await expect(authService.decodeRefreshToken(tokens.refreshToken)).resolves.toHaveProperty(
        'sessionId',
      );
    });

    it('should throw if there is no sessionId', async () => {
      expect.assertions(1);
      db.createSession.mockResolvedValue(undefined);
      const tokens = await authService.createTokens(TEST_EMAIL, userAgent);
      await expect(authService.decodeRefreshToken(tokens.refreshToken)).rejects.toThrowError(
        InvalidTokenError,
      );
    });

    it('should throw if sessionId is not of type string', async () => {
      expect.assertions(1);
      db.createSession.mockResolvedValue(5);
      const tokens = await authService.createTokens(TEST_EMAIL, userAgent);
      await expect(authService.decodeRefreshToken(tokens.refreshToken)).rejects.toThrowError(
        InvalidTokenError,
      );
    });
  });

  describe('refreshAccessToken', () => {
    it('should refresh valid session', async () => {
      expect.assertions(1);
      db.createSession.mockResolvedValue('test');
      db.findSession.mockResolvedValue({
        accountId: 'test',
        expiresAt: new Date(Date.now() + 500),
      });
      const { refreshToken } = await authService.createTokens(TEST_EMAIL, userAgent);
      const accessToken = await authService.refreshAccessToken(refreshToken);
      expect(typeof accessToken).toBe('string');
    });

    it('should not refresh valid session', async () => {
      expect.assertions(1);
      db.createSession.mockResolvedValue('test');
      db.findSession.mockResolvedValue({
        accountId: 'test',
        expiresAt: new Date(Date.now() - 500),
      });
      const { refreshToken } = await authService.createTokens(TEST_EMAIL, userAgent);
      await expect(authService.refreshAccessToken(refreshToken)).rejects.toThrowError(
        TokenExpiredError,
      );
    });
  });
});
