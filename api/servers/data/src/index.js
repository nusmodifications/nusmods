import Koa from 'koa';

import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import { graphqlKoa, graphiqlKoa } from 'apollo-server-koa';
import koaPlayground from 'graphql-playground-middleware-koa';

import Boom from 'boom';
import loggerMiddleware from 'koa-bunyan-logger';
import errorMiddleware from './middleware/error';

import log from './util/log';
import schema from './graphql';

const app = new Koa();
const router = new Router();

// Register middleware
app.use(bodyParser());
app.use(loggerMiddleware(log));
app.use(loggerMiddleware.requestIdContext());
app.use(loggerMiddleware.requestLogger());
app.use(errorMiddleware());

// Registers routes
router.post('/graphql', graphqlKoa({ schema, tracing: true }));
router.get('/graphiql', graphiqlKoa({ endpointURL: '/graphql' }));
router.get('/playground', koaPlayground({ endpoint: '/graphql' }));

app.use(router.routes());
app.use(
  router.allowedMethods({
    throw: true,
    notImplemented: () => new Boom.notImplemented(), // eslint-disable-line new-cap
    methodNotAllowed: () => new Boom.methodNotAllowed(), // eslint-disable-line new-cap
  }),
);

log.info('current environment: %s', process.env.NODE_ENV);
log.info('server started at port: %d', process.env.PORT || 3000);
app.listen(process.env.PORT || 3000);
