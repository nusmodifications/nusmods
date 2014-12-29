'use strict';

var moment = require('moment');

module.exports = {
  currentAcadYear: function (date) {
    // Return format: 'YY/YY'
    var currYear = moment(date).year();
    var currSem = this.currentAcadSem(date);
    if (currSem === '1'){
      nextYear = currYear + 1;
      return String(currYear).substr(2, 3) + '/' + String(nextYear).substr(2, 3);
    } else if(currSem === '2'){
      prevYear = currYear -1;
      return String(prevYear).substr(2, 3) + '/' + String(currYear).substr(2, 3);
    }
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
