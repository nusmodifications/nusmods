const bunyan = require('bunyan');

const mockedBunyan = jest.genMockFromModule('bunyan');

// Only log out fatal logs to prevent testing from
// outputing logs
mockedBunyan.createLogger = ({ level, ...otherConfig }) => bunyan.createLogger({
  ...otherConfig,
  level: bunyan.FATAL,
});

module.exports = mockedBunyan;
