// @flow
import _ from 'lodash';
import type { EventOption } from 'ical-generator';

import type { RawLesson, Module, ModuleCode, Semester } from 'types/modules';
import type {
  ModuleLessonConfigWithLessons,
  SemTimetableConfigWithLessons,
} from 'types/timetables';

import config from 'config/app-config.json';
import academicCalendar from 'config/academic-calendar.json';
import { getModuleSemesterData } from 'utils/modules';

export const RECESS_WEEK = -1;
const NUM_WEEKS_IN_A_SEM = 14; // including reading week
const ODD_WEEKS = [1, 3, 5, 7, 9, 11, 13];
const EVEN_WEEKS = [2, 4, 6, 8, 10, 12];
const ALL_WEEKS = [...ODD_WEEKS, ...EVEN_WEEKS];
const WEEKS_WITHOUT_TUTORIALS = [1, 2, 3];
const EXAM_DURATION_MS = 2 * 60 * 60 * 1000; // 2 hours
const tutorialLessonTypes = ['Design Lecture', 'Laboratory', 'Recitation'];

function dayIndex(weekday: string) {
  return ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].indexOf(weekday.toLowerCase());
}

// needed cos the utils method formats the date for display
function getExamDate(module: Module, semester: Semester): string {
  return _.get(getModuleSemesterData(module, semester), 'ExamDate');
}

export function daysAfter(startDate: Date, days: number): Date {
  const result = new Date(startDate.getTime());
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

export function iCalEventForExam(module: Module, semester: Semester): ?EventOption {
  const examDate = new Date(getExamDate(module, semester));
  if (isNaN(examDate.getTime())) {
    return null;
  }
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
    lesson.LessonType.toLowerCase().includes('tutorial'));
}

// given academic weeks in semester and a start date in week 1,
// return dates corresponding to the respective weeks
export function datesForAcademicWeeks(start: Date, week: number): Date {
  // all weeks 7 and after are bumped by 7 days because of recess week
  if (week === RECESS_WEEK) {
    return daysAfter(start, 6 * 7);
  }
  return daysAfter(
    start,
    (week <= 6 ? week - 1 : week) * 7);
}

/* Calculates the dates that should be excluded for lesson
 * 1. exclude recess week from all
 * 2. odd/even weeks get appropriate exclusions
 * 3. tutorials have week 1, 2, and 3 excluded
 * 4. if comma separated weeks specified, exclude unspecified weeks
 */
function calculateExclusion(lesson: RawLesson, start: Date) {
  let excludes = _.union(
    // always exclude recess
    [RECESS_WEEK],
    // specific exclusion for lessons (tutorials)
    isTutorial(lesson) ? WEEKS_WITHOUT_TUTORIALS : []
  );

  switch (lesson.WeekText) {
    case 'Odd Week':
      excludes = _.union(excludes, EVEN_WEEKS);
      break;
    case 'Even Week':
      excludes = _.union(excludes, ODD_WEEKS);
      break;
    case 'Every Week':
      break;
    default: { // comma-separated weeks
      const weeksWithClasses = lesson.WeekText.split(',').map(w => parseInt(w, 10));
      excludes = _.union(excludes, _.difference(ALL_WEEKS, weeksWithClasses));
      break;
    }
  }

  // sort in ascending order so we get nicer dates, recess will be the first
  excludes.sort((a, b) => a - b);
  // convert the academic weeks into dates
  return excludes.map(_.partial(datesForAcademicWeeks, start));
}

/* Strategy is to generate a weekly event,
 * then calculate exclusion for special cases in calculateExclusion.
 */
export function iCalEventForLesson(
  lesson: RawLesson, module: Module, semester: Semester, firstDayOfSchool: Date): EventOption {
  // set start date and time
  const start = daysAfter(firstDayOfSchool, dayIndex(lesson.DayText));
  start.setHours(parseInt(lesson.StartTime.slice(0, 2), 10));
  // set end time
  const end = new Date(start.getTime());
  end.setHours(parseInt(lesson.EndTime.slice(0, 2), 10));
  const exclude = calculateExclusion(lesson, start);

  return {
    start,
    end,
    summary: `${module.ModuleCode} ${lesson.LessonType}`,
    description: `${module.ModuleTitle}\n${lesson.LessonType} Group ${lesson.ClassNo}`,
    location: lesson.Venue,
    url: 'https://myaces.nus.edu.sg/cors/jsp/report/ModuleDetailedInfo.jsp?' +
      `acad_y=${module.AcadYear}&sem_c=${semester}&mod_c=${module.ModuleCode}`,
    repeating: {
      freq: 'WEEKLY',
      count: NUM_WEEKS_IN_A_SEM,
      byDay: [lesson.DayText.slice(0, 2)],
      exclude,
    },
  };
}

export function iCalForTimetable(
    semester: Semester,
    timetable: SemTimetableConfigWithLessons,
    moduleData: { [key: ModuleCode]: Module },
    year: string = config.academicYear): Array<EventOption> {
  const firstDayOfSchool = new Date(Date.UTC(...academicCalendar[year][semester].start));
  const events = _.flatMap(
    timetable,
    (lessonConfig: ModuleLessonConfigWithLessons, moduleCode: ModuleCode) =>
      _.concat(
        _.flatMap(
          lessonConfig,
          lessons =>
          lessons.map(
            lesson => iCalEventForLesson(
              lesson, moduleData[moduleCode], semester, firstDayOfSchool))
        ),
        iCalEventForExam(moduleData[moduleCode], semester) || [],
      )
  );
  return events;
}
