// @flow

import util from 'util';

export const nextTick = util.promisify(process.nextTick);

/**
 * Wait for some condition to become true before continuing. Useful when testing
 * components that have async actions, such as making network requests
 */
export async function waitFor(condition: () => boolean, intervalInMs: number = 5) {
  // eslint-disable-next-line no-await-in-loop
  while (!condition()) {
    await new Promise((resolve) => setTimeout(resolve, intervalInMs));
  }
}
