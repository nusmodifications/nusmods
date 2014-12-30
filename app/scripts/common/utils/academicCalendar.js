'use strict';

var moment = require('moment');

module.exports = {
  currentAcadYear: function (date) {
    // Return format: 'YY/YY'
    var currYear = moment(date).year();
    var currSem = this.currentAcadSem(date);
    if (currSem === '1'){
      var nextYear = currYear + 1;
      return String(currYear).substr(2, 3) + '/' + String(nextYear).substr(2, 3);
    } else if(currSem === '2'){
      var prevYear = currYear -1;
      return String(prevYear).substr(2, 3) + '/' + String(currYear).substr(2, 3);
    }
  },
  currentAcadSem: function (date) {
    // Return '1' or '2'. We'll ignore special sem for now
    return moment(date).month() < 7 ? '2' : '1';
  },
  currentAcadWeek: function (date) {
    // Possible return values for week:
    // Note: We'll exclude special sem for now
    // - Week 0 (Only Semester 1)
    // - Week [1 .. 6]
    // - Recess Week
    // - Week [7 .. 13]
    // - Reading Week
    // - Examination Week [1 .. 2]
    // - Vacation Week (the rest)
    
    var currentAcadYear = this.currentAcadYear(date);
    var currentSemester = this.currentAcadSem(date);

    var weekOffset = currentSemester === '1' ? 32 : 2;
    // Subtract one day because for NUS, a week starts from a Monday 
    // while in Moment.js, a week starts on a Sunday.
    var currentWeekOfTheSem = parseInt(moment(date).subtract({days: 1, weeks: weekOffset}).format('w'));

    if (currentWeekOfTheSem > 17 || (currentSemester === '2' && currentWeekOfTheSem === 0) || currentWeekOfTheSem < 0 ){
      return 'AY20' + currentAcadYear + ', Vacation Week';
    } else {
      switch (currentWeekOfTheSem) {
        case 7:
          var week = "Recess Week";
          break;
        case 15:
          var week = "Reading Week";
          break;
        case 16:
          var week = "Examination Week 1";
          break;
        case 17:
          var week = "Examination Week 2";
          break;
        default:
          var weekNumber = currentWeekOfTheSem;
          if (weekNumber >= 8) {
            // For weeks after recess week
            weekNumber--;
          }
          var week = "Week " + String(weekNumber);
      }
            
      return ('AY20' + currentAcadYear + ', ' + 
              'Semester ' + currentSemester + ', ' + week);
    }
  }
};
