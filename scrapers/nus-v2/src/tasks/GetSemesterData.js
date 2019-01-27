// @flow

import type { AcademicGroup, AcademicOrg } from '../types/api';
import type { ModuleInfoMapped, SemesterModuleData } from '../types/mapper';
import type { Semester } from '../types/modules';
import config from '../config';
import BaseTask from './BaseTask';

import type { Task } from '../types/tasks';
import GetSemesterExams from './GetSemesterExams';
import GetModuleTimetable from './GetModuleTimetable';
import GetSemesterModules from './GetSemesterModules';
import { mapModuleInfo } from '../components/mapper';

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

  get name() {
    return `Get data for semester ${this.semester}`;
  }

  constructor(semester: Semester, academicYear: string = config.academicYear) {
    super();

    this.semester = semester;
    this.academicYear = academicYear;
  }

  async getModuleInfo(input: Input) {
    // Retrieve all module info from this semester
    const getModules = new GetSemesterModules(this.semester, this.academicYear);
    const modules: ModuleInfoMapped[] = await getModules.run(input);

    // Fan out and get all timetables
    const requests = modules.map(async (moduleInfo) => {
      const moduleCode = moduleInfo.Subject + moduleInfo.CatalogNumber;
      const getTimetable = new GetModuleTimetable(moduleCode, this.semester, this.academicYear);

      const timetable = await getTimetable.run().catch((e) => {
        // Skip the module if we cannot get its timetable. Return null so we can filter out
        // these later
        this.logger.warn(e, `Error getting timetable for ${moduleCode}. Skipping.`);
        return [];
      });

      return {
        moduleCode,
        moduleInfo,
        timetable,
      };
    });

    const completedRequests = (await Promise.all(requests)).filter(Boolean);

    // Log some statistics
    const completedPercent = (completedRequests.length / requests.length) * 100;
    this.logger.info(
      '%i/%i (%s%%) timetables downloaded successfully',
      requests.length,
      completedRequests.length,
      completedPercent.toFixed(1),
    );

    return completedRequests;
  }

  async getExams() {
    const getExams = new GetSemesterExams(this.semester, this.academicYear);
    return getExams.run();
  }

  async run(input: Input) {
    this.logger.info(`Getting semester data for ${this.academicYear} semester ${this.semester}`);

    const [exams, modules] = await Promise.all([this.getExams(), this.getModuleInfo(input)]);

    // Merge exam and timetable data to form semester data
    const semesterModuleData = modules.map<SemesterModuleData>(
      ({ moduleCode, moduleInfo, timetable }) => {
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
      },
    );

    // Save the merged semester data to disk
    await Promise.all(
      semesterModuleData.map(({ ModuleCode, SemesterData }) =>
        this.fs.output.semesterData(this.semester, ModuleCode).write(SemesterData),
      ),
    );

    await this.fs.raw.semester(this.semester).moduleData.write(semesterModuleData);

    return semesterModuleData;
  }
}
