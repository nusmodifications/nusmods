import { useMemo } from 'react';
import { Subscription, useSubscription } from 'use-subscription';
import json2mq, { QueryObject } from 'json2mq';

/**
 * To be used together with utilities in css.ts.
 * @returns Whether `mediaQuery` is/are matched.
 */
export default function useMediaQuery(mediaQuery: string | QueryObject | QueryObject[]) {
  const media = useMemo(() => {
    return typeof mediaQuery === 'string' ? mediaQuery : json2mq(mediaQuery);
  }, [mediaQuery]);

  const subscription = useMemo<Subscription<boolean>>(
    () => ({
      getCurrentValue: () => window.matchMedia(media).matches,
      subscribe(callback) {
        const mediaQueryList = window.matchMedia(media);
        mediaQueryList.addEventListener('change', callback);
        return () => {
          mediaQueryList.removeEventListener('change', callback);
        };
      },
    }),
    [media],
  );

  // TODO: Replace with useMutableSource after we adopt React concurrent mode. See:
  // Docs: https://github.com/reactjs/rfcs/blob/master/text/0147-use-mutable-source.md
  // Example: https://github.com/facebook/react/blob/36df483/packages/react-devtools-scheduling-profiler/src/hooks.js
  const matchedBreakpoint = useSubscription(subscription);

  return matchedBreakpoint;
}
