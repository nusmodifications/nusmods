import jwt from 'jsonwebtoken';

import config from './config';

function getRefreshToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    jwt.sign(
      {},
      config.refreshTokenSecretKey,
      {
        algorithm: config.refreshTokenSecretAlgorithm,
        expiresIn: config.refreshTokenLifeTime,
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
  getRefreshToken,
};
