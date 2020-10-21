import type { Location, BrowserHistory, State } from 'history';
import type { JSResource } from 'utils/JSResource';

import { createContext } from 'react';
import type { match } from 'react-router-dom';

type PreparedProps = { [key: string]: JSResource<unknown> };

export type EntryPointComponentProps = React.PropsWithChildren<{
  match: match<any>;
  prepared: { [key: string]: unknown };
}>;

export interface EntryPointRouteConfig {
  key?: React.Key;
  location?: Location;
  path?: string | string[];
  exact?: boolean;
  strict?: boolean;
  routes?: EntryPointRouteConfig[];
  componentResource: JSResource<React.ComponentType<EntryPointComponentProps>>;
  prepare: <Params>(matchParams: Params) => PreparedProps;
}

export type RouteComponentProps<Params> = {
  component: JSResource<React.ComponentType<EntryPointComponentProps>>;
  prepared: PreparedProps;
  routeData: match<Params>;
};

export type RouteEntry = {
  location: Location<State>;
  entries: RouteComponentProps<unknown>[];
};

export type RoutingSubscriber = (nextEntry: RouteEntry) => void;

export type RoutingContextType = Readonly<{
  history: BrowserHistory<State>;
  get(): RouteEntry;
  preloadCode(pathname: string): void;
  preload(pathname: string): void;
  subscribe(cb: RoutingSubscriber): () => void;
}>;

const RoutingContext = createContext<RoutingContextType | null>(null);

/**
 * A custom context instance for our router type
 */
export default RoutingContext;
