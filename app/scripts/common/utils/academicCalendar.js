'use strict';

var moment = require('moment');

module.exports = {
  currentAcadYear: function (date) {
    return '14/15';
  },
  currentAcadSem: function (date) {
    return '2';
  },
  currentAcadWeek: function (date) {
    var currentAcadYear = this.currentAcadYear(date);
    var currentSemester = this.currentAcadSem(date);
    var currentWeek = moment(date).subtract(moment.duration(1, 'd')).format('w');

    return  'AY' + currentAcadYear + ', ' + 
            'Semester ' + currentSemester + ', ' + 
            'Week 1';
  }
};
