module.exports = {
  roots: ['<rootDir>/src/js'],
  moduleDirectories: ['node_modules', '<rootDir>/src/js'],
  moduleFileExtensions: ['jsx', 'js'],
  testPathIgnorePatterns: [],
  testRegex: 'src/js/.+\\.test\\.jsx?$',
  setupFiles: ['<rootDir>/scripts/test.js'],
  moduleNameMapper: {
    // Mock non JS files as strings
    '\\.(?:jpg|jpeg|png|gif|eot|otf|webp|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/src/js/__mocks__/fileMock.js',
    // Mock SVG as React component
    '\\.svg\\?url$': '<rootDir>/src/js/__mocks__/fileMock.js',
    '\\.svg$': '<rootDir>/src/js/__mocks__/svgMock.jsx',
    // Mock SCSS and CSS modules as objects
    '\\.(?:css|scss)$': 'identity-obj-proxy',
  },
  // Allow us to directly use enzyme wrappers for snapshotting
  // Usage: expect(enzyme.shallow(<div/>)).toMatchSnapshot();
  snapshotSerializers: ['<rootDir>/node_modules/enzyme-to-json/serializer'],
  collectCoverageFrom: ['**/*.{js,jsx}'],
  coveragePathIgnorePatterns: ['/node_modules/', '<rootDir>/src/js/(?:test-utils|e2e)'],
  // Only write lcov files in CIs
  coverageReporters: ['text'].concat(process.env.CI ? 'lcov' : []),
};
