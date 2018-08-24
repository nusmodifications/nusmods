exports.seed = (knex) =>
  // Deletes ALL existing entries
  knex('schools')
    .truncate()
    .then(() =>
      // Inserts seed entries
      knex('schools').insert([
        { longName: 'National University of Singapore', shortName: 'NUS' },
        { longName: 'National Technological University', shortName: 'NTU' },
        { longName: 'Singapore Management University', shortName: 'SMU' },
      ]),
    );
