// @flow

import type { ModuleCode, RawLesson, Semester } from '../types/modules';
import config from '../config';
import { getTermCode } from '../utils/api';
import BaseTask from './BaseTask';
import { mapTimetableLessons } from '../components/mapper';
import type { Task } from '../types/tasks';

type Output = RawLesson[];

/**
 * Download the timetable for a specific module
 */
export default class GetModuleTimetable extends BaseTask implements Task<void, Output> {
  semester: Semester;
  academicYear: string;
  moduleCode: ModuleCode;

  input: void;

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
    const timetable = mapTimetableLessons(lessons);

    // Cache timetable to disk
    await this.fs.output.timetable(this.semester, this.moduleCode).write(timetable);

    // Return output for next task in pipeline
    return timetable;
  }
}
