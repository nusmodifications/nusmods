'use strict';

exports.__esModule = true;
exports.getAcadYear = getAcadYear;
exports.getAcadSem = getAcadSem;
exports.getAcadWeekName = getAcadWeekName;
exports.getAcadWeekInfo = getAcadWeekInfo;
/* eslint-disable no-fallthrough, no-console */
var acadYearStartDates = exports.acadYearStartDates = {
  '19/20': new Date('August 5, 2019'),
  '18/19': new Date('August 6, 2018'),
  '17/18': new Date('August 7, 2017'),
  '16/17': new Date('August 1, 2016'),
  '15/16': new Date('August 3, 2015'),
  '14/15': new Date('August 4, 2014')
};

// Constant variables.
var oneWeekDuration = 1000 * 60 * 60 * 24 * 7;
var sem1 = 'Semester 1';
var sem2 = 'Semester 2';
var special1 = 'Special Term I';
var special2 = 'Special Term II';

/**
  * Computes the current acad year and return an object of acad year and start date for that year.
  * If the date is too far into the future (not within supported range),
  * the last-supported academic year is returned.
  * If the date is too early (not within supported range), null is returned.
  * @param  {Date} date
  * @return {Object} acadYearObject - { year: "15/16", startDate: Date }
  */
function getAcadYear(date) {
  var years = Object.keys(acadYearStartDates);
  years.sort().reverse();

  for (var i = 0; i < years.length; i += 1) {
    var year = years[i];
    if (date >= acadYearStartDates[year]) {
      return {
        year: year,
        startDate: acadYearStartDates[year]
      };
    }
  }
  return null;
}

/**
  * Computes the current academic semester.
  * Expects a week number of a year.
  * @param  {Number} acadWeekNumber - 3
  * @return {String} semester - "Semester 1"
  */
function getAcadSem(acadWeekNumber) {
  var earliestSupportedWeek = 1;
  var lastWeekofSem1 = 23;
  var lastWeekofSem2 = 40;
  var lastWeekofSpecialSem1 = 46;
  var lastWeekofSpecialSem2 = 52;

  if (acadWeekNumber >= earliestSupportedWeek && acadWeekNumber <= lastWeekofSem1) {
    return sem1;
  } else if (acadWeekNumber > lastWeekofSem1 && acadWeekNumber <= lastWeekofSem2) {
    return sem2;
  } else if (acadWeekNumber > lastWeekofSem2 && acadWeekNumber <= lastWeekofSpecialSem1) {
    return special1;
  } else if (acadWeekNumber > lastWeekofSpecialSem1 && acadWeekNumber <= lastWeekofSpecialSem2) {
    return special2;
  }

  console.warn('[nusmoderator] Unsupported acadWeekNumber as parameter: ' + acadWeekNumber);
  return null;
}

/**
  * Computes the current academic week of the semester
  * Expects a week number of a semester.
  * @param  {Number} acadWeekNumber - 3
  * @return {String} semester - "Recess" | "Reading" | "Examination"
  */
function getAcadWeekName(acadWeekNumber) {
  switch (acadWeekNumber) {
    case 7:
      return {
        weekType: 'Recess',
        weekNumber: null
      };
    case 15:
      return {
        weekType: 'Reading',
        weekNumber: null
      };
    case 16:
    case 17:
      return {
        weekType: 'Examination',
        weekNumber: acadWeekNumber - 15
      };
    default:
      {
        var weekNumber = acadWeekNumber;
        if (weekNumber >= 8) {
          // For weeks after recess week
          weekNumber -= 1;
        }

        if (acadWeekNumber < 1 || acadWeekNumber > 17) {
          console.warn('[nusmoderator] Unsupported acadWeekNumber as parameter: ' + acadWeekNumber);
          return null;
        }

        return {
          weekType: 'Instructional',
          weekNumber: weekNumber
        };
      }
  }
}

/**
  * Computes the current academic week and return in an object of acad date components
  * @param  {Date} date
  * @return {Object} {
                    year: "15/16",
                    sem: 'Semester 1'|'Semester 2'|'Special Sem 1'|'Special Sem 2',
                    type: 'Instructional'|'Reading'|'Examination'|'Recess'|'Vacation'|'Orientation',
                    num: <weekNum>
                  }
  */
function getAcadWeekInfo(date) {
  var currentAcad = getAcadYear(date);
  var acadYear = currentAcad.year;
  var acadYearStartDate = currentAcad.startDate;

  var acadWeekNumber = Math.ceil((date.getTime() - acadYearStartDate.getTime() + 1) / oneWeekDuration);
  var semester = getAcadSem(acadWeekNumber);

  var weekType = null;
  var weekNumber = null;
  switch (semester) {
    case sem2:
      // Semester 2 starts 22 weeks after Week 1 of semester 1
      acadWeekNumber -= 22;
    case sem1:
      if (acadWeekNumber === 1) {
        weekType = 'Orientation';
        break;
      }
      if (acadWeekNumber > 18) {
        weekType = 'Vacation';
        weekNumber = acadWeekNumber - 18;
        break;
      }
      acadWeekNumber -= 1;
      {
        var week = getAcadWeekName(acadWeekNumber);
        weekType = week.weekType;
        weekNumber = week.weekNumber;
      }
      break;
    case special2:
      // Special Term II starts 6 weeks after Special Term I
      acadWeekNumber -= 6;
    case special1:
      // Special Term I starts on week 41 of the AY
      acadWeekNumber -= 40;
      weekType = 'Instructional';
      weekNumber = acadWeekNumber;
      break;
    default:
      if (acadWeekNumber === 53) {
        // This means it is the 53th week of the AY, and this week is Vacation.
        // This happens 5 times every 28 years.
        weekType = 'Vacation';
        weekNumber = null;
      }
      break;
  }

  return {
    year: acadYear,
    sem: semester,
    type: weekType,
    num: weekNumber
  };
}

exports.default = {
  acadYearStartDates: acadYearStartDates,
  getAcadYear: getAcadYear,
  getAcadSem: getAcadSem,
  getAcadWeekName: getAcadWeekName,
  getAcadWeekInfo: getAcadWeekInfo
};