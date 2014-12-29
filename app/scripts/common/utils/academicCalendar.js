'use strict';

var moment = require('moment');

module.exports = {
  currentAcadYear: function (date) {
    return '14/15';
  },
  currentAcadSem: function (date) {
    // Return '1' or '2'. We'll ignore special sem for now
    return moment(date).month() < 7 ? '2' : '1';
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
