// @flow
import { transform, isEqual, isObject, omit, merge, mapValues } from 'lodash';

const DIFF_PATH = 'DIFF_PATH';
const DIFF_OBJ = 'DIFF_OBJ';

export type PathDiff = {
  type: 'DIFF_PATH',
  previous: any,
  next: any,
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
 * @param  {Object}   base   Object to compare with
 * @param  {Object}   object Object compared
 * @param  {Function} diffFn `difference` function. Passed in to avoid linting errors
 * @return {Object}        Return a new object who represent the diff
 */
function changes(base: Object, object: Object, diffFn: (Object, Object) => ObjectDiff): Object {
  return transform(object, (result: Object, value: any, key: any) => {
    if (isEqual(value, base[key])) return;
    // eslint-disable-next-line no-param-reassign
    result[key] =
      isObject(value) &&
      isObject(base[key]) &&
      !(value instanceof Array) &&
      !(base[key] instanceof Array)
        ? diffFn(base[key], value)
        : { type: DIFF_PATH, previous: base[key], next: value };
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

// Revert object back to base OR base back to object using diff
function applyDifference(base: Object, diff: ObjectDiff, isUndo: boolean) {
  let object = base;

  // Undo: remove added keys; Redo: remove deleted keys
  object = omit(object, Object.keys(isUndo ? diff.added : diff.deleted));

  // Undo: add deleted keys back; Redo: add added keys back
  object = merge(object, isUndo ? diff.deleted : diff.added);

  // Apply PathDiffs here and ObjectDiffs recursively
  object = mapValues(object, (value: PathDiff | ObjectDiff, key: any) => {
    if (!(key in diff.changed)) return value;
    const valueDiff = diff.changed[key];
    switch (valueDiff.type) {
      case DIFF_PATH:
        return isUndo ? valueDiff.previous : valueDiff.next;
      case DIFF_OBJ:
        return applyDifference(value, valueDiff, isUndo);
      default:
        return value;
    }
  });

  return object;
}

// Convenience function
export function undoDifference(object: Object, diff: ObjectDiff) {
  return applyDifference(object, diff, true);
}

// Convenience function
export function redoDifference(base: Object, diff: ObjectDiff) {
  return applyDifference(base, diff, false);
}
