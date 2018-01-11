// @flow
/**
 * Keys used for localStorage
 */
export const V2_MIGRATION_KEY = 'v2Migration';
export const LEGACY_REDUX_KEY = 'reduxState';
export const PERSIST_MIGRATION_KEY = 'reduxPersistMigration';

// Used by announcements
const ANNOUNCEMENT_PREFIX = 'announcements.';
export function announcementKey(key: ?string) {
  if (!key) return null;
  return `${ANNOUNCEMENT_PREFIX}${key}`;
}
