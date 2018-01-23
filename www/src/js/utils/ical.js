// @flow
import _ from 'lodash';
import type { EventOption } from 'ical-generator';

import type { RawLesson, Module, ModuleCode, Semester } from 'types/modules';
import type {
  ModuleLessonConfigWithLessons,
  SemTimetableConfigWithLessons,
} from 'types/timetables';

import config from 'config';
import academicCalendar from 'data/academic-calendar.json';
import { getModuleSemesterData } from 'utils/modules';

const SG_UTC_TIME_DIFF_MS = 8 * 60 * 60 * 1000;
export const RECESS_WEEK = -1;
const NUM_WEEKS_IN_A_SEM = 14; // including reading week
const ODD_WEEKS = [1, 3, 5, 7, 9, 11, 13];
const EVEN_WEEKS = [2, 4, 6, 8, 10, 12];
const ALL_WEEKS = [...ODD_WEEKS, ...EVEN_WEEKS];
const WEEKS_WITHOUT_TUTORIALS = [1, 2];
const EXAM_DURATION_MS = 2 * 60 * 60 * 1000; // 2 hours
const tutorialLessonTypes = ['Design Lecture', 'Laboratory', 'Recitation'];

function dayIndex(weekday: string) {
  return ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].indexOf(weekday.toLowerCase());
}

/**
 * Parse out the hour component from a time string in the format of hhmm
 */
export function getTimeHour(time: string) {
  return parseInt(time.slice(0, 2), 10) + parseInt(time.slice(2), 10) / 60;
}

// needed cos the utils method formats the date for display
function getExamDate(module: Module, semester: Semester): string {
  return _.get(getModuleSemesterData(module, semester), 'ExamDate');
}

/**
 * Return a copy of the original Date incremented by the given number of days
 */
export function daysAfter(startDate: Date, days: number): Date {
  const d = new Date(startDate.valueOf());
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

/**
 * Return a copy of the original Date incremented by the given number of hours
 */
export function hoursAfter(date: Date, sgHour: number) {
  const d = new Date(date.valueOf());
  d.setUTCHours(d.getUTCHours() + Math.floor(sgHour), (sgHour % 1) * 60);
  return d;
}

export function iCalEventForExam(module: Module, semester: Semester): ?EventOption {
  const examDate = new Date(getExamDate(module, semester));
  if (isNaN(examDate.getTime())) return null;

  return {
    start: examDate,
    end: new Date(examDate.valueOf() + EXAM_DURATION_MS),
    summary: `${module.ModuleCode} Exam`,
    description: module.ModuleTitle,
    url: `http://www.nus.edu.sg/registrar/event/examschedule-sem${semester}.html`,
  };
}

export function isTutorial(lesson: RawLesson): boolean {
  return (
    tutorialLessonTypes.includes(lesson.LessonType) ||
    lesson.LessonType.toLowerCase().includes('tutorial')
  );
}

export function holidaysForYear(hourOffset: number = 0) {
  return config.holidays
    .map((date) => new Date(date.valueOf() - SG_UTC_TIME_DIFF_MS)) // Convert to local time
    .map((holiday) => hoursAfter(holiday, hourOffset));
}

// given academic weeks in semester and a start date in week 1,
// return dates corresponding to the respective weeks
export function datesForAcademicWeeks(start: Date, week: number): Date {
  // all weeks 7 and after are bumped by 7 days because of recess week
  if (week === RECESS_WEEK) {
    return daysAfter(start, 6 * 7);
  }
  return daysAfter(start, (week <= 6 ? week - 1 : week) * 7);
}

/**
 * Calculates the dates that should be excluded for lesson
 *
 * - Exclude entire weeks that do not apply for the lesson
 * - Exclude all holidays
 *
 * Exclusions are represented by datetime when the event will start, so we calculate
 * excluded weeks by simply offsetting the first lesson's date by seven days per week
 */
export function calculateExclusion(lesson: RawLesson, firstLesson: Date) {
  // 1. Always exclude recess week
  let excludedWeeks = [RECESS_WEEK];

  // 2. Exclude weeks 1 and 2 if this is a tutorial
  if (isTutorial(lesson)) {
    excludedWeeks = excludedWeeks.concat(WEEKS_WITHOUT_TUTORIALS);
  }

  switch (lesson.WeekText) {
    // 3. Exclude odd/even weeks for even/odd week lessons
    case 'Odd Week':
      excludedWeeks = _.union(excludedWeeks, EVEN_WEEKS);
      break;
    case 'Even Week':
      excludedWeeks = _.union(excludedWeeks, ODD_WEEKS);
      break;
    case 'Every Week':
      break;

    // 4. If WeekText is not any of the above, then assume it consists of a list of weeks
    //    with lessons, so we exclude weeks without lessons
    default: {
      const weeksWithClasses = lesson.WeekText.split(',').map((w) => parseInt(w, 10));
      excludedWeeks = _.union(excludedWeeks, _.difference(ALL_WEEKS, weeksWithClasses));
      break;
    }
  }

  return [
    // 5. Convert the academic weeks into dates
    ...excludedWeeks.map((week) => datesForAcademicWeeks(firstLesson, week)),
    // 6. Exclude holidays
    ...holidaysForYear(getTimeHour(lesson.StartTime)),
  ];
}

/**
 * Strategy is to generate a weekly event,
 * then calculate exclusion for special cases in calculateExclusion.
 */
export function iCalEventForLesson(
  lesson: RawLesson,
  module: Module,
  semester: Semester,
  firstDayOfSchool: Date,
): EventOption {
  // set start date and time, end date and time
  const lessonDayMidnight = daysAfter(firstDayOfSchool, dayIndex(lesson.DayText));
  const start = hoursAfter(lessonDayMidnight, getTimeHour(lesson.StartTime));
  const end = hoursAfter(lessonDayMidnight, getTimeHour(lesson.EndTime));

  const exclude = calculateExclusion(lesson, start);

  return {
    start,
    end,
    summary: `${module.ModuleCode} ${lesson.LessonType}`,
    description: `${module.ModuleTitle}\n${lesson.LessonType} Group ${lesson.ClassNo}`,
    location: lesson.Venue,
    url:
      'https://myaces.nus.edu.sg/cors/jsp/report/ModuleDetailedInfo.jsp?' +
      `acad_y=${module.AcadYear}&sem_c=${semester}&mod_c=${module.ModuleCode}`,
    repeating: {
      freq: 'WEEKLY',
      count: NUM_WEEKS_IN_A_SEM,
      byDay: [lesson.DayText.slice(0, 2)],
      exclude,
    },
  };
}

export default function iCalForTimetable(
  semester: Semester,
  timetable: SemTimetableConfigWithLessons,
  moduleData: { [ModuleCode]: Module },
  academicYear: string = config.academicYear,
): EventOption[] {
  const [year, month, day] = academicCalendar[academicYear][semester].start;
  // 'month - 1' because JS months are zero indexed
  const firstDayOfSchool = new Date(Date.UTC(year, month - 1, day) - SG_UTC_TIME_DIFF_MS);
  const events = _.flatMap(
    timetable,
    (lessonConfig: ModuleLessonConfigWithLessons, moduleCode: ModuleCode) =>
      _.concat(
        _.flatMap(lessonConfig, (lessons) =>
          lessons.map((lesson) =>
            iCalEventForLesson(lesson, moduleData[moduleCode], semester, firstDayOfSchool),
          ),
        ),
        iCalEventForExam(moduleData[moduleCode], semester) || [],
      ),
  );
  return events;
}
