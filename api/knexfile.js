require('dotenv').config();

const DEBUG_FLAG = JSON.parse(process.env.DB_DEBUG || false);

module.exports = {

  development: {
    client: 'sqlite3',
    useNullAsDefault: true,
    connection: {
      filename: './dev.sqlite3',
    },
    debug: DEBUG_FLAG,
  },

  test: {
    client: 'sqlite3',
    useNullAsDefault: true,
    connection: {
      filename: ':memory:',
    },
    debug: DEBUG_FLAG,
  },

  staging: {
    client: 'sqlite3',
    useNullAsDefault: true,
    connection: {
      filename: './stage.sqlite3',
    },
    migrations: {
      tableName: 'knex_migrations',
    },
  },

  production: {
    client: 'sqlite3',
    useNullAsDefault: true,
    connection: {
      filename: './prod.sqlite3',
    },
    migrations: {
      tableName: 'knex_migrations',
    },
  },

};
