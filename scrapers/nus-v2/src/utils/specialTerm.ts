import academicCalendarJSON from '../data/academic-calendar.json';
import config from '../config';

type DateTuple = [number, number, number];
const academicCalendar = academicCalendarJSON as unknown as {
  [year: string]: {
    [semester: string]: { start: DateTuple };
  };
};

function subtractAcadYear(acadYear: string): string {
  return acadYear.replace(/\d+/g, (year) => String(parseInt(year, 10) - 1));
}

function getSemesterStart(acadYear: string, semester: number): Date | null {
  const semesterConfig = academicCalendar[acadYear]?.[String(semester)];
  if (!semesterConfig) {
    return null;
  }

  const [year, month, day] = semesterConfig.start as DateTuple;
  return new Date(year, month - 1, day);
}

export function isPreviousAySt2Active(
  academicYear: string = config.academicYear,
  date: Date = new Date(),
): boolean {
  const previousAcadYear = subtractAcadYear(academicYear);
  const st2Start = getSemesterStart(previousAcadYear, 4);
  const st2End = getSemesterStart(academicYear, 1);

  if (!st2Start || !st2End) {
    return false;
  }

  return date >= st2Start && date < st2End;
}

export function getEffectiveSt2AcadYear(
  academicYear: string = config.academicYear,
  specialTermAcademicYear: string | null = config.specialTermAcademicYear,
  date: Date = new Date(),
): string {
  if (specialTermAcademicYear) {
    return specialTermAcademicYear;
  }

  if (isPreviousAySt2Active(academicYear, date)) {
    return subtractAcadYear(academicYear);
  }

  return academicYear;
}

export function isUsingPreviousAySt2Data(
  academicYear: string = config.academicYear,
  specialTermAcademicYear: string | null = config.specialTermAcademicYear,
  date: Date = new Date(),
): boolean {
  return getEffectiveSt2AcadYear(academicYear, specialTermAcademicYear, date) !== academicYear;
}
