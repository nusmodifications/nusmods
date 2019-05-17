const commonConfig = require('./jest.common.config');

// We explicitly split integration test out because we want to conduct fuzzing tests
// which would make coverage data random
module.exports = {
  ...commonConfig,
  testRegex: 'src/.+\\.integration\\.[jt]sx?$',
  collectCoverage: false,
};
