export function union<T>(...sets: Set<T>[]): Set<T> {
  return new Set(sets.flatMap((s) => Array.from(s)));
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

/**
 * Returns all elements of a minus all elements of b
 */
export function difference<T>(a: Set<T>, b: Set<T>): Set<T> {
  return new Set(Array.from(a).filter((element) => !b.has(element)));
}
