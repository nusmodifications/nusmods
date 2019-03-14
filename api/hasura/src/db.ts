import { Pool } from 'pg';
import config from './config';
import { account } from './schema';

// Use parameterized query to prevent sql injection
// https://node-postgres.com/features/queries#parameterized-query
const INSERT_ACCOUNT = `
INSERT INTO account (email)
VALUES($1)
ON CONFLICT(email) DO NOTHING
RETURNING account_id;
`.trim();

const pool = new Pool({
  connectionString: config.databaseUrl,
});

export type UserInput = Readonly<{
  email: string;
}>;

/**
 * Accepts an email and inserts into the database irregardless if it has been created
 * @param { email }
 */
export async function findOrCreateUser({ email }: UserInput): Promise<Pick<account, 'account_id'>> {
  const values = [email];

  const res = await pool.query(INSERT_ACCOUNT, values);
  return res.rows[0];
}

/**
 * Accepts an email and inserts into the database irregardless if it has been created
 * @param { email }
 */
export async function createUser({ email }: UserInput): Promise<Pick<account, 'account_id'>> {
  const values = [email];

  const res = await pool.query(INSERT_ACCOUNT, values);
  return res.rows[0];
}
