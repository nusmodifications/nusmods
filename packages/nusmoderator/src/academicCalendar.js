const addDays = require('date-fns/addDays');
const startOfWeek = require('date-fns/startOfWeek');
const isBefore = require('date-fns/isBefore');
const getYear = require('date-fns/getYear');

/* eslint-disable no-fallthrough, no-console */

/**
 * Returns a Date object of the first weekday of Week 0 of that academic year.
 * Assumes Week 0 begins on the first Monday of August.
 * @param acadYear the academic year. E.g. "18/19"
 * @return {Date} Start date of the academic year
 */
export function getAcadYearStartDate(acadYear) {
  const DAY_MONDAY = 1;
  const MONTH_AUGUST = '7';
  const lastTwoDigits = acadYear.split('/')[0];
  const targetYear = 2000 + parseInt(lastTwoDigits, 10);
  const firstDateOfMonth = new Date(targetYear, MONTH_AUGUST, 1, 0, 0, 0);
  const nearestMonday = startOfWeek(firstDateOfMonth, { weekStartsOn: DAY_MONDAY });
  if (isBefore(nearestMonday, firstDateOfMonth)) {
    const firstMonday = addDays(nearestMonday, 7);
    return firstMonday;
  }
  // 1st Aug is already a Monday
  return nearestMonday;
}

// Constant variables.
const oneWeekDuration = 1000 * 60 * 60 * 24 * 7;
const sem1 = 'Semester 1';
const sem2 = 'Semester 2';
const special1 = 'Special Term I';
const special2 = 'Special Term II';

/**
 * Takes in a Date and returns an object of acad year and start date for that year.
 * @param  {Date} date
 * @return {Object} acadYearObject - { year: "15/16", startDate: Date }
 */
export function getAcadYear(date) {
  const dateYear = getYear(date);
  const firstTwoDigits = dateYear % 100;
  const potentialAcadYear = `${firstTwoDigits}/${firstTwoDigits + 1}`;
  const potentialStartDate = getAcadYearStartDate(potentialAcadYear);

  let year;
  // check if date is before the start of that year's AY start date
  // Small HACK to workaround isBefore() because it returns true for same day
  if (isBefore(date, potentialStartDate)) {
    // Before
    year = `${firstTwoDigits - 1}/${firstTwoDigits}`;
  } else {
    // After
    year = potentialAcadYear;
  }

  return {
    year,
    startDate: getAcadYearStartDate(year),
  };
}

/**
 * Computes the current academic semester.
 * Expects a week number of a year.
 * @param  {number} acadWeekNumber
 * @return {string} semester - "Semester 1"
 * @example acadWeekNumber(3)
 */
export function getAcadSem(acadWeekNumber) {
  const earliestSupportedWeek = 1;
  const lastWeekofSem1 = 23;
  const lastWeekofSem2 = 40;
  const lastWeekofSpecialSem1 = 46;
  const lastWeekofSpecialSem2 = 52;

  if (acadWeekNumber >= earliestSupportedWeek && acadWeekNumber <= lastWeekofSem1) {
    return sem1;
  }
  if (acadWeekNumber > lastWeekofSem1 && acadWeekNumber <= lastWeekofSem2) {
    return sem2;
  }
  if (acadWeekNumber > lastWeekofSem2 && acadWeekNumber <= lastWeekofSpecialSem1) {
    return special1;
  }
  if (acadWeekNumber > lastWeekofSpecialSem1 && acadWeekNumber <= lastWeekofSpecialSem2) {
    return special2;
  }

  console.warn(`[nusmoderator] Unsupported acadWeekNumber as parameter: ${acadWeekNumber}`);
  return null;
}

/**
 * Computes the current academic week of the semester
 * Expects a week number of a semester.
 * @param  {number} acadWeekNumber
 * @return {string} semester - "Recess" | "Reading" | "Examination"
 * @example acadWeekNumber(3)
 */
export function getAcadWeekName(acadWeekNumber) {
  switch (acadWeekNumber) {
    case 7:
      return {
        weekType: 'Recess',
        weekNumber: null,
      };
    case 15:
      return {
        weekType: 'Reading',
        weekNumber: null,
      };
    case 16:
    case 17:
      return {
        weekType: 'Examination',
        weekNumber: acadWeekNumber - 15,
      };
    default: {
      let weekNumber = acadWeekNumber;
      if (weekNumber >= 8) {
        // For weeks after recess week
        weekNumber -= 1;
      }

      if (acadWeekNumber < 1 || acadWeekNumber > 17) {
        console.warn(`[nusmoderator] Unsupported acadWeekNumber as parameter: ${acadWeekNumber}`);
        return null;
      }

      return {
        weekType: 'Instructional',
        weekNumber,
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
export function getAcadWeekInfo(date) {
  const currentAcad = getAcadYear(date);
  const acadYear = currentAcad.year;
  const acadYearStartDate = getAcadYearStartDate(acadYear);

  let acadWeekNumber = Math.ceil(
    (date.getTime() - acadYearStartDate.getTime() + 1) / oneWeekDuration,
  );
  const semester = getAcadSem(acadWeekNumber);

  let weekType = null;
  let weekNumber = null;
  switch (semester) {
    case sem2: // Semester 2 starts 22 weeks after Week 1 of semester 1
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
      ({ weekType, weekNumber } = getAcadWeekName(acadWeekNumber));
      break;
    case special2: // Special Term II starts 6 weeks after Special Term I
      acadWeekNumber -= 6;
    case special1: // Special Term I starts on week 41 of the AY
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
    num: weekNumber,
  };
}

/**
 * Get the first day of the exam week for the given semester
 * @param {string} year
 * @param {number} semester
 * @returns {Date}
 */
export function getExamWeek(year, semester) {
  const startDate = getAcadYearStartDate(year);

  if (!startDate) {
    console.warn(`[nusmoderator] Unsupported year: ${year}`);
    return null;
  }

  const examWeek = {
    1: 16,
    2: 38,
    3: 45,
    4: 51,
  };

  const weeks = examWeek[semester];
  if (!weeks) {
    console.warn(`[nusmoderator] Unknown semester: ${semester}`);
    return null;
  }

  const d = new Date(startDate.valueOf());
  d.setDate(startDate.getDate() + weeks * 7);
  return d;
}

export default {
  getAcadYearStartDate,
  getAcadYear,
  getAcadSem,
  getAcadWeekName,
  getAcadWeekInfo,
  getExamWeek,
};
