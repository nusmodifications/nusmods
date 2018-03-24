// @flow

/**
 * Calculate the ideal batch insert size to prevent "Too many SQL variable
 * errors thrown by SQLite" error.
 * @param {number} numVars number of variables in the inserted rows
 */
// eslint-disable-next-line import/prefer-default-export
export function maxInsertSize(numVars: number) {
  // Default by SQLite is 999. Since we have numVars variables per row...
  return Math.floor(999 / numVars);
}
