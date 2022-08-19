import * as R from 'ramda';
import romanify from 'romanify';

import { ModuleCode } from '../../types/modules';

import { AND_OR_REGEX, MODULE_REGEX, OPERATORS, OPERATORS_REGEX } from './constants';

/**
 * Normalizes different formats with same semantic meanings.
 * E.g. x & y -> x and y
 *
 * The following code depends heavily on regex and the replace function.
 * It is recommended that you read the following before proceeding:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace
 */

// Converts `CS 1000` to `CS1000`
const moduleWithDelimiterRegex = /[A-Z]{2,3}\W[0-9]{4}(?:[A-Z]|[A-Z]R)?/g;
function removeSpaceFromModule(string: string) {
  return string.replace(moduleWithDelimiterRegex, R.replace(/\W/, ''));
}

// Converts `CS1000and` to `CS1000 and`
const leftConjoinedRegex = /\b([^\s()]{6,9})(and|or)\b/gi;
const rightConjoinedRegex = /\b(and|or)([^\s()]{6,9})\b/gi;
function fixOperatorTypos(string: string) {
  return string
    .replace(leftConjoinedRegex, (match, p1, p2) => (MODULE_REGEX.test(p1) ? `${p1} ${p2}` : match))
    .replace(rightConjoinedRegex, (match, p1, p2) =>
      MODULE_REGEX.test(p2) ? `${p1} ${p2}` : match,
    );
}

// Converts `CS1000/R` into `CS1000 or CS1000R`
const modulePostFixRegex = /([A-Z]{2,3}[0-9]{4})(\/[A-Z]|[A-Z]R)+\b/g;
function insertPostFixAsStandalone(string: string) {
  return string.replace(modulePostFixRegex, (match, module, ...args) => {
    const p = args.slice(0, -2); // last two are offset and string
    const modules = [
      module,
      ...p.map((postfix) => `${module}${postfix.slice(1)}`), // remove '/' sign
    ];

    return modules.join(OPERATORS.or);
  });
}

// People write 'x, y and z', meaning 'x and y and z' but
// people write 'x, y, z' meaning 'x or y or z'
function convertCommas(oxfordString: string): string {
  // replace Oxford comma
  const string = oxfordString.replace(/,\s*and\b/gi, OPERATORS.and);
  if (!string.includes(',')) return string;

  const hasAndOperators = string.includes(OPERATORS.and);
  const hasOrOperators = string.includes(OPERATORS.or);
  return hasAndOperators && !hasOrOperators
    ? string.replace(/,/g, OPERATORS.and)
    : string.replace(/,/g, OPERATORS.or);
}

// converts roman numerals and alphabets into digits
// e.g. (a) (b) (c) into (1) (2) (3)
function convertToNumerals(number: number, string: string): string {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz'[(number - 1) % 26];
  const roman = romanify(number).toLowerCase();

  // Detect roman numeral or alphabet in brackets
  // not case sensitive as '(Communications and Networks I)' and `(M&A)` would be false positives
  const romanNumeralRegex = new RegExp(`\\(?(${roman}|${alphabet})\\)`);
  if (romanNumeralRegex.test(string)) {
    const replaced = string.replace(romanNumeralRegex, `(${number})`);
    // recursively replace the next numeral
    return convertToNumerals(number + 1, replaced);
  }
  return string;
}

// Converts `1) x 2) y` to `(1) x (2) y`
function fixBrackets(string: string): string {
  // check brackets aren't balanced before fixing
  return R.match(/\(/g, string).length === R.match(/\)/g, string).length
    ? string
    : string.replace(/(?:\(?\b(\d+)\))/g, (match, digit) => `(${digit})`);
}

// recursively remove module title containing operators,
// given that neither is a module or operator, until no more changes
const moduleTitlesRegex = /([^\s()]+)\b[\s]+(?:and|or)[\s]+([^\s()]+)\b/g;
function removeModuleTitles(string: string): string {
  const result = string.replace(moduleTitlesRegex, (match, p1, p2) => {
    if (
      AND_OR_REGEX.test(p1) ||
      AND_OR_REGEX.test(p2) ||
      MODULE_REGEX.test(p1) ||
      MODULE_REGEX.test(p2)
    ) {
      return match;
    }
    return '';
  });

  if (result !== string) {
    return removeModuleTitles(result);
  }
  return result;
}

const gceRegex = /((GCE\s+)?[‘'"]?[AO][’'"]?(\s+|-)(level)\s*(\w+\s*)?)((and|or)\s+)?/gi;
const jcSubjectsRegex = /(H[1-3]\s+([A-Z]\w+\s*)+)((and|or)\s+)?/g;
function removeGCEPrerequisites(string: string): string {
  const trailingAndOrRegex = /(( and| or)\s*)(?:\)?)$/g;
  return string
    .replace(gceRegex, '')
    .replace(jcSubjectsRegex, '')
    .replace(trailingAndOrRegex, (match, p) => match.replace(p, ''));
}

const replaceBrackets = (str: string) => str.replace(/[{[<]/g, '(').replace(/[}\]>]/g, ')');
const replaceOperators = (str: string) =>
  str
    .replace(/[|/]/g, OPERATORS.or)
    .replace(/[;&]/g, OPERATORS.and)
    .replace(/ plus /g, OPERATORS.and)
    .replace(OPERATORS_REGEX, R.toLower);

const normalizeWhitespace = (str: string) => str.replace(/\s+/g, ' ');

export const normalize = R.pipe(
  removeSpaceFromModule,
  fixOperatorTypos,
  insertPostFixAsStandalone,
  convertCommas,
  R.curry(convertToNumerals)(1),
  replaceBrackets,
  fixBrackets,
  replaceOperators,
  R.compose(removeModuleTitles, removeGCEPrerequisites),
  normalizeWhitespace,
);

export default function normalizeString(string: string, moduleCode: ModuleCode): string {
  // remove own module code from string (e.g. `CS1000R` would remove `CS1000R`, `CS1000`)
  const moduleWithoutPostfix = moduleCode.slice(
    0,
    // Strings are arrays, dammit
    R.findLastIndex(R.test(/\d/), (moduleCode as unknown) as string[]) + 1,
  );
  const moduleRegex = new RegExp(`\\b${moduleWithoutPostfix}(?:[A-Z]|[A-Z]R)?\\b`, 'g');
  const preprocessed = string.replace(moduleRegex, '');
  return normalize(preprocessed);
}
