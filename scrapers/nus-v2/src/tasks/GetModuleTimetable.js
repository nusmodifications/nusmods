// @flow
import { groupBy, partition, values } from 'lodash';
import NUSModerator from 'nusmoderator';

import type { ModuleCode, RawLesson, Semester, WeekText } from '../types/modules';
import type { Task } from '../types/tasks';

import BaseTask from './BaseTask';
import config from '../config';
import { getTermCode, retry } from '../utils/api';
import { validateLesson } from '../services/validation';
import type { TimetableLesson } from '../types/api';
import { activityLessonType, dayTextMap } from '../services/data';

/**
 * For deduplicating timetable lessons
 */
const getLessonKey = (lesson: TimetableLesson) =>
  [
    lesson.activity,
    lesson.modgrp,
    lesson.day,
    lesson.start_time,
    lesson.end_time,
    lesson.session,
    lesson.room,
    // '|' is used as a delimiter because it is unlikely to appear
    // organically in the data
  ].join('|');

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
    // TODO: Check for tutorial / lab, those may only 5 classes
    if (weeks.length === 6) {
      return weeks[0] === 1 ? 'Odd Weeks' : 'Even Weeks';
    }
  }

  return weeks.join(',');
}

/**
 * Convert API provided timetable data to RawLesson format used by the frontend
 *
 * Output:
 *  - <semester>/<module code>/timetable.json
 */
export function mapTimetableLessons(lessons: TimetableLesson[]): RawLesson[] {
  // Group the same lessons together
  const groupedLessons = groupBy(lessons, getLessonKey);

  // For each lesson, map the keys from the NUS API to ours. Most have close
  // mappings, but week text needs to be inferred from the event's dates
  return values(groupedLessons).map((events: TimetableLesson[]) => {
    // eslint-disable-next-line camelcase
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
      // Room can be null
      Venue: room || '',
      DayText: dayTextMap[day],
      LessonType: activityLessonType[activity],
    };
  });
}

/**
 * Download the timetable for a specific module
 */
export default class GetModuleTimetable extends BaseTask implements Task<void, RawLesson[]> {
  semester: Semester;
  academicYear: string;
  moduleCode: ModuleCode;

  get name() {
    return `Get timetable for ${this.moduleCode} for semester ${this.semester}`;
  }

  constructor(
    moduleCode: ModuleCode,
    semester: Semester,
    academicYear: string = config.academicYear,
  ) {
    super();

    this.semester = semester;
    this.academicYear = academicYear;
    this.moduleCode = moduleCode;

    this.logger = this.rootLogger.child({
      semester,
      moduleCode,
      task: GetModuleTimetable.name,
      year: academicYear,
    });
  }

  async run() {
    const term = getTermCode(this.semester, this.academicYear);

    const lessons = await retry(() => this.api.getModuleTimetable(term, this.moduleCode), 3);

    // Validate and remove invalid lessons
    const [validLessons, invalidLessons] = partition(lessons, validateLesson);
    if (invalidLessons.length > 0) {
      this.logger.info({ invalidLessons }, 'Removed %i invalid lessons', invalidLessons.length);
    }

    const timetable = mapTimetableLessons(validLessons);

    // Cache timetable to disk
    await this.output.timetable(this.semester, this.moduleCode, timetable);

    return timetable;
  }
}
