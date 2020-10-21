import type { Location, BrowserHistory, State } from 'history';
import type { JSResource } from 'utils/JSResource';

import { createContext } from 'react';
import type { match } from 'react-router-dom';

// type PreparedProps = { [key: string]: JSResource<unknown> };

export type EntryPointComponentProps<PreparedProps, Params> = React.PropsWithChildren<{
  match: match<Params>;
  prepared: PreparedProps;
}>;

export interface EntryPointRouteConfig<
  PreparedProps,
  Params,
  ComponentProps = EntryPointComponentProps<Params, PreparedProps>
> {
  key?: React.Key;
  location?: Location;
  path?: string | string[];
  exact?: boolean;
  strict?: boolean;
  routes?: EntryPointRouteConfig<any, any>[];
  componentResource: JSResource<React.ComponentType<ComponentProps>>;
  prepare: (matchParams: Params) => PreparedProps;
}

export type RouteComponentProps<
  PreparedProps,
  Params,
  ComponentProps = EntryPointComponentProps<Params, PreparedProps>
> = {
  component: JSResource<React.ComponentType<ComponentProps>>;
  prepared: PreparedProps;
  routeData: match<Params>;
};

export type RouteEntry = {
  location: Location<State>;
  entries: RouteComponentProps<unknown, unknown>[];
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
