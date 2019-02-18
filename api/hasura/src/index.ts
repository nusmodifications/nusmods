import http from 'http';
import express from 'express';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import expressPlayground from 'graphql-playground-middleware-express';

const IS_DEV = process.env.NODE_ENV === 'development';
const HASURA_ENDPOINT = IS_DEV ? 'http://localhost:8080/v1alpha1/graphql' : 'TODO';
const JWT_SECRET: { key: string; type: string } = JSON.parse(process.env.JWT_SECRET!);

const app = express();
app.use(bodyParser.json({ limit: '1kb' }));

// Host graphql playground
app.get('/playground', expressPlayground({ endpoint: HASURA_ENDPOINT }));

app.post('/auth', (req, res) => {
  jwt.sign(
    {
      'https://hasura.io/jwt/claims': {
        'x-hasura-allowed-roles': ['user'],
        'x-hasura-default-role': 'user',
        'x-hasura-user-id': '1234567890',
      },
    },
    JWT_SECRET.key,
    { algorithm: JWT_SECRET.type, expiresIn: '15m' },
    function onSignCallback(err, token) {
      if (err) {
        return res.sendStatus(500);
      }
      res.status(201).send({
        access_token: token,
      });
    },
  );
});

// Export default for fusebox to hotreload
// Using http.createServer to get access to .close method
export default http.createServer(app).listen(8081);
