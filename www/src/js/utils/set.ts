// @flow

import { flatten } from 'lodash';

export function union<T>(...sets: Set<T>[]): Set<T> {
  return new Set(flatten(sets.map((s) => Array.from(s))));
}

export function intersection<T>(...sets: Set<T>[]): Set<T> {
  if (sets.length === 0) return new Set();
  if (sets.length === 1) return sets[0];

  const intersect = sets[0];
  sets.slice(1).forEach((set) =>
    intersect.forEach((i) => {
      if (!set.has(i)) intersect.delete(i);
    }),
  );

  return intersect;
}

export function intersectionCount<T>(a: Set<T>, b: Set<T>): number {
  const [smaller, bigger] = a.size > b.size ? [b, a] : [a, b];
  let count = 0;
  smaller.forEach((v) => {
    count += bigger.has(v);
  });

  return count;
}
