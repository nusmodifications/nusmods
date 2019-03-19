import express from 'express';
import bodyParser from 'body-parser';
import expressPlayground from 'graphql-playground-middleware-express';
import config from './config';
import mailService from './mailService';
import AuthenticationService from './AuthenticationService';
import AuthorizationService from './AuthorizationService';
import Database from './Database';
import HttpStatus from './utils/HttpStatus';

const app = express();
app.use(bodyParser.json({ limit: '1kb' }));

// Host graphql playground
app.get('/playground', expressPlayground({ endpoint: config.hasuraUrl }));

const database = new Database(config.databaseUrl);
const authenticationService = new AuthenticationService(config.passcode);
const authorizationService = new AuthorizationService(
  database,
  config.accessToken,
  config.refreshToken,
);

// 1. User tries to create or log in to account,
//    client makes post request to /auth with email
//    server sends a code to email with lifetime of 15 minutes
app.post('/auth', (req, res) => {
  const email = req.body.email;
  if (!email) {
    return res
      .status(HttpStatus.BAD_REQUEST)
      .send('Missing field `email` of type string in post body.');
  }

  const passcode = authenticationService.request(email);
  if (!passcode) {
    return res
      .status(HttpStatus.TOO_MANY_REQUESTS)
      .send('Rate limit exceeded, please try again later.');
  }

  if (!config.mailAddress) {
    return res.send({ passcode });
  }
  mailService
    .sendPasscode(email, passcode)
    .then(() => {
      res.sendStatus(HttpStatus.ACCEPTED);
    })
    .catch(() => {
      // TODO: log error
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Unable to send mail');
    });
});

// 2. User recieves code on email, applies it on client,
//    client makes a post request to /verity with code
//    client receives a long lived refresh token and a short lived access token
//    client stores the access token using localstorage and similar alternatives
//    client stores the refresh token as a cookie
//    the cookie is http-only and so Javascript cannot access it
app.post('/verify', (req, res) => {
  const email = req.body.email;
  if (!email) {
    return res
      .status(HttpStatus.BAD_REQUEST)
      .send('Missing field `email` of type string in post body.');
  }
  const token = req.body.token;
  if (!token) {
    return res
      .status(HttpStatus.BAD_REQUEST)
      .send('Missing field `token` of type string in post body.');
  }
  const mailToken = authenticationService.verify(email, token);
  if (mailToken == null) {
    return res
      .status(HttpStatus.TOO_MANY_REQUESTS)
      .send('Rate limit exceeded, please try again later.');
  } else if (!mailToken) {
    return res.status(HttpStatus.UNAUTHORIZED).send('Invalid token');
  }

  authorizationService
    .createTokens(email, req.header('user-agent') || '')
    .then(({ accessToken, refreshToken, refreshTokenExpiryTime }) => {
      // res.header('set-cookie')
      return res.send({ accessToken });
    })
    .catch(() => {
      // TODO: log error
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Unable to create access token');
    });
});

// 3. User while holding valid refresh token and expired access token,
//    client makes a post request to /refresh with both tokens
//    client receives a new short lived access token
// app.post('/refresh', (req, res) => {});

// Handle shutdowns gracefully, remove all handlers and connections
process.on('SIGTERM', () => {
  // Cleanup in the reverse order
  // authorizationService.cleanup();
  authenticationService.cleanup();
  database.cleanup();
});

export default app;
