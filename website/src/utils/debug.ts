import qs from 'query-string';
import { setTime } from 'utils/timify';

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

// By default, we use local venue data in test and development, but use prod data otherwise.
// We have flags to override these defaults in each case.
export function preferRepoVenues() {
  if (NUSMODS_ENV === 'development') {
    return getParams().prodVenue !== '1';
  }
  return getParams().localVenue === '1';
}
