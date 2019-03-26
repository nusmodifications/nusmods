import configUtils from '../utils/configUtils';

export default {
  database: {
    connectionString: configUtils.getEnv('DATABASE_URL'),
    maxConnections: 1,
  },
  hasuraUrl: '',
  mailApiKey: '',
  mailAddress: '',
  // Passcode for verifying accounts
  passcode: {
    verifyTimeout: 1,
    verifyLimit: 20,
    requestLimitResetTimeout: 1,
    requestLimit: 20,
  },
  // Access Token for obtaining information (aka Hasura Token)
  accessToken: {
    nameSpace: 'nameSpace',
    secretKey: 'secret',
    secretAlgorithm: 'HS256',
    lifeTime: 1,
  },
  // Refresh Token for obtaining Access Token (aka Long Lived Token)
  refreshToken: {
    secretKey: 'secret',
    secretAlgorithm: 'HS256',
    lifeTime: 1,
  },
};
