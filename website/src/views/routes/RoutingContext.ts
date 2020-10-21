import type { Location, BrowserHistory, State } from 'history';
import type { RouteConfig } from 'react-router-config';
import type { JSResource } from 'utils/JSResource';

import { createContext } from 'react';
import { match } from 'react-router-dom';

type PreparedProps = { [key: string]: JSResource<unknown> };

export interface EntryPointRouteConfig {
  key?: React.Key;
  location?: Location;
  path?: string | string[];
  exact?: boolean;
  strict?: boolean;
  routes?: RouteConfig[];
  componentResource: JSResource<unknown>;
  prepare: <Params>(matchParams: Params) => PreparedProps;
}

export type RouteComponentProps<Params, Component extends React.ComponentType> = {
  component: JSResource<Component>;
  prepared: PreparedProps;
  routeData: match<Params>;
};

export type RouteEntry = {
  location: Location<State>;
  entries: RouteComponentProps<unknown, any>[];
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
