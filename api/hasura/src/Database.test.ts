import { Client } from 'pg';
import Database from './Database';
import config from './config';
import dbMigration from './__tests__/utils/dbMigration';

jest.mock('./config');

const TEST_EMAIL = 'test@example.com';

describe('Database', () => {
  let database: Database;
  let client: Client;

  beforeAll(async () => {
    database = new Database(config.database);
    client = new Client(config.database);

    await client.connect();
    await dbMigration.down(client);
  });

  beforeEach(async () => {
    await dbMigration.up(client);
  });

  afterEach(async () => {
    await dbMigration.down(client);
  });

  it('should create user if it does not exist', async () => {
    expect.assertions(4);

    const accountId = await database.findOrCreateUser(TEST_EMAIL);
    expect(typeof accountId).toBe('string');

    const accounts = await client.query('SELECT * FROM account');
    expect(accounts.rowCount).toBe(1);

    const account = accounts.rows[0];
    expect(account).toMatchObject({
      account_id: accountId,
      email: TEST_EMAIL,
    });
    expect(account.created_at).toEqual(account.updated_at);
  });

  it('should not create user if it does exist', async () => {
    expect.assertions(3);

    const insertedAccounts = await client.query(
      'INSERT INTO account (email) VALUES($1) RETURNING *',
      [TEST_EMAIL],
    );

    const queriedAccountId = await database.findOrCreateUser(TEST_EMAIL);
    expect(queriedAccountId).toEqual(insertedAccounts.rows[0].account_id);

    let accounts = await client.query('SELECT * FROM account');
    expect(accounts.rowCount).toBe(1);
    expect(accounts.rows[0]).toEqual(insertedAccounts.rows[0]);
  });
});
