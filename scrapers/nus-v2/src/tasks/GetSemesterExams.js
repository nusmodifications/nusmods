// @flow
import moment from 'moment';
import { keyBy, mapValues, partition } from 'lodash';
import { strict as assert } from 'assert';

import type { ModuleExam } from '../types/api';
import type { ExamInfo, ExamInfoMap } from '../types/mapper';
import type { Semester } from '../types/modules';
import type { Task } from '../types/tasks';
import type { Cache } from '../services/output';

import BaseTask from './BaseTask';
import config from '../config';
import { cacheDownload, getTermCode } from '../utils/api';
import { TaskError } from '../utils/errors';
import { validateExam, validateSemester } from '../services/validation';
import { getCache } from '../services/output';

type Output = ExamInfoMap;

export const examCache = (semester: Semester) => {
  assert(validateSemester(semester), `${semester} is not a valid semester`);
  return getCache<ModuleExam[]>(`semester-${semester}-exams`);
};

const UTC_OFFSET = 8 * 60;

/**
 * Extract the part of the raw ModuleExam that is used in SemesterData
 */
export function mapExamInfo(moduleExam: ModuleExam): ExamInfo {
  /* eslint-disable camelcase */
  const { exam_date, start_time, duration } = moduleExam;
  const date = moment(`${exam_date} ${start_time}+08:00`).utcOffset(UTC_OFFSET);

  return {
    ExamDate: date.toISOString(true),
    ExamDuration: parseInt(duration, 10),
  };
  /* eslint-enable */
}

/**
 * Download modules info for all faculties in a specific semester
 */
export default class GetSemesterExams extends BaseTask implements Task<void, Output> {
  semester: Semester;
  academicYear: string;

  examCache: Cache<ModuleExam[]>;

  get name() {
    return `Get exams for semester ${this.semester}`;
  }

  constructor(semester: Semester, academicYear: string = config.academicYear) {
    super();

    this.semester = semester;
    this.academicYear = academicYear;

    this.logger = this.rootLogger.child({
      semester,
      task: GetSemesterExams.name,
      year: academicYear,
    });

    this.examCache = examCache(semester);
  }

  async run() {
    this.logger.info(
      `Getting exams for all modules in ${this.academicYear} semester ${this.semester}`,
    );
    const term = getTermCode(this.semester, this.academicYear);

    // Make API requests to get the exam info
    let rawExams: ModuleExam[];
    try {
      rawExams = await cacheDownload(
        'exams',
        () => this.api.getTermExams(term),
        this.examCache,
        this.logger,
      );
    } catch (e) {
      throw new TaskError('Cannot get exam data', this, e);
    }

    // Try to filter out invalid exams
    const [validExams, invalidExams] = partition(rawExams, (exam) =>
      validateExam(exam, this.logger),
    );
    if (invalidExams.length > 0) {
      this.logger.warn({ invalidExams }, `Removed invalid exams`);
    }

    const exams = mapValues(keyBy(validExams, (exam) => exam.module), mapExamInfo);
    this.logger.info(`Downloaded ${rawExams.length} exams`);

    return exams;
  }
}
