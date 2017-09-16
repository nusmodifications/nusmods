// @flow

import { sum } from 'lodash';

// Subset of Set properties that do not mutate the set
// This is used to allow the creation of Set-like objects that are can have their intersection
// calculated without doing a real union, which would require creating a new set object
export type ReadOnlySet<T> = {
  +size: number,
  +has: (value: T) => boolean,
  +forEach: (callbackfn: (value: T, index: T, set: Set<T>) => mixed, thisArg?: any) => void,
};

// Fast 'union' between multiple disjoint sets creating a read-only set-like object
// The inputs must be disjoint, such as from a partition, otherwise size and forEach
// will contain duplicates
export function partitionUnion<T>(...sets: Set<T>[]): ReadOnlySet<T> {
  if (sets.length === 0) return new Set();
  if (sets.length === 1) return sets[0];

  return {
    sets,

    size: sum(sets.map(set => set.size)),

    has(value) {
      return this.sets.some(set => set.has(value));
    },

    forEach(fn) {
      this.sets.forEach(set => set.forEach(fn));
    },
  };
}

// Fast Set operations over a small number of sets. Assumptions:
//
//   has()      O(1)
//   delete()   O(1)
//   add()      O(1)
//   forEach()  O(n)
//
// Therefore to get the best time, we iterate over the smallest sets first

function compareSets(a: ReadOnlySet<any>, b: ReadOnlySet<any>): number {
  return b.size - a.size;
}

export function intersection<T>(...sets: ReadOnlySet<T>[]): Set<T> {
  const newSet = new Set();

  if (sets.length === 0) return newSet;
  if (sets.length === 1) {
    sets[0].forEach(v => newSet.add(v));
    return newSet;
  }

  sets.sort(compareSets);

  // Initialize s with the first two items in the array of sets
  sets[0].forEach((v) => {
    if (sets[1].has(v)) newSet.add(v);
  });

  // Intersect with the rest of the sets by removing any non-intersecting items
  sets.slice(2).forEach((set) => {
    newSet.forEach((v) => {
      if (!set.has(v)) newSet.delete(v);
    });
  });

  return newSet;
}

export function intersectionCount<T>(a: Set<T>, b: Set<T>): number {
  const [smaller, bigger] = a.size > b.size ? [b, a] : [a, b];
  let count = 0;
  smaller.forEach((v) => {
    count += bigger.has(v);
  });

  return count;
}
