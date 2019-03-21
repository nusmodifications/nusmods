import { Client } from 'pg';
import Database from './Database';
import config from './config';
import dbMigration from './__tests__/utils/dbMigration';
import dateUtils from './__tests__/utils/date';

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

  const SELECT_ALL_FROM_ACCOUNT = 'SELECT * FROM account';
  const INSERT_ACCOUNT_RETURNING_ALL = 'INSERT INTO account (email) VALUES($1) RETURNING *';
  const SELECT_ALL_FROM_SESSION = 'SELECT * FROM session';

  describe('account', () => {
    it('should create user if it does not exist', async () => {
      expect.assertions(4);

      const accountId = await database.findOrCreateUser(TEST_EMAIL);
      expect(typeof accountId).toBe('string');

      const accounts = await client.query(SELECT_ALL_FROM_ACCOUNT);
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

      const insertedAccount = await client.query(INSERT_ACCOUNT_RETURNING_ALL, [TEST_EMAIL]);

      const queriedAccountId = await database.findOrCreateUser(TEST_EMAIL);
      expect(queriedAccountId).toEqual(insertedAccount.rows[0].account_id);

      let accounts = await client.query(SELECT_ALL_FROM_ACCOUNT);
      expect(accounts.rowCount).toBe(1);
      expect(accounts.rows[0]).toEqual(insertedAccount.rows[0]);
    });
  });

  describe('session', () => {
    const expiresAt = new Date(Date.now() + 99999);
    const userAgent = 'test user agent';
    let accountId: string;

    beforeEach(async () => {
      accountId = await database.findOrCreateUser(TEST_EMAIL);
    });

    it('should create session', async () => {
      expect.assertions(5);

      const sessionId = await database.createSession(accountId, expiresAt, userAgent);
      expect(typeof sessionId).toBe('string');

      const sessions = await client.query(SELECT_ALL_FROM_SESSION);
      expect(sessions.rowCount).toBe(1);

      const session = sessions.rows[0];
      expect(session).toMatchObject({
        session_id: sessionId,
        account_id: accountId,
        user_agent: userAgent,
      });

      expect(session.expires_at).toEqual(expiresAt);
      expect(dateUtils.toEpoch(session.last_accessed_at)).toBeLessThanOrEqual(Date.now());
    });

    it('should allow multiple sessions', async () => {
      expect.assertions(1);

      await database.createSession(accountId, expiresAt, userAgent);
      await database.createSession(accountId, expiresAt, userAgent);

      const sessions = await client.query(SELECT_ALL_FROM_SESSION);
      expect(sessions.rowCount).toBe(2);
    });

    it('should not allow creation of expired session', () => {
      expect(
        database.createSession(accountId, new Date(Date.now() - 99999), userAgent),
      ).rejects.toThrowError();
    });
  });
});
