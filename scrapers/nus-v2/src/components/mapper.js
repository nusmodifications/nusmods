// @flow
import { fromPairs, groupBy, values } from 'lodash';
import moment from 'moment';
import NUSModerator from 'nusmoderator';

import type {
  AcademicGroup,
  AcademicOrg,
  ModuleExam,
  ModuleInfo,
  TimetableLesson,
} from '../types/api';
import type { RawLesson, WeekText } from '../types/modules';
import type {
  DepartmentCodeMap,
  ExamInfo,
  FacultyCodeMap,
  ModuleInfoMapped,
  SemesterModule,
} from '../types/mapper';
import { fromTermCode } from '../utils/api';

const UTC_OFFSET = 8 * 60; // Singapore is UTC+8

/* eslint-disable camelcase */

/**
 * Create a mapping of faculty code to faculty name from a list of faculties
 */
export function getFacultyCodeMap(faculties: AcademicGroup[]): FacultyCodeMap {
  return fromPairs(faculties.map((faculty) => [faculty.AcademicGroup, faculty.Description]));
}

/**
 * Create a mapping of department code to department name from a list of faculties
 */
export function getDepartmentCodeMap(departments: AcademicOrg[]): DepartmentCodeMap {
  return fromPairs(
    departments.map((department) => [department.AcademicOrganisation, department.Description]),
  );
}

/**
 * Overwrite AcademicOrganisation and AcademicGroup with their names instead
 * of an object
 */
export function mapFacultyDepartmentCodes(
  moduleInfo: ModuleInfo,
  faculties: FacultyCodeMap,
  departments: DepartmentCodeMap,
): ModuleInfoMapped {
  // $FlowFixMe Flow won't recognize this spread is overwriting the original's properties
  return {
    ...moduleInfo,
    AcademicOrganisation: departments[moduleInfo.AcademicOrganisation.Code],
    AcademicGroup: faculties[moduleInfo.AcademicGroup.Code],
  };
}

/**
 * Map ModuleInfo from the API into something that looks more
 */
export function mapModuleInfo(moduleInfo: ModuleInfoMapped): SemesterModule {
  const {
    Term,
    AcademicOrganisation,
    CourseTitle,
    WorkLoadHours,
    Preclusion,
    PreRequisite,
    CoRequisite,
    ModularCredit,
    Description,
    Subject,
    CatalogNumber,
  } = moduleInfo;

  const [AcadYear] = fromTermCode(Term);

  return {
    AcadYear,
    Description,
    Preclusion,
    Department: AcademicOrganisation,
    ModuleTitle: CourseTitle,
    Workload: WorkLoadHours,
    Prerequisite: PreRequisite,
    Corequisite: CoRequisite,
    ModuleCredit: ModularCredit,
    ModuleCode: Subject + CatalogNumber,
  };
}

/**
 * Extract the part of the raw ModuleExam that is used in SemesterData
 */
export function mapExamInfo(moduleExam: ModuleExam): ExamInfo {
  const { exam_date, start_time, duration } = moduleExam;
  const date = moment(`${exam_date} ${start_time}+08:00`).utcOffset(UTC_OFFSET);

  return {
    ExamDate: date.toISOString(true),
    ExamDuration: parseInt(duration, 10),
  };
}

export const dayTextMap = {
  '1': 'Monday',
  '2': 'Tuesday',
  '3': 'Wednesday',
  '4': 'Thursday',
  '5': 'Friday',
  '6': 'Saturday',
};

export const activityLessonTypeMap = {
  '2': 'Tutorial Type 2',
  '3': 'Tutorial Type 3',
  '4': 'Tutorial Type 4',
  '5': 'Tutorial Type 5',
  '6': 'Tutorial Type 6',
  '7': 'Tutorial Type 7',
  '8': 'Tutorial Type 8',
  '9': 'Tutorial Type 9',
  A: 'Supervision of Academic Exercise',
  B: 'Laboratory',
  D: 'Design Lecture',
  L: 'Lecture',
  O: 'Others',
  S: 'Sectional Teaching',
  T: 'Tutorial',
  W: 'Workshop',
  E: 'Seminar-Style Module Class',
  R: 'Recitation',
  V: 'Lecture On Demand',
  I: 'Independent Study Module',
  P: 'Packaged Lecture',
  X: 'Packaged Tutorial',
  C: 'Bedside Tutorial',
  M: 'Ensemble Teaching',
  J: 'Mini-Project',
};

function getLessonKey(lesson: TimetableLesson) {
  return [
    lesson.activity,
    lesson.modgrp,
    lesson.day,
    lesson.start_time,
    lesson.end_time,
    lesson.session,
    lesson.room,
  ].join('|');
}

/**
 * Try to infer week text from the provided list of events
 */
function getWeekText(lessons: TimetableLesson[]): WeekText {
  // All 13 weeks
  if (lessons.length === 13) return 'Every Week';

  // Get the week numbers the dates are in
  const weeks = lessons
    .map((lesson) => new Date(lesson.eventdate))
    .map((date) => NUSModerator.academicCalendar.getAcadWeekInfo(date))
    .map((weekInfo) => weekInfo.num)
    .sort((a, b) => a - b);

  // Calculate the number of weeks between lessons to check for
  // odd/even weeks
  const weekDelta = [];
  for (let i = 0; i < weeks.length - 1; i++) {
    weekDelta.push(weeks[i + 1] - weeks[i]);
  }

  if (weekDelta.every((delta) => delta === 2)) {
    // TODO: Check for tutorial / lab
    if (weeks.length === 6) {
      return weeks[0] === 1 ? 'Odd Weeks' : 'Even Weeks';
    }
  }

  return weeks.join(',');
}

/**
 * Convert API provided timetable data to RawLesson format used by the frontend
 */
export function mapTimetableLessons(lessons: TimetableLesson[]): RawLesson[] {
  // Group the same lessons together
  const groupedLessons = groupBy(lessons, (lesson) => getLessonKey(lesson));

  // For each lesson, map the keys from the NUS API to ours. Most have close
  // mappings, but week text needs to be inferred from the event's dates
  return values(groupedLessons).map((events: TimetableLesson[]) => {
    const { room, start_time, end_time, day, modgrp, activity } = events[0];

    return {
      // mod group contains the activity at the start - we remove that because
      // it is redundant
      ClassNo: modgrp.replace(activity, ''),
      // Start and end time don't have the ':' delimiter
      StartTime: start_time.replace(':', ''),
      EndTime: end_time.replace(':', ''),
      // Week text is inferred from the event's dates
      WeekText: getWeekText(events),
      Venue: room,
      DayText: dayTextMap[day],
      LessonType: activityLessonTypeMap[activity],
    };
  });
}
