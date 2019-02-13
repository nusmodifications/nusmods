import _ from 'lodash';
// @ts-ignore
import { EventOption } from 'ical-generator';

import { Module, ModuleCode, RawLesson, Semester } from 'types/modules';
import { ModuleLessonConfigWithLessons, SemTimetableConfigWithLessons } from 'types/timetables';

import config from 'config';
import academicCalendar from 'data/academic-calendar';
import { getModuleSemesterData } from 'utils/modules';
import { daysAfter } from 'utils/timify';

const SG_UTC_TIME_DIFF_MS = 8 * 60 * 60 * 1000;
export const RECESS_WEEK = -1;
const NUM_WEEKS_IN_A_SEM = 14; // including reading week
const ODD_WEEKS = [1, 3, 5, 7, 9, 11, 13];
const EVEN_WEEKS = [2, 4, 6, 8, 10, 12];
const ALL_WEEKS = [...ODD_WEEKS, ...EVEN_WEEKS];
const EXAM_DURATION_MS = 2 * 60 * 60 * 1000; // 2 hours

function dayIndex(weekday: string) {
  return ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].indexOf(weekday.toLowerCase());
}

/**
 * Parse out the hour component from a time string in the format of hhmm
 */
export function getTimeHour(time: string) {
  return parseInt(time.slice(0, 2), 10) + parseInt(time.slice(2), 10) / 60;
}

/**
 * Return a copy of the original Date incremented by the given number of hours
 */
export function hoursAfter(date: Date, sgHour: number): Date {
  const d = new Date(date.valueOf());
  d.setUTCHours(d.getUTCHours() + Math.floor(sgHour), (sgHour % 1) * 60);
  return d;
}

export function iCalEventForExam(module: Module, semester: Semester): EventOption | null {
  const examDateString = _.get(getModuleSemesterData(module, semester), 'ExamDate');
  if (!examDateString) return null;
  const examDate = new Date(examDateString);
  if (Number.isNaN(examDate.getTime())) return null;

  return {
    start: examDate,
    end: new Date(examDate.valueOf() + EXAM_DURATION_MS),
    summary: `${module.ModuleCode} Exam`,
    description: module.ModuleTitle,
  };
}

export function holidaysForYear(hourOffset: number = 0): Date[] {
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
  // TODO: Make this work with new format
  const excludedWeeks: number[] = _.difference(
    [RECESS_WEEK, ...ALL_WEEKS],
    lesson.Weeks.filter(_.isNumber),
  );

  return [
    ...excludedWeeks.map((week) => datesForAcademicWeeks(firstLesson, week)),
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
  moduleData: { [moduleCode: string]: Module },
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
