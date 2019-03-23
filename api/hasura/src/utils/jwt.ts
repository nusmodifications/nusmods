import jwt from 'jsonwebtoken';
import { JsonWebTokenError } from './errors';

/**
 * Promise version of jwt.sign.
 * Does not use util.promisfy
 * because overloading and typescript don't mix.
 */
function generateToken(
  payload: object,
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

/**
 * Promise version of jwt.verify.
 */
function decodeToken(token: string, secret: string, options: jwt.SignOptions): Promise<object> {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, options, (err, decoded) => {
      if (err) {
        reject(err);
      } else if (typeof decoded === 'string') {
        reject(new JsonWebTokenError('Payload is of type string, expected an object'));
      } else {
        resolve(decoded);
      }
    });
  });
}

export default {
  generateToken,
  decodeToken,
};
