'use strict';

var _ = require('underscore');
var config = require('../config.json');

module.exports = _.extend({
  semTimetableFragment: function (semester) {
    return 'timetable/' + config.academicYear.replace('/', '-') +
      '/sem' + (semester || config.semester);
  }
}, config);
