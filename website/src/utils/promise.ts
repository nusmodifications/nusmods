/**
 * Recursively retry `fn` until success, `retries` has been reached, or
 * `shouldRetry` returns false.
 *
 * Implementation based on https://stackoverflow.com/a/30471209/5281021.
 */
export async function retry<T>(
  retries: number,
  fn: () => Promise<T>,
  shouldRetry: (error: Error) => boolean = () => true,
): Promise<T> {
  try {
    // Be sure to await before returning!
    return await fn();
  } catch (err) {
    if (retries <= 0 || !shouldRetry(err)) {
      throw err;
    }
    return retry(retries - 1, fn, shouldRetry);
  }
}
