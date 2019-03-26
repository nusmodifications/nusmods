import request from 'supertest';
import app from './app';
import mailService from './mailService';
import AuthenticationService from './AuthenticationService';
import AuthorizationService from './AuthorizationService';
import HttpStatus from './utils/HttpStatus';
import { RateLimitError } from './utils/errors';

const TEST_EMAIL = 'test@example.com';
const PLACEHOLDER = 'placeholder';

jest.mock('./config');
jest.mock('./AuthenticationService');
jest.mock('./AuthenticationService');
jest.mock('./AuthorizationService');
jest.mock('./mailService');

describe(app, () => {
  describe('/auth', () => {
    const mockedMailService = mailService as jest.Mocked<typeof mailService>;
    mockedMailService.sendPasscode.mockImplementation(() => Promise.resolve());

    let authEndpoint: request.Test;
    beforeEach(() => {
      authEndpoint = request(app).post('/auth');
    });

    it('should be successful if mail was sent', (done) => {
      authEndpoint
        .send({ email: TEST_EMAIL })
        .expect(HttpStatus.ACCEPTED)
        .end(done);
    });

    it('should return bad request if body does not contain mail', (done) => {
      authEndpoint
        .send({})
        .expect(HttpStatus.BAD_REQUEST)
        .end(done);
    });

    it('should rate limit if rate limit ceiling is hit', (done) => {
      jest.spyOn(AuthenticationService.prototype, 'request').mockImplementationOnce(() => {
        throw new RateLimitError();
      });

      authEndpoint
        .send({ email: TEST_EMAIL })
        .expect(HttpStatus.TOO_MANY_REQUESTS)
        .end(done);
    });

    it('should error if mail was not sent', (done) => {
      mockedMailService.sendPasscode.mockImplementationOnce(() => {
        throw new Error();
      });

      authEndpoint
        .send({ email: TEST_EMAIL })
        .expect(HttpStatus.INTERNAL_SERVER_ERROR)
        .end(done);
    });
  });

  describe('/verify', () => {
    let verifyEndpoint: request.Test;

    beforeEach(() => {
      verifyEndpoint = request(app).post('/verify');
    });

    const spyVerifyImplementation = jest.spyOn(AuthenticationService.prototype, 'verify')
      .mockImplementationOnce;
    const spyCreateTokensImplementation = jest.spyOn(AuthorizationService.prototype, 'createTokens')
      .mockImplementationOnce;

    it('should be successful if verification details are correct', (done) => {
      spyVerifyImplementation(() => true);
      const accessToken = 'accessToken';
      spyCreateTokensImplementation(() =>
        Promise.resolve({
          accessToken,
          refreshToken: '',
          refreshTokenExpiryTime: new Date(0),
        }),
      );

      verifyEndpoint
        .send({ email: TEST_EMAIL, passcode: PLACEHOLDER })
        .expect(HttpStatus.OK, {
          accessToken,
        })
        .expect(
          'set-cookie',
          'refresh=; Path=/auth; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure',
        )
        .end(done);
    });

    it('should return bad request if body does not contain mail', (done) => {
      verifyEndpoint
        .send({ passcode: PLACEHOLDER })
        .expect(HttpStatus.BAD_REQUEST)
        .end(done);
    });

    it('should return bad request if body does not contain passcode', (done) => {
      verifyEndpoint
        .send({ email: TEST_EMAIL })
        .expect(HttpStatus.BAD_REQUEST)
        .end(done);
    });

    it('should return unauthorized if verification fails', (done) => {
      spyVerifyImplementation(() => false);
      verifyEndpoint
        .send({ email: TEST_EMAIL, passcode: PLACEHOLDER })
        .expect(HttpStatus.UNAUTHORIZED)
        .end(done);
    });

    it('should rate limit if rate limit ceiling is hit', (done) => {
      spyVerifyImplementation(() => {
        throw new RateLimitError();
      });
      verifyEndpoint
        .send({ email: TEST_EMAIL, passcode: PLACEHOLDER })
        .expect(HttpStatus.TOO_MANY_REQUESTS)
        .end(done);
    });

    it('should error if unknown error is thrown', (done) => {
      spyVerifyImplementation(() => {
        throw new Error();
      });
      verifyEndpoint
        .send({ email: PLACEHOLDER, passcode: PLACEHOLDER })
        .expect(HttpStatus.INTERNAL_SERVER_ERROR)
        .end(done);
    });

    it('should error if tokens could not be sent', (done) => {
      spyVerifyImplementation(() => true);
      spyCreateTokensImplementation(() => {
        throw new Error();
      });
      verifyEndpoint
        .send({ email: PLACEHOLDER, passcode: PLACEHOLDER })
        .expect(HttpStatus.INTERNAL_SERVER_ERROR)
        .end(done);
    });
  });

  describe('/*', () => {
    it('should return not found if path is unknown', (done) => {
      request(app)
        .post('/unknown')
        .expect(HttpStatus.NOT_FOUND)
        .end(done);
    });
  });
});
