module.exports = {
  roots: ['<rootDir>/src'],
  moduleDirectories: ['node_modules', '<rootDir>/src'],
  moduleFileExtensions: ['jsx', 'js', 'ts', 'tsx'],
  testPathIgnorePatterns: [],
  testRegex: 'src/.+\\.test\\.[jt]sx?$',
  setupFiles: ['<rootDir>/scripts/test.js'],
  moduleNameMapper: {
    // Mock non JS files as strings
    '\\.(?:jpg|jpeg|png|gif|eot|otf|webp|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/src/__mocks__/fileMock.ts',
    // Mock SVG as React component
    '\\.svg\\?url$': '<rootDir>/src/__mocks__/fileMock.ts',
    '\\.svg$': '<rootDir>/src/__mocks__/svgMock.tsx',
    // Mock SCSS and CSS modules as objects
    '\\.(?:css|scss)$': 'identity-obj-proxy',
  },
  // Allow us to directly use enzyme wrappers for snapshotting
  // Usage: expect(enzyme.shallow(<div/>)).toMatchSnapshot();
  snapshotSerializers: ['<rootDir>/node_modules/enzyme-to-json/serializer'],
  collectCoverageFrom: [
    '**/!(*.d).{js,jsx,ts,tsx}',
    '!**/{node_modules,types}/**',
    '!**/.eslintrc.js',
  ],
  coveragePathIgnorePatterns: ['<rootDir>/src/(?:test-utils|e2e|views/tetris)'],
  // Only write lcov files in CIs
  coverageReporters: process.env.CI ? ['text', 'lcov'] : ['text'],
};
