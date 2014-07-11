define(['underscore', 'json!config.json'],
  function (_, config) {
    'use strict';

    return _.extend({
      semTimetableFragment: 'timetable/' +
        config.academicYear.replace('/', '-') + '/sem' + config.semester
    }, config);
  });
