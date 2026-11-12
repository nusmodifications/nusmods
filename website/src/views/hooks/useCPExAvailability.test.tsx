import { act, renderHook } from '@testing-library/react';

import config from 'config';
import useCPExAvailability from './useCPExAvailability';

describe(useCPExAvailability, () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  test('updates availability at the opening and closing boundaries without a page reload', () => {
    vi.useFakeTimers();
    const opening = new Date('2026-10-20T09:00:00+08:00');
    const closing = new Date('2026-10-20T09:00:02+08:00');
    vi.setSystemTime(new Date('2026-10-20T08:59:59+08:00'));

    vi.spyOn(config, 'isCPExAvailable').mockImplementation((now = new Date()) => {
      return now >= opening && now < closing;
    });
    vi.spyOn(config, 'getNextCPExAvailabilityChange').mockImplementation((now) => {
      if (now < opening) return opening;
      if (now < closing) return closing;
      return null;
    });

    const { result } = renderHook(() => useCPExAvailability());
    expect(result.current.isAvailable).toBe(false);

    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.isAvailable).toBe(true);

    act(() => vi.advanceTimersByTime(2000));
    expect(result.current.isAvailable).toBe(false);
  });
});
