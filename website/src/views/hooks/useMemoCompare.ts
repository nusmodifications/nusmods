import { useEffect, useRef } from 'react';

// Source: https://usehooks.com/useMemoCompare/
export default function useMemoCompare<T>(
  next: T,
  compare: (previousValue: T | undefined, proposedNextValue: T) => boolean,
): T {
  // Ref for storing previous value
  const previousRef = useRef<T>();
  const previous = previousRef.current;

  // Pass previous and next value to compare function
  // to determine whether to consider them equal.
  const equal = compare(previous, next);

  // If not equal update previousRef to next value.
  // We only update if not equal (or if never been set) so that this hook
  // continues to return the same old value if compare keeps returning true.
  useEffect(() => {
    if (!equal || previousRef.current === undefined) {
      previousRef.current = next;
    }
  });

  return !equal || previous === undefined ? next : previous;
}
