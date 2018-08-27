const TABLE_NAMES = {
  schools: 'schools',
  terms: 'terms',
  departments: 'departments',
  venues: 'venues',
  courses: 'courses',
  lessons: 'lessons',
};
const ID_NAMES = {
  schools: 'school_id',
  terms: 'term_id',
  departments: 'department_id',
  venues: 'venue_id',
  courses: 'course_id',
  lessons: 'lesson_id',
};
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

exports.up = (knex, Promise) => {
  function idPrimaryKey(table) {
    table
      .increments('id')
      .notNullable()
      .primary();
  }

  function idForeignKey(table, foreignTableName, notNullable) {
    const tableIdName = ID_NAMES[foreignTableName];
    if (notNullable) {
      table
        .integer(tableIdName)
        .notNullable()
        .references('id')
        .inTable(foreignTableName)
        .onDelete('CASCADE')
        .onUpdate('CASCADE');
    } else {
      table
        .integer(tableIdName)
        .references('id')
        .inTable(foreignTableName)
        .onDelete('RESTRICT')
        .onUpdate('CASCADE');
    }
  }

  const schoolsTable = knex.schema.createTable(TABLE_NAMES.schools, (table) => {
    idPrimaryKey(table);
    table.timestamps();
    table
      .string('long_name')
      .notNullable()
      .unique();
    table.string('short_name', 32);
  });

  const termsTable = knex.schema.createTable(TABLE_NAMES.terms, (table) => {
    idPrimaryKey(table);
    idForeignKey(table, TABLE_NAMES.schools, true);
    table.timestamps();
    table.dateTime('starts_at').notNullable();
    table.dateTime('ends_at').notNullable();
    table.string('name', 32).notNullable();
    table.unique([ID_NAMES.schools, 'name']);
  });

  const departmentsTable = knex.schema.createTable(TABLE_NAMES.departments, (table) => {
    idPrimaryKey(table);
    idForeignKey(table, TABLE_NAMES.terms, true);
    table.timestamps();
    table.string('name').notNullable();
    table.unique([ID_NAMES.terms, 'name']);
  });

  const venuesTable = knex.schema.createTable(TABLE_NAMES.venues, (table) => {
    idPrimaryKey(table);
    idForeignKey(table, TABLE_NAMES.terms, true);
    idForeignKey(table, TABLE_NAMES.departments, false);
    table.timestamps();
    table.string('code').notNullable();
    table.string('name').notNullable();
    table.string('floor');
    table.decimal('lat', 10, 7);
    table.decimal('lng', 10, 7);
    table.integer('altitude');
    table.unique([ID_NAMES.terms, 'code']);
  });

  const coursesTable = knex.schema.createTable(TABLE_NAMES.courses, (table) => {
    idPrimaryKey(table);
    idForeignKey(table, TABLE_NAMES.terms, true);
    idForeignKey(table, TABLE_NAMES.departments, false);
    table.timestamps();
    table.string('code').notNullable();
    table.string('title').notNullable();
    table
      .text('description')
      .notNullable()
      .defaultTo('');
    table.float('value');
    table.text('workload');
    table.text('prerequisite');
    table.text('preclusion');
    table.text('corequisite');
    table.unique([ID_NAMES.terms, 'code']);
  });

  const lessonsTable = knex.schema.createTable(TABLE_NAMES.lessons, (table) => {
    idPrimaryKey(table);
    idForeignKey(table, TABLE_NAMES.courses, true);
    // Allow multiple locations, also disallow deletion of location if lesson exists
    idForeignKey(table, TABLE_NAMES.venues, false);
    table.timestamps();
    table.enu('day', DAYS, { useNative: true, enumName: 'days_enum' }).notNullable();
    table.string('week').notNullable();
    table.string('code').notNullable();
    table.dateTime('starts_at').notNullable();
    table.dateTime('ends_at').notNullable();
    table.string('type').notNullable();
    table.unique([ID_NAMES.courses, 'code']);
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
  const tables = Object.values(TABLE_NAMES);
  return Promise.all(
    tables.map((table) => knex.schema.dropTableIfExists(table).then(() => table)),
  ).then((tbls) => {
    if (process.env.NODE_ENV !== 'test') {
      // eslint-disable-next-line
      console.log(`tables ${tbls.join(', ')} was dropped`);
    }
  });
};
