const academicCalendar = require('./academic-calendar.json');

const SPECIAL_TERM_SEMESTERS = [3, 4];

function subtractAcadYear(acadYear) {
  return acadYear.replace(/\d+/g, (year) => String(parseInt(year, 10) - 1));
}

function getSemesterStart(acadYear, semester) {
  const semesterConfig = academicCalendar[acadYear]?.[String(semester)];
  if (!semesterConfig) {
    return null;
  }

  const [year, month, day] = semesterConfig.start;
  return new Date(year, month - 1, day);
}

/**
 * Returns true when previous AY Special Term I or II is still in session after
 * config has switched to the new AY. Overlap runs from previous AY ST I start
 * until new AY Semester 1 starts.
 */
function isPreviousAySpecialTermActive(academicYear, date = new Date()) {
  const previousAcadYear = subtractAcadYear(academicYear);
  const specialTermStart = getSemesterStart(previousAcadYear, 3);
  const specialTermEnd = getSemesterStart(academicYear, 1);

  if (!specialTermStart || !specialTermEnd) {
    return false;
  }

  return date >= specialTermStart && date < specialTermEnd;
}

function getEffectiveSpecialTermAcadYear(
  academicYear,
  specialTermAcademicYear = null,
  date = new Date(),
) {
  if (specialTermAcademicYear) {
    return specialTermAcademicYear;
  }

  if (isPreviousAySpecialTermActive(academicYear, date)) {
    return subtractAcadYear(academicYear);
  }

  return academicYear;
}

function isUsingPreviousAySpecialTermData(
  academicYear,
  specialTermAcademicYear = null,
  date = new Date(),
) {
  return (
    getEffectiveSpecialTermAcadYear(academicYear, specialTermAcademicYear, date) !== academicYear
  );
}

function shouldUsePreviousAyForSemester(
  semester,
  academicYear,
  specialTermAcademicYear = null,
  date = new Date(),
) {
  if (!SPECIAL_TERM_SEMESTERS.includes(semester)) {
    return false;
  }

  return isUsingPreviousAySpecialTermData(academicYear, specialTermAcademicYear, date);
}

module.exports = {
  SPECIAL_TERM_SEMESTERS,
  academicCalendar,
  default: academicCalendar,
  subtractAcadYear,
  getSemesterStart,
  isPreviousAySpecialTermActive,
  getEffectiveSpecialTermAcadYear,
  isUsingPreviousAySpecialTermData,
  shouldUsePreviousAyForSemester,
};
