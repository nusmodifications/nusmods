import type { Params, PartialRouteObject, RouteObject } from 'react-router';
import type { JSResourceReference } from 'utils/JSResource';
import type { Dispatch } from 'types/redux';

export type EntryPointComponentProps<PreparedProps> = React.PropsWithChildren<{
  prepared: PreparedProps;
}>;

export type EntryPoint<PreparedProps, ComponentProps = EntryPointComponentProps<PreparedProps>> = {
  /**
   * A reference to the root React component of this entry point.
   */
  component: JSResourceReference<React.ComponentType<ComponentProps>>;
  /**
   * Should be idempotent as there is a good chance it'll be called multiple
   * times in quick succession on a single page navigation.
   */
  getPreparedProps: (params: Params, dispatch: Dispatch) => PreparedProps;
  /**
   * Optionally invalidate prepared props. Typically done so that the next call
   * to getPreparedProps can prepare a fresh set of data or retry any failed
   * requests.
   */
  disposePreparedProps?: (params: Params) => void;
};

export interface EntryPointRouteObject extends RouteObject {
  preloadCode?: () => void;
  children?: EntryPointRouteObject[];
}

export interface EntryPointPartialRouteObject extends PartialRouteObject {
  preloadCode?: () => void;
  children?: EntryPointPartialRouteObject[];
}
