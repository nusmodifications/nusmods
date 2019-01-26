// @flow

import path from 'path';
import bunyan from 'bunyan';

const logRoot = path.join(__dirname, '../../logs');

const rootLogger = bunyan.createLogger({
  name: 'scraper',
  streams: [
    {
      stream: process.stdout,
      level: 'info',
    },
    {
      path: path.join(logRoot, 'info.log'),
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    },
    {
      path: path.join(logRoot, 'errors.log'),
      level: 'warn',
    },
  ],
});

export default rootLogger;
