// @flow
import { groupBy, has, map, mapValues, values, trimStart } from 'lodash';
import { Logger } from 'bunyan';
import NUSModerator from 'nusmoderator';

import type { ModuleCode, RawLesson, Semester, WeekText } from '../types/modules';
import type { Task } from '../types/tasks';
import type { TimetableLesson } from '../types/api';

import BaseTask from './BaseTask';
import config from '../config';
import { getTermCode, retry } from '../utils/api';
import { validateLesson } from '../services/validation';
import { activityLessonType, dayTextMap, unrecognizedLessonTypes } from '../services/data';

/**
 * For deduplicating timetable lessons - we need a unique string identifier
 * for each lesson, so we leave out props that changes every lesson like eventdate
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
 */
export function mapTimetableLessons(lessons: TimetableLesson[], logger: Logger): RawLesson[] {
  // Group the same lessons together
  const groupedLessons = groupBy(lessons, getLessonKey);

  // For each lesson, map the keys from the NUS API to ours. Most have close
  // mappings, but week text needs to be inferred from the event's dates
  return values(groupedLessons).map((events: TimetableLesson[]) => {
    // eslint-disable-next-line camelcase
    const { room, start_time, end_time, day, modgrp, activity } = events[0];

    if (has(unrecognizedLessonTypes, activity)) {
      logger.warn({ activity }, `Lesson type not recognized by the frontend used`);
    }

    return {
      // mod group contains the activity at the start - we remove that because
      // it is redundant
      ClassNo: trimStart(modgrp, activity),
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

type Input = void;
type Output = { [ModuleCode]: RawLesson[] };

/**
 * Download the timetable for a specific semester. Since the format provided by the
 * school is so inefficient, we make a separate request for each department and
 * reduce its size before moving onto the next one to reduce memory usage.
 *
 * Output:
 *  - <semester>/<module code>/timetable.json
 */
export default class GetSemesterTimetable extends BaseTask implements Task<Input, Output> {
  semester: Semester;
  academicYear: string;

  get name() {
    return `Get timetable for semester ${this.semester}`;
  }

  constructor(semester: Semester, academicYear: string = config.academicYear) {
    super();

    this.semester = semester;
    this.academicYear = academicYear;

    this.logger = this.rootLogger.child({
      semester,
      task: GetSemesterTimetable.name,
      year: academicYear,
    });
  }

  async run() {
    const term = getTermCode(this.semester, this.academicYear);

    // 1. Get all lessons in a semester from the API
    const lessons = await retry(() => this.api.getSemesterTimetables(term), 3);

    // 2. Collect all modules found by their module code, and invalid lessons
    //    for logging
    const lessonsByModule = {};
    const invalidLessons = [];

    lessons.forEach((lesson) => {
      // 3. Even if the lesson is invalid, as long as any lesson appears in the
      //    system we know the module is offered this semester, so we insert it
      //    into lessonsByModule before checking lesson validity
      if (!lessonsByModule[lesson.module]) {
        lessonsByModule[lesson.module] = [];
      }

      // 4. Only keep valid lessons
      if (!validateLesson(lesson, this.logger)) {
        invalidLessons.push(lesson);
      } else {
        lessonsByModule[lesson.module].push(lesson);
      }
    });

    // 5. Log all invalid lessons for debugging
    if (invalidLessons.length > 0) {
      this.logger.info(
        { valid: lessons.length - invalidLessons.length, invalid: invalidLessons.length },
        'Removed invalid lessons',
      );
      this.logger.debug({ invalidLessons }, 'Invalid lessons');
    }

    // 6. Turn each module's TimetableLesson[] into RawLesson[]
    const timetables: { [ModuleCode]: RawLesson[] } = mapValues(lessonsByModule, (moduleLessons) =>
      mapTimetableLessons(moduleLessons, this.logger),
    );

    // 7. Save all the timetables to disk
    await Promise.all(
      map(timetables, (timetable, moduleCode) =>
        this.output.timetable(this.semester, moduleCode, timetable),
      ),
    );

    return timetables;
  }
}
