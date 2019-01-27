// @flow

import { flatten } from 'lodash';

import type { AcademicGroup, AcademicOrg, ModuleInfo } from '../types/api';
import type { ModuleInfoMapped } from '../types/mapper';
import type { Semester } from '../types/modules';
import config from '../config';
import { getTermCode, retry } from '../utils/api';
import BaseTask from './BaseTask';
import {
  getDepartmentCodeMap,
  getFacultyCodeMap,
  mapFacultyDepartmentCodes,
} from '../services/mapper';
import type { Task } from '../types/tasks';
import { TaskError, UnknownApiError } from '../services/errors';

type Input = {|
  +departments: AcademicOrg[],
  +faculties: AcademicGroup[],
|};

type Output = ModuleInfoMapped[];

/**
 * Download modules info for all faculties in a specific semester
 */
export default class GetSemesterModules extends BaseTask implements Task<Input, Output> {
  semester: Semester;
  academicYear: string;

  logger = this.rootLogger.child({
    task: GetSemesterModules.name,
    year: this.academicYear,
    semester: this.semester,
  });

  get name() {
    return `Get modules info for semester ${this.semester}`;
  }

  constructor(semester: Semester, academicYear: string = config.academicYear) {
    super();

    this.semester = semester;
    this.academicYear = academicYear;
  }

  async run(input: Input) {
    this.logger.info(`Getting modules for ${this.academicYear} semester ${this.semester}`);

    const { faculties, departments } = input;
    const term = getTermCode(this.semester, this.academicYear);

    const facultyMap = getFacultyCodeMap(faculties);
    const departmentMap = getDepartmentCodeMap(departments);

    // We make a new request for each faculty because the API will timeout if
    // we try to request for all of them in one shot
    const requests = departments.map(async (department) => {
      try {
        const getModules = () =>
          this.api.getDepartmentModules(term, department.AcademicOrganisation);
        const modules = await retry(getModules, 3, (error) => error instanceof UnknownApiError);

        this.logger.info(`Downloaded ${modules.length} modules from ${department.Description}`);
        return modules;
      } catch (e) {
        this.logger.error(e, `Cannot get modules from ${department.Description}`);
        throw e;
      }
    });

    let rawModules: ModuleInfo[];
    try {
      rawModules = flatten(await Promise.all(requests));
    } catch (e) {
      throw new TaskError('Cannot get module list', this, e);
    }

    this.logger.info(`Downloaded ${rawModules.length} modules in all`);

    // The ModuleInfo object from the API comes with a useless AcademicOrg and
    // AcademicDept object, which we replace with a string to save on space
    // and improve readability
    const modules: ModuleInfoMapped[] = rawModules.map((moduleInfo) =>
      mapFacultyDepartmentCodes(moduleInfo, facultyMap, departmentMap),
    );

    // Cache module info to disk
    await this.fs.raw.semester(this.semester).modules.write(modules);

    return modules;
  }
}
