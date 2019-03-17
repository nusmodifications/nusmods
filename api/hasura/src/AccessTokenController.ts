import jwt from 'jsonwebtoken';
import config from './config';
import Database from './db';

/**
 * This controller communicates with the database to return
 * the correct access role of the client.
 */
class AccessTokenController {
  private db: Database;

  constructor(database: Database) {
    this.db = database;
  }

  getAccessToken(email: string): Promise<string> {
    return new Promise((resolve, reject) => {
      jwt.sign(
        {
          [config.hasuraTokenNameSpace]: {
            'x-hasura-allowed-roles': ['user'],
            'x-hasura-default-role': 'user',
          },
        },
        config.hasuraTokenSecretKey,
        {
          algorithm: config.hasuraTokenSecretAlgorithm,
          expiresIn: config.hasuraTokenLifeTime,
        },
        (err, token) => {
          if (err) {
            reject(err);
          } else {
            resolve(token);
          }
        },
      );
    });
  }
}

export default AccessTokenController;
