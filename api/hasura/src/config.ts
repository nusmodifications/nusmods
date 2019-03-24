import configUtils from './utils/configUtils';

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const hasuraConfig = configUtils.getSecretEnv('HASURA_GRAPHQL_JWT_SECRET');

const config = {
  database: {
    connectionString: configUtils.getEnv('DATABASE_URL'),
    maxConnections: parseInt(process.env.DATABASE_MAX_CONNECTIONS as string, 10) || 10,
  },
  hasuraUrl: configUtils.getEnv('HASURA_URL'),
  mailApiKey: configUtils.getEnv('SENDGRID_API_KEY'),
  mailAddress: 'noreply@nusmods.com',
  // Passcode for verifying accounts
  passcode: {
    passcodeLength: 6,
    verifyTimeout: 5 * MINUTE,
    verifyLimit: 20,
    requestLimitResetTimeout: 5 * MINUTE,
    requestLimit: 20,
  },
  // Access Token for obtaining information (aka Hasura Token)
  accessToken: {
    nameSpace: hasuraConfig.claims_namespace,
    secretKey: hasuraConfig.key,
    secretAlgorithm: hasuraConfig.type,
    lifeTime: 16 * HOUR,
  },
  // Refresh Token for obtaining Access Token (aka Long Lived Token)
  refreshToken: {
    secretKey: hasuraConfig.key,
    secretAlgorithm: hasuraConfig.type,
    lifeTime: 90 * DAY,
  },
};

function readonly<T>(x: T): Readonly<T> {
  return x;
}

export default readonly(config);
