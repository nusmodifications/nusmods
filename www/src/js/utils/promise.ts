// Recursively retry fn until success, retries has been reached, or shouldRetry returns false.
// Based on https://stackoverflow.com/a/30471209/5281021
// TODO: Remove eslint-disable-line comment when other functions have been added to this file
export function retry( // eslint-disable-line import/prefer-default-export
  retries: number,
  fn: () => Promise<any>,
  shouldRetry: (error: Error) => boolean = () => true,
) {
  return fn().catch((err) => {
    if (retries <= 0 || !shouldRetry(err)) {
      throw err;
    }
    return retry(retries - 1, fn, shouldRetry);
  });
}
