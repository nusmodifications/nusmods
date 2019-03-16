export default {
  databaseUrl: '',
  hasuraUrl: '',
  // Mail Token for verifying accounts
  mailAddress: '',
  mailApiKey: '',
  mailTokenLifeTime: '1s',
  // Access Token for obtaining information (aka Hasura Token)
  hasuraTokenNameSpace: '',
  hasuraTokenSecretKey: '',
  hasuraTokenSecretAlgorithm: '',
  hasuraTokenLifeTime: '1s',
  // Refresh Token for obtaining Access Token (aka Long Lived Token)
  refreshTokenSecretKey: '',
  refreshTokenSecretAlgorithm: '',
  refreshTokenLifeTime: '1s',
};
