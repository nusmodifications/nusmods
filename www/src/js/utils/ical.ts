import _ from 'lodash';
// @ts-ignore
import { EventOption } from 'ical-generator';

import {
  consumeWeeks,
  EndTime,
  Module,
  RawLesson,
  Semester,
  StartTime,
  WeekRange,
} from 'types/modules';
import { SemTimetableConfigWithLessons } from 'types/timetables';

import config from 'config';
import academicCalendar from 'data/academic-calendar';
import { getModuleSemesterData } from 'utils/modules';
import { daysAfter } from 'utils/timify';
import { addDays, parseISO } from 'date-fns';

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

function calculateStartEnd(date: Date, startTime: StartTime, endTime: EndTime) {
  const start = hoursAfter(date, getTimeHour(startTime));
  const end = hoursAfter(date, getTimeHour(endTime));

  return { start, end };
}

export function calculateNumericWeek(
  lesson: RawLesson,
  semester: Semester,
  weeks: number[],
  firstDayOfSchool: Date,
): EventOption {
  const lessonDay = daysAfter(firstDayOfSchool, dayIndex(lesson.DayText));
  const { start, end } = calculateStartEnd(lessonDay, lesson.StartTime, lesson.EndTime);
  const excludedWeeks = _.difference([RECESS_WEEK, ...ALL_WEEKS], weeks);

  return {
    start,
    end,
    repeating: {
      freq: 'WEEKLY',
      count: NUM_WEEKS_IN_A_SEM,
      byDay: [lesson.DayText.slice(0, 2)],
      exclude: [
        ...excludedWeeks.map((week) => datesForAcademicWeeks(start, week)),
        ...holidaysForYear(getTimeHour(lesson.StartTime)),
      ],
    },
  };
}

export function calculateWeekRange(
  lesson: RawLesson,
  semester: Semester,
  weekRange: WeekRange,
): EventOption {
  const lessonDay = parseISO(weekRange.start);
  const { start, end } = calculateStartEnd(lessonDay, lesson.StartTime, lesson.EndTime);

  const interval = weekRange.weekInterval || 1;
  const exclusions = [];

  if (weekRange.weeks) {
    for (
      let current = start, weekNumber = 1;
      current <= end;
      current = addDays(current, interval * 7), weekNumber += 1
    ) {
      if (!weekRange.weeks.includes(weekNumber)) {
        exclusions.push(current);
      }
    }
  }

  return {
    start,
    end,
    repeating: {
      interval,
      until: end,
      byDay: [lesson.DayText.slice(0, 2)],
      exclude: [...exclusions, ...holidaysForYear(getTimeHour(lesson.StartTime))],
    },
  };
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
  const event = consumeWeeks(
    lesson.Weeks,
    (weeks) => calculateNumericWeek(lesson, semester, weeks, firstDayOfSchool),
    (weeks) => calculateWeekRange(lesson, semester, weeks),
  );

  return {
    ...event,
    summary: `${module.ModuleCode} ${lesson.LessonType}`,
    description: `${module.ModuleTitle}\n${lesson.LessonType} Group ${lesson.ClassNo}`,
    location: lesson.Venue,
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
  const events: EventOption[] = [];

  _.each(timetable, (lessonConfig, moduleCode) => {
    _.each(lessonConfig, (lessons) => {
      lessons.forEach((lesson) => {
        events.push(iCalEventForLesson(lesson, moduleData[moduleCode], semester, firstDayOfSchool));
      });
    });

    const examEvent = iCalEventForExam(moduleData[moduleCode], semester);
    if (examEvent) events.push(examEvent);
  });

  return events;
}
