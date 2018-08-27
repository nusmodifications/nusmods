exports.seed = (knex) =>
  // Deletes ALL existing entries
  knex('schools')
    .truncate()
    .then(() =>
      // Inserts seed entries
      knex('schools').insert([
        { long_name: 'National University of Singapore', short_name: 'NUS' },
        { long_name: 'National Technological University', short_name: 'NTU' },
        { long_name: 'Singapore Management University', short_name: 'SMU' },
      ]),
    );
