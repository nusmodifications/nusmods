module.exports = {
  roots: [
    '<rootDir>/src',
  ],
  moduleDirectories: [
    'node_modules',
    'src/js',
  ],
  modulePaths: [
    '<rootDir>',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/.eslintrc.js',
  ],
  collectCoverageFrom: [
    'src/**/*.{js|jsx}',
  ],
  coveragePathIgnorePatterns: [
    'src/js/test_utils',
    'src/js/e2e',
    // Code in this file triggers this bug - https://github.com/istanbuljs/babel-plugin-istanbul/issues/116
    'src/js/views/modules/ModulePageContent.jsx',
  ],
  setupFiles: ['<rootDir>/scripts/test.js'],
  moduleNameMapper: {
    // Mock non js files for jest to process
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/__mocks__/fileMock.js',
    '\\.(css|scss)$': 'identity-obj-proxy',
  },
  // Allow us to directly use enzyme wrappers for snapshotting
  // Usage: expect(enzyme.shallow(<div/>)).toMatchSnapshot();
  snapshotSerializers: [
    '<rootDir>/node_modules/enzyme-to-json/serializer',
  ],
  // Only write lcov files in CIs
  coverageReporters: ['text'].concat(process.env.CI ? 'lcov' : []),
};
