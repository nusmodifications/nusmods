import React, { forwardRef, useCallback, useContext } from 'react';
import { LinkProps, Link, NavLink, NavLinkProps } from 'react-router-dom';
import { RoutePreloaderContext } from './RoutePreloaderContext';

function usePreloadCallbacks({ onMouseOver, onFocus, to }: LinkProps | NavLinkProps) {
  const preloaderContext = useContext(RoutePreloaderContext);
  if (!preloaderContext) {
    throw new Error('Preloading link components cannot be used outside RoutePreloaderContext.');
  }
  const preloadCode = useCallback(() => preloaderContext.preloadCode(to), [preloaderContext, to]);

  const combinedOnMouseOver = useCallback(
    (e) => {
      onMouseOver?.(e);
      preloadCode();
    },
    [onMouseOver, preloadCode],
  );
  const combinedOnFocus = useCallback(
    (e) => {
      onFocus?.(e);
      preloadCode();
    },
    [onFocus, preloadCode],
  );

  return { onMouseOver: combinedOnMouseOver, onFocus: combinedOnFocus };
}

export const PreloadingLink = forwardRef<HTMLAnchorElement, LinkProps>(
  function PreloadingLinkComponent(props, ref) {
    const preloadCallbacks = usePreloadCallbacks(props);
    return <Link {...props} {...preloadCallbacks} ref={ref} />;
  },
);

export const PreloadingNavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  function PreloadingNavLinkComponent(props, ref) {
    const preloadCallbacks = usePreloadCallbacks(props);
    return <NavLink {...props} {...preloadCallbacks} ref={ref} />;
  },
);
