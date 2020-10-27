import React, { createContext, useCallback } from 'react';
import { PartialLocation } from 'history';
import { matchRoutes } from 'react-router-dom';
import type { RouteMatch } from 'react-router';
import { EntryPointRouteObject } from './types';

export type RoutePreloaderContextType = Readonly<{
  preloadCode(location: string | PartialLocation): void;
}>;

export const RoutePreloaderContext = createContext<RoutePreloaderContextType | null>(null);
// TODO: Wrap this in if (__DEV__)
RoutePreloaderContext.displayName = 'RoutePreloaderContext';

interface EntryPointRouteMatch extends RouteMatch {
  route: EntryPointRouteObject;
}

/**
 * Match the current location to the corresponding route entry.
 */
function matchEntryPointRoutes(
  routes: EntryPointRouteObject[],
  location: string | PartialLocation,
): EntryPointRouteMatch[] | null {
  return matchRoutes(routes, location);
}

export const RoutePreloaderProvider: React.FC<{
  routes: EntryPointRouteObject[];
}> = ({ routes, children }) => {
  const preloadCode = useCallback(
    (location: string | PartialLocation) => {
      // preload just the code for a route
      const matches = matchEntryPointRoutes(routes, location);
      if (matches) {
        matches.forEach(({ route }) => route.preloadCode?.());
      }
    },
    [routes],
  );

  // const preload = useCallback(
  //   (location: string | PartialLocation) => {
  //     // preload the code and data for a route, without storing the result
  //     const matches = matchEntryPointRoutes(routes, location);
  //     // TODO: Fix preload param. Check React Router implementation?
  //     matches.forEach(({ route, params, pathname }) =>
  //       route.preload?.(
  //         params,
  //         {
  //           state: {},
  //           pathname,
  //           search: '<<PreloadingContext placeholder; TODO: fix>>',
  //           hash: '<<PreloadingContext placeholder; TODO: fix>>',
  //           key: '<<PreloadingContext placeholder; TODO: fix>>',
  //         },
  //         0,
  //       ),
  //     );
  //   },
  //   [routes],
  // );

  return (
    <RoutePreloaderContext.Provider
      value={{
        preloadCode,
      }}
    >
      {children}
    </RoutePreloaderContext.Provider>
  );
};

export default RoutePreloaderContext;
