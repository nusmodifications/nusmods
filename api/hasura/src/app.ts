import express from 'express';
import bodyParser from 'body-parser';
import expressPlayground from 'graphql-playground-middleware-express';
import config from './config';
import Database from './Database';
import admin from 'firebase-admin';
import config from './config.js';

const app = express();
app.disable('x-powered-by');
app.disable('etag');
app.use(bodyParser.json({ limit: '1kb' }));

// Host graphql playground
app.get('/playground', expressPlayground({ endpoint: config.hasuraUrl }));

const database = new Database(config.database);
// Initialize the Firebase admin SDK with your service account credentials
admin.initializeApp({
  credential: admin.credential.cert(config.serviceAccount),
});

app.get('/webhook', (req, res) => {
  // Get authorization headers
  const authHeaders = req.get('Authorization');
  // Send anonymous role if there are no auth headers
  if (!authHeaders) {
    return res.json({ 'x-hasura-role': 'anonymous' });
  }
  // Validate the received id_token
  const idToken = extractToken(authHeaders);
  console.log(idToken);
  admin
    .auth()
    .verifyIdToken(idToken)
    .then((decodedToken) => {
      const hasuraVariables = {
        'X-Hasura-User-Id': decodedToken.uid,
        'X-Hasura-Role': 'user',
      };
      console.log(hasuraVariables); // For debug
      // Send appropriate variables
      return res.json(hasuraVariables);
    })
    .catch((e) => {
      // Throw authentication error
      console.log(e);
      return res.json({ 'x-hasura-role': 'anonymous' });
    });
});

function extractToken(bearerToken: string) {
  const regex = /^Bearer (?<token>.*)$/g;
  const match = regex.exec(bearerToken);
  if (!(match && match.groups)) return null;
  return match.groups.token;
}

// Handle shutdowns gracefully, remove all handlers and connections
process.on('SIGTERM', () => {
  // Cleanup in the reverse order
  // authorizationService.cleanup();
  // authenticationService.cleanup();
  database.cleanup();
});

export default app;
