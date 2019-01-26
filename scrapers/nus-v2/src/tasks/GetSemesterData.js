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
 * Download modules info for all faculties in a specific semester
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
    this.logger.info(`Getting semester data for ${this.academicYear} semester ${this.semester}`);

    // Retrieve all module info from this semester
    const getModules = new GetSemesterModules(this.semester, this.academicYear);
    const modules: ModuleInfoMapped[] = await getModules.run(input);

    // Fan out and get all timetables
    const requests = modules.map(async (moduleInfo) => {
      const moduleCode = moduleInfo.Subject + moduleInfo.CatalogNumber;

      const getTimetable = new GetModuleTimetable(moduleCode, this.semester, this.academicYear);

      let timetable;
      try {
        timetable = await getTimetable.run();
      } catch (e) {
        // Skip the module if we cannot get its timetable
        this.logger.error(e, `Error getting timetable for ${moduleCode}`);
        return null;
      }

      return { moduleCode, moduleInfo, timetable };
    });

    return (await Promise.all(requests)).filter(Boolean);
  }

  async getExams() {
    const getExams = new GetSemesterExams(this.semester, this.academicYear);

    try {
      return getExams.run();
    } catch (e) {
      this.logger.critical(e, 'Error loading exams');
      throw e;
    }
  }

  async run(input: Input) {
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
