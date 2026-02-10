import { mockLogger } from '../utils/test-utils';

const mockedBunyan = jest.createMockFromModule<any>('bunyan');

mockedBunyan.createLogger = mockLogger;

export default mockedBunyan;
