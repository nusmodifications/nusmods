// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  // All imported modules in your tests should be mocked automatically
  // automock: false,

  // Stop running tests after the first failure
  // bail: false,

  // Automatically clear mock calls and instances between every test
  // clearMocks: false,

  // Indicates whether the coverage information should be collected while executing the test
  // collectCoverage: false,

  // An array of glob patterns indicating a set of files for which coverage information should be collected
  collectCoverageFrom: ['src/**/*.js'],

  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',

  // An array of regexp pattern strings used to skip coverage collection
  // coveragePathIgnorePatterns: [
  //   "/node_modules/"
  // ],

  // A list of reporter names that Jest uses when writing coverage reports
  // Only write lcov files in CIs
  coverageReporters: ['text'].concat(process.env.CI ? 'lcov' : []),

  // A path to a module which exports an async function that is triggered once before all test suites
  // globalSetup: null,

  // A path to a module which exports an async function that is triggered once after all test suites
  // globalTeardown: null,

  // A preset that is used as a base for Jest's configuration
  // preset: null,

  // Use this configuration option to add custom reporters to Jest
  // reporters: undefined,

  // A list of paths to directories that Jest should use to search for files in
  roots: [
    'src'
  ],

  // Allows you to use a custom runner instead of Jest's default test runner
  // runner: "jest-runner",

  // The paths to modules that run some code to configure or set up the testing environment before each test
  // setupFiles: [],

  // The path to a module that runs some code to configure or set up the testing framework before each test
  // setupTestFrameworkScriptFile: null,

  // A list of paths to snapshot serializer modules Jest should use for snapshot testing
  // snapshotSerializers: [],

  // The test environment that will be used for testing
  testEnvironment: 'node',

  // Options that will be passed to the testEnvironment
  // testEnvironmentOptions: {},

  // An array of regexp pattern strings that are matched against all test paths, matched tests are skipped
  // testPathIgnorePatterns: [
  //   "/node_modules/"
  // ],

  // This option allows the use of a custom results processor
  // testResultsProcessor: null,

  // An array of regexp patterns that are matched against all source file paths before re-running tests in watch mode
  // watchPathIgnorePatterns: [],
};
