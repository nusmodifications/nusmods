import { History, LocationDescriptorObject, LocationState, createPath } from 'history'; // eslint-disable-line import/no-extraneous-dependencies

/**
 * Wrapper around `RouterHistory` that converts `history.push()` to `history.replace()` if
 * they happen rapidly. This prevents the user history from being polluted with a large
 * number of states, eg. when they are exploring lessons or filter options.
 *
 * A leading edge debounce is used, which means the first call to `push()` calls `history.push()`
 * and starts the timer. All subsequent calls use `history.replace()` within `wait` milliseconds
 * and resets the timer. Once the timer expires, the next call will use `history.push()` again.
 */
export default class HistoryDebouncer<HistoryLocationState = LocationState> {
  history: History<HistoryLocationState>;

  wait: number;

  lastPush: number;

  constructor(history: History<HistoryLocationState>, wait: number = 30 * 1000) {
    this.history = history;
    this.wait = wait;
    this.lastPush = -wait - 1;
  }

  push(path: string | LocationDescriptorObject, state?: HistoryLocationState) {
    // Do not navigate if the path object matches
    const nextPath = typeof path === 'string' ? path : createPath(path);
    if (nextPath === createPath(this.history.location)) return;

    if (Date.now() - this.lastPush > this.wait) {
      // TypeScript doesn't recognize our push as a proxy for History.push's
      // overloaded signature, and it's really hard to fix this properly
      this.history.push(path as string, state);
    } else {
      try {
        this.history.replace(path as string, state);
      } catch (e) {
        // Ignore Safari's history.replaceState() rate limit error.
        // See https://github.com/nusmodifications/nusmods/issues/763
        if (
          e.name === 'SecurityError' &&
          e.message.includes('Attempt to use history.replaceState()')
        ) {
          return;
        }

        // Continue throwing all other errors
        throw e;
      }
    }

    this.lastPush = Date.now();
  }
}
