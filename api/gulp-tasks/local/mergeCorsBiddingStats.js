import path from 'path';
import fs from 'fs-extra';
import bunyan from 'bunyan';
import R from 'ramda';

/**
 * Merges all years of corsBddingStats together.
 * By default outputs to:
 *   - corsBiddingStatsRaw.json
 */

const log = bunyan.createLogger({ name: 'mergeCorsBiddingStats' });

async function mergeCorsBiddingStats(config) {
  const unavailableSems = [];
  const toRead = config.map(({ year, semester, destFolder, destFileName }) => {
    const acadYear = `${year}-${year + 1}`;
    const pathToRead = path.join(
      destFolder,
      acadYear,
      `${semester}`,
      destFileName,
    );
    return fs.readJson(pathToRead).catch(() => {
      unavailableSems.push(`${acadYear} sem ${semester}`);
      return [];
    });
  });
  const data = await Promise.all(toRead);
  log.info(`${unavailableSems.join(', ')} data could not be found, continuing...`);

  const merge = R.pipe(
    R.filter(R.identity),
    R.unnest,
  );
  const corsBddingStats = merge(data);

  const thisConfig = R.last(config);
  const pathToWrite = path.join(
    thisConfig.destFolder,
    thisConfig.destFileName,
  );
  log.info(`saving to ${pathToWrite}`);
  await fs.outputJson(pathToWrite, corsBddingStats, { spaces: thisConfig.jsonSpace });
}

export default mergeCorsBiddingStats;
