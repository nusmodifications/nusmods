const academicCalendar = require('./academic-calendar.json');

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

function isPreviousAySt2Active(academicYear, date = new Date()) {
  const previousAcadYear = subtractAcadYear(academicYear);
  const st2Start = getSemesterStart(previousAcadYear, 4);
  const st2End = getSemesterStart(academicYear, 1);

  if (!st2Start || !st2End) {
    return false;
  }

  return date >= st2Start && date < st2End;
}

function getEffectiveSt2AcadYear(academicYear, specialTermAcademicYear = null, date = new Date()) {
  if (specialTermAcademicYear) {
    return specialTermAcademicYear;
  }

  if (isPreviousAySt2Active(academicYear, date)) {
    return subtractAcadYear(academicYear);
  }

  return academicYear;
}

function isUsingPreviousAySt2Data(academicYear, specialTermAcademicYear = null, date = new Date()) {
  return getEffectiveSt2AcadYear(academicYear, specialTermAcademicYear, date) !== academicYear;
}

module.exports = {
  academicCalendar,
  default: academicCalendar,
  subtractAcadYear,
  getSemesterStart,
  isPreviousAySt2Active,
  getEffectiveSt2AcadYear,
  isUsingPreviousAySt2Data,
};
