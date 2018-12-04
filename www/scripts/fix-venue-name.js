const venueFile = '../src/js/data/venues.json';

const venues = require(venueFile); // eslint-disable-line import/no-dynamic-require
const _ = require('lodash');
const fs = require('fs-extra');
const path = require('path');

// List of special names, mapping all lower version of the name to
// the properly cased version
const specialNames = {
  i3: 'i3',
  ell: 'ELL',
  it: 'IT',
};

const additionalWords = [
  'BIOMOLECULAR',
  'SEMIOTIC',
  'CHEM',
  'GEO',
  'LIM',
  'TAY',
  'BOH',
  'THEATRETTE',
  'DEPT',

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
    } else if (index !== 0 && articles.has(lowercaseWord)) {
      // Ignore articles that are not the first word
    } else if (dict.has(lowercaseWord)) {
      return _.capitalize(word);
    }

    return word;
  });

  console.log(`${venue.roomName.padEnd(40)} -> ${newRoomName}`);
  // eslint-disable-next-line no-param-reassign
  venue.roomName = newRoomName;
});

fs.writeFileSync(path.resolve(__dirname, venueFile), JSON.stringify(venues, null, 2));
