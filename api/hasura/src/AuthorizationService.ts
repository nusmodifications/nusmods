import Database from './Database';
import jwt from './utils/jwt';
import { InvalidTokenError, TokenExpiredError } from './utils/errors';

type AccessTokenConfig = {
  nameSpace: string;
  secretKey: string;
  secretAlgorithm: string;
  lifeTime: number;
};

type RefreshTokenConfig = {
  secretKey: string;
  secretAlgorithm: string;
  lifeTime: number;
};

type RefreshTokenPayload = {
  sessionId: string;
};

/**
 * Authorization refers to rules that determine who is allowed to do what.
 *
 * This controller communicates with the database to return
 * the correct access role of the client.
 *
 * Authorization definition: https://stackoverflow.com/a/6556548
 */
class AuthorizationService {
  private readonly db: Database;
  private accessTokenConfig: Readonly<AccessTokenConfig>;
  private refreshTokenConfig: Readonly<RefreshTokenConfig>;

  constructor(
    database: Database,
    accessTokenConfig: AccessTokenConfig,
    refreshTokenConfig: RefreshTokenConfig,
  ) {
    this.db = database;
    this.accessTokenConfig = accessTokenConfig;
    this.refreshTokenConfig = refreshTokenConfig;
  }

  async createAccessToken(accountId: string): Promise<string> {
    return jwt.generateToken(
      {
        [this.accessTokenConfig.nameSpace]: {
          'x-hasura-allowed-roles': ['user'],
          'x-hasura-default-role': 'user',
          'x-hasura-account-id': accountId,
        },
      },
      this.accessTokenConfig.secretKey,
      {
        algorithm: this.accessTokenConfig.secretAlgorithm,
        expiresIn: this.accessTokenConfig.lifeTime,
      },
    );
  }

  async createRefreshToken(
    accountId: string,
    userAgent: string,
  ): Promise<{ token: string; expiryTime: Date }> {
    const expiryTime = new Date(Date.now() + this.refreshTokenConfig.lifeTime);
    const sessionId = await this.db.createSession(accountId, expiryTime, userAgent);

    const token = await jwt.generateToken({ sessionId }, this.refreshTokenConfig.secretKey, {
      algorithm: this.refreshTokenConfig.secretAlgorithm,
      expiresIn: this.refreshTokenConfig.lifeTime,
    });

    return {
      token,
      expiryTime,
    };
  }

  async createTokens(email: string, userAgent: string) {
    const accountId = await this.db.findOrCreateUser(email);
    const accessToken = await this.createAccessToken(accountId);
    const {
      token: refreshToken,
      expiryTime: refreshTokenExpiryTime,
    } = await this.createRefreshToken(accountId, userAgent);
    return {
      accessToken,
      refreshToken,
      refreshTokenExpiryTime,
    };
  }

  async decodeRefreshToken(refreshToken: string): Promise<RefreshTokenPayload> {
    const decoded = await jwt.decodeToken(refreshToken, this.refreshTokenConfig.secretKey, {
      algorithm: this.refreshTokenConfig.secretAlgorithm,
    });
    const keys = Object.keys(decoded);
    if (keys.length !== 1 || keys[0] !== 'sessionId') {
      throw new InvalidTokenError(`Only a single key 'sessionId' is allowed in token`);
    }
    // Unable to refine type to recognise 'sessionId' is in payload
    // See: https://github.com/Microsoft/TypeScript/issues/21732
    const refreshPayload = decoded as RefreshTokenPayload;
    if (typeof refreshPayload.sessionId !== 'string') {
      throw new InvalidTokenError(`Value of 'sessionId' must be of type string`);
    }
    return refreshPayload;
  }

  async refreshAccessToken(refreshToken: string): Promise<string> {
    const token = await this.decodeRefreshToken(refreshToken);
    const session = await this.db.findSession(token.sessionId);
    if (session.expiresAt >= new Date()) {
      throw new TokenExpiredError('Refresh token has expired', session.expiresAt);
    }

    return this.createAccessToken(session.accountId);
  }
}

export default AuthorizationService;
