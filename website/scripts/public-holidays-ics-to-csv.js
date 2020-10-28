// Usage: $ node public-holidays-ics-to-csv.js 2016,2017,2018
// Since 2017, MOM's public ics has been changed to break up
// holidays that span across multiple days into single-day events.
// This scraper assumes that format and that all public holidays
// are no longer than a single day.

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const icalendar = require('icalendar');
const { addDays, format, getDay } = require('date-fns');

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
    'https://www.mom.gov.sg/~/media/mom/documents/employment-practices/' +
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
            date: new Date(event.getPropertyValue('DTSTART').valueOf()),
            name: event.getPropertyValue('SUMMARY'),
          }))
          // Order not guaranteed. Have to sort (in ascending order).
          .sort((a, b) => a.date - b.date);

        const data = [];
        const DATE_FORMAT = 'yyyy-MM-dd';
        for (let i = 0; i < calendarEvents.length; i++) {
          const event = calendarEvents[i];
          const { name, date } = event;
          let actualDay = true;
          // Mark Sunday holidays as observed next Monday.
          // Ignore Sundays that are the first day of CNY, as Monday will
          // already have a CNY Day 2 event.
          // FIXME: If first day of CNY is a Sunday, this code will not mark
          // Tuesday as a holiday.
          if (
            getDay(date) === 0 && // 0 = Sunday
            i < calendarEvents.length &&
            calendarEvents[i + 1].name !== 'Chinese New Year'
          ) {
            actualDay = false;
          }
          data.push({
            date: format(date, DATE_FORMAT),
            name,
            day: format(date, 'EEEE'), // The day in text, e.g. Monday.
            observance: format(addDays(date, actualDay ? 0 : 1, 'day'), DATE_FORMAT),
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
