'use strict';

var _ = require('underscore');
var config = require('../config.json');

module.exports = _.extend({
  semTimetableFragment: 'timetable/' +
    config.academicYear.replace('/', '-') + '/sem' + config.semester
}, config);
