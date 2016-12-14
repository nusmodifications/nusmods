// @flow
import _ from 'lodash';

import { getModuleSemesterData } from 'utils/modules';
import type { EventOption } from 'ical-generator';
import type { RawLesson, Module, ModuleCode, Semester } from 'types/modules';
import type {
  ModuleLessonConfigWithLessons,
  SemTimetableConfigWithLessons
} from 'types/timetables';
import config from 'config/app-config.json';
import academicCalendar from 'config/academic-calendar.json';

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

export function examIcalEvent(module: Module, semester: Semester): EventOption {
  const examDate = new Date(getExamDate(module, semester));
  return {
    start: examDate,
    end: new Date(examDate.valueOf() + (2 * 60 * 60 * 1000)), // 2 hours
    summary: `${module.ModuleCode} Exam`,
    description: module.ModuleTitle,
    url: `http://www.nus.edu.sg/registrar/event/examschedule-sem${semester}.html`,
  };
}

const NUM_WEEKS_IN_A_SEM = 14; // including reading week
const ODD_WEEK = ['1', '3', '5', '7', '9', '11', '13'];
const EVEN_WEEK = ['2', '4', '6', '8', '10', '12'];
const WEEKS_WITHOUT_TUTORIALS = ['1', '2', '3'];

export function isTutorial(lesson: RawLesson): boolean {
  const tutorialLessonTypes = ['Design Lecture', 'Laboratory', 'Recitation'];
  return (
    tutorialLessonTypes.includes(lesson.LessonType) ||
    lesson.LessonType.toLowerCase().includes('tutorial'));
}

// given academic weeks in semester and a start date in week 1,
// return dates corresponding to the respective weeks
export function datesForAcademicWeeks(start: Date, week: number | string): Date {
  // all weeks 7 and after are bumped by 7 days because of recess week
  if (week === 'recess') {
    return daysAfter(start, 6 * 7);
  }
  const w = parseInt(week, 10);
  return daysAfter(
    start,
    (w <= 6 ? w - 1 : w) * 7);
}

// calculates the dates that should be excluded for lesson
function calculateExclusion(lesson: RawLesson, start: Date) {
  let excludes = _.union(
    // always exclude recess
    ['recess'],
    // specific exclusion for lessons (tutorials)
    isTutorial(lesson) ? WEEKS_WITHOUT_TUTORIALS : []
  );

  switch (lesson.WeekText) {
    case 'Odd Week':
      excludes = _.union(excludes, EVEN_WEEK);
      break;
    case 'Even Week':
      excludes = _.union(excludes, ODD_WEEK);
      break;
    default:
      break;
  }

  // sort in ascending order so we get nicer dates, except recess which will be last
  excludes.sort((a, b) => a.localeCompare(b));
  // convert the academic weeks into dates
  return excludes.map(_.partial(datesForAcademicWeeks, start));
}

// strategy is to generate a weekly event, then exclude recess week,
// and take care of odd/even weeks
function iCalEventForLesson(lesson: RawLesson, module: Module, semester: Semester, firstDayOfSchool: Date): EventOption {
  // TODO deal with non weekly
  const freq = 'WEEKLY';
  const count = NUM_WEEKS_IN_A_SEM;
  const byDay = [lesson.DayText.slice(0, 2)];
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
      freq,
      count,
      byDay,
      exclude,
    },
  };
}

export function iCalForTimetable(
    semester: Semester, timetable: SemTimetableConfigWithLessons,
    moduleData: { [key: ModuleCode]: Module }, year: string = config.academicYear): Array<EventOption> {
  const firstDayOfSchool = new Date(academicCalendar[year][semester].start);
  const events = _.flatMap(timetable, (lessonConfig: ModuleLessonConfigWithLessons, moduleCode: ModuleCode) =>
    _.flatMap(lessonConfig, lessons =>
      lessons.map(
        lesson => iCalEventForLesson(
          lesson, moduleData[moduleCode], semester, firstDayOfSchool))
    ));
  return events;
}
