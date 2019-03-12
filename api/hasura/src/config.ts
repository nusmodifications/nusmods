// TODO: Give more descriptive errors if any environment variables are missing
type SecretEnv = { claims_namespace: string; key: string; type: string };
const hasuraConfig: SecretEnv = JSON.parse(process.env.HASURA_GRAPHQL_JWT_SECRET!);

const config = {
  databaseUrl: process.env.DATABASE_URL,
  hasuraUrl: process.env.HASURA_URL as string,
  // Mail Token for verifying accounts
  mailTokenLifeTime: '15m',
  hasuraTokenNameSpace: hasuraConfig.claims_namespace,
  // Access Token for obtaining information (aka Hasura Token)
  hasuraTokenSecretKey: hasuraConfig.key,
  hasuraTokenSecretAlgorithm: hasuraConfig.type,
  hasuraTokenLifeTime: '1d',
  // Refresh Token for obtaining Access Token (aka Long Lived Token)
  refreshTokenSecretKey: hasuraConfig.key,
  refreshTokenSecretAlgorithm: hasuraConfig.type,
  refreshTokenLifeTime: '90d',
};

export default config;
