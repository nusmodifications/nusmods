/**
 * Keys used for localStorage - kept here in a constants file to ensure they don't collide
 */
export const BROWSER_WARNING_KEY = 'dismissedBrowserWarning';

// Change this every year if we want to keep participating
export const HACKTOBERFEST = 'hacktoberfest-2018';

// Used by announcements
const ANNOUNCEMENT_PREFIX = 'announcements.';
/**
 * Returns a transformed announcement key. Possible values:
 *
 * - `null`: An announcement that cannot be dismissed.
 * - A `string` value: A dismissable announcement.
 */
export function announcementKey(key: string | null) {
  if (!key) return null;
  return `${ANNOUNCEMENT_PREFIX}${key}`;
}

// Used by ModTris
export const MODTRIS_SCORES = 'modtris-scores';

export const CONTACT_INFO = 'contact-info';

// Used by MPE
export const NUS_AUTH_TOKEN = 'nus-auth-token';
