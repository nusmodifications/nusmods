// @flow

import type { LocationShape } from 'react-router-dom';

// A subset of RouterHistory from react-router-dom
type HistoryManipulator = {
  push(path: string | LocationShape, state?: any): void,
  replace(path: string | LocationShape, state?: any): void,
};

/**
 * Wrapper around `RouterHistory` that converts `history.push()` to `history.replace()` if
 * they happen rapidly. This prevents the user history from being polluted with a large
 * number of states, eg. when they are exploring lessons or filter options.
 *
 * A leading edge debounce is used, which means the first call to `push()` calls `history.push()`
 * and starts the timer. All subsequent calls use `history.replace()` within `wait` milliseconds
 * and resets the timer. Once the timer expires, the next call will use `history.push()` again.
 */
export default class HistoryDebouncer {
  history: HistoryManipulator;
  wait: number;
  lastPush: number;

  constructor(history: HistoryManipulator, wait: number = 30 * 1000) {
    this.history = history;
    this.wait = wait;
    this.lastPush = -wait - 1;
  }

  push(path: string | LocationShape, state?: any) {
    if (Date.now() - this.lastPush > this.wait) {
      this.history.push(path, state);
    } else {
      this.history.replace(path, state);
    }

    this.lastPush = Date.now();
  }
}
