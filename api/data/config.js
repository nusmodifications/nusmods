import 'dotenv/config';

export default {
  dataFolder: '../../data/nus',
  modulesFileName: 'modules.json',
  venuesFileName: 'venues.json',
  defaults: {
    maxCacheAge: process.env.NODE_ENV === 'production' ? 0 : 86400,
    cachePath: '../../scrapers/nus/cache',
  },
};
