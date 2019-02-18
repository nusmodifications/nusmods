import express from 'express';
import expressPlayground from 'graphql-playground-middleware-express';

const IS_DEV = process.env.NODE_ENV === 'development';
const HASURA_ENDPOINT = IS_DEV ? 'http://localhost:8080/v1alpha1/graphql' : 'TODO';

const app = express();

app.get('/playground', expressPlayground({ endpoint: HASURA_ENDPOINT }));

export default app.listen(8000);
