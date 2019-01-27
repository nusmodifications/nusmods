// @flow

import type { AcademicGroup, AcademicOrg } from '../types/api';
import type { SemesterModuleData } from '../types/mapper';
import type { ModuleCode, Semester } from '../types/modules';
import config from '../config';
import BaseTask from './BaseTask';

import type { Task } from '../types/tasks';
import GetSemesterExams from './GetSemesterExams';
import GetModuleTimetable from './GetModuleTimetable';
import GetSemesterModules from './GetSemesterModules';
import { mapModuleInfo } from '../services/mapper';

type Input = {|
  +departments: AcademicOrg[],
  +faculties: AcademicGroup[],
|};

type Output = SemesterModuleData[];

/**
 * Download modules info for all faculties in a specific semester. This task
 * uses the subtasks
 *
 * - GetSemesterExams
 * - GetSemesterModules
 * - GetModuleTimetable
 */
export default class GetSemesterData extends BaseTask implements Task<Input, Output> {
  semester: Semester;
  academicYear: string;

  logger = this.rootLogger.child({
    task: GetSemesterData.name,
    year: this.academicYear,
    semester: this.semester,
  });

  // Number of errors encountered while downloading timetables
  timetableErrors = 0;

  get name() {
    return `Get data for semester ${this.semester}`;
  }

  constructor(semester: Semester, academicYear: string = config.academicYear) {
    super();

    this.semester = semester;
    this.academicYear = academicYear;
  }

  async getExams() {
    // Retrieve all exams for this semester
    const getExams = new GetSemesterExams(this.semester, this.academicYear);
    return getExams.run();
  }

  async getModules(input: Input) {
    // Retrieve all module info from this semester
    const getModules = new GetSemesterModules(this.semester, this.academicYear);
    return getModules.run(input);
  }

  async getTimetable(moduleCode: ModuleCode) {
    const getTimetable = new GetModuleTimetable(moduleCode, this.semester, this.academicYear);

    try {
      return await getTimetable.run();
    } catch (e) {
      // Return [] if we can't get this module's timetable
      this.logger.warn(e, `Error getting timetable for ${moduleCode}. Skipping.`);
      this.timetableErrors += 1;
      return [];
    }
  }

  async run(input: Input) {
    this.logger.info(`Getting semester data for ${this.academicYear} semester ${this.semester}`);

    // Get exams and module info in parallel
    const [exams, modules] = await Promise.all([this.getExams(), this.getModules(input)]);

    // Fan out to get module timetable
    const timetableRequests = modules.map(async (moduleInfo) => {
      const moduleCode = moduleInfo.Subject + moduleInfo.CatalogNumber;
      const timetable = await this.getTimetable(moduleCode);

      // Combine timetable and exam data into SemesterData
      const examInfo = exams[moduleCode] || {};
      const SemesterData = {
        Semester: this.semester,
        Timetable: timetable,
        ...examInfo,
      };

      // Map module info to the shape expected by our frontend
      const Module = mapModuleInfo(moduleInfo);

      return {
        ModuleCode: moduleCode,
        Module,
        SemesterData,
      };
    });

    const semesterModuleData = await Promise.all(timetableRequests);

    // Log some statistics
    const completed = modules.length - this.timetableErrors;
    const completedPercent = (completed / modules.length) * 100;
    this.logger.info(
      '%i/%i (%s%%) timetables downloaded successfully',
      completed,
      modules.length,
      completedPercent.toFixed(1),
    );

    // Save the merged semester data to disk
    await Promise.all(
      semesterModuleData.map((semesterData) =>
        this.fs.output
          .semesterData(this.semester, semesterData.ModuleCode)
          .write(semesterData.SemesterData),
      ),
    );

    await this.fs.raw.semester(this.semester).moduleData.write(semesterModuleData);

    return semesterModuleData;
  }
}
