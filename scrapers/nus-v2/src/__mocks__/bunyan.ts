import { mockLogger } from '../utils/test-utils';

const mockedBunyan = jest.genMockFromModule<any>('bunyan');

mockedBunyan.createLogger = mockLogger;

export default mockedBunyan;
