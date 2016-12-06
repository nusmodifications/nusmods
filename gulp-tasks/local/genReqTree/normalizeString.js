import R from 'ramda';
import romanify from 'romanify';

import { OPERATORS, MODULE_REGEX, AND_OR_REGEX, OPERATORS_REGEX } from './constants';

/**
 * Normalizes different formats with same semantic meanings.
 * E.g. x & y -> x and y
 *
 * The following code depends heavily on regex and the replace function.
 * It is recommended that you read the following before proceeding:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace
 */

// converts `CS 1000` to `CS1000`
function removeSpaceFromModule(string) {
  const moduleWithDelimiterRegex = /[A-Z]{2,3}\W[0-9]{4}(?:[A-Z]|[A-Z]R)?/g;
  return string.replace(moduleWithDelimiterRegex, R.replace(/\W/, ''));
}

// converts `CS1000and` to `CS1000 and`
function fixOperatorTypos(string) {
  const leftConjoinedRegex = /\b([^\s()]{6,9})(and|or)\b/ig;
  const rightConjoinedRegex = /\b(and|or)([^\s()]{6,9})\b/ig;
  return string
    .replace(leftConjoinedRegex, (match, p1, p2) => {
      if (MODULE_REGEX.test(p1)) {
        return [p1, p2].join(' ');
      }
      return match;
    })
    .replace(rightConjoinedRegex, (match, p1, p2) => {
      if (MODULE_REGEX.test(p2)) {
        return [p1, p2].join(' ');
      }
      return match;
    });
}

// converts `CS1000/R` into `CS1000 or CS1000R`
function insertPostFixAsStandalone(string) {
  const modulePostFixRegex = /([A-Z]{2,3}[0-9]{4})(\/[A-Z]|[A-Z]R)+\b/g;
  return string.replace(modulePostFixRegex, (match, module, ...args) => {
    const p = args.slice(0, -2); // last two are offset and string
    const modules = [
      module,
      ...p.map(postfix => `${module}${postfix.slice(1)}`),  // remove '/' sign
    ];
    return modules.join(OPERATORS.or);
  });
}

// people write 'x, y and z', meaning 'x and y and z' but
// people write 'x, y, z' meaning 'x or y or z'
function convertCommas(oxfordString) {
  // replace oxford comma
  const string = oxfordString.replace(/,\s*and\b/gi, OPERATORS.and);
  if (!string.includes(',')) {
    return string;
  }
  const hasAndOperators = string.includes(OPERATORS.and);
  const hasOrOperators = string.includes(OPERATORS.or);
  if (hasAndOperators && !hasOrOperators) {
    return string.replace(/,/g, OPERATORS.and);
  }
  return string.replace(/,/g, OPERATORS.or);
}

// converts roman numerals and alphabets into digits
// e.g. (a) (b) (c) into (1) (2) (3)
function convertToNumerals(number, string) {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz'[(number - 1) % 26];
  const roman = romanify(number).toLowerCase();
  // detect roman numeral or alphabet in brackets
  // not case sensitive as '(Communications and Networks I)' and `(M&A)` would be false positives
  const romanNumberalRegex = new RegExp(`\\(?(?:${roman}|${alphabet})\\)`);
  if (romanNumberalRegex.test(string)) {
    const replaced = string.replace(romanNumberalRegex, `(${number})`);
    // recursively replace the next numeral
    return convertToNumerals(number + 1, replaced);
  }
  return string;
}

// converts `1) x 2) y` to `(1) x (2) y`
function fixBrackets(string) {
  // check brackets aren't balanced before fixing
  if (R.match(/\(/g, string).length === R.match(/\)/g, string).length) {
    return string;
  }
  return string.replace(/(?:\(?\b(\d+)\))/g, (match, digit) => `(${digit})`);
}

// recursively remove module title containing operators,
// given that neither is a module or operator, until no more changes
function removeModuleTitles(string) {
  const moduleTitlesRegex = /([^\s()]+)\b[\s]+(?:and|or)[\s]+([^\s()]+)\b/g;
  const result = string.replace(moduleTitlesRegex, (match, p1, p2) => {
    if (AND_OR_REGEX.test(p1) || AND_OR_REGEX.test(p2) ||
      MODULE_REGEX.test(p1) || MODULE_REGEX.test(p2)) {
      return match;
    }
    return '';
  });
  if (result !== string) {
    return removeModuleTitles(result);
  }
  return result;
}

const normalize = R.pipe(
  removeSpaceFromModule,
  fixOperatorTypos,
  insertPostFixAsStandalone,
  convertCommas,
  R.replace(/{|\[|</g, '('),
  R.replace(/}|]|>/g, ')'),
  R.curry(convertToNumerals)(1),
  fixBrackets,
  R.replace(/\|/g, OPERATORS.or),
  R.replace(/\//g, OPERATORS.or),
  R.replace(/;/g, OPERATORS.and),
  R.replace(/&/g, OPERATORS.and),
  R.replace(/ plus /g, OPERATORS.and),
  R.replace(OPERATORS_REGEX, R.toLower),
  removeModuleTitles,
);

function normalizeString(string, moduleCode) {
  // remove own module code from string (e.g. `CS1000R` would remove `CS1000R`, `CS1000`)
  const moduleWithoutPostfix = moduleCode.slice(0, R.findLastIndex(R.test(/\d/), moduleCode) + 1);
  const moduleRegex = new RegExp(`\\b${moduleWithoutPostfix}(?:[A-Z]|[A-Z]R)?\\b`, 'g');
  const preprocessed = string.replace(moduleRegex, '');
  return normalize(preprocessed);
}

export default normalizeString;
export { normalize };
