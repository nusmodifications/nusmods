// @flow

import { flatMap } from 'lodash';

/**
 * Mixes the delimiter into the array between each element
 *
 * @param {T[]} array
 * @param {U} delimiter
 * @returns {Array<T|U>}
 */
export function intersperse<T, U>(array: T[], delimiter: U): Array<T | U> {
  return flatMap(array, (item): Array<T | U> => [item, delimiter]).slice(0, -1);
}

export function takeUntil<T>(array: T[], max: number, predicate: (T) => boolean): T[] {
  const filtered = [];

  for (let i = 0; i < array.length && filtered.length < max; i++) {
    if (predicate(array[i])) filtered.push(array[i]);
  }

  return filtered;
}

export function firstNonNull<T>(producers: Array<() => ?T>): ?T {
  for (let i = 0; i < producers.length; i++) {
    const result = producers[i]();
    if (result != null) return result;
  }

  return null;
}
