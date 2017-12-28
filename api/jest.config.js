module.exports = {
  roots: [
    '<rootDir>/__mocks__',
    '<rootDir>/gulp-tasks',
    '<rootDir>/src',
  ],
  testPathIgnorePatterns: [
    '.eslintrc.js',
  ],
  // Node environment
  testEnvironment: 'node',
  collectCoverageFrom: ['**/*.{js,jsx}', '!**/node_modules/**', '!**/vendor/**'],
  // Only write lcov files in CIs
  coverageReporters: ['text'].concat(process.env.CI ? 'lcov' : []),
};
