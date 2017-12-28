// @flow
import 'dotenv/config';
import Knex from 'knex';

import knexConfig from '../knexfile';

// Create an appropriate knex instance
const knex = Knex(knexConfig[process.env.NODE_ENV]);

export default knex;
