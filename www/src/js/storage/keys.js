// @flow
/**
 * Keys used for localStorage - kept here in a constants file to ensure they don't collide
 */
export const V2_MIGRATION_KEY = 'v2Migration';
export const LEGACY_REDUX_KEY = 'reduxState';
export const PERSIST_MIGRATION_KEY = 'reduxPersistMigration';
export const BROWSER_WARNING_KEY = 'dismissedBrowserWarning';

// Used by announcements
const ANNOUNCEMENT_PREFIX = 'announcements.';
export function announcementKey(key: ?string) {
  if (!key) return null;
  return `${ANNOUNCEMENT_PREFIX}${key}`;
}
