import jwt from 'jsonwebtoken';
import config from './config';
import Database from './Database';

/**
 * Authorization refers to rules that determine who is allowed to do what.
 *
 * This controller communicates with the database to return
 * the correct access role of the client.
 *
 * Authorization definition: https://stackoverflow.com/a/6556548
 */
class AuthorizationService {
  private db: Database;

  constructor(database: Database) {
    this.db = database;
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

  async getAccessToken(email: string): Promise<string> {
    const accountId = await this.db.findOrCreateUser(email);
    return this.generateToken(
      {
        [config.hasuraTokenNameSpace]: {
          'x-hasura-allowed-roles': ['user'],
          'x-hasura-default-role': 'user',
          'x-hasura-account-id': accountId,
        },
      },
      config.hasuraTokenSecretKey,
      {
        algorithm: config.hasuraTokenSecretAlgorithm,
        expiresIn: config.hasuraTokenLifeTime,
      },
    );
  }

  async getRefreshToken(email: string, userAgent: string): Promise<string> {
    const accountId = await this.db.findOrCreateUser(email);
    const sessionId = await this.db.createSession(accountId, userAgent);
    return this.generateToken(sessionId, config.refreshTokenSecretKey, {
      algorithm: config.refreshTokenSecretAlgorithm,
      expiresIn: config.refreshTokenLifeTime,
    });
  }
}

export default AuthorizationService;
