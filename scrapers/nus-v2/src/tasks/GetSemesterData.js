// @flow

import { fromPairs } from 'lodash';
import { strict as assert } from 'assert';

import type { AcademicGroup, AcademicOrg, ModuleInfo } from '../types/api';
import type { DepartmentCodeMap, SemesterModule, SemesterModuleData } from '../types/mapper';
import type { Semester, Workload } from '../types/modules';
import type { Task } from '../types/tasks';

import config from '../config';
import BaseTask from './BaseTask';
import GetSemesterExams from './GetSemesterExams';
import GetModuleTimetable from './GetModuleTimetable';
import GetSemesterModules from './GetSemesterModules';
import { type Cache, getCache } from '../services/output';
import { fromTermCode } from '../utils/api';
import { validateSemester } from '../services/validation';
import { cleanObject, titleize } from '../services/data';
import { NotFoundError } from '../utils/errors';

type Input = {|
  +departments: AcademicOrg[],
  +faculties: AcademicGroup[],
|};

type Output = SemesterModuleData[];

export const semesterModuleCache = (semester: Semester) => {
  assert(validateSemester(semester), `${semester} is not a valid semester`);
  return getCache<Output>(`semester-${semester}-module-data`);
};

/**
 * Create a mapping of department code to department name from a list of faculties
 */
export const getDepartmentCodeMap = (departments: AcademicOrg[]): DepartmentCodeMap =>
  fromPairs(
    departments.map((department) => [department.AcademicOrganisation, department.Description]),
  );

/**
 * Clean module info
 * - Remove empty fields and fields with text like 'nil'
 * - Properly capitalize ALL CAPS title
 */
const cleanKeys = ['Workload', 'Prerequisite', 'Corequisite', 'Preclusion'];
export function cleanModuleInfo(module: SemesterModule) {
  if (module.ModuleTitle === module.ModuleTitle.toUpperCase()) {
    // eslint-disable-next-line no-param-reassign
    module.ModuleTitle = titleize(module.ModuleTitle);
  }

  return cleanObject(module, cleanKeys);
}

/**
 * Parse the workload string into a mapping of individual components to their hours.
 * If the string is unparsable, it is returned without any modification.
 */
export function parseWorkload(workloadString: string): Workload {
  const cleanedWorkloadString = workloadString
    .replace(/\(.*?\)/g, '') // Remove stuff in parenthesis
    .replace(/NA/gi, '0') // Replace 'NA' with 0
    .replace(/\s+/g, ''); // Remove whitespace

  if (!/^((^|-)([\d.]+)){5}$/.test(cleanedWorkloadString)) return workloadString;
  // Workload string is formatted as A-B-C-D-E where
  // A: no. of lecture hours per week
  // B: no. of tutorial hours per week
  // C: no. of laboratory hours per week
  // D: no. of hours for projects, assignments, fieldwork etc per week
  // E: no. of hours for preparatory work by a student per week
  // Taken from CORS:
  // https://myaces.nus.edu.sg/cors/jsp/report/ModuleDetailedInfo.jsp?acad_y=2017/2018&sem_c=1&mod_c=CS2105
  return cleanedWorkloadString.split('-').map((text) => parseFloat(text));
}

/**
 * Map ModuleInfo from the API into something closer to our own representation
 */
const mapModuleInfo = (moduleInfo: ModuleInfo, departments: DepartmentCodeMap): SemesterModule => {
  const {
    Term,
    AcademicOrganisation,
    CourseTitle,
    WorkLoadHours,
    Preclusion,
    PreRequisite,
    CoRequisite,
    ModularCredit,
    Description,
    Subject,
    CatalogNumber,
  } = moduleInfo;

  const [AcadYear] = fromTermCode(Term);

  // We map department from our department list because
  // AcademicOrganisation.Description is empty for some reason
  return {
    AcadYear,
    Preclusion,
    ModuleDescription: Description,
    ModuleTitle: CourseTitle,
    Department: departments[AcademicOrganisation.Code],
    Workload: parseWorkload(WorkLoadHours),
    Prerequisite: PreRequisite,
    Corequisite: CoRequisite,
    ModuleCredit: ModularCredit,
    ModuleCode: Subject + CatalogNumber,
  };
};

/**
 * Download, clean and combine module info, timetable, and exam info. This task
 * uses the subtasks
 *
 * - GetSemesterExams
 * - GetSemesterModules
 * - GetModuleTimetable
 *
 * Output:
 * - <semester>/<module code>/semesterData.json
 */
export default class GetSemesterData extends BaseTask implements Task<Input, Output> {
  semester: Semester;
  academicYear: string;

  outputCache: Cache<Output>;

  get name() {
    return `Get data for semester ${this.semester}`;
  }

  constructor(semester: Semester, academicYear: string = config.academicYear) {
    super();

    this.semester = semester;
    this.academicYear = academicYear;
    this.outputCache = semesterModuleCache(semester);
    this.logger = this.rootLogger.child({
      semester,
      year: academicYear,
      task: GetSemesterData.name,
    });
  }

  async run(input: Input) {
    const { semester, academicYear } = this;

    this.logger.info(`Getting semester data for ${academicYear} semester ${semester}`);

    // Get exams and module info in parallel
    const [exams, modules] = await Promise.all([
      new GetSemesterExams(semester, academicYear).run(),
      new GetSemesterModules(semester, academicYear).run(input),
    ]);

    // Map department codes to department name
    const departmentMap = getDepartmentCodeMap(input.departments);

    // Fan out to individual modules to get timetable
    const timetableRequests = modules.map(async (moduleInfo) => {
      const moduleCode = moduleInfo.Subject + moduleInfo.CatalogNumber;

      let timetable;
      try {
        timetable = await new GetModuleTimetable(moduleCode, semester, academicYear).run();
      } catch (err) {
        // If the API does not have a timetable record (even one with invalid lessons)
        // then the class isn't actually offered, so we return null and have it
        // filtered out
        if (!(err instanceof NotFoundError)) {
          // We expect the API to throw NotFoundErrors. Other kinds of errors are
          // not expected, so we need to log them
          this.logger.warn({ err, moduleCode }, 'Unable to download timetable');
        }

        return null;
      }

      // Combine timetable and exam data into SemesterData
      const examInfo = exams[moduleCode] || {};
      const SemesterData = {
        Semester: semester,
        Timetable: timetable,
        ...examInfo,
      };

      // Map module info to the shape expected by our frontend and clean up the data
      const rawModule = mapModuleInfo(moduleInfo, departmentMap);
      const Module = cleanModuleInfo(rawModule);

      return {
        ModuleCode: moduleCode,
        Module,
        SemesterData,
      };
    });

    const semesterModuleData = (await Promise.all(timetableRequests)).filter(Boolean);

    // Log some statistics
    this.logger.debug('%i/%i modules have timetables', semesterModuleData.length, modules.length);

    // Save the merged semester data to disk
    await Promise.all(
      semesterModuleData.map((semesterData) =>
        this.output.semesterData(this.semester, semesterData.ModuleCode, semesterData.SemesterData),
      ),
    );

    // Cache semester data to disk
    await this.outputCache.write(semesterModuleData);

    return semesterModuleData;
  }
}
