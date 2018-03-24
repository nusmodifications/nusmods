// @flow

import type { Knex } from 'knex';
import R from 'ramda';

import config from '../../config';
import { walkJsonDir } from '../util/walkDir';

const SCHOOL_ID = { school_id: 1 };
// Prevent "Too many SQL variable errors thrown by SQLite"
// Default by SQLite is 999. Since we have 4 variables per row...
const MAX_INSERT_SIZE = Math.floor(999 / 4);

export default async function populateVenues(db: Knex) {
  const { dataFolder } = config;
  const rawData = await walkJsonDir(dataFolder, 'venues.json', 2);

  const mapToRow = (venueName: string) => ({ ...SCHOOL_ID, name: venueName });
  const getVenues = R.compose(R.map(mapToRow), R.uniq, R.flatten, R.map(R.values), R.values);
  const venues = getVenues(rawData);
  // console.log(venues);

  await db.batchInsert('venues', venues, MAX_INSERT_SIZE);
}
