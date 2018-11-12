// Usage: $ node holidays-csv-to-json.js
// Pulls out Singapore public holidays from a set of CSV files and export
// just the dates to a JSON file.
const fs = require('fs');
const path = require('path');

const OUT_FILE = path.join(__dirname, '../src/js/data/holidays.json');
const IN_DIR = path.join(__dirname, 'holidays');

const inputs = fs.readdirSync(IN_DIR);
const holidays = [];

inputs.forEach((file) => {
  console.log(`Reading holidays from ${file}`);
  fs.readFileSync(path.join(IN_DIR, file), 'utf-8')
    .trim()
    .split('\n')
    // Remove header row
    .slice(1)
    // Headers: ['Date', 'Name', 'Day', 'Observance', 'Observance Strategy']
    // We're looking for Observance - the date at which the holiday is actually
    // observed
    .map((line) => line.split(',')[3])
    .forEach((date) => holidays.push(date));
});

console.log(`Writing ${holidays.length} holidays to ${OUT_FILE}`);
fs.writeFileSync(OUT_FILE, JSON.stringify(holidays, null, 2));
