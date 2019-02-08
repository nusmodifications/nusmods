// @flow
import { strict as assert } from 'assert';
import { has, map, mapValues, values, trimStart } from 'lodash';
import NUSModerator from 'nusmoderator';

import type { LessonWeek, ModuleCode, RawLesson, Semester } from '../types/modules';
import type { Task } from '../types/tasks';
import type { TimetableLesson } from '../types/api';
import type { Cache } from '../services/io';

import { Logger } from '../services/logger';
import BaseTask from './BaseTask';
import config from '../config';
import { getTermCode, retry } from '../utils/api';
import { validateLesson, validateSemester } from '../services/validation';
import {
  activityLessonType,
  compareWeeks,
  dayTextMap,
  unrecognizedLessonTypes,
} from '../utils/data';

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

export function getWeek(date: string): LessonWeek {
  const weekInfo = NUSModerator.academicCalendar.getAcadWeekInfo(new Date(date));

  // Some classes have lessons on orientation, reading or recess week
  if (weekInfo.num == null) {
    assert(
      weekInfo.type === 'Orientation' || weekInfo.type === 'Reading' || weekInfo.type === 'Recess',
    );
    return weekInfo.type;
  }

  return weekInfo.num;
}

export function mapTimetableLesson(lesson: TimetableLesson, logger: Logger): RawLesson {
  // eslint-disable-next-line camelcase
  const { room, start_time, end_time, day, modgrp, activity, eventdate } = lesson;

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
    // For a single event, Weeks will always be one element
    Weeks: [getWeek(eventdate)],
    // Room can be null
    Venue: room || '',
    DayText: dayTextMap[day],
    LessonType: activityLessonType[activity],
  };
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
  timetableCache: Cache<TimetableLesson[]>;

  get name() {
    return `Get timetable for semester ${this.semester}`;
  }

  constructor(semester: Semester, academicYear: string = config.academicYear) {
    assert(validateSemester(semester), `${semester} is not a valid semester`);

    super(academicYear);

    this.semester = semester;
    this.academicYear = academicYear;

    this.logger = this.rootLogger.child({
      semester,
      task: GetSemesterTimetable.name,
      year: academicYear,
    });

    this.timetableCache = this.getCache(`semester-${semester}-cache`);
  }

  getTimetable = async () => {
    const term = getTermCode(this.semester, this.academicYear);
    const timetables: { [ModuleCode]: { [key: string]: RawLesson } } = {};

    let valid = 0;
    let invalid = 0;

    await this.api.getSemesterTimetables(term, (lesson) => {
      // 1. Even if the lesson is invalid, as long as any lesson appears in the
      //    system we know the module is offered this semester, so we have to
      //    add it to timetables
      if (!validateLesson(lesson, this.logger)) {
        if (lesson.module && !timetables[lesson.module]) {
          timetables[lesson.module] = {};
        }

        invalid += 1;
        return;
      }

      valid += 1;

      // 2. Turn the lesson into a string key so we can index it in the timetable
      const key = getLessonKey(lesson);

      // 3. Make sure timetable is always an object
      if (!timetables[lesson.module]) timetables[lesson.module] = {};
      const timetable = timetables[lesson.module];

      // 4. If the lesson already exists, then we simply need to add one more date
      //    Otherwise, insert the lesson as a new item in the timetable
      const rawLesson = timetable[key];
      if (rawLesson) {
        rawLesson.Weeks.push(getWeek(lesson.eventdate));
      } else {
        timetable[key] = mapTimetableLesson(lesson, this.logger);
      }
    });

    this.logger.info({ valid, invalid }, 'Processed and removed invalid lessons');

    return mapValues(timetables, (timetableObject) => {
      // 5. Remove the lesson key inserted in (2) and sort the week counts
      const timetable = values(timetableObject);
      timetable.forEach((lesson) => lesson.Weeks.sort(compareWeeks));
      return timetable;
    });
  };

  async run() {
    const timetables = await retry(this.getTimetable, 3);

    // Save all the timetables to disk
    await Promise.all(
      map(timetables, (timetable, moduleCode) =>
        this.io.timetable(this.semester, moduleCode, timetable),
      ),
    );

    return timetables;
  }
}
