/**
 * Get the difference between each consecutive array elements. If there are
 * less than 2 elements in the array, an empty array is returned
 */
export function deltas(array: Array<number>): Array<number> {
  let previous = array[0];
  if (previous === undefined) {
    return [];
  }

  const results = [];
  for (const next of array.slice(1)) {
    results.push(next - previous);
    previous = next;
  }

  return results;
}

export function allEqual<T>(array: Array<T>): boolean {
  const first = array[0];
  if (first === undefined) {
    return true;
  }
  return array.every((element) => element === first);
}
