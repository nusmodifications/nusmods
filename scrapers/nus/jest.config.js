module.exports = {
  roots: ['<rootDir>/__mocks__', '<rootDir>/gulp-tasks'],
  // Node environment
  testEnvironment: 'node',
  collectCoverageFrom: ['**/*.{js,jsx}', '!**/node_modules/**', '!**/cache/**'],
  // Only write lcov files in CIs
  coverageReporters: ['text'].concat(process.env.CI ? 'lcov' : []),
};
