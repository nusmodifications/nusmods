import { retry } from 'utils/promise';

/**
 * Wrap an async import() so that it automatically retries in case of a chunk
 * load error and when the user is online
 */
export default function retryImport<T>(importFactory: () => Promise<T>, retries = 3) {
  return retry(
    retries,
    importFactory,
    (error) => error.message.includes('Loading chunk ') && window.navigator.onLine,
  );
}
