'use strict';

var acadYearStartDates = {
  '16/17' : new Date('August 1, 2016'),
  '15/16' : new Date('August 3, 2015'),
  '14/15' : new Date('August 4, 2014')
};

var oneWeekTime = 1000 * 60 * 60 * 24 * 7;

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
      return 'Semester 1';
    } else if (acadWeekNumber <= 40 || acadWeekNumber === 53) {
      return 'Semester 2';
    } else if (acadWeekNumber <= 46) {
      return 'Special Term I';
    } else { 
      // acadWeekNumber <= 52
      return 'Special Term II';
    }
  },

  /**
   * Compute the current academic week and return in json format
   * @param  {Date} date 
   * @return {json} {
                      'year': "15/16",
                      'sem': 'Semester 1'|'Semester 2'|'Special Sem 1'|'Special Sem 2',
                      'type': 'Instructional'|'Reading'|'Examination'|'Recess'|'Vacation'|'Orientation',
                      'num': <weekNum>
                    }
   */
  currentAcadWeek: function (date) {
    var currentAcad = this.currentAcadYear(date);
    var acadYear = currentAcad.year;
    var acadYearStartDate = currentAcad.startDate;

    var acadWeekNumber = Math.ceil((date.getTime() - acadYearStartDate.getTime() + 1) / oneWeekTime);
    var semester = this.currentAcadSem(acadWeekNumber);

    var weekType;
    var weekNumber = 0;

    switch (semester) {
      case 'Semester 2':
        acadWeekNumber -= 22;
      case 'Semester 1':
        if (acadWeekNumber === 1) {
          weekType = 'Orientation';
          break;
        }
        if (acadWeekNumber > 18) {
          weekType = 'Vacation';
          weekNumber = acadWeekNumber - 18;
          if (weekNumber > 5) {
            weekNumber = 0;
          }
          break;
        }
        acadWeekNumber -= 1;
        var week = this.acadWeekOfNormalSem(acadWeekNumber);
        weekType = week.weekType;
        weekNumber = week.weekNumber;
        break;
      case 'Special Term I':
        acadWeekNumber -= 6;
      case 'Special Term II':
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
