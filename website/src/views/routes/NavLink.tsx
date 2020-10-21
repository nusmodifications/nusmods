import React, { AriaAttributes, memo, useContext } from 'react';
import classnames from 'classnames';
import { matchPath } from 'react-router-dom';
import type { To } from 'history';
import Link, { LinkProps } from './Link';
import RoutingContext from './RoutingContext';
import { normalizeToLocation, resolveToLocation } from './locationUtils';
import { useLocation } from './hooks';

type NavLinkProps = LinkProps & {
  'aria-current'?: AriaAttributes['aria-current'];
  activeClassName?: string;
  className?: string;
  exact?: boolean;
  sensitive?: boolean;
  strict?: boolean;
  to: To;
};

const NavLink = memo<NavLinkProps>(
  ({
    'aria-current': ariaCurrent = 'page',
    activeClassName = 'active',
    className: classNameProp,
    exact,
    sensitive,
    strict,
    to,
    ...rest
  }) => {
    if (!useContext(RoutingContext)) {
      throw new Error('You should not use <NavLink> outside a <RoutingContext>');
    }

    const currentLocation = useLocation();

    const toLocation = normalizeToLocation(resolveToLocation(to, currentLocation), currentLocation);
    const { pathname: path } = toLocation;
    // Regex taken from: https://github.com/pillarjs/path-to-regexp/blob/master/index.js#L202
    const escapedPath = path && path.replace(/([.+*?=^!:${}()[\]|/\\])/g, '\\$1');

    const match = escapedPath
      ? matchPath(currentLocation.pathname, {
          path: escapedPath,
          exact,
          sensitive,
          strict,
        })
      : null;
    const isActive = !!match;

    const className = isActive ? classnames(classNameProp, activeClassName) : classNameProp;

    const props = {
      'aria-current': (isActive && ariaCurrent) || undefined,
      className,
      to: toLocation,
      ...rest,
    };

    return <Link {...props} />;
  },
);

export default NavLink;
