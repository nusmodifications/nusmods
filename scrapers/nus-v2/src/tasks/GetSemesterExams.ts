import { strict as assert } from 'assert';
import { parse } from 'date-fns';
import { keyBy, mapValues, partition } from 'lodash';

import { ModuleExam } from '../types/api';
import { ExamInfo, ExamInfoMap } from '../types/mapper';
import { Semester } from '../types/modules';
import { Task } from '../types/tasks';
import { Cache } from '../types/persist';

import BaseTask from './BaseTask';
import config from '../config';
import { cacheDownload, getTermCode } from '../utils/api';
import { validateExam, validateSemester } from '../services/validation';
import { NotFoundError } from '../utils/errors';

/* eslint-disable camelcase */

/**
 * Extract the part of the raw ModuleExam that is used in SemesterData
 */
export function mapExamInfo(moduleExam: ModuleExam): ExamInfo {
  const { exam_date, start_time, duration } = moduleExam;
  const date = parse(`${exam_date} ${start_time} +08:00`, 'yyyy-MM-dd HH:mm XXX', new Date());

  return {
    examDate: date.toISOString(),
    examDuration: duration,
  };
  /* eslint-enable */
}

type Output = ExamInfoMap;

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
    assert(validateSemester(semester), `${semester} is not a valid semester`);

    super(academicYear);

    this.semester = semester;
    this.academicYear = academicYear;

    this.logger = this.rootLogger.child({
      semester,
      task: GetSemesterExams.name,
      year: academicYear,
    });

    // Set expiry to 5 days in case the API goes down, we don't wipe all
    // existing exam data (ノ°Д°）ノ︵ ┻━┻
    this.examCache = this.getCache<ModuleExam[]>(`semester-${semester}-exams`, 5 * 24 * 60);
  }

  async run(): Promise<Output> {
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
      // API may not return exam info for future semesters, we need to distinguish this from API
      // errors
      if (e instanceof NotFoundError) {
        this.logger.error(
          e,
          `Cannot get exam data for ${this.academicYear} semester ${this.semester}`,
        );
        return {};
      }

      throw e;
    }

    // Try to filter out invalid exams
    const [validExams, invalidExams] = partition(rawExams, (exam) =>
      validateExam(exam, this.logger),
    );
    if (invalidExams.length > 0) {
      this.logger.warn({ invalidExams }, `Removed invalid exams`);
    }

    const exams = mapValues(
      keyBy(validExams, (exam) => exam.module),
      mapExamInfo,
    );
    this.logger.info(`Downloaded ${rawExams.length} exams`);

    return exams;
  }
}
