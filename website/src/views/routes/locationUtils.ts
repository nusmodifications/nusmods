/* eslint-disable @typescript-eslint/ban-types */

import type { Location, PartialPath, State, To } from 'history';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import resolvePathname from 'resolve-pathname';

// Source: https://github.com/ReactTraining/history/blob/3f69f9e07b0a739419704cffc3b3563133281548/modules/PathUtils.js#L24
function parsePath(path: string) {
  let pathname = path || '/';
  let search = '';
  let hash = '';

  const hashIndex = pathname.indexOf('#');
  if (hashIndex !== -1) {
    hash = pathname.substr(hashIndex);
    pathname = pathname.substr(0, hashIndex);
  }

  const searchIndex = pathname.indexOf('?');
  if (searchIndex !== -1) {
    search = pathname.substr(searchIndex);
    pathname = pathname.substr(0, searchIndex);
  }

  return {
    pathname,
    search: search === '?' ? '' : search,
    hash: hash === '#' ? '' : hash,
  };
}

// Source: https://github.com/ReactTraining/history/blob/3f69f9e07b0a739419704cffc3b3563133281548/modules/LocationUtils.js#L6
function createLocation(
  path: string | Location,
  state: State,
  key: string | null,
  currentLocation: Location,
): Location {
  let location: Partial<Location>;
  if (typeof path === 'string') {
    // Two-arg form: push(path, state)
    location = parsePath(path);
    location.state = state;
  } else {
    // One-arg form: push(location)
    location = { ...path };

    if (location.pathname === undefined) location.pathname = '';

    if (location.search) {
      if (location.search.charAt(0) !== '?') location.search = `?${location.search}`;
    } else {
      location.search = '';
    }

    if (location.hash) {
      if (location.hash.charAt(0) !== '#') location.hash = `#${location.hash}`;
    } else {
      location.hash = '';
    }

    if (state !== undefined && location.state === undefined) location.state = state;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    location.pathname = decodeURI(location.pathname!);
  } catch (e) {
    if (e instanceof URIError) {
      throw new URIError(
        `Pathname "${location.pathname}" could not be decoded. ` +
          `This is likely caused by an invalid percent-encoding.`,
      );
    } else {
      throw e;
    }
  }

  if (key) location.key = key;

  if (currentLocation) {
    // Resolve incomplete/relative pathname relative to current location.
    if (!location.pathname) {
      location.pathname = currentLocation.pathname;
    } else if (location.pathname.charAt(0) !== '/') {
      location.pathname = resolvePathname(location.pathname, currentLocation.pathname);
    }
  } else {
    // When there is no prior location and pathname is empty, set it to /
    // eslint-disable-next-line no-lonely-if
    if (!location.pathname) {
      location.pathname = '/';
    }
  }

  return location as Location; // FIXME: Dangerous cast as state may be undefined
}

// Source: https://github.com/ReactTraining/react-router/blob/9016c5191cb1b8ce727dc5aaed97376b1b291a70/packages/react-router-dom/modules/utils/locationUtils.js
export function resolveToLocation(
  to: To | ((location: Location) => string),
  currentLocation: Location,
): To {
  return typeof to === 'function' ? to(currentLocation) : to;
}

export function normalizeToLocation(to: To, currentLocation: Location): PartialPath {
  return typeof to === 'string' ? createLocation(to, null, null, currentLocation) : to;
}
