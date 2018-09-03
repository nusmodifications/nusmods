const { TABLES, COLUMNS } = require('../src/db/constants');

exports.seed = async (knex) => {
  // Deletes ALL existing entries
  await knex(TABLES.schools).truncate();
  // Inserts seed entries
  await knex(TABLES.schools).insert([
    { [COLUMNS.longName]: 'National University of Singapore', [COLUMNS.shortName]: 'NUS' },
    { [COLUMNS.longName]: 'National Technological University', [COLUMNS.shortName]: 'NTU' },
    { [COLUMNS.longName]: 'Singapore Management University', [COLUMNS.shortName]: 'SMU' },
  ]);
  await knex(TABLES.terms).truncate();
  await knex(TABLES.terms).insert([
    {
      [COLUMNS.schoolId]: 1,
      [COLUMNS.name]: 'AY2017Sem1',
      [COLUMNS.startsAt]: '2018-08-01T13:00:00.000Z',
      [COLUMNS.endsAt]: '2018-12-01T13:00:00.000Z',
    },
    {
      [COLUMNS.schoolId]: 2,
      [COLUMNS.name]: 'AY2017Sem2',
      [COLUMNS.startsAt]: '2019-01-01T13:00:00.000Z',
      [COLUMNS.endsAt]: '2019-05-01T13:00:00.000Z',
    },
  ]);
  await knex(TABLES.courses).truncate();
  await knex(TABLES.courses).insert([
    {
      [COLUMNS.termId]: 1,
      [COLUMNS.code]: 'CS1101S',
      [COLUMNS.title]: 'Intro to Computer Science',
      [COLUMNS.value]: 4.0,
    },
    {
      [COLUMNS.termId]: 1,
      [COLUMNS.code]: 'CS2100',
      [COLUMNS.title]: 'Intro to Computer Science',
      [COLUMNS.value]: 4.0,
    },
  ]);
};
