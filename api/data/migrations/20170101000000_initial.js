const { TABLES, COLUMNS, ENUMS, TABLE_TO_FOREIGN_KEYS, DAYS } = require('../src/db/constants');

exports.up = (knex, Promise) => {
  function createIdPrimaryKey(table) {
    table
      .increments(COLUMNS.id)
      .notNullable()
      .primary();
  }

  function createIdForeignKey(table, foreignTableName, { notNullable }) {
    const tableIdName = TABLE_TO_FOREIGN_KEYS[foreignTableName];
    if (notNullable) {
      table
        .integer(tableIdName)
        .notNullable()
        .references(COLUMNS.id)
        .inTable(foreignTableName)
        .onDelete('CASCADE')
        .onUpdate('CASCADE');
    } else {
      table
        .integer(tableIdName)
        .references(COLUMNS.id)
        .inTable(foreignTableName)
        .onDelete('RESTRICT')
        .onUpdate('CASCADE');
    }
  }

  function createTimestamps(table) {
    table
      .timestamp(COLUMNS.createdAt)
      .notNullable()
      .defaultTo(knex.fn.now());
    table
      .timestamp(COLUMNS.updatedAt)
      .notNullable()
      .defaultTo(knex.fn.now());
  }

  const schoolsTable = knex.schema.createTable(TABLES.schools, (table) => {
    createIdPrimaryKey(table);
    createTimestamps(table);
    table
      .string(COLUMNS.longName)
      .notNullable()
      .unique();
    table.string(COLUMNS.shortName, 32);
  });

  const termsTable = knex.schema.createTable(TABLES.terms, (table) => {
    createIdPrimaryKey(table);
    createIdForeignKey(table, TABLES.schools, true);
    createTimestamps(table);
    table.dateTime(COLUMNS.startsAt).notNullable();
    table.dateTime(COLUMNS.endsAt).notNullable();
    table.string(COLUMNS.name, 32).notNullable();
    table.unique([COLUMNS.schoolId, COLUMNS.name]);
  });

  const departmentsTable = knex.schema.createTable(TABLES.departments, (table) => {
    createIdPrimaryKey(table);
    createIdForeignKey(table, TABLES.terms, true);
    createTimestamps(table);
    table.string(COLUMNS.name).notNullable();
    table.unique([COLUMNS.termId, COLUMNS.name]);
  });

  const venuesTable = knex.schema.createTable(TABLES.venues, (table) => {
    createIdPrimaryKey(table);
    createIdForeignKey(table, TABLES.terms, true);
    createIdForeignKey(table, TABLES.departments, false);
    createTimestamps(table);
    table.string(COLUMNS.code).notNullable();
    table.string(COLUMNS.name).notNullable();
    table.string(COLUMNS.floor);
    table.decimal(COLUMNS.lat, 10, 7);
    table.decimal(COLUMNS.lng, 10, 7);
    table.integer(COLUMNS.altitude);
    table.unique([COLUMNS.termId, COLUMNS.code]);
  });

  const coursesTable = knex.schema.createTable(TABLES.courses, (table) => {
    createIdPrimaryKey(table);
    createIdForeignKey(table, TABLES.terms, true);
    createIdForeignKey(table, TABLES.departments, false);
    createTimestamps(table);
    table.string(COLUMNS.code).notNullable();
    table.string(COLUMNS.title).notNullable();
    table
      .text(COLUMNS.description)
      .notNullable()
      .defaultTo('');
    table.float(COLUMNS.value);
    table.text(COLUMNS.workload);
    table.text(COLUMNS.prerequisite);
    table.text(COLUMNS.preclusion);
    table.text(COLUMNS.corequisite);
    table.unique([COLUMNS.termId, COLUMNS.code]);
  });

  const lessonsTable = knex.schema.createTable(TABLES.lessons, (table) => {
    createIdPrimaryKey(table);
    createIdForeignKey(table, TABLES.courses, true);
    // Allow multiple locations, also disallow deletion of location if lesson exists
    createIdForeignKey(table, TABLES.venues, false);
    createTimestamps(table);
    table.enu(COLUMNS.day, DAYS, { useNative: true, enumName: ENUMS.day }).notNullable();
    table.string(COLUMNS.week).notNullable();
    table.string(COLUMNS.code).notNullable();
    table.dateTime(COLUMNS.startsAt).notNullable();
    table.dateTime(COLUMNS.endsAt).notNullable();
    table.string(COLUMNS.type).notNullable();
    table.unique([COLUMNS.courseId, COLUMNS.code]);
  });

  return Promise.all([
    schoolsTable,
    termsTable,
    departmentsTable,
    venuesTable,
    coursesTable,
    lessonsTable,
  ]);
};

exports.down = (knex, Promise) => {
  const tables = Object.values(TABLES);
  return Promise.all(tables.map((table) => knex.schema.dropTableIfExists(table))).then(() => {
    if (process.env.NODE_ENV !== 'test') {
      // eslint-disable-next-line
      console.log(`tables ${tables.join(', ')} were dropped`);
    }
  });
};
