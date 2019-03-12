import http from 'http';
import express from 'express';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import expressPlayground from 'graphql-playground-middleware-express';
import config from './config'
import token from './token';

const app = express();
app.use(bodyParser.json({ limit: '1kb' }));

// Host graphql playground
app.get('/playground', expressPlayground({ endpoint: config.hasuraUrl }));

// 1. User tries to create or log in to account,
//    client makes post request to /auth with email
//    server sends a code to email with lifetime of 15 minutes
app.post('/auth', (req, res) => {

});

// 2. User recieves code on email, applies it on client,
//    client makes a post request to /verity with code
//    client receives a long lived refresh token and a short lived access token
//    client stores both tokens
app.post('/verify', (req, res) => {
  token.getAccessToken()
});

// 3. User while holding valid refresh token and expired access token,
//    client makes a post request to /refresh with both tokens
//    client receives a new short lived access token
// app.post('/refresh', (req, res) => {});

// 4. Admin while holding valid secret,
//    Admin makes a post request to /invalidate with optional id
//    server flushes appropriate long lived refresh token
// app.post('/invalidate:id', (req, res) => {})

// Export default for fusebox to hotreload
// Using http.createServer to get access to .close method
export default http.createServer(app).listen(process.env.PORT);
