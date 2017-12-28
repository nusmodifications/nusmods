import R from 'ramda';

import BaseTask from './BaseTask';

const NUS_API_URL = 'http://nuslivinglab.nus.edu.sg/api_dev/api/Dept';
const FIELDS = ['name', 'type', 'owned_by'];
const SCHOOL_ID = { school_id: 1 };
// Prevent "Too many SQL variable errors thrown by SQLite"
// Default by SQLite is 999. Since we have 4 variables per row...
const MAX_INSERT_SIZE = Math.floor(999 / 4);

/**
 * Scrapes and saves venue data for the school.
 */
export default class VenuesScraper extends BaseTask {
  async save(existingRows, currentRows) {
    if (!currentRows.length) {
      throw new Error('No data found');
    }
    const transaction = await this.getTransaction();

    const map = R.indexBy(R.prop('name'), currentRows);

    const transactions = [];
    const transact = ({ name }) => this.db.table('venues').transacting(transaction).where({ name });
    existingRows.forEach((row) => {
      const currentRow = map[row.name];
      if (!currentRow) {
        // Content is no longer present
        transactions.push(transact(row).delete());
      } else if (!R.equals(currentRow, row)) {
        // Content is different
        transactions.push(transact(row).update(currentRow));
      }
      // Content is exactly the same, do nothing
      delete map[row.name];
    });

    return Promise.all(transactions)
      // Whatever remains must be new data
      .then(() => this.db.batchInsert('venues', Object.values(map), MAX_INSERT_SIZE))
      .then(transaction.commit)
      .catch(transaction.rollback);
  }

  async scrape() {
    const response = await this.http.get(NUS_API_URL, {
      params: {
        name: '',
        output: 'json',
      },
    });
    const currentVenues = response.data.map(datum => this.convertToRow(datum));
    const existingVenues = await this.db.table('venues').where(SCHOOL_ID).select(FIELDS);

    return this.save(existingVenues, currentVenues);
  }

  convertToRow(venue) {
    // The api is terribly named, name is not unique,
    // while code is more arguably more suitable as the name
    // and dept are not departments when they
    // can be owned by clubs and external vendors
    const { roomcode: name, roomname: type, dept: owned_by, ...extraProps } = venue;

    if (!R.isEmpty(extraProps)) {
      this.log.warn('Found extra properties', extraProps);
    }

    return {
      ...SCHOOL_ID,
      name,
      type,
      owned_by,
    };
  }
}
