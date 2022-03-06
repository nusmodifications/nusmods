/* eslint-disable import/prefer-default-export */

/**
 * See:
 * - https://github.com/nusmodifications/nusmods/issues/2057
 * - https://github.com/nusmodifications/nusmods/pull/3212
 */

import { useState, useDebugValue } from 'react';
import qs from 'query-string';
import { setTime } from 'utils/timify';
import { DEBUG_HOOK_NAMES } from 'types/vendor/window.d';

export const enableShortUrl = false;

/** Enable Module Planning Exercise */
export const enableMpe = true;

// Debug helper - allows developers to force some hard to reproduce
// conditions to trigger via query params

function getParams() {
  return qs.parse(window.location.search);
}

// Force the 'new version available' refresh prompt to appear
export function forceRefreshPrompt() {
  return getParams().refresh === '1';
}

// Overriding the Elasticsearch host URL from config, used for testing with a local ES server
export function forceElasticsearchHost() {
  return getParams().eshost;
}

// Force the current date/time to some value for components that use the
// global timer HOC
export function forceTimer() {
  let dateString = getParams().date;
  if (!dateString) return null;
  if (Array.isArray(dateString)) [dateString] = dateString;

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return null;

  // Add current time if not specified
  if (date.getUTCHours() === 0 && date.getMinutes() === 0 && date.getSeconds() === 0) {
    return setTime(date, new Date());
  }

  return date;
}

export function allowBusStopEditing() {
  return getParams().edit === '1';
}

export function preferRepoVenues() {
  return getParams().localVenue === '1';
}

export default function useGlobalDebugValue<T>(name: DEBUG_HOOK_NAMES, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);

  useDebugValue(name);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any)[name] = setValue;

  return value;
}
