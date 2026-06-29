import { difference, each } from 'lodash-es';
import { ICalEventData, ICalEventRepeatingFreq, ICalTimezone, ICalWeekday } from 'ical-generator';
import { addDays, addMinutes, addWeeks, isValid } from 'date-fns';

import {
  consumeWeeks,
  EndTime,
  LessonTime,
  Module,
  ModuleCode,
  NumericWeeks,
  DayText,
  RawLesson,
  Semester,
  StartTime,
  WeekRange,
} from 'types/modules';
import { Lesson, SemTimetableConfigWithLessons } from 'types/timetables';

import config from 'config';
import academicCalendar from 'data/academic-calendar';
import { getExamDate, getExamDuration } from 'utils/modules';
import { getLessonTimeHours, getLessonTimeMinutes, parseDate, SCHOOLDAYS } from './timify';

const SG_UTC_OFFSET_MS = 8 * 60 * 60 * 1000;
export const RECESS_WEEK = -1;
const NUM_WEEKS_IN_A_SEM = 14; // including reading week
const ODD_WEEKS = [1, 3, 5, 7, 9, 11, 13];
const EVEN_WEEKS = [2, 4, 6, 8, 10, 12];
const ALL_WEEKS = [...ODD_WEEKS, ...EVEN_WEEKS];
const DEFAULT_EXAM_DURATION = 120; // If not provided, assume exams are 2 hours long

export const SINGAPORE_TIMEZONE = 'Asia/Singapore';

// Singapore has observed a fixed +08:00 offset with no daylight saving since 1982,
// so a single STANDARD component fully describes its VTIMEZONE. Inlining it lets
// ical-generator emit a self-contained VTIMEZONE block (so every calendar app,
// including Outlook, resolves the times) without pulling in a full IANA database.
const SINGAPORE_VTIMEZONE = [
  'BEGIN:VTIMEZONE',
  `TZID:${SINGAPORE_TIMEZONE}`,
  'BEGIN:STANDARD',
  'DTSTART:19700101T000000',
  'TZOFFSETFROM:+0800',
  'TZOFFSETTO:+0800',
  'TZNAME:+08',
  'END:STANDARD',
  'END:VTIMEZONE',
].join('\r\n');

/**
 * Calendar-level timezone config passed to ical-generator. The generator makes it
 * emit the VTIMEZONE block above for every TZID referenced by the calendar's events.
 */
export const singaporeTimezone: ICalTimezone = {
  name: SINGAPORE_TIMEZONE,
  generator: () => SINGAPORE_VTIMEZONE,
};

// ical-generator weekday enum for each day of the week, used to build the RRULE's
// BYDAY rule. Covers every day so Saturday (and Sunday) lessons get a valid weekday.
const WEEKDAY_FOR_DAY: Record<DayText, ICalWeekday> = {
  Monday: ICalWeekday.MO,
  Tuesday: ICalWeekday.TU,
  Wednesday: ICalWeekday.WE,
  Thursday: ICalWeekday.TH,
  Friday: ICalWeekday.FR,
  Saturday: ICalWeekday.SA,
  Sunday: ICalWeekday.SU,
};

// Offset (in days) of a lesson's day from the Monday that starts week 1. Reuses
// SCHOOLDAYS (Monday-indexed) so it stays in sync with the rest of the app.
function dayIndex(day: DayText) {
  return SCHOOLDAYS.indexOf(day);
}

/**
 * ical-generator tags each event with its TZID and formats the date from the Date's
 * *local* clock-fields, without converting the instant. Building dates whose local
 * clock-fields already read as the Singapore wall-clock time therefore makes the
 * exported calendar display in SGT for any viewer, regardless of their machine's
 * timezone. This also avoids any dependence on the runtime's own DST rules, since we
 * only ever set clock-fields directly (never do arithmetic across a DST boundary).
 */
function atSingaporeTime(date: Date, time: LessonTime): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    getLessonTimeHours(time),
    getLessonTimeMinutes(time),
  );
}

/**
 * Convert an absolute instant (e.g. a parsed exam date or week-range boundary) into a
 * Date whose local clock-fields equal its Singapore (UTC+8) wall-clock time, for the
 * same reason as {@link atSingaporeTime}.
 */
function toSingaporeTime(instant: Date): Date {
  const shifted = new Date(instant.valueOf() + SG_UTC_OFFSET_MS);
  return new Date(
    shifted.getUTCFullYear(),
    shifted.getUTCMonth(),
    shifted.getUTCDate(),
    shifted.getUTCHours(),
    shifted.getUTCMinutes(),
    shifted.getUTCSeconds(),
  );
}

export function iCalEventForExam(module: Module, semester: Semester): ICalEventData | null {
  const examDate = getExamDate(module, semester);
  if (!examDate) return null;

  const start = new Date(examDate);
  if (!isValid(start)) return null;

  const end = addMinutes(start, getExamDuration(module, semester) || DEFAULT_EXAM_DURATION);

  return {
    start: toSingaporeTime(start),
    end: toSingaporeTime(end),
    timezone: SINGAPORE_TIMEZONE,
    summary: `${module.moduleCode} Exam`,
    description: module.title,
  };
}

