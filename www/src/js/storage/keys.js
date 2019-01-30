// @flow
/**
 * Keys used for localStorage - kept here in a constants file to ensure they don't collide
 */
export const BROWSER_WARNING_KEY = 'dismissedBrowserWarning';

// Change this every year if we want to keep participating
export const HACKTOBERFEST = 'hacktoberfest-2018';

// Used by announcements
const ANNOUNCEMENT_PREFIX = 'announcements.';
export function announcementKey(key: ?string) {
  if (!key) return null;
  return `${ANNOUNCEMENT_PREFIX}${key}`;
}

// Used by ModTris
export const MODTRIS_SCORES = 'modtris-scores';
