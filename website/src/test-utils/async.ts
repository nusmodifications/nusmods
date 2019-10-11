import util from 'util';

export const nextTick = util.promisify(process.nextTick);

/**
 * Wait for some condition to become true before continuing. Useful when testing
 * components that have async actions, such as making network requests
 */
export async function waitFor(condition: () => boolean, intervalInMs = 5) {
  while (!condition()) {
    // eslint-disable-next-line no-await-in-loop
    await new Promise((resolve) => setTimeout(resolve, intervalInMs));
  }
}
