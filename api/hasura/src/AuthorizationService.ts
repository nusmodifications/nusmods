import jwt from 'jsonwebtoken';

import Database from './Database';

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

  /**
   * Promise version of jwt.sign.
   * Does not use util.promisfy
   * because overloading and typescript don't mix.
   */
  private generateToken(
    payload: string | object,
    secret: jwt.Secret,
    options: jwt.SignOptions,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      jwt.sign(payload, secret, options, (err, token) => {
        if (err) {
          reject(err);
        } else {
          resolve(token);
        }
      });
    });
  }

  async createAccessToken(accountId: string): Promise<string> {
    return this.generateToken(
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

    const token = await this.generateToken(sessionId, this.refreshTokenConfig.secretKey, {
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
}

export default AuthorizationService;
