exports.up = (knex, Promise) => {
  const schoolsTable = knex.schema.createTable('schools', (table) => {
    table.increments('id').notNullable().primary();
    table.string('name').notNullable().unique();
    table.string('abbreviation', 32);
  });

  const departmentsTable = knex.schema.createTable('departments', (table) => {
    table.increments('id').notNullable().primary();
    table
      .integer('school_id')
      .notNullable()
      .references('id')
      .inTable('schools')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
    table.string('name').notNullable();
    table.unique(['school_id', 'name']);
  });

  const venuesTable = knex.schema.createTable('venues', (table) => {
    table.increments('id').notNullable().primary();
    table
      .integer('school_id')
      .notNullable()
      .references('id')
      .inTable('schools')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
    table.string('name').notNullable();
    table.string('type');
    table.string('owned_by');
    table.unique(['school_id', 'name']);
  });

  return Promise.all([schoolsTable, departmentsTable, venuesTable]);
};

exports.down = (knex, Promise) => {
  const tables = ['schools', 'departments', 'venues'];
  return Promise.all(
    tables.map(table =>
      knex.schema.dropTableIfExists(table).then(() => table),
    ),
  ).then((tbls) => {
    if (process.env.NODE_ENV !== 'test') {
      console.log(`tables ${tbls.join(', ')} was dropped`);
    }
  });
};
