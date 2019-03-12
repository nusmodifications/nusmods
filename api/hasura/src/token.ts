import jwt from 'jsonwebtoken';
import crypto from 'crypto';

import base58 from './base58';
import config from './config';

const MAIL_TOKEN_SIZE = 16;

function getMailToken(): string {
  const buf = crypto.randomBytes(MAIL_TOKEN_SIZE);
  return base58.encode(buf);
}

function getAccessToken(): Promise<string> {
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

// TODO: Implement:
// async function refresh() {}
export default {
  getMailToken,
  getAccessToken,
};
