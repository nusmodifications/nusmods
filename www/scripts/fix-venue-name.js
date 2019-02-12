/**
 * Simple script to correctly capitalize venue names coming from
 * NUS venues API, which only has names in ALL CAPS. This makes the
 * venue names more human readable.
 *
 * It tries to match works in the name with dictionary words, and
 * assume anything that's not to be an acronym or abbreviation and
 * leaves them untouched.
 */
const venueFile = '../src/js/data/venues.json';

const venues = require(venueFile); // eslint-disable-line import/no-dynamic-require
const _ = require('lodash');
const fs = require('fs-extra');
const path = require('path');

if (process.platform === 'win32') {
  console.warn(
    'This script will probably not work on Windows as ' +
      'it relies on the Unix words dictionary file',
  );
}

// List of special names, mapping all lower version of the name to
// the properly cased version
const specialNames = {
  i3: 'i3',
  ell: 'ELL',
  it: 'IT',
  Eh: 'EH',
};

const additionalWords = [
  'BIOMOLECULAR',
  'SEMIOTIC',
  'CHEM',
  'GEO',
  'LIM',
  'TAY',
  'BOH',
  'MULTIDISCIPLINARY',
  'GEOTHERMAL',
  'THEATRETTE',
  'DEPT',
  'CENDANA',
  'KEWALRAM',
  'CHANRAI',

  // Damn American dictionaries
  'HONOURS',
  'CHARACTERISATION',
  'CENTRE',
  'BEHAVIOURAL',
];

// Do not capitalize articles
const articles = new Set(['a', 'an', 'of', 'and', 'the', 'to', 'at']);

// Try to find the Unix words file
const dictLocations = ['/usr/share/dict/words', '/usr/dict/words'];
let dict;
dictLocations.forEach((dictionary) => {
  try {
    dict = new Set(fs.readFileSync(dictionary, 'utf-8').split('\n'));
  } catch (e) {
    // Swallow error - will throw at the end of loop
  }
});

if (!dict) throw new Error('Cannot find words file');

// Supplement the dictionary with our own words
additionalWords.forEach((word) => dict.add(word.toLowerCase()));

_.each(venues, (venue) => {
  if (!venue.roomName) return;
  const newRoomName = venue.roomName.replace(/\b\w+\b/g, (word, index) => {
    const lowercaseWord = word.toLowerCase();

    if (specialNames[lowercaseWord]) {
      return specialNames[lowercaseWord];
    }

    if (
      // Do not capitalize articles, unless it is the first word
      (!articles.has(lowercaseWord) || index === 0) &&
      // Use title case for words in the dictionary
      dict.has(lowercaseWord)
    ) {
      return _.capitalize(word);
    }

    return word;
  });

  console.log(`${venue.roomName.padEnd(40)} -> ${newRoomName}`);
  // eslint-disable-next-line no-param-reassign
  venue.roomName = newRoomName;
});

fs.writeFileSync(path.resolve(__dirname, venueFile), JSON.stringify(venues, null, 2));
