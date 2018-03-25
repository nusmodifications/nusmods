// @flow

import type { Knex } from 'knex';
import R from 'ramda';

import config from '../../config';
import { walkJsonDir } from '../util/walkDir';
import { maxInsertSize } from '../util/db';

const SCHOOL_ID = { school_id: 1 };

/**
 * Store venue data into db.
 *
 * @param db database to store into
 */
export default async function populateVenues(db: Knex) {
  const { dataFolder, venuesFileName } = config;
  const rawData = await walkJsonDir(dataFolder, venuesFileName, 2);

  const mapToRow = (venueName: string) => ({ ...SCHOOL_ID, name: venueName });
  const getVenues = R.compose(R.map(mapToRow), R.uniq, R.flatten, R.map(R.values), R.values);
  const venues = getVenues(rawData);
  // console.log(venues);

  await db.batchInsert('venues', venues, maxInsertSize(4));
}
