import path from 'path';
import fs from 'fs-promise';
import bunyan from 'bunyan';
import R from 'ramda';
import cheerio from 'cheerio';
import gotCached from '../utils/gotCached';

/**
 * Outputs cors bidding stats for one semester.
 * By default outputs to:
 *   - corsBiddingStatsRaw.json
 */

const CORS_URL = 'http://www.nus.edu.sg/cors/';
const CORS_ARCHIVE_URL = `${CORS_URL}archive.html`;
const BID_RESULTS_LINK_SELECTOR = 'a[href*="successbid"]';
const BID_RESULTS_ROW_SELECTOR = 'body > table > tr[valign=top]';

// eslint-disable-next-line max-len
const biddingSummaryUrlPattern = /Archive\/(\d{4})\d{2}_Sem(\d)\/successbid_(\d[A-F])_\d{4,8}s\d\.html/;
const statsKeys = [
  'Quota',
  'Bidders',
  'LowestBid',
  'LowestSuccessfulBid',
  'HighestBid',
  'Faculty',
  'StudentAcctType',
];

const log = bunyan.createLogger({ name: 'corsBiddingStats' });

async function processBiddingStats(href, config) {
  const url = href.startsWith('.') ? `${CORS_URL}${href}` : href;
  const urlMatch = biddingSummaryUrlPattern.exec(url);

  const webpage = await gotCached(url, config);
  const $ = cheerio.load(webpage);
  // some pages have 2 tables, we want the table that is a direct descendant of body
  // this selector get rids of all non-data tr (such as headers)
  // cors should really use th for headers...
  const trs = $(BID_RESULTS_ROW_SELECTOR);

  let moduleCode;
  let group;

  const biddingResults = trs.map((i, tr) => {
    const ps = $('p', tr);

    // there are 2 kinds of rows
    // 1. rows with module code (which has 9 p nodes)
    // 2. rows without belong to a previous row that has a module code (8 p nodes)
    // when we meet row of kind 1, we store the module and group info to be used
    // by rows of type 2 that follows it
    if (ps.length === 9) {
      moduleCode = $(ps[0]).text();
      group = $(ps[1]).text();
    }

    const statsArray = ps.slice(ps.length - 7).map((i, el) => $(el).text());

    return {
      ...R.zipObj(statsKeys, statsArray),
      AcadYear: `${urlMatch[1]}/${parseInt(urlMatch[1], 10) + 1}`,
      Semester: urlMatch[2],
      Round: urlMatch[3],
      ModuleCode: moduleCode,
      Group: group,
    };
  });

  return biddingResults.get();
}

async function corsBiddingStats(config) {
  const { year, semester } = config;
  const subLog = log.child({ year, semester });

  const webpage = await gotCached(CORS_ARCHIVE_URL, config);
  const $ = cheerio.load(webpage);

  const urls = $(BID_RESULTS_LINK_SELECTOR).map((i, anchor) => $(anchor).prop('href')).get();
  const wantedUrls = urls.filter(href => href.includes(`${year + 1}s${semester}`));

  const statsByPhase = wantedUrls.map(href => processBiddingStats(href, config));
  const biddingStats = R.unnest(await Promise.all(statsByPhase));
  if (biddingStats.length === 0) {
    subLog.info('no bidding stats available, scrape ended.');
    return;
  }
  subLog.info(`parsed ${biddingStats.length} bidding stats`);

  const pathToWrite = path.join(
    config.destFolder,
    `${year}-${year + 1}`,
    `${semester}`,
    config.destFileName,
  );
  subLog.info(`saving to ${pathToWrite}`);
  await fs.outputJson(pathToWrite, biddingStats, { spaces: config.jsonSpace });
}

export default corsBiddingStats;
