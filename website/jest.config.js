const commonConfig = require('./jest.common.config');

module.exports = {
  ...commonConfig,
  testRegex: 'src/.+\\.test\\.[jt]sx?$',
};