export function holidaysForYear(time: LessonTime): Date[] {
  // config.holidays are stored as midnight-UTC instants tagging a Singapore date, so
  // read their UTC date fields to recover that date.
  return config.holidays.map(
    (holiday) =>
      new Date(
        holiday.getUTCFullYear(),
        holiday.getUTCMonth(),
        holiday.getUTCDate(),
        getLessonTimeHours(time),
        getLessonTimeMinutes(time),
      ),
  );
}

// given academic weeks in semester and a start date in week 1,
// return dates corresponding to the respective weeks
export function datesForAcademicWeeks(start: Date, week: number): Date {
  // all weeks 7 and after are bumped by 7 days because of recess week
  if (week === RECESS_WEEK) {
    return addWeeks(start, 6);
  }
  return addWeeks(start, week <= 6 ? week - 1 : week);
}

function calculateStartEnd(date: Date, startTime: StartTime, endTime: EndTime) {
  return {
    start: atSingaporeTime(date, startTime),
    end: atSingaporeTime(date, endTime),
  };
}

export function calculateNumericWeek(
  lesson: RawLesson,
  _semester: Semester,
  weeks: NumericWeeks,
  firstDayOfSchool: Date,
): ICalEventData {
  const lessonDay = addDays(firstDayOfSchool, dayIndex(lesson.day));
  const { start, end } = calculateStartEnd(lessonDay, lesson.startTime, lesson.endTime);
  const excludedWeeks = difference([RECESS_WEEK, ...ALL_WEEKS], weeks);

  return {
    start,
    end,
    repeating: {
      freq: ICalEventRepeatingFreq.WEEKLY,
      count: NUM_WEEKS_IN_A_SEM,
      byDay: [WEEKDAY_FOR_DAY[lesson.day]],
      exclude: [
        ...excludedWeeks.map((week) => datesForAcademicWeeks(start, week)),
        ...holidaysForYear(lesson.startTime),
      ],
    },
  };
}

export function calculateWeekRange(
  lesson: RawLesson,
  _semester: Semester,
  weekRange: WeekRange,
): ICalEventData {
  const rangeStart = toSingaporeTime(parseDate(weekRange.start));
  const rangeEnd = toSingaporeTime(parseDate(weekRange.end));
  const { start, end } = calculateStartEnd(rangeStart, lesson.startTime, lesson.endTime);

  const interval = weekRange.weekInterval || 1;
  const exclusions = [];

  if (weekRange.weeks) {
    for (
      let current = rangeStart, weekNumber = 1;
      current <= rangeEnd;
      current = addWeeks(current, interval), weekNumber += interval
    ) {
      if (!weekRange.weeks.includes(weekNumber)) {
        const lessonTime = calculateStartEnd(current, lesson.startTime, lesson.endTime);
        exclusions.push(lessonTime.start);
      }
    }
  }

  const lastLesson = calculateStartEnd(rangeEnd, lesson.startTime, lesson.endTime);

  return {
    start,
    end,
    repeating: {
      interval,
      freq: ICalEventRepeatingFreq.WEEKLY,
      until: lastLesson.end,
      byDay: [WEEKDAY_FOR_DAY[lesson.day]],
      exclude: [...exclusions, ...holidaysForYear(lesson.startTime)],
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
  isTa: boolean,
): ICalEventData {
  const event = consumeWeeks<ICalEventData>(
    lesson.weeks,
    (weeks) => calculateNumericWeek(lesson, semester, weeks, firstDayOfSchool),
    (weeks) => calculateWeekRange(lesson, semester, weeks),
  );

  return {
    ...event,
    timezone: SINGAPORE_TIMEZONE,
    summary: `${module.moduleCode} ${lesson.lessonType}${isTa ? ' (TA)' : ''}`,
    description: `${module.title}\n${lesson.lessonType} Group ${lesson.classNo}`,
    location: lesson.venue,
  };
}

export default function iCalForTimetable(
  semester: Semester,
  timetable: SemTimetableConfigWithLessons<Lesson>,
  moduleData: { [moduleCode: string]: Module },
  hiddenModules: ModuleCode[],
  taModules: ModuleCode[],
  academicYear: string = config.academicYear,
): ICalEventData[] {
  const [year, month, day] = academicCalendar[academicYear][semester].start;
  // 'month - 1' because JS months are zero indexed. Constructed from local clock-fields
  // so the date reads as midnight on the Singapore start date (see atSingaporeTime).
  const firstDayOfSchool = new Date(year, month - 1, day);
  const events: ICalEventData[] = [];

  each(timetable, (lessonConfig, moduleCode) => {
    if (hiddenModules.includes(moduleCode)) return;

    const isTa = taModules.includes(moduleCode);

    each(lessonConfig, (lessons) => {
      each(lessons, (lesson) => {
        events.push(
          iCalEventForLesson(lesson, moduleData[moduleCode], semester, firstDayOfSchool, isTa),
        );
      });
    });

    if (isTa) return;

    const examEvent = iCalEventForExam(moduleData[moduleCode], semester);
    if (examEvent) events.push(examEvent);
  });

  return events;
}
