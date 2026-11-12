import { useEffect, useState } from 'react';

import config from 'config';

// setTimeout overflows above 2^31 - 1 ms, so cap long waits and recalculate when they fire.
const MAX_TIMEOUT_DELAY_MS = 2_147_483_647;

export type CPExAvailability = {
  isAvailable: boolean;
  now: Date;
};

export default function useCPExAvailability(): CPExAvailability {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let timeoutId: number | undefined;

    const update = () => {
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);

      const currentTime = new Date();
      setNow(currentTime);

      const nextChange = config.getNextCPExAvailabilityChange(currentTime);
      if (nextChange) {
        const delay = Math.max(
          1,
          Math.min(nextChange.getTime() - currentTime.getTime(), MAX_TIMEOUT_DELAY_MS),
        );
        timeoutId = window.setTimeout(update, delay);
      }
    };

    const onVisibilityChange = () => {
      if (!document.hidden) update();
    };

    update();
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  return { now, isAvailable: config.isCPExAvailable(now) };
}
