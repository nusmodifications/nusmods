module.exports = {
  roots: ['<rootDir>/src/js'],
  moduleDirectories: ['node_modules', '<rootDir>/src/js'],
  moduleFileExtensions: ['jsx', 'js', 'ts', 'tsx'],
  testPathIgnorePatterns: [],
  testRegex: 'src/js/.+\\.test\\.[jt]sx?$',
  setupFiles: ['<rootDir>/scripts/test.js'],
  moduleNameMapper: {
    // Mock non JS files as strings
    '\\.(?:jpg|jpeg|png|gif|eot|otf|webp|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/src/js/__mocks__/fileMock.ts',
    // Mock SVG as React component
    '\\.svg\\?url$': '<rootDir>/src/js/__mocks__/fileMock.ts',
    '\\.svg$': '<rootDir>/src/js/__mocks__/svgMock.tsx',
    // Mock SCSS and CSS modules as objects
    '\\.(?:css|scss)$': 'identity-obj-proxy',
  },
  // Allow us to directly use enzyme wrappers for snapshotting
  // Usage: expect(enzyme.shallow(<div/>)).toMatchSnapshot();
  snapshotSerializers: ['<rootDir>/node_modules/enzyme-to-json/serializer'],
  collectCoverageFrom: ['**/!(*.d).{js,jsx,ts,tsx}'],
  coveragePathIgnorePatterns: ['/node_modules/', '<rootDir>/src/js/(?:test-utils|e2e)'],
  // Only write lcov files in CIs
  coverageReporters: ['text'].concat(process.env.CI ? 'lcov' : []),
};
