// @flow

import path from 'path';
import bunyan from 'bunyan';

const rootLogger = bunyan.createLogger({
  name: 'scraper',
  streams: [
    {
      stream: process.stdout,
      level: 'info',
    },
    {
      path: path.join(__dirname, '../../logs/scraper.log'),
    },
  ],
});

export default rootLogger;
