import express, { RequestHandler } from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import expressPlayground from 'graphql-playground-middleware-express';
import config from './config';
import mailService from './mailService';
import AuthenticationService from './AuthenticationService';
import AuthorizationService from './AuthorizationService';
import Database from './Database';
import HttpStatus from './utils/HttpStatus';
import { RateLimitError, JsonWebTokenError } from './utils/errors';

const IS_DEV = process.env.NODE_ENV === 'development';

const app = express();
app.disable('x-powered-by');
app.disable('etag');
app.use(bodyParser.json({ limit: '1kb' }));
app.use(cookieParser());

// Host graphql playground
app.get('/playground', expressPlayground({ endpoint: config.hasuraUrl }));

const database = new Database(config.database);
const authenticationService = new AuthenticationService(config.passcode);
const authorizationService = new AuthorizationService(
  database,
  config.accessToken,
  config.refreshToken,
);

const emailHandler: RequestHandler = (req, res, next) => {
  const email = req.body.email;
  if (!email) {
    return res
      .status(HttpStatus.BAD_REQUEST)
      .send('Missing field `email` of type string in post body.');
  }
  next();
};

// 1. User tries to create or log in to account,
//    client makes post request to /auth with email
//    server sends a code to email with lifetime of 15 minutes
app.post('/auth', emailHandler, (req, res) => {
  const { email } = req.body;
  try {
    const passcode = authenticationService.request(email);
    if (IS_DEV) {
      return res.send({ passcode });
    }

    return mailService
      .sendPasscode(email, passcode)
      .then(() => res.sendStatus(HttpStatus.ACCEPTED));
  } catch (e) {
    if (e instanceof RateLimitError) {
      return res
        .status(HttpStatus.TOO_MANY_REQUESTS)
        .send('Rate limit exceeded, please try again later.');
    }
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Unable to send mail');
  }
});

// 2. User recieves code on email, applies it on client,
//    client makes a post request to /verity with code
//    client receives a long lived refresh token and a short lived access token
//    client stores the access token using localstorage and similar alternatives
//    client stores the refresh token as a cookie
//    the cookie is http-only and so Javascript cannot access it
app.post('/verify', emailHandler, (req, res) => {
  const { email, passcode } = req.body;
  if (!passcode) {
    return res
      .status(HttpStatus.BAD_REQUEST)
      .send('Missing field `passcode` of type string in post body.');
  }

  try {
    const isVerified = authenticationService.verify(email, passcode);
    if (!isVerified) {
      return res.status(HttpStatus.UNAUTHORIZED).send('Invalid passcode');
    }

    authorizationService
      .createTokens(email, req.header('user-agent') || '')
      .then(({ accessToken, refreshToken, refreshTokenExpiryTime }) => {
        res.cookie('refresh', refreshToken, {
          path: '/auth',
          secure: true,
          httpOnly: true,
          expires: refreshTokenExpiryTime,
        });
        return res.send({ accessToken });
      });
  } catch (e) {
    // TODO: log error
    if (e instanceof RateLimitError) {
      return res
        .status(HttpStatus.TOO_MANY_REQUESTS)
        .send('Rate limit exceeded, please try again later.');
    }
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Unable to send mail');
  }
});

// 3. User while holding valid refresh token in cookies,
//    client makes a post request to /refresh
//    client receives a new short lived access token
app.post('/refresh', (req, res) => {
  const refreshToken = req.cookies.refresh;
  if (!refreshToken) {
    return res.sendStatus(HttpStatus.UNAUTHORIZED);
  }
  try {
    authorizationService.refreshAccessToken(refreshToken).then((accessToken) => {
      return res.send({ accessToken });
    });
  } catch (e) {
    if (e instanceof JsonWebTokenError) {
      return res.sendStatus(HttpStatus.UNAUTHORIZED);
    }
    // TODO: log error
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Unable to create access token');
  }
});

// 3. User can choose to logout, which removes current session
//    client should not be aware if refresh token is present or valid
const EPOCH = new Date(0);
app.post('/logout', (req, res) => {
  const refreshToken = req.cookies.refresh;

  if (!refreshToken) {
    return res.sendStatus(HttpStatus.NO_CONTENT);
  }

  authorizationService
    .revokeRefreshToken(refreshToken)
    .then(() => {
      // Send back empty string and past expiry date to delete cookie
      // Reference: https://stackoverflow.com/a/5285982
      res.cookie('refresh', '', {
        path: '/auth',
        secure: true,
        httpOnly: true,
        expires: EPOCH,
      });
      return res.sendStatus(HttpStatus.NO_CONTENT);
    })
    .catch((e) => {
      // TODO: log error
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Unable to log out');
    });
});

// Handle shutdowns gracefully, remove all handlers and connections
process.on('SIGTERM', () => {
  // Cleanup in the reverse order
  // authorizationService.cleanup();
  authenticationService.cleanup();
  database.cleanup();
});

export default app;
