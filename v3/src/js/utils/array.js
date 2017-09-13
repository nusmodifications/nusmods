// @flow

import { flatMap } from 'lodash';

/* eslint-disable import/prefer-default-export */

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
