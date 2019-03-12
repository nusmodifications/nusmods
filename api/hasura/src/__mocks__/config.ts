export default {
  databaseUrl: '',
  hasuraUrl: '',
  // Mail Token for verifying accounts
  mailTokenLifeTime: '1s',
  hasuraTokenNameSpace: '',
  // Access Token for obtaining information (aka Hasura Token)
  hasuraTokenSecretKey: '',
  hasuraTokenSecretAlgorithm: '',
  hasuraTokenLifeTime: '1s',
  // Refresh Token for obtaining Access Token (aka Long Lived Token)
  refreshTokenSecretKey: '',
  refreshTokenSecretAlgorithm: '',
  refreshTokenLifeTime: '1s',
};
