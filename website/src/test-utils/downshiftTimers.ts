import { beforeEach, afterEach, vi } from 'vitest';

// Downshift has an internal setTimeout that accesses `document` after test cleanup.
// Use fake timers to flush pending timers before jsdom is torn down.
export function setupDownshiftTimers() {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });
}
