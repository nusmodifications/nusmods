/* eslint-env jest */

// Always mock config since on CI the env file does not exist. Also ensures
// the keys don't get inadvertently invoked during tests.
jest.mock('../src/config.js');
