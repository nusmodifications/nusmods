import { Pool } from 'pg';
import { account, session } from './schema';

// Use parameterized query to prevent sql injection
// https://node-postgres.com/features/queries#parameterized-query
// Lock row to obtain account_id without writing twice
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

type DatabaseConfig = Readonly<{
  connectionString: string;
  maxConnections: number | undefined;
}>;

class Database {
  private pool: Pool;

  constructor(config: DatabaseConfig) {
    this.pool = new Pool({
      connectionString: config.connectionString,
      max: config.maxConnections,
    });
  }

  /**
   * Accepts an email and inserts into the database irregardless if it has been created
   * @param { email }
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

  cleanup() {
    return this.pool.end();
  }
}

export default Database;
