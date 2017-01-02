import R from 'ramda';
import { diffWords } from 'diff';
import prune from 'underscore.string/prune';

// values that are recognised as null
const NULL_REGEX = /^(^$|--|n[/.]?a\.?|nil|none\.?|null)$/i;

// fields that will cause problems if differences in values arises
const CRITICAL_FIELDS = [
  'Department',
  'CrossModule',
  'ModuleCredit',
  'ExamDate',
  'ExamOpenBook',
  'ExamDuration',
  'ExamVenue',
];

// arbitrary char length to truncate for module description
const PRUNE_LIMIT = 100;

/**
 * Merges modules' by their fields, more critical fields are logged as warnings,
 * whereas less critical fields are logged as info.
 * Curried function to be easily reused.
 * @param {bunyan log} log - The log to be used for output.
 * @param {string} moduleCode - The moduleCode to be used for logging.
 * @param {string} module - The module to be merged.
 * @param {string} anotherModule - The module to be merged, whose field will be used in case of conflict.
 * @returns {Object} output - The merged module.
 */
function mergeModuleFields(log, moduleCode, module, anotherModule) {
  if (module.ModuleCode && anotherModule.ModuleCode &&
    module.ModuleCode !== anotherModule.ModuleCode) {
    throw new Error('Different modules cannot be merged.');
  }
  return R.mergeWithKey((key, x, y) => {
    if (x === y) {
      return y;
    }
    // return whichever side that has data
    const xIsNullData = NULL_REGEX.test(x);
    const yIsNullData = NULL_REGEX.test(y);
    if (xIsNullData && yIsNullData) {
      return '';
    } else if (yIsNullData) {
      return x;
    } else if (xIsNullData) {
      return y;
    }
    // diff by words and return whichever side that has purely more data
    const diffs = diffWords(x, y);
    if (diffs.filter(diff => diff.removed).length === 0) {
      return y;
    } else if (diffs.filter(diff => diff.added).length === 0) {
      return x;
    }
    const level = CRITICAL_FIELDS.includes(key) ? 'warn' : 'info';
    const strX = key === 'ModuleDescription' ? prune(x, PRUNE_LIMIT) : x;
    const strY = key === 'ModuleDescription' ? prune(y, PRUNE_LIMIT) : y;
    log[level](`module ${moduleCode}'s ${key} is not the same, got:\n1) '${strX}'\n2) '${strY}'`);
    return y;
  }, module, anotherModule);
}

export default R.curry(mergeModuleFields);
