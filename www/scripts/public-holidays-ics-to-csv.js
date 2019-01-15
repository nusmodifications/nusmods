// Usage: $ node public-holidays-ics-to-csv.js 2016,2017,2018
// Since 2017, MOM's public ics has been changed to break up
// holidays that span across multiple days into single-day events.
// This scraper assumes that format and that all public holidays
// are no longer than a single day.

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const icalendar = require('icalendar');
const moment = require('moment');

const args = process.argv.slice(2);
const years = args[0];
if (!years) {
  console.error('Please specify the year(s).');
  process.exit(1);
}

const OUT_DIR = path.join(__dirname, 'holidays');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR);
}

async function fetchPublicHolidaysIcs(year) {
  console.log(`Fetching ICS for ${year}...`);
  const URL =
    'http://www.mom.gov.sg/~/media/mom/documents/employment-practices/' +
    `public-holidays/public-holidays-sg-${year}.ics`;
  const res = await axios.get(URL);
  console.log(`Fetched ICS for ${year}...`);
  return res.data;
}

years
  .split(',')
  .map((s) => s.trim())
  .forEach((year) => {
    fetchPublicHolidaysIcs(year)
      .then((icsData) => {
        // This trailing newline is needed by the parser else it's an invalid format.
        const ical = icalendar.parse_calendar(`${icsData}\n`);
        const calendarEvents = ical
          .events()
          .map((event) => ({
            date: moment(event.getPropertyValue('DTSTART').valueOf()),
            name: event.getPropertyValue('SUMMARY'),
          }))
          .sort((a, b) =>
            // Order not guaranteed. Have to sort.
            a.date.isBefore(b.date) ? -1 : 1,
          );

        const data = [];
        const DATE_FORMAT = 'YYYY-MM-DD';
        for (let i = 0; i < calendarEvents.length; i++) {
          const event = calendarEvents[i];
          const { name, date } = event;
          let actualDay = true;
          // Sunday that is not first day of CNY.
          if (
            date.format('dddd') === 'Sunday' &&
            i < calendarEvents.length &&
            calendarEvents[i + 1].name !== 'Chinese New Year'
          ) {
            actualDay = false;
            i += 1; // Skip because the next event is the observance event.
          }
          data.push({
            date: date.format(DATE_FORMAT),
            name,
            day: date.format('dddd'), // The day in text, e.g. Monday.
            observance: date.add(actualDay ? 0 : 1, 'day').format(DATE_FORMAT),
            observance_strategy: actualDay ? 'actual_day' : 'next_monday',
          });
        }

        const HEADERS = ['Date', 'Name', 'Day', 'Observance', 'Observance Strategy'];
        const rows = [HEADERS];
        data.forEach((row) => {
          rows.push([row.date, row.name, row.day, row.observance, row.observance_strategy]);
        });
        const outPath = path.join(OUT_DIR, `${year}_singapore_holidays.csv`);
        console.log(`Writing holidays CSV for ${year} to ${outPath}`);
        fs.writeFileSync(outPath, `${rows.join('\n')}\n`);
      })
      .catch((err) => {
        console.error(err);
      });
  });
