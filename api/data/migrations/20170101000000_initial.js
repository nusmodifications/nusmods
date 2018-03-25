exports.up = (knex, Promise) => {
  const schoolsTable = knex.schema.createTable('schools', (table) => {
    table
      .increments('id')
      .notNullable()
      .primary();
    table
      .string('longName')
      .notNullable()
      .unique();
    table.string('shortName', 32);
  });

  const departmentsTable = knex.schema.createTable('departments', (table) => {
    table
      .increments('id')
      .notNullable()
      .primary();
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
    table
      .increments('id')
      .notNullable()
      .primary();
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

  const modulesTable = knex.schema.createTable('modules', (table) => {
    table
      .increments('id')
      .notNullable()
      .primary();
    table
      .integer('school_id')
      .notNullable()
      .references('id')
      .inTable('schools')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
    table.string('acadYear').notNullable();
    table.integer('semester').notNullable();
    table.string('code').notNullable();
    table.string('title').notNullable();
    table.string('description');
    table.string('credit').notNullable();
    table.integer('workload');
    table.dateTime('examDate');
    table.string('department');
    table.string('lecturePeriods');
    table.string('tutorialPeriods');
    table.string('types');
    table.string('prerequisite');
    table.string('preclusion');
    table.string('corequisite');
    table.unique(['school_id', 'code', 'acadYear', 'semester']);
  });

  const classTable = knex.schema.createTable('classes', (table) => {
    table
      .increments('id')
      .notNullable()
      .primary();
    table
      .integer('module_id')
      .notNullable()
      .references('id')
      .inTable('modules')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
    table
      .integer('venue_id')
      .references('id')
      .inTable('venues')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
    table.string('classNo').notNullable();
    table.string('type').notNullable();
    table.string('weekFrequency').notNullable();
    table.string('day').notNullable();
    table.integer('startTime').notNullable();
    table.integer('endTime').notNullable();
  });

  const corsBiddingStatsTable = knex.schema.createTable('corsBiddingStats', (table) => {
    table
      .increments('id')
      .notNullable()
      .primary();
    table
      .integer('module_id')
      .notNullable()
      .references('id')
      .inTable('modules')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
    table.string('acadYear').notNullable();
    table.integer('semester').notNullable();
    table.string('round').notNullable();
    table.string('group').notNullable();
    table.string('faculty').notNullable();
    table.string('studentAcctType').notNullable();
    table.integer('quota').notNullable();
    table.integer('bidders').notNullable();
    table.integer('lowestBid').notNullable();
    table.integer('lowestSuccessfulBid').notNullable();
    table.integer('highestBid').notNullable();
    table.unique([
      'module_id',
      'acadYear',
      'semester',
      'round',
      'group',
      'faculty',
      'studentAcctType',
    ]);
  });

  return Promise.all([
    schoolsTable,
    departmentsTable,
    venuesTable,
    modulesTable,
    classTable,
    corsBiddingStatsTable,
  ]);
};

exports.down = (knex, Promise) => {
  const tables = ['schools', 'departments', 'venues', 'modules', 'classes', 'corsBiddingStats'];
  return Promise.all(
    tables.map((table) => knex.schema.dropTableIfExists(table).then(() => table)),
  ).then((tbls) => {
    if (process.env.NODE_ENV !== 'test') {
      // eslint-disable-next-line
      console.log(`tables ${tbls.join(', ')} was dropped`);
    }
  });
};
