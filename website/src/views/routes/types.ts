import type { Params, PartialRouteObject, RouteObject } from 'react-router';
import type { useDispatch } from 'react-redux';
import type { JSResource } from 'utils/JSResource';

export type EntryPointComponentProps<PreparedProps> = React.PropsWithChildren<{
  params: Params;
  prepared: PreparedProps;
}>;

export type EntryPoint<PreparedProps, ComponentProps = EntryPointComponentProps<PreparedProps>> = {
  component: JSResource<React.ComponentType<ComponentProps>>;
  prepare: (matchParams: Params, dispatch: ReturnType<typeof useDispatch>) => PreparedProps;
};

export interface EntryPointRouteObject extends RouteObject {
  preloadCode?: () => void;
  children?: EntryPointRouteObject[];
}

export interface EntryPointPartialRouteObject extends PartialRouteObject {
  preloadCode?: () => void;
  children?: EntryPointPartialRouteObject[];
}
