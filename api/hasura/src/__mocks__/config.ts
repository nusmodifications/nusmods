export default {
  databaseUrl: '',
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
    nameSpace: '',
    secretKey: '',
    secretAlgorithm: '',
    lifeTime: 1,
  },
  // Refresh Token for obtaining Access Token (aka Long Lived Token)
  refreshToken: {
    secretKey: '',
    secretAlgorithm: '',
    lifeTime: 1,
  },
};
