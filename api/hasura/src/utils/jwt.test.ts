import jwt from './jwt';
import { advanceTo } from 'jest-date-mock';
import config from '../config';
import { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';

jest.mock('../config');
jest.useFakeTimers();

const PAYLOAD = 'payload';
const VALID_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjoicGF5bG9hZCIsImlhdCI6MTU1MzYyMjQ5NywiZXhwIjoxNTUzNjIyNDk4fQ.F8NkU9aXfcP_PapbcB4NFwaknsNPO6lqLF2dKS6X8_Y';
const TOKEN_EXPIRY_TIME = 1553622498 * 1000;

describe(jwt.generateToken, () => {
  it('should generate valid token', async () => {
    expect.assertions(2);
    const token = await jwt.generateToken({ payload: PAYLOAD }, config.accessToken.secretKey, {
      algorithm: config.accessToken.secretAlgorithm,
      expiresIn: config.accessToken.lifeTime,
    });
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThanOrEqual(100);
  });

  it('should throw if token generation has errors', async () => {
    const invalidPayload = (undefined as unknown) as object;
    await expect(
      jwt.generateToken(invalidPayload, config.accessToken.secretKey, {
        algorithm: config.accessToken.secretAlgorithm,
        expiresIn: config.accessToken.lifeTime,
      }),
    ).rejects.toThrowError();
  });
});

describe(jwt.decodeToken, () => {
  beforeAll(() => {
    advanceTo(); // Go to 0 epoch
  });

  it('should decode valid token', async () => {
    expect.assertions(1);
    const token = await jwt.decodeToken(VALID_TOKEN, config.accessToken.secretKey, {
      algorithm: config.accessToken.secretAlgorithm,
      expiresIn: config.accessToken.lifeTime,
    });
    expect(token).toEqual({ payload: PAYLOAD, exp: 1553622498, iat: 1553622497 });
  });

  it('should throw when token has expired', async () => {
    advanceTo(TOKEN_EXPIRY_TIME);
    await expect(
      jwt.decodeToken(VALID_TOKEN, config.accessToken.secretKey, {
        algorithm: config.accessToken.secretAlgorithm,
        expiresIn: config.accessToken.lifeTime,
      }),
    ).rejects.toThrowError(TokenExpiredError);
  });

  it('should throw when token payload is string', async () => {
    const stringToken =
      'eyJhbGciOiJIUzI1NiJ9.cGF5bG9hZA.4GMt2k_zZryxhKgC8_HvdSZtYxyEyDa0AFIL-n60a8M';
    await expect(
      jwt.decodeToken(stringToken, config.accessToken.secretKey, {
        algorithm: config.accessToken.secretAlgorithm,
        expiresIn: config.accessToken.lifeTime,
      }),
    ).rejects.toThrowError(JsonWebTokenError);
  });

  it('should throw when token is invalid', async () => {
    await expect(
      jwt.decodeToken('', config.accessToken.secretKey, {
        algorithm: config.accessToken.secretAlgorithm,
        expiresIn: config.accessToken.lifeTime,
      }),
    ).rejects.toThrowError(JsonWebTokenError);
  });
});
