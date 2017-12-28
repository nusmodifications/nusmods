exports.seed = knex =>
  // Deletes ALL existing entries
  knex('schools').truncate().then(() =>
    // Inserts seed entries
    knex('schools').insert([
      { name: 'National Univerity of Singapore', abbreviation: 'NUS' },
      { name: 'National Technological Univesity', abbreviation: 'NTU' },
      { name: 'Singapore Management University', abbreviation: 'SMU' },
    ]),
  )
;
