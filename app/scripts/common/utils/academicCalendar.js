'use strict';

var acadYearStartDates = {
  '16/17' : new Date('August 1, 2016'),
  '15/16' : new Date('August 3, 2015'),
  '14/15' : new Date('August 4, 2014')
};

// Constants
var ONE_WEEK_TIME = 1000 * 60 * 60 * 24 * 7;
var SEM1 = 'Semester 1';
var SEM2 = 'Semester 2';
var SPECIAL1 = 'Special Term I';
var SPECIAL2 = 'Special Term II';

module.exports = {

  currentAcadYear: function (date) {
    var years = Object.keys(acadYearStartDates);
    years.sort().reverse();

    for (var i = 0; i < years.length; i++) {
      var year = years[i];
      if (date >= acadYearStartDates[year]) {
        return {year: year, startDate: acadYearStartDates[year]};
      }
    }
  },

  currentAcadSem: function (acadWeekNumber) {
    if (acadWeekNumber <= 23) {
      return SEM1;
    } else if (acadWeekNumber <= 40 || acadWeekNumber === 53) {
      return SEM2;
    } else if (acadWeekNumber <= 46) {
      return SPECIAL1;
    } else { 
      // acadWeekNumber <= 52
      return SPECIAL2;
    }
  },

  /**
   * Compute the current academic week and return in json format
   * @param  {Date} date 
   * @return {json} {
                      year: "15/16",
                      sem: 'Semester 1'|'Semester 2'|'Special Sem 1'|'Special Sem 2',
                      type: 'Instructional'|'Reading'|'Examination'|'Recess'|'Vacation'|'Orientation',
                      num: <weekNum>
                    }
   */
  currentAcadWeek: function (date) {
    var currentAcad = this.currentAcadYear(date);
    var acadYear = currentAcad.year;
    var acadYearStartDate = currentAcad.startDate;

    var acadWeekNumber = Math.ceil((date.getTime() - acadYearStartDate.getTime() + 1) / ONE_WEEK_TIME);
    var semester = this.currentAcadSem(acadWeekNumber);

    var weekType;
    var weekNumber = 0;

    switch (semester) {
      case SEM2: // Semester 2 starts 22 weeks after Week 1 of semester 1
        acadWeekNumber -= 22; 
      case SEM1:
        if (acadWeekNumber === 1) {
          weekType = 'Orientation';
          break;
        }
        if (acadWeekNumber > 18) {
          weekType = 'Vacation';
          weekNumber = acadWeekNumber - 18;
          if (weekNumber > 5) { 
            // This means it is the 53th week of the AY, and this week is Vacation.
            // This happens 5 times every 28 years.
            weekNumber = 0;
          }
          break;
        }
        acadWeekNumber -= 1;
        var week = this.acadWeekOfNormalSem(acadWeekNumber);
        weekType = week.weekType;
        weekNumber = week.weekNumber;
        break;
      case SPECIAL2: // Special Term II starts 6 weeks after Special Term I
        acadWeekNumber -= 6;
      case SPECIAL1: // Special Term I starts on week 41 of the AY
        acadWeekNumber -= 40;
        weekType = 'Instructional';
        weekNumber = acadWeekNumber;
        break;
    }

    return {
      year: acadYear,
      sem: semester,
      type: weekType,
      num: weekNumber
    };
  },

  acadWeekOfNormalSem: function (acadWeekNumber) {
    switch (acadWeekNumber) {
      case 7:
        return {weekType: 'Recess', weekNumber: 0};
      case 15:
        return {weekType: 'Reading', weekNumber : 0};
      case 16:
      case 17:
        return {weekType: 'Examination', weekNumber: acadWeekNumber - 15};
      default:
        var weekNumber = acadWeekNumber;
        if (weekNumber >= 8) { // For weeks after recess week
          weekNumber--;
        }
        return {weekType: 'Instructional', weekNumber: weekNumber};
    }
  }
};
