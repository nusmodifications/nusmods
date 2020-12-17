export function isNotNull<T>(t: T | undefined | null): t is T {
  return t != null;
}