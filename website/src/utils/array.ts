import { flatMap } from 'lodash';

/**
 * Mixes the delimiter into the array between each element
 *
 * @param {T[]} array
 * @param {U} delimiter
 * @returns {Array<T|U>}
 */
export function intersperse<T, U>(array: T[], delimiter: U): (T | U)[] {
  return flatMap(array, (item): (T | U)[] => [item, delimiter]).slice(0, -1);
}

export function takeUntil<T>(array: T[], max: number, predicate: (t: T) => boolean): T[] {
  const filtered: T[] = [];
  for (const elem of array) {
    if (filtered.length === max) break;
    if (predicate(elem)) filtered.push(elem);
  }
  return filtered;
}

export function firstNonNull<T>(producers: (() => T | null)[]): T | null {
  for (const producer of producers) {
    const result = producer() ?? null;
    if (result !== null) return result;
  }
  return null;
}

export function deltas(numbers: readonly number[]): number[] {
  if (numbers.length <= 1) return [];
  const result: number[] = [];
  let prev = numbers[0]!;
  for (let i = 1; i < numbers.length; ++i) {
    const cur = numbers[i]!;
    result.push(cur - prev);
    prev = cur;
  }
  return result;
}
