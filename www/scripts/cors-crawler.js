// This script has to be run from v3 directory, via `npm run cors`.
const axios = require('axios');
const cheerio = require('cheerio');
const moment = require('moment');
const fs = require('graceful-fs');
const path = require('path');
const assert = require('assert');

const CORS_URL = 'http://www.nus.edu.sg/cors/schedule.html';
const ROUND_NAMES = ['0', '1A', '1B', '1C', '2A', '2B', '3A', '3B'];
const TIME_FORMAT = 'dddd Do MMMM, ha'; // eg. Friday 27th October, 12pm
const OUT_DIR = 'src/js/data';

function formatDateTime(date, time) {
  const dateTime = moment(`${date} ${time} +08:00`, 'DD/MM/YYYY HH:mm ZZ', true);
  assert(dateTime.isValid(), `"${date} ${time} +08:00" is not a valid date`);
  return dateTime;
}

function createPeriod(type, start, end) {
  return {
    type,
    // start/end are human readable datetime, while startTs/endTs are machine readable ISO 8601 timestamps
    // This allows us to avoid having to do messy date formatting on the client-side
    start: start.format(TIME_FORMAT),
    startTs: start.toISOString(),
    end: end.format(TIME_FORMAT),
    endTs: end.toISOString(),
  };
}

function processRound(type, text) {
  // Clean the text and split into periods
  return text
    .trim() // Clean text
    .split(/\s*\n\s*/g) // Split into periods (eg. 27/07/2017 09:00 to 28/07/2017 17:00)
    .filter((period) => period.includes('to')) // Remove things that don't look like periods (eg. 'N/A')
    .map((period) => {
      const chunks = period.split(/\s+/g);

      const start = formatDateTime(chunks[0], chunks[1]);
      let end;
      // Bidding period starts and ends on different dates.
      // eg. 27/07/2017 09:00 to 28/07/2017 17:00
      // So end = 28/07/2017 17:00
      if (chunks.length === 5) {
        end = formatDateTime(chunks[3], chunks[4]);
      } else if (chunks.length === 4) {
        // Open bidding period starts and ends on the same date.
        // eg. 02/08/2017 09:00 to 15:00
        // So end = 02/08/2017 15:00
        end = formatDateTime(chunks[0], chunks[3]);
      } else if (chunks.length === 9) {
        end = formatDateTime(chunks[7], chunks[8]);
      } else {
        assert.fail(`Unexpected number of chunks in a period - ${period}`);
      }

      return createPeriod(type, start, end);
    });
}

console.log(`Fetching page ${CORS_URL}...`);
axios
  .get(CORS_URL, { responseType: 'responseType' })
  .then(({ data }) => {
    const $page = cheerio.load(data);

    // 1. Retrieve the academic year and semester for the file name.
    const rawHeader = $page('span.middletabletext:has(span.scheduleheader1)')
      .text()
      .trim();
    const [acadYear, semester] = rawHeader
      .replace(/\s+|Bidding Schedule|\(AY|20|\/|Semester|\)/g, '')
      .split(',');
    // Output file config
    const fileName = `cors-schedule-ay${acadYear}-sem${semester}.json`;

    // 2. Extract the bidding schedules table
    const table = $page('.scheduleheader1')
      .filter((index, element) =>
        $page(element)
          .text()
          .includes('Bidding Periods'),
      )
      .next('table');

    assert.equal(
      table.length,
      1,
      'Unexpected bidding schedule table found - ' +
        'check that the selector for the bidding schedule table is specific enough',
    );

    // 3. Extract the rows containing round data
    const roundsData = table
      .find('tr')
      .slice(1) // Ignore header row
      .map((index, element) => {
        // 4. Extract round name
        const cells = $page(element).find('td');
        const round = cells.first().text();
        assert(ROUND_NAMES.includes(round), `Unknown CORS bidding round found - ${round}`);

        // 5. Extract open and closed bidding data
        const periods = [
          ...processRound('open', cells.eq(1).text()),
          ...processRound('closed', cells.eq(2).text()),
        ];

        return {
          round,
          periods,
        };
      })
      .get(); // .get() remove the cheerio wrapper
    const numRounds = +semester === 2 ? ROUND_NAMES.length - 1 : ROUND_NAMES.length; // Sem 2 has no Round 1C.
    assert.equal(roundsData.length, numRounds, 'Unexpected number of CORS bidding rounds');

    // 6. Write to file
    const jsonArray = `${JSON.stringify(roundsData, null, 2)}\n`;
    console.log(jsonArray);
    fs.writeFileSync(path.join(OUT_DIR, fileName), jsonArray);
    console.log(`Successfully written to ${fileName}.`);
  })
  .catch((e) => console.error(e));
