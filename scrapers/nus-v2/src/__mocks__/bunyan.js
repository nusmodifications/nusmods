// @flow

const mockedBunyan = jest.genMockFromModule('bunyan');

// Only log out fatal logs to prevent testing from outputting logs
mockedBunyan.createLogger = () => ({
  // Mock all logged functions
  critical: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  trace: jest.fn(),

  // Calling child simply creates another mock logger
  child: mockedBunyan.createLogger,
});

module.exports = mockedBunyan;
