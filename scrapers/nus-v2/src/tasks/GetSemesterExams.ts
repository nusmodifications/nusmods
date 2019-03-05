import { parse } from 'date-fns';
import { keyBy, mapValues, partition } from 'lodash';
import { strict as assert } from 'assert';

import { ModuleExam } from '../types/api';
import { ExamInfo, ExamInfoMap } from '../types/mapper';
import { Semester } from '../types/modules';
import { Task } from '../types/tasks';
import { Cache } from '../services/io';

import BaseTask from './BaseTask';
import config from '../config';
import { cacheDownload, getTermCode } from '../utils/api';
import { TaskError } from '../utils/errors';
import { validateExam, validateSemester } from '../services/validation';

/* eslint-disable @typescript-eslint/camelcase */

/**
 * Extract the part of the raw ModuleExam that is used in SemesterData
 */
export function mapExamInfo(moduleExam: ModuleExam): ExamInfo {
  const { exam_date, start_time, duration } = moduleExam;
  const date = parse(`${exam_date} ${start_time} +08:00`, 'yyyy-MM-dd HH:mm XXX', new Date());

  return {
    ExamDate: date.toISOString(),
    ExamDuration: duration,
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

    this.examCache = this.getCache<ModuleExam[]>(`semester-${semester}-exams`);
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
