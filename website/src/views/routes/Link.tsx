import type { Location, To } from 'history';

import React, { memo, useCallback, useContext, useMemo } from 'react';
import { normalizeToLocation, resolveToLocation } from './locationUtils';
import RoutingContext from './RoutingContext';

export type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  replace?: boolean;
  to: To | ((location: Location) => string);
};

/**
 * An alternative to react-router's Link component that works with
 * our custom RoutingContext.
 */
const Link = memo<LinkProps>(({ replace, to, children, ...aProps }) => {
  const router = useContext(RoutingContext);
  if (!router) {
    throw new Error('You should not use <Link> outside a <RoutingContext>');
  }

  const href = useMemo(() => {
    const location = normalizeToLocation(
      resolveToLocation(to, router.history.location),
      router.history.location,
    );
    return location ? router.history.createHref(location) : '';
  }, [router.history, to]);

  // When the user clicks, change route
  const changeRoute = useCallback(
    (event) => {
      event.preventDefault();
      const finalLocation = resolveToLocation(to, router.history.location);
      const method = replace ? router.history.replace : router.history.push;
      method(finalLocation);
    },
    [to, router.history.location, router.history.replace, router.history.push, replace],
  );

  // Callback to preload just the code for the route:
  // we pass this to onMouseEnter, which is a weaker signal
  // that the user *may* navigate to the route.
  const preloadRouteCode = useCallback(() => {
    router.preloadCode(href);
  }, [href, router]);

  // Callback to preload the code and data for the route:
  // we pass this to onMouseDown, since this is a stronger
  // signal that the user will likely complete the navigation
  const preloadRoute = useCallback(() => {
    router.preload(href);
  }, [href, router]);

  return (
    <a
      {...aProps}
      href={href}
      onClick={changeRoute}
      onMouseEnter={preloadRouteCode}
      onMouseDown={preloadRoute}
    >
      {children}
    </a>
  );
});

export default Link;
