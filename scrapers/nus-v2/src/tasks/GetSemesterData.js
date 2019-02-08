// @flow

import { each, fromPairs, keyBy } from 'lodash';
import { strict as assert } from 'assert';

import type { AcademicGrp, AcademicOrg, ModuleInfo } from '../types/api';
import type {
  DepartmentCodeMap,
  FacultyCodeMap,
  SemesterModule,
  SemesterModuleData,
} from '../types/mapper';
import type { Semester, Workload } from '../types/modules';
import type { Task } from '../types/tasks';
import type { Cache } from '../services/io';

import config from '../config';
import BaseTask from './BaseTask';
import GetSemesterExams from './GetSemesterExams';
import GetSemesterTimetable from './GetSemesterTimetable';
import GetSemesterModules from './GetSemesterModules';
import { fromTermCode } from '../utils/api';
import { validateSemester } from '../services/validation';
import { removeEmptyValues, titleize, trimValues } from '../utils/data';
import { difference } from '../utils/set';

type Input = {|
  +departments: AcademicOrg[],
  +faculties: AcademicGrp[],
|};

type Output = SemesterModuleData[];

/**
 * Create a mapping of department code to department name from a list of faculties
 */
export const getDepartmentCodeMap = (departments: AcademicOrg[]): DepartmentCodeMap =>
  fromPairs(
    departments.map((department) => [department.AcademicOrganisation, department.Description]),
  );

export const getFacultyCodeMap = (departments: AcademicGrp[]): FacultyCodeMap =>
  fromPairs(departments.map((faculty) => [faculty.AcademicGroup, faculty.Description]));

/**
 * Clean module info
 * - Remove empty fields and fields with text like 'nil'
 * - Trim whitespace from module title, description and other text fields
 * - Properly capitalize ALL CAPS title
 */
export function cleanModuleInfo(module: SemesterModule) {
  let cleanedModule = module;

  // Title case module title if it is all uppercase
  if (cleanedModule.ModuleTitle === cleanedModule.ModuleTitle.toUpperCase()) {
    cleanedModule.ModuleTitle = titleize(cleanedModule.ModuleTitle);
  }

  // Remove empty values like 'nil' and empty strings for keys that allow them
  // to be nullable
  cleanedModule = removeEmptyValues(cleanedModule, [
    'Workload',
    'Prerequisite',
    'Corequisite',
    'Preclusion',
  ]);

  // Remove whitespace from some string values
  trimValues(cleanedModule, [
    'ModuleTitle',
    'ModuleDescription',
    'Prerequisite',
    'Corequisite',
    'Preclusion',
  ]);

  return cleanedModule;
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
const mapModuleInfo = (
  moduleInfo: ModuleInfo,
  departmentMap: DepartmentCodeMap,
  facultyMap: FacultyCodeMap,
): SemesterModule => {
  const {
    Term,
    AcademicOrganisation,
    AcademicGroup,
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
    Department: departmentMap[AcademicOrganisation.Code],
    Faculty: facultyMap[AcademicGroup.Code],
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
 * - GetSemesterExams
 * - GetSemesterModules
 * - GetSemesterTimetable
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
    assert(validateSemester(semester), `${semester} is not a valid semester`);

    super(academicYear);

    this.semester = semester;
    this.academicYear = academicYear;
    this.outputCache = this.getCache<Output>(`semester-${semester}-module-data`);
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
    const [timetables, exams, modules] = await Promise.all([
      new GetSemesterTimetable(semester, academicYear).run(),
      new GetSemesterExams(semester, academicYear).run(),
      new GetSemesterModules(semester, academicYear).run(input),
    ]);

    // Map department and faculty codes to their names for use during module
    // data sanitization
    const departmentMap = getDepartmentCodeMap(input.departments);
    const facultyMap = getFacultyCodeMap(input.faculties);

    // Key modules by their module code for easier mapping
    const modulesMap = keyBy(
      modules,
      (moduleInfo) => moduleInfo.Subject + moduleInfo.CatalogNumber,
    );

    // Combine all three source of data into one set of semester module info.
    //
    // We iterate over timetables because only modules with timetable lessons
    // are are actually offered.
    //
    // The data source is less consistent than we'd like, because there are
    // modules with timetable but no module info, and modules with exam info
    // but no timetable/module info. Timetable is the best option here compared
    // to module info (which has a lot of modules but most are not offered)
    // and exam info (missing modules since many modules don't have exams).
    const semesterModuleData = [];
    each(timetables, (timetable, moduleCode) => {
      const moduleInfo = modulesMap[moduleCode];
      if (!moduleInfo) {
        this.logger.debug(
          { moduleCode, timetable },
          'Found module with timetable but no module info',
        );
        return;
      }

      const examInfo = exams[moduleCode] || {};
      const SemesterData = {
        Semester: semester,
        Timetable: timetable,
        ...examInfo,
      };

      // Map module info to the shape expected by our frontend and clean up
      // the data by removing nil fields and fixing data issues
      const rawModule = mapModuleInfo(moduleInfo, departmentMap, facultyMap);
      const Module = cleanModuleInfo(rawModule);

      semesterModuleData.push({
        Module,
        SemesterData,
        ModuleCode: moduleCode,
      });
    });

    // Log modules that have exams but no timetables
    const noInfoModulesWithExams = Array.from(
      difference(new Set(Object.keys(exams)), new Set(Object.keys(timetables))),
    );
    if (noInfoModulesWithExams.length > 0) {
      this.logger.debug(
        { moduleCodes: noInfoModulesWithExams.sort() },
        'Found modules with exam but no info/timetable',
      );
    }

    // Save the merged semester data to disk
    await Promise.all(
      semesterModuleData.map((semesterData) =>
        this.io.semesterData(this.semester, semesterData.ModuleCode, semesterData.SemesterData),
      ),
    );

    // Cache semester data to disk
    await this.outputCache.write(semesterModuleData);

    return semesterModuleData;
  }
}
