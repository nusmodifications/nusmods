import ms from 'ms';

// TODO: Give more descriptive errors if any environment variables are missing
type SecretEnv = { claims_namespace: string; key: string; type: string };
const hasuraConfig: SecretEnv = JSON.parse(process.env.HASURA_GRAPHQL_JWT_SECRET!);

const config = {
  databaseUrl: process.env.DATABASE_URL as string,
  hasuraUrl: process.env.HASURA_URL as string,
  mailApiKey: process.env.SENDGRID_API_KEY as string,
  mailAddress: 'noreply@nusmods.com',
  // Passcode for verifying accounts
  passcode: {
    verifyTimeout: ms('15m'),
    verifyLimit: 20,
    requestLimitResetTimeout: ms('5m'),
    requestLimit: 20,
  },
  // Access Token for obtaining information (aka Hasura Token)
  accessToken: {
    nameSpace: hasuraConfig.claims_namespace,
    secretKey: hasuraConfig.key,
    secretAlgorithm: hasuraConfig.type,
    lifeTime: ms('1d'),
  },
  // Refresh Token for obtaining Access Token (aka Long Lived Token)
  refreshToken: {
    secretKey: hasuraConfig.key,
    secretAlgorithm: hasuraConfig.type,
    lifeTime: ms('90d'),
  },
};

export default config;
