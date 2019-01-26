// @flow

import { mapValues, keyBy } from 'lodash';
import type { ModuleExam } from '../types/api';
import type { ExamInfoMap } from '../types/mapper';
import type { Semester } from '../types/modules';
import config from '../config';
import { getTermCode } from '../utils/api';
import BaseTask from './BaseTask';
import type { Task } from '../types/tasks';
import { mapExamInfo } from '../components/mapper';

type Output = ExamInfoMap;

/**
 * Download modules info for all faculties in a specific semester
 */
export default class GetSemesterExams extends BaseTask implements Task<void, Output> {
  semester: Semester;
  academicYear: string;

  logger = this.rootLogger.child({
    task: GetSemesterExams.name,
    year: this.academicYear,
    semester: this.semester,
  });

  get name() {
    return `Get exams for semester ${this.semester}`;
  }

  constructor(semester: Semester, academicYear: string = config.academicYear) {
    super();

    this.semester = semester;
    this.academicYear = academicYear;
  }

  async run() {
    this.logger.info(
      `Getting exams for all modules in ${this.academicYear} semester ${this.semester}`,
    );
    const term = getTermCode(this.semester, this.academicYear);

    // Make API requests to get the exam info
    const rawExams: ModuleExam[] = await this.api.getTermExams(term);
    const exams = mapValues(keyBy(rawExams, (exam) => exam.module), mapExamInfo);

    // Cache module info to disk
    await this.fs.saveRawExams(this.semester, rawExams);

    return exams;
  }
}
