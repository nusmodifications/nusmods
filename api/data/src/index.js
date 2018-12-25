import { ApolloServer } from 'apollo-server';
import playgroundConfig from './config/graphqlPlayground';
import log from './util/log';

function makeServer() {
  // enable hot-reload server side
  // eslint-disable-next-line global-require
  const graphqlSchema = require('./graphql').default;
  return new ApolloServer({
    typeDefs: graphqlSchema.typeDefs,
    /* Apollo is mutating resolvers */
    resolvers: { ...graphqlSchema.resolvers },
    playground: playgroundConfig,
    formatError: (error) => {
      log.error(error);
      return error;
    },
    formatResponse: (response) => {
      log.info(response);
      return response;
    },
  });
}

let serverInstance = makeServer();
serverInstance.listen(process.env.PORT).then(({ url }) => {
  log.info(`🚀  Server ready at ${url}`);
});

if (module.hot) {
  module.hot.accept('./graphql', async () => {
    await serverInstance.stop();
    serverInstance = makeServer();
    await serverInstance.listen(process.env.PORT);
  });
}
