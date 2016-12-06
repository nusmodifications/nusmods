import R from 'ramda';
import { diffWords } from 'diff';

/**
 * Verbose version of diffStrings, outputs regardless of pure addition.
 */
export function verboseDiffStrings(initial, final) {
  const diffs = diffWords(initial, final);
  const listDiffs = R.map((word) => {
    if (word.removed) {
      return `- '${word.value}'`;
    } else if (word.added) {
      return `+ '${word.value}'`;
    }
    return '';
  });
  const filterFalsy = R.filter(R.identity);
  const processDiffs = R.pipe(
    listDiffs,
    filterFalsy,
    R.join('\n'),
  );
  return processDiffs(diffs);
}

/**
 * Finds the difference between two strings and outputs the difference in words, disregarding whitespace.
 * This is the non-verbose version which returns null when there are only additions to the final string.
 * @param {string} initial - The initial string
 * @param {string} final - The final/resultant string
 * @returns {string} output - Prepends '-' or '+' for missing and additional word respectively in the final string
 */
export default function diffStrings(initial, final) {
  const diffs = diffWords(initial, final);
  if (diffs.filter(diff => diff.removed).length === 0) {
    return null;
  }
  return verboseDiffStrings(initial, final);
}
