// @flow

import { mockLogger } from '../utils/test-utils';

const mockedBunyan = jest.genMockFromModule('bunyan');

mockedBunyan.createLogger = mockLogger;

export default mockedBunyan;
