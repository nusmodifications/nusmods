import { Pool } from 'pg';
import { account } from './schema';

// Use parameterized query to prevent sql injection
// https://node-postgres.com/features/queries#parameterized-query
const INSERT_ACCOUNT = `
INSERT INTO account (email)
VALUES($1)
ON CONFLICT(email) DO NOTHING
RETURNING account_id;
`.trim();

export type UserInput = Readonly<{
  email: string;
}>;

class Database {
  private pool: Pool;

  constructor(connectionString: string) {
    this.pool = new Pool({
      connectionString,
    });
  }

  /**
   * Accepts an email and inserts into the database irregardless if it has been created
   * @param { email }
   */
  async findOrCreateUser({ email }: UserInput): Promise<Pick<account, 'account_id'>> {
    const values = [email];

    const res = await this.pool.query(INSERT_ACCOUNT, values);
    return res.rows[0];
  }

  /**
   * Accepts an email and inserts into the database irregardless if it has been created
   * @param { email }
   */
  async createUser({ email }: UserInput): Promise<Pick<account, 'account_id'>> {
    const values = [email];

    const res = await this.pool.query(INSERT_ACCOUNT, values);
    return res.rows[0];
  }

  cleanup() {
    return this.pool.end();
  }
}

export default Database;
