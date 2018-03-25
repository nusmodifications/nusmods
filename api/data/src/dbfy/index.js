// @flow

import db from '../db';
import populateVenues from './venues';
import populateModules from './modules';

/**
 * IIFE which clears db and populates it with venue and module data from the
 * JSON files in the data folder.
 */
(async function dbfy() {
  // Clear tables
  const tables = ['venues', 'modules', 'classes', 'corsBiddingStats'];
  await Promise.map(tables, async (table) =>
    db
      .select()
      .table(table)
      .del(),
  );

  await populateVenues(db);
  await populateModules(db);
  process.exit();
})();
