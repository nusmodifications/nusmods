import type { Params, PartialRouteObject, RouteObject } from 'react-router';
import type { JSResource } from 'utils/JSResource';
import type { Dispatch } from 'types/redux';

export type EntryPointComponentProps<PreparedProps> = React.PropsWithChildren<{
  params: Params;
  prepared: PreparedProps;
}>;

export type EntryPoint<PreparedProps, ComponentProps = EntryPointComponentProps<PreparedProps>> = {
  component: JSResource<React.ComponentType<ComponentProps>>;
  prepare: (matchParams: Params, dispatch: Dispatch) => PreparedProps;
};

export interface EntryPointRouteObject extends RouteObject {
  preloadCode?: () => void;
  children?: EntryPointRouteObject[];
}

export interface EntryPointPartialRouteObject extends PartialRouteObject {
  preloadCode?: () => void;
  children?: EntryPointPartialRouteObject[];
}
