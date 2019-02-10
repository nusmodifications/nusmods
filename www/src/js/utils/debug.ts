// @flow
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

// Force module finder to always enable or disable instant search
export function forceInstantSearch() {
  const instant = getParams().instant;

  if (typeof instant === 'undefined') return null;
  return instant === '1';
}

// Force the current date/time to some value for components that use the
// global timer HOC
export function forceTimer() {
  const dateString = getParams().date;
  if (!dateString) return null;

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return null;

  // Add current time if not specified
  if (date.getUTCHours() === 0 && date.getMinutes() === 0 && date.getSeconds() === 0) {
    return setTime(date, new Date());
  }

  return date;
}

// Force the CORS reminder for a certain round (eg. 0, 1A, 2B) to appear
export function forceCorsRound() {
  return getParams().round;
}

export function allowBusStopEditing() {
  return getParams().edit === '1';
}
