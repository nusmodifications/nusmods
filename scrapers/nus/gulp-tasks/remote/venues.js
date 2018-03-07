import path from 'path';
import fs from 'fs-extra';
import bunyan from 'bunyan';
import querystring from 'querystring';
import gotCached from '../utils/gotCached';

/**
 * Outputs venue data for the school for one acad year.
 * By default outputs to:
 *   - venuesRaw.json
 */

const NUS_API_URL = 'http://nuslivinglab.nus.edu.sg/api_dev/api/';

const log = bunyan.createLogger({ name: 'venues' });

async function venues(config) {
  const query = querystring.stringify({
    name: '',
    output: 'json',
  });
  const url = `${NUS_API_URL}Dept?${query}`;
  const locations = JSON.parse(await gotCached(url, config));
  log.info(`parsed ${locations.length} venues`);

  const pathToWrite = path.join(config.destFolder, config.destFileName);
  log.info(`saving to ${pathToWrite}`);
  await fs.outputJson(pathToWrite, locations, { spaces: config.jsonSpace });
}

export default venues;
