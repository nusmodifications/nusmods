import type { MediaQuery } from 'types/views';
import { useMemo } from 'react';
import { Subscription, useSubscription } from 'use-subscription';
import json2mq from 'json2mq';

/**
 * To be used together with utilities in css.ts.
 * @returns Whether `mediaQuery` is/are matched.
 */
export default function useMediaQuery(mediaQuery: MediaQuery) {
  const media = useMemo(() => (typeof mediaQuery === 'string' ? mediaQuery : json2mq(mediaQuery)), [
    mediaQuery,
  ]);

  const subscription = useMemo<Subscription<boolean>>(
    () => ({
      getCurrentValue: () => window.matchMedia(media).matches,
      subscribe(callback) {
        const mediaQueryList = window.matchMedia(media);
        if (mediaQueryList.addEventListener) {
          mediaQueryList.addEventListener('change', callback);
        } else {
          // To support quirk on Safari versions prior to Safari 14
          // See https://github.com/nusmodifications/nusmods/issues/3029
          mediaQueryList.addListener(callback);
        }
        return () => {
          if (mediaQueryList.removeEventListener) {
            mediaQueryList.removeEventListener('change', callback);
          } else {
            mediaQueryList.removeListener(callback);
          }
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
