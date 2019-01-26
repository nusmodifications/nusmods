// @flow

import { flatten } from 'lodash';

import type { AcademicGroup, AcademicOrg, ModuleInfo } from '../types/api';
import type { ModuleInfoMapped } from '../types/mapper';
import type { Semester } from '../types/modules';
import config from '../config';
import { getTermCode } from '../utils/api';
import BaseTask from './BaseTask';
import {
  getDepartmentCodeMap,
  getFacultyCodeMap,
  mapFacultyDepartmentCodes,
} from '../components/mapper';
import type { Task } from '../types/tasks';

type Input = {|
  +departments: AcademicOrg[],
  +faculties: AcademicGroup[],
|};

type Output = ModuleInfoMapped[];

/**
 * Download modules info for all faculties in a specific semester
 */
export default class GetFacultyModules extends BaseTask implements Task<Input, Output> {
  semester: Semester;
  academicYear: string;

  get name() {
    return `Get modules info for semester ${this.semester}`;
  }

  constructor(semester: Semester, academicYear: string = config.academicYear) {
    super();

    this.semester = semester;
    this.academicYear = academicYear;
  }

  async run(input: Input) {
    const { faculties, departments } = input;
    const term = getTermCode(this.semester, this.academicYear);

    const facultyMap = getFacultyCodeMap(faculties);
    const departmentMap = getDepartmentCodeMap(departments);

    // Make API requests to get the modules we need
    // We make a new request for each faculty because the API will timeout if
    // we try to request for all of them in one shot
    const requests = faculties.map((faculty) =>
      this.api.getFacultyModules(term, faculty.AcademicGroup),
    );
    const rawModules: ModuleInfo[] = flatten(await Promise.all(requests));

    // The ModuleInfo object from the API comes with a useless AcademicOrg and AcademicDept
    // object, which we replace with a string to save on space and to make it
    // more readable
    const modules: ModuleInfoMapped[] = rawModules.map((moduleInfo) =>
      mapFacultyDepartmentCodes(moduleInfo, facultyMap, departmentMap),
    );

    // Cache module info to disk
    await this.fs.saveRawModules(this.semester, modules);

    return modules;
  }
}
