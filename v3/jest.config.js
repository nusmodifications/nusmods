module.exports = {
  roots: [
    '<rootDir>/__tests__',
    '<rootDir>/src',
  ],
  moduleDirectories: [
    'node_modules',
    '<rootDir>/src/js',
  ],
  testPathIgnorePatterns: [
    '.eslintrc.js',
  ],
  collectCoverageFrom: [
    'src/**/*.{js|jsx}',
  ],
  // Only write lcov files in CIs
  coverageReporters: ['text'].concat(process.env.CI ? 'lcov' : []),
};
