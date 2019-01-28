// @flow

/**
 * Code for data mapping, cleanup and validation
 */

import { trim } from 'lodash';

/**
 * NUS specific title case function that accounts for school names, etc.
 */
const minorWords = ['and', 'or', 'the', 'a', 'an', 'to', 'of'];
const abbreviations = ['NUS', 'MIT', 'IP', 'NA'];
export function titleize(string: string) {
  let capitalized = string
    .toLowerCase()
    // http://stackoverflow.com/a/7592235
    .replace(/(?:^|\s\(?|-|\/)\S/g, (char) => char.toUpperCase());

  // Minor words are lowercase unless they are the first word of the title
  minorWords.forEach((properCasing) => {
    const regex = new RegExp(properCasing, 'gi');
    capitalized = capitalized.replace(regex, (match, index) =>
      index === 0 ? match : properCasing,
    );
  });

  // Abbreviations are uppercase regardless of where they are
  abbreviations.forEach((abbreviation) => {
    const regex = new RegExp(abbreviation, 'gi');
    capitalized = capitalized.replace(regex, abbreviation);
  });

  return capitalized;
}

/**
 * Remove keys with empty values, null or strings like 'nil', 'none'
 * Mutates the input object
 */
const trimChars = ' \t\n.,!?/-_';
const nullStrings = new Set(['', 'nil', 'na', 'n/a', 'null', 'none']);
export function cleanObject<T: Object>(object: T, keys: $Keys<T>[]) {
  /* eslint-disable no-param-reassign */
  keys.forEach((key) => {
    const value = object[key];

    if (!value) delete object[key];
    if (typeof value === 'string' && nullStrings.has(trim(value, trimChars).toLowerCase())) {
      delete object[key];
    }
  });
  /* eslint-enable */

  return object;
}

export const dayTextMap = {
  '1': 'Monday',
  '2': 'Tuesday',
  '3': 'Wednesday',
  '4': 'Thursday',
  '5': 'Friday',
  '6': 'Saturday',
  // Assume lessons on Sunday are invalid
};

export const unrecognizedLessonTypes = {
  // Not recognized by frontend
  '4': 'Tutorial Type 4',
  '5': 'Tutorial Type 5',
  '6': 'Tutorial Type 6',
  '7': 'Tutorial Type 7',
  '8': 'Tutorial Type 8',
  '9': 'Tutorial Type 9',
  A: 'Supervision of Academic Exercise',
  O: 'Others',
  V: 'Lecture On Demand',
  I: 'Independent Study Module',
  C: 'Bedside Tutorial',
  M: 'Ensemble Teaching',
  J: 'Mini-Project',
};

export const activityLessonType = {
  // Recognized by frontend
  B: 'Laboratory',
  L: 'Lecture',
  D: 'Design Lecture',
  R: 'Recitation',
  P: 'Packaged Lecture',
  X: 'Packaged Tutorial',
  W: 'Workshop',
  E: 'Seminar-Style Module Class',
  S: 'Sectional Teaching',
  T: 'Tutorial',
  '2': 'Tutorial Type 2',
  '3': 'Tutorial Type 3',

  ...unrecognizedLessonTypes,
};
