import { Pool } from 'pg';
import { account, session } from './schema';

// IMPORTANT: Use parameterized query to prevent sql injection
// https://node-postgres.com/features/queries#parameterized-query

// Lock row to obtain account_id without writing to db twice
// https://stackoverflow.com/a/40325406
const UPSERT_ACCOUNT = `
WITH ins AS (
  INSERT INTO account (email)
  VALUES      ($1)
  ON CONFLICT (email) DO UPDATE
  SET         email = NULL
  WHERE FALSE -- never executed, but locks the row
  RETURNING   account_id
)
SELECT account_id FROM ins
UNION  ALL
SELECT account_id FROM account
WHERE  email = $1
LIMIT  1;
`.trim();

const INSERT_SESSION = `
INSERT INTO session (account_id, expires_at, user_agent)
VALUES      ($1, $2, $3)
RETURNING   session_id
`.trim();

const FIND_SESSION = `
SELECT (account_id, expires_at)
FROM   session
WHERE  session_id = $1
LIMIT  1
`;

const DELETE_SESSION_BY_SESSION_ID = `
DELETE FROM session
WHERE       session_id = $1;
`.trim();

const DELETE_SESSIONS_BY_ACCOUNT_ID = `
DELETE FROM session
WHERE       account_id = $1;
`.trim();

const DELETE_SESSIONS_BY_EXPIRES_AT = `
DELETE FROM session
WHERE       expires_at <= $1;
`.trim();

type DatabaseConfig = Readonly<{
  connectionString: string;
  maxConnections: number | undefined;
}>;

/**
 * Connects to the postgresql database and executes operations for the
 * account and session tables.
 */
class Database {
  private pool: Pool;

  constructor(config: DatabaseConfig) {
    this.pool = new Pool({
      connectionString: config.connectionString,
      max: config.maxConnections,
    });
  }

  /**
   * Accepts an email and either create a new account, or find the existing account
   *
   * @param email email of the account
   */
  async findOrCreateUser(email: string): Promise<account['account_id']> {
    const values = [email];

    const res = await this.pool.query({
      text: UPSERT_ACCOUNT,
      values,
    });
    const firstRow = res.rows[0];
    return firstRow.account_id;
  }

  /**
   * Creates a session for the account
   *
   * @param accountId accountId session belongs to
   * @param expiresAt future date when the session will be invalid
   * @param userAgent user agent of the session
   */
  async createSession(
    accountId: string,
    expiresAt: Date,
    userAgent: string,
  ): Promise<session['session_id']> {
    const values = [accountId, expiresAt, userAgent];

    const res = await this.pool.query(INSERT_SESSION, values);
    const firstRow = res.rows[0];
    return firstRow.session_id;
  }

  /**
   * Finds a session, irregardless if it has expired or not
   *
   * @param sessionId sessionId to match session with
   */
  async findSession(
    sessionId: string,
  ): Promise<{
    accountId: session['account_id'];
    expiresAt: session['expires_at'];
  }> {
    const values = [sessionId];

    const res = await this.pool.query(FIND_SESSION, values);
    const firstRow = res.rows[0];
    return {
      accountId: firstRow.account_id,
      expiresAt: firstRow.expires_at,
    };
  }

  /**
   * Deletes the session which match the session id
   *
   * @param sessionId session that matches this sessionId will be deleted
   */
  async deleteSessionBySessionId(sessionId: string) {
    const values = [sessionId];

    await this.pool.query(DELETE_SESSION_BY_SESSION_ID, values);
  }

  /**
   * Deletes sessions which match the account id
   *
   * @param accountId sessions matching this accountId will be deleted
   */
  async deleteSessionsByAccountId(accountId: string) {
    const values = [accountId];

    await this.pool.query(DELETE_SESSIONS_BY_ACCOUNT_ID, values);
  }

  /**
   * Deletes sessions older than the date provided
   *
   * @param dateCutOff sessions older than this date will be deleted
   */
  async deleteSessionsByExpiresAt(dateCutOff: Date) {
    const values = [dateCutOff];

    await this.pool.query(DELETE_SESSIONS_BY_EXPIRES_AT, values);
  }

  cleanup() {
    return this.pool.end();
  }
}

export default Database;
