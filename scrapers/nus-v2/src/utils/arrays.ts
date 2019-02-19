/* eslint-disable import/prefer-default-export */

/**
 * Get the difference between each consecutive array elements. If there are
 * less than 2 elements in the array, an empty array is returned
 */
export function deltas(array: number[]): number[] {
  let previous = array[0];
  if (typeof previous === 'undefined') return [];

  const results = [];
  for (const next of array.slice(1)) {
    results.push(next - previous);
    previous = next;
  }

  return results;
}

export function allEqual<T>(array: T[]): boolean {
  const first = array[0];
  if (typeof first === 'undefined') return true;
  return array.every((element) => element === first);
}
