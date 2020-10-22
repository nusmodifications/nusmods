import React, { useCallback, useContext } from 'react';
import { LinkProps, Link, NavLink, NavLinkProps } from 'react-router-dom';
import { RoutePreloaderContext } from './RoutePreloaderContext';

function usePreloadCallbacks(to: LinkProps['to'] | NavLinkProps['to']) {
  const preloaderContext = useContext(RoutePreloaderContext);
  if (!preloaderContext) {
    throw new Error('Preloading link components cannot be used outside RoutePreloaderContext.');
  }
  const preloadCode = useCallback(() => preloaderContext.preloadCode(to), [preloaderContext, to]);
  return { preloadCode };
}

export const PreloadingLink: React.FC<Omit<LinkProps, 'onMouseOver' | 'onFocus'>> = (props) => {
  const { preloadCode } = usePreloadCallbacks(props.to);
  return <Link {...props} onMouseOver={preloadCode} onFocus={preloadCode} />;
};

export const PreloadingNavLink: React.FC<Omit<NavLinkProps, 'onMouseOver' | 'onFocus'>> = (
  props,
) => {
  const { preloadCode } = usePreloadCallbacks(props.to);
  return <NavLink {...props} onMouseOver={preloadCode} onFocus={preloadCode} />;
};
