// @flow

import db from '../db';
import populateVenues from './venues';

(async function dbfy() {
  // Clear tables
  await db
    .select()
    .table('venues')
    .del();

  await populateVenues(db);
  // console.log('Done');
  process.exit();
})();
