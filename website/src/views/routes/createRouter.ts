import { BrowserHistoryOptions, createBrowserHistory } from 'history';
import { MatchedRoute, matchRoutes } from 'react-router-config';
import {
  EntryPointRouteConfig,
  PreparedRouteEntry,
  RouteEntry,
  RoutingContextType,
  RoutingSubscriber,
} from './RoutingContext';

interface MatchedEntryPointRoute<Params extends { [K in keyof Params]?: string }>
  extends MatchedRoute<Params> {
  route: EntryPointRouteConfig;
}

/**
 * Match the current location to the corresponding route entry.
 */
function matchEntryPointRoutes<Params>(
  routes: EntryPointRouteConfig[],
  locationPathname: string,
): MatchedEntryPointRoute<Params>[] {
  const matchedRoutes = (matchRoutes(
    routes,
    locationPathname,
  ) as unknown) as MatchedEntryPointRoute<Params>[];
  if (!Array.isArray(matchedRoutes) || matchedRoutes.length === 0) {
    throw new Error(`No route for ${locationPathname}`);
  }
  return matchedRoutes;
}

/**
 * Load the data for the matched route, given the params extracted from the route
 */
function prepareMatches<Params>(
  matches: MatchedEntryPointRoute<Params>[],
): PreparedRouteEntry<Params, unknown>[] {
  return matches.map((match) => {
    const { route, match: matchData } = match;
    const prepared = route.prepare(matchData.params);
    const Component = route.componentResource.get();
    if (Component == null) {
      route.componentResource.preloadOrReloadIfError();
    }
    return { component: route.componentResource, prepared, routeData: matchData };
  });
}

/**
 * A custom router built from the same primitives as react-router. Each object in `routes`
 * contains both a Component and a prepare() function that can preload data for the component.
 * The router watches for changes to the current location via the `history` package, maps the
 * location to the corresponding route entry, and then preloads the code and data for the route.
 */
export default function createRouter(
  routes: EntryPointRouteConfig[],
  options: BrowserHistoryOptions | undefined,
) {
  // Initialize history
  const history = createBrowserHistory(options);

  // Find the initial match and prepare it
  const initialMatches = matchEntryPointRoutes(routes, history.location.pathname);
  const initialEntries = prepareMatches(initialMatches);
  let currentEntry: RouteEntry = {
    location: history.location,
    entries: initialEntries,
  };

  // maintain a set of subscribers to the active entry
  let nextId = 0;
  const subscribers = new Map<number, RoutingSubscriber>();

  // Listen for location changes, match to the route entry, prepare the entry,
  // and notify subscribers. Note that this pattern ensures that data-loading
  // occurs *outside* of - and *before* - rendering.
  const cleanup = history.listen(({ location }) => {
    if (location.pathname === currentEntry.location.pathname) {
      return;
    }
    const matches = matchEntryPointRoutes(routes, location.pathname);
    const entries = prepareMatches(matches);
    const nextEntry: RouteEntry = {
      location,
      entries,
    };
    currentEntry = nextEntry;
    subscribers.forEach((cb) => cb(nextEntry));
  });

  // The actual object that will be passed on the RoutingConext.
  const context: RoutingContextType = {
    history,
    get() {
      return currentEntry;
    },
    preloadCode(pathname) {
      // preload just the code for a route, without storing the result
      const matches = matchEntryPointRoutes(routes, pathname);
      matches.forEach(({ route }) => route.componentResource.preloadOrReloadIfError());
    },
    preload(pathname) {
      // preload the code and data for a route, without storing the result
      const matches = matchEntryPointRoutes(routes, pathname);
      prepareMatches(matches);
    },
    subscribe(cb) {
      const id = nextId;
      nextId += 1;
      const dispose = () => {
        subscribers.delete(id);
      };
      subscribers.set(id, cb);
      return dispose;
    },
  };

  // Return both the context object and a cleanup function
  return { cleanup, context };
}
