exports.seed = async (knex) => {
  // Deletes ALL existing entries
  await knex('schools').truncate();
  // Inserts seed entries
  await knex('schools').insert([
    { long_name: 'National University of Singapore', short_name: 'NUS' },
    { long_name: 'National Technological University', short_name: 'NTU' },
    { long_name: 'Singapore Management University', short_name: 'SMU' },
  ]);
  await knex('terms').truncate();
  await knex('terms').insert([
    {
      school_id: 1,
      name: 'AY2017Sem1',
      starts_at: '2018-08-01T13:00:00.000Z',
      ends_at: '2018-12-01T13:00:00.000Z',
    },
    {
      school_id: 2,
      name: 'AY2017Sem2',
      starts_at: '2019-01-01T13:00:00.000Z',
      ends_at: '2019-05-01T13:00:00.000Z',
    },
  ]);
  await knex('courses').truncate();
  await knex('courses').insert([
    {
      term_id: 1,
      code: 'CS1101S',
      title: 'Intro to Computer Science',
      value: 4.0,
    },
    {
      term_id: 2,
      code: 'CS1101S',
      title: 'Intro to Computer Science',
      value: 4.0,
    },
  ]);
};
