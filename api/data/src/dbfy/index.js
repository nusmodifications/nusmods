// @flow

import db from '../db';
import populateVenues from './venues';
import populateModules from './modules';

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
  // console.log('Done');
  process.exit();
})();
