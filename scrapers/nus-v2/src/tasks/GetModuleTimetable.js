// @flow
import { partition } from 'lodash';

import type { ModuleCode, RawLesson, Semester } from '../types/modules';
import type { Task } from '../types/tasks';

import BaseTask from './BaseTask';
import config from '../config';
import { getTermCode } from '../utils/api';
import { mapTimetableLessons } from '../components/mapper';
import { validateLesson } from '../components/validation';

type Output = RawLesson[];

/**
 * Download the timetable for a specific module
 */
export default class GetModuleTimetable extends BaseTask implements Task<void, Output> {
  semester: Semester;
  academicYear: string;
  moduleCode: ModuleCode;

  logger = this.rootLogger.child({
    task: GetModuleTimetable.name,
    year: this.academicYear,
    semester: this.semester,
    moduleCode: this.moduleCode,
  });

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
  }

  async run() {
    const term = getTermCode(this.semester, this.academicYear);

    const lessons = await this.api.getModuleTimetable(term, this.moduleCode);

    // Validate lessons
    const [validLessons, invalidLessons] = partition(lessons, validateLesson);

    if (invalidLessons.length > 0) {
      this.logger.warn({ invalidLessons }, 'Removed %i invalid lessons', invalidLessons.length);
    }

    const timetable = mapTimetableLessons(validLessons);

    // Cache timetable to disk
    await this.fs.output.timetable(this.semester, this.moduleCode).write(timetable);

    // Return output for next task in pipeline
    return timetable;
  }
}
