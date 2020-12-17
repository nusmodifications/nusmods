import { useRef, useState, useEffect } from 'react';
import { differenceInMilliseconds } from 'date-fns';

import { forceTimer } from 'utils/debug';

function getCurrentTime() {
  return forceTimer() || new Date();
}

/**
 * Hook version of withTimer
 */
export default function useCurrentTime(intervalInMs: number = 60 * 1000) {
  const intervalId = useRef<number>();
  const [time, setTime] = useState(getCurrentTime());

  useEffect(() => {
    // Update current time every interval milliseconds
    intervalId.current = window.setInterval(() => {
      setTime(getCurrentTime());
    }, intervalInMs);

    // Page visibility changes when tabs go in and out of focus. When tabs
    // are out of focus, mobile browsers slow down timers, so we run an
    // additional check to make sure the page state has not drifted too far
    // from the wall clock
    const onPageVisibilityChange = () => {
      setTime((prevTime) => {
        const now = getCurrentTime();
        if (!document.hidden && differenceInMilliseconds(now, prevTime) > intervalInMs) {
          return now;
        }
        return prevTime;
      });
    };

    document.addEventListener('visibilitychange', onPageVisibilityChange);

    return () => {
      window.clearTimeout(intervalId.current);
      document.removeEventListener('visibilitychange', onPageVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Technically this can just be getCurrentTime(), but we use state so we can trigger rerender
  return time;
}
