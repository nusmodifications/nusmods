// @flow

import type { ModuleExam } from '../types/api';
import type { Semester } from '../types/modules';
import config from '../config';
import { getTermCode } from '../utils/api';
import BaseTask from './BaseTask';
import type { Task } from '../types/tasks';

type Output = ModuleExam[];

/**
 * Download modules info for all faculties in a specific semester
 */
export default class GetSemesterExams extends BaseTask implements Task<void, Output> {
  semester: Semester;
  academicYear: string;

  get name() {
    return `Get exams for semester ${this.semester}`;
  }

  constructor(semester: Semester, academicYear: string = config.academicYear) {
    super();

    this.semester = semester;
    this.academicYear = academicYear;
  }

  async run() {
    const term = getTermCode(this.semester, this.academicYear);

    // Make API requests to get the exam info
    const exams = await this.api.getTermExams(term);

    // Cache module info to disk
    await this.fs.saveRawExams(this.semester, exams);

    return exams;
  }
}
