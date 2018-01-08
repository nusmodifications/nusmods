// @flow
import { transform, isEqual, isObject, omit, merge, mapValues } from 'lodash';

const DIFF_PATH = 'DIFF_PATH';
const DIFF_OBJ = 'DIFF_OBJ';

export type PathDiff = {
  type: 'DIFF_PATH',
  previous: Object,
  next: Object,
};

export type ObjectDiff = {
  type: 'DIFF_OBJ',
  deleted: Object,
  added: Object,
  changed: { [any]: PathDiff | ObjectDiff },
};

/*
 * Deep diff between two object, using lodash
 * Based on https://gist.github.com/Yimiprod/7ee176597fef230d1451
 * @param  {Object} object Object compared
 * @param  {Object} base   Object to compare with
 * @return {Object}        Return a new object who represent the diff
 */
function changes(base: Object, object: Object, diffFn: Function): Object {
  return transform(object, (result: Object, value: Object, key: string) => {
    if (!isEqual(value, base[key])) {
      // eslint-disable-next-line no-param-reassign
      result[key] =
        isObject(value) &&
        isObject(base[key]) &&
        !(value instanceof Array) &&
        !(base[key] instanceof Array)
          ? diffFn(base[key], value)
          : { type: DIFF_PATH, previous: base[key], next: value };
    }
  });
}

export function difference(base: Object, object: Object): ObjectDiff {
  return {
    type: DIFF_OBJ,
    deleted: omit(base, Object.keys(object)),
    added: omit(object, Object.keys(base)),
    changed: changes(base, object, difference),
  };
}

// Revert object back to base using diff
export function undoDifference(object: Object, diff: ObjectDiff) {
  let base = object;

  // Remove added keys
  base = omit(base, Object.keys(diff.added));

  // Add deleted keys back
  base = merge(base, diff.deleted);

  // Apply PathDiffs here and ObjectDiffs recursively
  base = mapValues(base, (value: PathDiff | ObjectDiff, key: string) => {
    if (!(key in diff.changed)) return value;
    const valueDiff = diff.changed[key];
    switch (valueDiff.type) {
      case DIFF_PATH:
        return valueDiff.previous;
      case DIFF_OBJ:
        return undoDifference(value, valueDiff);
      default:
        return value;
    }
  });

  return base;
}

// Revert object back from base using diff
export function redoDifference(base: Object, diff: ObjectDiff) {
  let object = base;

  // Remove deleted keys
  object = omit(object, Object.keys(diff.deleted));

  // Add added keys back
  object = merge(object, diff.added);

  // Apply PathDiffs here and ObjectDiffs recursively
  object = mapValues(object, (value: PathDiff | ObjectDiff, key: string) => {
    if (!(key in diff.changed)) return value;
    const valueDiff = diff.changed[key];
    switch (valueDiff.type) {
      case DIFF_PATH:
        return valueDiff.next;
      case DIFF_OBJ:
        return redoDifference(value, valueDiff);
      default:
        return value;
    }
  });

  return object;
}
